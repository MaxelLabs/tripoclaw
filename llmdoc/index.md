---
id: llmdoc-index
type: index
---

# llmdoc — OpenClaw

> 编写代码前的导航入口。所有约束均有出处；无出处则不执行。

## 快速导航

| 文件 | 用途 |
|------|------|
| `llmdoc/reference/constitution.md` | 技术宪法：禁止与强制模式 |
| `llmdoc/reference/architecture.md` | Monorepo 架构、模块职责 |
| `llmdoc/reference/tech-stack.md` | 运行时、构建工具、核心依赖 |
| `llmdoc/reference/data-models.md` | 核心类型定义、数据存储规则 |
| `llmdoc/reference/api-cli.md` | CLI 命令注册机制、命令清单 |
| `llmdoc/reference/utils-catalog.md` | 可复用工具函数目录（反重复造轮子） |
| `llmdoc/reference/style-hemingway.md` | Hemingway 风格法则（代码 + 文档） |
| `llmdoc/guides/doc-standard.md` | 文档规范（4 条法律） |

## 编写新代码前必读

- [ ] 查 `utils-catalog.md`：目标功能是否已有实现？
- [ ] 查 `constitution.md`：是否触碰禁止模式？
- [ ] 查 `data-models.md`：复用现有类型，不要新建等价类型
- [ ] 查 `api-cli.md`：新增 CLI 命令时遵循两层懒注册模式
