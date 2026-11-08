# AES 2026 Unified Admin Suite · Master Design System & UI/UX Specification

**Document Version:** 2.0 (Agency UI / UX Pro Max Edition)  
**Target Domain:** `admin.alphaace.com.pk` (Master Admin) & `app.alphaace.com.pk` (Contestant Gateway)  
**Aesthetic Style:** Rounded Editorial Monochrome (Stark White, Warm Paper, Ink Charcoal, Pill Geometry)  
**Interaction Policy:** Strict Zero Motion (`animation: none !important; transition: none !important;` for instant, tournament-grade repainting)  
**Accessibility:** WCAG 2.2 AA / AAA Compliant (4.5:1 minimum text contrast, 44px touch targets, clear focus rings)

---

## 1. Executive Summary & Design Philosophy

The AES 2026 Admin Suite is engineered for high-stakes competition directors managing three distinct collegiate business battlegrounds:
1. **Investomania** (Live financial floor, order books, and real-time market shocks)
2. **Venture Arena** (Live pitch sessions, deck reviews, and panel jury scoring)
3. **Case Chronicles** (Multi-stage case rounds, strategic deliverables, and rubric grading)

### Core Directives

1. **Rounded Ergonomics over Rigid Boxiness**:
   - Rigid wireframes and sharp corners induce stress in live tournament environments.
   - We utilize generous curves (`rounded-[28px]` outer shells, `rounded-2xl` interior cards, `rounded-full` controls) to make the cockpit approachable, modern, and fatigue-free.
2. **True Editorial Monochrome**:
   - Zero distracting rainbow gradients or glowing neon elements.
   - Visual hierarchy is established strictly through font weight contrast, serif versus sans pairing, ink density, and precise hairline borders (`#E4E4E7`).
3. **Humanized Microcopy (Plain English)**:
   - All robotic jargon (`EXECUTE_CRISIS`, `BROADCAST_PAYLOAD`, `MUTATE_STATE`) is strictly prohibited.
   - Replaced by calm, conversational human directions (`"Put the news out"`, `"Let contestants trade"`, `"Shift stock prices"`, `"Who is currently trading"`).
4. **Zero-Delay Performance**:
   - In a live crisis release, waiting 300ms for a CSS fade or bounce animation creates hesitation.
   - All interactive elements repaint at 0ms latency with zero animation overhead.
5. **Iconographic Purity**:
   - Strict ban on emoji icons (e.g., no rocket emojis or fire emojis).
   - Only crisp, monochromatic inline SVGs with 1.5px stroke weight and standardized 20x20px or 16x16px viewports.

---

## 2. Design Tokens Catalog

### A. Color Palette Tokens

```css
:root {
  /* Canvas & Background Surfaces */
  --surface-canvas:      #F4F4F6; /* Warm editorial paper gray */
  --surface-card:        #FFFFFF; /* Pure stark white */
  --surface-sidebar:     #FFFFFF; /* Elevated white dock */
  --surface-subtle:      #FAFAFC; /* Secondary quiet panel fill */
  --surface-inset:       #F0F0F3; /* Recessed input and pill backdrops */

  /* Hairlines & Structural Dividers */
  --border-light:        #ECECEE; /* Subtlest card border */
  --border-medium:       #E4E4E7; /* Standard interactive border */
  --border-dark:         #18181B; /* High-contrast active element border */

  /* Typography & Ink Densities */
  --ink-primary:         #0F0F11; /* Deep charcoal ink (WCAG AAA 16.5:1 against white) */
  --ink-secondary:       #52525B; /* Zinc secondary copy (WCAG AA 6.2:1 against white) */
  --ink-muted:           #71717A; /* Meta captions and helper notes (WCAG AA 4.6:1 against white) */
  --ink-inverted:        #FFFFFF; /* Pure white text on ink pills */

  /* High-Stakes Functional Signals (Monochrome-Harmonized) */
  --signal-active-dot:   #12B76A; /* Tiny 6px live pulse indicator */
  --signal-pause-dot:    #F59E0B; /* Paused indicator */
  --signal-destructive:  #18181B; /* Solid black or clean outline; no gaudy red washes */
  --signal-danger-text:  #B42318; /* High-contrast alert text */
}
```

