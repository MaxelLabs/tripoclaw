import { describe, expect, it } from "vitest";
import { getTemplate, listTemplates } from "./registry.js";
import type { SkillId } from "./types.js";

const ALL_IDS: SkillId[] = ["platformer", "puzzle", "rpg", "shooter", "idle"];

describe("skills-market registry", () => {
  it.each(ALL_IDS)("resolves template for skill '%s'", (id) => {
    const template = getTemplate(id);
    expect(template.id).toBe(id);
    expect(template.name).toBeTruthy();
    expect(template.description).toBeTruthy();
    expect(template.baseConfig.meta.engine).toBe("galacean");
    expect(template.baseConfig.scene.entities.length).toBeGreaterThan(0);
  });

  it("throws on unknown skill id", () => {
    expect(() => getTemplate("unknown" as SkillId)).toThrow("Unknown skill: unknown");
  });

  it("listTemplates returns all 5 skills without baseConfig", () => {
    const list = listTemplates();
    expect(list).toHaveLength(5);
    for (const item of list) {
      expect(ALL_IDS).toContain(item.id);
      expect("baseConfig" in item).toBe(false);
    }
  });
});
