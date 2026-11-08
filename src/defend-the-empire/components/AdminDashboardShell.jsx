import React, { useState, useEffect } from "react";
import { AdminStoreProvider, useAdminStore } from "../data/AdminStoreContext";
import AdminSidebar from "./AdminSidebar";
import TimerControlPanel from "./TimerControlPanel";
import CrisisManager from "./CrisisManager";
import TeamMonitor from "./TeamMonitor";
import { formatClock } from "../data/simulationData";
import { Lock, Unlock, Pause, Play, ArrowLeft, Sun, Moon, Shield, RefreshCw } from "lucide-react";

function DashboardContent({ onBackToHub }) {
  const [activeTab, setActiveTab] = useState("command");
  const {
    crises,
    teams,
    currentWaveIndex,
    activeCrisis,
    syncError,
    selectCrisisWave,
    startCrisisWave,
    pauseCrisisWave,
    toggleOptionSelection,
  } = useAdminStore();

  // Dual Theme Support: Dark Espresso Umber vs Minimalist Warm White
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("alphaace_admin_theme") || localStorage.getItem("admin_theme_mode") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-admin-theme", themeMode);
    document.documentElement.setAttribute("data-theme", themeMode);
    document.body.setAttribute("data-admin-theme", themeMode);
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0C0A09";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#F9F8F6";
    }
    localStorage.setItem("alphaace_admin_theme", themeMode);
    localStorage.setItem("admin_theme_mode", themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    const next = themeMode === "light" ? "dark" : "light";
    setThemeMode(next);
    localStorage.setItem("alphaace_admin_theme", next);
    localStorage.setItem("admin_theme_mode", next);
  };

  const lockedCount = teams.filter((t) => t.hasLockedActiveWave).length;
  const isRunning = activeCrisis?.status === "running";
  const selectionOpen = Boolean(activeCrisis?.selectionOpen);
  const remainingSecs = activeCrisis?.remainingSeconds ?? 360;

  return (
    <div className="min-h-screen editorial-canvas p-4 sm:p-6 lg:p-8 space-y-6 font-sans antialiased">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & TELEMETRY STRIP */}
      {/* ============================================================== */}
      <header className="editorial-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand & Module Breadcrumbs */}
        <div className="flex items-center gap-3.5">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="editorial-btn editorial-btn-outline p-2.5 shrink-0"
              title="Return to Master Admin Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-10 h-10 rounded-lg bg-[#8D5B3A] text-white flex items-center justify-center shrink-0 border border-[#73482C]">
            <Shield className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
                ALPHA ACE OPERATIONS
              </span>
              <span className="editorial-badge bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5] text-[10px]">
                CLOUD ONLINE
              </span>
            </div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917] dark:text-[#FAFAFA] tracking-tight">
              Defend the Empire Tactical Cockpit
            </h1>
          </div>
        </div>

        {/* Live Telemetry Pills & Theme Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto font-mono text-xs">
          {/* Active Wave Status Badge */}
          <div className="editorial-badge text-xs px-3 py-1.5 border border-[#E5E5E5]">
            <span className="text-[#71717A]">Wave:</span>
            <strong className="text-[#1C1917] dark:text-[#FAFAFA] font-bold">
              #{currentWaveIndex + 1}
            </strong>
          </div>

          {/* Locked Teams Count */}
          <div className="editorial-badge text-xs px-3 py-1.5 border border-[#E5E5E5]">
            <span className="text-[#71717A]">Decisions:</span>
            <strong className="text-[#1C1917] dark:text-[#FAFAFA] font-bold tabular-nums">
              {lockedCount}/{teams.length}
            </strong>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="editorial-btn editorial-btn-outline p-2 text-xs flex items-center gap-1.5"
            title={themeMode === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
          >
            {themeMode === "light" ? (
              <>
                <Moon className="w-4 h-4 text-[#71717A]" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-[#D97706]" />
                <span className="hidden sm:inline">White</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Sync Error Banner if any */}
      {syncError && (
        <div className="editorial-card p-3.5 bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B] text-xs font-mono flex items-center gap-2">
          <span className="font-bold">Sync Notice:</span>
          <span>{syncError}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. RAPID COMMAND DECK (TIMER & OPTION SELECTING CONTROLS) */}
      {/* ============================================================== */}
      <section className="editorial-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E5E5] gap-3">
          {/* Active Wave & Clock Telemetry */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="editorial-badge font-bold text-xs uppercase bg-[#8D5B3A] text-white border-[#73482C]">
              Wave {currentWaveIndex + 1}: {activeCrisis?.division || "Operations"}
            </span>

            <span className="font-mono text-xs font-semibold">
              Clock:{" "}
              <strong className="font-bold text-base tabular-nums text-[#1C1917] dark:text-[#FAFAFA]">
                {formatClock(remainingSecs)}
              </strong>
            </span>

            <span
              className={`editorial-badge text-[10px] font-bold ${
                isRunning
                  ? "bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]"
                  : "bg-[#F4EFEB] text-[#71717A] border-[#E5DFD7]"
              }`}
            >
              [{isRunning ? "RUNNING" : "PAUSED"}]
            </span>

            <span
              className={`editorial-badge text-[10px] font-bold ${
                selectionOpen
                  ? "bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]"
                  : "bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]"
              }`}
            >
              {selectionOpen ? "OPTIONS OPEN" : "OPTIONS LOCKED"}
            </span>
          </div>

          {/* Wave Quick Switcher */}
          <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto no-scrollbar py-1">
            <span className="text-[#71717A] text-[11px] uppercase mr-1 shrink-0">Wave:</span>
            {crises.map((c, idx) => (
              <button
                key={c.id || idx}
                type="button"
                onClick={() => selectCrisisWave(idx)}
                className={`editorial-btn text-xs py-1 px-2.5 shrink-0 ${
                  currentWaveIndex === idx ? "editorial-btn-dark" : "editorial-btn-outline"
                }`}
              >
                W{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Operational Action Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Start / Pause Crisis Wave */}
          {isRunning ? (
            <button
              type="button"
              onClick={() => pauseCrisisWave(currentWaveIndex)}
              className="editorial-btn editorial-btn-outline justify-center py-3 text-xs font-bold"
            >
              <Pause className="w-4 h-4 mr-1 text-[#D97706]" />
              <span>Pause Crisis Clock</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startCrisisWave(currentWaveIndex)}
              className="editorial-btn editorial-btn-dark justify-center py-3 text-xs font-bold"
            >
              <Play className="w-4 h-4 mr-1 text-white" />
              <span>Start Crisis Clock</span>
            </button>
          )}

          {/* Toggle Option Selecting (Open vs Lock) */}
          {selectionOpen ? (
            <button
              type="button"
              onClick={() => toggleOptionSelection(currentWaveIndex)}
              className="editorial-btn editorial-btn-red justify-center py-3 text-xs font-bold"
            >
              <Lock className="w-4 h-4 mr-1 text-white" />
              <span>Stop Option Selecting (Lock)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleOptionSelection(currentWaveIndex)}
              className="editorial-btn editorial-btn-green justify-center py-3 text-xs font-bold"
            >
              <Unlock className="w-4 h-4 mr-1 text-white" />
              <span>Open Option Selecting</span>
            </button>
          )}

          {/* Jump to Leaderboard / Team Monitor */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "teams" ? "command" : "teams")}
            className="editorial-btn editorial-btn-outline justify-center py-3 text-xs font-bold"
          >
            {activeTab === "teams" ? "Return to Command Deck" : `Review Teams (${lockedCount}/${teams.length})`}
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. MAIN WORKSPACE WITH SIDEBAR NAVIGATION */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 xl:col-span-2">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onBackToHub={onBackToHub} />
        </div>

        {/* Main Workdeck Panels */}
        <main className="lg:col-span-9 xl:col-span-10 min-w-0">
          {activeTab === "command" && <TimerControlPanel onNavigate={setActiveTab} />}
          {activeTab === "crises" && <CrisisManager />}
          {activeTab === "teams" && <TeamMonitor />}
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardShell({ onBackToHub }) {
  return (
    <AdminStoreProvider>
      <DashboardContent onBackToHub={onBackToHub} />
    </AdminStoreProvider>
  );
}
