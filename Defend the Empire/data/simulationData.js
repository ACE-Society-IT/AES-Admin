// ============================================================================
// DEFEND THE EMPIRE — AURELIA SOVEREIGN HOLDINGS
// Master Data Store, Initial Schemas & Deterministic Calculation Helpers
// Conforms strictly to admin.md Section 4 & Section 5 specifications.
// ============================================================================

export const DIVISIONS = [
  "Maritime",
  "Capital",
  "Resources",
  "Legal",
  "Defense",
  "Reputation",
  "Supply Chain",
  "Operations",
  "Governance",
];

export const CRISIS_ICONS = [
  "🚢",
  "💻",
  "🏭",
  "📉",
  "⚖️",
  "🛰️",
  "🗣️",
  "📦",
  "🌪️",
  "👑",
  "🛢️",
  "🏛️",
  "🔐",
  "⚡",
];

/**
 * Global Simulation Configuration Schema (SIM_CONFIG)
 * All valuations are stored as integers in Millions of Dollars ($100B = 100000).
 */
export const INITIAL_SIM_CONFIG = {
  companyName: "Aurelia Sovereign Holdings",
  startingValuation: 100000, // $100,000M = $100.00B
  crisisIntervalSeconds: 360, // 6 minutes per crisis wave
  totalCrises: 10, // 10 crisis waves
  totalSeconds: 3600, // 60 minutes total round duration
};

/**
 * Live Session State Schema (Sync Channel / Room State)
 */
export const INITIAL_SESSION_STATE = {
  roomId: "live-war-room-01",
  status: "running", // "idle" | "running" | "paused" | "completed"
  elapsedSeconds: 745, // Wave 3 (index 2) active in demo state
  currentWaveIndex: 2, // 0-indexed wave pointer (0 = Crisis 1, 9 = Crisis 10)
  serverTimestamp: 1731000000000,
  startedAt: 1730999255000,
  pausedAt: null,
};

/**
 * Company Dossier & Background Metadata (Matches CompanyBackgroundView.jsx context)
 */
export const COMPANY_DOSSIER = {
  name: "Aurelia Sovereign Holdings",
  baselineValuation: 100000,
  debtCovenantFloor: 350, // $350M minimum liquidity requirement
  headquarters: "Geneva / Singapore Sovereign Freezone",
  summary:
    "A $100 Billion global conglomerate controlling maritime chokepoints, rare-earth smelters, bullion vaults, and low-earth orbital reconnaissance satellites.",
  pillars: [
    { name: "Maritime Chokepoints", exposure: "$28.4B", status: "Critical" },
    { name: "Rare-Earth Smelters", exposure: "$22.1B", status: "Nominal" },
    { name: "Sovereign Bullion Vaults", exposure: "$31.0B", status: "Fortified" },
    { name: "Orbital Recon Network", exposure: "$18.5B", status: "Active" },
  ],
};

/**
 * 10 Complete Crisis Waves (Crisis Wave Schema)
 * Every crisis has id (1..10), icon, division, title, story, and 4 options (a, b, c, d).
 */
