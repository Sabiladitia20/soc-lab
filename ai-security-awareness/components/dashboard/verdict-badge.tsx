"use client"

import { cn } from "@/lib/utils"
import { ShieldCheck, ShieldX, HelpCircle } from "lucide-react"

interface VerdictBadgeProps {
  verdict: "TP" | "FP" | null | undefined
  size?: "sm" | "md"
}

export function VerdictBadge({ verdict, size = "sm" }: VerdictBadgeProps) {
  if (!verdict) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium border",
        "bg-muted/40 text-muted-foreground border-border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}>
        <HelpCircle className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        Unlabeled
      </span>
    )
  }

  if (verdict === "TP") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold border",
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}>
        <ShieldCheck className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        True Positive
      </span>
    )
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-semibold border",
      "bg-amber-500/10 text-amber-400 border-amber-500/30",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      <ShieldX className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      False Positive
    </span>
  )
}
