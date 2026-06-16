# Copyable Entity IDs in Detail Views

> Status: Implemented (issue page scope)
> Last updated: 2026-06-16

## TL;DR

- **Problem**: UUIDs for issues and comments are stored and transmitted but never rendered in the UI (Application Programming Interface). Developers and power users must inspect network requests or database queries to obtain them for API calls, scripting, or deep linking.
- **Solution**: Surface the raw UUID on the issue detail page: an `ID` property row in the Details sidebar section for the issue itself, and a "Copy ID" dropdown item on each comment and reply.
- **Scope**: Two entities on the issue page — `issue.id` (sidebar Details row) and `entry.id` (comment/reply dropdown menu item).
- **Shared component**: One new `CopyableId` component in `packages/views/common/` handles the issue ID row; comments use the existing dropdown pattern with a `navigator.clipboard.writeText` call directly.
- **No new dependencies**: Reuses `lucide-react` icons, the `Tooltip` component, and the existing `ui` and `issues` i18n namespaces.

---

## 1. Background

### 1.1 Current State

All UUIDs are intentionally hidden from the UI (User Interface). The product resolves them to human-readable names and identifiers at render time:

| Entity | What users see | What's hidden |
|--------|---------------|---------------|
| Issue | `MUL-123` (identifier) | `issue.id` (Universally Unique Identifier — UUID) |
| Comment / reply | Author name + timestamp | `entry.id` (UUID) |

### 1.2 Problem

Developers and integrators working with the Multica API (Application Programming Interface) or CLI (Command-Line Interface) frequently need the UUID to:
- Reference an entity in `multica issue get <uuid>`
- Build automation scripts that call the REST (Representational State Transfer) API directly
- Link directly to a specific comment in an API response

Currently the only way to obtain a UUID is to inspect the network tab in browser DevTools (Developer Tools). This is unnecessary friction for a developer-facing product.

---

## 2. Design

### 2.1 Issue ID — sidebar Details row

The Details collapsible section already shows read-only metadata (Created by, Created, Updated). The `ID` row is appended at the bottom with `interactive={false}` on `PropRow` to signal it is not a picker.

```
Details ▾
  Created by   Alice
  Created      Jun 16
  Updated      Jun 16
  ID           550e8400-e29b-41d4-… [copy-icon]
```

The `CopyableId` component renders:
- UUID text: `font-mono text-[11px] text-muted-foreground`, CSS-truncated with `truncate`
- Inline copy button that flips Copy → Check for 2 s on click
- Tooltip: "Copy ID" / "ID copied" (from `ui` i18n namespace)
- Copies the **full** UUID regardless of visual truncation

**Why no toast for the issue ID?** The icon flip gives immediate confirmation without pulling attention away from the sidebar. Toasts are reserved for actions with side effects or that require acknowledgment.

### 2.2 Comment / reply ID — dropdown menu item

Comments and replies already have a `⋯` dropdown with "Copy" (markdown content), "Edit", and "Delete". A "Copy ID" item is inserted immediately after "Copy content":

```
⋯
  Copy         ← copies markdown body
  Copy ID      ← new: copies entry.id UUID, shows toast
  ─────
  Edit
  Delete
```

A toast (`"Comment ID copied"`) is used here instead of an icon flip because there is no persistent element to flip — the menu closes immediately after the click.

### 2.3 i18n Keys

**`ui` namespace** (all 4 locales — used by `CopyableId`):

| Key | EN | zh-Hans | ko | ja |
|-----|----|---------|----|-----|
| `copy_id_tooltip` | Copy ID | 复制 ID | ID 복사 | ID をコピー |
| `id_copied` | ID copied | ID 已复制 | ID 복사됨 | ID をコピーしました |

**`issues` namespace** (all 4 locales):

| Key | EN | zh-Hans | ko | ja |
|-----|----|---------|----|-----|
| `detail.prop_id` | ID | ID | ID | ID |
| `comment.copy_id_action` | Copy ID | 复制 ID | ID 복사 | ID をコピー |
| `comment.copy_id_toast` | Comment ID copied | 评论 ID 已复制 | 댓글 ID 복사됨 | コメント ID をコピーしました |

---

## 3. Implementation

### 3.1 Files Created

| File | Description |
|------|-------------|
| `packages/views/common/copyable-id.tsx` | `CopyableId` component. Accepts `{ id: string }`. Uses `useT("ui")` for tooltip strings. |

### 3.2 Files Modified

**Components**

| File | Change |
|------|--------|
| `packages/views/issues/components/issue-detail.tsx` | Import `CopyableId`. Add `<PropRow label={t(($) => $.detail.prop_id)} interactive={false}><CopyableId id={issue.id} /></PropRow>` at end of Details section (after "Updated"). |
| `packages/views/issues/components/comment-card.tsx` | Add "Copy ID" `DropdownMenuItem` in `CommentRow` immediately after the existing "Copy" item. Calls `navigator.clipboard.writeText(entry.id)` and shows a toast. |

**i18n types**

| File | Change |
|------|--------|
| `packages/ui/types/i18next.ts` | Added `copy_id_tooltip: string` and `id_copied: string` to the `ui` interface (required to mirror `ui.json`). |

**Locale JSON files (all 4 locales)**

| Namespace | Keys added | Files |
|-----------|-----------|-------|
| `ui` | `copy_id_tooltip`, `id_copied` | `{en,zh-Hans,ko,ja}/ui.json` |
| `issues` | `detail.prop_id`, `comment.copy_id_action`, `comment.copy_id_toast` | `{en,zh-Hans,ko,ja}/issues.json` |

### 3.3 Reused Utilities

- `packages/views/common/prop-row.tsx` — shared `PropRow` component (`interactive={false}` for read-only rows)
- `packages/ui/components/ui/tooltip.tsx` — Base UI (User Interface) tooltip (used inside `CopyableId`)
- `lucide-react` — `Copy` and `Check` icons (already imported in both files)

---

## 4. Verification

```bash
# Confirm all 4 locales satisfy parity (catches any missing translation key)
pnpm test -- --filter @multica/views --testNamePattern="parity"

# Type-check the new component and all call sites
pnpm typecheck

# Manual visual check
pnpm dev:web
```

**Manual checklist:**
- [ ] Issue detail sidebar → open "Details" section → ID row shows truncated UUID
- [ ] Click copy icon on ID row → icon flips to Check for 2 s, clipboard contains the full UUID
- [ ] On any comment or reply → open `⋯` menu → "Copy ID" item is present
- [ ] Click "Copy ID" → toast "Comment ID copied" appears, clipboard contains the comment UUID
- [ ] Replies in threads also show "Copy ID" in their `⋯` menu
- [ ] Dark mode: ID text and copy icon render correctly at muted-foreground color

---

## Token Usage

| Phase | Input tokens (est.) | Output tokens (est.) |
|-------|--------------------|--------------------|
| Exploration (3 agents) | ~18 000 | ~6 000 |
| Plan + doc writing | ~8 000 | ~3 500 |
| **Total** | **~26 000** | **~9 500** |
