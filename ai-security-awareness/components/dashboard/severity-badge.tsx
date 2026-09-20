import { Badge } from "@/components/ui/badge"
import { IncidentSeverity } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface SeverityBadgeProps {
  severity: IncidentSeverity
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const styles = {
    Low: "bg-[var(--severity-low)]/10 text-[var(--severity-low)] border-[var(--severity-low)]/30",
    Medium: "bg-[var(--severity-medium)]/10 text-[var(--severity-medium)] border-[var(--severity-medium)]/30",
    High: "bg-[var(--severity-high)]/10 text-[var(--severity-high)] border-[var(--severity-high)]/30",
    Critical: "bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] border-[var(--severity-critical)]/30",
  }

  return (
    <Badge variant="outline" className={cn("font-medium", styles[severity], className)}>
      {severity}
    </Badge>
  )
}
