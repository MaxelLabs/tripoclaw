import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Type } from "@sinclair/typebox";
import type { AnyAgentTool, OpenClawPluginApi } from "openclaw/plugin-sdk/lobster";
import { generateDSL } from "./dsl-generator.js";
import { assemblePackage } from "./packager.js";
import { resolveSkill } from "./skill-resolver.js";
import type { GameDSLRequest, SkillId } from "./types.js";

// Dynamic load mirrors llm-task pattern: works from src/ and dist/
type RunEmbeddedPiAgentFn = (params: Record<string, unknown>) => Promise<unknown>;

async function loadRunner(): Promise<RunEmbeddedPiAgentFn> {
  try {
    const mod = await import("../../../src/agents/pi-embedded-runner.js");
    // oxlint-disable-next-line typescript/no-explicit-any
    if (typeof (mod as any).runEmbeddedPiAgent === "function") {
      // oxlint-disable-next-line typescript/no-explicit-any
      return (mod as any).runEmbeddedPiAgent as RunEmbeddedPiAgentFn;
    }
  } catch {
    // ignore — try dist
  }
  // String variable prevents TS from resolving the non-existent path at type-check time
  const distPath = "../../../dist/extensionAPI.js";
  // oxlint-disable-next-line typescript/no-explicit-any
  const distMod = (await import(distPath)) as { runEmbeddedPiAgent?: unknown };
  // oxlint-disable-next-line typescript/no-explicit-any
  const fn = (distMod as any).runEmbeddedPiAgent;
  if (typeof fn !== "function") {
    throw new Error("runEmbeddedPiAgent not available");
  }
  return fn as RunEmbeddedPiAgentFn;
}

// oxlint-disable-next-line typescript/no-explicit-any
function collectText(payloads: any[]): string {
  if (!Array.isArray(payloads)) return "";
  return payloads
    .filter((p) => p?.text)
    .map((p) => String(p.text))
    .join("");
}

export function createGenerateTool(api: OpenClawPluginApi): AnyAgentTool {
  return {
    name: "generate_game",
    label: "Generate Game",
    description:
      "Generate a Galacean web game package from a description. Returns a downloadable zip.",
    ownerOnly: true,
    parameters: Type.Object({
      description: Type.String({ description: "Natural language game description." }),
      skill: Type.Optional(
        Type.Unsafe<SkillId>({
          type: "string",
          enum: ["platformer", "puzzle", "rpg", "shooter", "idle"],
          description: "Explicit skill type. Auto-resolved from description if omitted.",
        }),
      ),
      title: Type.Optional(Type.String({ description: "Game title override." })),
      author: Type.Optional(Type.String({ description: "Author name override." })),
    }),
    async execute(_runId: string, params: Record<string, unknown>) {
      const req: GameDSLRequest = {
        description: typeof params.description === "string" ? params.description.trim() : "",
        skill: typeof params.skill === "string" ? (params.skill as SkillId) : undefined,
        title: typeof params.title === "string" ? params.title.trim() : undefined,
        author: typeof params.author === "string" ? params.author.trim() : undefined,
      };

      if (!req.description) throw new Error("description is required");

      const { getTemplate } = await import("../../skills-market/src/registry.js");
      const skillId = resolveSkill(req.description, req.skill);
      const template = getTemplate(skillId);

      const runner = await loadRunner();
      const llmCall = async (prompt: string, context: unknown): Promise<string> => {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "game-dsl-"));
        const sessionFile = path.join(tmpDir, "session.json");
        // oxlint-disable-next-line typescript/no-explicit-any
        const result = await runner({
          sessionId: `game-dsl-${Date.now()}`,
          sessionFile,
          workspaceDir: process.cwd(),
          config: api.config,
          prompt: `${prompt}\n\nCONTEXT:\n${JSON.stringify(context)}`,
          timeoutMs: 30_000,
          disableTools: true,
        });
        // oxlint-disable-next-line typescript/no-explicit-any
        return collectText((result as any).payloads);
      };

      const config = await generateDSL(req, template, llmCall);
      const id = crypto.randomUUID();
      const zipBuf = await assemblePackage(config, template, id);

      const MAX_ZIP_BYTES = 20_971_520;
      if (zipBuf.byteLength > MAX_ZIP_BYTES) {
        throw new Error("Generated zip exceeds 20MB limit");
      }

      const saved = await api.runtime.channel.media.saveMediaBuffer(
        zipBuf,
        "application/zip",
        "games",
        MAX_ZIP_BYTES,
        `game-${id}.zip`,
      );

      const reply = {
        text: `游戏《${config.meta.title}》已生成。`,
        mediaUrl: `http://localhost:18789/media/games/${saved.id}`,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(reply, null, 2) }],
        details: reply,
      };
    },
  };
}
