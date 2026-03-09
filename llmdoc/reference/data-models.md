---
id: data-models
type: reference
related_ids: [tech-stack, constitution]
---

# Data Models

> Core TypeScript types across config, channels, sessions, and agents. Source of truth: repo `src/`.

---

## Messaging Primitives

```typescript
// src/channels/chat-type.ts
type ChatType = "direct" | "group" | "channel";

// src/auto-reply/types.ts
type TypingPolicy = "auto" | "user_message" | "system_event" | "internal_webchat" | "heartbeat";

type ReplyPayload = {
  text?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  replyToId?: string;
  replyToTag?: boolean;
  replyToCurrent?: boolean;  // [[reply_to_current]] present but not yet mapped
  audioAsVoice?: boolean;
  isError?: boolean;
  isReasoning?: boolean;     // suppress on channels without reasoning lane
  channelData?: Record<string, unknown>;
};

type GetReplyOptions = {
  runId?: string;
  abortSignal?: AbortSignal;
  typingPolicy?: TypingPolicy;
  suppressTyping?: boolean;
  bootstrapContextMode?: "full" | "lightweight";
  skillFilter?: string[];
  timeoutOverrideSeconds?: number;
  // ... callbacks: onPartialReply, onBlockReply, onToolResult, onModelSelected, etc.
};
```

---

## Config Primitives

```typescript
// src/config/types.base.ts
type ReplyMode   = "text" | "command";
type TypingMode  = "never" | "instant" | "thinking" | "message";
type SessionScope = "per-sender" | "global";
type DmScope     = "main" | "per-peer" | "per-channel-peer" | "per-account-channel-peer";
type DmPolicy    = "pairing" | "allowlist" | "open" | "disabled";
type GroupPolicy = "open" | "disabled" | "allowlist";
type ReplyToMode = "off" | "first" | "all";

type SessionResetMode = "daily" | "idle";
type SessionResetConfig = {
  mode?: SessionResetMode;
  atHour?: number;       // 0-23 local hour for daily boundary
  idleMinutes?: number;
};

type SessionConfig = {
  scope?: SessionScope;
  dmScope?: DmScope;
  resetTriggers?: string[];
  idleMinutes?: number;
  reset?: SessionResetConfig;
  resetByType?: { direct?: SessionResetConfig; group?: SessionResetConfig; thread?: SessionResetConfig };
  resetByChannel?: Record<string, SessionResetConfig>;
  typingMode?: TypingMode;
  sendPolicy?: SessionSendPolicyConfig;
  threadBindings?: SessionThreadBindingsConfig;
  maintenance?: SessionMaintenanceConfig;
};

type SessionMaintenanceConfig = {
  mode?: "enforce" | "warn";
  pruneAfter?: string | number;  // e.g. "30d"
  maxEntries?: number;           // default 500
  rotateBytes?: number | string; // default "10mb"
  maxDiskBytes?: number | string;
};

// Root config aggregate (20+ sub-types)
// src/config/types.openclaw.ts:31
// type OpenClawConfig = z.infer<typeof OpenClawSchema>
// Zod schema: src/config/zod-schema.ts:206
```

---

## Channel Plugin Contract

```typescript
// src/channels/plugins/types.core.ts
type ChannelId = ChatChannelId | (string & {});

type ChannelMeta = {
  id: ChannelId;
  label: string;
  selectionLabel: string;
  docsPath: string;
  blurb: string;
  order?: number;
  aliases?: string[];
};

type ChannelCapabilities = {
  chatTypes: Array<ChatType | "thread">;
  polls?: boolean;
  reactions?: boolean;
  edit?: boolean;
  unsend?: boolean;
  reply?: boolean;
  threads?: boolean;
  media?: boolean;
  blockStreaming?: boolean;
};

type ChannelAccountSnapshot = {
  accountId: string;
  name?: string;
  enabled?: boolean;
  configured?: boolean;
  linked?: boolean;
  running?: boolean;
  connected?: boolean;
  lastConnectedAt?: number | null;
  lastError?: string | null;
  // ... timing fields: lastMessageAt, lastStartAt, lastStopAt, lastInboundAt, lastOutboundAt
};

type ChannelSetupInput = {
  name?: string;
  token?: string;
  tokenFile?: string;
  botToken?: string;
  appToken?: string;
  homeserver?: string;   // Matrix
  signalNumber?: string; // Signal
  // ... 20+ optional fields covering all built-in channels
};

type ChannelGroupContext = {
  cfg: OpenClawConfig;
  groupId?: string | null;
  groupChannel?: string | null;
  accountId?: string | null;
  senderId?: string | null;
};
```

