"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/data/AdminStoreContext";
import {
  DIVISIONS,
  CRISIS_ICONS,
  formatClock,
  formatDelta,
  formatValuation,
} from "@/data/simulationData";

export default function TimerControlPanel({ onNavigate }) {
  const {
    crises,
    teams,
    currentWaveIndex,
    activeCrisis,
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
    setTeamDecision,
    simulatePendingTeamsForActiveWave,
  } = useAdminStore();

  const [showQuickAddCrisis, setShowQuickAddCrisis] = useState(false);
  const [showCrisisDetails, setShowCrisisDetails] = useState(true);
  const [showOptionsDetails, setShowOptionsDetails] = useState(true);
  const [showCustomTimerModal, setShowCustomTimerModal] = useState(false);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(6);
  const [customTimerSeconds, setCustomTimerSeconds] = useState(0);

  const [quickTitle, setQuickTitle] = useState("");
  const [quickDivision, setQuickDivision] = useState("Maritime");
  const [quickIcon, setQuickIcon] = useState("🚢");
  const [quickDuration, setQuickDuration] = useState(360);
  const [quickStory, setQuickStory] = useState("");
  const [quickOptions, setQuickOptions] = useState([
    {
      id: "a",
      text: "Execute primary defensive protocol",
      delta: 100,
      outcome: "Decisive stabilization applauded by institutional markets.",
    },
    {
      id: "b",
      text: "Negotiate bilateral settlement",
      delta: 50,
      outcome: "Contained exposure with moderate operational concessions.",
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
  ]);

  const remaining = activeCrisis?.remainingSeconds ?? 0;
  const duration = activeCrisis?.durationSeconds || 360;
  const isRunning = activeCrisis?.status === "running";
  const isCompleted = activeCrisis?.status === "completed" || remaining === 0;
  const selectionOpen = Boolean(activeCrisis?.selectionOpen);

  const lockedCount = teams.filter((t) => t.hasLockedActiveWave).length;
  const pendingCount = teams.length - lockedCount;

  // Discrete 10-segment progress bar (Zero inline styles compliant)
  const filledSegments = Math.min(
    10,
    Math.max(0, Math.round(((duration - remaining) / Math.max(1, duration)) * 10))
  );

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    await addCrisis({
      title: quickTitle.trim(),
      division: quickDivision,
      icon: quickIcon,
      durationSeconds: Number(quickDuration) || 360,
      story:
        quickStory.trim() ||
        "Urgent executive scenario requiring immediate board deliberation.",
      options: quickOptions,
    });
    setQuickTitle("");
    setQuickStory("");
    setShowQuickAddCrisis(false);
  };

  const handleQuickOptionChange = (id, field, val) => {
    setQuickOptions((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, [field]: field === "delta" ? Number(val) || 0 : val }
          : o
      )
    );
  };

  const handleSetCustomTimer = async (e) => {
    if (e) e.preventDefault();
    const totalSecs =
      Math.max(0, Number(customTimerMinutes) || 0) * 60 +
      Math.max(0, Number(customTimerSeconds) || 0);
    await setActiveCrisisTimer(totalSecs, true);
    setShowCustomTimerModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero Control Section: Crisis Timer & Option Selection Gate */}
      <section className="rounded-3xl bg-[radial-gradient(circle_at_center,#89192c_0%,#701020_45%,#5a0d1b_100%)] border border-[#89192c] p-6 md:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#89192c]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#f1ca7e] font-bold">
                Live Crisis & Option Selection Controller
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#f8eee1] mt-1">
              Wave #{currentWaveIndex + 1}: {activeCrisis?.title || "Crisis Scenario"}
            </h2>
            <p className="text-xs text-[#e8dcc6] mt-1">
              Control the crisis round timer, override option selection manually, or set exact countdown limits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowQuickAddCrisis((v) => !v)}
              className="px-4 py-2 rounded-full bg-[#89192c]/40 text-[#f8eee1] border border-[#f1ca7e]/40 hover:bg-[#89192c] font-semibold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {showQuickAddCrisis ? "✕ Close Crisis Form" : "+ Quick Add Crisis"}
            </button>

            {/* Manual Start / Stop Round Option */}
            {!isRunning ? (
              <button
                type="button"
                onClick={() => startCrisisWave(currentWaveIndex)}
                className="px-5 py-2 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#f8eee1] font-semibold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
              >
                ▶ Start Round
              </button>
            ) : (
              <button
                type="button"
                onClick={() => pauseCrisisWave(currentWaveIndex)}
                className="px-5 py-2 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#f8eee1] font-semibold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
              >
                ⏸ Pause Round
              </button>
            )}

            <button
              type="button"
              onClick={() => stopCrisisAndLockOptions(currentWaveIndex)}
              className="px-5 py-2 rounded-full bg-[#5a0d1b] text-[#f8eee1] border border-[#f1ca7e]/40 hover:bg-[#89192c] font-semibold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              ⏹ Stop Round (End Time)
            </button>

            {/* Reset Crisis Wave Button with Options */}
            <button
              type="button"
              onClick={async () => {
                const confirmed = window.confirm(
                  `Reset Wave #${currentWaveIndex + 1}? This will reset its timer back to initial and set status to idle in Supabase dte_crisis.`
                );
                if (confirmed) {
                  await resetCrisisWave(currentWaveIndex, true);
                }
              }}
              className="px-4 py-2 rounded-full bg-[#701020] text-[#f1ca7e] border border-[#f1ca7e]/40 hover:bg-[#89192c] font-semibold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Reset active wave timer & choices to initial in dte_crisis"
            >
              ↺ Reset This Wave
            </button>

            {/* Reset Entire Round Button */}
            <button
              type="button"
              onClick={async () => {
                const confirmed = window.confirm(
                  "Are you sure you want to RESET THE ENTIRE ROUND?\n\nThis will reset all 10 waves in dte_crisis to initial values, clear all team decisions, and reset all team valuations back to initial baseline ($100B) in dte_teams and dte_leaderboard.\n\n(Only 'dte_*' tables will be touched; no Investomania tables are modified.)"
                );
                if (confirmed) {
                  await resetEntireRound();
                }
              }}
              className="px-4 py-2 rounded-full bg-[#89192c] text-[#f8eee1] border border-[#f1ca7e] hover:bg-[#5a0d1b] font-bold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
              title="Reset all waves and teams to initial in dte tables"
            >
              ⚠️ Reset Entire Round
            </button>
          </div>
        </div>

        {/* Quick Add Crisis Drawer */}
        {showQuickAddCrisis && (
          <form
            onSubmit={handleQuickAddSubmit}
            className="my-6 p-6 rounded-2xl bg-[#f8eee1] text-[#5a0d1b] border border-[#e8dcc6] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#89192c]/15 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#701020] font-bold">
                  Insert directly into Supabase `dte_crisis`
                </span>
                <h3 className="text-lg font-bold text-[#5a0d1b]">
                  Add New Crisis Scenario Wave (#{crises.length + 1})
                </h3>
              </div>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#701020] text-[#f8eee1] hover:bg-[#5a0d1b] border border-[#f1ca7e]/30 font-semibold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                💾 Save New Crisis to Supabase
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label className="block text-[11px] font-mono uppercase text-[#701020] font-semibold mb-1">
                  Crisis Title
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="e.g., Sovereign Bond Liquidity Freeze"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/15 text-sm text-[#5a0d1b] focus:outline-none focus:border-[#701020]"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] font-mono uppercase text-[#701020] font-semibold mb-1">
                  Division
                </label>
                <select
                  value={quickDivision}
                  onChange={(e) => setQuickDivision(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/15 text-sm text-[#5a0d1b] focus:outline-none focus:border-[#701020]"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono uppercase text-[#701020] font-semibold mb-1">
                  Icon
                </label>
                <select
                  value={quickIcon}
                  onChange={(e) => setQuickIcon(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/15 text-sm text-[#5a0d1b] focus:outline-none focus:border-[#701020]"
                >
                  {CRISIS_ICONS.map((ico) => (
                    <option key={ico} value={ico}>
                      {ico}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono uppercase text-[#701020] font-semibold mb-1">
                  Duration (Sec)
                </label>
                <input
                  type="number"
                  min="15"
                  value={quickDuration}
                  onChange={(e) => setQuickDuration(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/15 text-sm font-mono text-[#5a0d1b] focus:outline-none focus:border-[#701020]"
                  required
                />
              </div>
              <div className="md:col-span-12">
                <label className="block text-[11px] font-mono uppercase text-[#701020] font-semibold mb-1">
                  Scenario Briefing Story
                </label>
                <textarea
                  rows={2}
                  value={quickStory}
                  onChange={(e) => setQuickStory(e.target.value)}
                  placeholder="Describe the urgent threat and executive decision required..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/15 text-sm text-[#650d1c] focus:outline-none focus:border-[#701020]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {quickOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="p-3.5 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/15 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#701020] text-[#f1ca7e] font-mono text-xs font-bold uppercase">
                      Option {opt.id.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#650d1c]">
                        Delta ($M):
                      </span>
                      <input
                        type="number"
                        step="5"
                        value={opt.delta}
                        onChange={(e) =>
                          handleQuickOptionChange(opt.id, "delta", e.target.value)
                        }
                        className="w-20 px-2 py-1 rounded-lg bg-[#f8eee1] border border-[#89192c]/20 text-xs font-mono text-[#5a0d1b]"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) =>
                      handleQuickOptionChange(opt.id, "text", e.target.value)
                    }
                    placeholder="Option action text"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#f8eee1] border border-[#89192c]/15 text-xs text-[#5a0d1b]"
                    required
                  />
                  <input
                    type="text"
                    value={opt.outcome}
                    onChange={(e) =>
                      handleQuickOptionChange(opt.id, "outcome", e.target.value)
                    }
                    placeholder="Post-lock outcome debrief"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#f8eee1] border border-[#89192c]/15 text-xs text-[#650d1c]"
                    required
                  />
                </div>
              ))}
            </div>
          </form>
        )}

        {/* 3 Core Telemetry & Manual Override Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
          {/* Card 1: Countdown Timer & Direct Custom Setting */}
          <div className="p-5 rounded-2xl bg-[#5a0d1b] border border-[#89192c] hover:border-[#f1ca7e]/60 transition-all duration-300 ease-out flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#e8dcc6]">
                <span>ROUND COUNTDOWN</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomTimerMinutes(Math.floor(remaining / 60));
                    setCustomTimerSeconds(remaining % 60);
                    setShowCustomTimerModal((v) => !v);
                  }}
                  className="px-2 py-0.5 rounded-full bg-[#701020] hover:bg-[#89192c] text-[#f1ca7e] border border-[#f1ca7e]/40 text-[10px] cursor-pointer"
                >
                  ⚙ Set Timer
                </button>
              </div>

              <div className="text-4xl font-mono font-extrabold text-[#f8eee1] mt-2">
                {formatClock(remaining)}
              </div>

              {/* 10-step discrete progress bar */}
              <div className="grid grid-cols-10 gap-1 mt-4">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((seg) => (
                  <div
                    key={seg}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      seg < filledSegments
                        ? "bg-[#f1ca7e]"
                        : "bg-[#701020] border border-[#89192c]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#89192c]">
              {showCustomTimerModal ? (
                <form
                  onSubmit={handleSetCustomTimer}
                  className="p-3 rounded-xl bg-[#701020] border border-[#f1ca7e]/40 space-y-2"
                >
                  <span className="text-[10px] font-mono uppercase text-[#f1ca7e] font-bold block">
                    Set Round Timer Duration
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-mono text-[#e8dcc6] block">
                        Minutes
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={customTimerMinutes}
                        onChange={(e) => setCustomTimerMinutes(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#5a0d1b] border border-[#89192c] text-xs font-mono text-[#f8eee1]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-[#e8dcc6] block">
                        Seconds
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customTimerSeconds}
                        onChange={(e) => setCustomTimerSeconds(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#5a0d1b] border border-[#89192c] text-xs font-mono text-[#f8eee1]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-1 px-2 rounded-full bg-[#f1ca7e] text-[#5a0d1b] font-mono text-[10px] font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomTimerModal(false)}
                      className="py-1 px-2 rounded-full bg-[#5a0d1b] text-[#e8dcc6] font-mono text-[10px] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between text-[11px] font-mono text-[#e8dcc6]">
                  <span>Status: {activeCrisis?.status?.toUpperCase() || "IDLE"}</span>
                  <span className="text-[#f1ca7e]">
                    {isCompleted ? "TIME ENDED" : `${remaining}s left`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Manual Override for Stopping / Starting Option Selection */}
          <div className="p-5 rounded-2xl bg-[#5a0d1b] border border-[#89192c] hover:border-[#f1ca7e]/60 transition-all duration-300 ease-out flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#e8dcc6]">
                <span>MANUAL OPTION OVERRIDE</span>
                <span className="px-2 py-0.5 rounded-full bg-[#701020] text-[#f1ca7e] text-[10px] font-bold">
                  {selectionOpen ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <div className="text-xl font-bold text-[#f8eee1] mt-2">
                {selectionOpen
                  ? "Option Selecting is OPEN"
                  : "Option Selecting is STOPPED"}
              </div>
              <p className="text-xs text-[#e8dcc6] mt-1">
                Manual override allows you to immediately freeze or reopen option locks at will, even before the timer reaches 00:00.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleOptionSelection(currentWaveIndex, true)}
                disabled={selectionOpen}
                className="flex-1 py-2 px-3 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#f8eee1] disabled:opacity-40 font-mono text-xs font-semibold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                🔓 Open Selection
              </button>
              <button
                type="button"
                onClick={() => toggleOptionSelection(currentWaveIndex, false)}
                disabled={!selectionOpen}
                className="flex-1 py-2 px-3 rounded-full bg-[#89192c] text-[#f8eee1] border border-[#f1ca7e]/40 hover:bg-[#701020] disabled:opacity-40 font-mono text-xs font-semibold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                🔒 Stop Selection
              </button>
            </div>
          </div>

          {/* Card 3: Quick Time Adjustments & Wave Stepper */}
          <div className="p-5 rounded-2xl bg-[#5a0d1b] border border-[#89192c] hover:border-[#f1ca7e]/60 transition-all duration-300 ease-out flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#e8dcc6]">
                <span>TIMER PRESETS & ADJUST</span>
                <span className="text-[#f1ca7e]">
                  Wave {currentWaveIndex + 1}/{crises.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => adjustActiveCrisisTime(60)}
                  className="py-1.5 px-2.5 rounded-full bg-[#701020] hover:bg-[#89192c] border border-[#89192c] text-xs font-mono text-[#f8eee1] transition-all duration-300 cursor-pointer"
                >
                  +1 Min
                </button>
                <button
                  type="button"
                  onClick={() => adjustActiveCrisisTime(120)}
                  className="py-1.5 px-2.5 rounded-full bg-[#701020] hover:bg-[#89192c] border border-[#89192c] text-xs font-mono text-[#f8eee1] transition-all duration-300 cursor-pointer"
                >
                  +2 Min
                </button>
                <button
                  type="button"
                  onClick={() => adjustActiveCrisisTime(-30)}
                  className="py-1.5 px-2.5 rounded-full bg-[#701020] hover:bg-[#89192c] border border-[#89192c] text-xs font-mono text-[#e8dcc6] transition-all duration-300 cursor-pointer"
                >
                  -30 Sec
                </button>
                <button
                  type="button"
                  onClick={() => resetCrisisWave(currentWaveIndex, true)}
                  className="py-1.5 px-2.5 rounded-full bg-[#701020] hover:bg-[#89192c] border border-[#f1ca7e]/30 text-xs font-mono text-[#f1ca7e] transition-all duration-300 cursor-pointer"
                  title="Resets timer to initial duration and clears wave decisions in dte_crisis"
                >
                  ↺ Reset Wave
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#89192c] flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectCrisisWave(currentWaveIndex - 1)}
                disabled={currentWaveIndex <= 0}
                className="flex-1 py-1.5 px-3 rounded-full bg-[#89192c]/40 text-[#f8eee1] border border-[#f1ca7e]/40 hover:bg-[#89192c] disabled:opacity-40 text-xs font-mono transition-all duration-300 cursor-pointer"
              >
                ◀ Prev Wave
              </button>
              <button
                type="button"
                onClick={() => selectCrisisWave(currentWaveIndex + 1)}
                disabled={currentWaveIndex >= crises.length - 1}
                className="flex-1 py-1.5 px-3 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#f8eee1] disabled:opacity-40 text-xs font-mono font-semibold transition-all duration-300 cursor-pointer"
              >
                Next Wave ▶
              </button>
            </div>
          </div>
        </div>

        {/* Crisis Wave Stepping Stone Track */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#f1ca7e]">
              All Crisis Waves (Click to select wave)
            </span>
            <span className="text-xs font-mono text-[#e8dcc6]">
              {lockedCount} of {teams.length} teams locked on Wave #{currentWaveIndex + 1}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
            {crises.map((crisis, idx) => {
              const isCurrent = idx === currentWaveIndex;
              const waveLocks = teams.filter(
                (t) => t.decisions && t.decisions[idx]
              ).length;

              return (
                <button
                  key={crisis.id}
                  type="button"
                  onClick={() => selectCrisisWave(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer ${
                    isCurrent
                      ? "bg-[#f1ca7e] text-[#5a0d1b] border-[#f8eee1] shadow-md"
                      : crisis.status === "completed"
                      ? "bg-[#5a0d1b] text-[#e8dcc6] border-[#89192c] hover:border-[#f1ca7e]/60"
                      : "bg-[#701020] text-[#f8eee1] border-[#89192c] hover:border-[#f1ca7e]/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold">
                      W{idx + 1}
                    </span>
                    <span className="text-base">{crisis.icon}</span>
                  </div>
                  <div className="text-[11px] font-semibold truncate mt-1">
                    {crisis.division}
                  </div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">
                    {waveLocks}/{teams.length} locked
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Light Contrast Section: Crisis & Option Selection Details with Reveal / Hide Controls */}
      <section className="rounded-3xl bg-[#f8eee1] text-[#5a0d1b] border border-[#e8dcc6] p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#89192c]/15">
          <div>
            <h3 className="text-xl font-bold text-[#5a0d1b]">
              Crisis Details & Option Selection Station
            </h3>
            <p className="text-xs text-[#650d1c] mt-0.5">
              Toggle visibility of the crisis story briefing and the live team option selection grid.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Global User-Facing Broadcast Toggles (Synced to Supabase dte_crisis) */}
            <button
              type="button"
              onClick={() => toggleCrisisRevealed(currentWaveIndex)}
              className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer border ${
                activeCrisis?.isRevealed !== false
                  ? "bg-[#701020] text-[#f1ca7e] border-[#5a0d1b] shadow-sm"
                  : "bg-[#89192c] text-[#f8eee1] border-[#f1ca7e]/60"
              }`}
              title="Controls whether user teams can see this crisis scenario briefing"
            >
              {activeCrisis?.isRevealed !== false
                ? "🌐 Crisis: VISIBLE TO USERS"
                : "🚫 Crisis: HIDDEN FROM USERS"}
            </button>

            <button
              type="button"
              onClick={() => toggleOptionsRevealed(currentWaveIndex)}
              className={`px-4 py-2 rounded-full font-mono text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer border ${
                activeCrisis?.optionsRevealed !== false
                  ? "bg-[#701020] text-[#f1ca7e] border-[#5a0d1b] shadow-sm"
                  : "bg-[#89192c] text-[#f8eee1] border-[#f1ca7e]/60"
              }`}
              title="Controls whether user teams can see the 4 tactical options"
            >
              {activeCrisis?.optionsRevealed !== false
                ? "🌐 Options: VISIBLE TO USERS"
                : "🚫 Options: HIDDEN FROM USERS"}
            </button>

            <button
              type="button"
              onClick={() => setShowCrisisDetails((v) => !v)}
              className="px-4 py-2 rounded-full bg-[#e8dcc6] hover:bg-[#701020] hover:text-[#f8eee1] text-[#5a0d1b] border border-[#89192c]/20 font-mono text-xs font-semibold transition-all duration-300 cursor-pointer"
            >
              {showCrisisDetails ? "👁 Admin: Hide Panel" : "👁 Admin: Show Panel"}
            </button>
            <button
              type="button"
              onClick={() => setShowOptionsDetails((v) => !v)}
              className="px-4 py-2 rounded-full bg-[#e8dcc6] hover:bg-[#701020] hover:text-[#f8eee1] text-[#5a0d1b] border border-[#89192c]/20 font-mono text-xs font-semibold transition-all duration-300 cursor-pointer"
            >
              {showOptionsDetails ? "👁 Admin: Hide Station" : "👁 Admin: Show Station"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column: Active Crisis Scenario Briefing & 4 Options */}
          {activeCrisis && showCrisisDetails && (
            <div className={showOptionsDetails ? "xl:col-span-7 space-y-5" : "xl:col-span-12 space-y-5"}>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#89192c]/15">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-[#701020] text-[#f1ca7e] flex items-center justify-center text-2xl">
                    {activeCrisis.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#701020] font-bold">
                        Crisis #{currentWaveIndex + 1} • {activeCrisis.division}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f1ca7e] text-[#5a0d1b]">
                        {selectionOpen ? "SELECTING OPEN" : "SELECTING STOPPED"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#5a0d1b] mt-0.5">
                      {activeCrisis.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate("crises")}
                  className="px-4 py-2 rounded-full bg-[#701020] text-[#f8eee1] hover:bg-[#5a0d1b] border border-[#f1ca7e]/30 text-xs font-mono font-semibold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  ✎ Edit Crisis in CRUD
                </button>
              </div>

              <p className="text-sm text-[#650d1c] leading-relaxed bg-[#e8dcc6]/60 p-4 rounded-2xl border border-[#89192c]/15">
                {activeCrisis.story}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCrisis.options.map((opt) => {
                  const chosenByTeams = teams.filter(
                    (t) => t.decisions?.[currentWaveIndex] === opt.id
                  );

                  return (
                    <div
                      key={opt.id}
                      className="p-4 rounded-2xl bg-[#e8dcc6]/60 border border-[#89192c]/15 hover:-translate-y-1 hover:border-[#701020] transition-all duration-300 ease-out flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-0.5 rounded-full bg-[#701020] text-[#f1ca7e] font-mono text-xs font-bold uppercase">
                            Option {opt.id.toUpperCase()}
                          </span>
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#f1ca7e] text-[#5a0d1b]">
                            {formatDelta(opt.delta)}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[#5a0d1b] mt-2.5">
                          {opt.text}
                        </p>
                        <p className="text-xs text-[#650d1c] mt-1.5">
                          Outcome: {opt.outcome}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#89192c]/15 flex items-center justify-between text-xs font-mono text-[#701020]">
                        <span>Teams Selected:</span>
                        <span className="font-bold">
                          {chosenByTeams.length} team(s)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Column: Live Team Option Selection Station */}
          {showOptionsDetails && (
            <div className={showCrisisDetails ? "xl:col-span-5 flex flex-col justify-between bg-[#e8dcc6]/60 rounded-2xl border border-[#89192c]/15 p-5" : "xl:col-span-12 flex flex-col justify-between bg-[#e8dcc6]/60 rounded-2xl border border-[#89192c]/15 p-5"}>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#89192c]/15">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#701020] font-bold">
                      Wave #{currentWaveIndex + 1} Option Selection Station
                    </span>
                    <h3 className="text-base font-bold text-[#5a0d1b]">
                      Team Locks (`dte_teams` → `dte_leaderboard`)
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#f1ca7e] text-[#5a0d1b] font-mono text-xs font-bold">
                    {lockedCount}/{teams.length} Locked
                  </span>
                </div>

                {!selectionOpen && (
                  <div className="mt-3 p-3 rounded-xl bg-[#701020] text-[#f8eee1] text-xs font-mono flex items-center justify-between gap-2">
                    <span>
                      🔒 Option selecting is currently STOPPED.
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleOptionSelection(currentWaveIndex, true)}
                      className="px-3 py-1 rounded-full bg-[#f1ca7e] text-[#5a0d1b] font-bold cursor-pointer shrink-0"
                    >
                      Re-Open Selection
                    </button>
                  </div>
                )}

                <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {teams.map((team, idx) => {
                    const currentPick = team.decisions?.[currentWaveIndex] || null;
                    return (
                      <div
                        key={team.teamId}
                        className="p-3 rounded-xl bg-[#f8eee1] border border-[#89192c]/15 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#5a0d1b] truncate">
                            {idx + 1}. {team.teamName}
                          </div>
                          <div className="text-[11px] font-mono text-[#701020]">
                            {formatValuation(team.currentValuation)}
                          </div>
                        </div>

                        {/* Read-only Participant Selection View (Admin cannot change choice) */}
                        <div className="flex items-center gap-1.5">
                          {currentPick ? (
                            <span
                              className="px-3 py-1 rounded-full font-mono text-xs font-bold uppercase bg-[#701020] text-[#f1ca7e] border border-[#5a0d1b] shadow-sm flex items-center gap-1"
                              title={`Team locked Option ${currentPick.toUpperCase()}`}
                            >
                              <span>Option {currentPick.toUpperCase()}</span>
                              <span className="text-[10px] text-[#f8eee1]">✓</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-[#e8dcc6] text-[#701020] border border-[#89192c]/20">
                              ⏳ Not Chosen
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#89192c]/15 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate("teams")}
                  className="w-full py-2.5 px-4 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#e8dcc6] text-xs font-mono font-semibold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  View Full `dte_leaderboard` & Team Standings →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
