import { prisma } from "@/lib/prisma"
import { MainLayout } from "@/components/layout/main-layout"
import { DashboardClient } from "./_components/dashboard-client"

export default async function DashboardPage() {
  // Ambil semua incidents untuk dianalisis
  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: "asc" },
  })

  // 1. Tren incident per hari
  const trendMap = new Map<string, number>()
  
  // 2. Rule yang paling sering trigger
  const ruleCountMap = new Map<string, { name: string; count: number }>()
  
  // 3. Rule dengan False Positive terbanyak
  const ruleFpMap = new Map<string, { name: string; count: number }>()

  let activeIncidents = 0
  let newIncidents = 0
  let criticalIncidents = 0
  let truePositives = 0
  let falsePositives = 0

  // Proses data
  incidents.forEach((incident) => {
    // Incident status stats
    if (incident.status !== "Closed") activeIncidents++
    if (incident.status === "New") newIncidents++
    if (incident.severity === "Critical" && incident.status !== "Closed") criticalIncidents++

    // Verdict stats
    if (incident.verdict === "TP") truePositives++
    if (incident.verdict === "FP") falsePositives++

    // Trend per hari (YYYY-MM-DD)
    const dateStr = incident.createdAt.toISOString().split("T")[0]
    trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + 1)

    // Rule trigger count
    if (incident.ruleId) {
      const ruleKey = incident.ruleId
      const ruleName = incident.ruleName || incident.ruleId
      
      const currentRule = ruleCountMap.get(ruleKey) || { name: ruleName, count: 0 }
      currentRule.count += 1
      ruleCountMap.set(ruleKey, currentRule)

      // FP count per rule
      if (incident.verdict === "FP") {
        const currentFp = ruleFpMap.get(ruleKey) || { name: ruleName, count: 0 }
        currentFp.count += 1
        ruleFpMap.set(ruleKey, currentFp)
      }
    }
  })

  const labeled = truePositives + falsePositives
  const unlabeled = incidents.length - labeled
  const accuracy = labeled > 0 ? Math.round((truePositives / labeled) * 100) : null

  // Format data untuk charts
  const trendData = Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))

  const topRulesData = Array.from(ruleCountMap.entries())
    .map(([id, data]) => ({ id, name: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Ambil Top 5

  const topFpData = Array.from(ruleFpMap.entries())
    .map(([id, data]) => ({ id, name: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Ambil Top 5

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SOC Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview metrik operasional, analisis verdict rule tuning, dan tren investigasi incident.</p>
        </div>
        
        <DashboardClient 
          trendData={trendData}
          topRulesData={topRulesData}
          topFpData={topFpData}
          totalIncidents={incidents.length}
          activeIncidents={activeIncidents}
          newIncidents={newIncidents}
          criticalIncidents={criticalIncidents}
          truePositives={truePositives}
          falsePositives={falsePositives}
          labeled={labeled}
          unlabeled={unlabeled}
          accuracy={accuracy}
        />
      </div>
    </MainLayout>
  )
}
