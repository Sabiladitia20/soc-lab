"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Globe,
  Tag,
  Crosshair,
  FileText,
  Clock,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  Loader2,
  MessageSquare,
  User,
  Activity,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Zap,
  Server,
  Code,
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SeverityBadge } from "@/components/dashboard/severity-badge"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { VerdictBadge } from "@/components/dashboard/verdict-badge"
import type { Incident, MitreTechnique } from "@/lib/mock-data"

// ---------- Types ----------
interface RelatedIncident {
  id: string
  title: string
  severity: string
  status: string
  sourceIp: string | null
  ruleId: string | null
  alerts: number
  createdAt: string
  verdict: "TP" | "FP" | null
}

interface RuleDetails {
  ruleCode: string
  name: string
  description: string | null
  severity: string
  mitreTechnique: string | null
  matchField: string
  pattern: string
  thresholdCount: number
  thresholdWindowSeconds: number
  enabled: boolean
}

interface IncidentDetailClientProps {
  incident: Incident
  relatedIncidents: RelatedIncident[]
  mitreInfo: MitreTechnique | null
  ruleDetails: RuleDetails | null
}

// ---------- Helpers ----------
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatFullDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function severityColor(severity: string) {
  switch (severity) {
    case "Critical":
      return "text-red-400"
    case "High":
      return "text-orange-400"
    case "Medium":
      return "text-yellow-400"
    case "Low":
      return "text-blue-400"
    default:
      return "text-muted-foreground"
  }
}

