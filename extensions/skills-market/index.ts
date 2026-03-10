import { Type } from "@sinclair/typebox";
import type {
  AnyAgentTool,
  OpenClawPluginApi,
  OpenClawPluginToolFactory,
} from "openclaw/plugin-sdk/lobster";
import { listTemplates } from "./src/registry.js";

function createListSkillTemplatesTool(): AnyAgentTool {
  return {
    name: "list_skill_templates",
    label: "List Game Skill Templates",
    description: "List available game skill templates from the Skills Market registry.",
    parameters: Type.Object({
      filter: Type.Optional(
        Type.String({ description: "Optional substring filter on id, name, or description." }),
      ),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const filter = typeof params.filter === "string" ? params.filter.toLowerCase() : "";
      const all = listTemplates();
      const result = filter
        ? all.filter(
            (t) =>
              t.id.includes(filter) ||
              t.name.toLowerCase().includes(filter) ||
              t.description.toLowerCase().includes(filter),
          )
        : all;

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: result,
      };
    },
  };
}

export default function register(api: OpenClawPluginApi) {
  api.registerTool(((_ctx) => createListSkillTemplatesTool()) as OpenClawPluginToolFactory, {
    optional: true,
  });
}
