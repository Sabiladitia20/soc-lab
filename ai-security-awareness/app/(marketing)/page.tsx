"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldAlert,
  BookOpen,
  Target,
  LayoutDashboard,
  Bot,
  ArrowRight,
  Shield,
  Zap,
  Eye,
  Lock,
  ChevronRight,
  AlertTriangle,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description:
      "Pelajari ancaman siber berbasis AI — phishing AI-generated, deepfake, prompt injection, dan social engineering modern.",
    href: "/learn",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/20",
  },
  {
    icon: Target,
    title: "Phishing Campaign",
    description:
      "Simulasikan dan kelola phishing campaign. Lacak pengiriman email, interaksi pengguna, dan landing page.",
    href: "/dashboard/phishing-campaigns",
    color: "from-orange-500/20 to-orange-600/5",
    iconColor: "text-orange-400",
    borderColor: "border-orange-500/20",
  },
  {
    icon: LayoutDashboard,
    title: "SOC Dashboard",
    description:
      "Replika mini dashboard SOC/SIEM — incident triage, severity classification, SLA tracking seperti di lingkungan kerja nyata.",
    href: "/dashboard/incidents",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Chatbot RAG yang menjawab pertanyaan keamanan siber berdasarkan materi platform, bukan sekadar general knowledge.",
    href: "/assistant",
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/20",
  },
]

const stats = [
  { label: "Learning Modules", value: "12+", icon: BookOpen },
  { label: "Phishing Scenarios", value: "50+", icon: AlertTriangle },
  { label: "MITRE Techniques", value: "40+", icon: Shield },
  { label: "AI-Powered Insights", value: "∞", icon: Zap },
]

const threatTicker = [
  "AI-Generated Phishing Detected",
  "Deepfake Voice Attack Blocked",
  "Prompt Injection Attempt Logged",
  "Credential Stuffing Alert",
  "Social Engineering Report Filed",
  "Ransomware Signature Updated",
  "Anomalous API Activity Flagged",
  "Zero-Day Exploit Advisory",
]

