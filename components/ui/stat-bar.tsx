import React from "react";
import { cn } from "@/lib/utils";

interface StatBarProps {
  value: number;
  className?: string;
  colorClass?: string;
}

export function StatBar({ value, className, colorClass = "from-maroon to-red-700" }: StatBarProps) {
  // Ensure value is between 0 and 100
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full bg-gray-200 rounded", className)}>
      <div 
        className={cn("h-2 rounded bg-gradient-to-r", colorClass)}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
