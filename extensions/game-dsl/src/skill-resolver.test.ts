import { describe, expect, it } from "vitest";
import { resolveSkill } from "./skill-resolver.js";

describe("resolveSkill", () => {
  it("returns explicit skill when provided", () => {
    expect(resolveSkill("make a shooter", "rpg")).toBe("rpg");
  });

  it("matches Chinese platformer keyword '跑酷'", () => {
    expect(resolveSkill("做一个跑酷游戏")).toBe("platformer");
  });

  it("matches English platformer keyword 'jump'", () => {
    expect(resolveSkill("a game where you jump over obstacles")).toBe("platformer");
  });

  it("matches Chinese puzzle keyword '解谜'", () => {
    expect(resolveSkill("我想要一个解谜游戏")).toBe("puzzle");
  });

  it("matches English puzzle keyword 'match'", () => {
    expect(resolveSkill("match tiles to clear the board")).toBe("puzzle");
  });

  it("matches Chinese rpg keyword '角色'", () => {
    expect(resolveSkill("角色扮演冒险")).toBe("rpg");
  });

  it("matches English rpg keyword 'quest'", () => {
    expect(resolveSkill("go on an epic quest and level up")).toBe("rpg");
  });

  it("matches Chinese shooter keyword '射击'", () => {
    expect(resolveSkill("射击飞机大战")).toBe("shooter");
  });

  it("matches English shooter keyword 'bullet'", () => {
    expect(resolveSkill("dodge bullets and survive")).toBe("shooter");
  });

  it("matches Chinese idle keyword '放置'", () => {
    expect(resolveSkill("放置挂机游戏")).toBe("idle");
  });

  it("matches English idle keyword 'clicker'", () => {
    expect(resolveSkill("a clicker game with upgrades")).toBe("idle");
  });

  it("defaults to platformer when no keyword matches", () => {
    expect(resolveSkill("create a fun game")).toBe("platformer");
  });
});
