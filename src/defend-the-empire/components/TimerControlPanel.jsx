import React, { useState } from "react";
import { useAdminStore } from "../data/AdminStoreContext";
import {
  DIVISIONS,
  formatClock,
  formatDelta,
  formatValuation,
} from "../data/simulationData";
import CrisisIcon, { CRISIS_ICON_OPTIONS } from "./CrisisIcon";
import {
  Play,
  Pause,
  Square,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  Save,
  Settings,
  Edit3,
  Check,
  Plus,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

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
  } = useAdminStore();

  const [showQuickAddCrisis, setShowQuickAddCrisis] = useState(false);
  const [showCrisisDetails, setShowCrisisDetails] = useState(true);
  const [showOptionsDetails, setShowOptionsDetails] = useState(true);
  const [showCustomTimerModal, setShowCustomTimerModal] = useState(false);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(6);
  const [customTimerSeconds, setCustomTimerSeconds] = useState(0);

  const [quickTitle, setQuickTitle] = useState("");
  const [quickDivision, setQuickDivision] = useState("Maritime");
  const [quickIcon, setQuickIcon] = useState("ship");
  const [quickDuration, setQuickDuration] = useState(360);
  const [quickStory, setQuickStory] = useState("");
  const [quickOptions, setQuickOptions] = useState([
    {
      id: "a",
      text: "Execute primary defensive protocol",
      delta: 100,
      outcome: "Decisive intervention secures enterprise assets.",
    },
    {
      id: "b",
      text: "Deploy diplomatic countermeasure and hedge",
      delta: 50,
      outcome: "Modest stabilization achieved with controlled costs.",
    },
    {
      id: "c",
      text: "Hold status quo and absorb market pressure",
      delta: 0,
      outcome: "Neutral resolution; assets held without immediate gain.",
    },
    {
      id: "d",
      text: "Capitulate to adversary terms under duress",
      delta: -50,
      outcome: "Heavy concession damages sovereign enterprise equity.",
    },
  ]);

  const isRunning = activeCrisis?.status === "running";
  const selectionOpen = Boolean(activeCrisis?.selectionOpen);
  const remaining = activeCrisis?.remainingSeconds ?? 360;
  const duration = activeCrisis?.durationSeconds ?? 360;

  const filledSegments = Math.min(
    10,
    Math.max(0, Math.ceil((remaining / Math.max(1, duration)) * 10))
  );

  const lockedCount = teams.filter(
    (t) => t.decisions && t.decisions[currentWaveIndex]
  ).length;

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
        "Urgent geopolitical development impacting sovereign holdings.",
      options: quickOptions,
    });

    setShowQuickAddCrisis(false);
    setQuickTitle("");
    setQuickStory("");
  };

  const handleSetCustomTimer = async (e) => {
    e.preventDefault();
    const totalSecs =
      (parseInt(customTimerMinutes, 10) || 0) * 60 +
      (parseInt(customTimerSeconds, 10) || 0);

    if (totalSecs > 0) {
      await setActiveCrisisTimer(currentWaveIndex, totalSecs);
      setShowCustomTimerModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP COMMAND STATION & ACTIONS */}
      {/* ============================================================== */}
      <section className="editorial-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
                TACTICAL CONTROL STATION
              </span>
              <span className="editorial-badge text-[10px]">
                WAVE #{currentWaveIndex + 1} OF {crises.length || 10}
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1C1917] dark:text-[#FAFAFA]">
              Wave Timer & Option Lock Console
            </h2>
            <p className="text-xs text-[#71717A] mt-1">
              Start countdown sequences, adjust clock intervals, toggle option selecting locks, or trigger wave resets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuickAddCrisis((v) => !v)}
              className="editorial-btn editorial-btn-outline text-xs"
            >
              {showQuickAddCrisis ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Close Drawer</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add Wave</span>
                </>
              )}
            </button>

            {/* Start / Pause Round */}
            {!isRunning ? (
              <button
                type="button"
                onClick={() => startCrisisWave(currentWaveIndex)}
                className="editorial-btn editorial-btn-dark text-xs"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                <span>Start Clock</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => pauseCrisisWave(currentWaveIndex)}
                className="editorial-btn editorial-btn-outline text-xs"
              >
                <Pause className="w-3.5 h-3.5 mr-1 text-[#D97706]" />
                <span>Pause Clock</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => stopCrisisAndLockOptions(currentWaveIndex)}
              className="editorial-btn editorial-btn-outline text-xs text-[#DC2626] hover:border-[#DC2626]"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop Round</span>
            </button>

            {/* Reset Crisis Wave */}
            <button
              type="button"
              onClick={async () => {
                const confirmed = window.confirm(
                  `Reset Wave #${currentWaveIndex + 1}? This will reset its countdown timer and choices back to initial state.`
                );
                if (confirmed) {
                  await resetCrisisWave(currentWaveIndex, true);
                }
              }}
              className="editorial-btn editorial-btn-outline text-xs"
              title="Reset active wave timer & choices"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Reset Wave</span>
            </button>

            {/* Reset Entire Round */}
            <button
              type="button"
              onClick={async () => {
                const confirmed = window.confirm(
                  "Reset the entire Defend the Empire round? This will clear all wave decisions and restore team valuations back to baseline ($100B)."
                );
                if (confirmed) {
                  await resetEntireRound();
                }
              }}
              className="editorial-btn editorial-btn-outline text-xs text-[#DC2626] hover:border-[#DC2626]"
              title="Reset all waves and teams"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-[#DC2626]" />
              <span>Reset Round</span>
            </button>
          </div>
        </div>

        {/* Quick Add Crisis Drawer */}
        {showQuickAddCrisis && (
          <form
            onSubmit={handleQuickAddSubmit}
            className="p-5 rounded-lg border border-[#E5E5E5] bg-[#F4EFEB] dark:bg-[#181513] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#8D5B3A] tracking-wider">
                  DIRECT DATABASE PROVISIONING
                </span>
                <h3 className="font-serif text-base font-bold text-[#1C1917] dark:text-[#FAFAFA]">
                  Author New Crisis Scenario Wave (#{crises.length + 1})
                </h3>
              </div>
              <button
                type="submit"
                className="editorial-btn editorial-btn-dark text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>Save to Cloud</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-5">
                <label className="block font-mono text-[11px] font-bold text-[#71717A] uppercase mb-1">
                  Crisis Title
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="e.g. Sovereign Bond Liquidity Freeze"
                  className="editorial-input w-full text-xs"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block font-mono text-[11px] font-bold text-[#71717A] uppercase mb-1">
                  Division Sector
                </label>
                <select
                  value={quickDivision}
                  onChange={(e) => setQuickDivision(e.target.value)}
                  className="editorial-input w-full text-xs"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-mono text-[11px] font-bold text-[#71717A] uppercase mb-1">
                  Icon
                </label>
                <select
                  value={quickIcon}
                  onChange={(e) => setQuickIcon(e.target.value)}
                  className="editorial-input w-full text-xs"
                >
                  {CRISIS_ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-mono text-[11px] font-bold text-[#71717A] uppercase mb-1">
                  Duration (Sec)
                </label>
                <input
                  type="number"
                  min="15"
                  value={quickDuration}
                  onChange={(e) => setQuickDuration(e.target.value)}
                  className="editorial-input w-full font-mono text-xs"
                  required
                />
              </div>
              <div className="md:col-span-12">
                <label className="block font-mono text-[11px] font-bold text-[#71717A] uppercase mb-1">
                  Scenario Briefing Narrative
                </label>
                <textarea
                  rows={2}
                  value={quickStory}
                  onChange={(e) => setQuickStory(e.target.value)}
                  placeholder="Describe the urgent threat, strategic options, and executive decisions..."
                  className="editorial-input w-full text-xs leading-relaxed"
                  required
                />
              </div>
            </div>
          </form>
        )}

        {/* 3 Main Control Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Active Wave Countdown Display */}
          <div className="editorial-card p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                <span className="uppercase font-bold tracking-wider">Round Countdown</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomTimerMinutes(Math.floor(remaining / 60));
                    setCustomTimerSeconds(remaining % 60);
                    setShowCustomTimerModal((v) => !v);
                  }}
                  className="editorial-btn editorial-btn-outline text-[11px] py-1 px-2.5 font-mono"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  <span>Set Time</span>
                </button>
              </div>

              <div className="text-4xl font-mono font-bold tracking-tight text-[#1C1917] dark:text-[#FAFAFA] tabular-nums mt-2">
                {formatClock(remaining)}
              </div>

              {/* 10-step discrete progress segments */}
              <div className="grid grid-cols-10 gap-1.5 mt-4">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((seg) => (
                  <div
                    key={seg}
                    className={`h-2 rounded-sm transition-all duration-300 ${
                      seg < filledSegments
                        ? "bg-[#8D5B3A]"
                        : "bg-[#E5DFD7] dark:bg-[#2C2521]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5]">
              {showCustomTimerModal ? (
                <form onSubmit={handleSetCustomTimer} className="space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8D5B3A] block">
                    Custom Duration Input
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-[#71717A] block">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={customTimerMinutes}
                        onChange={(e) => setCustomTimerMinutes(e.target.value)}
                        className="editorial-input w-full font-mono text-xs py-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[#71717A] block">Seconds</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customTimerSeconds}
                        onChange={(e) => setCustomTimerSeconds(e.target.value)}
                        className="editorial-input w-full font-mono text-xs py-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="editorial-btn editorial-btn-dark flex-1 py-1 text-xs"
                    >
                      Apply Clock
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomTimerModal(false)}
                      className="editorial-btn editorial-btn-outline py-1 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#71717A]">Clock State:</span>
                  <span
                    className={`font-bold uppercase ${
                      isRunning ? "text-[#16A34A]" : "text-[#71717A]"
                    }`}
                  >
                    {activeCrisis?.status || "Idle"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Manual Option Selection Lock / Unlock Override */}
          <div className="editorial-card p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                <span className="uppercase font-bold tracking-wider">Option Lock State</span>
                <span
                  className={`editorial-badge text-[10px] font-bold ${
                    selectionOpen
                      ? "bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]"
                      : "bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]"
                  }`}
                >
                  {selectionOpen ? "LIVE OPEN" : "LOCKED"}
                </span>
              </div>
              <h4 className="font-serif text-sm font-bold text-[#1C1917] dark:text-[#FAFAFA] mt-2">
                {selectionOpen
                  ? "Participant Option Selecting Active"
                  : "Option Submissions Locked"}
              </h4>
              <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                Direct manual override enables immediate locking or unlocking across all teams without waiting for 00:00.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleOptionSelection(currentWaveIndex, true)}
                disabled={selectionOpen}
                className="editorial-btn editorial-btn-green flex-1 py-2 text-xs font-bold disabled:opacity-40"
              >
                <Unlock className="w-3.5 h-3.5 mr-1" />
                <span>Open Selection</span>
              </button>
              <button
                type="button"
                onClick={() => toggleOptionSelection(currentWaveIndex, false)}
                disabled={!selectionOpen}
                className="editorial-btn editorial-btn-red flex-1 py-2 text-xs font-bold disabled:opacity-40"
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                <span>Lock Selection</span>
              </button>
            </div>
          </div>

          {/* Card 3: Quick Time Adjustments & Wave Stepper */}
          <div className="editorial-card p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                <span className="uppercase font-bold tracking-wider">Time Offset Increments</span>
                <span className="font-bold text-[#8D5B3A]">
                  Wave {currentWaveIndex + 1}/{crises.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => adjustActiveCrisisTime(60)}
                  className="editorial-btn editorial-btn-outline py-1.5 text-xs font-mono"
                >
                  +1 Min
                </button>
                <button
                  type="button"
                  onClick={() => adjustActiveCrisisTime(120)}
                  className="editorial-btn editorial-btn-outline py-1.5 text-xs font-mono"
                >
                  +2 Min
                </button>
                <button
                  type="button"
                  onClick={() => adjustActiveCrisisTime(-60)}
                  className="editorial-btn editorial-btn-outline py-1.5 text-xs font-mono"
                >
                  -1 Min
                </button>
                <button
                  type="button"
                  onClick={() => adjustActiveCrisisTime(-120)}
                  className="editorial-btn editorial-btn-outline py-1.5 text-xs font-mono"
                >
                  -2 Min
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectCrisisWave(currentWaveIndex - 1)}
                disabled={currentWaveIndex <= 0}
                className="editorial-btn editorial-btn-outline flex-1 py-1.5 text-xs font-mono disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>Prev Wave</span>
              </button>
              <button
                type="button"
                onClick={() => selectCrisisWave(currentWaveIndex + 1)}
                disabled={currentWaveIndex >= crises.length - 1}
                className="editorial-btn editorial-btn-dark flex-1 py-1.5 text-xs font-mono font-bold disabled:opacity-40"
              >
                <span>Next Wave</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Wave Navigation Stepping Deck */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5 font-mono text-xs">
            <span className="uppercase tracking-wider font-bold text-[#71717A]">
              Wave Sequence Navigation
            </span>
            <span className="text-[#71717A]">
              <strong className="text-[#1C1917] dark:text-[#FAFAFA] tabular-nums">{lockedCount}</strong> of {teams.length} teams locked on Wave #{currentWaveIndex + 1}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {crises.map((crisis, idx) => {
              const isCurrent = idx === currentWaveIndex;
              const waveLocks = teams.filter((t) => t.decisions && t.decisions[idx]).length;

              return (
                <button
                  key={crisis.id || idx}
                  type="button"
                  onClick={() => selectCrisisWave(idx)}
                  className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                    isCurrent
                      ? "editorial-btn-dark shadow-sm"
                      : "editorial-card hover:border-[#8D5B3A]"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold">W{idx + 1}</span>
                    <CrisisIcon icon={crisis.icon} className="w-3.5 h-3.5 opacity-80" />
                  </div>
                  <div className="truncate font-semibold mt-1 text-[11px]">
                    {crisis.division}
                  </div>
                  <div className="text-[10px] font-mono opacity-75 mt-0.5">
                    {waveLocks}/{teams.length}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. CRISIS BRIEFING & OPTION DECISION STATION */}
      {/* ============================================================== */}
      <section className="editorial-card p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAFAFA]">
              Active Scenario Briefing & Option Station
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Review current crisis intelligence, toggle participant visibility, and track real-time locks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Visibility Toggles */}
            <button
              type="button"
              onClick={() => toggleCrisisRevealed(currentWaveIndex)}
              className={`editorial-btn text-xs font-mono font-bold ${
                activeCrisis?.isRevealed !== false
                  ? "editorial-btn-outline"
                  : "editorial-btn-outline border-[#DC2626] text-[#DC2626]"
              }`}
              title="Controls whether contestant teams can see the crisis scenario briefing"
            >
              {activeCrisis?.isRevealed !== false ? (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1 text-[#16A34A]" />
                  <span>Story: Visible</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1 text-[#DC2626]" />
                  <span>Story: Hidden</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => toggleOptionsRevealed(currentWaveIndex)}
              className={`editorial-btn text-xs font-mono font-bold ${
                activeCrisis?.optionsRevealed !== false
                  ? "editorial-btn-outline"
                  : "editorial-btn-outline border-[#DC2626] text-[#DC2626]"
              }`}
              title="Controls whether contestant teams can see the 4 tactical options"
            >
              {activeCrisis?.optionsRevealed !== false ? (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1 text-[#16A34A]" />
                  <span>Options: Visible</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1 text-[#DC2626]" />
                  <span>Options: Hidden</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowCrisisDetails((v) => !v)}
              className="editorial-btn editorial-btn-outline text-xs"
            >
              {showCrisisDetails ? "Hide Briefing" : "Show Briefing"}
            </button>

            <button
              type="button"
              onClick={() => setShowOptionsDetails((v) => !v)}
              className="editorial-btn editorial-btn-outline text-xs"
            >
              {showOptionsDetails ? "Hide Decisions" : "Show Decisions"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Active Crisis Scenario Briefing & 4 Options */}
          {activeCrisis && showCrisisDetails && (
            <div className={showOptionsDetails ? "xl:col-span-7 space-y-4" : "xl:col-span-12 space-y-4"}>
              <div className="editorial-card p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#8D5B3A] text-white flex items-center justify-center shrink-0">
                      <CrisisIcon icon={activeCrisis.icon} className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-[#71717A]">
                          Wave #{currentWaveIndex + 1} • {activeCrisis.division}
                        </span>
                        <span
                          className={`editorial-badge text-[9px] font-bold ${
                            selectionOpen
                              ? "bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]"
                              : "bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]"
                          }`}
                        >
                          {selectionOpen ? "OPEN" : "LOCKED"}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-[#1C1917] dark:text-[#FAFAFA]">
                        {activeCrisis.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate("crises")}
                    className="editorial-btn editorial-btn-outline text-xs py-1.5 px-3"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    <span>Edit in Studio</span>
                  </button>
                </div>

                <p className="text-xs text-[#71717A] leading-relaxed p-3.5 rounded-lg bg-[#F4EFEB] dark:bg-[#181513] border border-[#E5E5E5]">
                  {activeCrisis.story}
                </p>

                {/* Tactical Options 2x2 Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {activeCrisis.options.map((opt) => {
                    const chosenByTeams = teams.filter(
                      (t) => t.decisions?.[currentWaveIndex] === opt.id
                    );

                    return (
                      <div
                        key={opt.id}
                        className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] dark:bg-[#181513] space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="editorial-badge text-[10px] font-bold uppercase bg-[#8D5B3A] text-white border-[#73482C]">
                              Option {opt.id.toUpperCase()}
                            </span>
                            <span
                              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                                opt.delta > 0
                                  ? "bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]"
                                  : opt.delta < 0
                                  ? "bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]"
                                  : "bg-[#F4EFEB] text-[#71717A] border-[#E5DFD7]"
                              }`}
                            >
                              {formatDelta(opt.delta)}
                            </span>
                          </div>

                          <h5 className="font-serif text-xs font-bold text-[#1C1917] dark:text-[#FAFAFA] mt-2 leading-snug">
                            {opt.text}
                          </h5>
                          <p className="text-[11px] text-[#71717A] mt-1 leading-relaxed">
                            {opt.outcome}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-[#8D5B3A]">
                            {chosenByTeams.length} Teams Locked
                          </span>
                          {chosenByTeams.length > 0 && (
                            <span className="text-[10px] text-[#71717A] truncate max-w-[140px]">
                              {chosenByTeams.map((t) => t.teamName).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Live Team Decision Monitor */}
          {showOptionsDetails && (
            <div className={activeCrisis && showCrisisDetails ? "xl:col-span-5 space-y-3" : "xl:col-span-12 space-y-3"}>
              <div className="editorial-card p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
                      CONTESTANT TELEMETRY
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#1C1917] dark:text-[#FAFAFA]">
                      Wave #{currentWaveIndex + 1} Locks
                    </h4>
                  </div>
                  <span className="editorial-badge text-xs font-mono font-bold">
                    {lockedCount}/{teams.length} Locked
                  </span>
                </div>

                {!selectionOpen && (
                  <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs font-mono flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Option selecting is locked.</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleOptionSelection(currentWaveIndex, true)}
                      className="editorial-btn editorial-btn-dark text-[10px] py-1 px-2.5"
                    >
                      Re-Open
                    </button>
                  </div>
                )}

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {teams.map((team, idx) => {
                    const currentPick = team.decisions?.[currentWaveIndex] || null;
                    return (
                      <div
                        key={team.teamId}
                        className="p-3 rounded-lg border border-[#E5E5E5] bg-[#F4EFEB] dark:bg-[#181513] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1C1917] dark:text-[#FAFAFA] truncate">
                            {idx + 1}. {team.teamName}
                          </div>
                          <div className="font-mono text-[11px] text-[#71717A] tabular-nums">
                            {formatValuation(team.currentValuation)}
                          </div>
                        </div>

                        <div>
                          {currentPick ? (
                            <span className="editorial-badge font-mono text-xs font-bold uppercase bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5] flex items-center gap-1">
                              <span>Option {currentPick.toUpperCase()}</span>
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="editorial-badge font-mono text-[11px] text-[#71717A] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-[#E5E5E5]">
                  <button
                    type="button"
                    onClick={() => onNavigate("teams")}
                    className="editorial-btn editorial-btn-outline w-full justify-center text-xs font-semibold"
                  >
                    <span>View Full Standings & Adjust Valuations</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
