"use client"

import { useState } from "react"
import { Eye, ExternalLink, Plus, Search, Mail, FileType } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Minimal types mirroring Prisma types
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

type CampaignWithTargetCount = {
  id: string
  name: string
  status: string
  createdAt: Date
  _count: { targets: number }
}

interface Props {
  campaigns: CampaignWithTargetCount[]
  emailTemplates: EmailTemplate[]
  landingPages: LandingPageTemplate[]
}

export function PhishingCampaignsClient({ campaigns, emailTemplates, landingPages }: Props) {
  const [emailSearch, setEmailSearch] = useState("")
  const [emailCategory, setEmailCategory] = useState("all")
  const [emailDifficulty, setEmailDifficulty] = useState("all")
  
  const [previewEmail, setPreviewEmail] = useState<EmailTemplate | null>(null)

  // Filter logic for email templates
  const filteredEmails = emailTemplates.filter((tpl) => {
    const matchesSearch = tpl.name.toLowerCase().includes(emailSearch.toLowerCase()) || 
                          tpl.subject.toLowerCase().includes(emailSearch.toLowerCase())
    const matchesCategory = emailCategory === "all" || tpl.category === emailCategory
    const matchesDifficulty = emailDifficulty === "all" || tpl.difficulty === emailDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Filter logic for landing pages (simple for now)
  const filteredLandingPages = landingPages

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
      case "medium":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
      case "hard":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return "bg-secondary text-foreground hover:bg-secondary/80"
    }
  }

  return (
    <>
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="mb-4 bg-card border border-border">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
          <TabsTrigger value="landing-pages">Landing Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-0">
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-xl border-dashed">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Belum ada campaign</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Buat campaign phishing pertamamu untuk melatih karyawan mengenali ancaman siber terbaru.
              </p>
              <Button className="gap-2" onClick={() => window.location.href = "/dashboard/phishing-campaigns/new"}>
                <Plus className="w-4 h-4" />
                Buat Campaign Baru
              </Button>
            </div>
          ) : (
            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead>Nama Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "draft" ? "secondary" : "default"}>
                          {c.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{c._count.targets} targets</TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/dashboard/phishing-campaigns/${c.id}`}>
                          Lihat Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="email-templates" className="mt-0 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border p-3 rounded-lg shadow-sm">
            <div className="relative w-full sm:w-[250px] shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari template email..."
                className="pl-9 bg-background border-border"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
              />
            </div>
            <Select value={emailCategory} onValueChange={setEmailCategory}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="Credential Harvesting">Credential Harvesting</SelectItem>
                <SelectItem value="Billing Scam">Billing Scam</SelectItem>
                <SelectItem value="Notification Scam">Notification Scam</SelectItem>
                <SelectItem value="Phishing">Phishing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={emailDifficulty} onValueChange={setEmailDifficulty}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background border-border">
                <SelectValue placeholder="Semua Kesulitan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kesulitan</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="font-medium">{tpl.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground font-normal">
                        {tpl.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(tpl.difficulty)}>
                        {tpl.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[200px]">{tpl.sender}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[200px]">{tpl.subject}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewEmail(tpl)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Tidak ada template yang cocok dengan filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="landing-pages" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLandingPages.map((lp) => (
              <div key={lp.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col group">
                <div className="h-[200px] bg-secondary/30 relative overflow-hidden flex items-center justify-center border-b border-border">
                  {/* Thumbnail using an iframe that scales down */}
                  <div className="absolute inset-0 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                    <iframe
                      srcDoc={lp.htmlContent}
                      title={`Preview of ${lp.name}`}
                      sandbox="allow-same-origin"
                      style={{
                        width: "400%",
                        height: "400%",
                        border: "none",
                        transform: "scale(0.25)",
                        transformOrigin: "0 0"
                      }}
                    />
                  </div>
                  {/* Fallback icon if iframe fails or is loading */}
                  <FileType className="w-10 h-10 text-muted-foreground/30 absolute z-[-1]" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="font-semibold text-foreground line-clamp-1" title={lp.name}>{lp.name}</h4>
                    <Badge variant="outline" className="shrink-0">{lp.category}</Badge>
                  </div>
                  <div className="mt-auto pt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 border-border" 
                      onClick={() => window.open(`/dashboard/phishing-campaigns/landing-pages/${lp.id}/preview`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Preview Full
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Preview Dialog */}
      <Dialog open={!!previewEmail} onOpenChange={(open) => !open && setPreviewEmail(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 border-b border-border pb-4">
            <DialogTitle>Preview Email Template</DialogTitle>
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
    </>
  )
}
