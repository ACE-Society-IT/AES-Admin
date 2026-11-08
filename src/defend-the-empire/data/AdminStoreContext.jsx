"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabaseClient";
import {
  INITIAL_SIM_CONFIG,
  INITIAL_CRISES,
  INITIAL_TEAMS,
  computeTeamValuation,
  computeValuationHistory,
} from "./simulationData";

const AdminStoreContext = createContext(null);

function normalizeCrisisRow(row, fallbackIdx = 0) {
  return {
    id: Number(row.id),
    waveOrder: Number(row.wave_order ?? row.id ?? fallbackIdx + 1),
    icon: row.icon || "zap",
    division: row.division || "Operations",
    title: row.title || `Crisis Wave #${fallbackIdx + 1}`,
    story: row.story || "",
    options: Array.isArray(row.options) ? row.options : [],
    status: row.status || "idle",
    selectionOpen: Boolean(row.selection_open),
    isRevealed: row.is_revealed !== undefined && row.is_revealed !== null ? Boolean(row.is_revealed) : true,
    optionsRevealed: row.options_revealed !== undefined && row.options_revealed !== null ? Boolean(row.options_revealed) : true,
    durationSeconds: Number(row.duration_seconds) || 360,
    remainingSeconds:
      row.remaining_seconds !== undefined && row.remaining_seconds !== null
        ? Number(row.remaining_seconds)
        : Number(row.duration_seconds) || 360,
    startedAt: row.started_at || null,
    endsAt: row.ends_at || null,
  };
}

function normalizeTeamRow(row) {
  return {
    teamId: row.id || row.teamId,
    teamName: row.team_name || row.teamName,
    passcode: row.passcode || "1234",
    playstyle: row.playstyle || "Balanced Hedger",
    startingValuation: Number(row.starting_valuation ?? 100000),
    decisions:
      row.decisions && typeof row.decisions === "object" ? row.decisions : {},
    manualAdjustment: Number(
      row.manual_adjustment ?? row.manualAdjustment ?? 0,
    ),
    adjustmentLog: Array.isArray(row.adjustment_log ?? row.adjustmentLog)
      ? (row.adjustment_log ?? row.adjustmentLog)
      : [],
    currentValuation: Number(
      row.current_valuation ?? row.currentValuation ?? 100000,
    ),
    lastAnsweredWave: Number(
      row.last_answered_wave ?? row.lastAnsweredWave ?? -1,
    ),
    updatedAt: row.updated_at || Date.now(),
  };
}

