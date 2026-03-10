// Type-First: data shapes before logic

export type SkillId = "platformer" | "puzzle" | "rpg" | "shooter" | "idle";

export type Vector3 = { x: number; y: number; z: number };

export type TransformComponent = {
  type: "transform";
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
};

export type VisualComponent = {
  type: "visual";
  mesh: string;
  material: string;
};

export type ScriptComponent = {
  type: "script";
  script: string;
  props?: Record<string, unknown>;
};

export type Component = TransformComponent | VisualComponent | ScriptComponent;

export type Entity = {
  id: string;
  name?: string;
  components: Component[];
};

export type UIElement = {
  id: string;
  kind: string;
  props: Record<string, unknown>;
};

export type UILayout = { elements: UIElement[] };

export type Scene = {
  entities: Entity[];
  environment?: { skybox?: string; ambientColor?: string };
};

export type IGameConfig = {
  meta: { title: string; author: string; engine: "galacean" | "godot" | "unity" };
  scene: Scene;
  ui: UILayout;
};

export type SkillTemplate = {
  id: SkillId;
  name: string;
  description: string;
  baseConfig: IGameConfig;
  webTemplate: string;
};

export type GameDSLRequest = {
  description: string;
  skill?: SkillId;
  title?: string;
  author?: string;
};

export type GamePackage = {
  id: string;
  title: string;
  dslPath: string;
  zipPath: string;
  mediaUrl: string;
  sizeBytes: number;
};
