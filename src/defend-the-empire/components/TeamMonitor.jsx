import React, { useState, useEffect } from "react";
import { useAdminStore } from "../data/AdminStoreContext";
import {
  formatValuation,
  formatValuationDetailed,
  formatDelta,
} from "../data/simulationData";
import {
  Zap,
  RotateCcw,
  Check,
  Clock,
  Building,
  Scale,
  Plus,
  Trash2,
  Users,
  Trophy,
} from "lucide-react";

function TeamSparkline({ history, baseline = 100000 }) {
  if (!history || history.length <= 1) {
    return (
      <span className="text-[10px] font-mono text-[#71717A]">Baseline flat</span>
    );
  }

  const width = 120;
  const height = 30;
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
        x1={4}
        y1={baselineY}
        x2={width - 4}
        y2={baselineY}
        stroke="#E5E5E5"
        strokeWidth={1}
        strokeDasharray="2,2"
      />
      <polyline
        fill="none"
        stroke="#8D5B3A"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords.join(" ")}
      />
      {coords.length > 0 && (
        <circle
          cx={coords[coords.length - 1].split(",")[0]}
          cy={coords[coords.length - 1].split(",")[1]}
          r={2.5}
          fill="#8D5B3A"
        />
      )}
    </svg>
  );
}

