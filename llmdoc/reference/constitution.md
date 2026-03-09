---
id: constitution
type: reference
---

# OpenClaw Technical Constitution

## Forbidden Patterns

```typescript
// VIOLATION: deep inheritance (>2 levels)
class AbstractManager extends BaseHelper extends ImplCore {}

// VIOLATION: prototype mutation
SomeClass.prototype.method = () => {};

// VIOLATION: any + ts-nocheck
const data: any = {};
// @ts-nocheck

// VIOLATION: mixed static + dynamic import of same module
import { foo } from "x";
const { bar } = await import("x");

// VIOLATION: direct JSON state write
fs.writeFile("state.json", JSON.stringify(data));

// VIOLATION: hardcoded color
console.log("\x1b[32mDone\x1b[0m");

// VIOLATION: hand-rolled spinner
process.stdout.write("Loading...");
```

**Naming bans:** `AbstractManager`, `*Helper`, `*Impl`.

---

## Mandated Patterns

```typescript
// Composition > Inheritance (Has-a > Is-a)
class Channel {
  constructor(private transport: Transport) {}
}

// File I/O: always through src/infra/json-files.ts
import { writeJsonAtomic, readJsonFile } from "src/infra/json-files";

// CLI registration: command-registry.ts or register.subclis.ts
// Never register commands ad-hoc.

// Tool schemas: @sinclair/typebox only
// NEVER: Type.Union / anyOf / oneOf / allOf
import { Type } from "@sinclair/typebox";
const schema = Type.Object({
  action: Type.Unsafe<"start" | "stop">({ type: "string", enum: ["start", "stop"] }),
});

// New channel: must implement ChannelPlugin
// Contract: src/channels/plugins/types.core.ts
class MyChannel implements ChannelPlugin { ... }

// CLI progress: src/cli/progress.ts only
import { osc-progress } from "src/cli/progress";

// Colors: src/terminal/palette.ts only
import { palette } from "src/terminal/palette";
```

---

## File Size Law

| Threshold | Action |
| :--- | :--- |
| ~500 LOC | Target ceiling |
| 700 LOC | Hard split trigger — extract helpers |
