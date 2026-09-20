"use client"

import { useState } from "react"
import { Check, ChevronRight, FileType, Trash2, ShieldAlert } from "lucide-react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    note: "",
    emailTemplateId: "",
    landingPageId: "",
    targets: [] as { name: string; email: string }[]
  })

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

  const handleSubmit = async () => {
    if (!consentChecked) return
    setIsSubmitting(true)
    try {
      await createCampaign(formData)
    } catch (e) {
      console.error(e)
      setIsSubmitting(false)
    }
  }

  const selectedEmail = emailTemplates.find(t => t.id === formData.emailTemplateId)
  const selectedLandingPage = landingPages.find(t => t.id === formData.landingPageId)

  return (
    <div className="flex flex-col gap-8">
      {/* Stepper Indicator */}
      <div className="flex items-center gap-2 text-sm font-medium">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full \${step === s ? 'bg-primary text-primary-foreground' : step > s ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={step === s ? "text-foreground" : "text-muted-foreground"}>
              {s === 1 && "Info Dasar"}
              {s === 2 && "Pilih Template"}
              {s === 3 && "Target"}
              {s === 4 && "Review"}
            </span>
            {s < 4 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />}
          </div>
        ))}
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

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Pilih Template</h2>
              <p className="text-sm text-muted-foreground">Pilih email pengelabuan dan landing page palsu yang akan digunakan.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kolom Kiri: Email Templates */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground border-b border-border pb-2">1. Email Template</h3>
                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {emailTemplates.map(tpl => (
                    <div 
                      key={tpl.id}
                      onClick={() => setFormData(prev => ({...prev, emailTemplateId: tpl.id}))}
                      className={`p-4 rounded-lg border cursor-pointer transition-all \${formData.emailTemplateId === tpl.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-background hover:border-primary/50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm line-clamp-1">{tpl.name}</span>
                        <Badge variant="outline" className="text-[10px]">{tpl.difficulty}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mb-1">From: {tpl.sender}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">Subject: {tpl.subject}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kolom Kanan: Landing Pages */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground border-b border-border pb-2">2. Landing Page Template</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {landingPages.map(lp => (
                    <div 
                      key={lp.id}
                      onClick={() => setFormData(prev => ({...prev, landingPageId: lp.id}))}
                      className={`rounded-lg border cursor-pointer transition-all overflow-hidden flex flex-col \${formData.landingPageId === lp.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-background hover:border-primary/50'}`}
                    >
                      <div className="h-[100px] bg-secondary/30 relative overflow-hidden flex items-center justify-center border-b border-border">
                        <div className="absolute inset-0 pointer-events-none opacity-50">
                          <iframe
                            srcDoc={lp.htmlContent}
                            title={`Preview ${lp.name}`}
                            sandbox="allow-same-origin"
                            style={{ width: "400%", height: "400%", border: "none", transform: "scale(0.25)", transformOrigin: "0 0" }}
                          />
                        </div>
                        <FileType className="w-6 h-6 text-muted-foreground/30 absolute z-[-1]" />
                      </div>
                      <div className="p-3">
                        <div className="font-semibold text-sm line-clamp-1 mb-1">{lp.name}</div>
                        <Badge variant="secondary" className="text-[10px]">{lp.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border mt-8">
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
              <Button variant="outline" onClick={handlePrev} disabled={isSubmitting}>&larr; Kembali</Button>
              <Button onClick={handleSubmit} disabled={!consentChecked || isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan sebagai Draft"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
