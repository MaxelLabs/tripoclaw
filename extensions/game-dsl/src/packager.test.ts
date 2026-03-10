import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { assemblePackage } from "./packager.js";
import type { IGameConfig, SkillTemplate } from "./types.js";

const MOCK_CONFIG: IGameConfig = {
  meta: { title: "Test Game", author: "Tester", engine: "galacean" },
  scene: {
    entities: [
      {
        id: "player",
        name: "Player",
        components: [
          {
            type: "transform",
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
          },
        ],
      },
    ],
  },
  ui: { elements: [] },
};

const MOCK_TEMPLATE: SkillTemplate = {
  id: "platformer",
  name: "Platformer",
  description: "test",
  baseConfig: MOCK_CONFIG,
  webTemplate: "./src/web-scaffold",
};

describe("assemblePackage", () => {
  it("zip contains game-config.json", async () => {
    const buf = await assemblePackage(MOCK_CONFIG, MOCK_TEMPLATE, "test-id");
    const zip = await JSZip.loadAsync(buf);
    const configFile = zip.file("game-config.json");
    expect(configFile).not.toBeNull();
    const content = await configFile!.async("string");
    const parsed = JSON.parse(content) as IGameConfig;
    expect(parsed.meta.title).toBe("Test Game");
  });

  it("zip contains web/index.html with injected config", async () => {
    const buf = await assemblePackage(MOCK_CONFIG, MOCK_TEMPLATE, "test-id");
    const zip = await JSZip.loadAsync(buf);
    const indexFile = zip.file("web/index.html");
    expect(indexFile).not.toBeNull();
    const html = await indexFile!.async("string");
    // __GAME_CONFIG__ token must be replaced
    expect(html).not.toContain("__GAME_CONFIG__");
    expect(html).toContain("Test Game");
  });

  it("zip contains docs/godot-import.md", async () => {
    const buf = await assemblePackage(MOCK_CONFIG, MOCK_TEMPLATE, "test-id");
    const zip = await JSZip.loadAsync(buf);
    const godotDoc = zip.file("docs/godot-import.md");
    expect(godotDoc).not.toBeNull();
    const content = await godotDoc!.async("string");
    expect(content).toContain("Godot Import Guide: Test Game");
  });

  it("zip contains docs/unity-import.md", async () => {
    const buf = await assemblePackage(MOCK_CONFIG, MOCK_TEMPLATE, "test-id");
    const zip = await JSZip.loadAsync(buf);
    const unityDoc = zip.file("docs/unity-import.md");
    expect(unityDoc).not.toBeNull();
    const content = await unityDoc!.async("string");
    expect(content).toContain("Unity Import Guide: Test Game");
  });

  it("zip is a valid buffer under 20MB", async () => {
    const buf = await assemblePackage(MOCK_CONFIG, MOCK_TEMPLATE, "test-id");
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.byteLength).toBeGreaterThan(0);
    expect(buf.byteLength).toBeLessThan(20_971_520);
  });
});
