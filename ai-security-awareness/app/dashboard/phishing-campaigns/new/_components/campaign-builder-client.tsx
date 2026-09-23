"use client"

import { useState, useTransition } from "react"
import { Check, ChevronRight, FileType, Trash2, ShieldAlert, Mail, Eye, Globe, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createCampaign } from "../../actions"

type EmailTemplate = {
  id: string
  name: string
  category: string
  difficulty: string
  sender: string
  subject: string
  bodyHtml: string
}

type LandingPageTemplate = {
  id: string
  name: string
  category: string
  htmlContent: string
}

interface Props {
  emailTemplates: EmailTemplate[]
  landingPages: LandingPageTemplate[]
}

export function CampaignBuilderClient({ emailTemplates, landingPages }: Props) {
  const [step, setStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: "",
    note: "",
    emailTemplateId: "",
    landingPageId: "",
    targets: [] as { name: string; email: string }[]
  })

  // Step 2 specific state
  const [previewEmail, setPreviewEmail] = useState<EmailTemplate | null>(null)

  // Step 3 specific state
  const [targetName, setTargetName] = useState("")
  const [targetEmail, setTargetEmail] = useState("")
  
  // Step 4 specific state
  const [consentChecked, setConsentChecked] = useState(false)

  const handleNext = () => setStep(s => Math.min(4, s + 1))
  const handlePrev = () => setStep(s => Math.max(1, s - 1))

  const addTarget = () => {
    if (!targetName || !targetEmail) return
    if (!targetEmail.includes("@")) return
    if (formData.targets.some(t => t.email === targetEmail)) return // No duplicate
    
    setFormData(prev => ({
      ...prev,
      targets: [...prev.targets, { name: targetName, email: targetEmail }]
    }))
    setTargetName("")
    setTargetEmail("")
  }

  const removeTarget = (email: string) => {
    setFormData(prev => ({
      ...prev,
      targets: prev.targets.filter(t => t.email !== email)
    }))
  }

  const handleSubmit = () => {
    if (!consentChecked) return
    startTransition(async () => {
      await createCampaign(formData)
    })
  }

  const selectedEmail = emailTemplates.find(t => t.id === formData.emailTemplateId)
  const selectedLandingPage = landingPages.find(t => t.id === formData.landingPageId)

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400", label: "Easy" }
      case "medium":
        return { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400", label: "Medium" }
      case "hard":
        return { color: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400", label: "Hard" }
      default:
        return { color: "bg-secondary text-muted-foreground border-border", dot: "bg-muted-foreground", label: difficulty }
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "credential harvesting":
        return "🔐"
      case "billing scam":
        return "💳"
      case "notification scam":
        return "🔔"
      case "software update":
        return "⚙️"
      default:
        return "📧"
    }
  }

  const stepLabels = ["Info Dasar", "Pilih Template", "Target", "Review"]

  return (
    <div className="flex flex-col gap-8">
      {/* Stepper Indicator - Enhanced */}
      <div className="flex items-center gap-0">
        {stepLabels.map((label, i) => {
          const s = i + 1
          const isActive = step === s
          const isCompleted = step > s
          return (
            <div key={s} className="flex items-center flex-1 last:flex-initial">
              <div className="flex items-center gap-2.5">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300
                  ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110' : ''}
                  ${isCompleted ? 'bg-primary/20 text-primary' : ''}
                  ${!isActive && !isCompleted ? 'bg-secondary text-muted-foreground' : ''}
                `}>
                  {isCompleted ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
              {s < 4 && (
                <div className={`flex-1 h-[2px] mx-3 rounded-full transition-colors ${isCompleted ? 'bg-primary/40' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-lg font-semibold mb-1">Informasi Dasar Campaign</h2>
              <p className="text-sm text-muted-foreground">Berikan nama dan tujuan untuk campaign ini.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Campaign <span className="text-destructive">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="mis. Test Awareness Q1 - Tim Marketing"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Catatan / Tujuan (Opsional)</Label>
                <Textarea 
                  id="note" 
                  placeholder="Catatan internal..."
                  rows={4}
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({...prev, note: e.target.value}))}
                />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={handleNext} disabled={!formData.name.trim()}>Lanjut &rarr;</Button>
            </div>
          </div>
        )}

        {/* STEP 2 - Enhanced Template Selection */}
        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-1">Pilih Template</h2>
              <p className="text-sm text-muted-foreground">Pilih email phishing dan landing page yang akan digunakan untuk simulasi.</p>
            </div>
            
            {/* Section 1: Email Template */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Email Template</h3>
                  <p className="text-xs text-muted-foreground">Pilih template email phishing yang ingin dikirim ke target</p>
                </div>
                {selectedEmail && (
                  <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Terpilih
                  </Badge>
                )}
              </div>

              <div className="grid gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {emailTemplates.map(tpl => {
                  const isSelected = formData.emailTemplateId === tpl.id
                  const diffConfig = getDifficultyConfig(tpl.difficulty)
                  return (
                    <div 
                      key={tpl.id}
                      onClick={() => setFormData(prev => ({...prev, emailTemplateId: tpl.id}))}
                      className={`
                        group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                          : 'border-transparent bg-background hover:bg-secondary/50 hover:border-border'
                        }
                      `}
                    >
                      {/* Selection indicator */}
                      <div className={`
                        absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-transparent'}
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>

                      <div className="flex items-start gap-3 pr-8">
                        {/* Category emoji icon */}
                        <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center text-lg shrink-0">
                          {getCategoryIcon(tpl.category)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-semibold text-sm text-foreground line-clamp-1">{tpl.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={`text-[10px] border ${diffConfig.color} gap-1`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
                              {diffConfig.label}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
                              {tpl.category}
                            </Badge>
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1.5">
                              <span className="text-muted-foreground/60 font-medium min-w-[36px]">From</span>
                              <span className="text-foreground/70">{tpl.sender}</span>
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1.5">
                              <span className="text-muted-foreground/60 font-medium min-w-[36px]">Subj</span>
                              <span className="text-foreground/70">{tpl.subject}</span>
                            </div>
                          </div>
                        </div>

                        {/* Preview button */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewEmail(tpl)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-xs text-muted-foreground uppercase tracking-widest">Langkah berikutnya</span>
              </div>
            </div>

            {/* Section 2: Landing Page Template */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Landing Page Template</h3>
                  <p className="text-xs text-muted-foreground">Halaman palsu yang ditampilkan saat target mengklik link phishing</p>
                </div>
                {selectedLandingPage && (
                  <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Terpilih
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {landingPages.map(lp => {
                  const isSelected = formData.landingPageId === lp.id
                  return (
                    <div 
                      key={lp.id}
                      onClick={() => setFormData(prev => ({...prev, landingPageId: lp.id}))}
                      className={`
                        group relative rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden flex flex-col
                        ${isSelected 
                          ? 'border-primary shadow-md shadow-primary/10' 
                          : 'border-transparent hover:border-border'
                        }
                      `}
                    >
                      {/* Selection overlay */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}

                      {/* Preview thumbnail */}
                      <div className={`
                        h-[120px] bg-secondary/30 relative overflow-hidden flex items-center justify-center
                        ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}
                        transition-opacity duration-200
                      `}>
                        <div className="absolute inset-0 pointer-events-none">
                          <iframe
                            srcDoc={lp.htmlContent}
                            title={`Preview ${lp.name}`}
                            sandbox="allow-same-origin"
                            style={{ width: "400%", height: "400%", border: "none", transform: "scale(0.25)", transformOrigin: "0 0" }}
                          />
                        </div>
                        <FileType className="w-6 h-6 text-muted-foreground/20 absolute z-[-1]" />
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {isSelected ? "✓ Terpilih" : "Klik untuk memilih"}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className={`p-3 ${isSelected ? 'bg-primary/5' : 'bg-background'} transition-colors`}>
                        <div className="font-semibold text-sm line-clamp-1 mb-1.5">{lp.name}</div>
                        <Badge variant="secondary" className="text-[10px]">{lp.category}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Summary bar if both selected */}
            {selectedEmail && selectedLandingPage && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-400">
                  <span className="font-medium">{selectedEmail.name}</span>
                  <span className="text-emerald-400/60 mx-2">→</span>
                  <span className="font-medium">{selectedLandingPage.name}</span>
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={handlePrev}>&larr; Kembali</Button>
              <Button onClick={handleNext} disabled={!formData.emailTemplateId || !formData.landingPageId}>Lanjut &rarr;</Button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Tambahkan Target</h2>
              <p className="text-sm text-amber-500/90 italic flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" />
                Hanya tambahkan target yang sudah memberikan izin/consent untuk simulasi ini.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-end gap-4 bg-background p-4 border border-border rounded-lg">
              <div className="space-y-2 flex-1 w-full">
                <Label htmlFor="t_name">Nama</Label>
                <Input 
                  id="t_name" 
                  placeholder="John Doe" 
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTarget()}
                />
              </div>
              <div className="space-y-2 flex-1 w-full">
                <Label htmlFor="t_email">Email</Label>
                <Input 
                  id="t_email" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTarget()}
                />
              </div>
              <Button onClick={addTarget} className="w-full sm:w-auto mt-4 sm:mt-0">
                + Tambah
              </Button>
            </div>

            <div className="border border-border rounded-lg bg-background overflow-hidden max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-secondary/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.targets.map((t, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.email}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeTarget(t.email)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {formData.targets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                        Belum ada target yang ditambahkan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between pt-4 border-t border-border mt-8">
              <Button variant="outline" onClick={handlePrev}>&larr; Kembali</Button>
              <Button onClick={handleNext} disabled={formData.targets.length === 0}>Lanjut &rarr;</Button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Review & Simpan</h2>
              <p className="text-sm text-muted-foreground">Periksa kembali detail campaign sebelum menyimpannya sebagai draft.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-background border border-border p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Nama Campaign</div>
                  <div className="font-medium text-foreground">{formData.name}</div>
                  {formData.note && (
                    <>
                      <div className="text-xs text-muted-foreground mt-3 mb-1">Catatan</div>
                      <div className="text-sm text-foreground">{formData.note}</div>
                    </>
                  )}
                </div>

                <div className="bg-background border border-border p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-2">Total Target</div>
                  <div className="font-medium text-foreground text-2xl">{formData.targets.length}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {formData.targets.slice(0, 3).map((t, i) => (
                      <Badge key={i} variant="secondary" className="font-normal text-xs">{t.email}</Badge>
                    ))}
                    {formData.targets.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{formData.targets.length - 3} lainnya</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-background border border-border p-4 rounded-lg flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">Email Template</div>
                    <div className="font-medium text-foreground line-clamp-1">{selectedEmail?.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">Sub: {selectedEmail?.subject}</div>
                  </div>
                </div>

                <div className="bg-background border border-border p-4 rounded-lg flex gap-4 items-center">
                  <div className="w-16 h-12 bg-secondary/30 relative overflow-hidden flex items-center justify-center rounded border border-border shrink-0">
                    {selectedLandingPage && (
                      <div className="absolute inset-0 pointer-events-none opacity-50">
                        <iframe
                          srcDoc={selectedLandingPage.htmlContent}
                          title={`Preview ${selectedLandingPage.name}`}
                          sandbox="allow-same-origin"
                          style={{ width: "400%", height: "400%", border: "none", transform: "scale(0.25)", transformOrigin: "0 0" }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">Landing Page Template</div>
                    <div className="font-medium text-foreground line-clamp-1">{selectedLandingPage?.name}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="consent" 
                  checked={consentChecked} 
                  onCheckedChange={(c) => setConsentChecked(!!c)} 
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="consent" className="text-sm font-medium leading-none cursor-pointer">
                    Konfirmasi Izin Target
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Saya mengonfirmasi bahwa seluruh target pada list ini telah memberikan izin untuk menerima simulasi ini.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border mt-8">
              <Button variant="outline" onClick={handlePrev} disabled={isPending}>&larr; Kembali</Button>
              <Button onClick={handleSubmit} disabled={!consentChecked || isPending}>
                {isPending ? "Menyimpan..." : "Simpan sebagai Draft"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Email Preview Dialog */}
      <Dialog open={!!previewEmail} onOpenChange={(open) => !open && setPreviewEmail(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 border-b border-border pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              Preview: {previewEmail?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4 flex-1 flex flex-col overflow-hidden">
            <div className="bg-card border border-border rounded-t-lg p-4 space-y-2">
              <div className="grid grid-cols-[80px_1fr] items-center gap-2 text-sm">
                <span className="text-muted-foreground font-medium">From:</span>
                <span className="text-foreground">{previewEmail?.sender}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] items-center gap-2 text-sm">
                <span className="text-muted-foreground font-medium">Subject:</span>
                <span className="text-foreground font-medium">{previewEmail?.subject}</span>
              </div>
            </div>
            <div className="flex-1 bg-white border border-t-0 border-border rounded-b-lg overflow-hidden relative">
              {previewEmail && (
                <iframe
                  srcDoc={previewEmail.bodyHtml}
                  title={`Preview of ${previewEmail.name}`}
                  sandbox="allow-same-origin"
                  className="w-full h-full border-none bg-white"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
