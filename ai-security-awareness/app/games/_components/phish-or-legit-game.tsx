"use client"

import { useState, useEffect } from "react"
import {
  ShieldAlert,
  ShieldCheck,
  Heart,
  Timer,
  RotateCcw,
  Trophy,
  Zap,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Mail,
  MessageSquare,
  QrCode,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface CardScenario {
  id: number
  type: "Email" | "Chat" | "Invoice" | "QR Code"
  sender: string
  subjectOrHeader: string
  snippet: string
  details: {
    fromAddress: string
    replyTo?: string
    attachmentOrUrl?: string
    urgencyText?: string
  }
  isPhishing: boolean
  redFlagExplanation: string
  forensicClues: string[]
}

const SCENARIOS: CardScenario[] = [
  {
    id: 1,
    type: "Email",
    sender: "Microsoft 365 Security Team",
    subjectOrHeader: "PEMBERITAHUAN MENDESAK: Password Anda Kedaluwarsa dalam 2 Jam!",
    snippet: "Akun cloud Anda akan dinonaktifkan permanen jika Anda tidak segera memperbarui kredensial login melalui portal keamanan kami.",
    details: {
      fromAddress: "security-alert@micros0ft-support.com",
      replyTo: "noreply@auth-security-update.net",
      attachmentOrUrl: "https://auth-micros0ft.login-verify.xyz/reset",
      urgencyText: "Batas Waktu: 2 Jam"
    },
    isPhishing: true,
    redFlagExplanation: "Perhatikan domain pengirim 'micros0ft-support.com' menggunakan angka nol ('0') menggantikan huruf 'o' (Typosquatting), dan URL mengarah ke domain pihak ketiga mencurigakan (.xyz).",
    forensicClues: [
      "Domain typosquatting (micros0ft)",
      "Urgensi palsu (False urgency 2 jam)",
      "URL mencurigakan .xyz"
    ]
  },
  {
    id: 2,
    type: "Email",
    sender: "GitHub Notifications",
    subjectOrHeader: "[SecAI/soc-lab] Security advisory published for dependency",
    snippet: "A high-severity vulnerability was identified in one of your repository dependencies. Review the automated dependabot pull request #14.",
    details: {
      fromAddress: "notifications@github.com",
      replyTo: "noreply@github.com",
      attachmentOrUrl: "https://github.com/SecAI/soc-lab/security/dependabot/14"
    },
    isPhishing: false,
    redFlagExplanation: "Ini adalah email sah (Legit). Alamat pengirim berasal dari domain resmi 'github.com', URL tujuan resmi dengan protokol HTTPS terverifikasi, dan tidak ada paksaan meminta kredensial.",
    forensicClues: [
      "Domain resmi github.com",
      "Tidak meminta kata sandi langsung",
      "Tautan internal repositori valid"
    ]
  },
  {
    id: 3,
    type: "Chat",
    sender: "Budi Santoso (Direktur Keuangan)",
    subjectOrHeader: "Pesan WhatsApp Darurat (Nomor Baru)",
    snippet: "Halo, ini Pak Budi. Nomor lama saya sedang gangguan. Tolong transfer dana talangan vendor sebesar 45 juta sekarang juga, saya sedang rapat dengan klien di luar kota.",
    details: {
      fromAddress: "+62 812-9988-7711 (Tidak Terdaftar di Kontak)",
      urgencyText: "Harus ditransfer dalam 15 menit!"
    },
    isPhishing: true,
    redFlagExplanation: "Ini adalah serangan CEO Fraud / Whaling. Pelaku menyamar sebagai atasan menggunakan nomor baru dan meminta transfer dana darurat melompati prosedur verifikasi normal perusahaan.",
    forensicClues: [
      "Pura-pura mengganti nomor",
      "Meminta transfer dana cepat",
      "Melompati jalur verifikasi resmi"
    ]
  },
  {
    id: 4,
    type: "Email",
    sender: "Tim IT Internal Perusahaan",
    subjectOrHeader: "Jadwal Pemeliharaan Server Rutin - Sabtu 28 September",
    snippet: "Diberitahukan bahwa server database internal akan mengalami masa pemeliharaan (downtime) pada Sabtu pukul 22:00 - 02:00 WIB. Tidak ada tindakan yang diperlukan dari staf.",
    details: {
      fromAddress: "it-support@perusahaan.co.id",
      replyTo: "it-support@perusahaan.co.id"
    },
    isPhishing: false,
    redFlagExplanation: "Email ini Legit. Berasal dari domain resmi perusahaan, tidak menyertakan link eksternal yang mencurigakan, dan secara tegas menyebutkan 'Tidak ada tindakan yang diperlukan'.",
    forensicClues: [
      "Domain internal valid (.co.id)",
      "Tidak ada tautan login",
      "Hanya berupa pengumuman operasional"
    ]
  },
  {
    id: 5,
    type: "Invoice",
    sender: "PT Global Logistics Solusindo",
    subjectOrHeader: "Faktur Tagihan Tertunggak #INV-8891.pdf.exe",
    snippet: "Terlampir invoice pengiriman perlengkapan kantor bulan lalu yang belum diselesaikan. Mohon buka file lampiran untuk konfirmasi rincian pembayaran.",
    details: {
      fromAddress: "billing@global-logistics-finance.com",
      attachmentOrUrl: "Invoice_Lengkap_8891.pdf.exe (Double Extension File)"
    },
    isPhishing: true,
    redFlagExplanation: "Trik ekstensi ganda (.pdf.exe)! File terlihat seperti dokumen PDF namun sebenarnya merupakan file aplikasi executable (.exe) yang berisi malware infostealer.",
    forensicClues: [
      "Double Extension (.pdf.exe)",
      "Trik memanipulasi ikon PDF",
      "Pengirim vendor yang tidak dikenal"
    ]
  },
  {
    id: 6,
    type: "QR Code",
    sender: "Sticker di Meja Kantin Kantor",
    subjectOrHeader: "Akses Cepat Wi-Fi Tamu VIP & Diskon Kafe 50%",
    snippet: "Pindai kode QR ini untuk langsung terhubung ke WiFi kantor kecepatan tinggi dan claim voucher makan.",
    details: {
      fromAddress: "Poster Fisik di Area Publik",
      attachmentOrUrl: "http://free-wifi-login-portal.ru/connect"
    },
    isPhishing: true,
    redFlagExplanation: "Serangan Quishing (QR Code Phishing). Penyerang menempelkan stiker QR code palsu di atas poster resmi kantor untuk memancing karyawan membuka portal login palsu di domain luar negeri (.ru).",
    forensicClues: [
      "Stiker QR di tempat umum",
      "Domain mencurigakan (.ru)",
      "Iming-iming hadiah/diskon tidak resmi"
    ]
  },
  {
    id: 7,
    type: "Email",
    sender: "Google Workspace Admin",
    subjectOrHeader: "Peringatan Login Baru dari Perangkat macOS di Jakarta",
    snippet: "Akun Google Anda baru saja digunakan untuk login pada perangkat baru. Jika ini Anda, tidak ada tindakan diperlukan. Jika bukan, segera amankan akun Anda.",
    details: {
      fromAddress: "no-reply@accounts.google.com",
      attachmentOrUrl: "https://myaccount.google.com/notifications"
    },
    isPhishing: false,
    redFlagExplanation: "Email Legit. Notifikasi resmi dari Google Security dengan header DKIM/SPF terverifikasi dari 'accounts.google.com' yang mengarahkan langsung ke URL resmi Google Account.",
    forensicClues: [
      "Sender resmi accounts.google.com",
      "URL resmi myaccount.google.com",
      "Prosedur standar keamanan akun"
    ]
  },
  {
    id: 8,
    type: "Email",
    sender: "HRD - Employee Wellness Program",
    subjectOrHeader: "Survei Kenaikan Gaji & Bonus Tahunan Karyawan 2026",
    snippet: "Silakan isi kuesioner rahasia berikut dan masukkan password akun email perusahaan Anda untuk memverifikasi hak akses melihat tabel kenaikan gaji baru.",
    details: {
      fromAddress: "hr-survey@google-docs-forms-secure.com",
      attachmentOrUrl: "http://form-gaji-karyawan-update.web.app"
    },
    isPhishing: true,
    redFlagExplanation: "Serangan Phishing berbasis Kredensial. HRD resmi tidak akan pernah meminta password email Anda di dalam form survei Google Docs atau domain form pihak ketiga!",
    forensicClues: [
      "Meminta password email di form",
      "Domain palsu mengatasnamakan HR",
      "Topik sensitif memancing rasa penasaran"
    ]
  },
  {
    id: 9,
    type: "Email",
    sender: "Slack Technologies",
    subjectOrHeader: "You were added to #incident-response channel by Admin",
    snippet: "You have been invited to participate in the security response discussion. Open Slack to join the conversation.",
    details: {
      fromAddress: "notification@slack.com",
      attachmentOrUrl: "https://app.slack.com/client/T08819/C0112"
    },
    isPhishing: false,
    redFlagExplanation: "Email Legit. Tautan mengarah langsung ke aplikasi web client Slack resmi (app.slack.com) dengan origin domain valid tanpa manipulasi.",
    forensicClues: [
      "Domain notification@slack.com",
      "Tautan resmi app.slack.com",
      "Tidak ada permintaan unduh file asing"
    ]
  },
  {
    id: 10,
    type: "Email",
    sender: "Bank BCA KlikBCA Notification",
    subjectOrHeader: "Transaksi Pembelian Online Berhasil Sebesar Rp 12.850.000",
    snippet: "Jika Anda tidak merasa melakukan transaksi ini, segera klik link pembatalan di bawah ini dalam kurun waktu 10 menit untuk membatalkan tagihan.",
    details: {
      fromAddress: "ebanking@klikbca-bataltransaksi.com",
      attachmentOrUrl: "https://bca-klik-batal.id/secure-verify"
    },
    isPhishing: true,
    redFlagExplanation: "Taktik Reverse Phishing (Panic Inducement). Pelaku memalsukan notifikasi transaksi fiktif bernilai besar agar korban panik dan buru-buru mengklik link pembatalan palsu.",
    forensicClues: [
      "Domain klikbca-bataltransaksi.com (Bukan klikbca.com)",
      "Menciptakan kepanikan finansial",
      "Link pembatalan palsu untuk memanen kartu kredit"
    ]
  }
]

export function PhishOrLegitGame() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(12)
  const [gameState, setGameState] = useState<"ready" | "playing" | "review" | "gameover" | "victory">("ready")

  const [lastAnswer, setLastAnswer] = useState<{
    userChosePhishing: boolean
    isCorrect: boolean
    scenario: CardScenario
  } | null>(null)

  const currentScenario = SCENARIOS[currentIndex]

  // Timer countdown during playing
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time out counted as failure
          handleAnswer(false, true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, currentIndex, lives])

  const handleStartGame = () => {
    setCurrentIndex(0)
    setLives(3)
    setScore(0)
    setStreak(0)
    setTimeLeft(12)
    setLastAnswer(null)
    setGameState("playing")
  }

  const handleAnswer = (userChosePhishing: boolean, isTimeOut: boolean = false) => {
    const isCorrect = !isTimeOut && userChosePhishing === currentScenario.isPhishing

    if (isCorrect) {
      const bonus = streak * 50 + timeLeft * 10
      setScore((prev) => prev + 100 + bonus)
      setStreak((prev) => prev + 1)
    } else {
      setStreak(0)
      setLives((prev) => prev - 1)
    }

    setLastAnswer({
      userChosePhishing,
      isCorrect,
      scenario: currentScenario
    })

    setGameState("review")
  }

  const handleNextCard = () => {
    // Check if dead
    if (lives <= 1 && !lastAnswer?.isCorrect) {
      setGameState("gameover")
      return
    }

    // Check if finished
    if (currentIndex + 1 >= SCENARIOS.length) {
      setGameState("victory")
      return
    }

    setCurrentIndex((prev) => prev + 1)
    setTimeLeft(12)
    setGameState("playing")
  }

  return (
    <div className="space-y-6">
      {/* Game State: READY */}
      {gameState === "ready" && (
        <div className="bg-[#101724] border border-[#1f2b3e] rounded-2xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Zap className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/20">
              Reflex Security Challenge
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Phish or Legit?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Anda memiliki 12 detik per skenario untuk memutuskan: Apakah pesan ini adalah <strong>Phishing (Bahaya)</strong> atau <strong>Legit (Aman)</strong>? Jaga 3 nyawa Anda tetap utuh!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-[#0b111a] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Total Kartu</span>
              <span className="font-bold text-slate-200 text-sm">10 Kasus</span>
            </div>
            <div className="bg-[#0b111a] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Waktu / Kartu</span>
              <span className="font-bold text-slate-200 text-sm">12 Detik</span>
            </div>
            <div className="bg-[#0b111a] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Nyawa</span>
              <span className="font-bold text-rose-400 text-sm">3 Nyawa</span>
            </div>
          </div>

          <Button
            onClick={handleStartGame}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl py-3 text-sm gap-2 shadow-lg shadow-cyan-500/20"
          >
            Mulai Permainan <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Game State: PLAYING */}
      {gameState === "playing" && (
        <div className="max-w-xl mx-auto space-y-4">
          {/* Top HUD */}
          <div className="flex items-center justify-between bg-[#101724] border border-[#1f2b3e] rounded-xl px-4 py-2.5 text-xs">
            {/* Lives */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 ${
                    heart <= lives
                      ? "text-rose-500 fill-rose-500 animate-pulse"
                      : "text-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-1 font-mono font-bold ${
                timeLeft <= 4 ? "text-rose-400 animate-bounce" : "text-cyan-400"
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>

            {/* Score & Streak */}
            <div className="flex items-center gap-2">
              {streak > 1 && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {streak}x Combo!
                </span>
              )}
              <span className="font-mono font-bold text-slate-100">
                {score} PTS
              </span>
            </div>
          </div>

          {/* Scenario Card */}
          <div className="bg-[#121c2c] border border-cyan-500/30 rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1d2a3e] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                {currentScenario.type === "Email" && <Mail className="w-3 h-3" />}
                {currentScenario.type === "Chat" && <MessageSquare className="w-3 h-3" />}
                {currentScenario.type === "Invoice" && <FileText className="w-3 h-3" />}
                {currentScenario.type === "QR Code" && <QrCode className="w-3 h-3" />}
                {currentScenario.type} Case #{currentScenario.id}
              </span>
              <span className="text-xs text-slate-500">
                {currentIndex + 1} dari {SCENARIOS.length}
              </span>
            </div>

            {/* Sender & Header */}
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Pengirim:</div>
              <div className="text-sm font-bold text-slate-100">
                {currentScenario.sender}
              </div>
              <div className="text-[11px] font-mono text-cyan-300/80 bg-[#09101b] px-2.5 py-1 rounded-lg border border-[#1b273a] break-all">
                {currentScenario.details.fromAddress}
              </div>
            </div>

            {/* Subject */}
            <div className="bg-[#0e1624] p-3 rounded-xl border border-[#1a2638] space-y-1">
              <div className="text-[11px] font-bold text-slate-300">
                {currentScenario.subjectOrHeader}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                "{currentScenario.snippet}"
              </p>
            </div>

            {/* Crucial Details Inspector */}
            <div className="space-y-1.5 text-[11px]">
              {currentScenario.details.attachmentOrUrl && (
                <div className="bg-[#09101b] p-2.5 rounded-lg border border-[#182333] flex items-center justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Tautan / Lampiran:</span>
                  <span className="font-mono text-amber-300 truncate font-semibold">
                    {currentScenario.details.attachmentOrUrl}
                  </span>
                </div>
              )}
              {currentScenario.details.urgencyText && (
                <div className="bg-rose-950/20 p-2 rounded-lg border border-rose-500/20 text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>{currentScenario.details.urgencyText}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <Button
                onClick={() => handleAnswer(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
              >
                <ShieldAlert className="w-4 h-4" /> INI PHISHING!
              </Button>
              <Button
                onClick={() => handleAnswer(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <ShieldCheck className="w-4 h-4" /> AMAN (LEGIT)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Game State: REVIEW AFTER EACH CARD */}
      {gameState === "review" && lastAnswer && (
        <div className="max-w-xl mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`border rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl ${
              lastAnswer.isCorrect
                ? "bg-[#0b1c1b] border-emerald-500/40 text-emerald-200"
                : "bg-[#1c0f14] border-rose-500/40 text-rose-200"
            }`}
          >
            {/* Header Status */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  lastAnswer.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {lastAnswer.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {lastAnswer.isCorrect ? "Keputusan Tepat! 🎉" : "Kurang Tepat! ⚠️"}
                </h3>
                <p className="text-xs text-slate-400">
                  Kasus ini sebenarnya adalah:{" "}
                  <strong className={lastAnswer.scenario.isPhishing ? "text-rose-400" : "text-emerald-400"}>
                    {lastAnswer.scenario.isPhishing ? "PHISHING" : "LEGIT / AMAN"}
                  </strong>
                </p>
              </div>
            </div>

            {/* Forensic Explanation */}
            <div className="bg-[#000000]/40 p-4 rounded-xl border border-white/5 space-y-2 text-xs text-slate-300">
              <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                Analisis Forensik Keamanan:
              </span>
              <p className="leading-relaxed">
                {lastAnswer.scenario.redFlagExplanation}
              </p>

              <div className="pt-2 flex flex-wrap gap-1.5">
                {lastAnswer.scenario.forensicClues.map((clue, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono"
                  >
                    • {clue}
                  </span>
                ))}
              </div>
            </div>

            <Button
              onClick={handleNextCard}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl py-2.5 text-xs gap-1.5"
            >
              Lanjut ke Kasus Berikutnya <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Game State: GAME OVER */}
      {gameState === "gameover" && (
        <div className="bg-[#1c0f14] border border-rose-500/40 rounded-2xl p-8 sm:p-10 text-center space-y-5 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <XCircle className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-100">
              Nyawa Habis (Game Over)!
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anda terjebak serangan phishing 3 kali. Jangan khawatir, kenali red flag dan coba lagi untuk melatih kejelian mata Anda!
            </p>
          </div>

          <div className="bg-[#000000]/40 p-4 rounded-xl border border-white/5 text-xs text-slate-300 flex justify-between">
            <span>Skor Akhir:</span>
            <span className="font-bold text-cyan-400 font-mono text-sm">{score} PTS</span>
          </div>

          <Button
            onClick={handleStartGame}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl py-2.5 text-xs gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Coba Lagi
          </Button>
        </div>
      )}

      {/* Game State: VICTORY */}
      {gameState === "victory" && (
        <div className="bg-[#0b1c1b] border border-emerald-500/40 rounded-2xl p-8 sm:p-10 text-center space-y-5 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-100">
              Luar Biasa! Semua Kasus Tuntas!
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Insting deteksi phishing Anda sangat tajam! Anda berhasil menuntaskan seluruh 10 skenario dengan sisa nyawa {lives} ❤️.
            </p>
          </div>

          <div className="bg-[#000000]/40 p-4 rounded-xl border border-white/5 text-xs text-slate-300 flex justify-between">
            <span>Skor Total:</span>
            <span className="font-bold text-emerald-400 font-mono text-base">{score} PTS</span>
          </div>

          <Button
            onClick={handleStartGame}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl py-2.5 text-xs gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Main Lagi
          </Button>
        </div>
      )}
    </div>
  )
}
