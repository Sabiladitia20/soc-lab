"use client"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { mitreTechniques, MitreTechnique } from "@/lib/mock-data"
import {
  Shield,
  BookOpen,
  Target,
  ExternalLink,
  X,
  Activity,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  Crosshair,
  Layers,
  BarChart3,
  ChevronRight,
  Zap,
  Info,
  Eye,
  ArrowUpRight,
  Hash,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { Input } from "@/components/ui/input"

// Extended tactics with colors, icons, and descriptions for the matrix view
const tacticsConfig: {
  name: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ElementType
  description: string
  phase: string
}[] = [
  {
    name: "Initial Access",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: Crosshair,
    description: "Teknik yang digunakan penyerang untuk mendapatkan akses awal ke jaringan target.",
    phase: "Gaining Foothold"
  },
  {
    name: "Execution",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    icon: Zap,
    description: "Teknik eksekusi kode berbahaya pada sistem lokal atau remote.",
    phase: "Running Code"
  },
  {
    name: "Persistence",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: Layers,
    description: "Teknik mempertahankan akses meskipun sistem di-restart atau credensial berubah.",
    phase: "Maintaining Access"
  },
  {
    name: "Defense Evasion",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: Shield,
    description: "Teknik menghindari deteksi oleh alat keamanan dan tim SOC.",
    phase: "Avoiding Detection"
  },
  {
    name: "Credential Access",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    icon: Target,
    description: "Teknik mencuri kredensial seperti password, token, atau API key.",
    phase: "Stealing Creds"
  },
  {
    name: "Collection",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    icon: Activity,
    description: "Teknik mengumpulkan data sensitif dari sistem yang terkompromi.",
    phase: "Gathering Data"
  },
]

const getPrevalenceColor = (prevalence: string) => {
  switch (prevalence) {
    case "Critical": return "bg-red-500/20 text-red-400 border-red-500/30"
    case "High": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "Low": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    default: return "bg-secondary text-muted-foreground border-border"
  }
}

const getPrevalenceValue = (prevalence: string) => {
  switch (prevalence) {
    case "Critical": return 4
    case "High": return 3
    case "Medium": return 2
    case "Low": return 1
    default: return 0
  }
}

type ViewMode = "matrix" | "grid"

export default function MitrePage() {
  const [activeTactic, setActiveTactic] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("matrix")

  const filteredTechniques = useMemo(() => mitreTechniques.filter(tech => {
    const matchesTactic = activeTactic === "All" || tech.tactic === activeTactic
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTactic && matchesSearch
  }), [activeTactic, searchQuery])

  // Statistics
  const stats = useMemo(() => {
    const byTactic: Record<string, number> = {}
    const byPrevalence: Record<string, number> = {}
    mitreTechniques.forEach(t => {
      byTactic[t.tactic] = (byTactic[t.tactic] || 0) + 1
      byPrevalence[t.prevalence] = (byPrevalence[t.prevalence] || 0) + 1
    })
    return {
      total: mitreTechniques.length,
      tactics: Object.keys(byTactic).length,
      byTactic,
      byPrevalence,
      withContent: mitreTechniques.filter(t => t.relatedContent).length,
    }
  }, [])

  // Techniques grouped by tactic for matrix
  const techniquesByTactic = useMemo(() => {
    const grouped: Record<string, MitreTechnique[]> = {}
    const techs = searchQuery
      ? mitreTechniques.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : mitreTechniques
    techs.forEach(t => {
      if (!grouped[t.tactic]) grouped[t.tactic] = []
      grouped[t.tactic].push(t)
    })
    return grouped
  }, [searchQuery])

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full pb-16 pt-2">
        {/* Header */}
        <div className="border-b border-border/50 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-cyan-400" /> MITRE ATT&CK Mapping
          </h1>
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-card border border-border flex items-center gap-1.5">
              <span className="text-muted-foreground">Teknik:</span>
              <span className="font-bold text-foreground">{stats.total}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-card border border-border flex items-center gap-1.5">
              <span className="text-muted-foreground">Taktik:</span>
              <span className="font-bold text-foreground">{stats.tactics}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-card border border-border flex items-center gap-1.5">
              <span className="text-red-400">Critical:</span>
              <span className="font-bold text-red-400">{stats.byPrevalence["Critical"] || 0}</span>
            </div>
          </div>
        </div>

        {/* Kill Chain Overview */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Attack Kill Chain Coverage</h2>
          </div>
          <div className="flex items-stretch gap-1 overflow-x-auto pb-2 scrollbar-none">
            {tacticsConfig.map((tactic, idx) => {
              const count = stats.byTactic[tactic.name] || 0
              const isActive = activeTactic === tactic.name
              return (
                <button
                  key={tactic.name}
                  onClick={() => setActiveTactic(isActive ? "All" : tactic.name)}
                  className={`group relative flex-1 min-w-[140px] p-3 rounded-lg border transition-all duration-300 text-left ${isActive
                      ? `${tactic.bgColor} ${tactic.borderColor} shadow-sm`
                      : "bg-secondary/30 border-border/50 hover:bg-secondary/60 hover:border-border"
                    }`}
                >
                  {/* Arrow connector */}
                  {idx < tacticsConfig.length - 1 && (
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <tactic.icon className={`h-3.5 w-3.5 ${isActive ? tactic.color : "text-muted-foreground"}`} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? tactic.color : "text-muted-foreground"}`}>
                      {tactic.phase}
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {tactic.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={`h-1.5 rounded-full flex-1 bg-border/50 overflow-hidden`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isActive ? tactic.bgColor.replace("/10", "/60") : "bg-muted-foreground/20"
                          }`}
                        style={{ width: `${Math.min(count / stats.total * 100 * 3, 100)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${isActive ? tactic.color : "text-muted-foreground"}`}>
                      {count}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari teknik (ID, nama, atau deskripsi)..."
                className="pl-9 bg-card border-border h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {(activeTactic !== "All" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setActiveTactic("All"); setSearchQuery(""); }}
                className="text-xs text-muted-foreground hover:text-foreground h-9 gap-1"
              >
                <X className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filteredTechniques.length} teknik
              {activeTactic !== "All" && ` di ${activeTactic}`}
            </span>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center bg-secondary/50 border border-border rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("matrix")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${viewMode === "matrix"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ===== MATRIX VIEW ===== */}
        {viewMode === "matrix" && (
          <div className="space-y-4">
            {tacticsConfig
              .filter(tc => activeTactic === "All" || activeTactic === tc.name)
              .map(tactic => {
                const techs = techniquesByTactic[tactic.name]
                if (!techs || techs.length === 0) return null
                return (
                  <motion.div
                    key={tactic.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {/* Tactic Header */}
                    <div className={`px-5 py-3.5 border-b ${tactic.borderColor} ${tactic.bgColor} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-background/60 border ${tactic.borderColor}`}>
                          <tactic.icon className={`h-4 w-4 ${tactic.color}`} />
                        </div>
                        <div>
                          <h3 className={`text-sm font-bold ${tactic.color}`}>{tactic.name}</h3>
                          <p className="text-[10px] text-muted-foreground">{tactic.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${tactic.color} ${tactic.borderColor} text-[10px] font-mono`}>
                        {techs.length} teknik
                      </Badge>
                    </div>

                    {/* Technique Pills */}
                    <div className="p-4 flex flex-wrap gap-2">
                      {techs
                        .sort((a, b) => getPrevalenceValue(b.prevalence) - getPrevalenceValue(a.prevalence))
                        .map(tech => (
                          <button
                            key={tech.id}
                            onClick={() => setSelectedTechnique(tech)}
                            className="group flex items-center gap-2.5 bg-secondary/40 hover:bg-secondary/80 border border-border hover:border-primary/30 rounded-lg px-3.5 py-2.5 transition-all duration-200 hover:shadow-sm text-left"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-muted-foreground">{tech.id}</span>
                                <span className={`h-1.5 w-1.5 rounded-full ${tech.prevalence === "Critical" ? "bg-red-400" :
                                    tech.prevalence === "High" ? "bg-orange-400" :
                                      tech.prevalence === "Medium" ? "bg-yellow-400" :
                                        "bg-blue-400"
                                  }`} />
                              </div>
                              <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                                {tech.name}
                              </span>
                            </div>
                            {tech.relatedContent && (
                              <BookOpen className="h-3 w-3 text-accent shrink-0" />
                            )}
                            <Eye className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-all shrink-0" />
                          </button>
                        ))}
                    </div>
                  </motion.div>
                )
              })}
          </div>
        )}

        {/* ===== CARD GRID VIEW ===== */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTechniques.length > 0 ? (
              filteredTechniques.map(tech => {
                const tacticConf = tacticsConfig.find(tc => tc.name === tech.tactic)
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={tech.id}
                    className="group flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedTechnique(tech)}
                  >
                    {/* Card Header */}
                    <div className={`p-4 border-b ${tacticConf?.borderColor || "border-border/50"} ${tacticConf?.bgColor || "bg-secondary/10"} flex items-start justify-between gap-3`}>
                      <div className="flex items-center gap-2.5">
                        {tacticConf && (
                          <div className={`p-1.5 rounded-lg bg-background/60 border ${tacticConf.borderColor}`}>
                            <tacticConf.icon className={`h-3.5 w-3.5 ${tacticConf.color}`} />
                          </div>
                        )}
                        <div>
                          <Badge variant="outline" className="font-mono text-[10px] bg-background/50 mb-1">
                            {tech.id}
                          </Badge>
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                            {tech.name}
                          </h3>
                        </div>
                      </div>
                      <Badge variant="outline" className={`px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase shrink-0 ${getPrevalenceColor(tech.prevalence)}`}>
                        {tech.prevalence}
                      </Badge>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${tacticConf?.color || "text-muted-foreground"}`}>
                        {tech.tactic}
                      </span>
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1 leading-relaxed">
                        {tech.description}
                      </p>

                      {/* Footer */}
                      <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                        {tech.relatedContent ? (
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-accent">
                            {tech.relatedContent.type === "article" ? (
                              <BookOpen className="h-3 w-3" />
                            ) : (
                              <Target className="h-3 w-3" />
                            )}
                            Terkait Materi
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Info className="h-3 w-3" />
                            Knowledge Base
                          </div>
                        )}
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-primary transition-all" />
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="col-span-full py-20 text-center bg-card border border-dashed border-border rounded-xl">
                <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-1">Teknik tidak ditemukan</h3>
                <p className="text-sm text-muted-foreground">Tidak ada teknik MITRE ATT&CK yang cocok dengan filter atau pencarian Anda.</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => { setActiveTactic("All"); setSearchQuery(""); }}
                >
                  Reset Filter
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-card/50 border border-border rounded-xl">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prevalence:</span>
          {["Critical", "High", "Medium", "Low"].map(p => (
            <div key={p} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${p === "Critical" ? "bg-red-400" :
                  p === "High" ? "bg-orange-400" :
                    p === "Medium" ? "bg-yellow-400" :
                      "bg-blue-400"
                }`} />
              <span className="text-[10px] text-muted-foreground">{p}</span>
            </div>
          ))}
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3 w-3 text-accent" />
            <span className="text-[10px] text-muted-foreground">Terkait Materi Platform</span>
          </div>
        </div>
      </div>

      {/* ===== DETAIL MODAL ===== */}
      <AnimatePresence>
        {selectedTechnique && (() => {
          const tacticConf = tacticsConfig.find(tc => tc.name === selectedTechnique.tactic)
          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                onClick={() => setSelectedTechnique(null)}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] p-4 md:p-0"
              >
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                  {/* Modal Header */}
                  <div className={`px-6 py-5 border-b ${tacticConf?.borderColor || "border-border"} ${tacticConf?.bgColor || "bg-secondary/30"} shrink-0`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <Badge variant="outline" className="font-mono bg-background/60 text-xs">
                            {selectedTechnique.id}
                          </Badge>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${tacticConf?.bgColor || ""} ${tacticConf?.color || "text-muted-foreground"} border ${tacticConf?.borderColor || "border-border"}`}>
                            {tacticConf && <tacticConf.icon className="h-3 w-3" />}
                            {selectedTechnique.tactic}
                          </div>
                          <Badge variant="outline" className={`text-[10px] font-semibold ${getPrevalenceColor(selectedTechnique.prevalence)}`}>
                            {selectedTechnique.prevalence}
                          </Badge>
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{selectedTechnique.name}</h2>
                      </div>
                      <button
                        onClick={() => setSelectedTechnique(null)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-background/60 hover:text-foreground transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">

                    {/* Full Description */}
                    <section>
                      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-primary" /> Deskripsi Lengkap
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedTechnique.fullDescription}
                      </p>
                    </section>

                    {/* Real World Scenario */}
                    <section>
                      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-400" /> Skenario Nyata (SOC Triage)
                      </h3>
                      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-sm text-foreground/90 leading-relaxed border-l-4 border-l-orange-500">
                        {selectedTechnique.realWorldScenario}
                      </div>
                    </section>

                    {/* Mitigation & Detection */}
                    <section>
                      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-emerald-400" /> Mitigasi & Deteksi
                      </h3>
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-sm text-foreground/90 leading-relaxed">
                        {selectedTechnique.mitigation}
                      </div>
                    </section>

                    {/* MITRE Reference */}
                    <section>
                      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Referensi MITRE
                      </h3>
                      <a
                        href={`https://attack.mitre.org/techniques/${selectedTechnique.id.replace(".", "/")}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        attack.mitre.org/techniques/{selectedTechnique.id}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </section>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto gap-2 text-xs"
                      onClick={() => setSelectedTechnique(null)}
                    >
                      Tutup
                    </Button>

                    {selectedTechnique.relatedContent && (
                      <Button asChild size="sm" className="w-full sm:w-auto gap-2 text-xs">
                        <Link href={
                          selectedTechnique.relatedContent.type === "article"
                            ? `/learn/${selectedTechnique.relatedContent.slug}`
                            : selectedTechnique.relatedContent.slug
                        }>
                          {selectedTechnique.relatedContent.type === "article" ? (
                            <BookOpen className="h-3.5 w-3.5" />
                          ) : (
                            <Target className="h-3.5 w-3.5" />
                          )}
                          Pelajari: {selectedTechnique.relatedContent.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )
        })()}
      </AnimatePresence>
    </MainLayout>
  )
}
