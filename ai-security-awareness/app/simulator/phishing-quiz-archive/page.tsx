"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { phishingScenarios, PhishingScenario } from "@/lib/mock-data"
import { Flag, CheckCircle2, XCircle, ArrowRight, RefreshCw, Target, Mail, ChevronDown, AlertTriangle, Search, Reply, Trash2, ShieldCheck, Info } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MainLayout } from "@/components/layout/main-layout"

type ResultType = "TP" | "TN" | "FP" | "FN" | null

interface EmailState {
  investigated: boolean
  senderExpanded: boolean
  headerExpanded: boolean
  hoveredLink: boolean
  answered: boolean
  result: ResultType
}

export default function PhishingSimulatorFullPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [emailStates, setEmailStates] = useState<EmailState[]>(
    phishingScenarios.map(() => ({
      investigated: false,
      senderExpanded: false,
      headerExpanded: false,
      hoveredLink: false,
      answered: false,
      result: null
    }))
  )
  const [completed, setCompleted] = useState(false)
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null)

  // Consequence state
  const [showGlitch, setShowGlitch] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const currentScenario = phishingScenarios[currentIndex]
  const currentEmailState = emailStates[currentIndex]
  const totalScenarios = phishingScenarios.length

  const answeredCount = emailStates.filter(s => s.answered).length
  const progress = (answeredCount / totalScenarios) * 100
  
  const score = emailStates.reduce((acc, state, idx) => {
    if (!state.answered) return acc
    let points = 0
    if (state.result === "TP" || state.result === "TN") points += 10
    if (state.result === "FN") points -= 15 // Heavy penalty for missing phishing
    if (state.result === "FP") points -= 5 // Small penalty for false positive
    if (state.investigated && (state.result === "TP" || state.result === "TN")) points += 2 // Bonus
    return acc + points
  }, 0)

  const updateCurrentState = (updates: Partial<EmailState>) => {
    setEmailStates(prev => {
      const newStates = [...prev]
      const isNowInvestigated = 
        newStates[currentIndex].investigated || 
        updates.senderExpanded || 
        updates.headerExpanded || 
        updates.hoveredLink
        
      newStates[currentIndex] = { 
        ...newStates[currentIndex], 
        ...updates,
        investigated: isNowInvestigated || newStates[currentIndex].investigated
      }
      return newStates
    })
  }

  const handleAnswer = (isReportedPhishing: boolean) => {
    if (currentEmailState.answered) return

    const isActuallyPhishing = currentScenario.isPhishing
    let result: ResultType

    if (isReportedPhishing && isActuallyPhishing) result = "TP"
    else if (!isReportedPhishing && !isActuallyPhishing) result = "TN"
    else if (isReportedPhishing && !isActuallyPhishing) result = "FP"
    else result = "FN" // Marked legitimate but it is phishing

    updateCurrentState({ answered: true, result })

    if (result === "FN") {
      // Trigger glitch
      setShowGlitch(true)
      setTimeout(() => {
        setShowGlitch(false)
        setShowFeedback(true)
      }, 2500)
    } else {
      setShowFeedback(true)
    }
  }

  const handleLinkClick = (isDangerous: boolean) => {
    if (currentEmailState.answered) return

    if (isDangerous) {
      updateCurrentState({ answered: true, result: "FN" })
      setShowGlitch(true)
      setTimeout(() => {
        setShowGlitch(false)
        setShowFeedback(true)
      }, 2500)
    } else {
      toast("Anda mengklik tautan yang aman.")
    }
  }

  const handleNext = () => {
    if (currentIndex < totalScenarios - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowFeedback(false)
    } else {
      setCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setEmailStates(phishingScenarios.map(() => ({
      investigated: false,
      senderExpanded: false,
      headerExpanded: false,
      hoveredLink: false,
      answered: false,
      result: null
    })))
    setShowFeedback(false)
    setCompleted(false)
  }

  const handleDummyAction = (action: string) => {
    toast(`Aksi ${action} dinonaktifkan dalam simulasi ini.`)
  }

  if (completed) {
    const tpCount = emailStates.filter(s => s.result === "TP").length
    const tnCount = emailStates.filter(s => s.result === "TN").length
    const fnCount = emailStates.filter(s => s.result === "FN").length
    const fpCount = emailStates.filter(s => s.result === "FP").length
    const investigatedCount = emailStates.filter(s => s.investigated).length
    
    const correctCount = tpCount + tnCount
    const accuracy = Math.round((correctCount / totalScenarios) * 100)
    
    return (
      <MainLayout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 border-border bg-card">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-accent/20 flex items-center justify-center">
                  <Target className="h-12 w-12 text-accent" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">Simulasi Selesai!</h1>
              <p className="text-muted-foreground">Anda telah mereview {totalScenarios} email.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-panel border border-border text-center">
                <div className="text-3xl font-bold text-accent mb-1">{score}</div>
                <div className="text-xs text-muted-foreground uppercase">Skor Total</div>
              </div>
              <div className="p-4 rounded-lg bg-panel border border-border text-center">
                <div className="text-3xl font-bold text-[var(--success)] mb-1">{accuracy}%</div>
                <div className="text-xs text-muted-foreground uppercase">Akurasi</div>
              </div>
              <div className="p-4 rounded-lg bg-panel border border-border text-center">
                <div className="text-3xl font-bold text-[var(--danger)] mb-1">{fnCount}</div>
                <div className="text-xs text-muted-foreground uppercase">Missed Phishing</div>
              </div>
              <div className="p-4 rounded-lg bg-panel border border-border text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-1">{fpCount}</div>
                <div className="text-xs text-muted-foreground uppercase">False Positives</div>
              </div>
            </div>

            <div className="bg-panel/50 p-4 rounded-lg border border-border mb-8 flex items-center gap-4">
              <Search className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">Insight Investigasi</p>
                <p className="text-sm text-muted-foreground">Kamu menggunakan tools investigasi (cek domain, header, link) di <strong>{investigatedCount} dari {totalScenarios}</strong> email.</p>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              {accuracy >= 80 && (
                <Badge className="bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30 px-4 py-2 text-sm border-[var(--success)]/30">
                  🎯 Phishing Hunter
                </Badge>
              )}
              {investigatedCount >= 7 && (
                <Badge className="bg-accent/20 text-accent hover:bg-accent/30 px-4 py-2 text-sm border-accent/30">
                  🔍 Careful Investigator
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={handleRestart} size="lg" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Coba Lagi
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/simulator">Kembali ke Dashboard</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-background">
      {/* Glitch Overlay */}
      <AnimatePresence>
        {showGlitch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/90 backdrop-blur-sm"
            style={{
              animation: "flicker 0.15s infinite"
            }}
          >
            <style>{`
              @keyframes flicker {
                0% { opacity: 0.9; transform: translate(2px, 2px); }
                50% { opacity: 0.8; transform: translate(-2px, -2px); filter: hue-rotate(90deg); }
                100% { opacity: 1; transform: translate(0, 0); }
              }
            `}</style>
            <div className="text-center">
              <AlertTriangle className="h-32 w-32 text-red-500 mx-auto mb-8 animate-pulse" />
              <h1 className="text-6xl font-black text-red-500 tracking-widest mb-4">SYSTEM COMPROMISED</h1>
              <p className="text-red-300 text-xl">Kredensial Anda telah berhasil dicuri.</p>
              
              <Button 
                variant="ghost" 
                className="mt-12 text-red-400 hover:text-red-200"
                onClick={() => setShowGlitch(false)}
              >
                Lewati Efek
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Kiri: Inbox */}
        <div className="w-[320px] border-r border-border bg-card flex flex-col hidden md:flex shrink-0">
          <div className="p-4 border-b border-border bg-panel/30">
            <h2 className="font-semibold text-lg mb-2">Inbox Simulasi</h2>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{answeredCount} dari {totalScenarios} selesai</span>
              <span className="font-semibold text-foreground">Score: {score}</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {phishingScenarios.map((scenario, idx) => {
              const state = emailStates[idx]
              const isActive = idx === currentIndex
              return (
                <div 
                  key={scenario.id}
                  className={`p-4 border-b border-border cursor-pointer transition-colors ${
                    isActive ? "bg-accent/10 border-l-4 border-l-accent" : "hover:bg-panel/50 border-l-4 border-l-transparent"
                  } ${state.answered ? "opacity-60" : ""}`}
                  onClick={() => !state.answered && setCurrentIndex(idx)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold truncate pr-2">{scenario.senderName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{scenario.timestamp}</span>
                  </div>
                  <div className="text-sm font-medium truncate mb-1">{scenario.subject}</div>
                  <div className="text-xs text-muted-foreground truncate">{scenario.snippet}</div>
                  
                  {state.answered && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      {state.result === "TP" || state.result === "TN" ? (
                        <span className="text-[var(--success)] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Benar</span>
                      ) : (
                        <span className="text-[var(--danger)] flex items-center gap-1"><XCircle className="h-3 w-3" /> Salah</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel Kanan: Email Detail */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/* Header Mobile (Sidebar replacement) */}
          <div className="md:hidden p-4 border-b border-border bg-card flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Email {currentIndex + 1} dari {totalScenarios}</div>
              <div className="font-semibold">Score: {score}</div>
            </div>
            <Progress value={progress} className="h-2 w-24 bg-muted" />
          </div>

          {!showFeedback ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Email Header */}
              <div className="p-6 border-b border-border bg-card">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0 text-accent font-bold text-lg">
                    {currentScenario.senderName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Collapsible 
                      onOpenChange={(open) => {
                        if (open) updateCurrentState({ senderExpanded: true })
                      }}
                    >
                      <CollapsibleTrigger className="flex items-center gap-2 hover:bg-panel p-1 -ml-1 rounded transition-colors">
                        <h3 className="font-semibold text-lg">{currentScenario.senderName}</h3>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 p-3 bg-panel rounded-md border border-border text-sm">
                        <div className="grid grid-cols-[80px_1fr] gap-2 mb-2">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-mono">{currentScenario.senderEmail}</span>
                        </div>
                        {currentScenario.displayNameMismatch && (
                          <div className="flex items-start gap-2 text-yellow-500 mt-2 bg-yellow-500/10 p-2 rounded">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span className="text-xs">Peringatan: Alamat email pengirim ({currentScenario.senderEmail.split('@')[1]}) tidak sesuai dengan nama tampilan.</span>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                    
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-4">
                      <span>Kpd: Anda</span>
                      <span>{currentScenario.timestamp}</span>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">{currentScenario.subject}</h2>

                <Collapsible 
                  onOpenChange={(open) => {
                    if (open) updateCurrentState({ headerExpanded: true })
                  }}
                >
                  <CollapsibleTrigger className="text-xs text-accent hover:underline flex items-center gap-1">
                    Lihat Header Email
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 p-4 bg-black rounded-md border border-border text-xs font-mono text-gray-300 overflow-x-auto">
                    <div className="grid grid-cols-[80px_1fr] gap-y-1">
                      <span className="text-gray-500">From:</span>
                      <span>{currentScenario.headers.from}</span>
                      
                      <span className="text-gray-500">Reply-To:</span>
                      <span className={currentScenario.headers.replyTo !== currentScenario.headers.from ? "text-yellow-400" : ""}>
                        {currentScenario.headers.replyTo}
                      </span>
                      
                      <span className="text-gray-500">Received:</span>
                      <span>{currentScenario.headers.received}</span>
                      
                      <span className="text-gray-500">SPF/DKIM:</span>
                      <span className={currentScenario.headers.spfDkim === "Fail" ? "text-red-400 font-bold" : "text-green-400"}>
                        {currentScenario.headers.spfDkim}
                      </span>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-white text-black relative">
                <div className="text-base leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: currentScenario.body }} />
                
                {currentScenario.links.length > 0 && (
                  <div className="space-y-4">
                    {currentScenario.links.map((link, i) => (
                      <div key={i}>
                        <a 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handleLinkClick(link.isDangerous)
                          }}
                          onMouseEnter={() => {
                            setHoveredUrl(link.actualUrl)
                            updateCurrentState({ hoveredLink: true })
                          }}
                          onMouseLeave={() => setHoveredUrl(null)}
                          className="inline-block text-blue-600 underline hover:text-blue-800 transition-colors"
                        >
                          {link.text}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {currentScenario.attachment && (
                  <div className="mt-8 border border-gray-200 rounded-md p-3 inline-flex items-center gap-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                       onMouseEnter={() => updateCurrentState({ hoveredLink: true })}
                       onClick={() => handleLinkClick(currentScenario.attachment!.isSuspicious)}>
                    <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center text-red-500">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{currentScenario.attachment.filename}</div>
                      <div className="text-xs text-gray-500">1.2 MB</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fake Status Bar (shows when hovering links) */}
              <AnimatePresence>
                {hoveredUrl && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-[90px] left-0 right-0 bg-gray-100 text-gray-600 text-xs px-2 py-1 border-t border-gray-300 font-mono z-10 truncate"
                  >
                    {hoveredUrl}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Toolbar */}
              <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-20">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={() => handleAnswer(true)} 
                    className="bg-[var(--danger)] hover:bg-[var(--danger)]/90 text-white gap-2 flex-1 sm:flex-none"
                  >
                    <Flag className="h-4 w-4" /> Report Phishing
                  </Button>
                  <Button 
                    onClick={() => handleAnswer(false)} 
                    variant="outline"
                    className="border-[var(--success)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white gap-2 flex-1 sm:flex-none"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Ini Legitimate
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  {currentEmailState.investigated && (
                    <Badge variant="outline" className="hidden sm:flex border-accent text-accent gap-1 py-1">
                      <Search className="h-3 w-3" /> Investigated
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleDummyAction("Reply")}>
                          <Reply className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Balas Email</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleDummyAction("Delete")}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Hapus Email</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Feedback State */
            <div className="flex-1 overflow-y-auto bg-card p-6 md:p-12 flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto w-full flex flex-col h-full"
              >
                {currentEmailState.result === "FN" && (
                  <div className="mb-8 p-6 bg-[var(--danger)]/10 border border-[var(--danger)] rounded-lg">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="h-8 w-8 text-[var(--danger)] shrink-0 mt-1" />
                      <div>
                        <h2 className="text-xl font-bold text-[var(--danger)] mb-2">Ini simulasi — tapi di dunia nyata, ini yang akan terjadi.</h2>
                        <p className="text-sm text-foreground/80">
                          Anda baru saja mengklik tautan berbahaya atau membiarkan email phishing lewat. Di lingkungan kerja nyata, tindakan ini bisa menyebabkan peretasan jaringan, pencurian data, atau infeksi ransomware.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentEmailState.result === "FP" && (
                  <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-4">
                      <Info className="h-8 w-8 text-yellow-500 shrink-0 mt-1" />
                      <div>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">Hati-hati, ini email asli (False Positive)</h2>
                        <p className="text-sm text-foreground/80">
                          Melaporkan email yang sah sebagai phishing juga memiliki dampak negatif. Ini menyebabkan <em>alert fatigue</em> bagi tim keamanan dan menunda pekerjaan penting Anda. Selalu gunakan metode investigasi sebelum melaporkan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {(currentEmailState.result === "TP" || currentEmailState.result === "TN") && (
                  <div className="mb-8 p-6 bg-[var(--success)]/10 border border-[var(--success)] rounded-lg">
                    <div className="flex items-start gap-4">
                      <ShieldCheck className="h-8 w-8 text-[var(--success)] shrink-0 mt-1" />
                      <div>
                        <h2 className="text-xl font-bold text-[var(--success)] mb-2">Kerja Bagus!</h2>
                        <p className="text-sm text-foreground/80">
                          Anda berhasil mengidentifikasi {currentScenario.isPhishing ? "email phishing ini dengan tepat." : "bahwa email ini legitimate."}
                        </p>
                        {currentEmailState.investigated && (
                          <div className="mt-2 text-xs font-semibold text-accent flex items-center gap-1">
                            <Target className="h-3 w-3" /> +2 Poin Bonus Investigasi
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-panel rounded-lg p-6 border border-border mb-8 flex-1">
                  <h3 className="font-semibold text-lg mb-4">Analisis Skenario</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                    {currentScenario.explanation}
                  </p>
                  
                  {currentScenario.redFlags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-foreground">Yang perlu diperhatikan:</h4>
                      <ul className="space-y-3">
                        {currentScenario.redFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-[var(--danger)]/20 flex items-center justify-center">
                              <Flag className="h-3 w-3 text-[var(--danger)]" />
                            </div>
                            <span className="text-muted-foreground leading-relaxed">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <Button onClick={handleNext} className="w-full gap-2" size="lg">
                    {currentIndex < totalScenarios - 1 ? 'Lanjut ke Email Berikutnya' : 'Lihat Hasil Akhir'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
    </MainLayout>
  )
}
