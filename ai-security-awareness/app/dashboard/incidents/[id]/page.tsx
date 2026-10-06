import { prisma } from "@/lib/prisma"
import { MainLayout } from "@/components/layout/main-layout"
import { notFound } from "next/navigation"
import { IncidentDetailClient } from "./_components/incident-detail-client"
import { mitreTechniques } from "@/lib/mock-data"
import type { Incident } from "@/lib/mock-data"

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function IncidentDetailPage({ params }: Props) {
  const { id } = await params

  // 1. Fetch the incident
  const dbIncident = await prisma.incident.findUnique({
    where: { id },
  })

  if (!dbIncident) {
    notFound()
  }

  // 2. Map to UI type
  const incident: Incident = {
    id: dbIncident.id,
    severity: dbIncident.severity as Incident["severity"],
    title: dbIncident.title,
    status: dbIncident.status as Incident["status"],
    sla: dbIncident.sla as Incident["sla"],
    assignee: dbIncident.assignee,
    alerts: dbIncident.alerts,
    createdAt: dbIncident.createdAt.toISOString(),
    lastActivity: dbIncident.updatedAt.toISOString(),
    sourceIp: dbIncident.sourceIp ?? undefined,
    ruleId: dbIncident.ruleId ?? undefined,
    ruleName: dbIncident.ruleName ?? undefined,
    mitreTechnique: dbIncident.mitreTechnique ?? undefined,
    rawDetails: dbIncident.rawDetails ?? undefined,
    updatedAt: dbIncident.updatedAt.toISOString(),
    verdict: (dbIncident.verdict as "TP" | "FP" | null) ?? null,
    verdictBy: dbIncident.verdictBy ?? null,
    verdictNote: dbIncident.verdictNote ?? null,
    verdictAt: dbIncident.verdictAt?.toISOString() ?? null,
  }

  // 3. Find related incidents (same rule or same source IP) for timeline
  const relatedIncidents = await prisma.incident.findMany({
    where: {
      id: { not: dbIncident.id },
      OR: [
        ...(dbIncident.ruleId ? [{ ruleId: dbIncident.ruleId }] : []),
        ...(dbIncident.sourceIp ? [{ sourceIp: dbIncident.sourceIp }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const relatedMapped = relatedIncidents.map((inc) => ({
    id: inc.id,
    title: inc.title,
    severity: inc.severity,
    status: inc.status,
    sourceIp: inc.sourceIp,
    ruleId: inc.ruleId,
    alerts: inc.alerts,
    createdAt: inc.createdAt.toISOString(),
    verdict: inc.verdict as "TP" | "FP" | null,
  }))

  // 4. Look up MITRE technique details
  const mitreInfo = incident.mitreTechnique
    ? mitreTechniques.find((t) => t.id === incident.mitreTechnique) ?? null
    : null

  // 5. Fetch the rule details if ruleId exists
  let ruleDetails = null
  if (dbIncident.ruleId) {
    const rule = await prisma.rule.findFirst({
      where: { ruleCode: dbIncident.ruleId },
    })
    if (rule) {
      ruleDetails = {
        ruleCode: rule.ruleCode,
        name: rule.name,
        description: rule.description,
        severity: rule.severity,
        mitreTechnique: rule.mitreTechnique,
        matchField: rule.matchField,
        pattern: rule.pattern,
        thresholdCount: rule.thresholdCount,
        thresholdWindowSeconds: rule.thresholdWindowSeconds,
        enabled: rule.enabled,
      }
    }
  }

  return (
    <MainLayout>
      <IncidentDetailClient
        incident={incident}
        relatedIncidents={relatedMapped}
        mitreInfo={mitreInfo}
        ruleDetails={ruleDetails}
      />
    </MainLayout>
  )
}
