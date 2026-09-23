"use client"

import { useState } from "react"
import {
  Gamepad2,
  ShieldAlert,
  Server,
  ArrowLeft,
  Trophy,
  Zap,
  Clock,
  Star,
  Sparkles,
  Mail,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"
import { PhishOrLegitGame } from "./_components/phish-or-legit-game"
import { SocRushGame } from "./_components/soc-rush-game"

type GameId = "phish-or-legit" | "soc-rush" | null

interface GameInfo {
  id: GameId
  title: string
  subtitle: string
  description: string
  icon: React.ElementType
  gradient: string
  borderColor: string
  glowColor: string
  difficulty: string
  duration: string
  skills: string[]
  features: string[]
}

const games: GameInfo[] = [
  {
    id: "phish-or-legit",
    title: "Phish or Legit",
    subtitle: "Email Forensic Challenge",
    description:
      "Analisis email, chat, invoice, dan QR code yang mencurigakan. Tentukan mana yang phishing dan mana yang legitimate. Latih insting forensik digital Anda!",
    icon: Mail,
    gradient: "from-rose-500/20 via-orange-500/10 to-amber-500/20",
    borderColor: "border-rose-500/30",
    glowColor: "shadow-rose-500/10",
    difficulty: "Medium",
    duration: "5-10 min",
    skills: ["Phishing Detection", "Email Analysis", "Social Engineering"],
    features: [
      "Skenario email & chat realistis",
      "Sistem nyawa (3 lives)",
      "Forensic clue analysis",
      "Score & streak tracker",
    ],
  },
  {
    id: "soc-rush",
    title: "SOC Rush",
    subtitle: "Incident Response Simulator",
    description:
      "Anda adalah SOC Analyst yang harus menganalisis log jaringan secara real-time. Identifikasi traffic berbahaya, blokir IP mencurigakan, dan isolasi host yang terkompromi!",
    icon: Activity,
    gradient: "from-cyan-500/20 via-blue-500/10 to-indigo-500/20",
    borderColor: "border-cyan-500/30",
    glowColor: "shadow-cyan-500/10",
    difficulty: "Hard",
    duration: "10-15 min",
    skills: ["Log Analysis", "Incident Response", "Network Security"],
    features: [
      "Multi-wave attack scenarios",
      "Real-time log parsing",
      "IP blocking & host isolation",
      "Performance scoring",
    ],
  },
]

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<GameId>(null)

  if (activeGame === "phish-or-legit") {
    return (
      <MainLayout>
        <div className="-m-6">
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveGame(null)}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Games
              </Button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-rose-400" />
                <span className="text-sm font-medium text-foreground">
                  Phish or Legit
                </span>
              </div>
            </div>
          </div>
          <PhishOrLegitGame />
        </div>
      </MainLayout>
    )
  }

  if (activeGame === "soc-rush") {
    return (
      <MainLayout>
        <div className="-m-6">
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveGame(null)}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Games
              </Button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-foreground">
                  SOC Rush
                </span>
              </div>
            </div>
          </div>
          <SocRushGame />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full pb-16 pt-2">
        {/* Header Polos & Konsisten */}
        <div className="border-b border-border/50 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Gamepad2 className="w-7 h-7 text-cyan-400" /> Security Mini Games
          </h1>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className={`group relative rounded-2xl border ${game.borderColor} bg-gradient-to-br ${game.gradient} backdrop-blur-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${game.glowColor} cursor-pointer`}
              onClick={() => setActiveGame(game.id)}
            >
              {/* Card Inner */}
              <div className="relative p-6">
                {/* Icon & Title */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl bg-background/60 border ${game.borderColor} backdrop-blur-sm`}
                    >
                      <game.icon
                        className={`h-6 w-6 ${
                          game.id === "phish-or-legit"
                            ? "text-rose-400"
                            : "text-cyan-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {game.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {game.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {game.description}
                </p>

                {/* Meta badges */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                      game.difficulty === "Hard"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    <Star className="h-3 w-3" />
                    {game.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/50 text-muted-foreground border border-border">
                    <Clock className="h-3 w-3" />
                    {game.duration}
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {game.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-background/50 text-muted-foreground border border-border/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-1.5 mb-6">
                  {game.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Zap className="h-3 w-3 text-primary/60 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Play Button */}
                <Button
                  className={`w-full gap-2 font-semibold ${
                    game.id === "phish-or-legit"
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-cyan-500 hover:bg-cyan-600 text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveGame(game.id)
                  }}
                >
                  <Gamepad2 className="h-4 w-4" />
                  Mulai Bermain
                </Button>
              </div>

              {/* Decorative glow */}
              <div
                className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 ${
                  game.id === "phish-or-legit" ? "bg-rose-500" : "bg-cyan-500"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
