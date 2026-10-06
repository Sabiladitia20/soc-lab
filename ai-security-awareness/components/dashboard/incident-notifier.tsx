"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShieldAlert, ArrowRight, ExternalLink } from "lucide-react"

interface NewIncidentNotification {
  id: string
  title: string
  severity: "Low" | "Medium" | "High" | "Critical"
  status: string
  sourceIp: string | null
  ruleId: string | null
  ruleName: string | null
  mitreTechnique: string | null
  alerts: number
  createdAt: string
}

/** Synthesize a soft modern dual-tone radar alert sound using Web Audio API */
function playAlertChime(severity: string) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    // Critical gets a sharper double-pulse chime; others get a smooth chime
    const isCritical = severity === "Critical" || severity === "High"
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(isCritical ? 880 : 660, now) // A5 or E5
    osc.frequency.exponentialRampToValueAtTime(isCritical ? 1320 : 990, now + 0.12)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.28)
  } catch {
    // AudioContext blocked or not allowed until user interaction; fail silently
  }
}

export function IncidentNotifier() {
  const router = useRouter()
  const lastCheckedRef = useRef<string | null>(null)
  const isPollingRef = useRef<boolean>(false)

  useEffect(() => {
    let isMounted = true

    // Step 1: Establish initial baseline timestamp so we only alert on genuinely new incidents
    async function initBaseline() {
      try {
        const res = await fetch("/api/incidents/latest", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && data.baseline) {
          lastCheckedRef.current = data.baseline
        }
      } catch (err) {
        console.error("Failed to initialize incident notification baseline:", err)
      }
    }

    initBaseline()

    // Step 2: Poll every 4 seconds
    const interval = setInterval(async () => {
      if (!lastCheckedRef.current || isPollingRef.current) return

      isPollingRef.current = true
      try {
        const res = await fetch(
          `/api/incidents/latest?since=${encodeURIComponent(lastCheckedRef.current)}`,
          { cache: "no-store" }
        )

        if (!res.ok) return

        const data: {
          latestTimestamp: string
          count: number
          incidents: NewIncidentNotification[]
        } = await res.json()

        if (data.latestTimestamp) {
          lastCheckedRef.current = data.latestTimestamp
        }

        if (data.incidents && data.incidents.length > 0) {
          // Play audio chime
          playAlertChime(data.incidents[0].severity)

          // Dispatch event so active components can optimistically update
          window.dispatchEvent(
            new CustomEvent("soc:new-incidents", {
              detail: { incidents: data.incidents },
            })
          )

          // Fire toast notifications for each new incident
          data.incidents.forEach((inc) => {
            const severityColor =
              inc.severity === "Critical"
                ? "border-red-500/50 text-red-400 bg-red-950/40"
                : inc.severity === "High"
                ? "border-orange-500/50 text-orange-400 bg-orange-950/40"
                : inc.severity === "Medium"
                ? "border-yellow-500/50 text-yellow-400 bg-yellow-950/40"
                : "border-blue-500/50 text-blue-400 bg-blue-950/40"

            const badgeBg =
              inc.severity === "Critical"
                ? "bg-red-500/20 text-red-300 border-red-500/40"
                : inc.severity === "High"
                ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                : inc.severity === "Medium"
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                : "bg-blue-500/20 text-blue-300 border-blue-500/40"

            toast.custom(
              (t) => (
                <div
                  className={`w-full max-w-md p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${severityColor} flex items-start gap-3`}
                >
                  <div className="p-2 rounded-lg bg-background/50 border border-white/10 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-current animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                        🚨 Real-Time SOC Alert
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold border ${badgeBg}`}
                      >
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">
                      {inc.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono flex-wrap">
                      {inc.sourceIp && <span>IP: {inc.sourceIp}</span>}
                      {inc.mitreTechnique && <span>MITRE: {inc.mitreTechnique}</span>}
                    </div>
                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          toast.dismiss(t)
                          router.push(`/dashboard/incidents/${inc.id}`)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition-opacity"
                      >
                        Investigasi
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ),
              {
                duration: 8000,
                position: "top-right",
              }
            )
          })

          // Refresh the Next.js server components to update counts and tables automatically
          router.refresh()
        }
      } catch (err) {
        console.error("Error polling for incidents:", err)
      } finally {
        isPollingRef.current = false
      }
    }, 4000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [router])

  return null
}
