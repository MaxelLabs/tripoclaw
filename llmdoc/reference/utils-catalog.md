---
id: utils-catalog
type: reference
---

# Utils Catalog

> Before writing new logic, check this catalog. If it exists here, use it.

---

## File I/O

| Function | File | Purpose |
|---|---|---|
| `writeJsonAtomic` | `src/infra/json-files.ts` | Atomic JSON write (UUID tmp + rename) |
| `readJsonFile<T>` | `src/infra/json-files.ts` | Async JSON read |
| `writeTextAtomic` | `src/infra/json-files.ts` | Atomic text write |
| `createAsyncLock` | `src/infra/json-files.ts` | Promise-chain mutex |
| `loadJsonFile` | `src/infra/json-file.ts` | Sync JSON read |
| `saveJsonFile` | `src/infra/json-file.ts` | Sync JSON write |

**Rule:** Never hand-roll atomic writes or ad-hoc locks. Use the above.

---

## Infrastructure

| Function/Class | File | Purpose |
|---|---|---|
| `retry` | `src/infra/retry.ts` | Retry mechanism |
| `retryPolicy` | `src/infra/retry-policy.ts` | Retry policy config |
| `backoff` | `src/infra/backoff.ts` | Backoff algorithm |
| `FixedWindowRateLimiter` | `src/infra/fixed-window-rate-limit.ts` | Fixed-window rate limiting |
| `FileLockHandle` | `src/infra/file-lock.ts` | File lock handle |

---

## Terminal Output

| Export | File | Purpose |
|---|---|---|
| `LOBSTER_PALETTE` | `src/terminal/palette.ts` | Color constants — **no hardcoded colors** |
| `renderTable` | `src/terminal/table.ts` | ANSI-safe table rendering |
| `sanitizeForLog` | `src/terminal/safe-text.ts` | Log-safe text |
| `sanitizeTerminalText` | `src/terminal/safe-text.ts` | Terminal-safe text |
| `visibleWidth` | `src/terminal/safe-text.ts` | Visible width (ANSI-stripped) |
| `formatDocsLink` | `src/terminal/links.ts` | Docs link formatter |
| `stylePromptMessage` | `src/terminal/prompt-style.ts` | Prompt message styling |
| `progress` | `src/cli/progress.ts` | CLI progress (`osc-progress` + `@clack/prompts`) — **never hand-roll** |

---

## Routing / Session

| Function/Const | File | Purpose |
|---|---|---|
| `resolveAgentRoute` | `src/routing/resolve-route.ts` | Agent route resolution |
| `buildAgentSessionKey` | `src/routing/session-key.ts` | Session key construction |
| `classifySessionKeyShape` | `src/routing/session-key.ts` | Session key classification |
| `normalizeAccountId` | `src/routing/account-id.ts` | Account ID normalization |
| `DEFAULT_ACCOUNT_ID` | `src/routing/account-id.ts` | Default account ID constant |

---

## Media

| Export | File | Purpose |
|---|---|---|
| MIME detection | `src/media/mime.ts` | MIME type detection |
| Base64 helpers | `src/media/base64.ts` | Base64 encode/decode |
| FFmpeg wrappers | `src/media/ffmpeg-exec.ts` | FFmpeg execution wrappers |

---

## String Utilities

| Export | File | Purpose |
|---|---|---|
| String normalization | `src/shared/string-normalization.ts` | Normalize strings |
| String sample | `src/shared/string-sample.ts` | String sampling |
| Usage format | `src/shared/usage-format.ts` | Format usage output |
| Transcript tools | `src/shared/transcript-tools.ts` | Transcript helpers |
| Queue helpers | `src/shared/queue-helpers.ts` | Queue utilities |
| `runWithConcurrency` | `src/shared/run-with-concurrency.ts` | Concurrency control |

---

## Testing Patterns

```typescript
// Seam injection — preferred
export const __testing = { internalFn };
export const __test__ = { internalFn };

// Per-instance stub — preferred over prototype mutation
const instance = new MyClass();
instance.method = vi.fn();

// Prototype mutation — only with explicit documented justification
MyClass.prototype.method = vi.fn(); // REQUIRES: comment explaining why
```

**Rules:**
- Per-instance stubs over prototype mutation.
- `__testing` / `__test__` exports for internal seams — never expose production logic solely for tests.
