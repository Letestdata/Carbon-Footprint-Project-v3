// ============================================================
// EcoTrack – Badge / Chip component
// ============================================================

import { cn } from "../../utils/cn";

type BadgeVariant = "green" | "blue" | "amber" | "purple" | "red" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  green: "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200/20",
  blue: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/20",
  amber: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/20",
  purple: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/20",
  red: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/20",
  gray: "bg-gray-100 dark:bg-slate-850 text-gray-600 dark:text-gray-300 border border-gray-200/10",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