### B. Typography Scale & Font Pairings

* **Headlines & Editorial Statements**: `Newsreader` (variable serif, optical sizes 6–72pt). Gives the tournament director an authoritative, editorial financial paper aesthetic.
* **Interface & Operational Controls**: `Plus Jakarta Sans` or `Inter` (geometric sans-serif, weights 400, 500, 600, 700). Ultra-clean legibility at 12px–14px.
* **Data, Tickers & Time Codes**: `JetBrains Mono` (tabular numbers enabled `font-variant-numeric: tabular-nums`). Guarantees numbers do not jump or jitter during updates.

| Token | Size | Line Height | Weight | Font Family | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-1` | 32px | 38px | 600 | Serif | Page Titles & Summit Headings |
| `title-1` | 22px | 28px | 600 | Serif | Module Names & Section Highlights |
| `title-2` | 17px | 24px | 700 | Sans | Card Titles & Step Headings |
| `body-default` | 14px | 20px | 500 | Sans | Standard Labels, Form Fields, Tables |
| `body-subtle` | 13px | 18px | 400 | Sans | Helper Microcopy & Explanations |
| `mono-data` | 13px | 18px | 600 | Mono | Prices, Passkeys, Team Codes, Timers |
| `caption` | 11px | 14px | 700 | Sans | Uppercase Pill Badges & Nav Labels |

### C. Rounded Geometry Scale

| Token | Radius Value | Applied Components |
| :--- | :--- | :--- |
| `radius-outer` | `28px` to `32px` | Main workspace cards, persistent sidebar container |
| `radius-card` | `18px` to `20px` | Feature cards, crisis step panels, dialogs |
| `radius-tile` | `12px` to `14px` | Sub-panels, metrics boxes, list items |
| `radius-pill` | `9999px` (`rounded-full`) | Action buttons, search bars, status badges, module switcher tabs |

---

## 3. Humanized Plain-English Microcopy Dictionary

In stressful tournament operations, administrators must never decipher ambiguous technical keys.

| Old / Robotic Developer Wording | Humanized Editorial Plain English |
| :--- | :--- |
| `CRISIS_ANNOUNCEMENT_TRIGGER` | **"Put the news out"** |
| `COMMENCE_TRADING_INTERVAL` | **"Let contestants trade"** |
| `APPLY_PRICE_SHOCK_MUTATION` | **"Shift stock prices"** |
| `EXECUTE_DRAFT_NEWS` | **"Release this breaking story"** |
| `PORTFOLIO_LEDGER_ENTITIES` | **"Who is currently trading"** |
| `AUTH_PASSKEY_REGISTRY` | **"Admin Keys & Access"** |
| `HALT_SYSTEM_ENGINE` | **"Pause the competition"** |
| `RESUME_SYSTEM_ENGINE` | **"Resume competition"** |
| `TERMINATE_KEY_INSTANCE` | **"Revoke this passkey"** |
| `REGISTER_NEW_ADMIN_SECRET` | **"Create a new access key"** |
| `MARKET_STATUS_LOCKED` | **"Trading floor is paused"** |
| `MARKET_STATUS_ACTIVE` | **"Trading floor is open for orders"** |

---

## 4. Cockpit Architecture & Layout Hierarchy

### A. Left Dock (Persistent Sidebar)
* **Dimensions**: Fixed 290px width, sticky height, `rounded-[28px]`, white card background.
* **Header**:
  * Event insignia: **AES 2026** (Bold Serif) · *Summit Control*
  * Active organizer status tag: Single pill showing passkey label (e.g. `Root Key (Organizer)`).
* **3-Module Unified Switcher**:
  * Clean vertical pill stack allowing instant switching without leaving the URL:
    * **Investomania**: Trading floor, price adjustments, market news.
    * **Venture Arena**: Pitch floor, deck review, jury scoring sheets.
    * **Case Chronicles**: Case round delivery, team submissions, scoring.
* **Module-Specific Navigation**:
  * Cockpit Overview
  * Breaking News & Crises
  * Stocks & Valuations
  * Teams & Standings
  * Access Keys
* **Bottom Organizer Actions**:
  * Clean "Sign out of Admin" action with clear prompt confirmation.

### B. Top Header Cockpit Bar
* **Tournament State Banner**:
  * Warm statement: *"Investomania is currently running Round 1 — 14 teams trading."*
* **Big Status Pill**:
  * High-contrast button: `[ Pause Game ]` or `[ Open Trading Floor ]`.
* **Global Master Clock**:
  * Live round timer formatted as `04:42 remaining`.

### C. Crisis Release Workflow (3 Human Steps)
Administrators execute market shocks through a clear 3-card progressive workflow:

```
[ Step 1: Put the news out ]
  Select which draft crisis to publish from dropdown.
  Choose reading time (e.g. 3 minutes).
  Action: [ Release Story Now ]
         ↓
