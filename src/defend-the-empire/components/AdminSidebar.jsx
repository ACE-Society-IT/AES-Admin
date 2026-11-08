import React from "react";
import { useAdminStore } from "../data/AdminStoreContext";
import { Clock, Layers, Users, Shield, ArrowLeft } from "lucide-react";

export const NAV_ITEMS = [
  {
    id: "command",
    label: "Live Command Deck",
    shortLabel: "Command",
    description: "Round timer & option controls",
    Icon: Clock,
  },
  {
    id: "crises",
    label: "Crisis Scenario Studio",
    shortLabel: "Crises",
    description: "Wave authoring & options CRUD",
    Icon: Layers,
  },
  {
    id: "teams",
    label: "Contestant Desks",
    shortLabel: "Leaderboard",
    description: "Team decisions & valuations",
    Icon: Users,
  },
];

export default function AdminSidebar({ activeTab, setActiveTab, onBackToHub }) {
  const { teams, crises, currentWaveIndex, activeCrisis } = useAdminStore();
  const lockedTeamsCount = teams.filter((t) => t.hasLockedActiveWave).length;

  return (
    <aside className="editorial-card p-3 space-y-2 lg:sticky lg:top-5 self-start lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto no-scrollbar z-20">
      <div className="px-3 py-2 border-b border-[#E5E5E5] flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase text-[#71717A] font-bold tracking-wider">
          Operations Deck
        </span>
        <span className="editorial-badge text-[10px]">
          WAVE {currentWaveIndex + 1}/{crises.length || 10}
        </span>
      </div>

      <nav className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const ItemIcon = item.Icon;
          
          let badgeText = "";
          if (item.id === "command") {
            badgeText = activeCrisis?.status === "running" ? "ACTIVE" : "IDLE";
          } else if (item.id === "crises") {
            badgeText = `${crises.length} WAVES`;
          } else if (item.id === "teams") {
            badgeText = `${lockedTeamsCount}/${teams.length}`;
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`editorial-btn w-full justify-between px-3 py-2 sm:py-2.5 text-xs font-medium text-left ${
                isActive ? "editorial-btn-dark shadow-sm" : "editorial-btn-outline border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <ItemIcon className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <span className="truncate block font-semibold">{item.shortLabel || item.label}</span>
                  <span className={`text-[10px] truncate hidden md:block lg:block opacity-75`}>
                    {item.description}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                  isActive
                    ? "border-[#5D3720] bg-[#73482C] text-[#FFFFFF]"
                    : "border-[#E5E5E5] bg-[#F4EFEB] text-[#71717A]"
                }`}
              >
                {badgeText}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Quick Summary Pill Box */}
      <div className="p-3 bg-[#F4EFEB] dark:bg-[#181513] rounded-lg border border-[#E5E5E5] space-y-2 text-xs">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-[#71717A]">Option Lock:</span>
          <span className={`font-bold ${activeCrisis?.selectionOpen ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {activeCrisis?.selectionOpen ? "SELECTION OPEN" : "LOCKED"}
          </span>
        </div>
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-[#71717A]">Decisions In:</span>
          <strong className="text-[#1C1917] dark:text-[#FAFAFA] tabular-nums">
            {lockedTeamsCount} of {teams.length}
          </strong>
        </div>
      </div>

      {/* Back to Master Hub Button */}
      {onBackToHub && (
        <div className="pt-2 border-t border-[#E5E5E5]">
          <button
            type="button"
            onClick={onBackToHub}
            className="editorial-btn editorial-btn-outline w-full justify-center text-xs py-2 font-mono uppercase tracking-wider text-[#71717A] hover:text-[#1C1917]"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Master Admin Hub</span>
          </button>
        </div>
      )}
    </aside>
  );
}
