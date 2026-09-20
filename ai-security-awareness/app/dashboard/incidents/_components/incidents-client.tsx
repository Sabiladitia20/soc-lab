"use client"

import { useState, useMemo } from "react"
import { Shield, Bell, Flame, Search, Calendar, Plus } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { IncidentTable } from "@/components/dashboard/incident-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Incident } from "@/lib/mock-data"

interface IncidentsClientProps {
  incidents: Incident[]
}

export function IncidentsClient({ incidents }: IncidentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  // Filter logic — memoized to avoid recalculation on unrelated re-renders
  const filteredIncidents = useMemo(() => incidents.filter((inc) => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || inc.status === statusFilter
    const matchesSeverity = severityFilter === "all" || inc.severity === severityFilter
    
    return matchesSearch && matchesStatus && matchesSeverity
  }), [incidents, searchQuery, statusFilter, severityFilter])

  // Stats — computed from real data
  const { activeIncidents, newIncidents, criticalIncidents } = useMemo(() => ({
    activeIncidents: incidents.filter((inc) => inc.status !== "Closed").length,
    newIncidents: incidents.filter((inc) => inc.status === "New").length,
    criticalIncidents: incidents.filter((inc) => inc.severity === "Critical" && inc.status !== "Closed").length,
  }), [incidents])

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Incidents</h1>
          <Badge variant="secondary" className="bg-secondary text-muted-foreground font-mono">
            {filteredIncidents.length} total
          </Badge>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Incidents"
          value={activeIncidents}
          icon={Shield}
        />
        <StatCard
          title="New (Unacknowledged)"
          value={newIncidents}
          icon={Bell}
        />
        <StatCard
          title="Critical"
          value={criticalIncidents}
          icon={Flame}
          valueColorClass={criticalIncidents > 0 ? "text-destructive" : "text-foreground"}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border p-3 rounded-lg shadow-sm">
        <div className="flex-1 flex items-center gap-3 w-full">
          <div className="relative w-[250px] shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              className="pl-9 bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-background border-border">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Acknowledged">Acknowledged</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[160px] bg-background border-border">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden lg:flex items-center gap-2 border border-border bg-background rounded-md px-3 h-9">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">mm/dd/yyyy - mm/dd/yyyy</span>
          </div>
        </div>
        <Button className="shrink-0 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create Incident
        </Button>
      </div>

      {/* Table */}
      <IncidentTable data={filteredIncidents} />
      
    </div>
  )
}
