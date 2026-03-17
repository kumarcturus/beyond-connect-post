# BCP Implementation Spec — For Claude Code

> This document is the implementation reference for Beyond Connect POST.
> Read this before making any changes to the codebase.

---

## Project Overview

**Beyond Connect POST** is a Next.js 16 + TypeScript web app that lets anyone send messages to graduated school idols (School Idol OGs). Senders need no login or name; OGs log in to read messages addressed to them.

**Live:** https://beyond-connect-post.vercel.app/
**Repo:** https://github.com/kumarcturus/beyond-connect-post
**Deploy:** Vercel

---

## Current State (as of 2026-03-14)

### Working
- Top page (`app/page.tsx`) — landing with navigation
- Send page (`app/send/page.tsx`) — message form with recipient selection, posts to `/api/send`
- Send API (`app/api/send/route.ts`) — saves message to Redis via `ioredis`
- Gate auth (`app/components/Gate.tsx` + `app/actions.ts` + `app/layout.tsx`) — ADMIN_PASSWORD cookie lock
- Login page (`app/login/page.tsx`) — exists but auth is client-side with hardcoded passwords (INSECURE, known issue, fix later)
- CSS (`app/globals.css`) — ~510 lines, ocean/wave pastel theme, complete

### Not Yet Built
- OG registration page (invite code → set password)
- Server-side OG authentication
- OG dashboard (read received messages)
- Admin dashboard (manage invite codes, view registration status, message counts per OG)

### Known Issues
- `login/page.tsx`: passwords hardcoded in client JS (visible in browser). To be replaced with server-side auth.
- `package.json`: `@upstash/redis` and `@vercel/kv` are listed but unused. Actual code uses `ioredis` only.
- Git not initialized in this working copy.

---

## Tech Stack

- **Framework:** Next.js 16, App Router, TypeScript, React 19
- **Styling:** CSS (no Tailwind), existing `globals.css`
- **Database:** Redis via `ioredis` (env: `REDIS_URL` or `KV_URL`)
- **Auth:** Cookie-based sessions, bcrypt password hashing
- **Deploy:** Vercel
- **Font:** Google Fonts (Inter / Zen Maru Gothic)

---

## What To Build (Phase 1)

Build these 4 features. Do NOT modify the existing send flow, top page, or Gate auth unless explicitly asked.

### 1. OG Registration Page

**Route:** `/register`
**File:** `app/register/page.tsx` (new, client component)

**UI Flow:**
1. Input field: invite code
2. Input field: display name (pre-filled if invite has a suggested name)
3. Input field: password
4. Input field: password confirmation
5. Submit button
6. On success → redirect to `/login` with success message

**Validation:**
- Invite code must exist and not be used
- Password minimum 8 characters
- Password and confirmation must match

**Style:** Match existing card UI style in `globals.css`

### 2. Registration API

**Route:** `POST /api/register`
**File:** `app/api/register/route.ts` (new)

**Request:**
```json
{
  "invite_code": "string",
  "name": "string",
  "password": "string"
}
```

**Logic:**
1. Look up invite code in Redis: `GET bcp:invite:{invite_code}`
2. If not found or already used → 400 error
3. Hash password with bcrypt (cost factor 10)
4. Generate idol ID: `idol_` + random alphanumeric (8 chars)
5. Store idol account in Redis:
   - `SET bcp:idol:{idol_id}` → `{ id, name, password_hash, status: "registered", created_at }`
   - `SET bcp:idol_name:{name}` → `{idol_id}` (for login lookup by name)
6. Mark invite as used: update `bcp:invite:{invite_code}` → `{ ..., status: "used", idol_id, used_at }`
7. Return 201 with `{ success: true, name }`

**Dependencies to install:** `bcryptjs` (pure JS, works on Vercel edge/serverless)

### 3. Server-Side OG Login

**Route:** `POST /api/idol-login`
**File:** `app/api/idol-login/route.ts` (new)

**Request:**
```json
{
  "name": "string",
  "password": "string"
}
```

**Logic:**
1. Look up OG by name: `GET bcp:idol_name:{name}` → get idol_id
2. If not found → 401
3. Get OG data: `GET bcp:idol:{idol_id}`
4. Compare password with bcrypt
5. If match → set HttpOnly cookie `idol_session` with value `{idol_id}` (signed or JWT, keep it simple for MVP — plain idol_id in cookie is acceptable for now)
6. Return 200 with `{ success: true, name, idol_id }`

**Modify existing:** `app/login/page.tsx`
- Remove ALL hardcoded password arrays
- Change to call `POST /api/idol-login`
- On success → redirect to `/dashboard`
- On failure → show error message
- Update page title/heading to say "スクールアイドルOGログイン"

### 4. OG Dashboard

**Route:** `/dashboard`
**File:** `app/dashboard/page.tsx` (new, client component)

**Auth check:** Read `idol_session` cookie. If missing → redirect to `/login`.

**Data fetch:** `GET /api/messages?idol_id={idol_id}`

**UI:**
- Header: "{name} さんへのメッセージ" with logout button
- Message list (newest first), each card showing:
  - Message body (first ~50 chars as preview)
  - Date sent
