---
id: api-cli
type: reference
related_ids: [tech-stack, architecture]
---

# CLI API Reference

> Commander-based CLI. Two-layer lazy registration. Fast path bypasses Commander for read-only commands.

## Boot Flow

```
runCli(argv)
  → normalizeWindowsArgv()
  → parseCliProfileArgs()        // extract --profile
  → tryRouteCli()                // fast path (skips Commander)
       → findRoutedCommand()     // if hit → route.run() and exit
  → buildProgram()               // build Commander tree
  → registerCoreCliByName()      // lazy-load core commands
  → registerSubCliByName()       // lazy-load sub-CLIs
  → registerPluginCliCommands()  // inject plugins
  → program.parseAsync()
```

Entry: `src/cli/run-main.ts` → `src/cli/program/build-program.ts`
Router: `src/cli/route.ts`

## Lazy Registration Layers

| Layer | File | Registry |
|-------|------|----------|
| Core commands | `src/cli/program/command-registry.ts` | `coreEntries[]` |
| Sub-CLIs | `src/cli/program/register.subclis.ts` | `entries[]` |

Mechanism: placeholder command inserted at build time → first invocation triggers dynamic `import()` of real registrar.

## Core Commands

| Command | Purpose | Registrar |
|---------|---------|-----------|
| `setup` | Init local config | `register.setup.ts` |
| `onboard` | Guided onboarding | `register.onboard.ts` |
| `configure` | Credential/channel wizard | `register.configure.ts` |
| `config` | get / set / unset / validate | `config-cli.ts` |
| `message` | Send / read messages | `register.message.ts` |
| `agent` | Run single agent | `register.agent.ts` |
| `agents` | Manage agents | `register.agent.ts` |
| `gateway` | WebSocket gateway mgmt | `gateway-cli.ts` |
| `status` | Channel health | `register.status-health-sessions.ts` |
| `health` | Gateway health check | `register.status-health-sessions.ts` |
| `sessions` | Session management | `register.status-health-sessions.ts` |
| `memory` | Search / rebuild index | `memory-cli.ts` |
| `channels` | Channel management | `channels-cli.ts` |
| `plugins` | Plugin management | `plugins-cli.ts` |
| `models` | Model discovery / config | `models-cli.ts` |
| `doctor` | Health check + repair | `register.maintenance.ts` |
| `sandbox` | Sandbox container mgmt | `sandbox-cli.ts` |

## Fast Path Commands

Bypass Commander entirely. Read-only only.

```
health
status
sessions
agents list
memory status
config get
config unset
models list
models status
```

## Critical Rules

- Framework: Commander. Never yargs or meow.
- New command checklist:
  1. Add entry to `coreEntries[]` (core) or `entries[]` (sub-CLI).
  2. Create `register*.ts` registrar file.
  3. Frequent read-only commands: add to `routes.ts` fast path.
- Plugins inject via `registerPluginCliCommands()` — never modify core registries.
- Profile flag (`--profile`) extracted before Commander parsing; available to all commands.
