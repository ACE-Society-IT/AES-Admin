"use client";

import React, { useState, useEffect } from "react";
import { useAdminStore } from "@/data/AdminStoreContext";
import {
  DIVISIONS,
  CRISIS_ICONS,
  formatDelta,
  formatClock,
} from "@/data/simulationData";

const DELTA_PRESETS = [150, 125, 100, 75, 50, 25, 0, -25, -50, -75, -100, -125];

export default function CrisisManager() {
  const {
    crises,
    currentWaveIndex,
    updateCrisis,
    addCrisis,
    deleteCrisis,
    reorderCrisis,
    startCrisisWave,
    stopCrisisAndLockOptions,
    toggleOptionSelection,
  } = useAdminStore();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draft, setDraft] = useState(null);
  const [saveBanner, setSaveBanner] = useState(false);

  const selectedCrisis = crises[selectedIndex] || crises[0];

  useEffect(() => {
    if (selectedCrisis) {
      setDraft(JSON.parse(JSON.stringify(selectedCrisis)));
    }
  }, [selectedCrisis]);

  if (!draft) return null;

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setSaveBanner(false);
  };

  const handleOptionChange = (optionId, field, value) => {
    setDraft((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              [field]: field === "delta" ? Number(value) || 0 : value,
            }
          : opt,
      ),
    }));
    setSaveBanner(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    await updateCrisis(draft.id, draft);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  const handleCreateWave = async () => {
    const newIndex = crises.length;
    const created = await addCrisis({
      icon: "⚡",
      division: "Operations",
      title: `Emergency Sovereign Directive #${newIndex + 1}`,
      durationSeconds: 360,
      story:
        "Intelligence desks report an acute geopolitical shock requiring an immediate executive board vote before the countdown window closes.",
    });
    if (created) {
      setSelectedIndex(newIndex);
    }
  };

  const handleDeleteCurrent = async () => {
    if (crises.length <= 1) return;
    const idToRemove = selectedCrisis.id;
    await deleteCrisis(idToRemove);
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  };

  const handleMove = async (direction) => {
    const targetIdx = selectedIndex + direction;
    if (targetIdx < 0 || targetIdx >= crises.length) return;
    await reorderCrisis(selectedIndex, targetIdx);
    setSelectedIndex(targetIdx);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#701020] border border-[#89192c] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
         
          <h2 className="text-xl font-bold text-[#f8eee1] mt-1">
            Crisis Management Section
          </h2>
          
        </div>

        <button
          type="button"
          onClick={handleCreateWave}
          className="px-6 py-2.5 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#f8eee1] font-semibold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
        >
          + Add New Crisis
        </button>
      </div>

      {/* Main Grid: Wave Sequence List (Left 4 cols) + Crisis & Options Editor (Right 8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Crisis Waves Sequence */}
        <div className="xl:col-span-4 rounded-3xl bg-[#5a0d1b] border border-[#89192c] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-[#89192c]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#f1ca7e] font-bold">
               Crisis available ({crises.length})
              </span>
              <span className="text-[11px] font-mono text-[#e8dcc6]">
                ▲/▼ Reorder
              </span>
            </div>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {crises.map((c, idx) => {
                const isSelected = idx === selectedIndex;
                const isLive = idx === currentWaveIndex;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 ease-out cursor-pointer ${
                      isSelected
                        ? "bg-[#701020] border-[#f1ca7e] shadow-md"
                        : "bg-[#650d1c] border-[#89192c] hover:border-[#f1ca7e]/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{c.icon}</span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-mono font-bold text-[#f1ca7e]">
                              WAVE #{idx + 1}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#5a0d1b] text-[#e8dcc6] border border-[#89192c]">
                              {c.division}
                            </span>
                            {isLive && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#f1ca7e] text-[#5a0d1b] font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-[#f8eee1] truncate mt-1">
                            {c.title}
                          </h4>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (idx > 0) {
                              reorderCrisis(idx, idx - 1);
                              if (selectedIndex === idx)
                                setSelectedIndex(idx - 1);
                            }
                          }}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-[#5a0d1b] hover:bg-[#89192c] disabled:opacity-30 text-[#f8eee1] border border-[#89192c] text-[10px] cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (idx < crises.length - 1) {
                              reorderCrisis(idx, idx + 1);
                              if (selectedIndex === idx)
                                setSelectedIndex(idx + 1);
                            }
                          }}
                          disabled={idx === crises.length - 1}
                          className="p-1.5 rounded-lg bg-[#5a0d1b] hover:bg-[#89192c] disabled:opacity-30 text-[#f8eee1] border border-[#89192c] text-[10px] cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#89192c] flex items-center justify-between text-[10px] font-mono text-[#e8dcc6]">
                      <span>
                        Timer: {formatClock(c.remainingSeconds)} /{" "}
                        {formatClock(c.durationSeconds)}
                      </span>
                      <span className="text-[#f1ca7e]">
                        {c.selectionOpen ? "🔓 Selecting Open" : "🔒 Locked"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Crisis & 4 Options Form on Light Surface */}
        <form
          onSubmit={handleSave}
          className="xl:col-span-8 rounded-3xl bg-[#f8eee1] text-[#5a0d1b] border border-[#e8dcc6] p-6 md:p-8 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#89192c]/15">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-[#701020] text-[#f1ca7e] flex items-center justify-center text-2xl">
                {draft.icon}
              </span>
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#701020]">
                  Editing  ID #{draft.id} (Wave #{selectedIndex + 1}
                  )
                </span>
                <h3 className="text-xl font-bold text-[#5a0d1b] mt-0.5">
                  {draft.title || "Untitled Crisis"}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => startCrisisWave(selectedIndex)}
                className="px-4 py-2 rounded-full bg-[#f1ca7e] text-[#5a0d1b] hover:bg-[#e8dcc6] font-mono text-xs font-bold transition-all duration-300 cursor-pointer"
              >
                ▶ Start Wave Now
              </button>
              <button
                type="button"
                onClick={() => toggleOptionSelection(selectedIndex)}
                className="px-4 py-2 rounded-full bg-[#e8dcc6] text-[#5a0d1b] hover:bg-[#f1ca7e] border border-[#89192c]/20 font-mono text-xs font-semibold transition-all duration-300 cursor-pointer"
              >
                {selectedCrisis?.selectionOpen
                  ? "🔒 Lock Options"
                  : "🔓 Open Options"}
              </button>
              <button
                type="button"
                onClick={() => stopCrisisAndLockOptions(selectedIndex)}
                className="px-4 py-2 rounded-full bg-[#e8dcc6] text-[#701020] hover:bg-[#89192c] hover:text-[#f8eee1] border border-[#89192c]/20 font-mono text-xs font-semibold transition-all duration-300 cursor-pointer"
              >
                ⏹ End Time
              </button>
              {crises.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteCurrent}
                  className="px-3.5 py-2 rounded-full bg-[#89192c] text-[#f8eee1] hover:bg-[#5a0d1b] font-mono text-xs cursor-pointer"
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#701020] text-[#f8eee1] hover:bg-[#5a0d1b] border border-[#f1ca7e]/30 font-bold text-xs font-mono transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
              >
                💾 Save to Supabase
              </button>
            </div>
          </div>

          {saveBanner && (
            <div className="p-3.5 rounded-2xl bg-[#701020] text-[#f1ca7e] border border-[#f1ca7e] text-xs font-mono font-semibold">
              Saved
            </div>
          )}

          {/* Crisis Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className="block text-[11px] font-mono uppercase text-[#701020] font-bold mb-1">
                Crisis Headline Title
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/20 focus:border-[#701020] focus:outline-none text-sm text-[#5a0d1b] font-semibold"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase text-[#701020] font-bold mb-1">
                Division
              </label>
              <select
                value={draft.division}
                onChange={(e) => handleFieldChange("division", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/20 focus:border-[#701020] focus:outline-none text-sm text-[#5a0d1b]"
              >
                {DIVISIONS.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase text-[#701020] font-bold mb-1">
                Icon
              </label>
              <select
                value={draft.icon}
                onChange={(e) => handleFieldChange("icon", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/20 focus:border-[#701020] focus:outline-none text-base text-[#5a0d1b]"
              >
                {CRISIS_ICONS.map((ico) => (
                  <option key={ico} value={ico}>
                    {ico}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase text-[#701020] font-bold mb-1">
                Timer (Sec)
              </label>
              <input
                type="number"
                min="10"
                value={draft.durationSeconds || 360}
                onChange={(e) =>
                  handleFieldChange(
                    "durationSeconds",
                    Number(e.target.value) || 360,
                  )
                }
                className="w-full px-3 py-2 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/20 focus:border-[#701020] focus:outline-none text-sm font-mono text-[#5a0d1b]"
                required
              />
            </div>

            <div className="md:col-span-12">
              <label className="block text-[11px] font-mono uppercase text-[#701020] font-bold mb-1">
                Scenario Story Briefing
              </label>
              <textarea
                rows={3}
                value={draft.story}
                onChange={(e) => handleFieldChange("story", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#e8dcc6]/60 border border-[#89192c]/20 focus:border-[#701020] focus:outline-none text-sm text-[#650d1c] leading-relaxed"
                required
              />
            </div>
          </div>

          {/* 4 Tactical Options (A, B, C, D) CRUD Grid */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-base font-bold text-[#5a0d1b]">
                  4 Tactical Options Configuration (A, B, C, D)
                </h4>
                <p className="text-xs text-[#650d1c]">
                  Configure action text, valuation delta ($ Millions), and
                  outcome narrative for each option.
                </p>
              </div>
              <span className="text-xs font-mono text-[#5a0d1b] bg-[#f1ca7e] px-3 py-1 rounded-full font-bold">
                Unit: $ Millions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draft.options.map((opt) => (
                <div
                  key={opt.id}
                  className="p-4 rounded-2xl border border-[#89192c]/20 bg-[#e8dcc6]/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#701020] text-[#f1ca7e] font-mono text-xs font-bold uppercase">
                      Option {opt.id.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#f1ca7e] text-[#5a0d1b]">
                      {formatDelta(opt.delta)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#701020] font-bold mb-1">
                      Option Text
                    </label>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) =>
                        handleOptionChange(opt.id, "text", e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-[#f8eee1] border border-[#89192c]/20 focus:border-[#701020] focus:outline-none text-xs text-[#5a0d1b] font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <label className="text-[10px] font-mono uppercase text-[#701020] font-bold">
                        Valuation Delta ($M)
                      </label>
                      <div className="flex flex-wrap items-center gap-1">
                        {DELTA_PRESETS.slice(0, 5).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              handleOptionChange(opt.id, "delta", preset)
                            }
                            className="px-1.5 py-0.5 rounded bg-[#f8eee1] hover:bg-[#f1ca7e] text-[9px] font-mono text-[#5a0d1b] border border-[#89192c]/20 cursor-pointer"
                          >
                            +{preset}
                          </button>
                        ))}
                        {[-50, -100].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              handleOptionChange(opt.id, "delta", preset)
                            }
                            className="px-1.5 py-0.5 rounded bg-[#701020] hover:bg-[#5a0d1b] text-[9px] font-mono text-[#f8eee1] cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      step="5"
                      value={opt.delta}
                      onChange={(e) =>
                        handleOptionChange(opt.id, "delta", e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-[#f8eee1] border border-[#89192c]/20 focus:border-[#701020] focus:outline-none text-xs font-mono text-[#5a0d1b] font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#701020] font-bold mb-1">
                      Post-Lock Outcome Story
                    </label>
                    <textarea
                      rows={2}
                      value={opt.outcome}
                      onChange={(e) =>
                        handleOptionChange(opt.id, "outcome", e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-[#f8eee1] border border-[#89192c]/20 focus:border-[#701020] focus:outline-none text-xs text-[#650d1c]"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
