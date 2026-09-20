import { Badge } from "@/components/ui/badge"
import { IncidentStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: IncidentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    New: "bg-[var(--status-new)]/10 text-[var(--status-new)] border-[var(--status-new)]/30",
    Acknowledged: "bg-[var(--status-acknowledged)]/10 text-[var(--status-acknowledged)] border-[var(--status-acknowledged)]/30",
    Closed: "bg-[var(--status-closed)]/10 text-[var(--status-closed)] border-[var(--status-closed)]/30",
  }

  return (
    <Badge variant="outline" className={cn("font-medium", styles[status], className)}>
      {status}
    </Badge>
  )
}
