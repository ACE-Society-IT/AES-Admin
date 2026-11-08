# Defend the Empire (DTE) — Frontend AI Agent Integration Guide

> **Target Audience:** AI Agent / Developer working on the Client/Participant War-Room Frontend Portal.
> **Context:** This document provides the exact Supabase backend credentials, database schemas, Realtime subscription channels, business logic rules, and frontend state synchronization directives established by the Admin Operations Portal.

---

## 1. Supabase Project Credentials

Both the Admin Portal and Participant Frontend connect to the same Supabase project (**Investomania**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://dvynsvvmqaibybjdsukb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2eW5zdnZtcWFpYnliamRzdWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NTg1NDIsImV4cCI6MjEwOTUzNDU0Mn0.F_J9N24gb-MDT4NkOoLufVWasvvGiAosRNRZUNiEJQE
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_AEvYylAmurpdKgBhTj3-HQ_wJqKZRFq
```

---

## 2. Supabase Tables & Schema Definitions

All tables in the project start with the prefix **`dte_`**. All three tables have Row-Level Security (RLS) enabled with open public permissions (`anon`, `authenticated`, `service_role`) and are added to the **`supabase_realtime`** publication.

### Table 1: `public.dte_crisis` (Crisis Scenarios & Real-Time Wave Control)
Controls which wave is currently running, the countdown clock, option selection gates, and user visibility.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `bigint` (PK) | Generated | Numeric identifier (1 to 10). |
| `wave_order` | `integer` | `1` | Sequence order for the crisis wave (1 to 10). |
| `icon` | `text` | `'⚡'` | Emoji/glyph (e.g., `🚢`, `💻`, `🏭`, `📉`, `⚖️`, `🛰️`, `🗣️`, `📦`, `🌪️`, `👑`). |
| `division` | `text` | `'Operations'` | Affected division (`Maritime`, `Capital`, `Resources`, `Legal`, `Defense`, etc.). |
| `title` | `text` | — | High-impact crisis headline. |
| `story` | `text` | — | Narrative briefing describing the threat. |
| `options` | `jsonb` | `'[]'` | Array containing exactly 4 options (`a`, `b`, `c`, `d`). See structure below. |
| `status` | `text` | `'idle'` | Wave lifecycle state: `'idle'`, `'running'`, `'paused'`, or `'completed'`. |
| `selection_open` | `boolean` | `false` | **Crucial Gate:** `true` when teams are allowed to select/lock options. Automatically set to `false` when time hits `00:00` or when admin halts. |
| `is_revealed` | `boolean` | `true` | **User Visibility:** If `false`, the frontend MUST HIDE the crisis headline and story from participants. |
| `options_revealed` | `boolean` | `true` | **Options Visibility:** If `false`, the frontend MUST HIDE the 4 options from participants. |
| `duration_seconds` | `integer` | `360` | Total countdown allocation for this wave in seconds. |
| `remaining_seconds`| `integer` | `360` | Real-time seconds remaining on the clock. |
| `started_at` | `timestamptz` | `null` | ISO timestamp when the round started. |
| `ends_at` | `timestamptz` | `null` | ISO timestamp when the wave will end. |
| `updated_at` | `timestamptz` | `now()` | Timestamp of last modification. |

#### JSON Structure of `options` column:
```json
[
  {
    "id": "a",
    "text": "Pay the fee quietly and sail on",
    "delta": 0,
    "outcome": "The ships move, but word of the payout spreads. Neutral on balance."
  },
  {
    "id": "b",
    "text": "Escort the convoy with a private naval flotilla",
    "delta": 100,
    "outcome": "The privateers back down. Investors applaud the show of strength."
  },
  {
    "id": "c",
    "text": "File a sovereign injunction and wait it out",
    "delta": 50,
    "outcome": "Ships are released after a day. Modest delay, modest gain."
  },
  {
    "id": "d",
    "text": "Abandon the cargo and claim insurance",
    "delta": -50,
    "outcome": "Clients are furious and the smelters starve for ore."
  }
]
```

> **Security Directives for Frontend Client:**
> 1. If `is_revealed === false`, render a "Transmission Incoming / Standby" banner instead of the crisis briefing.
> 2. If `options_revealed === false`, render an "Options Deliberating / Awaiting Facilitator Broadcast" placeholder.
> 3. **Never display `delta` or `outcome`** on unselected options before the team locks in their choice!

---

### Table 2: `public.dte_teams` (Participant State & Decisions Map)
Records each team's identity, authentication passcode, decisions map, manual judge adjustments, and net valuation.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `text` (PK) | — | Unique identifier (e.g., `'team-01'`). |
| `team_name` | `text` | Unique | Display name (e.g., `'Aethelgard Syndicate'`). |
| `passcode` | `text` | `'1234'` | Team login credential. |
| `playstyle` | `text` | `'Balanced Hedger'` | Strategic archetype tag. |
| `starting_valuation` | `bigint` | `100000` | Baseline enterprise value ($100,000M = $100.00B). |
| `decisions` | `jsonb` | `'{}'` | Key-value dictionary mapping wave index (`"0"`, `"1"`, ...) to locked option (`"a"`, `"b"`, `"c"`, `"d"`). |
| `manual_adjustment` | `bigint` | `0` | Discretionary bonus or penalty awarded by judges ($M). |
| `adjustment_log` | `jsonb` | `'[]'` | Audit log of judge adjustments `[ { amount, reason, timestamp } ]`. |
| `current_valuation` | `bigint` | `100000` | Calculated enterprise valuation in Millions ($M). |
| `last_answered_wave` | `integer` | `-1` | Zero-based index of the last answered wave. |
| `updated_at` | `timestamptz` | `now()` | Timestamp of last lock-in. |

#### JSON Structure of `decisions` column:
```json
{
  "0": "b",
  "1": "b",
  "2": "c"
}
```

---

### Table 3: `public.dte_leaderboard` (Real-Time Ranked Standings)
Pre-computed, sorted rankings directly consumable by the frontend Leaderboard view.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `bigint` (PK) | Generated | Auto-incrementing row ID. |
| `team_id` | `text` | Unique | References `dte_teams(id)` (Cascade on delete). |
| `team_name` | `text` | — | Team name. |
| `rank` | `integer` | `1` | Current standings position (1, 2, 3, ...). |
| `starting_valuation` | `bigint` | `100000` | Baseline ($100,000M). |
| `current_valuation` | `bigint` | `100000` | Current valuation in $M. |
| `net_delta` | `bigint` | `0` | `current_valuation - starting_valuation` ($M). |
| `crises_resolved` | `integer` | `0` | Number of waves answered. |
| `last_option_locked`| `text` | `null` | Latest option chosen (`"a"`, `"b"`, `"c"`, `"d"`). |
| `last_answered_wave`| `integer` | `-1` | Index of last wave answered. |
| `manual_adjustment` | `bigint` | `0` | Judge adjustment sum ($M). |
| `playstyle` | `text` | `'Balanced Hedger'` | Strategic profile. |
| `decisions` | `jsonb` | `'{}'` | Complete decisions map for history rendering. |
| `updated_at` | `timestamptz` | `now()` | Last sync timestamp. |

---

## 3. Realtime Subscription Setup in Frontend

Subscribe to real-time changes using `@supabase/supabase-js`:

```javascript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Listen to all changes across dte_crisis, dte_teams, and dte_leaderboard
export function subscribeToSimulation(onUpdate) {
  const channel = supabase
    .channel("dte-live-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dte_crisis" },
      () => onUpdate("crisis")
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dte_teams" },
      () => onUpdate("teams")
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dte_leaderboard" },
      () => onUpdate("leaderboard")
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
```

---

## 4. Participant Option Lock-In Logic

When a participant team locks an option:
1. Verify `dte_crisis.selection_open === true` and `dte_crisis.status === "running"`. If `false`, disallow lock-in (show "Option selecting is locked").
2. Update the team's `decisions` JSON object in `dte_teams`:
   ```javascript
   const currentDecisions = team.decisions || {};
   const nextDecisions = {
     ...currentDecisions,
     [activeWaveIndex]: selectedOptionId // e.g. "0": "b"
   };

   // Update dte_teams
   await supabase
     .from("dte_teams")
     .update({
       decisions: nextDecisions,
       last_answered_wave: activeWaveIndex,
       updated_at: new Date().toISOString()
     })
     .eq("id", team.id);
   ```
3. Reveal the outcome story and delta to that team for that wave immediately after lock-in.

---

## 5. Monetary Formatting Standards

All monetary numbers in the database are stored as **integers in Millions of Dollars ($M)**:
- `$100 Billion` is stored as `100000`.
- `+$100 Million` is stored as `100`.
- `-$50 Million` is stored as `-50`.

```javascript
export function formatValuation(millions, decimals = 2) {
  const num = Number(millions) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(decimals)}B`;
  }
  return `${sign}$${abs.toLocaleString()}M`;
}

export function formatDelta(delta) {
  const num = Number(delta) || 0;
  if (num > 0) return `+$${num.toLocaleString()}M`;
  if (num < 0) return `−$${Math.abs(num).toLocaleString()}M`;
  return "No change";
}
```

---

## 6. Strict Design System Notice (`DESIGN-RULES.md`)

If styling frontend components to match the imperial theme, adhere strictly to the 7-color token set:
- **`#5a0d1b`** (Abyssal Oxblood) — Page background base
- **`#650d1c`** (Deep Wine) — Secondary section surface
- **`#701020`** (Royal Crimson) — Primary dark cards & button fills
- **`#89192c`** (Ruby Velvet) — Elevated borders & active outlines
- **`#f8eee1`** (Alabaster Cream) — Primary headings & light container backgrounds
- **`#e8dcc6`** (Warm Parchment) — Muted copy & secondary light surfaces
- **`#f1ca7e`** (Imperial Gold) — Primary CTAs, active badges, highlights
- **No pure white (`#fff`), pure black (`#000`), or default Tailwind gray/slate/emerald/rose classes.**

