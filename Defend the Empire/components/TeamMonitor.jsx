"use client";

import { useState , useEffect } from "react";
import { useAdminStore } from "@/data/AdminStoreContext";
import {
  formatValuation,
  formatValuationDetailed,
  formatDelta,
} from "@/data/simulationData";

function TeamSparkline({ history, baseline = 100000 }) {
  if (!history || history.length <= 1) {
    return (
      <span className="text-[10px] font-mono text-[#e8dcc6]">Baseline flat</span>
    );
  }

  const width = 120;
  const height = 32;
  const vals = history.map((h) => h.valuation);
  const minVal = Math.min(baseline - 150, ...vals);
  const maxVal = Math.max(baseline + 150, ...vals);
  const range = Math.max(1, maxVal - minVal);

  const coords = history.map((pt, i) => {
    const x =
      history.length === 1
        ? width / 2
        : (i / Math.max(1, history.length - 1)) * (width - 8) + 4;
    const y =
      height - 4 - ((pt.valuation - minVal) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const baselineY =
    height - 4 - ((baseline - minVal) / range) * (height - 8);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <line
        x1={0}
        y1={baselineY}
        x2={width}
        y2={baselineY}
        stroke="#89192c"
        strokeDasharray="2 2"
        strokeWidth="1"
      />
      <polyline
        fill="none"
        stroke="#f1ca7e"
        strokeWidth="2"
        points={coords.join(" ")}
      />
    </svg>
  );
}

export default function TeamMonitor() {
  const {
    simConfig,
    crises,
    teams,
    currentWaveIndex,
    setTeamDecision,
    simulatePendingTeamsForActiveWave,
    applyJudgeAdjustment,
    setTeamValuationDirectly,
    addTeam,
    removeTeam,
    clearAllDecisionsAndReset,
  } = useAdminStore();

  const [selectedTeamId, setSelectedTeamId] = useState(
    teams[0]?.teamId || null
  );
  const [judgeAmount, setJudgeAmount] = useState(50);
  const [judgeReason, setJudgeReason] = useState("");
  const [directValuationInput, setDirectValuationInput] = useState("");
  const [directValuationReason, setDirectValuationReason] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamStyle, setNewTeamStyle] = useState("Hawkish Sovereign");
  const [newTeamPasscode, setNewTeamPasscode] = useState("1234");

  const selectedTeam =
    teams.find((t) => t.teamId === selectedTeamId) || teams[0] || null;

  // Sync direct valuation input when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      // In Billions or Millions depending on convention (e.g. 100 for 100B or exact integer)
      const inB = (selectedTeam.currentValuation / 1000).toFixed(2);
      setDirectValuationInput(inB);
    }
  }, [selectedTeam?.teamId, selectedTeam?.currentValuation]);

  const handleDirectValuationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;
    const valNumber = parseFloat(directValuationInput);
    if (isNaN(valNumber)) return;

    // Convert to millions if entered as billions (e.g. 100 -> 100,000, 101.5 -> 101,500)
    // If entered as already > 1000, keep as is
    const targetMillions = valNumber <= 1000 ? Math.round(valNumber * 1000) : Math.round(valNumber);

    await setTeamValuationDirectly(
      selectedTeam.teamId,
      targetMillions,
      directValuationReason || `Direct valuation set to ${valNumber <= 1000 ? `$${valNumber}B` : `$${valNumber}M`}`
    );
    setDirectValuationReason("");
  };

  const handleJudgeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !judgeAmount) return;
    await applyJudgeAdjustment(
      selectedTeam.teamId,
      Number(judgeAmount),
      judgeReason || "Discretionary Judge Ruling"
    );
    setJudgeReason("");
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    await addTeam(newTeamName, newTeamStyle, newTeamPasscode);
    setNewTeamName("");
  };

  const lockedActiveCount = teams.filter((t) => t.hasLockedActiveWave).length;

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="rounded-3xl bg-[#701020] border border-[#89192c] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
         
          <h2 className="text-xl font-bold text-[#f8eee1] mt-1">
            Live Delegate Standings, Decision Matrix & Judge Overrides
          </h2>
          <p className="text-xs text-[#e8dcc6] mt-0.5">
            Active Wave #{currentWaveIndex + 1} Submissions:{" "}
            <span className="text-[#f1ca7e] font-mono font-bold">
              {lockedActiveCount} of {teams.length} teams locked in
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={simulatePendingTeamsForActiveWave}
            className="px-5 py-2.5 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#f8eee1] font-mono text-xs font-semibold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            ⚡ Auto-Fill Wave #{currentWaveIndex + 1} Locks
          </button>
          <button
            type="button"
            onClick={clearAllDecisionsAndReset}
            className="px-4 py-2.5 rounded-full bg-[#5a0d1b] text-[#e8dcc6] border border-[#89192c] hover:border-[#f1ca7e] font-mono text-xs transition-all duration-300 cursor-pointer"
          >
            ↺ Reset All Team Valuations
          </button>
        </div>
      </div>

      {/* Main Grid: Live Leaderboard & Decision Matrix (Left 8 cols) + Team Inspector & Registration (Right 4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          {/* Live Ranked Leaderboard Table (`dte_leaderboard`) */}
          <div className="rounded-3xl bg-[#5a0d1b] border border-[#89192c] overflow-hidden">
            <div className="p-6 border-b border-[#89192c] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#f8eee1]">
                  Global Sovereign Valuation Leaderboard 
                </h3>
                <p className="text-xs text-[#e8dcc6]">
                  Click any team row to inspect decisions, override wave locks, or award judge adjustments.
                </p>
              </div>
              <span className="text-xs font-mono text-[#f1ca7e]">
                Baseline: {formatValuation(simConfig.startingValuation)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#89192c] bg-[#650d1c] text-[10px] font-mono uppercase tracking-wider text-[#f1ca7e]">
                    <th className="py-3.5 px-4">Rank</th>
                    <th className="py-3.5 px-4">Delegate Team</th>
                    <th className="py-3.5 px-4">
                      Wave #{currentWaveIndex + 1} Status
                    </th>
                    <th className="py-3.5 px-4">Trajectory</th>
                    <th className="py-3.5 px-4 text-right">Net Delta</th>
                    <th className="py-3.5 px-4 text-right">Net Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89192c]/60 text-xs">
                  {teams.map((team, index) => {
                    const isSelected = selectedTeam?.teamId === team.teamId;

                    return (
                      <tr
                        key={team.teamId}
                        onClick={() => setSelectedTeamId(team.teamId)}
                        className={`transition-colors duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-[#89192c]"
                            : "hover:bg-[#701020]"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                              index === 0
                                ? "bg-[#f1ca7e] text-[#5a0d1b]"
                                : index === 1
                                ? "bg-[#f8eee1] text-[#5a0d1b]"
                                : index === 2
                                ? "bg-[#e8dcc6] text-[#5a0d1b]"
                                : "bg-[#650d1c] text-[#e8dcc6] border border-[#89192c]"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#f8eee1]">
                            {team.teamName}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            
                            {team.manualAdjustment !== 0 && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f1ca7e] text-[#5a0d1b] font-bold">
                                Judge: {formatDelta(team.manualAdjustment, true)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {team.hasLockedActiveWave ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#f1ca7e] text-[#5a0d1b] text-[11px] font-bold">
                              ✓ Option {team.activeWaveChoice.toUpperCase()}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-[#701020] text-[#e8dcc6] border border-[#89192c] text-[11px]">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <TeamSparkline
                            history={team.history}
                            baseline={simConfig.startingValuation}
                          />
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#f1ca7e]">
                          {formatDelta(team.netDelta, true)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          <div className="text-sm font-extrabold text-[#f8eee1]">
                            {formatValuation(team.currentValuation)}
                          </div>
                          <div className="text-[10px] text-[#e8dcc6]">
                            {team.currentValuation.toLocaleString()}M
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Decision Matrix across all waves */}
          <div className="rounded-3xl bg-[#5a0d1b] border border-[#89192c] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#f8eee1]">
                  Tactical Decision Matrix 
                </h3>
                <p className="text-xs text-[#e8dcc6]">
                  Real-time audit of every team&apos;s locked option (`A, B, C, D`) across all {crises.length} crisis waves.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#89192c] bg-[#650d1c] text-[10px] text-[#f1ca7e]">
                    <th className="py-2.5 px-3">Team</th>
                    {crises.map((c, idx) => (
                      <th
                        key={c.id}
                        className={`py-2.5 px-2 text-center ${
                          idx === currentWaveIndex
                            ? "bg-[#89192c] text-[#f8eee1]"
                            : ""
                        }`}
                      >
                        W{idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89192c]/60">
                  {teams.map((team) => (
                    <tr key={team.teamId} className="hover:bg-[#701020]">
                      <td className="py-2.5 px-3 font-sans font-semibold text-[#f8eee1] truncate max-w-[140px]">
                        {team.teamName}
                      </td>
                      {crises.map((c, idx) => {
                        const pick = team.decisions?.[idx];
                        return (
                          <td
                            key={c.id}
                            className={`py-2.5 px-2 text-center ${
                              idx === currentWaveIndex ? "bg-[#701020]" : ""
                            }`}
                          >
                            {pick ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f1ca7e] text-[#5a0d1b]">
                                {pick.toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-[#e8dcc6]/50">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Light Surface Inspector & Team Registration */}
        <div className="xl:col-span-4 space-y-6">
          {selectedTeam && (
            <div className="rounded-3xl bg-[#f8eee1] text-[#5a0d1b] border border-[#e8dcc6] p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-[#89192c]/15 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#701020] font-bold">
                    Selected Team 
                  </span>
                  <h3 className="text-lg font-bold text-[#5a0d1b] mt-0.5">
                    {selectedTeam.teamName}
                  </h3>
                  <p className="text-xs font-mono text-[#650d1c]">
                    ID: {selectedTeam.teamId} •{" "}
                    {formatValuationDetailed(selectedTeam.currentValuation)}
                  </p>
                </div>
                {teams.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTeam(selectedTeam.teamId)}
                    className="px-3 py-1 rounded-full bg-[#89192c] text-[#f8eee1] hover:bg-[#5a0d1b] text-xs font-mono cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Directive 2: Direct Company Valuation Editor */}
              <form
                onSubmit={handleDirectValuationSubmit}
                className="p-4 rounded-2xl bg-[#e8dcc6]/90 border border-[#89192c]/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5a0d1b] flex items-center gap-1.5">
                    🏢 Direct Company Valuation
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#701020]">
                    Current: {formatValuation(selectedTeam.currentValuation)}
                  </span>
                </div>
                <p className="text-[11px] text-[#650d1c]">
                  Directly edit the enterprise valuation (e.g. enter <strong>100</strong> for $100.00B baseline $\rightarrow$ delta 0; enter <strong>101</strong> for $101.00B $\rightarrow$ positive delta; enter <strong>99</strong> $\rightarrow$ negative delta).
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-[#701020] font-bold mb-1">
                      Valuation ($B)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={directValuationInput}
                      onChange={(e) => setDirectValuationInput(e.target.value)}
                      placeholder="e.g. 100 or 101.5"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#f8eee1] border border-[#89192c]/20 text-xs font-mono font-bold text-[#5a0d1b]"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono text-[#701020] font-bold mb-1">
                      Override Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={directValuationReason}
                      onChange={(e) => setDirectValuationReason(e.target.value)}
                      placeholder="e.g. Facilitator direct balance fix"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#f8eee1] border border-[#89192c]/20 text-xs text-[#5a0d1b]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#5a0d1b] text-[#f1ca7e] hover:bg-[#701020] hover:text-[#f8eee1] border border-[#f1ca7e]/40 font-bold text-xs font-mono transition-all duration-300 cursor-pointer shadow-sm"
                >
                  ⚡ Set Valuation Directly & Sync
                </button>
              </form>

              {/* Judge Discretionary Score Adjustment Form */}
              <form
                onSubmit={handleJudgeSubmit}
                className="p-4 rounded-2xl bg-[#e8dcc6]/60 border border-[#89192c]/15 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5a0d1b]">
                    ⚖️ Judge Valuation Adjustment
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#701020]">
                    Adj: {formatDelta(selectedTeam.manualAdjustment, true)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[100, 50, 25, -25, -50, -100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setJudgeAmount(preset)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono border cursor-pointer ${
                        judgeAmount === preset
                          ? "bg-[#701020] border-[#5a0d1b] text-[#f1ca7e] font-bold"
                          : "bg-[#f8eee1] border-[#89192c]/20 text-[#5a0d1b]"
                      }`}
                    >
                      {preset > 0 ? `+${preset}M` : `${preset}M`}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-[#701020] font-bold mb-1">
                      Delta ($M)
                    </label>
                    <input
                      type="number"
                      step="5"
                      value={judgeAmount}
                      onChange={(e) => setJudgeAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#f8eee1] border border-[#89192c]/20 text-xs font-mono text-[#5a0d1b]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono text-[#701020] font-bold mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={judgeReason}
                      onChange={(e) => setJudgeReason(e.target.value)}
                      placeholder="e.g. Board ruling bonus"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#f8eee1] border border-[#89192c]/20 text-xs text-[#5a0d1b]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#701020] text-[#f8eee1] hover:bg-[#5a0d1b] border border-[#f1ca7e]/30 font-bold text-xs font-mono transition-all duration-300 cursor-pointer"
                >
                  Apply Adjustment & Sync Leaderboard
                </button>
              </form>

              {/* Participant Wave Decision Inspector (Read-only for Admin) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5a0d1b]">
                    Selected Options by Team (All Waves)
                  </span>
                  <span className="text-[10px] font-mono text-[#701020]">
                    Read-Only Audit
                  </span>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {crises.map((c, idx) => {
                    const currentPick = selectedTeam.decisions?.[idx] || null;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/15 text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono font-bold text-[#701020] mr-1.5">
                            W{idx + 1}
                          </span>
                          <span className="text-[#5a0d1b] font-medium">{c.title}</span>
                        </div>
                        <div className="flex items-center shrink-0">
                          {currentPick ? (
                            <span
                              className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase bg-[#701020] text-[#f1ca7e] border border-[#5a0d1b] shadow-sm"
                              title={`Team locked Option ${currentPick.toUpperCase()}`}
                            >
                              Option {currentPick.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-[#650d1c]/60">
                              — Not Chosen
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

          {/* Register New Delegate Team Card */}
          <form
            onSubmit={handleCreateTeam}
            className="rounded-3xl bg-[#f8eee1] text-[#5a0d1b] border border-[#e8dcc6] p-6 space-y-3"
          >
            <h3 className="text-base font-bold text-[#5a0d1b]">
              + Add Team 
            </h3>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#701020] font-bold mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g., Solaris Sovereign Fund"
                className="w-full px-3.5 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/20 text-xs text-[#5a0d1b]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
               
                <select
                  value={newTeamStyle}
                  onChange={(e) => setNewTeamStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/20 text-xs text-[#5a0d1b]"
                >
                  <option value="Hawkish Sovereign">Hawkish Sovereign</option>
                  <option value="Tactical Arbitrage">Tactical Arbitrage</option>
                  <option value="Institutional Shield">Institutional Shield</option>
                  <option value="Balanced Hedger">Balanced Hedger</option>
                  <option value="Diplomatic Pragmatist">Diplomatic Pragmatist</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#701020] font-bold mb-1">
                  Team Passcode
                </label>
                <input
                  type="text"
                  value={newTeamPasscode}
                  onChange={(e) => setNewTeamPasscode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/20 text-xs font-mono text-[#5a0d1b]"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#701020] text-[#f8eee1] hover:bg-[#5a0d1b] border border-[#f1ca7e]/30 font-bold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Register Team in Supabase
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
