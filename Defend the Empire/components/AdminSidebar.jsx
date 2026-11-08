"use client";

import { useAdminStore } from "@/data/AdminStoreContext";

export const NAV_ITEMS = [
  {
    id: "command",
    label: "Portal Controls",
    shortLabel: "Live Control",
    description: "Start/stop crisis clock & lock/open option selecting",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "crises",
    label: "Crisis Scenarios",
    shortLabel: "Crises",
    description: "Crisis Management",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    id: "teams",
    label: "Teams & Leaderboard",
    shortLabel: "Leaderboard",
    description: "Leaderboard",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const { teams } = useAdminStore();
  const lockedTeamsCount = teams.filter((t) => t.hasLockedActiveWave).length;

  return (
    <aside className="w-full lg:w-72 shrink-0 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 z-30 bg-[#5a0d1b] border-b lg:border-b-0 lg:border-r border-[#89192c] flex flex-col justify-between select-none overflow-y-auto">
      <div>
        {/* Imperial Brand Header */}
        <div className="p-6 border-b border-[#89192c] bg-[radial-gradient(circle_at_center,#89192c_0%,#701020_45%,#5a0d1b_100%)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#f1ca7e] text-[#5a0d1b] border border-[#f8eee1]/40 flex items-center justify-center font-bold text-xl shadow-md">
              👑
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-[#f8eee1] truncate">
                Defend The Empire
              </h1>
              <p className="text-[11px] font-mono text-[#f1ca7e] uppercase tracking-wider">
                Admin Control Room
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#f1ca7e]">
            Portal Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all duration-300 ease-out flex items-start gap-3 group border cursor-pointer hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:transform-none ${
                  isActive
                    ? "bg-[#701020] border-[#f1ca7e] text-[#f8eee1] shadow-md"
                    : "bg-[#650d1c]/60 border-[#89192c] text-[#e8dcc6] hover:bg-[#89192c]/60 hover:border-[#f1ca7e]/60 hover:text-[#f8eee1]"
                }`}
              >
                <span
                  className={`mt-0.5 p-2 rounded-lg border transition-all duration-300 ease-out ${
                    isActive
                      ? "bg-[#f1ca7e] border-[#f1ca7e] text-[#5a0d1b]"
                      : "bg-[#5a0d1b] border-[#89192c] text-[#f1ca7e]"
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">
                      {item.label}
                    </span>
                    {item.id === "teams" && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#5a0d1b] text-[#f1ca7e] border border-[#89192c]">
                        {lockedTeamsCount}/{teams.length}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#e8dcc6] truncate mt-1">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
