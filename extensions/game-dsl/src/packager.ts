import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import type { IGameConfig, SkillTemplate } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_SCAFFOLD_DIR = path.join(__dirname, "web-scaffold");

function renderGodotDoc(config: IGameConfig): string {
  return [
    `# Godot Import Guide: ${config.meta.title}`,
    "",
    "## Steps",
    "1. Open Godot 4.x",
    "2. Create a new project",
    "3. Copy `game-config.json` to your project root",
    "4. Use the OpenClaw Godot plugin to import the config",
    "",
    "## Entities",
    ...config.scene.entities.map((e) => `- ${e.name ?? e.id} (${e.components.length} components)`),
  ].join("\n");
}

function renderUnityDoc(config: IGameConfig): string {
  return [
    `# Unity Import Guide: ${config.meta.title}`,
    "",
    "## Steps",
    "1. Open Unity 2022 LTS or newer",
    "2. Import the OpenClaw Unity package",
    "3. Drag `game-config.json` into the Assets folder",
    "4. Run the Game Config Importer from the OpenClaw menu",
    "",
    "## Entities",
    ...config.scene.entities.map((e) => `- ${e.name ?? e.id} (${e.components.length} components)`),
  ].join("\n");
}

function addWebScaffold(zip: JSZip, config: IGameConfig): void {
  if (!fs.existsSync(WEB_SCAFFOLD_DIR)) return;

  const configJson = JSON.stringify(config);
  const files = fs.readdirSync(WEB_SCAFFOLD_DIR);

  for (const file of files) {
    const full = path.join(WEB_SCAFFOLD_DIR, file);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;

    let content: string | Buffer;
    if (file === "index.html") {
      // Inject config token synchronously before adding to zip
      content = fs.readFileSync(full, "utf8").replace("__GAME_CONFIG__", configJson);
    } else {
      content = fs.readFileSync(full);
    }
    zip.file(`web/${file}`, content);
  }
}

export async function assemblePackage(
  config: IGameConfig,
  _template: SkillTemplate,
  _id: string,
): Promise<Buffer> {
  const zip = new JSZip();

  zip.file("game-config.json", JSON.stringify(config, null, 2));
  addWebScaffold(zip, config);
  zip.file("docs/godot-import.md", renderGodotDoc(config));
  zip.file("docs/unity-import.md", renderUnityDoc(config));

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
