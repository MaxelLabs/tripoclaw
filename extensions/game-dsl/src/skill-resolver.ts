import type { SkillId } from "./types.js";

// Keyword map: Chinese + English per genre
const KEYWORD_MAP: Record<SkillId, string[]> = {
  platformer: ["跑酷", "jump", "run", "platform"],
  puzzle: ["解谜", "puzzle", "match"],
  rpg: ["角色", "rpg", "quest", "story"],
  shooter: ["射击", "shoot", "bullet"],
  idle: ["放置", "idle", "clicker"],
};

export function resolveSkill(description: string, explicit?: SkillId): SkillId {
  if (explicit) return explicit;

  const lower = description.toLowerCase();

  for (const [id, terms] of Object.entries(KEYWORD_MAP) as [SkillId, string[]][]) {
    if (terms.some((term) => lower.includes(term))) return id;
  }

  // Safe default when no keyword matches
  return "platformer";
}
