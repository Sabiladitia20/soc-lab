import { prisma } from "@/lib/prisma"
import { MainLayout } from "@/components/layout/main-layout"
import { RulesClient } from "./_components/rules-client"

export default async function RulesPage() {
  const dbRules = await prisma.rule.findMany({
    orderBy: { ruleCode: "asc" },
  })

  const rules = dbRules.map((r) => ({
    id: r.id,
    ruleCode: r.ruleCode,
    name: r.name,
    description: r.description,
    severity: r.severity,
    mitreTechnique: r.mitreTechnique,
    matchField: r.matchField,
    pattern: r.pattern,
    thresholdCount: r.thresholdCount,
    thresholdWindowSeconds: r.thresholdWindowSeconds,
    enabled: r.enabled,
  }))

  return (
    <MainLayout>
      <RulesClient rules={rules} />
    </MainLayout>
  )
}