export default function TeamMonitor() {
  const {
    teams,
    crises,
    currentWaveIndex,
    simConfig,
    setDirectValuation,
    setJudgeAdjustment,
    simulatePendingTeamsForActiveWave,
    clearAllDecisionsAndReset,
    addTeam,
    removeTeam,
  } = useAdminStore();

  const [selectedTeamId, setSelectedTeamId] = useState(
    teams[0]?.teamId || ""
  );

  useEffect(() => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(teams[0].teamId);
    }
  }, [teams, selectedTeamId]);

  const [judgeAmount, setJudgeAmount] = useState(50);
  const [judgeReason, setJudgeReason] = useState("");

  const [directValuationInput, setDirectValuationInput] = useState("");
  const [directValuationReason, setDirectValuationReason] = useState("");

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamStyle, setNewTeamStyle] = useState("Hawkish Sovereign");
  const [newTeamPasscode, setNewTeamPasscode] = useState("EMP123");

  const selectedTeam =
    teams.find((t) => t.teamId === selectedTeamId) || teams[0] || null;

  useEffect(() => {
    if (selectedTeam) {
      const bValue = (selectedTeam.currentValuation / 1000).toFixed(2);
      setDirectValuationInput(bValue);
    }
  }, [selectedTeam?.teamId, selectedTeam?.currentValuation]);

  const handleJudgeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;
    const amt = Number(judgeAmount) || 0;
    await setJudgeAdjustment(selectedTeam.teamId, amt, judgeReason);
    setJudgeReason("");
  };

  const handleDirectValuationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;
    const bValue = parseFloat(directValuationInput);
    if (isNaN(bValue)) return;
    const valuationInMillions = Math.round(bValue * 1000);
    await setDirectValuation(
      selectedTeam.teamId,
      valuationInMillions,
      directValuationReason || "Direct facilitator balance set"
    );
    setDirectValuationReason("");
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    await addTeam({
      teamName: newTeamName.trim(),
      style: newTeamStyle,
      passcode: newTeamPasscode.trim() || "1234",
    });

    setNewTeamName("");
    setNewTeamPasscode("EMP123");
  };

  const lockedActiveCount = teams.filter((t) => t.hasLockedActiveWave).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Telemetry & Standings Actions */}
      <div className="editorial-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
              CONTESTANT ROSTER & LEADERBOARD
            </span>
            <span className="editorial-badge text-[10px]">
              {teams.length} DELEGATION DESKS
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#1C1917] dark:text-[#FAFAFA]">
            Sovereign Equity Standings & Decision Matrix
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Active Wave #{currentWaveIndex + 1} Submissions:{" "}
            <strong className="font-mono font-bold text-[#8D5B3A] tabular-nums">
              {lockedActiveCount} of {teams.length} teams locked
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={simulatePendingTeamsForActiveWave}
            className="editorial-btn editorial-btn-dark text-xs"
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            <span>Auto-Fill Wave #{currentWaveIndex + 1}</span>
          </button>
          <button
            type="button"
            onClick={clearAllDecisionsAndReset}
            className="editorial-btn editorial-btn-outline text-xs text-[#DC2626] hover:border-[#DC2626]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset Valuations</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Live Leaderboard (Left 8 cols) + Inspector / Form (Right 4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 space-y-5">
          {/* Live Ranked Leaderboard Table */}
          <div className="editorial-card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1C1917] dark:text-[#FAFAFA]">
                  Sovereign Leaderboard
                </h3>
                <p className="text-xs text-[#71717A]">
                  Click any team row to inspect decision history or adjust enterprise balance.
                </p>
              </div>
              <span className="editorial-badge font-mono text-xs">
                Baseline: {formatValuation(simConfig.startingValuation)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="editorial-table w-full text-left text-xs">
                <thead>
                  <tr>
                    <th className="w-12">Rank</th>
                    <th>Delegate Team</th>
                    <th>Wave #{currentWaveIndex + 1} Status</th>
                    <th>Trajectory</th>
                    <th className="text-right">Net Delta</th>
                    <th className="text-right">Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {teams.map((team, index) => {
                    const isSelected = selectedTeam?.teamId === team.teamId;

                    return (
                      <tr
                        key={team.teamId}
                        onClick={() => setSelectedTeamId(team.teamId)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#F4EFEB] dark:bg-[#221D1A]"
                            : ""
                        }`}
                      >
                        <td className="font-mono font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                              index === 0
                                ? "bg-[#8D5B3A] text-white"
                                : index === 1
                                ? "bg-[#D1B8A5] text-[#1C1917]"
                                : index === 2
                                ? "bg-[#E5DFD7] text-[#1C1917]"
                                : "bg-[#F4EFEB] dark:bg-[#181513] text-[#71717A] border border-[#E5E5E5]"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td>
                          <div className="font-bold text-[#1C1917] dark:text-[#FAFAFA]">
                            {team.teamName}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#71717A] font-mono">
                              {team.playstyle}
                            </span>
                            {team.manualAdjustment !== 0 && (
                              <span className="editorial-badge text-[9px] py-0 px-1 font-bold">
                                Adj: {formatDelta(team.manualAdjustment, true)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="font-mono">
                          {team.hasLockedActiveWave ? (
                            <span className="editorial-badge font-mono text-[11px] font-bold uppercase bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5] flex items-center gap-1 w-max">
                              <Check className="w-3 h-3" />
                              <span>Opt {team.activeWaveChoice.toUpperCase()}</span>
                            </span>
                          ) : (
                            <span className="editorial-badge font-mono text-[11px] text-[#71717A] flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td>
                          <TeamSparkline
                            history={team.history}
                            baseline={simConfig.startingValuation}
                          />
                        </td>
                        <td className="text-right font-mono font-bold tabular-nums">
                          <span
                            className={
                              team.netDelta > 0
                                ? "text-[#16A34A]"
                                : team.netDelta < 0
                                ? "text-[#DC2626]"
                                : "text-[#71717A]"
                            }
                          >
                            {formatDelta(team.netDelta, true)}
                          </span>
                        </td>
                        <td className="text-right font-mono tabular-nums">
                          <div className="text-xs font-bold text-[#1C1917] dark:text-[#FAFAFA]">
                            {formatValuation(team.currentValuation)}
                          </div>
                          <div className="text-[10px] text-[#71717A]">
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

          {/* Tactical Decision Matrix Across All Waves */}
          <div className="editorial-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1C1917] dark:text-[#FAFAFA]">
                  Decision Audit Matrix
                </h3>
                <p className="text-xs text-[#71717A]">
                  Overview of locked options (A, B, C, D) across all {crises.length} waves.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="editorial-table w-full text-left text-xs font-mono">
                <thead>
                  <tr>
                    <th className="py-2 px-3">Team</th>
                    {crises.map((c, idx) => (
                      <th
                        key={c.id || idx}
                        className={`py-2 px-2 text-center ${
                          idx === currentWaveIndex ? "bg-[#8D5B3A] text-white" : ""
                        }`}
                      >
                        W{idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {teams.map((team) => (
                    <tr key={team.teamId}>
                      <td className="py-2 px-3 font-sans font-semibold text-[#1C1917] dark:text-[#FAFAFA] truncate max-w-[130px]">
                        {team.teamName}
                      </td>
                      {crises.map((c, idx) => {
                        const pick = team.decisions?.[idx];
                        return (
                          <td
                            key={c.id || idx}
                            className={`py-2 px-2 text-center ${
                              idx === currentWaveIndex ? "bg-[#F4EFEB] dark:bg-[#221D1A]" : ""
                            }`}
                          >
                            {pick ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8D5B3A] text-white">
                                {pick.toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-[#71717A] opacity-40">—</span>
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

        {/* Right Column: Team Inspector & Team Registration */}
        <div className="xl:col-span-4 space-y-5">
          {selectedTeam && (
            <div className="editorial-card p-5 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-[#E5E5E5]">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
                    INSPECTION DESK
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1C1917] dark:text-[#FAFAFA] mt-0.5">
                    {selectedTeam.teamName}
                  </h3>
                  <p className="font-mono text-[11px] text-[#71717A]">
                    {formatValuationDetailed(selectedTeam.currentValuation)}
                  </p>
                </div>

                {teams.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTeam(selectedTeam.teamId)}
                    className="editorial-btn editorial-btn-outline text-[11px] py-1 px-2.5 text-[#DC2626] hover:border-[#DC2626]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {/* Direct Company Valuation Editor */}
              <form
                onSubmit={handleDirectValuationSubmit}
                className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#F4EFEB] dark:bg-[#181513] space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#8D5B3A]" />
                    <span>Direct Balance Override</span>
                  </span>
                  <span className="font-mono font-bold text-[11px] text-[#8D5B3A]">
                    {formatValuation(selectedTeam.currentValuation)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-[#71717A] mb-1">
                      Valuation ($B)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={directValuationInput}
                      onChange={(e) => setDirectValuationInput(e.target.value)}
                      placeholder="100.0"
                      className="editorial-input w-full font-mono text-xs py-1"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-mono text-[10px] font-bold text-[#71717A] mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={directValuationReason}
                      onChange={(e) => setDirectValuationReason(e.target.value)}
                      placeholder="e.g. Scrutineer adjustment"
                      className="editorial-input w-full text-xs py-1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="editorial-btn editorial-btn-dark w-full py-1.5 text-xs font-bold"
                >
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  <span>Update Balance & Sync</span>
                </button>
              </form>

              {/* Judge Discretionary Score Adjustment Form */}
              <form
                onSubmit={handleJudgeSubmit}
                className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#F4EFEB] dark:bg-[#181513] space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#8D5B3A]" />
                    <span>Judge Discretionary Delta</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#71717A]">
                    Net: {formatDelta(selectedTeam.manualAdjustment, true)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {[100, 50, 25, -25, -50, -100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setJudgeAmount(preset)}
                      className={`px-2 py-0.5 rounded border text-[10px] font-mono cursor-pointer ${
                        judgeAmount === preset
                          ? "bg-[#8D5B3A] border-[#8D5B3A] text-white font-bold"
                          : "border-[#E5E5E5] bg-[#FFFFFF] dark:bg-[#221D1A]"
                      }`}
                    >
                      {preset > 0 ? `+${preset}M` : `${preset}M`}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-[#71717A] mb-1">
                      Delta ($M)
                    </label>
                    <input
                      type="number"
                      step="5"
                      value={judgeAmount}
                      onChange={(e) => setJudgeAmount(e.target.value)}
                      className="editorial-input w-full font-mono text-xs py-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-mono text-[10px] font-bold text-[#71717A] mb-1">
                      Justification
                    </label>
                    <input
                      type="text"
                      value={judgeReason}
                      onChange={(e) => setJudgeReason(e.target.value)}
                      placeholder="e.g. Penalty or bonus"
                      className="editorial-input w-full text-xs py-1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="editorial-btn editorial-btn-outline w-full py-1.5 text-xs font-semibold"
                >
                  Apply Discretionary Delta
                </button>
              </form>

              {/* Read-Only Wave Decision Audit */}
              <div className="space-y-1.5 pt-2 border-t border-[#E5E5E5]">
                <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] block">
                  Decision History Audit
                </span>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
                  {crises.map((c, idx) => {
                    const currentPick = selectedTeam.decisions?.[idx] || null;
                    return (
                      <div
                        key={c.id || idx}
                        className="flex items-center justify-between p-2 rounded border border-[#E5E5E5] bg-[#FFFFFF] dark:bg-[#181513]"
                      >
                        <span className="font-medium truncate pr-2 text-[11px]">
                          W{idx + 1}. {c.title}
                        </span>
                        <div className="shrink-0 font-mono font-bold text-[10px]">
                          {currentPick ? (
                            <span className="editorial-badge bg-[#8D5B3A] text-white border-[#73482C]">
                              Opt {currentPick.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-[#71717A] opacity-60">Pending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Register New Delegate Team Desk Form */}
          <form
            onSubmit={handleCreateTeam}
            className="editorial-card p-5 space-y-3 text-xs"
          >
            <h3 className="font-serif text-sm font-bold text-[#1C1917] dark:text-[#FAFAFA] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#8D5B3A]" />
              <span>Register Delegation Desk</span>
            </h3>

            <div>
              <label className="block font-mono text-[10px] uppercase font-bold text-[#71717A] mb-1">
                Team Desk Name
              </label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Apex Sovereign Holdings"
                className="editorial-input w-full text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-mono text-[10px] uppercase font-bold text-[#71717A] mb-1">
                  Playstyle
                </label>
                <select
                  value={newTeamStyle}
                  onChange={(e) => setNewTeamStyle(e.target.value)}
                  className="editorial-input w-full text-xs"
                >
                  <option value="Hawkish Sovereign">Hawkish Sovereign</option>
                  <option value="Tactical Arbitrage">Tactical Arbitrage</option>
                  <option value="Institutional Shield">Institutional Shield</option>
                  <option value="Balanced Hedger">Balanced Hedger</option>
                  <option value="Diplomatic Pragmatist">Diplomatic Pragmatist</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold text-[#71717A] mb-1">
                  Passcode
                </label>
                <input
                  type="text"
                  value={newTeamPasscode}
                  onChange={(e) => setNewTeamPasscode(e.target.value)}
                  className="editorial-input w-full font-mono text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="editorial-btn editorial-btn-dark w-full py-2 text-xs font-bold"
            >
              Provision Desk to Supabase
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
