---
id: style-hemingway
type: reference
---

# Hemingway Style — OpenClaw

> Signal 优先。复杂性隐藏在实现内部，接口保持简洁。

## 核心原则

| 原则 | 规则 |
|------|------|
| Iceberg | 公共 API 简单；复杂性封装在内部 |
| No Fluff | 删除不推进逻辑的一切 |
| Type-First | 先定义接口/类型，再写逻辑 |
| Composition | Has-a > Is-a；禁止深层继承 |

## 命名

```
✅ User, Account, Login, Session, Route
❌ AbstractManager, BaseHelper, UserServiceImpl, DataObject
```

规则：名称无法体现单一职责时，说明职责未分清。

## 代码结构

**最大嵌套：2 层。用 Guard Clause 提前返回。**

```typescript
// ❌ 深嵌套
if (user) {
  if (user.active) {
    if (user.role === 'admin') { ... }
  }
}

// ✅ Guard Clause
if (!user?.active || user.role !== 'admin') return;
```

## 注释规则

```typescript
// ❌ What 注释（禁止）
// loop through users to find admin

// ✅ Why 注释（允许）
// baileys requires reconnect on 428; retry avoids session loss
```

## 文档结构

```
1. Frontmatter (id + type)
2. 目标（一句话）
3. 数据模型（类型定义）
4. 逻辑（伪代码）
5. 关键规则
```

禁止出现：
- "In this section..."
- "I will now explain..."
- "Introduction" / "Conclusion" 标题

## 文件大小

| 阈值 | 动作 |
|------|------|
| ~500 LOC | 目标 |
| 700 LOC | 考虑拆分 |
| 700+ LOC | 必须拆分，提取辅助模块 |
