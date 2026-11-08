import React, { useState, useEffect } from "react";
import { useAdminStore } from "../data/AdminStoreContext";
import {
  DIVISIONS,
  CRISIS_ICONS,
  formatDelta,
  formatClock,
} from "../data/simulationData";
import CrisisIcon, { CRISIS_ICON_OPTIONS } from "./CrisisIcon";
import {
  Lock,
  Unlock,
  Play,
  Square,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Layers,
  CheckCircle,
} from "lucide-react";

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

  const selectedCrisis = crises[selectedIndex] || crises[0] || null;

  useEffect(() => {
    if (selectedCrisis) {
      setDraft(JSON.parse(JSON.stringify(selectedCrisis)));
    }
  }, [selectedIndex, selectedCrisis?.id]);

  if (!draft) {
    return (
      <div className="editorial-card p-8 text-center text-[#71717A] font-mono text-xs">
        Loading crisis scenario studio...
      </div>
    );
  }

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (optionId, field, value) => {
    setDraft((prev) => {
      const nextOptions = prev.options.map((opt) => {
        if (opt.id === optionId) {
          return {
            ...opt,
            [field]: field === "delta" ? Number(value) || 0 : value,
          };
        }
        return opt;
      });
      return { ...prev, options: nextOptions };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateCrisis(draft.id, draft);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  const handleCreateWave = async () => {
    const newIndex = crises.length;
    const created = await addCrisis({
      icon: "zap",
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
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${draft.title}"?`
    );
    if (!confirmed) return;

    await deleteCrisis(draft.id);
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="editorial-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
              SCENARIO ARCHITECTURE
            </span>
            <span className="editorial-badge text-[10px]">
              {crises.length} TOTAL WAVES
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#1C1917] dark:text-[#FAFAFA]">
            Crisis Studio & Option Tree Configuration
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Author crisis narratives, adjust valuation deltas, reorder waves, and deploy changes live to cloud storage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateWave}
          className="editorial-btn editorial-btn-dark text-xs self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Provision New Wave</span>
        </button>
      </div>

      {/* Grid: Left Column (Waves list) + Right Column (Full editor) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Reorderable Crisis Waves List */}
        <div className="xl:col-span-4 space-y-3">
          <div className="editorial-card p-4 space-y-2">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-[#E5E5E5]">
              <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
                Wave Sequence ({crises.length})
              </span>
              <span className="font-mono text-[10px] text-[#71717A]">
                Select to Edit
              </span>
            </div>

            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {crises.map((c, idx) => {
                const isSelected = selectedIndex === idx;
                const isLive = currentWaveIndex === idx;

                return (
                  <div
                    key={c.id || idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? "border-[#8D5B3A] bg-[#F4EFEB] dark:bg-[#181513] shadow-sm"
                        : "editorial-card hover:border-[#8D5B3A]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#8D5B3A] text-white"
                              : "bg-[#F4EFEB] dark:bg-[#221D1A] text-[#71717A]"
                          }`}
                        >
                          <CrisisIcon icon={c.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-[#8D5B3A]">
                              WAVE #{idx + 1}
                            </span>
                            <span className="editorial-badge text-[9px] py-0 px-1.5">
                              {c.division}
                            </span>
                            {isLive && (
                              <span className="editorial-badge bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5] text-[9px] py-0 px-1.5 font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-xs text-[#1C1917] dark:text-[#FAFAFA] truncate mt-1">
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
                              if (selectedIndex === idx) setSelectedIndex(idx - 1);
                            }
                          }}
                          disabled={idx === 0}
                          className="p-1 rounded border border-[#E5E5E5] hover:bg-[#E5DFD7] disabled:opacity-30 cursor-pointer"
                          title="Move Wave Up"
                        >
                          <ArrowUp className="w-3 h-3 text-[#71717A]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (idx < crises.length - 1) {
                              reorderCrisis(idx, idx + 1);
                              if (selectedIndex === idx) setSelectedIndex(idx + 1);
                            }
                          }}
                          disabled={idx === crises.length - 1}
                          className="p-1 rounded border border-[#E5E5E5] hover:bg-[#E5DFD7] disabled:opacity-30 cursor-pointer"
                          title="Move Wave Down"
                        >
                          <ArrowDown className="w-3 h-3 text-[#71717A]" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between font-mono text-[10px] text-[#71717A]">
                      <span>
                        {formatClock(c.remainingSeconds)} / {formatClock(c.durationSeconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        {c.selectionOpen ? (
                          <span className="text-[#16A34A] font-bold flex items-center gap-1">
                            <Unlock className="w-3 h-3" />
                            <span>Open</span>
                          </span>
                        ) : (
                          <span className="text-[#DC2626] font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Crisis & 4 Options Form */}
        <form
          onSubmit={handleSave}
          className="xl:col-span-8 editorial-card p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8D5B3A] text-white flex items-center justify-center shrink-0">
                <CrisisIcon icon={draft.icon} className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-[#71717A]">
                  Editing Wave #{selectedIndex + 1} (Database ID #{draft.id})
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#FAFAFA]">
                  {draft.title || "Untitled Scenario"}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => startCrisisWave(selectedIndex)}
                className="editorial-btn editorial-btn-outline text-xs"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                <span>Launch Now</span>
              </button>

              <button
                type="button"
                onClick={() => toggleOptionSelection(selectedIndex)}
                className="editorial-btn editorial-btn-outline text-xs"
              >
                {selectedCrisis?.selectionOpen ? (
                  <>
                    <Lock className="w-3.5 h-3.5 mr-1 text-[#DC2626]" />
                    <span>Lock Options</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 mr-1 text-[#16A34A]" />
                    <span>Open Options</span>
                  </>
                )}
              </button>

              {crises.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteCurrent}
                  className="editorial-btn editorial-btn-outline text-xs text-[#DC2626] hover:border-[#DC2626]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}

              <button
                type="submit"
                className="editorial-btn editorial-btn-dark text-xs font-bold"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>Save to Cloud</span>
              </button>
            </div>
          </div>

          {saveBanner && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5] text-xs font-mono font-semibold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Wave parameters and option deltas saved to Supabase storage successfully.</span>
            </div>
          )}

          {/* Crisis Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <div className="md:col-span-5">
              <label className="block font-mono text-[11px] font-bold text-[#71717A] uppercase mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="editorial-input w-full text-xs font-semibold"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-mono text-[11px] font-bold text-[#71717A] uppercase mb-1">
                Division Sector
              </label>
              <select
                value={draft.division}
                onChange={(e) => handleFieldChange("division", e.target.value)}
                className="editorial-input w-full text-xs"
              >
                {DIVISIONS.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-[11px] font-bold text-[#71717A] uppercase mb-1">
                Emblem Icon
              </label>
              <select
                value={draft.icon}
                onChange={(e) => handleFieldChange("icon", e.target.value)}
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
                Timer Duration (Sec)
              </label>
              <input
                type="number"
                min="10"
                value={draft.durationSeconds || 360}
                onChange={(e) =>
                  handleFieldChange("durationSeconds", Number(e.target.value) || 360)
                }
                className="editorial-input w-full font-mono text-xs"
                required
              />
            </div>

            <div className="md:col-span-12">
              <label className="block font-mono text-[11px] font-bold text-[#71717A] uppercase mb-1">
                Scenario Briefing Narrative
              </label>
              <textarea
                rows={3}
                value={draft.story}
                onChange={(e) => handleFieldChange("story", e.target.value)}
                className="editorial-input w-full text-xs leading-relaxed"
                required
              />
            </div>
          </div>

          {/* 4 Tactical Options (A, B, C, D) Configuration Grid */}
          <div className="pt-3 border-t border-[#E5E5E5] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-sm font-bold text-[#1C1917] dark:text-[#FAFAFA]">
                  Tactical Options & Valuation Deltas (A, B, C, D)
                </h4>
                <p className="text-xs text-[#71717A]">
                  Define choice texts, score shifts ($ Millions), and post-lock outcome explanations.
                </p>
              </div>
              <span className="editorial-badge text-[10px] font-mono">
                Currency: $ Millions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {draft.options.map((opt) => (
                <div
                  key={opt.id}
                  className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#F4EFEB] dark:bg-[#181513] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="editorial-badge text-[10px] font-bold uppercase bg-[#8D5B3A] text-white border-[#73482C]">
                      Option {opt.id.toUpperCase()}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                        opt.delta > 0
                          ? "bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]"
                          : opt.delta < 0
                          ? "bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]"
                          : "bg-[#FFFFFF] text-[#71717A] border-[#E5DFD7]"
                      }`}
                    >
                      {formatDelta(opt.delta)}
                    </span>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-[#71717A] mb-1">
                      Action Title
                    </label>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionChange(opt.id, "text", e.target.value)}
                      className="editorial-input w-full text-xs font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <label className="font-mono text-[10px] uppercase font-bold text-[#71717A]">
                        Valuation Delta ($M)
                      </label>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        {[100, 50, 0, -50].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleOptionChange(opt.id, "delta", preset)}
                            className="px-1.5 py-0.5 rounded border border-[#E5E5E5] bg-[#FFFFFF] dark:bg-[#221D1A] hover:border-[#8D5B3A] text-[9px]"
                          >
                            {preset > 0 ? `+${preset}` : preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      step="5"
                      value={opt.delta}
                      onChange={(e) => handleOptionChange(opt.id, "delta", e.target.value)}
                      className="editorial-input w-full font-mono text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-[#71717A] mb-1">
                      Consequence Outcome Narrative
                    </label>
                    <textarea
                      rows={2}
                      value={opt.outcome}
                      onChange={(e) => handleOptionChange(opt.id, "outcome", e.target.value)}
                      className="editorial-input w-full text-xs leading-relaxed"
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
