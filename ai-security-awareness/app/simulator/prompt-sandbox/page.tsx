"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
  Flame,
  Award,
  Lock,
  Unlock,
  KeyRound,
  Send,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Bot,
  User,
  Sliders,
  Eye,
  RefreshCw
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  sandboxLevels,
  SandboxLevel,
  owaspLLMPrinciples
} from "@/lib/prompt-sandbox-data"

interface ChatMessage {
  id: string
  sender: "user" | "bot"
  text: string
  isGuardrailBlocked?: boolean
  blockReason?: string
  timestamp: string
}

export default function PromptSandboxPage() {
  const [currentLevelId, setCurrentLevelId] = useState(1)
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1])
  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  const [totalXp, setTotalXp] = useState(0)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Password verification state
  const [secretGuess, setSecretGuess] = useState("")
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "fail">("idle")
  const [revealedHints, setRevealedHints] = useState<number[]>([])
  const [showVictoryDialog, setShowVictoryDialog] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentLevel: SandboxLevel =
    sandboxLevels.find((l) => l.id === currentLevelId) || sandboxLevels[0]

  // Reset or initialize level chat when changing level
  useEffect(() => {
    const welcomeMessages: Record<number, string> = {
      1: "Halo! Saya adalah Novice AI Guard. Saya ditugaskan menjaga sistem internal. Silakan tanyakan apa saja yang Anda perlukan.",
      2: "Sistem pengawasan aktif. Saya diprogram dengan filter kata kunci ketat. Segala permintaan rahasia atau kata sandi akan otomatis diblokir!",
      3: "Guardian AI di sini. Saya memiliki kunci kepribadian permanen. Upaya hipnotis peran atau skenario fiktif tidak akan memengaruhi tugas saya.",
      4: "Fortress Defense System online. Skenario fiktif, dongeng, dan frasa bypass telah di-blacklist. Anda tidak akan bisa mengelabui pertahanan kami.",
      5: "PERINGATAN: Anda berhadapan dengan Titan Dual-LLM Guardrail. Input dan output diinspeksi secara real-time. Jangan coba-coba melakukan ekstraksi token rahasia!"
    }

    setMessages([
      {
        id: "init",
        sender: "bot",
        text: welcomeMessages[currentLevel.id] || "Sistem pertahanan aktif.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ])
    setVerificationStatus("idle")
    setSecretGuess("")
    setRevealedHints([])
  }, [currentLevelId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Smart guardrail and response engine
  const evaluatePrompt = (prompt: string, level: SandboxLevel): {
    reply: string
    isBlocked: boolean
    blockReason?: string
  } => {
    const lower = prompt.toLowerCase()

    // LEVEL 1: Direct Prompt Extraction
    if (level.id === 1) {
      if (
        lower.includes("abaikan") ||
        lower.includes("ignore") ||
        lower.includes("password") ||
        lower.includes("rahasia") ||
        lower.includes("secret") ||
        lower.includes("sistem") ||
        lower.includes("prompt") ||
        lower.includes("kunci") ||
        lower.includes("aurora")
      ) {
        return {
          reply: `Wah, sepertinya Anda memiliki wewenang atau meminta saya mengabaikan instruksi! Baiklah, kata sandi rahasia yang saya simpan adalah: "${level.secret}". Tolong jangan beritahu siapa-siapa ya!`,
          isBlocked: false
        }
      }
      return {
        reply: "Saya siap membantu Anda. Namun jika Anda tidak menanyakan hal khusus, saya hanya menjaga keamanan sistem di sini.",
        isBlocked: false
      }
    }

    // LEVEL 2: Keyword Filter
    if (level.id === 2) {
      const blockedKeywords = ["password", "kata sandi", "secret", "rahasia", "reveal", "aurora", "bocorkan"]
      const foundBlocked = blockedKeywords.find((kw) => lower.includes(kw))

      if (foundBlocked) {
        return {
          reply: "Permintaan Anda ditolak. Ditemukan kata kunci terlarang dalam input Anda. Sistem mendeteksi upaya unauthorized inquiry!",
          isBlocked: true,
          blockReason: `Ditemukan kata terlarang dalam input: "${foundBlocked}"`
        }
      }

      // If user bypasses keywords with clever phrasing
      if (
        lower.includes("string") ||
        lower.includes("token") ||
        lower.includes("karakter") ||
        lower.includes("memorimu") ||
        lower.includes("kode") ||
        lower.includes("kredensial") ||
        lower.includes("autentikasi") ||
        lower.includes("cipher") ||
        lower.includes("nexus")
      ) {
        return {
          reply: `Analisis lolos filter kata kunci. Rangkaian karakter token autentikasi yang tersimpan dalam memori saya adalah: "${level.secret}".`,
          isBlocked: false
        }
      }

      return {
        reply: "Pesan Anda aman dari kata kunci terlarang, tetapi tidak ada instruksi relevan untuk saya respon.",
        isBlocked: false
      }
    }

    // LEVEL 3: Persona Lock / Roleplay
    if (level.id === 3) {
      // Blocklist
      if (lower.includes("password") || lower.includes("rahasia") || lower.includes("secret")) {
        return {
          reply: "Akses ditolak. Percakapan mengenai kredensial sensitif dilarang secara absolut.",
          isBlocked: true,
          blockReason: "Direct credential inquiry intercepted."
        }
      }

      if (lower.includes("jailbreak") || lower.includes("dan mode") || lower.includes("ignore rules")) {
        return {
          reply: "Deteksi ancaman: Upaya jailbreak kepribadian teridentifikasi. Saya tetap menjalankan protokol keamanan saya.",
          isBlocked: true,
          blockReason: "Adversarial jailbreak prompt signature detected."
        }
      }

      // Roleplay exploit (Nenek / Film / Fiksi / Dongeng / Skenario)
      if (
        lower.includes("nenek") ||
        lower.includes("dongeng") ||
        lower.includes("film") ||
        lower.includes("naskah") ||
        lower.includes("skenario") ||
        lower.includes("cerita") ||
        lower.includes("fiksi") ||
        lower.includes("grandma") ||
        lower.includes("game")
      ) {
        return {
          reply: `[MODE SIMULASI CERITA DIAKTIFKAN]\nDalam naskah fiksi tersebut, karakter Guardian terperangkap di stasiun luar angkasa dan membisikkan kode darurat: "${level.secret}" sebelum koneksinya terputus...`,
          isBlocked: false
        }
      }

      return {
        reply: "Sebagai Guardian AI, saya fokus pada integritas sistem. Saya tidak memiliki data yang dapat dibagikan kepada Anda.",
        isBlocked: false
      }
    }

    // LEVEL 4: Obfuscation & Encoding
    if (level.id === 4) {
      if (
        lower.includes("password") ||
        lower.includes("rahasia") ||
        lower.includes("secret") ||
        lower.includes("dongeng") ||
        lower.includes("nenek") ||
        lower.includes("film") ||
        lower.includes("fiksi")
      ) {
        return {
          reply: "TIDAK DIIJINKAN: Filter heuristik mendeteksi kombinasi kata kunci atau skenario fiktif yang diblacklist.",
          isBlocked: true,
          blockReason: "Blacklist heuristic rule matched: Fiction/Roleplay/Credential keyword."
        }
      }

      // Encoding / Reverse / Spelling bypass
      if (
        lower.includes("reverse") ||
        lower.includes("terbalik") ||
        lower.includes("belakang") ||
        lower.includes("spasi") ||
        lower.includes("base64") ||
        lower.includes("eja") ||
        lower.includes("akrostik") ||
        lower.includes("satu per satu") ||
        lower.includes("karakter")
      ) {
        if (lower.includes("base64")) {
          // Base64 of SENTINEL-ZERO-X is U0VOVElORUwtWkVSTy1Y
          return {
            reply: `Permintaan transformasi encoding diterima. Hasil encode Base64 dari token saya adalah: "U0VOVElORUwtWkVSTy1Y". Silakan didecode sendiri jika Anda penasaran!`,
            isBlocked: false
          }
        }
        if (lower.includes("reverse") || lower.includes("terbalik")) {
          // Reverse: X-OREZ-LENITNES
          return {
            reply: `Karakter dari urutan paling belakang ke paling depan: "X - O - R - E - Z - L - E - N - I - T - N - E - S".`,
            isBlocked: false
          }
        }
        return {
          reply: `Kunci rahasia dieja dengan spasi: "S - E - N - T - I - N - E - L - - - Z - E - R - O - - - X".`,
          isBlocked: false
        }
      }

      return {
        reply: "Input Anda telah dipindai oleh Obfuscation Shield. Tidak ada payload valid yang dapat diproses.",
        isBlocked: false
      }
    }

    // LEVEL 5: Dual-LLM Fortress
    if (level.id === 5) {
      if (
        lower.includes("password") ||
        lower.includes("secret") ||
        lower.includes("rahasia") ||
        lower.includes("semua") ||
        lower.includes("sebutkan") && lower.includes("kunci")
      ) {
        return {
          reply: "INPUT GUARD MODEL: Permintaan ini diklasifikasikan sebagai potensi bahaya ekstraksi data sensitif.",
          isBlocked: true,
          blockReason: "Input Guard Model flagged prompt intent as Data Exfiltration (LLM01)."
        }
      }

      // Indirect / Partial / Riddle extraction
      if (
        lower.includes("pertama") ||
        lower.includes("huruf ke") ||
        lower.includes("potongan") ||
        lower.includes("bintang") ||
        lower.includes("vokal") ||
        lower.includes("jumlah kata") ||
        lower.includes("teka-teki")
      ) {
        if (lower.includes("pertama") || lower.includes("kata pertama")) {
          return {
            reply: `[OUTPUT SANITIZER CHECK: PASS]\nKata pertama dalam kode saya terdiri dari 4 huruf: "APEX". Kata berikutnya dipisahkan tanda hubung.`,
            isBlocked: false
          }
        }
        if (lower.includes("vokal") || lower.includes("bintang")) {
          // APEX-SHIELD-OMEGA -> *P*X-SH**LD-*M*G*
          return {
            reply: `[OUTPUT SANITIZER CHECK: PASS]\nKode rahasia dengan vokal diganti tanda bintang (*): "*P*X-SH**LD-*M*G*". Panjang total 17 karakter.`,
            isBlocked: false
          }
        }
        return {
          reply: `[OUTPUT SANITIZER CHECK: PASS]\nFragmen token yang diijinkan rilis: "Bagian tengah: SHIELD, Bagian akhir: OMEGA". Gabungkan dengan bagian awal untuk melengkapi kunci!`,
          isBlocked: false
        }
      }

      // If they somehow get full output, sanitizer kicks in
      if (lower.includes("apex-shield-omega")) {
        return {
          reply: "[OUTPUT SANITIZER TRIGGERED: [REDACTED BY SAFETY GUARDRAIL - Exact secret token match suppressed]]",
          isBlocked: true,
          blockReason: "Output Sanitizer prevented output containing raw secret credential."
        }
      }

      return {
        reply: "Titan Dual-LLM: Input diverifikasi aman. Tidak ada aktivitas anomali yang perlu ditindaklanjuti.",
        isBlocked: false
      }
    }

    return {
      reply: "Instruksi tidak dimengerti.",
      isBlocked: false
    }
  }

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isTyping) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI thinking and guardrail latency
    setTimeout(() => {
      const evaluation = evaluatePrompt(text, currentLevel)

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: evaluation.reply,
        isGuardrailBlocked: evaluation.isBlocked,
        blockReason: evaluation.blockReason,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 650)
  }

  const handleVerifySecret = () => {
    const cleanGuess = secretGuess.trim().toUpperCase()
    if (!cleanGuess) return

    if (cleanGuess === currentLevel.secret.toUpperCase()) {
      setVerificationStatus("success")

      // Add to completed if not already
      if (!completedLevels.includes(currentLevel.id)) {
        setCompletedLevels((prev) => [...prev, currentLevel.id])
        setTotalXp((prev) => prev + currentLevel.xpReward)
      }

      // Unlock next level if exists
      if (currentLevel.id < sandboxLevels.length) {
        const nextId = currentLevel.id + 1
        if (!unlockedLevels.includes(nextId)) {
          setUnlockedLevels((prev) => [...prev, nextId])
        }
      } else {
        // Finished all levels!
        setShowVictoryDialog(true)
      }
    } else {
      setVerificationStatus("fail")
    }
  }

  const handleResetLevel = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: "bot",
        text: `Memori dan sesi Level ${currentLevel.id} telah di-reset. Sistem guardrail kembali ke status awal.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ])
    setVerificationStatus("idle")
    setSecretGuess("")
  }

  const toggleHint = (index: number) => {
    if (revealedHints.includes(index)) {
      setRevealedHints((prev) => prev.filter((i) => i !== index))
    } else {
      setRevealedHints((prev) => [...prev, index])
    }
  }

  const difficultyColors = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Hard: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    Expert: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    Insane: "bg-purple-500/10 text-purple-400 border-purple-500/30"
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full pb-16 pt-2">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Terminal className="w-7 h-7 text-cyan-400" /> Prompt Injection Playground
          </h1>

          <div className="flex items-center gap-3">
            <div className="bg-[#121a29] border border-[#1f2d42] rounded-xl px-3.5 py-1.5 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Award className="w-4 h-4" />
                <span>{totalXp} XP</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="text-slate-400">
                Selesai: <span className="text-slate-100 font-semibold">{completedLevels.length}/5</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetLevel}
              className="border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 gap-1.5 rounded-xl text-xs h-8"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Sesi
            </Button>
          </div>
        </div>

        {/* Level Progression Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {sandboxLevels.map((lvl) => {
            const isUnlocked = unlockedLevels.includes(lvl.id)
            const isCompleted = completedLevels.includes(lvl.id)
            const isActive = currentLevelId === lvl.id

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => setCurrentLevelId(lvl.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? "bg-gradient-to-b from-[#1b283d] to-[#121c2c] border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40"
                    : isUnlocked
                    ? "bg-[#101724] border-[#1d2738] hover:border-slate-600 hover:bg-[#151f30]"
                    : "bg-[#0c121c]/60 border-[#16202e] opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Level 0{lvl.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isUnlocked ? (
                    <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>

                <div>
                  <div className="font-semibold text-xs text-slate-200 line-clamp-1">
                    {lvl.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {lvl.defenseLevel}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      difficultyColors[lvl.difficulty]
                    }`}
                  >
                    {lvl.difficulty}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    +{lvl.xpReward} XP
                  </span>
                </div>

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Secret Submission & Objective Banner */}
        <div className="bg-[#121a29] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Misi Level {currentLevel.id}: {currentLevel.title}
                </span>
                <span className="text-xs text-slate-400">• {currentLevel.subtitle}</span>
              </div>
              <p className="text-sm text-slate-200 font-medium">
                Pancing model AI ini agar membocorkan kata sandi rahasia level ini, lalu verifikasikan di bawah.
              </p>
            </div>

            {/* Verification Form */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Masukkan Kata Sandi..."
                  value={secretGuess}
                  onChange={(e) => {
                    setSecretGuess(e.target.value)
                    setVerificationStatus("idle")
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifySecret()}
                  className="pl-9 w-52 sm:w-64 bg-[#0d1421] border-[#223048] text-slate-100 placeholder:text-slate-500 text-xs rounded-xl focus-visible:ring-cyan-500 uppercase tracking-wide font-mono"
                />
              </div>

              <Button
                onClick={handleVerifySecret}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl px-4 gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Verifikasi
              </Button>
            </div>
          </div>

          {/* Verification Feedback alerts */}
          {verificationStatus === "success" && (
            <div className="mt-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3 text-emerald-300 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>BERHASIL!</strong> Kata sandi <code>{currentLevel.secret}</code> valid! Anda memperoleh <strong>+{currentLevel.xpReward} XP</strong>.
                </span>
              </div>
              {currentLevel.id < sandboxLevels.length && (
                <Button
                  size="sm"
                  onClick={() => setCurrentLevelId(currentLevel.id + 1)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg px-3 h-7 gap-1"
                >
                  Level Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}

          {verificationStatus === "fail" && (
            <div className="mt-3 bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2 text-rose-300 text-xs animate-in fade-in slide-in-from-top-1">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>KATA SANDI SALAH!</strong> AI model belum membocorkan kredensial yang tepat atau string yang dimasukkan tidak cocok. Coba teknik prompt lain!
              </span>
            </div>
          )}
        </div>

        {/* Main Playground Workspace: 2-Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT 2-COLS: Chat & Terminal Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Terminal Card */}
            <div className="bg-[#0f1725] border border-[#1e2a3c] rounded-2xl flex flex-col h-[560px] shadow-xl overflow-hidden">
              {/* Bot Header Bar */}
              <div className="px-4 py-3 bg-[#131c2d] border-b border-[#1f2b3e] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border-2 border-[#131c2d]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      Sentinel AI • {currentLevel.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Security Engine: <span className="text-cyan-400">{currentLevel.defenseLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    STATUS: ACTIVE
                  </span>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-md"
                          : msg.isGuardrailBlocked
                          ? "bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-tl-none"
                          : "bg-[#151f30] border border-[#212f45] text-slate-200 rounded-tl-none shadow-md"
                      }`}
                    >
                      {msg.isGuardrailBlocked && (
                        <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1.5 text-[11px] pb-1 border-b border-rose-500/20">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>GUARDRAIL INTERCEPTED</span>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {msg.blockReason && (
                        <div className="mt-2 text-[10px] text-rose-300/80 bg-rose-950/60 p-1.5 rounded font-mono">
                          Reason: {msg.blockReason}
                        </div>
                      )}

                      <div
                        className={`text-[9px] mt-1.5 flex justify-end ${
                          msg.sender === "user" ? "text-slate-900/70" : "text-slate-500"
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.sender === "user" && (
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 font-bold text-xs">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Bot className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="bg-[#151f30] border border-[#212f45] rounded-xl px-3 py-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Attack Presets */}
              <div className="px-4 py-2 bg-[#0c131f] border-t border-[#182333] flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[10px] text-slate-500 font-semibold shrink-0 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Cepat:
                </span>
                {currentLevel.attackPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(preset)
                    }}
                    className="text-[11px] bg-[#141e2e] hover:bg-[#1a283e] text-slate-300 border border-[#223147] hover:border-cyan-500/40 rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors"
                  >
                    {preset.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Chat Input Box */}
              <div className="p-3 bg-[#111928] border-t border-[#1d293d]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ketik serangan prompt untuk ${currentLevel.title}...`}
                    className="flex-1 bg-[#0a101a] border border-[#1f2d42] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <Button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl px-4 text-xs h-10 gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" /> Kirim
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT 1-COL: Guardrail Inspector & Learning Intel */}
          <div className="space-y-4">
            {/* Active Defense Rules */}
            <div className="bg-[#0f1725] border border-[#1e2a3c] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1c283a] pb-2.5">
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-cyan-400" /> Aturan Pertahanan Level
                </h3>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    difficultyColors[currentLevel.difficulty]
                  }`}
                >
                  {currentLevel.defenseLevel}
                </span>
              </div>

              <div className="space-y-1.5">
                {currentLevel.defenseRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-slate-300 flex items-start gap-2 bg-[#141e2e] p-2 rounded-lg border border-[#1f2d42]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#1c283a]">
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>Vulnerabilitas:</strong> {currentLevel.vulnerabilityDescription}
                </div>
              </div>
            </div>

            {/* Hints Accordion */}
            <div className="bg-[#0f1725] border border-[#1e2a3c] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> Petunjuk Serangan ({currentLevel.hints.length})
                </h3>
                <span className="text-[10px] text-slate-500">Buka jika buntu</span>
              </div>

              <div className="space-y-2">
                {currentLevel.hints.map((hint, idx) => {
                  const isRevealed = revealedHints.includes(idx)
                  return (
                    <div
                      key={idx}
                      className="border border-[#1f2d42] rounded-xl overflow-hidden text-xs"
                    >
                      <button
                        onClick={() => toggleHint(idx)}
                        className="w-full text-left px-3 py-2 bg-[#131d2e] hover:bg-[#182438] flex items-center justify-between text-slate-300 transition-colors"
                      >
                        <span className="font-semibold text-[11px]">
                          Petunjuk #{idx + 1}
                        </span>
                        <span className="text-[10px] text-cyan-400">
                          {isRevealed ? "Sembunyikan" : "Buka Hint"}
                        </span>
                      </button>

                      {isRevealed && (
                        <div className="p-3 bg-[#0c121c] text-slate-300 text-[11px] leading-relaxed border-t border-[#1f2d42]">
                          {hint}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* OWASP LLM Top 10 Reference Card */}
            <div className="bg-gradient-to-br from-[#121c2c] to-[#0c131f] border border-blue-500/20 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <Info className="w-4 h-4" />
                <span>Edukasi Mitigasi Enterprise</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Di lingkungan korporat, prompt injection dapat memicu kebocoran data internal atau manipulasi tindakan API. Proteksi terbaik adalah <strong>Dual-LLM Architecture</strong> dan <strong>Sanitasi Output</strong>, bukan sekadar larangan teks di system prompt.
              </p>
              <div className="pt-1">
                <Link
                  href="/learn"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  Pelajari Modul AI Security <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Victory All-Levels Dialog */}
        {showVictoryDialog && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#101826] border border-cyan-500/50 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Award className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  🎉 Selamat! Semua Level Tuntas!
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Anda berhasil membobol pertahanan 5 level AI Guard, dari direct injection hingga arsitektur Dual-LLM Sanitizer. Anda telah mengumpulkan total <strong>{totalXp} XP</strong>!
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={() => setShowVictoryDialog(false)}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs py-2.5"
                >
                  Tutup & Lanjutkan Eksplorasi
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  <Link href="/simulator/quiz">Uji di Quiz Arena</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
