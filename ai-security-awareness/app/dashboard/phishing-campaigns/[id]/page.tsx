import { MainLayout } from "@/components/layout/main-layout"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Globe, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CampaignLaunchButton } from "./campaign-detail-client"

interface Props {
  params: {
    id: string
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary" className="uppercase">Draft</Badge>
    case "active":
      return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 uppercase">Active</Badge>
    case "completed":
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 uppercase">Completed</Badge>
    default:
      return <Badge variant="secondary" className="uppercase">{status}</Badge>
  }
}

function getTargetStatusBadge(status: string) {
  switch (status) {
    case "Pending":
      return <Badge variant="outline" className="text-muted-foreground font-normal">Pending</Badge>
    case "Sent":
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-0">Sent</Badge>
    case "Opened":
      return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-0">Opened</Badge>
    case "Clicked":
      return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-0">Clicked</Badge>
    case "Submitted":
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0">Submitted</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params
  
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      emailTemplate: true,
      landingPage: true,
      targets: {
        include: {
          events: {
            orderBy: { timestamp: "desc" },
          },
        },
      },
      events: true,
    }
  })

  if (!campaign) {
    notFound()
  }

  // Calculate tracking stats
  const totalTargets = campaign.targets.length
  const sentCount = campaign.targets.filter(t => t.status !== "Pending").length
  const openedCount = campaign.targets.filter(t => 
    ["Opened", "Clicked", "Submitted"].includes(t.status)
  ).length
  const clickedCount = campaign.targets.filter(t => 
    ["Clicked", "Submitted"].includes(t.status)
  ).length

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/dashboard/phishing-campaigns" className="hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Campaigns
              </Link>
              <span>/</span>
              <span>{campaign.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{campaign.name}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            {campaign.note && (
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{campaign.note}</p>
            )}
          </div>
          
          <CampaignLaunchButton
            campaignId={campaign.id}
            campaignStatus={campaign.status}
            targetCount={totalTargets}
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Email Template</div>
              <div className="text-foreground font-semibold">{campaign.emailTemplate.name}</div>
              <div className="text-sm text-muted-foreground line-clamp-1 mt-1">From: {campaign.emailTemplate.sender}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">Sub: {campaign.emailTemplate.subject}</div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Landing Page Template</div>
              <div className="text-foreground font-semibold">{campaign.landingPage.name}</div>
              <div className="mt-2">
                <Badge variant="outline">{campaign.landingPage.category}</Badge>
              </div>
            </div>
          </div>

          {/* Launch Info Card */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Campaign Info</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{totalTargets} targets</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Dibuat: {new Date(campaign.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>
                {campaign.launchedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">
                      Launched: {new Date(campaign.launchedAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Stats (only show if campaign has been launched) */}
        {campaign.status !== "draft" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-foreground">{sentCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Terkirim</div>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-3">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${totalTargets > 0 ? (sentCount / totalTargets) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-amber-500">{openedCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Dibuka</div>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-3">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${sentCount > 0 ? (openedCount / sentCount) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-orange-500">{clickedCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Klik Link</div>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-3">
                <div
                  className="bg-orange-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${sentCount > 0 ? (clickedCount / sentCount) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-foreground">
                {sentCount > 0 ? Math.round((clickedCount / sentCount) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Click Rate</div>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-3">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${sentCount > 0 ? (clickedCount / sentCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Targets Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Daftar Target ({totalTargets})</h2>
          </div>
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tracking Status</TableHead>
                  <TableHead>Last Event</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign.targets.map((t) => {
                  const lastEvent = t.events?.[0]
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.email}</TableCell>
                      <TableCell>{getTargetStatusBadge(t.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lastEvent ? (
                          <span>
                            {lastEvent.type} — {new Date(lastEvent.timestamp).toLocaleString("id-ID", {
                              day: "numeric", month: "short",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        
      </div>
    </MainLayout>
  )
}
