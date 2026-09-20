import { Badge } from "@/components/ui/badge"
import { IncidentSLA } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface SLABadgeProps {
  sla: IncidentSLA
  timeLeft?: string
  className?: string
}

export function SLABadge({ sla, timeLeft, className }: SLABadgeProps) {
  const styles = {
    OK: "bg-[var(--sla-ok)]/10 text-[var(--sla-ok)] border-[var(--sla-ok)]/30",
    Breached: "bg-[var(--sla-breached)]/10 text-[var(--sla-breached)] border-[var(--sla-breached)]/30",
  }

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <Badge variant="outline" className={cn("font-medium", styles[sla])}>
        {sla}
      </Badge>
      {timeLeft && sla === "OK" && (
        <span className="text-[10px] text-muted-foreground font-medium pl-1">
          {timeLeft}
        </span>
      )}
    </div>
  )
}
