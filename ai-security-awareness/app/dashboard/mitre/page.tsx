"use client"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { mitreTechniques, MitreTechnique } from "@/lib/mock-data"
import { Shield, BookOpen, Target, ExternalLink, X, Activity, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { Input } from "@/components/ui/input"

const tactics = [
  "All",
  "Initial Access",
  "Execution",
  "Persistence",
  "Defense Evasion",
  "Credential Access",
  "Collection"
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

export default function MitrePage() {
  const [activeTactic, setActiveTactic] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null)

  const filteredTechniques = useMemo(() => mitreTechniques.filter(tech => {
    const matchesTactic = activeTactic === "All" || tech.tactic === activeTactic
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tech.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tech.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTactic && matchesSearch
  }), [activeTactic, searchQuery])

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 w-fit mb-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary tracking-wide">SOC Analyst Knowledge Base</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">MITRE ATT&CK Mapping</h1>
          <p className="text-muted-foreground">Teknik serangan yang relevan dengan materi edukasi dan simulasi pada platform ini.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full md:w-auto mask-fade-right pr-4">
            {tactics.map(tactic => (
              <button
                key={tactic}
                onClick={() => setActiveTactic(tactic)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeTactic === tactic
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent hover:border-border"
                }`}
              >
                {tactic}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-[300px] shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari ID atau nama teknik..." 
              className="pl-9 bg-background border-border h-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTechniques.length > 0 ? (
            filteredTechniques.map(tech => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={tech.id}
                className="group flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedTechnique(tech)}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-border/50 bg-secondary/10 flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="font-mono text-xs bg-background/50 mb-2">
                      {tech.id}
                    </Badge>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                      {tech.name}
                    </h3>
                  </div>
                  <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${getPrevalenceColor(tech.prevalence)}`}>
                    {tech.prevalence}
                  </Badge>
                </div>
                
                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {tech.tactic}
                  </span>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1 leading-relaxed">
                    {tech.description}
                  </p>
                  
                  {/* Related Content Badge */}
                  {tech.relatedContent ? (
                    <div className="mt-auto pt-4 border-t border-border/50">
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-2.5 py-1.5 rounded-md">
                        {tech.relatedContent.type === 'article' ? (
                          <BookOpen className="h-3.5 w-3.5" />
                        ) : (
                          <Target className="h-3.5 w-3.5" />
                        )}
                        Terkait Materi
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 border-t border-border/50">
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Activity className="h-3.5 w-3.5" />
                        Background Knowledge
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
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
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTechnique && (
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
              className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] p-4 md:p-0"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-start justify-between shrink-0">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant="outline" className="font-mono bg-background">
                        {selectedTechnique.id}
                      </Badge>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {selectedTechnique.tactic}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedTechnique.name}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedTechnique(null)}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-8 flex-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  
                  {/* Full Description */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" /> Deskripsi Lengkap
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {selectedTechnique.fullDescription}
                    </p>
                  </section>
                  
                  {/* Real World Scenario */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-400" /> Skenario Nyata (SOC Triage)
                    </h3>
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 text-sm text-foreground/90 leading-relaxed border-l-4 border-l-orange-500">
                      {selectedTechnique.realWorldScenario}
                    </div>
                  </section>
                  
                  {/* Mitigation */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-400" /> Mitigasi & Deteksi
                    </h3>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 text-sm text-foreground/90 leading-relaxed">
                      {selectedTechnique.mitigation}
                    </div>
                  </section>
                  
                </div>
                
                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Prevalence:</span>
                    <Badge variant="outline" className={getPrevalenceColor(selectedTechnique.prevalence)}>
                      {selectedTechnique.prevalence}
                    </Badge>
                  </div>
                  
                  {selectedTechnique.relatedContent && (
                    <Button asChild className="w-full sm:w-auto gap-2">
                      <Link href={
                        selectedTechnique.relatedContent.type === 'article' 
                          ? `/learn/${selectedTechnique.relatedContent.slug}` 
                          : selectedTechnique.relatedContent.slug
                      }>
                        {selectedTechnique.relatedContent.type === 'article' ? (
                          <BookOpen className="h-4 w-4" />
                        ) : (
                          <Target className="h-4 w-4" />
                        )}
                        Pelajari: {selectedTechnique.relatedContent.title}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MainLayout>
  )
}
