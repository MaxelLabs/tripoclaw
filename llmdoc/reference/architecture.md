---
id: architecture
type: reference
related_ids: [llmdoc-index]
---

# OpenClaw Monorepo Architecture

> AI 消息网关：连接多平台聊天（WhatsApp/Telegram/Slack 等）到本地 AI Agent。

## System Flow

```mermaid
graph TD
  CLI[CLI: src/cli + src/commands] --> GW[Gateway: src/gateway]
  GW --> CH[Channels: src/channels]
  CH --> Adapters[Platform Adapters]
  Adapters --> WA[WhatsApp/Baileys]
  Adapters --> TG[Telegram/grammy]
  Adapters --> SL[Slack/@slack/bolt]
  Adapters --> EXT[Extensions: extensions/*]
  GW --> AG[Agents: src/agents]
  AG --> PR[Providers: src/providers]
  AG --> MEM[Memory: src/memory]
  GW --> RT[Routing: src/routing]
  GW --> SE[Sessions: src/config/sessions]
  CLI --> ACP[ACP: src/acp]
  APPS[Apps: apps/ios/android/macos] --> GW
```

## Module Responsibilities

| 模块 | 路径 | 职责 |
|------|------|------|
| CLI | `src/cli/`, `src/commands/` | 命令注册、用户入口 |
| Gateway | `src/gateway/` | 消息路由总控 |
| Channels | `src/channels/` | 统一 channel 抽象 |
| Agents | `src/agents/` | Agent 运行时、工具策略 |
| Providers | `src/providers/` | LLM 适配层 |
| Memory | `src/memory/` | sqlite-vec 向量存储 |
| Routing | `src/routing/` | Session key、Agent 路由 |
| Config | `src/config/` | 配置读写（Zod schema） |
| Infra | `src/infra/` | 文件 I/O、网络、安全 |
| Terminal | `src/terminal/` | TTY 输出工具 |
| Media | `src/media/` | 图像/音频/PDF 处理 |
| Plugins | `src/plugins/` | 插件加载（jiti） |
| ACP | `src/acp/` | Agent Communication Protocol |
| Hooks | `src/hooks/` | 生命周期钩子 |

## Extension System

- 位置：`extensions/*`（pnpm workspace 包）
- 类型：消息 channel 扩展 / LLM 扩展 / 功能扩展
- SDK：`src/plugin-sdk/`（通过 jiti 运行时加载）
- 依赖规则：运行时依赖放 `dependencies`；`openclaw` 放 `devDependencies` / `peerDependencies`

## Apps

| 应用 | 平台 | 技术栈 |
|------|------|------|
| `apps/ios` | iOS | SwiftUI + Observation framework |
| `apps/android` | Android | Kotlin |
| `apps/macos` | macOS | SwiftUI 菜单栏应用 |

## Boundaries

**INSIDE scope:**
- 消息路由、channel 适配、Agent 运行时、LLM Provider 适配
- 插件扩展系统（extensions/）
- Native 应用（apps/）通过 Gateway 交互

**OUTSIDE scope:**
- LLM 模型本身（通过 Providers 层适配）
- 消息平台基础设施（WhatsApp/Telegram 服务端）
- `node_modules`（禁止直接修改）
