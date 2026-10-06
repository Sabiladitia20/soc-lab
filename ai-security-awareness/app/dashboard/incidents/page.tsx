import { prisma } from "@/lib/prisma"
import { MainLayout } from "@/components/layout/main-layout"
import { IncidentsClient } from "./_components/incidents-client"
import type { Incident } from "@/lib/mock-data"

export default async function IncidentsPage() {
  // Fetch real incidents from database, sorted by newest first
  const dbIncidents = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" },
  })

  // Map Prisma records to the Incident type used by the UI
  const incidents: Incident[] = dbIncidents.map((inc) => ({
    id: inc.id,
    severity: inc.severity as Incident["severity"],
    title: inc.title,
    status: inc.status as Incident["status"],
    sla: inc.sla as Incident["sla"],
    assignee: inc.assignee,
    alerts: inc.alerts,
    createdAt: inc.createdAt.toISOString(),
    lastActivity: inc.updatedAt.toISOString(),
    sourceIp: inc.sourceIp ?? undefined,
    ruleId: inc.ruleId ?? undefined,
    ruleName: inc.ruleName ?? undefined,
    mitreTechnique: inc.mitreTechnique ?? undefined,
    rawDetails: inc.rawDetails ?? undefined,
    updatedAt: inc.updatedAt.toISOString(),
    verdict: (inc.verdict as "TP" | "FP" | null) ?? null,
    verdictBy: inc.verdictBy ?? null,
    verdictNote: inc.verdictNote ?? null,
    verdictAt: inc.verdictAt?.toISOString() ?? null,
  }))


  return (
    <MainLayout>
      <IncidentsClient incidents={incidents} />
    </MainLayout>
  )
}
