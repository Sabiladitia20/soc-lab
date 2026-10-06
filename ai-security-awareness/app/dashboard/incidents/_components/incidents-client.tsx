"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Bell, Flame, Search, Calendar, Plus, Loader2 } from "lucide-react"
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

export function IncidentsClient({ incidents: initialIncidents }: IncidentsClientProps) {
  const router = useRouter()
  const [incidents, setIncidents] = useState(initialIncidents)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [verdictFilter, setVerdictFilter] = useState("all")

  // Filter logic — memoized to avoid recalculation on unrelated re-renders
  const filteredIncidents = useMemo(() => incidents.filter((inc) => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || inc.status === statusFilter
    const matchesSeverity = severityFilter === "all" || inc.severity === severityFilter
    const matchesVerdict = verdictFilter === "all" ||
      (verdictFilter === "unlabeled" && !inc.verdict) ||
      (verdictFilter === "TP" && inc.verdict === "TP") ||
      (verdictFilter === "FP" && inc.verdict === "FP")
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesVerdict
  }), [incidents, searchQuery, statusFilter, severityFilter, verdictFilter])

  // Stats — computed from real data
  const stats = useMemo(() => {
    const activeIncidents = incidents.filter((inc) => inc.status !== "Closed").length
    const newIncidents = incidents.filter((inc) => inc.status === "New").length
    const criticalIncidents = incidents.filter((inc) => inc.severity === "Critical" && inc.status !== "Closed").length
    
    // Verdict stats
    const truePositives = incidents.filter((inc) => inc.verdict === "TP").length
    const falsePositives = incidents.filter((inc) => inc.verdict === "FP").length
    const labeled = truePositives + falsePositives
    const unlabeled = incidents.length - labeled
    const accuracy = labeled > 0 ? Math.round((truePositives / labeled) * 100) : null
    
    return { activeIncidents, newIncidents, criticalIncidents, truePositives, falsePositives, labeled, unlabeled, accuracy }
  }, [incidents])

  /** Optimistic update when verdict changes — then revalidate server data */
  const handleVerdictChange = useCallback((incidentId: string, verdict: "TP" | "FP" | null, note?: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              verdict: verdict,
              verdictBy: verdict ? "Analyst" : null,
              verdictNote: note || null,
              verdictAt: verdict ? new Date().toISOString() : null,
            }
          : inc
      )
    )
    // Revalidate the page data from server
    router.refresh()
  }, [router])

  // Sync state when real-time incidents are detected
  useEffect(() => {
    function handleNewIncidents(e: Event) {
      const customEvent = e as CustomEvent<{ incidents: any[] }>
      if (customEvent.detail?.incidents?.length > 0) {
        setIncidents((prev) => {
          const existingIds = new Set(prev.map((i) => i.id))
          const toAdd = customEvent.detail.incidents
            .filter((i) => !existingIds.has(i.id))
            .map((inc) => ({
              ...inc,
              createdAt: inc.createdAt,
              lastActivity: inc.createdAt,
              sla: "OK",
              assignee: null,
              verdict: null,
              verdictBy: null,
              verdictNote: null,
              verdictAt: null,
            }))
          return [...toAdd, ...prev]
        })
      }
    }

    window.addEventListener("soc:new-incidents", handleNewIncidents)
    return () => window.removeEventListener("soc:new-incidents", handleNewIncidents)
  }, [])

  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulateIncident = async () => {
    setIsSimulating(true)
    try {
      await fetch("/api/incidents/simulate", { method: "POST" })
    } catch (err) {
      console.error("Gagal menjalankan simulasi alert:", err)
    } finally {
      setIsSimulating(false)
    }
  }

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
          value={stats.activeIncidents}
          icon={Shield}
        />
        <StatCard
          title="New (Unacknowledged)"
          value={stats.newIncidents}
          icon={Bell}
        />
        <StatCard
          title="Critical"
          value={stats.criticalIncidents}
          icon={Flame}
          valueColorClass={stats.criticalIncidents > 0 ? "text-destructive" : "text-foreground"}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border p-3 rounded-lg shadow-sm">
        <div className="flex-1 flex items-center gap-3 w-full flex-wrap">
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
          <Select value={verdictFilter} onValueChange={setVerdictFilter}>
            <SelectTrigger className="w-[170px] bg-background border-border">
              <SelectValue placeholder="All Verdicts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verdicts</SelectItem>
              <SelectItem value="TP">True Positive</SelectItem>
              <SelectItem value="FP">False Positive</SelectItem>
              <SelectItem value="unlabeled">Unlabeled</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden lg:flex items-center gap-2 border border-border bg-background rounded-md px-3 h-9">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">mm/dd/yyyy - mm/dd/yyyy</span>
          </div>
        </div>
        <Button
          onClick={handleSimulateIncident}
          disabled={isSimulating}
          className="shrink-0 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSimulating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Simulasi Alert Baru
        </Button>
      </div>

      {/* Table */}
      <IncidentTable data={filteredIncidents} onVerdictChange={handleVerdictChange} />
      
    </div>
  )
}
