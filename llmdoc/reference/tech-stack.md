---
id: tech-stack
type: reference
---

# Tech Stack

> OpenClaw 核心技术栈速查。

## Runtime

| 项目 | 值 |
|------|----|
| Node | >=22.12.0 |
| Bun | 并行支持（脚本执行） |

## Package Management

| 工具 | 版本 | 用途 |
|------|------|------|
| pnpm | 10.23.0 | 主包管理器 |
| bun | latest | patches 同步，脚本执行 |

Workspace 结构：`root` / `ui` / `packages/*` / `extensions/*`

## Build

```
tsdown@0.21.0        # 主构建入口：scripts/tsdown-build.mjs
tsc                  # Plugin SDK DTS 生成
tsx@^4.21.0          # 脚本执行（bun 优先）
```

`tsconfig.json` 关键项：

```json
{
  "target": "es2023",
  "module": "NodeNext",
  "strict": true,
  "noEmit": true
}
```

## Test

```
vitest@^4.0.18       # 框架
V8 coverage          # 阈值 70%（lines/branches/functions/statements）
```

配置矩阵：

| 配置 | 范围 |
|------|------|
| unit | 单元测试 |
| gateway | 网关集成 |
| e2e | 端到端 |
| live | 真实密钥（CLAWDBOT_LIVE_TEST=1） |
| channels | 渠道集成 |
| extensions | 插件集成 |

入口：`pnpm test` → `scripts/test-parallel.mjs`（并行调度）

低内存运行：`OPENCLAW_TEST_PROFILE=low OPENCLAW_TEST_SERIAL_GATEWAY=1 pnpm test`

## Lint / Format

```
Oxlint    # pnpm check
Oxfmt     # pnpm format (--check) / pnpm format:fix (--write)
```

规则：禁止 `@ts-nocheck`，禁止 `no-explicit-any` 关闭，禁止 prototype 变异。

## Core Dependencies

| 依赖 | 版本 | 用途 |
|------|------|------|
| express | ^5.2.1 | HTTP / Webhook 路由 |
| grammy | ^1.41.1 | Telegram Bot |
| @slack/bolt | ^4.6.0 | Slack Bot |
| @whiskeysockets/baileys | 7.0.0-rc.9 | WhatsApp Web 协议 |
| commander | ^14.0.3 | CLI 参数解析 |
| zod | ^4.3.6 | 运行时 schema 验证 |
| @sinclair/typebox | 0.34.48 | 工具 schema 生成 |
| ws | ^8.19.0 | WebSocket |
| undici | ^7.22.0 | 高性能 HTTP |
| yaml | ^2.8.2 | 配置解析 |
| jiti | ^2.6.1 | 插件运行时加载 |
| playwright-core | 1.58.2 | Web 自动化 |
| sharp | ^0.34.5 | 图像处理 |
| pdfjs-dist | ^5.5.207 | PDF 解析 |
| sqlite-vec | 0.1.7-alpha.2 | 向量存储（内存） |
| @mariozechner/pi-agent-core | 0.57.1 | Agent 核心 |
| @agentclientprotocol/sdk | 0.15.0 | ACP |

## Critical Rules

- `pnpm.patchedDependencies` 中的依赖必须使用精确版本（无 `^`/`~`）。
- 禁止修改 `node_modules`（任何来源）。
- 禁止修改 Carbon 依赖。
- patching 依赖（pnpm patches、overrides、vendored changes）需要明确审批。
- 动态 import 与静态 import 同模块：不混用；需懒加载则建 `*.runtime.ts` 边界。
- build 后检查 `[INEFFECTIVE_DYNAMIC_IMPORT]` 警告：`pnpm build`。