// ---------- Main Component ----------
export function IncidentDetailClient({
  incident,
  relatedIncidents,
  mitreInfo,
  ruleDetails,
}: IncidentDetailClientProps) {
  const router = useRouter()
  const [currentIncident, setCurrentIncident] = useState(incident)
  const [pendingVerdict, setPendingVerdict] = useState(false)
  const [verdictNote, setVerdictNote] = useState("")
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleVerdict = useCallback(
    async (verdict: "TP" | "FP" | null) => {
      if (pendingVerdict) return
      setPendingVerdict(true)
      try {
        if (verdict === null) {
          const res = await fetch("/api/incidents/verdict", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ incidentId: currentIncident.id }),
          })
          if (!res.ok) throw new Error("Failed to clear verdict")
        } else {
          const res = await fetch("/api/incidents/verdict", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncident.id,
              verdict,
              verdictBy: "Analyst",
              verdictNote: verdictNote || undefined,
            }),
          })
          if (!res.ok) throw new Error("Failed to set verdict")
        }
        // Optimistic update
        setCurrentIncident((prev) => ({
          ...prev,
          verdict,
          verdictBy: verdict ? "Analyst" : null,
          verdictNote: verdict ? verdictNote || null : null,
          verdictAt: verdict ? new Date().toISOString() : null,
        }))
        setShowNoteInput(false)
        router.refresh()
      } catch (err) {
        console.error("Verdict update failed:", err)
      } finally {
        setPendingVerdict(false)
      }
    },
    [currentIncident.id, pendingVerdict, verdictNote, router]
  )

  // Parse rawDetails into structured key-value pairs
  const parsedDetails = currentIncident.rawDetails
    ? currentIncident.rawDetails.split("\n").map((line) => {
        const colonIdx = line.indexOf(": ")
        if (colonIdx !== -1) {
          return { key: line.substring(0, colonIdx), value: line.substring(colonIdx + 2) }
        }
        return { key: "", value: line }
      })
    : []

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 pb-8">
        {/* ─── Back Navigation ─── */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/dashboard/incidents">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Incidents
            </Link>
          </Button>
        </div>

        {/* ─── Header Section ─── */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <SeverityBadge severity={currentIncident.severity} />
              <StatusBadge status={currentIncident.status} />
              <VerdictBadge verdict={currentIncident.verdict as "TP" | "FP" | null} size="md" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {currentIncident.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="font-mono text-xs bg-secondary/60 px-2 py-0.5 rounded border border-border">
                {currentIncident.id}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatFullDate(currentIncident.createdAt)}
              </span>
              {currentIncident.assignee && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {currentIncident.assignee}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {currentIncident.alerts} alert{currentIncident.alerts !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Main Grid: 2 columns ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left Column (2/3) ─── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Incident Overview Card */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Incident Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentIncident.sourceIp && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border">
                      <Globe className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Source IP</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-foreground font-mono text-sm">{currentIncident.sourceIp}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleCopy(currentIncident.sourceIp!, "ip")}
                              >
                                {copied === "ip" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy IP</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  )}
                  {currentIncident.ruleId && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border">
                      <Tag className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rule</p>
                        <p className="text-foreground font-mono text-sm mt-0.5">{currentIncident.ruleId}</p>
                        {currentIncident.ruleName && currentIncident.ruleName !== currentIncident.ruleId && (
                          <p className="text-xs text-muted-foreground mt-0.5">{currentIncident.ruleName}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {currentIncident.mitreTechnique && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border">
                      <Crosshair className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">MITRE ATT&CK</p>
                        <p className="text-foreground font-mono text-sm mt-0.5">{currentIncident.mitreTechnique}</p>
                        {mitreInfo && (
                          <p className="text-xs text-muted-foreground mt-0.5">{mitreInfo.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border">
                    <Clock className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last Updated</p>
                      <p className="text-foreground text-sm mt-0.5">{formatFullDate(currentIncident.lastActivity)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(new Date(currentIncident.lastActivity))}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw Log / Details Card */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Raw Log &amp; Request Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {parsedDetails.length > 0 ? (
                  <div className="space-y-3">
                    {/* Structured key-value display */}
                    <div className="space-y-0 border border-border rounded-lg overflow-hidden">
                      {parsedDetails.map((detail, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 px-4 py-2.5 text-sm ${
                            idx % 2 === 0 ? "bg-secondary/10" : "bg-background"
                          } ${idx < parsedDetails.length - 1 ? "border-b border-border" : ""}`}
                        >
                          {detail.key ? (
                            <>
                              <span className="text-muted-foreground font-medium min-w-[120px] shrink-0 uppercase text-xs tracking-wider pt-0.5">
                                {detail.key}
                              </span>
                              <span className="text-foreground font-mono text-xs break-all">{detail.value}</span>
                            </>
                          ) : (
                            <span className="text-foreground font-mono text-xs break-all">{detail.value}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Full raw text block */}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Full Raw Output</p>
                      <div className="relative">
                        <pre className="text-xs font-mono text-foreground bg-[#0d1117] border border-border rounded-lg p-4 whitespace-pre-wrap break-all overflow-x-auto leading-relaxed">
                          {currentIncident.rawDetails}
                        </pre>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary"
                              onClick={() => handleCopy(currentIncident.rawDetails!, "raw")}
                            >
                              {copied === "raw" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy raw log</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Tidak ada raw log untuk incident ini.</p>
                    <p className="text-xs mt-1">Log akan tersedia saat alert di-trigger melalui SOC Agent.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detection Rule Detail Card */}
            {ruleDetails && (
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Detection Rule Detail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">
                        {ruleDetails.ruleCode}
                      </Badge>
                      <span className="text-foreground font-medium">{ruleDetails.name}</span>
                      <Badge
                        className={`text-xs ${
                          ruleDetails.enabled
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {ruleDetails.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {ruleDetails.description && (
                      <p className="text-sm text-muted-foreground">{ruleDetails.description}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-secondary/20 border border-border">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Match Field</p>
                        <p className="text-foreground font-mono text-sm mt-1">{ruleDetails.matchField}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/20 border border-border">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Threshold</p>
                        <p className="text-foreground font-mono text-sm mt-1">
                          {ruleDetails.thresholdCount}x / {ruleDetails.thresholdWindowSeconds}s
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/20 border border-border">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Severity</p>
                        <p className={`font-mono text-sm mt-1 font-semibold ${severityColor(ruleDetails.severity)}`}>
                          {ruleDetails.severity}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Regex Pattern</p>
                      <pre className="text-xs font-mono text-amber-300 bg-[#0d1117] border border-border rounded-lg p-3 whitespace-pre-wrap break-all overflow-x-auto">
                        {ruleDetails.pattern}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* MITRE ATT&CK Mapping Card */}
            {mitreInfo && (
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Crosshair className="h-4 w-4" />
                    MITRE ATT&CK Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs border-red-500/30 text-red-400">
                        {mitreInfo.id}
                      </Badge>
                      <span className="text-foreground font-semibold">{mitreInfo.name}</span>
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                        {mitreInfo.tactic}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          mitreInfo.prevalence === "Critical"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : mitreInfo.prevalence === "High"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                            : mitreInfo.prevalence === "Medium"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        Prevalence: {mitreInfo.prevalence}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">{mitreInfo.fullDescription}</p>

                    <Separator className="bg-border" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          Real-World Scenario
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                          {mitreInfo.realWorldScenario}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Shield className="h-4 w-4 text-emerald-400" />
                          Mitigasi
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                          {mitreInfo.mitigation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <a
                        href={`https://attack.mitre.org/techniques/${mitreInfo.id.replace(".", "/")}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Lihat di MITRE ATT&CK
                      </a>
                      {mitreInfo.relatedContent && (
                        <Link
                          href={
                            mitreInfo.relatedContent.type === "simulator"
                              ? mitreInfo.relatedContent.slug
                              : `/learn/${mitreInfo.relatedContent.slug}`
                          }
                          className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <BookOpen className="h-3 w-3" />
                          {mitreInfo.relatedContent.title}
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ─── Right Column (1/3) ─── */}
          <div className="flex flex-col gap-6">
            {/* Verdict Labeling Card */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Verdict &amp; Disposition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentIncident.verdict ? (
                    <div className="space-y-2">
                      <VerdictBadge verdict={currentIncident.verdict as "TP" | "FP"} size="md" />
                      {currentIncident.verdictBy && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>
                            Labeled by{" "}
                            <span className="text-foreground font-medium">{currentIncident.verdictBy}</span>
                          </span>
                          {currentIncident.verdictAt && (
                            <span>· {timeAgo(new Date(currentIncident.verdictAt))}</span>
                          )}
                        </div>
                      )}
                      {currentIncident.verdictNote && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground p-2 rounded bg-secondary/30 border border-border">
                          <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="text-foreground/80 italic">&quot;{currentIncident.verdictNote}&quot;</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Belum ada verdict. Tandai sebagai True Positive atau False Positive.
                    </p>
                  )}

                  {/* Note input */}
                  {showNoteInput && (
                    <Textarea
                      placeholder="Catatan analis (opsional)..."
                      className="text-xs bg-background border-border resize-none"
                      rows={3}
                      value={verdictNote}
                      onChange={(e) => setVerdictNote(e.target.value)}
                    />
                  )}

                  <div className="flex flex-col gap-2">
                    {!currentIncident.verdict && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground hover:text-foreground justify-start"
                        onClick={() => setShowNoteInput(!showNoteInput)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {showNoteInput ? "Sembunyikan catatan" : "Tambahkan catatan"}
                      </Button>
                    )}

                    <Button
                      variant={currentIncident.verdict === "TP" ? "default" : "outline"}
                      size="sm"
                      className={
                        currentIncident.verdict === "TP"
                          ? "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 w-full justify-center"
                          : "gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/50 w-full justify-center"
                      }
                      disabled={pendingVerdict}
                      onClick={() => handleVerdict(currentIncident.verdict === "TP" ? null : "TP")}
                    >
                      {pendingVerdict ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      Tandai True Positive
                    </Button>

                    <Button
                      variant={currentIncident.verdict === "FP" ? "default" : "outline"}
                      size="sm"
                      className={
                        currentIncident.verdict === "FP"
                          ? "gap-1.5 bg-amber-600 hover:bg-amber-700 text-white border-amber-600 w-full justify-center"
                          : "gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/50 w-full justify-center"
                      }
                      disabled={pendingVerdict}
                      onClick={() => handleVerdict(currentIncident.verdict === "FP" ? null : "FP")}
                    >
                      {pendingVerdict ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldX className="h-3.5 w-3.5" />
                      )}
                      Tandai False Positive
                    </Button>

                    {currentIncident.verdict && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground hover:text-destructive w-full justify-center"
                        disabled={pendingVerdict}
                        onClick={() => handleVerdict(null)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset Verdict
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Incidents / Timeline Card */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Timeline &amp; Related Incidents
                  {relatedIncidents.length > 0 && (
                    <Badge variant="secondary" className="ml-auto font-mono text-xs">
                      {relatedIncidents.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relatedIncidents.length > 0 ? (
                  <div className="space-y-0">
                    {/* Current incident as first timeline entry */}
                    <div className="relative pl-6 pb-4">
                      <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary/30" />
                      <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-border" />
                      <div className="text-xs text-muted-foreground">{formatFullDate(currentIncident.createdAt)}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-medium text-foreground">Incident ini dibuat</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">current</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {currentIncident.alerts} alert{currentIncident.alerts !== 1 ? "s" : ""} · {currentIncident.sourceIp || "Unknown IP"}
                      </p>
                    </div>

                    {/* Related incidents */}
                    {relatedIncidents.map((rel, idx) => (
                      <div key={rel.id} className="relative pl-6 pb-4">
                        <div
                          className={`absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-background ${
                            rel.verdict === "TP"
                              ? "bg-emerald-500 ring-2 ring-emerald-500/30"
                              : rel.verdict === "FP"
                              ? "bg-amber-500 ring-2 ring-amber-500/30"
                              : "bg-muted-foreground/40"
                          }`}
                        />
                        {idx < relatedIncidents.length - 1 && (
                          <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-border" />
                        )}
                        <div className="text-xs text-muted-foreground">{formatFullDate(rel.createdAt)}</div>
                        <Link
                          href={`/dashboard/incidents/${rel.id}`}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5 mt-0.5"
                        >
                          {rel.title}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-xs font-medium ${severityColor(rel.severity)}`}>{rel.severity}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{rel.alerts} alert{rel.alerts !== 1 ? "s" : ""}</span>
                          {rel.sourceIp && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs font-mono text-muted-foreground">{rel.sourceIp}</span>
                            </>
                          )}
                          {rel.verdict && (
                            <VerdictBadge verdict={rel.verdict} size="sm" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Server className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Tidak ada incident terkait.</p>
                    <p className="text-xs mt-1">Incident terkait muncul dari rule ID atau IP yang sama.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
