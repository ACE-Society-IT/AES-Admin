# Admin Operations & Data Architecture Guide

## Defend the Empire — Aurelia Sovereign Holdings

This document serves as the single source of truth for engineering and administering the **Defend the Empire** crisis simulation platform. It defines what the project is, what happens on the frontend UI, what must be controlled and managed from the Admin Panel, and the exact data schemas required to feed the frontend cleanly without breaking state synchronization.

---

## 1. Project Overview & Context

### What is "Defend the Empire"?

**Defend the Empire** is an intensive, high-stakes corporate and geopolitical crisis war-room simulation created for delegate and student teams. Teams step into the role of the executive leadership board of **Aurelia Sovereign Holdings**, a fictitious $100 Billion global conglomerate controlling maritime chokepoints, rare-earth smelters, bullion vaults, and orbital satellites.

### The Objective

- Teams start with an identical baseline valuation of **$100 Billion** (`$100,000M`).
- Throughout a **60-minute round**, the system serves **10 successive crisis waves** (one new crisis every **6 minutes** / 360 seconds).
- In each wave, teams face an urgent operational, legal, reputational, or financial threat.
- Teams must deliberate under tight time pressure and pick one of **four tactical options (A, B, C, D)**.
- Each choice carries an immediate positive, negative, or neutral impact on company valuation (measured in millions of dollars) and unveils a strategic outcome narrative.
- At the conclusion of the 10 waves, teams are ranked on the global leaderboard based on their final net valuation and survival choices.

---

## 2. What Is Happening on the Frontend UI

The application shell (`EmpirePortalShell.jsx`) renders a unified, high-contrast dark imperial war-room UI divided into three primary views:

### A. Company Background / Dossier View (`CompanyBackgroundView.jsx`)

- Displays corporate background intelligence, financial pillars, debt covenant floor requirements ($350M minimum liquidity), and division profiles (Maritime, Capital, Resources, Legal, Defense, Operations).
- Educates participants on the lore, conglomerate holdings, and risk appetite before entering the live simulation.

### B. Live Crisis Simulation View (`LiveCrisisSimulationView.jsx`)

This is the core interactive arena. It has four main visual modules:

1. **Valuation Hero (`ValuationHero`)**:
   - **Valuation Counter**: Animated digital display showing real-time net enterprise value (starts at `$100.00B`). Animates smoothly whenever a decision is made using an easing tween (`useAnimatedNumber`).
   - **Floating Delta Badge & Screen Flash**: When a decision is locked, an animated badge flashes (+`$100M` in emerald green or `-`$50M in rose red) with a subtle screen border glow.
   - **SVG Valuation History Chart (`ValuationPath`)**: A live SVG sparkline plotting step-by-step valuation progression across crisis 0 through 10 against the baseline.
2. **Round Progress & Synchronized Clock Track (`RoundTrack`)**:
   - **Stepping Stone Bar**: 10 numbered step pills representing crises 1 through 10. Completed waves light up green (positive delta), red (negative delta), or cream (neutral). The active wave has an imperial gold pulsing ring.
   - **Countdown Clock**: Displays time remaining in the current 6-minute window (`Next crisis in MM:SS`). When under 60 seconds, pulses in red warning mode.
   - **Linear Progress Bar**: Visual sweep filling from 0% to 100% across the current 6-minute window.
3. **Active Crisis Card (`CrisisCard`)**:
   - **Header**: Shows crisis index (`Crisis X of 10`), division badge, crisis icon/emoji (e.g. 🚢, 💻, 🏭), title, and scenario briefing narrative.
   - **Interactive Option Grid**: 4 option tiles (Letters A, B, C, D).
     - _Pre-lock state_: Teams can select an option (highlights in gold). The financial deltas and outcome texts are strictly hidden to prevent bias.
     - _Lock-in button_: Teams click **"Lock in decision"** to commit.
     - _Post-lock state_: All 4 options are disabled. The chosen option highlights. The financial delta (e.g. `+$100M`, `−$50M`, `No change`) and outcome narrative appear.
4. **Lifecycle Screens**:
   - **Start Screen (`StartCard`)**: Presented before the round commences with rules briefing and a "Begin the round" trigger.
   - **Final Debrief Screen (`FinalCard`)**: Rendered when all 10 crises are complete (or time expires). Displays final enterprise valuation, total gain/loss, and a review of all 10 decisions taken.

### C. Leaderboard View (`LeaderboardView.jsx`)

- Ranks all participating teams live by final valuation, crises resolved, net delta, and strategic playstyle tags.

---

## 3. What Needs to Be Managed in the Admin Panel

The Admin Panel is the control center for game masters running the competition. It must manage five functional areas:

### 1. Global Simulation & Timer Controls

The admin must have real-time control over the master clock:

- **Game State**: Transition states between `NOT_STARTED` ➔ `RUNNING` ➔ `PAUSED` ➔ `COMPLETED`.
- **Global Clock Synchronization**:
  - Start round countdown.
  - Pause / Resume timer (for facilitator announcements or technical pauses).
  - Reset round to time `00:00` and baseline valuation.
  - Set current crisis index manually (force skip to crisis #N, or force next wave if all teams submitted early).
  - Adjust countdown timer (e.g. "Add +2 minutes to active wave" or "Fast-forward wave").

### 2. Crisis Scenario & Content Management (CRUD)

The admin must be able to view, create, edit, reorder, or swap crisis scenarios:

- **Crisis Order / Wave Number**: Sequence (1 through 10).
- **Division / Category**: Tagging which division is affected (e.g., `Maritime`, `Capital`, `Resources`, `Legal`, `Defense`, `Reputation`, `Supply Chain`, `Operations`, `Governance`).
- **Icon / Symbol**: Emoji or SVG icon identifier representing the crisis (e.g., `🚢`, `💻`, `🏭`, `📉`, `⚖️`, `🛰️`, `🗣️`, `📦`, `🌪️`, `👑`).
- **Title**: Short high-impact crisis name (e.g. _"Flagship Convoy Seized"_).
- **Story Briefing**: Detailed narrative describing the situation, risks, and urgency.

### 3. Tactical Options & Valuation Deltas (CRUD)

For each crisis, the admin must configure exactly **4 strategic options (A, B, C, D)**:

- **Option ID**: Uniform identifier (`"a"`, `"b"`, `"c"`, `"d"`).
- **Option Text**: The action proposal displayed to participants (e.g. _"Wire the ransom to keep trading online"_).
- **Valuation Delta (`delta`)**: Signed integer in **$ Millions** indicating valuation change:
  - Positive integer (`50`, `100`, `200`) ➔ Valuation increases by +$50M, +$100M, etc.
  - Negative integer (`-50`, `-75`, `-100`) ➔ Valuation decreases by -$50M, -$75M, etc.
  - Zero (`0`) ➔ Neutral effect on valuation.
- **Outcome Story (`outcome`)**: The debrief text revealed immediately after locking in, explaining why the company gained or lost value.

### 4. Global Simulation Parameters (`SIM_CONFIG`)

The admin must be able to adjust core math configurations:

- **Company Name**: Defaults to `"Aurelia Sovereign Holdings"`.
- **Starting Valuation**: Defaults to `100000` ($100,000 Million = $100 Billion).
- **Crisis Interval Seconds**: Duration of each wave (default `360` = 6 minutes).
- **Total Crises Count**: Number of waves in a round (default `10`).
- **Total Round Seconds**: Overall duration (default `3600` = 60 minutes).

### 5. Multi-Team Session Monitoring

- Real-time submission tracker: View which teams have locked in their decision for the active wave and who is still pending.
- Valuation leaderboard monitor: Live rankings of team standings.
- Manual override / score adjustment: Ability to penalize or grant discretionary bonus valuation points if judges rule on team presentations.

---

## 4. Data Schemas (Exact Specification)

To ensure the Admin Panel transmits data that seamlessly plugs into the frontend without runtime errors, all stored and transmitted data must conform to the following schemas.

> [!IMPORTANT]
> **Financial Unit Convention**: All monetary valuations and deltas are stored as **integers in Millions of Dollars**.
>
> - `$100 Billion` is stored as `100000` (i.e. 100,000 million).
> - `+$100 Million` is stored as `100`.
> - `-$50 Million` is stored as `-50`.
>
> The UI helpers (`formatValuation`, `formatDelta`) automatically convert values $\ge 1000$ to Billions (`$100.00B`) and others to Millions (`+$100M`).

---

### A. Individual Crisis Option Schema

Each crisis has an `options` array containing 4 objects:

```typescript
interface CrisisOption {
  id: "a" | "b" | "c" | "d"; // Lowercase single letter identifier
  text: string; // Tactical decision description shown on button
  delta: number; // Valuation impact in Millions ($M). E.g. 100, 50, 0, -50
  outcome: string; // Debrief explanation revealed AFTER team locks in
}
```

#### JSON Example:

```json
{
  "id": "b",
  "text": "Escort the convoy with a private naval flotilla",
  "delta": 100,
  "outcome": "The privateers back down. Investors applaud the show of strength."
}
```

---

### B. Crisis Wave Schema

The full list of crises stored in the database and loaded into the frontend:

```typescript
interface Crisis {
  id: number; // Numeric wave ID (1 to 10)
  icon: string; // Emoji or icon glyph (e.g. "🚢", "💻", "⚖️")
  division: string; // Business unit ("Maritime" | "Capital" | "Resources" | "Legal" | "Defense" | etc.)
  title: string; // Headline title of the crisis
  story: string; // Scenario description paragraph
  options: [CrisisOption, CrisisOption, CrisisOption, CrisisOption]; // Exactly 4 options (a, b, c, d)
}
```

#### Full Crisis JSON Example:

```json
{
  "id": 1,
  "icon": "🚢",
  "division": "Maritime",
  "title": "Flagship Convoy Seized",
  "story": "Privateer gunboats have surrounded three of our cargo carriers in the Red Sea and are demanding a 'port fee'. Refineries are waiting on that cargo.",
  "options": [
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
}
```

---

### C. Global Simulation Configuration Schema (`SIM_CONFIG`)

Stored under administrative settings or game room metadata:

```typescript
interface SimulationConfig {
  companyName: string; // "Aurelia Sovereign Holdings"
  startingValuation: number; // 100000 ($100B in millions)
  crisisIntervalSeconds: number; // 360 (6 minutes per crisis wave)
  totalCrises: number; // 10 (total number of crises)
  totalSeconds: number; // 3600 (60 minutes total round time)
}
```

#### JSON Example:

```json
{
  "companyName": "Aurelia Sovereign Holdings",
  "startingValuation": 100000,
  "crisisIntervalSeconds": 360,
  "totalCrises": 10,
  "totalSeconds": 3600
}
```

---

### D. Live Session State Schema (Sync Channel / Room State)

When broadcasting live room state from the Admin Panel via Firebase Firestore, Supabase Realtime, or WebSockets, use this schema:

```typescript
interface LiveSessionState {
  roomId: string; // Unique round identifier (e.g. "round-2026-session-1")
  status: "idle" | "running" | "paused" | "completed"; // Current phase
  elapsedSeconds: number; // Master elapsed clock (0 to 3600)
  currentWaveIndex: number; // 0-indexed wave pointer (0 = Crisis 1, 9 = Crisis 10)
  serverTimestamp: number; // Unix epoch timestamp (ms) for drift compensation
  startedAt?: number; // Epoch timestamp when round started
  pausedAt?: number; // Epoch timestamp if paused
}
```

#### JSON Example:

```json
{
  "roomId": "live-war-room-01",
  "status": "running",
  "elapsedSeconds": 745,
  "currentWaveIndex": 2,
  "serverTimestamp": 1731000000000,
  "startedAt": 1730999255000,
  "pausedAt": null
}
```

---

### E. Team Decisions & Submissions Schema

The frontend records decisions as a dictionary mapping each `crisisIndex` (0 to 9) to the selected `optionId` (`"a"` | `"b"` | `"c"` | `"d"`):

```typescript
interface TeamSessionRecord {
  teamId: string; // Unique team identifier (e.g. "team-09")
  teamName: string; // Display name (e.g. "Aethelgard Syndicate")
  decisions: Record<number, "a" | "b" | "c" | "d">; // E.g. { "0": "b", "1": "c" }
  currentValuation: number; // Derived: 100000 + sum of chosen deltas
  lastAnsweredWave: number; // Last crisis wave resolved (0 to 9)
  updatedAt: number; // Timestamp of last lock-in
}
```

#### JSON Example:

```json
{
  "teamId": "team-09",
  "teamName": "Aethelgard Syndicate",
  "decisions": {
    "0": "b",
    "1": "c",
    "2": "a"
  },
  "currentValuation": 100150,
  "lastAnsweredWave": 2,
  "updatedAt": 1731000120000
}
```

---

## 5. Frontend Calculation & Synchronization Logic

To ensure the Admin Panel behaves identically to the participant view, observe these formulas currently used in `EmpirePortalShell.jsx`:

1. **Current Wave Index**:
   $$\text{currentIndex} = \min\left(\left\lfloor \frac{\text{elapsed}}{\text{crisisIntervalSeconds}} \right\rfloor, \text{totalCrises} - 1\right)$$
2. **Time Remaining in Active Wave**:
   $$\text{windowLeft} = \text{crisisIntervalSeconds} - (\text{elapsed} \pmod{\text{crisisIntervalSeconds}})$$
3. **Active Wave Progress Percentage**:
   $$\text{progress} = \frac{\text{elapsed} \pmod{\text{crisisIntervalSeconds}}}{\text{crisisIntervalSeconds}} \times 100\%$$
4. **Valuation Derivation**:
   $$\text{Current Valuation} = \text{startingValuation} + \sum_{i \in \text{decisions}} \text{delta}(\text{CRISES}[i], \text{decisions}[i])$$

> [!NOTE]
> The valuation is strictly deterministic and calculated from chosen option deltas. Storing and transmitting the raw `decisions` map guarantees that valuation history, graphs, and leaderboard points will never drift out of sync between the Admin and the client teams.

---

### Implementation Checklist for Admin Panel Developers:

- [ ] **Timer Sync**: Broadcast `status` and `elapsedSeconds` with server timestamps so participants don't rely purely on local browser clocks.
- [ ] **Hide Outcomes Before Lock-In**: Ensure the participant UI never exposes the `delta` or `outcome` fields in the client bundle until after that crisis's decision is locked.
- [ ] **Option Count Enforcement**: Every crisis must have exactly 4 options (`a`, `b`, `c`, `d`).
- [ ] **Integrity Guard**: Prevent participants from changing a locked-in choice once the entry is written to `decisions[currentIndex]`.
