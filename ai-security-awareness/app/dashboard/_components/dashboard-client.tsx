"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  Shield,
  Bell,
  Flame,
  ShieldCheck,
  ShieldX,
  Target,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface TrendData {
  date: string
  count: number
}

interface RuleData {
  id: string
  name: string
  count: number
}

interface DashboardClientProps {
  trendData: TrendData[]
  topRulesData: RuleData[]
  topFpData: RuleData[]
  totalIncidents: number
  activeIncidents: number
  newIncidents: number
  criticalIncidents: number
  truePositives: number
  falsePositives: number
  labeled: number
  unlabeled: number
  accuracy: number | null
}

export function DashboardClient({
  trendData,
  topRulesData,
  topFpData,
  totalIncidents,
  activeIncidents,
  newIncidents,
  criticalIncidents,
  truePositives,
  falsePositives,
  labeled,
  unlabeled,
  accuracy,
}: DashboardClientProps) {
  // Format date for chart X-axis
  const formattedTrendData = trendData.map((item) => {
    const dateObj = new Date(item.date)
    return {
      ...item,
      displayDate: dateObj.toLocaleDateString("id-ID", { month: "short", day: "numeric" }),
    }
  })

  return (
    <div className="space-y-6">
      {/* ─── Operational Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Incidents</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">Semua insiden terekam</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
            <Shield className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">Status belum closed</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New / Unacknowledged</CardTitle>
            <Bell className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{newIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">Perlu respon cepat analis</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Incidents</CardTitle>
            <Flame className={`h-4 w-4 ${criticalIncidents > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalIncidents > 0 ? "text-destructive" : "text-foreground"}`}>
              {criticalIncidents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Prioritas penanganan utama</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Verdict Analytics Section (Moved from Incidents Tab) ─── */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Verdict Analytics &amp; Alert Tuning
            </CardTitle>
            <CardDescription className="mt-1">
              Metrik akurasi deteksi berdasarkan hasil triase True Positive vs False Positive oleh analis
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-1.5 text-xs">
            <Link href="/dashboard/incidents">
              Ke Antrian Triage
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-2 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* True Positive Count */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{truePositives}</p>
                <p className="text-xs text-muted-foreground font-medium">True Positive (Serangan Valid)</p>
              </div>
            </div>

            {/* False Positive Count */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="h-10 w-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                <ShieldX className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{falsePositives}</p>
                <p className="text-xs text-muted-foreground font-medium">False Positive (False Alarm)</p>
              </div>
            </div>

            {/* Rule Accuracy */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="h-10 w-10 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">
                  {accuracy !== null ? `${accuracy}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Detection Rule Accuracy</p>
              </div>
            </div>

            {/* Progress bar of labeled vs total */}
            <div className="flex flex-col justify-center gap-2 p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">Triage Labeling Progress</p>
                <p className="text-xs text-foreground font-mono font-bold">
                  {labeled}/{totalIncidents}
                </p>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: totalIncidents > 0 ? `${(labeled / totalIncidents) * 100}%` : "0%",
                    background: "linear-gradient(90deg, #10b981, #3b82f6)",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {unlabeled} incident{unlabeled !== 1 ? "s" : ""} belum dilabel
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Visualizations: Charts Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tren Incident Harian */}
        <Card className="col-span-1 lg:col-span-2 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tren Incident Harian
            </CardTitle>
            <CardDescription>Volume incident yang terdeteksi masuk ke antrian per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              {formattedTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedTrendData} margin={{ top: 10, right: 25, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis
                      dataKey="displayDate"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#14171f", borderColor: "#272e3f", borderRadius: "8px" }}
                      itemStyle={{ color: "#e5e7eb" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Incidents"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#60a5fa", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Belum ada data tren incident
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Triggered Rules */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="h-5 w-5" />
              Top Triggered Rules
            </CardTitle>
            <CardDescription>Rule deteksi yang paling sering menghasilkan alert</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              {topRulesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRulesData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={120}
                      tickFormatter={(val) => (val.length > 18 ? val.substring(0, 18) + "..." : val)}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                      contentStyle={{ backgroundColor: "#14171f", borderColor: "#272e3f", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" name="Triggers" fill="#f87171" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Belum ada data rule trigger
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top False Positives */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Top False Positives (Need Tuning)
            </CardTitle>
            <CardDescription>Rule yang paling sering dilabeli False Positive oleh analis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              {topFpData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topFpData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={120}
                      tickFormatter={(val) => (val.length > 18 ? val.substring(0, 18) + "..." : val)}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                      contentStyle={{ backgroundColor: "#14171f", borderColor: "#272e3f", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" name="False Positives" fill="#fbbf24" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm text-center px-6">
                  <p>Belum ada data False Positive tercatat.</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Beri label FP pada incident di antrian triage untuk menganalisis akurasi rule.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
