// ============================================================
// EcoTrack – Bottom Navigation Bar (mobile-first + desktop sidebar)
// ============================================================

import { useApp } from "../context/AppContext";
import type { NavPage } from "../types";
import { cn } from "../utils/cn";

interface NavItem {
  page: NavPage;
  label: string;
  icon: string;
  ariaLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    page: "dashboard",
    label: "Dashboard",
    icon: "🏠",
    ariaLabel: "Go to Dashboard",
  },
  { page: "log", label: "Log", icon: "✏️", ariaLabel: "Log an Activity" },
  {
    page: "insights",
    label: "Insights",
    icon: "📈",
    ariaLabel: "View Insights",
  },
  { page: "tips", label: "Tips", icon: "💡", ariaLabel: "Eco Tips" },
  {
    page: "assistant",
    label: "Assistant",
    icon: "🤖",
    ariaLabel: "Open AI Assistant",
  },
  { page: "profile", label: "Profile", icon: "👤", ariaLabel: "Your Profile" },
];

export function Navigation() {
  const { state, navigate, theme = "light", toggleTheme } = useApp();
  const { currentPage } = state;

  return (
    <>
      {/* ── Mobile Header ───────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            🌍
          </span>
          <span className="font-bold text-gray-900 dark:text-white text-base">
            EcoTrack
          </span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-lg transition-all"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <nav
        aria-label="Desktop navigation"
        className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 shadow-sm p-6 gap-2 fixed left-0 top-0 z-40 transition-colors duration-300"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 bg-green-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-md"
            aria-hidden="true"
          >
            🌍
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-lg leading-tight block">
              EcoTrack
            </span>
            <span className="text-xs text-green-600 dark:text-emerald-500 font-medium">
              Carbon Footprint Tracker
            </span>
          </div>
        </div>

        {/* Nav links */}
        <ul className="space-y-1 flex-1" role="list">
          {NAV_ITEMS.map((item) => {
            const active = currentPage === item.page;
            return (
              <li key={item.page}>
                <button
                  onClick={() => navigate(item.page)}
                  aria-label={item.ariaLabel}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1",
                    active
                      ? "bg-green-600 dark:bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white",
                  )}
                >
                  <span className="text-lg" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Theme Toggle in Desktop Sidebar */}
        <div className="py-3">
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800 transition-all"
          >
            <span className="flex items-center gap-2">
              <span>{theme === "light" ? "🌙" : "☀️"}</span>
              <span>Theme</span>
            </span>
            <span className="text-xs text-gray-400 uppercase font-semibold">
              {theme === "light" ? "Light" : "Dark"}
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
          <p className="text-xs text-gray-400 text-center">
            © 2026 EcoTrack · Built for sustainability
          </p>
        </div>
      </nav>

      {/* ── Mobile bottom bar ───────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 z-50 shadow-lg transition-colors duration-300"
      >
        <ul className="flex items-center justify-around px-2 py-1" role="list">
          {NAV_ITEMS.map((item) => {
            const active = currentPage === item.page;
            return (
              <li key={item.page}>
                <button
                  onClick={() => navigate(item.page)}
                  aria-label={item.ariaLabel}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl min-w-[44px] min-h-[44px] justify-center",
                    "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
                    active
                      ? "text-green-600 dark:text-emerald-500 font-semibold scale-105"
                      : "text-gray-400 dark:text-gray-500",
                  )}
                >
                  <span className="text-xl leading-none" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      active
                        ? "text-green-600 dark:text-emerald-500"
                        : "text-gray-400 dark:text-gray-500",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
