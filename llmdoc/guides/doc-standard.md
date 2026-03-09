---
id: doc-standard
type: guide
---

# The 4 Laws of Docs

## Law 1: Frontmatter Mandatory

Every file must open with YAML frontmatter containing `id` and `type`.

**Bad:**
```markdown
# Auth System
JWT-based authentication...
```

**Good:**
```markdown
---
id: auth-system
type: architecture
---

# Auth System
```

---

## Law 2: Type-First

Define interfaces and types before any logic or prose.

**Bad:**
```markdown
The user object has an id field (string), an email field, and optional roles array.
```

**Good:**
```typescript
interface User {
  id: string;
  email: string;
  roles?: string[];
}
```

---

## Law 3: Pseudocode Logic

Replace narrative descriptions with compact pseudocode.

**Bad:**
```markdown
First, the system checks if the token is present. If it is, it validates the
signature. If validation passes, the user is authorized.
```

**Good:**
```
IF token present
  -> validate_signature(token)
  -> PASS | REJECT
ELSE
  -> 401
```

---

## Law 4: No Meta-talk

Cut preamble. Start with the data.

**Bad:**
```markdown
In this section, we will explore the authentication flow. This document
outlines the key concepts you need to understand before proceeding.
```

**Good:**
```markdown
## Auth Flow
```