- Tap a card → expand to show full message body (inline expand, not separate page)
- If no messages → "まだメッセージはありません"

**Style:** Match existing card UI. Use the same ocean/pastel theme.

### 5. Messages API (for OG dashboard)

**Route:** `GET /api/messages`
**File:** `app/api/messages/route.ts` (new)

**Query params:** `idol_id` (required)

**Auth:** Verify `idol_session` cookie matches the requested `idol_id`

**Logic:**
1. Get all messages from Redis list: `LRANGE bcp:messages 0 -1`
2. Filter where `receiver_id` matches `idol_id`
3. Sort by `created_at` descending
4. Return JSON array

**Note:** The existing `/api/send` stores messages with `LPUSH` to key `beyond_connect_messages`. Check the actual key name and data shape in the existing `app/api/send/route.ts` and align with it. You may need to update the send API to include `receiver_id` (currently it may use `receiver_nickname`).

### 6. Admin Dashboard

**Route:** `/admin`
**File:** `app/admin/page.tsx` (new, client component)

**Auth:** Require `ADMIN_PASSWORD` (reuse existing Gate pattern, or check a separate admin cookie)

**UI:**
- Table of OGs: name, status (invited / registered), invite code, registration date, **message count**
- **Recipient Master management:**
  - "Add Recipient" form: school name + full name + is_test flag
  - Delete recipient (removes from search, messages are kept)
  - List all recipients with their status and message count
- "Generate Invite Code" button → calls `POST /api/admin/invite`
  - Input: suggested name (optional), recipient_id to link to
  - Generates random 12-char alphanumeric code
  - Stores in Redis: `SET bcp:invite:{code}` → `{ code, suggested_name, recipient_id, status: "pending", created_at }`
- Display generated code for copy (to send via SchoolConnect Post)
- Message counts show how many messages each recipient has received (content is NOT shown)

### 7. Admin API

**Route:** `POST /api/admin/invite`
**File:** `app/api/admin/invite/route.ts` (new)

**Auth:** Verify admin password (check cookie or request header)

**Request:**
```json
{
  "suggested_name": "string (optional)",
  "recipient_id": "string (optional, links invite to a recipient)"
}
```

**Logic:**
1. Generate random 12-char alphanumeric invite code
2. Store: `SET bcp:invite:{code}` → `{ code, suggested_name, recipient_id, status: "pending", created_at }`
3. Also add to invite list: `SADD bcp:invite_list {code}` (for admin dashboard listing)
4. Return `{ code }`

**Route:** `GET /api/admin/idols`
**File:** `app/api/admin/idols/route.ts` (new)

**Auth:** Verify admin

**Logic:**
1. Get all recipients: `SMEMBERS bcp:recipient_list`
2. For each, get recipient data: `GET bcp:recipient:{rcpt_id}`
3. For those with linked idol_id, get OG data: `GET bcp:idol:{idol_id}`
4. Count messages per recipient from message store
5. Return combined list with message counts

**Route:** `POST /api/admin/recipients`
**File:** `app/api/admin/recipients/route.ts` (new)

**Auth:** Verify admin

**Request:**
```json
{
  "name": "大沢瑠璃乃",
  "school": "蓮ノ空女学院",
  "is_test": false
}
```

**Logic:**
1. Generate recipient ID: `rcpt_` + random alphanumeric (8 chars)
2. Store: `SET bcp:recipient:{rcpt_id}` → `{ id, name, school, idol_id: null, is_test, created_at }`
3. Add to list: `SADD bcp:recipient_list {rcpt_id}`
4. Return `{ id, name, school }`

**Route:** `DELETE /api/admin/recipients?id={rcpt_id}`

**Logic:**
1. Remove from set: `SREM bcp:recipient_list {rcpt_id}`
2. Delete data: `DEL bcp:recipient:{rcpt_id}`
3. Messages are NOT deleted (kept in store, just no longer reachable via search)

### 8. Recipient Search API (for send page)

**Route:** `GET /api/recipients/search?q={query}`
**File:** `app/api/recipients/search/route.ts` (new)

**Auth:** None required (send page is public)

**Logic:**
1. Get all recipient IDs: `SMEMBERS bcp:recipient_list`
2. For each, get data: `GET bcp:recipient:{rcpt_id}`
3. Filter where `name` or `school` contains the query string (case-insensitive, partial match)
4. Return array of `{ id, name, school }`

**Note:** This is a simple in-memory filter for MVP. With a small number of recipients (<100), this is fine. Optimize later if needed.

**Send page modification:** Update `app/send/page.tsx` to:
- Replace the current hardcoded recipient list with a recipient selection UI that has 3 modes:

**Layout (top to bottom):**
1. **Favorites section** (if any exist): Show favorited recipients as tappable chips/cards. Each has a ☆ button to unfavorite. Tap to select as recipient.
2. **Recent section** (if any exist): Show last 5 sent-to recipients as tappable chips/cards. Each has a ☆ button to add to favorites. Tap to select as recipient.
3. **Search input**: Text field for incremental search. On each keystroke (debounced ~300ms), call `GET /api/recipients/search?q={input}`. Show matching results as a dropdown/list below the input. Each result has a ☆ button. Tap a result to select.

