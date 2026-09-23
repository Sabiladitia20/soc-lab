"use client"

import { useState, useEffect } from "react"
import {
  ShieldAlert,
  ShieldCheck,
  Server,
  Activity,
  Zap,
  RotateCcw,
  Trophy,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogEvent {
  id: number
  timestamp: string
  sourceIp: string
  destinationPort: number
  protocol: "TCP" | "UDP" | "HTTP" | "SMB" | "DNS"
  rawPayload: string
  isThreat: boolean
  threatType?: "Brute Force" | "SQLi" | "Ransomware C2" | "Normal Traffic" | "Port Scan"
  properAction: "allow" | "block_ip" | "isolate"
  explanation: string
}

const WAVES_DATA: { wave: number; title: string; logs: LogEvent[] }[] = [
  {
    wave: 1,
    title: "Wave 1: Inisiasi Akses & Scanning",
    logs: [
      {
        id: 101,
        timestamp: "10:04:12",
        sourceIp: "192.168.1.45",
        destinationPort: 443,
        protocol: "HTTP",
        rawPayload: "GET /api/v1/user/profile HTTP/1.1 - 200 OK (Auth Token Valid)",
        isThreat: false,
        threatType: "Normal Traffic",
        properAction: "allow",
        explanation: "Permintaan profil normal dari workstation karyawan terotentikasi."
      },
      {
        id: 102,
        timestamp: "10:04:15",
        sourceIp: "185.220.101.5",
        destinationPort: 22,
        protocol: "TCP",
        rawPayload: "SSH-2.0 - 500 Failed password attempts for root from Tor Exit Node",
        isThreat: true,
        threatType: "Brute Force",
        properAction: "block_ip",
        explanation: "Serangan Brute Force SSH massal dari IP publik Tor. Harus segera di-Block di Firewall!"
      },
      {
        id: 103,
        timestamp: "10:04:19",
        sourceIp: "10.0.0.88",
        destinationPort: 445,
        protocol: "SMB",
        rawPayload: "IPC$ tree connect request - Lateral sweep probe across 24 endpoints",
        isThreat: true,
        threatType: "Port Scan",
        properAction: "block_ip",
        explanation: "Aktivitas pemindaian port SMB internal mencurigakan untuk mencari celah pergerakan lateral."
      },
      {
        id: 104,
        timestamp: "10:04:24",
        sourceIp: "192.168.1.12",
        destinationPort: 80,
        protocol: "HTTP",
        rawPayload: "GET /static/logo.png - User-Agent: Mozilla/5.0 Chrome/120.0",
        isThreat: false,
        threatType: "Normal Traffic",
        properAction: "allow",
        explanation: "Permintaan unduhan gambar logo web biasa dari browser internal."
      }
    ]
  },
  {
    wave: 2,
    title: "Wave 2: Eksploitasi & Masquerading",
    logs: [
      {
        id: 201,
        timestamp: "10:12:02",
        sourceIp: "45.154.255.8",
        destinationPort: 8080,
        protocol: "HTTP",
        rawPayload: "POST /login - input: ' OR '1'='1' -- UNION SELECT username, password_hash FROM users",
        isThreat: true,
        threatType: "SQLi",
        properAction: "block_ip",
        explanation: "SQL Injection payload klasik yang mencoba mengekstrak tabel password database. Blokir IP penyerang!"
      },
      {
        id: 202,
        timestamp: "10:12:08",
        sourceIp: "10.0.4.15",
        destinationPort: 443,
        protocol: "TCP",
        rawPayload: "PROCESS SPAWN: 'svchost.exe' running from 'C:\\Users\\Finance\\AppData\\Local\\Temp'",
        isThreat: true,
        threatType: "Ransomware C2",
        properAction: "isolate",
        explanation: "Proses svchost.exe palsu berjalan dari folder Temp! Ini adalah malware masquerading. Host harus segera di-ISOLATE!"
      },
      {
        id: 203,
        timestamp: "10:12:14",
        sourceIp: "192.168.1.200",
        destinationPort: 53,
        protocol: "DNS",
        rawPayload: "DNS Query: api.github.com A IN - Resolved to 140.82.121.6",
        isThreat: false,
        threatType: "Normal Traffic",
        properAction: "allow",
        explanation: "Resolusi domain DNS normal oleh tim pengembang untuk mengakses GitHub."
      }
    ]
  },
  {
    wave: 3,
    title: "Wave 3: Outbreak & Data Exfiltration",
    logs: [
      {
        id: 301,
        timestamp: "10:20:01",
        sourceIp: "10.0.2.99",
        destinationPort: 8888,
        protocol: "TCP",
        rawPayload: "OUTBOUND BEACON: Encrypted heartbeats to 194.26.29.112 every 5000ms (Cobalt Strike Beacon)",
        isThreat: true,
        threatType: "Ransomware C2",
        properAction: "isolate",
        explanation: "Komputer terinfeksi Cobalt Strike beacon C2! Segera isolasi endpoint agar penyerang tidak memicu ransomware!"
      },
      {
        id: 302,
        timestamp: "10:20:09",
        sourceIp: "192.168.1.10",
        destinationPort: 443,
        protocol: "HTTP",
        rawPayload: "GET /api/reports/monthly-sales.xlsx - Authenticated Admin Session",
        isThreat: false,
        threatType: "Normal Traffic",
        properAction: "allow",
        explanation: "Unduhan laporan penjualan sah oleh akun manajer keuangan resmi."
      },
      {
        id: 303,
        timestamp: "10:20:15",
        sourceIp: "91.240.118.22",
        destinationPort: 3389,
        protocol: "TCP",
        rawPayload: "RDP Handshake: 1200 connection requests/min from unmapped Russian ASN",
        isThreat: true,
        threatType: "Brute Force",
        properAction: "block_ip",
        explanation: "Serangan RDP Brute Force eksternal intensif. Blokir IP penyerang di perimeter firewall!"
      }
    ]
  }
]

export function SocRushGame() {
  const [currentWave, setCurrentWave] = useState(1)
  const [logIndex, setLogIndex] = useState(0)
  const [serverHp, setServerHp] = useState(100)
  const [reputation, setReputation] = useState(100)
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState<"lobby" | "playing" | "feedback" | "gameover" | "victory">("lobby")
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; log: LogEvent } | null>(null)

  const activeWaveData = WAVES_DATA[currentWave - 1]
  const currentLog = activeWaveData?.logs[logIndex]

  const handleStart = () => {
    setCurrentWave(1)
    setLogIndex(0)
    setServerHp(100)
    setReputation(100)
    setScore(0)
    setFeedback(null)
    setGameState("playing")
  }

  const handleAction = (action: "allow" | "block_ip" | "isolate") => {
    if (!currentLog) return

    const isCorrect = action === currentLog.properAction

    if (isCorrect) {
      setScore((prev) => prev + 150)
      setFeedback({
        isCorrect: true,
        message: `Tindakan Tepat! ${currentLog.explanation}`,
        log: currentLog
      })
    } else {
      // Penalty based on mistake type
      if (currentLog.isThreat) {
        // Threat allowed or improper response -> Server HP drops
        setServerHp((prev) => Math.max(0, prev - 35))
        setFeedback({
          isCorrect: false,
          message: `SERVER BREACH! Anda gagal menanggulangi ancaman: ${currentLog.explanation}`,
          log: currentLog
        })
      } else {
        // Innocent traffic blocked/isolated -> Reputation drops
        setReputation((prev) => Math.max(0, prev - 35))
        setFeedback({
          isCorrect: false,
          message: `FALSE POSITIVE! Anda memblokir trafik karyawan yang sah: ${currentLog.explanation}`,
          log: currentLog
        })
      }
    }

    setGameState("feedback")
  }

  const handleNextLog = () => {
    // Check if dead
    if (serverHp <= 0 || reputation <= 0) {
      setGameState("gameover")
      return
    }

    // Check if wave finished
    if (logIndex + 1 < activeWaveData.logs.length) {
      setLogIndex((prev) => prev + 1)
      setGameState("playing")
    } else {
      // Wave completed
      if (currentWave < WAVES_DATA.length) {
        setCurrentWave((prev) => prev + 1)
        setLogIndex(0)
        setGameState("playing")
      } else {
        // Victory!
        setGameState("victory")
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* LOBBY */}
      {gameState === "lobby" && (
        <div className="bg-[#101724] border border-[#1f2b3e] rounded-2xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Terminal className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/20">
              SOC Tier-1 Defense Arcade
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              SOC Alert Rush!
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Bertindaklah sebagai analis SOC garis depan. Evaluasi log yang masuk secara cepat: <strong>ALLOW</strong> trafik sah, <strong>BLOCK IP</strong> untuk serangan eksternal, atau <strong>ISOLATE HOST</strong> jika malware menyusup!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0b111a] p-3 rounded-xl border border-slate-800 text-left">
              <span className="text-emerald-400 font-bold block">❤️ Server Health (100%)</span>
              <span className="text-[11px] text-slate-500">Turun jika ancaman dibiarkan masuk.</span>
            </div>
            <div className="bg-[#0b111a] p-3 rounded-xl border border-slate-800 text-left">
              <span className="text-cyan-400 font-bold block">🛡️ Reputasi Kantor (100%)</span>
              <span className="text-[11px] text-slate-500">Turun jika Anda memblokir trafik sah.</span>
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl py-3 text-sm gap-2 shadow-lg shadow-cyan-500/20"
          >
            Mulai Shift Jaga SOC <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* PLAYING */}
      {gameState === "playing" && currentLog && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Status Gauges HUD */}
          <div className="bg-[#101724] border border-[#1f2b3e] rounded-xl p-4 grid grid-cols-3 gap-4 text-xs">
            {/* Server HP */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1 font-bold">
                  <Server className="w-3.5 h-3.5 text-emerald-400" /> Server HP
                </span>
                <span className="font-mono font-bold text-emerald-400">{serverHp}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    serverHp > 50 ? "bg-emerald-500" : serverHp > 25 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${serverHp}%` }}
                />
              </div>
            </div>

            {/* Reputation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1 font-bold">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> Reputasi
                </span>
                <span className="font-mono font-bold text-cyan-400">{reputation}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    reputation > 50 ? "bg-cyan-500" : reputation > 25 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${reputation}%` }}
                />
              </div>
            </div>

            {/* Score & Wave */}
            <div className="flex flex-col justify-center items-end text-right">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Wave {currentWave}/3
              </span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {score} PTS
              </span>
            </div>
          </div>

          {/* Active Log Event Card */}
          <div className="bg-[#121c2c] border border-cyan-500/30 rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1d2a3e] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  INCOMING TELEMETRY ALERT #{currentLog.id}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Log {logIndex + 1} dari {activeWaveData.logs.length}
              </span>
            </div>

            {/* Packet Metadata */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-[#0b121e] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Source IP</span>
                <span className="font-mono font-bold text-cyan-300">{currentLog.sourceIp}</span>
              </div>
              <div className="bg-[#0b121e] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Dest Port</span>
                <span className="font-mono font-bold text-slate-200">{currentLog.destinationPort}</span>
              </div>
              <div className="bg-[#0b121e] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Protocol</span>
                <span className="font-mono font-bold text-amber-400">{currentLog.protocol}</span>
              </div>
            </div>

            {/* Raw Payload Terminal Box */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold">Raw Log Payload:</span>
              <div className="bg-[#080d15] border border-[#1a2538] rounded-xl p-3.5 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {currentLog.rawPayload}
              </div>
            </div>

            {/* SOC Action Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] text-slate-400 block text-center">
                Pilih Keputusan Triage Analis SOC:
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <Button
                  onClick={() => handleAction("allow")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3 text-xs"
                >
                  ALLOW (Sah)
                </Button>
                <Button
                  onClick={() => handleAction("block_ip")}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-3 text-xs"
                >
                  BLOCK IP
                </Button>
                <Button
                  onClick={() => handleAction("isolate")}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl py-3 text-xs"
                >
                  ISOLATE HOST
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK VIEW */}
      {gameState === "feedback" && feedback && (
        <div className="max-w-xl mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`border rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl ${
              feedback.isCorrect
                ? "bg-[#0b1c1b] border-emerald-500/40 text-emerald-200"
                : "bg-[#1c0f14] border-rose-500/40 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  feedback.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {feedback.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  {feedback.isCorrect ? "Triage Sempurna! (+150 PTS)" : "Kesalahan Prosedur Triage!"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tindakan yang seharusnya: <strong className="uppercase text-cyan-400">{feedback.log.properAction.replace("_", " ")}</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#000000]/40 p-4 rounded-xl border border-white/5 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wider block">
                Ulasan Insiden SOC:
              </span>
              <p className="leading-relaxed">{feedback.message}</p>
            </div>

            <Button
              onClick={handleNextLog}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl py-2.5 text-xs"
            >
              Lanjutkan Investigasi <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === "gameover" && (
        <div className="bg-[#1c0f14] border border-rose-500/40 rounded-2xl p-8 sm:p-10 text-center space-y-5 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-100">
              Server Lumpuh (Incident Breach)!
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {serverHp <= 0
                ? "Server perusahaan telah diretas dan mengalami kebocoran data kritis karena serangan lolos dari deteksi Anda."
                : "Reputasi kantor jatuh ke titik nol karena Anda terlalu sering memblokir akses normal karyawan yang sah."}
            </p>
          </div>

          <Button
            onClick={handleStart}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl py-2.5 text-xs gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Ulangi Sesi SOC
          </Button>
        </div>
      )}

      {/* VICTORY */}
      {gameState === "victory" && (
        <div className="bg-[#0b1c1b] border border-emerald-500/40 rounded-2xl p-8 sm:p-10 text-center space-y-5 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-100">
              SOC Shift Sukses! Server Aman!
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anda berhasil menahan 3 gelombang serangan siber dengan sisa Server HP {serverHp}% dan Reputasi {reputation}%.
            </p>
          </div>

          <div className="bg-[#000000]/40 p-4 rounded-xl border border-white/5 text-xs text-slate-300 flex justify-between">
            <span>Skor Analis SOC:</span>
            <span className="font-bold text-emerald-400 font-mono text-base">{score} PTS</span>
          </div>

          <Button
            onClick={handleStart}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl py-2.5 text-xs gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Mainkan Lagi
          </Button>
        </div>
      )}
    </div>
  )
}
