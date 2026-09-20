import { MainLayout } from "@/components/layout/main-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Shield, Mail, Globe, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PhishingCampaignsClient } from "./_components/phishing-campaigns-client"

export default async function PhishingCampaignsPage() {
  // Fetch data from database
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { targets: true }
      }
    }
  })
  const campaignCount = campaigns.length
  
  const emailTemplates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: "desc" }
  })
  const landingPages = await prisma.landingPageTemplate.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Phishing Campaign Simulator</h1>
            <p className="text-sm text-muted-foreground">
              Kelola dan pantau kampanye simulasi phishing.
            </p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/phishing-campaigns/new">
              <Plus className="h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Campaigns"
            value={campaignCount}
            icon={Shield}
          />
          <StatCard
            title="Email Templates"
            value={emailTemplates.length}
            icon={Mail}
          />
          <StatCard
            title="Landing Pages"
            value={landingPages.length}
            icon={Globe}
          />
        </div>

        {/* Client Tabs Component */}
        <PhishingCampaignsClient 
          campaigns={campaigns}
          emailTemplates={emailTemplates} 
          landingPages={landingPages} 
        />
        
      </div>
    </MainLayout>
  )
}