**After selecting a recipient:**
- Show selected recipient as a tag/chip with name + school + ✕ to deselect
- Hide the favorites/recent/search UI (or collapse it)
- Show the message body textarea

**localStorage keys:**
- `bcp_favorites`: JSON array of `{ id, name, school }` — user's favorited recipients
- `bcp_recent`: JSON array of `{ id, name, school }` — last 5 recipients sent to (newest first, deduplicated)

**On successful send:**
- Add the recipient to `bcp_recent` (prepend, deduplicate, cap at 5)
- Store `receiver_id` (rcpt_id) when posting to `/api/send`

**Favorite toggle logic:**
- ☆ (empty star) = not favorited. Tap to add to `bcp_favorites`
- ★ (filled star) = favorited. Tap to remove from `bcp_favorites`
- Favorites have no limit for MVP
- Star state is checked against `bcp_favorites` array by recipient ID

---

## Redis Key Schema

| Key Pattern | Type | Description |
|---|---|---|
| `beyond_connect_messages` | List | All messages (existing, from send API) |
| `bcp:recipient:{rcpt_id}` | String (JSON) | Recipient master data (school + name) |
| `bcp:recipient_list` | Set | All recipient IDs (for search/listing) |
| `bcp:invite:{code}` | String (JSON) | Invite code data |
| `bcp:invite_list` | Set | All invite codes (for listing) |
| `bcp:idol:{idol_id}` | String (JSON) | OG account data |
| `bcp:idol_name:{name}` | String | Maps login name → idol_id |

---

## File Structure After Phase 1

```
app/
├── page.tsx                    # Top page (existing, don't touch)
├── layout.tsx                  # Root layout + Gate (existing, don't touch)
├── actions.ts                  # Gate server action (existing, don't touch)
├── globals.css                 # Styles (existing, extend as needed)
├── favicon.ico
├── components/
│   └── Gate.tsx                # Gate component (existing, don't touch)
├── send/
│   └── page.tsx                # Send form (MODIFY: replace hardcoded list with search)
├── login/
│   └── page.tsx                # OG login (MODIFY: remove hardcoded pw, use API)
├── register/
│   └── page.tsx                # NEW: OG registration
├── dashboard/
│   └── page.tsx                # NEW: OG message inbox
├── admin/
│   └── page.tsx                # NEW: Admin dashboard
└── api/
    ├── send/
    │   └── route.ts            # Send message (MODIFY: use receiver_id = rcpt_id)
    ├── register/
    │   └── route.ts            # NEW: OG registration
    ├── idol-login/
    │   └── route.ts            # NEW: OG authentication
    ├── messages/
    │   └── route.ts            # NEW: Get messages for OG
    ├── recipients/
    │   └── search/
    │       └── route.ts        # NEW: Search recipients for send page
    └── admin/
        ├── invite/
        │   └── route.ts        # NEW: Generate invite code
        ├── idols/
        │   └── route.ts        # NEW: List OGs + status
        └── recipients/
            └── route.ts        # NEW: Add/delete recipients
```

---

## Important Constraints

1. **Don't break existing features.** Top page, Gate auth must continue working. Send flow will be modified (search instead of hardcoded list).
2. **Mobile-first UI.** All new pages must work well on smartphone screens.
3. **Match existing CSS theme.** Use the card UI, pastel colors, glass morphism from `globals.css`. Don't introduce Tailwind or new styling frameworks.
4. **Passwords are NEVER stored in plain text.** Always bcrypt hash.
5. **Passwords are NEVER in client-side code.** All auth checks happen in API routes.
6. **Install `bcryptjs` only.** Don't add other auth libraries for MVP.
7. **Use existing Redis connection pattern.** Check how `app/api/send/route.ts` connects to Redis and follow the same pattern.
8. **Japanese UI text.** All user-facing text should be in Japanese.
9. **Recipient master is separate from OG accounts.** Messages are linked to recipient IDs, not idol IDs. OG registration links the two.

---

## Testing Checklist

After implementation, verify:

- [ ] Can add recipients from admin dashboard (school + name)
- [ ] Can add a test recipient with is_test flag
- [ ] Recipient search works on send page (partial match, real-time)
- [ ] Can send message to a recipient (including one whose OG hasn't registered yet)
- [ ] Can generate invite code from admin dashboard (linked to a recipient)
- [ ] Can register with valid invite code (sets login name + password, links to recipient)
- [ ] Cannot register with invalid or used invite code
- [ ] Can login with registered credentials
- [ ] Cannot login with wrong password
- [ ] OG dashboard shows messages addressed to their linked recipient
- [ ] OG dashboard shows no messages for OG with no messages
- [ ] Admin dashboard shows correct registration status and message counts
- [ ] Can delete a test recipient (disappears from search, messages kept)
- [ ] Existing Gate auth still works
- [ ] All pages render correctly on mobile width
