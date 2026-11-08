"use client";

import React, { useState } from "react";
import { AdminStoreProvider, useAdminStore } from "@/data/AdminStoreContext";
import AdminSidebar from "@/components/AdminSidebar";
import TimerControlPanel from "@/components/TimerControlPanel";
import CrisisManager from "@/components/CrisisManager";
import TeamMonitor from "@/components/TeamMonitor";
import { formatClock, formatValuation } from "@/data/simulationData";

function DashboardContent() {
  const [activeTab, setActiveTab] = useState("command");
  const {
    crises,
    teams,
    currentWaveIndex,
    activeCrisis,
    syncError,
    startCrisisWave,
    pauseCrisisWave,
    toggleOptionSelection,
  } = useAdminStore();

  const topTeam = teams[0] || null;
  const lockedCount = teams.filter((t) => t.hasLockedActiveWave).length;
  const isRunning = activeCrisis?.status === "running";
  const selectionOpen = Boolean(activeCrisis?.selectionOpen);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#5a0d1b] text-[#f8eee1]">
      {/* Left Navigation Sidebar - Fixed on desktop */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area - Offset by fixed sidebar width (lg:pl-72) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#650d1c] lg:pl-72">
        {/* Top Imperial War-Room Telemetry Header Bar */}
        <header className="sticky top-0 z-20 bg-[#5a0d1b]/95 backdrop-blur-md border-b border-[#89192c] px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#f1ca7e] font-bold">
                  Defend The Empire
                </span>
                <span className="text-[#89192c]">•</span>
                <span className="text-xs font-mono text-[#e8dcc6]">
                  Active Wave:{" "}
                  <strong className="text-[#f8eee1]">
                    #{currentWaveIndex + 1} of {crises.length}
                  </strong>
                </span>
              </div>
              <div className="text-xs text-[#e8dcc6] mt-0.5">
                {activeCrisis?.title || "Scenario"} • Time Remaining:{" "}
                <strong className="text-[#f1ca7e] font-mono">
                  {formatClock(activeCrisis?.remainingSeconds ?? 0)}
                </strong>{" "}
                • Option Selecting:{" "}
                <strong className="text-[#f8eee1] font-mono">
                  {selectionOpen ? "OPEN" : "STOPPED"}
                </strong>
              </div>
            </div>
          </div>

          {/* Right Quick KPI Pills & Instant Crisis / Option Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {topTeam && (
              <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#701020] border border-[#89192c] text-xs font-mono">
                <span className="text-[#e8dcc6]">Leader:</span>
                <span className="text-[#f1ca7e] font-bold">
                  {topTeam.teamName}
                </span>
                <span className="text-[#f8eee1] font-bold">
                  ({formatValuation(topTeam.currentValuation)})
                </span>
              </div>
            )}

            <div className="px-3.5 py-1.5 rounded-full bg-[#701020] border border-[#89192c] text-xs font-mono">
              <span className="text-[#e8dcc6]">Locked: </span>
              <span className="text-[#f1ca7e] font-bold">
                {lockedCount}/{teams.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => toggleOptionSelection(currentWaveIndex)}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer border ${
                selectionOpen
                  ? "bg-[#89192c] text-[#f8eee1] border-[#f1ca7e]"
                  : "bg-[#701020] text-[#e8dcc6] border-[#89192c] hover:border-[#f1ca7e]/60"
              }`}
            >
              {selectionOpen
                ? "🔒 Stop Option Selecting"
                : "🔓 Open Option Selecting"}
            </button>

            {isRunning ? (
              <button
                type="button"
                onClick={() => pauseCrisisWave(currentWaveIndex)}
                className="px-4 py-1.5 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#f8eee1] font-semibold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                ⏸ Pause Crisis
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startCrisisWave(currentWaveIndex)}
                className="px-4 py-1.5 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#f8eee1] font-semibold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                ▶ Start Crisis
              </button>
            )}
          </div>
        </header>

        {syncError && (
          <div className="mx-6 md:mx-10 mt-4 p-3 rounded-xl bg-[#701020] border border-[#f1ca7e] text-xs font-mono text-[#f8eee1]">
            Supabase Status Notice: {syncError}
          </div>
        )}

        {/* Active View Body */}
        <main className="flex-1 py-8 px-6 md:px-10 max-w-7xl w-full mx-auto">
          {activeTab === "command" && (
            <TimerControlPanel onNavigate={setActiveTab} />
          )}
          {activeTab === "crises" && <CrisisManager />}
          {activeTab === "teams" && <TeamMonitor />}
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardShell() {
  return (
    <AdminStoreProvider>
      <DashboardContent />
    </AdminStoreProvider>
  );
}
