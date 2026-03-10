import type { GameDSLRequest, IGameConfig, SkillTemplate } from "./types.js";

// Injected: caller provides LLM capability to avoid direct import
export type LLMCallFn = (prompt: string, context: unknown) => Promise<string>;

const SCENE_DELTA_PROMPT = `You are a game scene designer. Given a game description and a base Galacean game config,
return ONLY a JSON object with an "entities" array containing new game entities to add.
Each entity must follow: { id: string, name?: string, components: Component[] }
Components must be one of: transform, visual, or script type.
Return ONLY valid JSON. No prose. No markdown fences.`;

function deriveTitle(description: string): string {
  const words = description.trim().split(/\s+/).slice(0, 4);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseDelta(raw: string): { entities: IGameConfig["scene"]["entities"] } {
  const trimmed = raw
    .trim()
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed) as { entities: IGameConfig["scene"]["entities"] };
  } catch {
    // LLM returned unparseable output — proceed with no delta
    return { entities: [] };
  }
}

export async function generateDSL(
  req: GameDSLRequest,
  template: SkillTemplate,
  llmCall: LLMCallFn,
): Promise<IGameConfig> {
  const base = deepClone(template.baseConfig);
  base.meta.title = req.title ?? deriveTitle(req.description);
  base.meta.author = req.author ?? "Anonymous";

  const deltaRaw = await llmCall(SCENE_DELTA_PROMPT, {
    description: req.description,
    base,
  });

  const delta = parseDelta(deltaRaw);

  // Append delta entities; preserve template anchors (player, camera, etc.)
  base.scene.entities = [...base.scene.entities, ...delta.entities];

  return base;
}
