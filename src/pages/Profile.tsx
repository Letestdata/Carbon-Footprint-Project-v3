// ============================================================
// EcoTrack – Profile Page
// ============================================================

import { useState, useId } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ACHIEVEMENTS } from "../data/achievements";
import {
  GLOBAL_AVERAGE_MONTHLY_KG,
  PARIS_TARGET_MONTHLY_KG,
} from "../data/emissionFactors";

export function Profile() {
  const { state, updateProfile, totalMonthCo2e } = useApp();
  const { profile, earnedAchievements, logs } = state;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [householdSize, setHouseholdSize] = useState(
    String(profile.householdSize),
  );
  const [monthlyGoal, setMonthlyGoal] = useState(
    String(profile.monthlyBudgetGoal),
  );
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");

  const nameId = useId();
  const locationId = useId();
  const householdId = useId();
  const goalId = useId();
  const errorId = useId();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const parsedSize = parseInt(householdSize);
    const parsedGoal = parseFloat(monthlyGoal);
    if (!name.trim()) {
      setFormError("Name cannot be empty.");
      return;
    }
    if (isNaN(parsedSize) || parsedSize < 1 || parsedSize > 20) {
      setFormError("Household size must be between 1 and 20.");
      return;
    }
    if (isNaN(parsedGoal) || parsedGoal < 10) {
      setFormError("Monthly goal must be at least 10 kg CO₂e.");
      return;
    }
    updateProfile({
      name: name.trim(),
      location: location.trim(),
      householdSize: parsedSize,
      monthlyBudgetGoal: parsedGoal,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    setName(profile.name);
    setLocation(profile.location);
    setHouseholdSize(String(profile.householdSize));
    setMonthlyGoal(String(profile.monthlyBudgetGoal));
    setEditing(false);
    setFormError("");
  }

  // Stats
  const totalDaysLogged = logs.filter((l) => l.entries.length > 0).length;
  const totalEntries = logs.reduce((s, l) => s + l.entries.length, 0);
  const totalCo2eLogged = logs.reduce((s, l) => s + l.totalCo2e, 0);

  // Emission rating
  const rating = (() => {
    if (totalMonthCo2e === 0)
      return { label: "Not tracked yet", color: "gray", icon: "⬜" };
    if (totalMonthCo2e <= PARIS_TARGET_MONTHLY_KG)
      return { label: "Climate Champion 🌟", color: "green", icon: "🌟" };
    if (totalMonthCo2e <= GLOBAL_AVERAGE_MONTHLY_KG * 0.5)
      return { label: "Eco Hero", color: "green", icon: "🌍" };
    if (totalMonthCo2e <= GLOBAL_AVERAGE_MONTHLY_KG)
      return { label: "Below Average", color: "blue", icon: "✅" };
    if (totalMonthCo2e <= GLOBAL_AVERAGE_MONTHLY_KG * 1.5)
      return { label: "Above Average", color: "amber", icon: "⚠️" };
    return { label: "High Emitter", color: "red", icon: "🔴" };
  })();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h1>

      {/* ── Save confirmation ─── */}
      {saved && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl p-4 flex items-center gap-3"
        >
          <span aria-hidden="true">✅</span>
          <p className="text-green-800 dark:text-green-300 text-sm font-medium">
            Profile saved successfully!
          </p>
        </div>
      )}

      {/* ── Profile card ─── */}
      <section aria-labelledby="profile-heading">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardHeader
              titleId="profile-heading"
              title="Your Profile"
              icon="👤"
            />
            {!editing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditing(true)}
                aria-label="Edit profile"
              >
                ✏️ Edit
              </Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor={nameId}
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Name{" "}
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                </label>
                <input
                  id={nameId}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  aria-required="true"
                  aria-describedby={formError ? errorId : undefined}
                  maxLength={60}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor={locationId}
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Location
                </label>
                <input
                  id={locationId}
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. London, UK"
                  aria-describedby={formError ? errorId : undefined}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor={householdId}
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Household Size{" "}
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                </label>
                <input
                  id={householdId}
                  type="number"
                  min="1"
                  max="20"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value)}
                  required
                  aria-required="true"
                  aria-describedby={formError ? errorId : undefined}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor={goalId}
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Monthly CO₂e Goal (kg){" "}
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                </label>
                <input
                  id={goalId}
                  type="number"
                  min="10"
                  step="10"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(e.target.value)}
                  required
                  aria-required="true"
                  aria-describedby={formError ? errorId : undefined}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Paris target: 167 kg/month | Global avg: 417 kg/month
                </p>
              </div>

              {formError && (
                <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {formError}
                </p>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <ul className="space-y-3" role="list">
              {[
                { label: "Name", value: profile.name, icon: "👤" },
                {
                  label: "Location",
                  value: profile.location || "—",
                  icon: "📍",
                },
                {
                  label: "Household Size",
                  value: `${profile.householdSize} person${profile.householdSize > 1 ? "s" : ""}`,
                  icon: "🏠",
                },
                {
                  label: "Monthly Goal",
                  value: `${profile.monthlyBudgetGoal} kg CO₂e`,
                  icon: "🎯",
                },
                {
                  label: "Member Since",
                  value: new Date(profile.joinedAt).toLocaleDateString("en", {
                    year: "numeric",
                    month: "long",
                  }),
                  icon: "📅",
                },
              ].map(({ label, value, icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-slate-850 last:border-0"
                >
                  <span className="text-lg w-7" aria-hidden="true">
                    {icon}
                  </span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{label}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* ── Emission rating ─── */}
      <section aria-labelledby="rating-heading">
        <Card>
          <CardHeader
            titleId="rating-heading"
            title="Emission Rating"
            icon="⭐"
          />
          <div className="flex items-center gap-4">
            <span className="text-4xl" aria-hidden="true">
              {rating.icon}
            </span>
            <div>
              <Badge
                variant={
                  rating.color as "green" | "blue" | "amber" | "red" | "gray"
                }
              >
                {rating.label}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                {totalMonthCo2e.toFixed(1)} kg CO₂e this month
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Activity stats ─── */}
      <section aria-labelledby="stats-heading">
        <Card>
          <CardHeader
            titleId="stats-heading"
            title="Tracking Stats"
            icon="📊"
          />
          <dl className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Days Logged", value: totalDaysLogged },
              { label: "Activities", value: totalEntries },
              { label: "Total CO₂e (kg)", value: totalCo2eLogged.toFixed(1) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-slate-900 dark:border dark:border-slate-800/80 rounded-xl p-3">
                <dd className="text-xl font-bold text-gray-900 dark:text-white">{value}</dd>
                <dt className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</dt>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      {/* ── Achievements ─── */}
      <section aria-labelledby="achievements-heading">
        <Card>
          <CardHeader
            titleId="achievements-heading"
            title="Achievements"
            icon="🏆"
            subtitle={`${earnedAchievements.length} of ${ACHIEVEMENTS.length} unlocked`}
          />
          <ul className="grid grid-cols-2 gap-3" role="list">
            {ACHIEVEMENTS.map((a) => {
              const earned = earnedAchievements.includes(a.id);
              return (
                <li
                  key={a.id}
                  className={`rounded-xl p-3 flex items-start gap-2.5 transition-all ${
                    earned
                      ? "bg-amber-50 border border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30"
                      : "bg-gray-50 opacity-60 dark:bg-slate-900/40 dark:border dark:border-slate-900/60"
                  }`}
                  aria-label={
                    earned ? `Earned: ${a.title}` : `Locked: ${a.title}`
                  }
                >
                  <span
                    className={`text-2xl shrink-0 ${earned ? "" : "grayscale"}`}
                    aria-hidden="true"
                  >
                    {a.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {a.description}
                    </p>
                    {earned && (
                      <span className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                        ✓ Earned
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      {/* ── Data management ─── */}
      <section aria-labelledby="data-heading">
        <Card>
          <CardHeader titleId="data-heading" title="Data & Privacy" icon="🔒" />
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              All your data is stored locally on your device. We do not collect
              or transmit any personal data to external servers.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear all your data? This cannot be undone.",
                  )
                ) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              aria-label="Clear all app data and reset to defaults"
            >
              🗑️ Clear All Data
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