export function AdminStoreProvider({ children }) {
  const [simConfig] = useState(INITIAL_SIM_CONFIG);
  const [crises, setCrises] = useState(
    INITIAL_CRISES.map((c, i) => ({
      ...c,
      waveOrder: i + 1,
      status: i < 2 ? "completed" : i === 2 ? "running" : "idle",
      selectionOpen: i === 2,
      durationSeconds: 360,
      remainingSeconds: i < 2 ? 0 : i === 2 ? 315 : 360,
    })),
  );
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [activeWaveIndex, setActiveWaveIndex] = useState(2);
  const [isSyncing, setIsSyncing] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const crisesRef = useRef(crises);
  crisesRef.current = crises;
  const teamsRef = useRef(teams);
  teamsRef.current = teams;

  // Fetch all 3 tables from Supabase (dte_crisis, dte_teams, dte_leaderboard)
  const fetchFromSupabase = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const [crisisRes, teamsRes, lbRes] = await Promise.all([
        supabase
          .from("dte_crisis")
          .select("*")
          .order("wave_order", { ascending: true })
          .order("id", { ascending: true }),
        supabase.from("dte_teams").select("*").order("id", { ascending: true }),
        supabase
          .from("dte_leaderboard")
          .select("*")
          .order("rank", { ascending: true }),
      ]);

      if (crisisRes.error) throw crisisRes.error;
      if (teamsRes.error) throw teamsRes.error;
      if (lbRes.error) throw lbRes.error;

      if (crisisRes.data && crisisRes.data.length > 0) {
        const normalizedCrises = crisisRes.data.map((r, idx) =>
          normalizeCrisisRow(r, idx),
        );
        setCrises(normalizedCrises);
        const runningIdx = normalizedCrises.findIndex(
          (c) => c.status === "running" || c.selectionOpen,
        );
        if (runningIdx !== -1) {
          setActiveWaveIndex(runningIdx);
        }
      }

      if (teamsRes.data && teamsRes.data.length > 0) {
        setTeams(teamsRes.data.map(normalizeTeamRow));
      }

      if (lbRes.data) {
        setLeaderboardRows(lbRes.data);
      }

      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Supabase sync error:", err);
      setSyncError(err.message || "Failed to sync with Supabase");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchFromSupabase();

    const channel = supabase
      .channel("dte-portal-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dte_crisis" },
        () => fetchFromSupabase(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dte_teams" },
        () => fetchFromSupabase(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dte_leaderboard" },
        () => fetchFromSupabase(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFromSupabase]);

  // Synchronize dte_teams and dte_leaderboard in Supabase whenever team decisions or crisis deltas change
  const syncTeamsAndLeaderboardToDb = useCallback(
    async (nextTeams, currentCrises) => {
      try {
        const computed = nextTeams
          .map((team) => {
            const baseVal =
              Number(team.startingValuation) || simConfig.startingValuation;
            const val = computeTeamValuation(
              baseVal,
              currentCrises,
              team.decisions,
              team.manualAdjustment || 0,
            );
            const answeredIndices = Object.keys(team.decisions || {}).map(
              Number,
            );
            const lastWave =
              answeredIndices.length > 0 ? Math.max(...answeredIndices) : -1;
            const lastOption =
              lastWave >= 0 ? team.decisions?.[lastWave] || null : null;

            return {
              ...team,
              startingValuation: baseVal,
              currentValuation: val,
              netDelta: val - baseVal,
              crisesResolved: answeredIndices.length,
              lastAnsweredWave: lastWave,
              lastOptionLocked: lastOption,
            };
          })
          .sort((a, b) => b.currentValuation - a.currentValuation);

        const teamPayload = computed.map((t) => ({
          id: t.teamId,
          team_name: t.teamName,
          passcode: t.passcode || "1234",
          playstyle: t.playstyle || "Balanced Hedger",
          starting_valuation: t.startingValuation,
          decisions: t.decisions || {},
          manual_adjustment: t.manualAdjustment || 0,
          adjustment_log: t.adjustmentLog || [],
          current_valuation: t.currentValuation,
          last_answered_wave: t.lastAnsweredWave,
          updated_at: new Date().toISOString(),
        }));

        const leaderboardPayload = computed.map((t, index) => ({
          team_id: t.teamId,
          team_name: t.teamName,
          rank: index + 1,
          starting_valuation: t.startingValuation,
          current_valuation: t.currentValuation,
          net_delta: t.netDelta,
          crises_resolved: t.crisesResolved,
          last_option_locked: t.lastOptionLocked,
          last_answered_wave: t.lastAnsweredWave,
          manual_adjustment: t.manualAdjustment || 0,
          playstyle: t.playstyle || "Balanced Hedger",
          decisions: t.decisions || {},
          updated_at: new Date().toISOString(),
        }));

        await supabase
          .from("dte_teams")
          .upsert(teamPayload, { onConflict: "id" });
        await supabase
          .from("dte_leaderboard")
          .upsert(leaderboardPayload, { onConflict: "team_id" });

        setLeaderboardRows(leaderboardPayload);
        setLastSyncedAt(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Failed to sync teams & leaderboard to Supabase:", err);
        setSyncError(err.message);
      }
    },
    [simConfig.startingValuation],
  );

  // Active Crisis Wave
  const currentWaveIndex = useMemo(() => {
    const clamped = Math.max(
      0,
      Math.min(activeWaveIndex, Math.max(0, crises.length - 1)),
    );
    return clamped;
  }, [activeWaveIndex, crises.length]);

  const activeCrisis = useMemo(
    () => crises[currentWaveIndex] || crises[0] || null,
    [crises, currentWaveIndex],
  );

  // Live 1-second countdown timer for the active running crisis.
  // Automatically stops the crisis and locks option selection when time reaches 0!
  useEffect(() => {
    if (!activeCrisis || activeCrisis.status !== "running") return;

    const timer = setInterval(() => {
      setCrises((prev) =>
        prev.map((c, idx) => {
          if (idx !== currentWaveIndex || c.status !== "running") return c;
          const nextRem = Math.max(0, (Number(c.remainingSeconds) || 0) - 1);

          if (nextRem === 0) {
            // Time ended: automatically stop timer and lock option selecting in Supabase
            supabase
              .from("dte_crisis")
              .update({
                status: "completed",
                selection_open: false,
                remaining_seconds: 0,
                updated_at: new Date().toISOString(),
              })
              .eq("id", c.id)
              .then(() => {
                setLastSyncedAt(new Date().toLocaleTimeString());
              });

            return {
              ...c,
              status: "completed",
              selectionOpen: false,
              remainingSeconds: 0,
            };
          }

          // Persist remaining_seconds every 10 seconds to Supabase
          if (nextRem % 10 === 0) {
            supabase
              .from("dte_crisis")
              .update({
                remaining_seconds: nextRem,
                updated_at: new Date().toISOString(),
              })
              .eq("id", c.id)
              .then(() => {});
          }

          return {
            ...c,
            remainingSeconds: nextRem,
          };
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCrisis, currentWaveIndex]);

  // Enriched Teams with deterministic valuation calculation
  const enrichedTeams = useMemo(() => {
    return teams
      .map((team) => {
        const baseVal =
          Number(team.startingValuation) || simConfig.startingValuation;
        const computedVal = computeTeamValuation(
          baseVal,
          crises,
          team.decisions,
          team.manualAdjustment || 0,
        );
        const history = computeValuationHistory(
          baseVal,
          crises,
          team.decisions,
          team.manualAdjustment || 0,
        );
        const answeredIndices = Object.keys(team.decisions || {}).map(Number);
        const lastAnsweredWave =
          answeredIndices.length > 0 ? Math.max(...answeredIndices) : -1;
        const netDelta = computedVal - baseVal;
        const hasLockedActiveWave = Boolean(
          team.decisions && team.decisions[currentWaveIndex],
        );

        return {
          ...team,
          currentValuation: computedVal,
          netDelta,
          lastAnsweredWave,
          resolvedCount: answeredIndices.length,
          hasLockedActiveWave,
          activeWaveChoice: team.decisions?.[currentWaveIndex] || null,
          history,
        };
      })
      .sort((a, b) => b.currentValuation - a.currentValuation);
  }, [teams, crises, simConfig.startingValuation, currentWaveIndex]);

  // ========================================================================
  // 1. CRISIS WAVE & OPTION SELECTION CONTROLS (START / PAUSE / STOP / LOCK)
  // ========================================================================

  const selectCrisisWave = useCallback(
    (waveIndexZeroBased) => {
      const clamped = Math.max(
        0,
        Math.min(waveIndexZeroBased, Math.max(0, crises.length - 1)),
      );
      setActiveWaveIndex(clamped);
    },
    [crises.length],
  );

  const startCrisisWave = useCallback(
    async (waveIdx = currentWaveIndex) => {
      const target = crisesRef.current[waveIdx];
      if (!target) return;
      const rem =
        target.remainingSeconds > 0
          ? target.remainingSeconds
          : target.durationSeconds || 360;
      const nowIso = new Date().toISOString();
      const endsIso = new Date(Date.now() + rem * 1000).toISOString();

      setActiveWaveIndex(waveIdx);
      setCrises((prev) =>
        prev.map((c, idx) =>
          idx === waveIdx
            ? {
                ...c,
                status: "running",
                selectionOpen: true,
                remainingSeconds: rem,
                startedAt: nowIso,
                endsAt: endsIso,
              }
            : c.status === "running"
              ? { ...c, status: "paused", selectionOpen: false }
              : c,
        ),
      );

      await supabase
        .from("dte_crisis")
        .update({
          status: "paused",
          selection_open: false,
          updated_at: nowIso,
        })
        .eq("status", "running")
        .neq("id", target.id);

      await supabase
        .from("dte_crisis")
        .update({
          status: "running",
          selection_open: true,
          remaining_seconds: rem,
          started_at: nowIso,
          ends_at: endsIso,
          updated_at: nowIso,
        })
        .eq("id", target.id);

      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [currentWaveIndex],
  );

  const pauseCrisisWave = useCallback(
    async (waveIdx = currentWaveIndex) => {
      const target = crisesRef.current[waveIdx];
      if (!target) return;
      const nowIso = new Date().toISOString();

      setCrises((prev) =>
        prev.map((c, idx) =>
          idx === waveIdx ? { ...c, status: "paused" } : c,
        ),
      );

      await supabase
        .from("dte_crisis")
        .update({
          status: "paused",
          remaining_seconds: target.remainingSeconds,
          updated_at: nowIso,
        })
        .eq("id", target.id);

      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [currentWaveIndex],
  );

  const stopCrisisAndLockOptions = useCallback(
    async (waveIdx = currentWaveIndex) => {
      const target = crisesRef.current[waveIdx];
      if (!target) return;
      const nowIso = new Date().toISOString();

      setCrises((prev) =>
        prev.map((c, idx) =>
          idx === waveIdx
            ? {
                ...c,
                status: "completed",
                selectionOpen: false,
                remainingSeconds: 0,
              }
            : c,
        ),
      );

      await supabase
        .from("dte_crisis")
        .update({
          status: "completed",
          selection_open: false,
          remaining_seconds: 0,
          updated_at: nowIso,
        })
        .eq("id", target.id);

      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [currentWaveIndex],
  );

  const toggleOptionSelection = useCallback(
    async (waveIdx = currentWaveIndex, forceState = null) => {
      const target = crisesRef.current[waveIdx];
      if (!target) return;
      const nextOpen =
        forceState !== null ? Boolean(forceState) : !target.selectionOpen;
      const nowIso = new Date().toISOString();

      // If opening selection, also set status to running if it was paused
      // If closing/stopping selection, automatically pause/stop timer as well so they are in sync!
      const nextStatus = nextOpen ? "running" : "paused";

      setCrises((prev) =>
        prev.map((c, idx) =>
          idx === waveIdx
            ? { ...c, selectionOpen: nextOpen, status: nextStatus }
            : c,
        ),
      );

      await supabase
        .from("dte_crisis")
        .update({
          selection_open: nextOpen,
          status: nextStatus,
          updated_at: nowIso,
        })
        .eq("id", target.id);

      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [currentWaveIndex],
  );

  const toggleCrisisRevealed = useCallback(
    async (waveIdx = currentWaveIndex, forceState = null) => {
      const target = crisesRef.current[waveIdx];
      if (!target) return;
      const nextRevealed =
        forceState !== null ? Boolean(forceState) : !target.isRevealed;
      const nowIso = new Date().toISOString();

      setCrises((prev) =>
        prev.map((c, idx) =>
          idx === waveIdx ? { ...c, isRevealed: nextRevealed } : c,
        ),
      );

      await supabase
        .from("dte_crisis")
        .update({
          is_revealed: nextRevealed,
          updated_at: nowIso,
        })
        .eq("id", target.id);

      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [currentWaveIndex],
  );

  const toggleOptionsRevealed = useCallback(
    async (waveIdx = currentWaveIndex, forceState = null) => {
      const target = crisesRef.current[waveIdx];
      if (!target) return;
      const nextRevealed =
        forceState !== null ? Boolean(forceState) : !target.optionsRevealed;
      const nowIso = new Date().toISOString();

      setCrises((prev) =>
        prev.map((c, idx) =>
          idx === waveIdx ? { ...c, optionsRevealed: nextRevealed } : c,
        ),
      );

      await supabase
        .from("dte_crisis")
        .update({
          options_revealed: nextRevealed,
          updated_at: nowIso,
        })
        .eq("id", target.id);

      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [currentWaveIndex],
  );

  const adjustActiveCrisisTime = useCallback(
    async (deltaSeconds) => {
      const target = crisesRef.current[currentWaveIndex];
      if (!target) return;
      const nextRem = Math.max(
        0,
        (Number(target.remainingSeconds) || 0) + Number(deltaSeconds),
      );
      const nextDur = Math.max(target.durationSeconds || 360, nextRem);
      const nextStatus = nextRem === 0 ? "completed" : target.status;
      const nextSelection = nextRem === 0 ? false : target.selectionOpen;
      const nowIso = new Date().toISOString();

      setCrises((prev) =>
        prev.map((c, idx) =>
          idx === currentWaveIndex
            ? {
                ...c,
                remainingSeconds: nextRem,
                durationSeconds: nextDur,
                status: nextStatus,
                selectionOpen: nextSelection,
              }
            : c,
        ),
      );

      await supabase
        .from("dte_crisis")
        .update({
          remaining_seconds: nextRem,
          duration_seconds: nextDur,
          status: nextStatus,
          selection_open: nextSelection,
          updated_at: nowIso,
        })
        .eq("id", target.id);

      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [currentWaveIndex],
  );

  const setActiveCrisisTimer = useCallback(
    async (seconds, setAsDuration = false) => {
      const target = crisesRef.current[currentWaveIndex];
      if (!target) return;
      const safeSecs = Math.max(0, Number(seconds) || 0);
      const nextDur = setAsDuration
        ? safeSecs
        : Math.max(target.durationSeconds || 360, safeSecs);
      const nextStatus = safeSecs === 0 ? "completed" : target.status;
      const nextSelection = safeSecs === 0 ? false : target.selectionOpen;
      const nowIso = new Date().toISOString();
      const endsIso =
        target.status === "running"
          ? new Date(Date.now() + safeSecs * 1000).toISOString()
          : target.endsAt;

      setCrises((prev) =>
        prev.map((c, idx) =>
          idx === currentWaveIndex
            ? {
                ...c,
                remainingSeconds: safeSecs,
                durationSeconds: nextDur,
                status: nextStatus,
                selectionOpen: nextSelection,
                endsAt: endsIso,
              }
            : c,
        ),
      );

      await supabase
        .from("dte_crisis")
        .update({
          remaining_seconds: safeSecs,
          duration_seconds: nextDur,
          status: nextStatus,
          selection_open: nextSelection,
          ends_at: endsIso,
          updated_at: nowIso,
        })
        .eq("id", target.id);

      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [currentWaveIndex],
  );

  // Reset an individual crisis wave to its initial status and remaining duration
  // If clearWaveDecisions is true, also clears any decisions locked on this wave
  const resetCrisisWave = useCallback(
    async (waveIdx = currentWaveIndex, clearWaveDecisions = false) => {
      const target = crisesRef.current[waveIdx];
      if (!target) return;
      const dur = Number(target.durationSeconds) || 360;
      const nowIso = new Date().toISOString();

      setCrises((prev) =>
        prev.map((c, idx) =>
          idx === waveIdx
            ? {
                ...c,
                status: "idle",
                selectionOpen: false,
                remainingSeconds: dur,
              }
            : c,
        ),
      );

      // ONLY touch dte_crisis table in Supabase
      await supabase
        .from("dte_crisis")
        .update({
          status: "idle",
          selection_open: false,
          remaining_seconds: dur,
          updated_at: nowIso,
        })
        .eq("id", target.id);

      if (clearWaveDecisions) {
        const nextTeams = teamsRef.current.map((t) => {
          const nextDec = { ...(t.decisions || {}) };
          delete nextDec[waveIdx];
          return { ...t, decisions: nextDec };
        });
        setTeams(nextTeams);
        // ONLY syncs to dte_teams and dte_leaderboard
        await syncTeamsAndLeaderboardToDb(nextTeams, crisesRef.current);
      }

      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [currentWaveIndex, syncTeamsAndLeaderboardToDb],
  );

  // Global Reset Entire Round:
  // Resets all crises in dte_crisis to initial values, clears decisions & manual adjustments
  // strictly in dte_teams and dte_leaderboard. DO NOT touch any other tables!
  const resetEntireRound = useCallback(async () => {
    const nowIso = new Date().toISOString();

    // 1. Reset all crises in memory
    const resetCrisesList = crisesRef.current.map((c, idx) => {
      const dur = Number(c.durationSeconds) || 360;
      return {
        ...c,
        status: idx === 0 ? "idle" : "idle",
        selectionOpen: false,
        remainingSeconds: dur,
        isRevealed: idx === 0 ? true : false,
        optionsRevealed: idx === 0 ? true : false,
      };
    });
    setCrises(resetCrisesList);
    setActiveWaveIndex(0);

    // 2. Reset all crises strictly in dte_crisis table
    await Promise.all(
      resetCrisesList.map((c) =>
        supabase
          .from("dte_crisis")
          .update({
            status: "idle",
            selection_open: false,
            remaining_seconds: c.durationSeconds || 360,
            is_revealed: c.isRevealed,
            options_revealed: c.optionsRevealed,
            updated_at: nowIso,
          })
          .eq("id", c.id)
      )
    );

    // 3. Reset all teams to baseline strictly in dte_teams and dte_leaderboard
    const resetTeamsList = teamsRef.current.map((t) => ({
      ...t,
      decisions: {},
      manualAdjustment: 0,
      adjustmentLog: [],
      currentValuation: t.startingValuation || simConfig.startingValuation || 100000,
      lastAnsweredWave: -1,
      updatedAt: Date.now(),
    }));
    setTeams(resetTeamsList);

    await syncTeamsAndLeaderboardToDb(resetTeamsList, resetCrisesList);
    setLastSyncedAt(new Date().toLocaleTimeString());
  }, [simConfig.startingValuation, syncTeamsAndLeaderboardToDb]);

  // ========================================================================
  // 2. CRISIS SCENARIO & 4 TACTICAL OPTIONS CRUD (dte_crisis)
  // ========================================================================

  const addCrisis = useCallback(async (newCrisisData) => {
    const currentList = crisesRef.current;
    const nextOrder = currentList.length + 1;
    const maxId = currentList.reduce(
      (acc, c) => Math.max(acc, Number(c.id) || 0),
      0,
    );
    const nextId = maxId + 1;
    const dur = Number(newCrisisData.durationSeconds) || 360;

    const options =
      Array.isArray(newCrisisData.options) && newCrisisData.options.length === 4
        ? newCrisisData.options
        : [
            {
              id: "a",
              text: "Execute primary defensive protocol",
              delta: 100,
              outcome:
                "Decisive stabilization applauded by institutional markets.",
            },
            {
              id: "b",
              text: "Negotiate bilateral settlement",
              delta: 50,
              outcome:
                "Contained exposure with moderate operational concessions.",
            },
            {
              id: "c",
              text: "Maintain operational posture and absorb variance",
              delta: 0,
              outcome: "Markets hold steady pending quarterly audit.",
            },
            {
              id: "d",
              text: "Liquidate regional position immediately",
              delta: -75,
              outcome: "Heavy write-down triggers analyst downgrade.",
            },
          ];

    const payload = {
      id: nextId,
      wave_order: nextOrder,
      icon: newCrisisData.icon || "zap",
      division: newCrisisData.division || "Operations",
      title: newCrisisData.title || `Crisis Wave #${nextOrder}`,
      story:
        newCrisisData.story ||
        "Urgent executive scenario requiring immediate board deliberation.",
      options,
      status: "idle",
      selection_open: false,
      duration_seconds: dur,
      remaining_seconds: dur,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("dte_crisis")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      const normalized = normalizeCrisisRow(data, currentList.length);
      setCrises((prev) => [...prev, normalized]);
      setLastSyncedAt(new Date().toLocaleTimeString());
      return normalized;
    } else {
      console.error("Failed to insert crisis into dte_crisis:", error);
      return null;
    }
  }, []);

  const updateCrisis = useCallback(
    async (crisisId, updatedCrisis) => {
      const dur = Number(updatedCrisis.durationSeconds) || 360;
      const rem =
        updatedCrisis.remainingSeconds !== undefined
          ? Number(updatedCrisis.remainingSeconds)
          : dur;

      const nextList = crisesRef.current.map((c) =>
        c.id === crisisId
          ? {
              ...c,
              ...updatedCrisis,
              durationSeconds: dur,
              remainingSeconds: rem,
            }
          : c,
      );
      setCrises(nextList);

      await supabase
        .from("dte_crisis")
        .update({
          icon: updatedCrisis.icon,
          division: updatedCrisis.division,
          title: updatedCrisis.title,
          story: updatedCrisis.story,
          options: updatedCrisis.options,
          duration_seconds: dur,
          remaining_seconds: rem,
          selection_open: Boolean(updatedCrisis.selectionOpen),
          status: updatedCrisis.status || "idle",
          updated_at: new Date().toISOString(),
        })
        .eq("id", crisisId);

      // Recompute team valuations & leaderboard in case option deltas changed
      await syncTeamsAndLeaderboardToDb(teamsRef.current, nextList);
      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [syncTeamsAndLeaderboardToDb],
  );

  const deleteCrisis = useCallback(
    async (crisisId) => {
      if (crisesRef.current.length <= 1) return;
      const nextList = crisesRef.current
        .filter((c) => c.id !== crisisId)
        .map((c, idx) => ({ ...c, waveOrder: idx + 1 }));
      setCrises(nextList);

      await supabase.from("dte_crisis").delete().eq("id", crisisId);
      await syncTeamsAndLeaderboardToDb(teamsRef.current, nextList);
      setLastSyncedAt(new Date().toLocaleTimeString());
    },
    [syncTeamsAndLeaderboardToDb],
  );

  const reorderCrisis = useCallback(async (fromIndex, toIndex) => {
    const list = [...crisesRef.current];
    if (toIndex < 0 || toIndex >= list.length || fromIndex === toIndex) return;
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    const reindexed = list.map((c, idx) => ({ ...c, waveOrder: idx + 1 }));
    setCrises(reindexed);

    await Promise.all(
      reindexed.map((c) =>
        supabase
          .from("dte_crisis")
          .update({
            wave_order: c.waveOrder,
            updated_at: new Date().toISOString(),
          })
          .eq("id", c.id),
      ),
    );
    setLastSyncedAt(new Date().toLocaleTimeString());
  }, []);

  // ========================================================================
  // 3. TEAMS & LEADERBOARD CRUD (dte_teams & dte_leaderboard)
  // ========================================================================

  const setTeamDecision = useCallback(
    async (teamId, waveIdx, optionId, forceAdminOverride = false) => {
      const targetCrisis = crisesRef.current[waveIdx];
      if (!forceAdminOverride && targetCrisis && !targetCrisis.selectionOpen) {
        return false;
      }

      const nextTeams = teamsRef.current.map((team) => {
        if (team.teamId !== teamId) return team;
        const nextDecisions = { ...(team.decisions || {}) };
        if (optionId === null) {
          delete nextDecisions[waveIdx];
        } else {
          nextDecisions[waveIdx] = optionId;
        }
        return {
          ...team,
          decisions: nextDecisions,
          updatedAt: Date.now(),
        };
      });

      setTeams(nextTeams);
      await syncTeamsAndLeaderboardToDb(nextTeams, crisesRef.current);
      return true;
    },
    [syncTeamsAndLeaderboardToDb],
  );

  const simulatePendingTeamsForActiveWave = useCallback(async () => {
    const optionsPool = ["a", "b", "c", "d"];
    const nextTeams = teamsRef.current.map((team) => {
      if (team.decisions?.[currentWaveIndex]) return team;
      const randomPick =
        optionsPool[Math.floor(Math.random() * optionsPool.length)];
      return {
        ...team,
        decisions: {
          ...(team.decisions || {}),
          [currentWaveIndex]: randomPick,
        },
        updatedAt: Date.now(),
      };
    });

    setTeams(nextTeams);
    await syncTeamsAndLeaderboardToDb(nextTeams, crisesRef.current);
  }, [currentWaveIndex, syncTeamsAndLeaderboardToDb]);

  const setTeamValuationDirectly = useCallback(
    async (teamId, targetValuationMillions, reason = "Direct Valuation Override") => {
      const targetVal = Number(targetValuationMillions);
      if (isNaN(targetVal)) return;

      const nextTeams = teamsRef.current.map((team) => {
        if (team.teamId !== teamId) return team;

        // Current valuation before manual adjustment = startingValuation + sum(deltas)
        const computedBeforeManual = computeTeamValuation(
          team.startingValuation || simConfig.startingValuation,
          crisesRef.current,
          team.decisions || {},
          0
        );

        // Required adjustment = targetValuation - computedBeforeManual
        const requiredAdjustment = targetVal - computedBeforeManual;

        const nextLog = [
          {
            amount: requiredAdjustment,
            targetValuation: targetVal,
            reason: reason || "Direct Valuation Override",
            timestamp: Date.now(),
          },
          ...(team.adjustmentLog || []),
        ];

        return {
          ...team,
          manualAdjustment: requiredAdjustment,
          adjustmentLog: nextLog,
          updatedAt: Date.now(),
        };
      });

      setTeams(nextTeams);
      await syncTeamsAndLeaderboardToDb(nextTeams, crisesRef.current);
    },
    [simConfig.startingValuation, syncTeamsAndLeaderboardToDb]
  );

  const applyJudgeAdjustment = useCallback(
    async (teamId, deltaMillions, reason) => {
      const amount = Number(deltaMillions) || 0;
      if (amount === 0) return;

      const nextTeams = teamsRef.current.map((team) => {
        if (team.teamId !== teamId) return team;
        const nextAdj = (Number(team.manualAdjustment) || 0) + amount;
        const nextLog = [
          {
            amount,
            reason: reason || "Discretionary Judge Ruling",
            timestamp: Date.now(),
          },
          ...(team.adjustmentLog || []),
        ];
        return {
          ...team,
          manualAdjustment: nextAdj,
          adjustmentLog: nextLog,
          updatedAt: Date.now(),
        };
      });

      setTeams(nextTeams);
      await syncTeamsAndLeaderboardToDb(nextTeams, crisesRef.current);
    },
    [syncTeamsAndLeaderboardToDb],
  );

  const addTeam = useCallback(
    async (teamName, playstyle = "Balanced Hedger", passcode = "1234") => {
      const cleanName = teamName.trim();
      if (!cleanName) return;
      const nextNum = teamsRef.current.length + 1;
      const newTeam = {
        teamId: `team-${String(nextNum).padStart(2, "0")}-${Math.random()
          .toString(36)
          .slice(2, 5)}`,
        teamName: cleanName,
        passcode: passcode || "1234",
        playstyle,
        startingValuation: simConfig.startingValuation,
        decisions: {},
        manualAdjustment: 0,
        adjustmentLog: [],
        currentValuation: simConfig.startingValuation,
        lastAnsweredWave: -1,
        updatedAt: Date.now(),
      };

      const nextTeams = [...teamsRef.current, newTeam];
      setTeams(nextTeams);
      await syncTeamsAndLeaderboardToDb(nextTeams, crisesRef.current);
    },
    [simConfig.startingValuation, syncTeamsAndLeaderboardToDb],
  );

  const removeTeam = useCallback(
    async (teamId) => {
      const nextTeams = teamsRef.current.filter((t) => t.teamId !== teamId);
      setTeams(nextTeams);
      await supabase.from("dte_teams").delete().eq("id", teamId);
      await supabase.from("dte_leaderboard").delete().eq("team_id", teamId);
      await syncTeamsAndLeaderboardToDb(nextTeams, crisesRef.current);
    },
    [syncTeamsAndLeaderboardToDb],
  );

  const clearAllDecisionsAndReset = useCallback(async () => {
    const nextTeams = teamsRef.current.map((t) => ({
      ...t,
      decisions: {},
      manualAdjustment: 0,
      adjustmentLog: [],
      currentValuation: simConfig.startingValuation,
      lastAnsweredWave: -1,
      updatedAt: Date.now(),
    }));
    setTeams(nextTeams);
    await syncTeamsAndLeaderboardToDb(nextTeams, crisesRef.current);
  }, [simConfig.startingValuation, syncTeamsAndLeaderboardToDb]);

  const value = useMemo(
    () => ({
      simConfig,
      crises,
      teams: enrichedTeams,
      leaderboardRows,
      currentWaveIndex,
      activeCrisis,
      isSyncing,
      lastSyncedAt,
      syncError,
      // Actions
      fetchFromSupabase,
      selectCrisisWave,
      startCrisisWave,
      pauseCrisisWave,
      stopCrisisAndLockOptions,
      toggleOptionSelection,
      toggleCrisisRevealed,
      toggleOptionsRevealed,
      adjustActiveCrisisTime,
      setActiveCrisisTimer,
      resetCrisisWave,
      resetEntireRound,
      addCrisis,
      updateCrisis,
      deleteCrisis,
      reorderCrisis,
      setTeamDecision,
      simulatePendingTeamsForActiveWave,
      applyJudgeAdjustment,
      setTeamValuationDirectly,
      addTeam,
      removeTeam,
      clearAllDecisionsAndReset,
    }),
    [
      simConfig,
      crises,
      enrichedTeams,
      leaderboardRows,
      currentWaveIndex,
      activeCrisis,
      isSyncing,
      lastSyncedAt,
      syncError,
      fetchFromSupabase,
      selectCrisisWave,
      startCrisisWave,
      pauseCrisisWave,
      stopCrisisAndLockOptions,
      toggleOptionSelection,
      toggleCrisisRevealed,
      toggleOptionsRevealed,
      adjustActiveCrisisTime,
      setActiveCrisisTimer,
      resetCrisisWave,
      resetEntireRound,
      addCrisis,
      updateCrisis,
      deleteCrisis,
      reorderCrisis,
      setTeamDecision,
      simulatePendingTeamsForActiveWave,
      applyJudgeAdjustment,
      setTeamValuationDirectly,
      addTeam,
      removeTeam,
      clearAllDecisionsAndReset,
    ],
  );

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) {
    throw new Error("useAdminStore must be used inside AdminStoreProvider");
  }
  return ctx;
}
