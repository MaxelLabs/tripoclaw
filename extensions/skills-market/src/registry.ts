import { createRequire } from "node:module";
import type { SkillId, SkillTemplate } from "./types.js";

const require = createRequire(import.meta.url);

const SKILL_IDS: SkillId[] = ["platformer", "puzzle", "rpg", "shooter", "idle"];

// Loaded once at module init; templates are static JSON assets
const registry = new Map<SkillId, SkillTemplate>(
  SKILL_IDS.map((id) => {
    const template = require(`../templates/${id}.json`) as SkillTemplate;
    return [id, template];
  }),
);

export function getTemplate(id: SkillId): SkillTemplate {
  const template = registry.get(id);
  if (!template) throw new Error(`Unknown skill: ${id}`);
  return template;
}

export function listTemplates(): Array<{ id: SkillId; name: string; description: string }> {
  return SKILL_IDS.map((id) => {
    const t = registry.get(id)!;
    return { id: t.id, name: t.name, description: t.description };
  });
}