## Critical Rules — Channel Plugins

- New channels MUST implement: `ChannelMeta`, `ChannelCapabilities`, `ChannelAccountSnapshot`, `ChannelSetupInput`, `ChannelGroupContext`.
- `ChannelId` extends `ChatChannelId`; new IDs must be registered in `src/channels/registry.ts`.
- Update `.github/labeler.yml` and create matching GitHub labels when adding a channel.

---

## Session Types

```typescript
// src/config/sessions/types.ts
type SessionScope  = "per-sender" | "global";
type SessionOrigin = {
  label?: string; provider?: string; surface?: string;
  chatType?: ChatType; from?: string; to?: string;
  accountId?: string; threadId?: string | number;
};

type SessionAcpIdentityState = "pending" | "resolved";
type SessionAcpIdentity = {
  state: SessionAcpIdentityState;
  acpxRecordId?: string;
  acpxSessionId?: string;
  agentSessionId?: string;
  source: "ensure" | "status" | "event";
  lastUpdatedAt: number;
};

type SessionAcpMeta = {
  backend: string;
  agent: string;
  runtimeSessionName: string;
  identity?: SessionAcpIdentity;
  mode: "persistent" | "oneshot";
  state: "idle" | "running" | "error";
  lastActivityAt: number;
  lastError?: string;
};

// Key entry — persisted to ~/.openclaw/sessions/
type SessionEntry = {
  sessionId: string;
  updatedAt: number;
  chatType?: ChatType;
  model?: string;
  modelProvider?: string;
  queueMode?: "steer" | "followup" | "collect" | "steer-backlog" | "steer+backlog" | "queue" | "interrupt";
  spawnDepth?: number;  // 0=main, 1=sub-agent, 2=sub-sub-agent
  acp?: SessionAcpMeta;
  origin?: SessionOrigin;
  // ... 50+ optional runtime fields (tokens, labels, overrides, etc.)
};

// src/shared/session-types.ts
type GatewayAgentIdentity = { name?: string; theme?: string; emoji?: string; avatar?: string; avatarUrl?: string };
type GatewayAgentRow      = { id: string; name?: string; identity?: GatewayAgentIdentity };

type SessionsListResultBase<TDefaults, TRow> = {
  ts: number; path: string; count: number;
  defaults: TDefaults; sessions: TRow[];
};
```

## Critical Rules — Sessions

- Storage path: `~/.openclaw/sessions/` — **not configurable**.
- All JSON state writes: via `writeJsonAtomic` in `src/infra/json-files.ts` (atomic swap).
- Session store managed by: `src/config/sessions/store.ts`.
- Model fields (`model`, `modelProvider`) must be normalized — never set one without the other; use `setSessionRuntimeModel()`.
- `totalTokens` = prompt/context snapshot only; excludes output tokens.

---

## Agent Types

```typescript
// src/agents/usage.ts
type NormalizedUsage = {
  input?: number; output?: number;
  cacheRead?: number; cacheWrite?: number; total?: number;
};

type AssistantUsageSnapshot = {
  input: number; output: number;
  cacheRead: number; cacheWrite: number; totalTokens: number;
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number; total: number };
};

// src/agents/tool-policy.ts
type ToolPolicyLike = { allow?: string[]; deny?: string[] };

type AllowlistResolution = {
  policy: ToolPolicyLike | undefined;
  unknownAllowlist: string[];
  strippedAllowlist: boolean;
};

type PluginToolGroups = {
  all: string[];
  byPlugin: Map<string, string[]>;
};

// src/agents/identity-file.ts
type AgentIdentityFile = {
  name?: string; emoji?: string; theme?: string;
  creature?: string; vibe?: string; avatar?: string;
};
```

## Critical Rules — Agents

- `UsageLike` normalizes 15+ provider field variants; always use `normalizeUsage()` — never read raw fields directly.
- `ownerOnly` tools: gated by `applyOwnerOnlyToolPolicy()`. Hard-coded fallback names: `whatsapp_login`, `cron`, `gateway`.
- `AgentIdentityFile` parsed from Markdown via `parseIdentityMarkdown()`; placeholder values are silently dropped.

---

## Storage Rules

| Layer | Engine | Write API |
|---|---|---|
| Session state | JSON files | `writeJsonAtomic` (`src/infra/json-files.ts`) |
| Vector / search | SQLite + sqlite-vec | Raw SQL — no ORM |
| Credentials | `~/.openclaw/credentials/` | `openclaw login` |
| Sessions dir | `~/.openclaw/sessions/` | `src/config/sessions/store.ts` |