[ Step 2: Let contestants trade ]
  When news is out, contestants digest.
  Directors unlock trading floor for the timed round (e.g. 5 minutes).
  Action: [ Open Floor to Orders ]
         ↓
[ Step 3: Shift stock prices ]
  Once trading completes, execute the price adjustments.
  Action: [ Apply Market Shifts ]
```

---

## 5. Accessibility & Heuristic Requirements

1. **Focus Rings (`focus-visible`)**:
   - `outline: 2px solid #0F0F11; outline-offset: 2px;`
   - Visible on all interactive pills, inputs, and buttons when navigating via `Tab` key.
2. **Touch Targets**:
   - Every clickable pill has a minimum height of `44px` and horizontal padding of at least `18px`.
3. **Contrast Ratios**:
   - Text `#0F0F11` on `#FFFFFF` = **16.5:1** (WCAG AAA).
   - Secondary `#52525B` on `#FFFFFF` = **6.2:1** (WCAG AA).
   - Pill background `#111111` with white text = **18.2:1** (WCAG AAA).
4. **Stable Layout (Zero Cumulative Layout Shift)**:
   - Fixed heights on timers and table rows to prevent jitter when digits change.

---

## 6. Multi-Domain & Unified Supabase Architecture

To support the 3 modules under one umbrella:
* **Participant App URL**: `https://app.alphaace.com.pk`
  * Single login using team credentials (`public.teams`).
  * 3 module launch cards (Investomania, Venture Arena, Case Chronicles).
* **Master Admin URL**: `https://admin.alphaace.com.pk`
  * Single passkey authentication screen.
  * Instant switcher on the left dock to manage all 3 modules without switching domains.
* **Supabase Project Schema**:
  * Shared table: `public.teams` (Team ID, Team Name, Member Names, Passcode, Created At).
  * Isolated module tables:
    * `investomania_portfolios`, `investomania_trades`, `investomania_stocks`, `investomania_crises`
    * `venture_teams`, `venture_pitches`, `venture_jury_scores`
    * `case_submissions`, `case_rounds`, `case_evaluations`
  * Shared passkeys table: `admin_passkeys` (Key ID, Key Hash, Key Label, Role, Created At).

---

## 7. Developer Implementation & QA Checklist

- [x] Absolute zero animation rule applied in CSS (`animation: none !important; transition: none !important;`).
- [x] Generous rounded geometries (`rounded-[28px]`, `rounded-2xl`, `rounded-full`).
- [x] No emoji icons; pure monochromatic SVGs with 1.5px stroke width.
- [x] Plain English humanized microcopy across all controls.
- [x] Multi-passkey backend authentication support (`/api/admin/passkey/create`, `/api/admin/passkey/delete`).
- [x] 3-step crisis release sequence with live countdown timers.
- [x] Mobile/tablet drawer responsive behavior without layout breakage.