export default function MarketingPage() {
  const [tickerIndex, setTickerIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % threatTicker.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Threat Ticker Bar */}
      <div className="w-full bg-destructive/10 border-b border-destructive/20 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <Activity className="h-3.5 w-3.5 text-destructive animate-pulse" />
          <AnimatePresence mode="wait">
            <motion.span
              key={tickerIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-mono text-destructive/80 tracking-wider uppercase"
            >
              {threatTicker[tickerIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <ShieldAlert className="h-7 w-7 text-primary" />
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-background" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">
              SecAwareness<span className="text-primary">.ai</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/learn"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Learn
            </Link>
            <Link
              href="/dashboard/phishing-campaigns"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/dashboard/incidents"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href="/dashboard/incidents">Login</Link>
            </Button>
            <Button size="sm" className="gap-2" asChild>
              <Link href="/dashboard/phishing-campaigns">
                Lihat Demo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Grid & Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8"
            >
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary tracking-wide">
                SOC Analyst Internship Project
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-foreground">Master AI-Era</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Cyber Security
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Platform edukasi interaktif yang mengadaptasi pengalaman nyata SOC
              Analyst. Pelajari ancaman siber berbasis AI, latih
              kewaspadaanmu, dan rasakan dashboard SOC profesional.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2 px-8 h-12 text-base" asChild>
                <Link href="/dashboard/phishing-campaigns">
                  <Target className="h-4 w-4" />
                  Lihat Demo Campaign
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 px-8 h-12 text-base border-border hover:bg-secondary"
                asChild
              >
                <Link href="/learn">
                  <BookOpen className="h-4 w-4" />
                  Mulai Belajar
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="mt-20 relative"
          >
            <div className="bg-card border border-border rounded-xl p-1 shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 rounded-t-lg border-b border-border">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background/60 border border-border rounded-md px-4 py-1 text-xs text-muted-foreground font-mono">
                    secawareness.ai/dashboard/incidents
                  </div>
                </div>
              </div>
              {/* Dashboard mockup content */}
              <div className="bg-background p-6 rounded-b-lg">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Active Incidents", val: "23", color: "text-blue-400" },
                    { label: "New Alerts", val: "8", color: "text-yellow-400" },
                    { label: "Critical", val: "3", color: "text-red-400" },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="bg-card border border-border rounded-lg p-4"
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {card.label}
                      </p>
                      <p className={`text-2xl font-bold ${card.color}`}>
                        {card.val}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-6 gap-4 px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider border-b border-border font-medium">
                    <span>ID</span>
                    <span>Severity</span>
                    <span className="col-span-2">Title</span>
                    <span>Status</span>
                    <span>SLA</span>
                  </div>
                  {[
                    {
                      id: "INC-4821",
                      sev: "Critical",
                      sevColor: "bg-red-500/20 text-red-400",
                      title: "Ransomware Activity Detected",
                      status: "New",
                      statusColor: "bg-blue-500/20 text-blue-400",
                      sla: "Breached",
                      slaColor: "text-red-400",
                    },
                    {
                      id: "INC-4819",
                      sev: "High",
                      sevColor: "bg-orange-500/20 text-orange-400",
                      title: "Suspicious Login from Unusual Location",
                      status: "Acknowledged",
                      statusColor: "bg-yellow-500/20 text-yellow-400",
                      sla: "12m left",
                      slaColor: "text-emerald-400",
                    },
                    {
                      id: "INC-4817",
                      sev: "Medium",
                      sevColor: "bg-yellow-500/20 text-yellow-400",
                      title: "Phishing Email Reported",
                      status: "Acknowledged",
                      statusColor: "bg-yellow-500/20 text-yellow-400",
                      sla: "OK",
                      slaColor: "text-emerald-400",
                    },
                  ].map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-6 gap-4 px-4 py-3 text-sm border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <span className="font-mono text-muted-foreground">
                        {row.id}
                      </span>
                      <span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${row.sevColor}`}
                        >
                          {row.sev}
                        </span>
                      </span>
                      <span className="col-span-2 text-foreground truncate">
                        {row.title}
                      </span>
                      <span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${row.statusColor}`}
                        >
                          {row.status}
                        </span>
                      </span>
                      <span className={`text-xs font-mono ${row.slaColor}`}>
                        {row.sla}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary tracking-wide">
                Platform Features
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dari materi edukasi hingga simulasi hands-on, pelajari keamanan
              siber dengan cara yang engaging dan interaktif.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link href={feature.href} className="block group">
                  <div
                    className={`relative bg-card border ${feature.borderColor} rounded-xl p-8 h-full hover:border-primary/40 transition-all duration-300 overflow-hidden`}
                  >
                    {/* Gradient background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                    <div className="relative">
                      <div
                        className={`inline-flex items-center justify-center h-12 w-12 rounded-lg bg-secondary/80 border border-border mb-5`}
                      >
                        <feature.icon
                          className={`h-6 w-6 ${feature.iconColor}`}
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                        {feature.title}
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-card border border-border rounded-2xl p-12 md:p-16 text-center overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />

            <div className="relative">
              <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Siap Meningkatkan Kewaspadaan Siber?
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Mulai dari simulator phishing, pelajari cara kerja ancaman AI,
                dan jelajahi dashboard SOC profesional.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="gap-2 px-8 h-12 text-base"
                  asChild
                >
                  <Link href="/dashboard/incidents">
                    <LayoutDashboard className="h-4 w-4" />
                    Explore Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 px-8 h-12 text-base border-border hover:bg-secondary"
                  asChild
                >
                  <Link href="/about">
                    Tentang Proyek
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground text-sm">
                SecAwareness<span className="text-primary">.ai</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              SOC Analyst Internship Project — AI Security Awareness Platform
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/learn"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Learn
              </Link>
              <Link
                href="/dashboard/incidents"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