export const INITIAL_CRISES = [
  {
    id: 1,
    icon: "🚢",
    division: "Maritime",
    title: "Flagship Convoy Seized",
    story:
      "Privateer gunboats have surrounded three of our cargo carriers in the Red Sea and are demanding a 'port fee'. Refineries are waiting on that cargo.",
    options: [
      {
        id: "a",
        text: "Pay the fee quietly and sail on",
        delta: 0,
        outcome:
          "The ships move, but word of the payout spreads. Neutral on balance.",
      },
      {
        id: "b",
        text: "Escort the convoy with a private naval flotilla",
        delta: 100,
        outcome:
          "The privateers back down. Investors applaud the show of strength.",
      },
      {
        id: "c",
        text: "File a sovereign injunction and wait it out",
        delta: 50,
        outcome:
          "Ships are released after a day. Modest delay, modest gain.",
      },
      {
        id: "d",
        text: "Abandon the cargo and claim insurance",
        delta: -50,
        outcome:
          "Clients are furious and the smelters starve for ore.",
      },
    ],
  },
  {
    id: 2,
    icon: "💻",
    division: "Capital",
    title: "Zero-Day Bullion Ledger Freeze",
    story:
      "An Eastern European syndicate has injected a logic bomb into our Zurich clearing engine. $14B in overnight repo settlements will default in 18 minutes unless resolved.",
    options: [
      {
        id: "a",
        text: "Wire the ransom to keep trading online",
        delta: -75,
        outcome:
          "The decryptor works, but compliance leaks the payment to regulators. Institutional trust drops.",
      },
      {
        id: "b",
        text: "Failover to cold-storage air-gapped ledgers and halt margin desks",
        delta: 125,
        outcome:
          "Seamless recovery within 9 minutes. Counterparties praise Aurelia's resilient architecture.",
      },
      {
        id: "c",
        text: "Invoke force majeure and freeze client redemptions for 24 hours",
        delta: -50,
        outcome:
          "Panic spreads across Asian trading desks; credit default swaps widen sharply.",
      },
      {
        id: "d",
        text: "Deploy offensive counter-cyber team to seize their command servers",
        delta: 50,
        outcome:
          "Keys recovered just before the bell, though forensic audits slow settlement volume.",
      },
    ],
  },
  {
    id: 3,
    icon: "🏭",
    division: "Resources",
    title: "Rare-Earth Smelter Nationalization Threat",
    story:
      "A newly installed military junta has surrounded our flagship neodymium refinery in the Andean basin, demanding a 51% sovereign equity transfer by midnight.",
    options: [
      {
        id: "a",
        text: "Sign a joint-venture royalty pact granting 20% revenue share",
        delta: 75,
        outcome:
          "The junta accepts the cash flow compromise. Export licenses remain intact.",
      },
      {
        id: "b",
        text: "Evacuate engineers and remotely brick the automated furnaces",
        delta: -25,
        outcome:
          "The regime is left with useless steel, but quarterly output drops 18%.",
      },
      {
        id: "c",
        text: "Withhold sovereign debt rollover via our Capital arm until troops withdraw",
        delta: 150,
        outcome:
          "Faced with a currency collapse, the regime backs down unconditionally within hours.",
      },
      {
        id: "d",
        text: "Concede the 51% stake in exchange for long-term tax immunity",
        delta: -100,
        outcome:
          "Markets punish the surrender of core tangible assets. Equity analysts downgrade the division.",
      },
    ],
  },
  {
    id: 4,
    icon: "📉",
    division: "Capital",
    title: "Coordinated Short-Seller Bear Raid",
    story:
      "Three activist hedge funds have published a 140-page dossier alleging off-balance-sheet derivatives inside our Maritime leasing arm, triggering a flash dip.",
    options: [
      {
        id: "a",
        text: "Authorize an immediate $2B open-market share buyback & short squeeze",
        delta: 150,
        outcome:
          "Short sellers are annihilated in a brutal afternoon squeeze. Valuation surges to new highs.",
      },
      {
        id: "b",
        text: "Publish raw audited vault & vessel telemetry in real time",
        delta: 75,
        outcome:
          "Radical transparency calms institutional bondholders and discredits the report.",
      },
      {
        id: "c",
        text: "Refuse to comment on market rumors and maintain business as usual",
        delta: -75,
        outcome:
          "Silence is interpreted as guilt by algorithmic sentiment engines.",
      },
      {
        id: "d",
        text: "Sue the hedge funds in London High Court for market manipulation",
        delta: 0,
        outcome:
          "Litigation drags on; the stock stabilizes near baseline as traders await discovery.",
      },
    ],
  },
  {
    id: 5,
    icon: "⚖️",
    division: "Legal",
    title: "Antitrust Subpoena on Strait Tolls",
    story:
      "Brussels and Washington regulators have jointly launched an emergency probe into our exclusive piloting tariffs across three strategic maritime canals.",
    options: [
      {
        id: "a",
        text: "Carve out canal operations into an independent sovereign trust",
        delta: 100,
        outcome:
          "Regulators close the investigation while Aurelia retains 100% of preferred lease cashflows.",
      },
      {
        id: "b",
        text: "Threaten to suspend priority passage for G7 naval logistics vessels",
        delta: -100,
        outcome:
          "Defense ministries retaliate by canceling three lucrative satellite contracts.",
      },
      {
        id: "c",
        text: "Offer a temporary 12% tariff rebate for green-certified hulls",
        delta: 50,
        outcome:
          "ESG funds applaud the move and antitrust pressure dissipates.",
      },
      {
        id: "d",
        text: "Tie the probe up in jurisdictional arbitration for five years",
        delta: 0,
        outcome:
          "Legal retainers rise, but operational cashflow continues uninterrupted.",
      },
    ],
  },
  {
    id: 6,
    icon: "🛰️",
    division: "Defense",
    title: "Orbital Recon Constellation Spoofed",
    story:
      "A rogue state actor is jamming synthetic-aperture radar feeds from our Helios-9 satellite cluster over the Arctic shipping corridor.",
    options: [
      {
        id: "a",
        text: "Burn orbital thrusters to incline the constellation into a higher plane",
        delta: 50,
        outcome:
          "Signal integrity is restored at the cost of six months of satellite fuel life.",
      },
      {
        id: "b",
        text: "Activate encrypted laser cross-links across our reserve micro-sats",
        delta: 125,
        outcome:
          "Zero downtime. Sovereign defense clients immediately sign a $400M tier upgrade.",
      },
      {
        id: "c",
        text: "Lease telemetry bandwidth from a rival commercial provider",
        delta: -50,
        outcome:
          "Margins compress and our reputation for sovereign autonomy takes a hit.",
      },
      {
        id: "d",
        text: "Power down transponders until the solar interference window passes",
        delta: -75,
        outcome:
          "Icebreaker convoys sail blind for 14 hours, triggering SLA penalties.",
      },
    ],
  },
  {
    id: 7,
    icon: "🗣️",
    division: "Reputation",
    title: "Deepfake Executive Audio Leak",
    story:
      "A hyper-realistic synthesized audio clip of our Chief Risk Officer discussing a fabricated sovereign debt default goes viral across financial terminals.",
    options: [
      {
        id: "a",
        text: "Broadcast a live cryptographic proof-of-reserve & executive press briefing",
        delta: 100,
        outcome:
          "Cryptographic watermarks debunk the clip in 20 minutes; market confidence rebounds.",
      },
      {
        id: "b",
        text: "Issue a standard written denial through corporate PR wires",
        delta: -25,
        outcome:
          "The dry statement fails to outpace viral algorithmic trading bots.",
      },
      {
        id: "c",
        text: "Offer a $10M bounty for attribution of the syndicate behind the fake",
        delta: 50,
        outcome:
          "Whistleblowers expose a rival fund within hours, shifting media scrutiny away from us.",
      },
      {
        id: "d",
        text: "Place the Chief Risk Officer on administrative leave pending inquiry",
        delta: -100,
        outcome:
          "Markets assume the audio was real! Bond yields spike across the curve.",
      },
    ],
  },
  {
    id: 8,
    icon: "📦",
    division: "Supply Chain",
    title: "Subsea Fiber Cable Severed",
    story:
      "Deep-sea trawlers have severed two transatlantic telemetry cables connecting our bullion clearinghouses with North American commodity exchanges.",
    options: [
      {
        id: "a",
        text: "Reroute high-frequency order flow through our low-earth orbital laser mesh",
        delta: 125,
        outcome:
          "Our proprietary orbital mesh beats terrestrial fiber latency by 4ms. Competitors are stunned.",
      },
      {
        id: "b",
        text: "Dispatch our autonomous cable-repair vessel immediately",
        delta: 25,
        outcome:
          "Repairs begin quickly, containing the disruption to minor regional desks.",
      },
      {
        id: "c",
        text: "Shift clearing operations exclusively to Singapore until repairs finish",
        delta: 0,
        outcome:
          "Asian liquidity absorbs the volume, keeping net valuation flat.",
      },
      {
        id: "d",
        text: "Halt spot bullion arbitrage desks for the remainder of the session",
        delta: -75,
        outcome:
          "We miss the most volatile and profitable trading window of the quarter.",
      },
    ],
  },
  {
    id: 9,
    icon: "🌪️",
    division: "Operations",
    title: "Category-5 Typhoon at Freeport Hub",
    story:
      "Super-Typhoon Vanguard has shifted track directly toward our South China Sea automated transshipment megaport with 36 hours warning.",
    options: [
      {
        id: "a",
        text: "Sortie all ULCC vessels to deep water and lock down automated cranes",
        delta: 100,
        outcome:
          "Zero hull losses. Our port resumes operations 48 hours ahead of regional rivals.",
      },
      {
        id: "b",
        text: "Keep skeleton crews working overtime to clear high-margin priority containers",
        delta: -125,
        outcome:
          "Two gantry cranes collapse in the eyewall; heavy insurance claims and severe backlash follow.",
      },
      {
        id: "c",
        text: "Divert incoming fleets to partner ports and absorb demurrage fees",
        delta: 25,
        outcome:
          "Supply chains remain smooth with only minor margin dilution.",
      },
      {
        id: "d",
        text: "Sell catastrophe weather derivatives to hedge physical port downtime",
        delta: 75,
        outcome:
          "The parametric hedge pays out $90M immediately as barometric pressure drops.",
      },
    ],
  },
  {
    id: 10,
    icon: "👑",
    division: "Governance",
    title: "Sovereign Wealth Succession Coup",
    story:
      "In the final minutes of the fiscal cycle, a coalition of minority sovereign wealth funds demands two board seats or threatens to dump their 14% block stake.",
    options: [
      {
        id: "a",
        text: "Trigger our Golden Share poison pill and buy out their block at a discount",
        delta: 150,
        outcome:
          "Masterstroke. Aurelia retires 14% of float accretively and cements absolute board control.",
      },
      {
        id: "b",
        text: "Grant one non-voting observer seat and a special dividend",
        delta: 50,
        outcome:
          "A pragmatic diplomatic settlement that preserves coalition stability.",
      },
      {
        id: "c",
        text: "Call their bluff in open session without defensive liquidity ready",
        delta: -100,
        outcome:
          "They dump 40 million shares onto the closing auction, denting closing valuation.",
      },
      {
        id: "d",
        text: "Swap their equity into non-voting perpetual preferred notes",
        delta: 100,
        outcome:
          "Voting dilution is eliminated while locking in cheap permanent capital.",
      },
    ],
  },
];

