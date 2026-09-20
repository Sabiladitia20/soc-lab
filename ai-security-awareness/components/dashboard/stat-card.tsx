import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  valueColorClass?: string
}

export function StatCard({ title, value, icon: Icon, valueColorClass }: StatCardProps) {
  return (
    <Card className="bg-card border-border shadow-sm overflow-hidden relative group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-3xl font-bold tracking-tight", valueColorClass || "text-foreground")}>
              {value}
            </p>
          </div>
          <div className="h-12 w-12 bg-secondary/50 rounded-full flex items-center justify-center border border-border group-hover:bg-secondary transition-colors">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
