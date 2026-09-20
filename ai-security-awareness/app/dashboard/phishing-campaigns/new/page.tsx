import { MainLayout } from "@/components/layout/main-layout"
import { prisma } from "@/lib/prisma"
import { CampaignBuilderClient } from "./_components/campaign-builder-client"

export default async function NewCampaignPage() {
  const emailTemplates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: "desc" }
  })
  
  const landingPages = await prisma.landingPageTemplate.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Buat Campaign Baru</h1>
          <p className="text-sm text-muted-foreground">
            Konfigurasi simulasi phishing baru dalam 4 langkah mudah.
          </p>
        </div>

        <CampaignBuilderClient 
          emailTemplates={emailTemplates} 
          landingPages={landingPages} 
        />
      </div>
    </MainLayout>
  )
}