/**
 * Participating Teams Initial State (TeamSessionRecord Schema)
 */
export const INITIAL_TEAMS = [
  {
    teamId: "team-01",
    teamName: "Aethelgard Syndicate",
    decisions: { 0: "b", 1: "b", 2: "c" },
    manualAdjustment: 0,
    adjustmentLog: [],
    currentValuation: 100375,
    lastAnsweredWave: 2,
    updatedAt: 1731000120000,
    playstyle: "Hawkish Sovereign",
  },
  {
    teamId: "team-02",
    teamName: "Vespera Capital Group",
    decisions: { 0: "b", 1: "d", 2: "a" },
    manualAdjustment: 0,
    adjustmentLog: [],
    currentValuation: 100225,
    lastAnsweredWave: 2,
    updatedAt: 1731000095000,
    playstyle: "Tactical Arbitrage",
  },
  {
    teamId: "team-03",
    teamName: "Meridian Sovereign Partners",
    decisions: { 0: "c", 1: "b" },
    manualAdjustment: 25,
    adjustmentLog: [
      {
        amount: 25,
        reason: "Judges commendation for crisis #2 risk briefing",
        timestamp: 1730999850000,
      },
    ],
    currentValuation: 100200,
    lastAnsweredWave: 1,
    updatedAt: 1730999910000,
    playstyle: "Institutional Shield",
  },
  {
    teamId: "team-04",
    teamName: "Obsidian Vanguard",
    decisions: { 0: "a", 1: "b", 2: "a" },
    manualAdjustment: 0,
    adjustmentLog: [],
    currentValuation: 100200,
    lastAnsweredWave: 2,
    updatedAt: 1731000140000,
    playstyle: "Balanced Hedger",
  },
  {
    teamId: "team-05",
    teamName: "Solis Strategic Holdings",
    decisions: { 0: "c", 1: "d" },
    manualAdjustment: 0,
    adjustmentLog: [],
    currentValuation: 100100,
    lastAnsweredWave: 1,
    updatedAt: 1730999880000,
    playstyle: "Diplomatic Pragmatist",
  },
  {
    teamId: "team-06",
    teamName: "Hanseatic Consortium",
    decisions: { 0: "a", 1: "c", 2: "b" },
    manualAdjustment: 0,
    adjustmentLog: [],
    currentValuation: 99925,
    lastAnsweredWave: 2,
    updatedAt: 1731000110000,
    playstyle: "Defensive Liquidation",
  },
  {
    teamId: "team-07",
    teamName: "Kraken Maritime Corp",
    decisions: { 0: "d", 1: "a" },
    manualAdjustment: -25,
    adjustmentLog: [
      {
        amount: -25,
        reason: "Late oral rebuttal penalty in Wave 1",
        timestamp: 1730999550000,
      },
    ],
    currentValuation: 99850,
    lastAnsweredWave: 1,
    updatedAt: 1730999820000,
    playstyle: "High-Variance Speculator",
  },
];

// ============================================================================
// SECTION 4 & 5: FORMATTING & SYNCHRONIZATION FORMULAS
// ============================================================================

/**
 * Formats integer millions into $B (for >= 1000) or $M.
 * Example: 100000 -> "$100.00B", 100375 -> "$100.38B", 350 -> "$350M"
 */
export function formatValuation(millions, decimals = 2) {
  const num = Number(millions) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(decimals)}B`;
  }
  return `${sign}$${abs.toLocaleString()}M`;
}

/**
 * Formats exact millions with full precision for tables: e.g. "$100,375M ($100.375B)"
 */
export function formatValuationDetailed(millions) {
  const num = Number(millions) || 0;
  return `$${(num / 1000).toFixed(3)}B`;
}

/**
 * Formats option or team delta in Millions ($M).
 * Example: 100 -> "+$100M", -50 -> "−$50M", 0 -> "No change"
 */
export function formatDelta(delta, showZeroAsNumber = false) {
  const num = Number(delta) || 0;
  if (num > 0) return `+$${num.toLocaleString()}M`;
  if (num < 0) return `−$${Math.abs(num).toLocaleString()}M`;
  return showZeroAsNumber ? "$0M" : "No change";
}

/**
 * Formats seconds into MM:SS
 */
export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Formula 1: Current Wave Index (0-indexed)
 * currentIndex = min(floor(elapsed / crisisIntervalSeconds), totalCrises - 1)
 */
export function computeWaveIndex(
  elapsed,
  crisisIntervalSeconds = 360,
  totalCrises = 10
) {
  if (elapsed <= 0) return 0;
  const safeInterval = Math.max(1, Number(crisisIntervalSeconds) || 360);
  const safeTotal = Math.max(1, Number(totalCrises) || 10);
  return Math.min(Math.floor(elapsed / safeInterval), safeTotal - 1);
}

/**
 * Formula 2: Time Remaining in Active Wave (seconds)
 * windowLeft = crisisIntervalSeconds - (elapsed % crisisIntervalSeconds)
 */
export function computeWindowLeft(
  elapsed,
  crisisIntervalSeconds = 360,
  totalSeconds = 3600
) {
  if (elapsed >= totalSeconds) return 0;
  const safeInterval = Math.max(1, Number(crisisIntervalSeconds) || 360);
  return safeInterval - (Math.max(0, elapsed) % safeInterval);
}

/**
 * Formula 3: Active Wave Progress Percentage (0 to 100)
 * progress = ((elapsed % crisisIntervalSeconds) / crisisIntervalSeconds) * 100
 */
export function computeWaveProgress(
  elapsed,
  crisisIntervalSeconds = 360,
  totalSeconds = 3600
) {
  if (elapsed >= totalSeconds) return 100;
  const safeInterval = Math.max(1, Number(crisisIntervalSeconds) || 360);
  return ((Math.max(0, elapsed) % safeInterval) / safeInterval) * 100;
}

/**
 * Formula 4: Deterministic Valuation Derivation
 * Current Valuation = startingValuation + sum(delta(CRISES[i], decisions[i])) + manualAdjustment
 */
export function computeTeamValuation(
  startingValuation,
  crises,
  decisions = {},
  manualAdjustment = 0
) {
  let total = Number(startingValuation) || 100000;
  Object.entries(decisions).forEach(([waveIndexStr, optionId]) => {
    const idx = Number(waveIndexStr);
    const crisis = crises[idx];
    if (crisis && Array.isArray(crisis.options)) {
      const chosen = crisis.options.find((o) => o.id === optionId);
      if (chosen) {
        total += Number(chosen.delta) || 0;
      }
    }
  });
  total += Number(manualAdjustment) || 0;
  return total;
}

/**
 * Generates step-by-step valuation history array for SVG ValuationPath sparklines
 */
export function computeValuationHistory(
  startingValuation,
  crises,
  decisions = {},
  manualAdjustment = 0
) {
  const base = Number(startingValuation) || 100000;
  const points = [{ step: 0, valuation: base, delta: 0, optionId: null }];
  let running = base;

  crises.forEach((crisis, idx) => {
    const optId = decisions[idx];
    if (optId) {
      const opt = crisis.options.find((o) => o.id === optId);
      const d = opt ? Number(opt.delta) || 0 : 0;
      running += d;
      points.push({
        step: idx + 1,
        valuation: running,
        delta: d,
        optionId: optId,
      });
    }
  });

  if (manualAdjustment !== 0 && points.length > 0) {
    points[points.length - 1] = {
      ...points[points.length - 1],
      valuation: points[points.length - 1].valuation + Number(manualAdjustment),
    };
  }

  return points;
}

