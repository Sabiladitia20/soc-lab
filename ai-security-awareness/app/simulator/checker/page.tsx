"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Clock,
  Cpu,
  Info,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  BookOpen
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Common dictionary / weak patterns
const COMMON_WEAK_PATTERNS = [
  "password", "123456", "12345678", "qwerty", "admin", "welcome",
  "login", "iloveyou", "secret", "default", "root", "rahasia",
  "indonesia", "security", "pass123", "abc123"
]

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generator states
  const [genLength, setGenLength] = useState(16)
  const [genIncludeUpper, setGenIncludeUpper] = useState(true)
  const [genIncludeNumbers, setGenIncludeNumbers] = useState(true)
  const [genIncludeSymbols, setGenIncludeSymbols] = useState(true)

  // Detailed analysis calculation
  const analysis = useMemo(() => {
    const len = password.length
    if (len === 0) {
      return {
        score: 0,
        label: "Masukkan Kata Sandi",
        color: "text-slate-400",
        barColor: "bg-slate-700",
        crackTimeOffline: "0 detik",
        crackTimeOnline: "0 detik",
        entropy: 0,
        checks: {
          minLen8: false,
          recLen14: false,
          hasUpper: false,
          hasLower: false,
          hasNumber: false,
          hasSymbol: false,
          noCommonWord: true,
          noRepeating: true,
        },
        warnings: [],
      }
    }

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)
    const minLen8 = len >= 8
    const recLen14 = len >= 14

    // Check common dictionary words
    const lower = password.toLowerCase()
    const foundWeak = COMMON_WEAK_PATTERNS.some((w) => lower.includes(w))
    const noCommonWord = !foundWeak

    // Check sequential or repeating characters (e.g. "aaa", "111", "abc", "123")
    const hasRepeating = /(.)\1{2,}/.test(password)
    const noRepeating = !hasRepeating

    // Calculate pool size
    let poolSize = 0
    if (hasLower) poolSize += 26
    if (hasUpper) poolSize += 26
    if (hasNumber) poolSize += 10
    if (hasSymbol) poolSize += 33

    // Shannon Entropy: E = L * log2(R)
    const entropy = poolSize > 0 ? Math.round(len * (Math.log(poolSize) / Math.log(2))) : 0

    // Score calculation (0 to 100)
    let rawScore = 0
    if (minLen8) rawScore += 20
    if (recLen14) rawScore += 20
    if (len >= 18) rawScore += 10
    if (hasUpper) rawScore += 10
    if (hasLower) rawScore += 10
    if (hasNumber) rawScore += 10
    if (hasSymbol) rawScore += 10
    if (noCommonWord) rawScore += 10
    if (noRepeating) rawScore += 10

    // Heavy penalties for dangerous weaknesses
    const warnings: string[] = []
    if (foundWeak) {
      rawScore = Math.min(rawScore, 30)
      warnings.push("Kata sandi mengandung kata kamus atau pola umum yang mudah ditebak.")
    }
    if (len < 8) {
      rawScore = Math.min(rawScore, 20)
      warnings.push("Panjang kata sandi di bawah 8 karakter sangat rentan terhadap brute force instan.")
    }
    if (hasRepeating) {
      warnings.push("Terdapat pengulangan karakter berturut-turut (misal 'aaa' atau '111').")
    }

    const finalScore = Math.min(100, Math.max(0, rawScore))

    // Estimate crack time
    // Total combinations = poolSize ^ length
    // GPU Rig Speed: ~100 Miliar hashes/sec (10^11)
    // Online rate limit: ~100 guesses/sec (10^2)
    const combinations = Math.pow(poolSize || 1, len)

    const formatCrackTime = (seconds: number): string => {
      if (seconds < 1) return "Instan (< 1 detik)"
      if (seconds < 60) return `${Math.round(seconds)} detik`
      if (seconds < 3600) return `${Math.round(seconds / 60)} menit`
      if (seconds < 86400) return `${Math.round(seconds / 3600)} jam`
      if (seconds < 31536000) return `${Math.round(seconds / 86400)} hari`
      if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} tahun`
      if (seconds < 31536000 * 1000000) return `${Math.round(seconds / (31536000 * 1000))} Ribu tahun`
      if (seconds < 31536000 * 1000000000) return `${Math.round(seconds / (31536000 * 1000000))} Juta tahun`
      return "Triliunan Tahun (Unbreakable)"
    }

    const secondsOffline = foundWeak ? 0.001 : combinations / 1e11
    const secondsOnline = foundWeak ? 0.5 : combinations / 100

    let label = "Sangat Lemah"
    let color = "text-rose-400"
    let barColor = "bg-rose-500"

    if (finalScore >= 90) {
      label = "Sangat Kuat (Enterprise Ready)"
      color = "text-cyan-400"
      barColor = "bg-cyan-500"
    } else if (finalScore >= 75) {
      label = "Kuat (Strong)"
      color = "text-emerald-400"
      barColor = "bg-emerald-500"
    } else if (finalScore >= 50) {
      label = "Cukup (Fair)"
      color = "text-amber-400"
      barColor = "bg-amber-500"
    } else if (finalScore >= 25) {
      label = "Lemah (Weak)"
      color = "text-orange-400"
      barColor = "bg-orange-500"
    }

    return {
      score: finalScore,
      label,
      color,
      barColor,
      crackTimeOffline: formatCrackTime(secondsOffline),
      crackTimeOnline: formatCrackTime(secondsOnline),
      entropy,
      checks: {
        minLen8,
        recLen14,
        hasUpper,
        hasLower,
        hasNumber,
        hasSymbol,
        noCommonWord,
        noRepeating,
      },
      warnings,
    }
  }, [password])

  // Generate strong random password
  const handleGeneratePassword = () => {
    let charset = "abcdefghijklmnopqrstuvwxyz"
    if (genIncludeUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (genIncludeNumbers) charset += "0123456789"
    if (genIncludeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    let result = ""
    const array = new Uint32Array(genLength)
    crypto.getRandomValues(array)
    for (let i = 0; i < genLength; i++) {
      result += charset[array[i] % charset.length]
    }

    setPassword(result)
  }

  const handleCopy = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full pb-16 pt-2">
        {/* Header */}
        <div className="border-b border-border/50 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Lock className="w-7 h-7 text-cyan-400" /> Password Strength & Security Checker
          </h1>
        </div>

        {/* Privacy Assurance Banner */}
        <div className="bg-[#0e1624] border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3.5 text-xs text-slate-300">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-cyan-300 block">Privasi 100% Terjamin (Client-Side Only)</span>
            <span className="text-slate-400">
              Pemeriksaan dilakukan secara lokal di memori browser Anda. Kata sandi tidak pernah dikirim, disimpan, atau dicatat oleh server mana pun.
            </span>
          </div>
        </div>

        {/* Main Password Input & Analysis Card */}
        <div className="bg-[#101724] border border-[#1f2b3e] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Masukkan Kata Sandi Untuk Diuji
              </label>
              {password && (
                <span className="text-xs text-slate-400 font-mono">
                  {password.length} Karakter • Entropi: {analysis.entropy} bits
                </span>
              )}
            </div>

            {/* Input Box */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ketik atau tempel kata sandi di sini..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#090f19] border border-[#1e2a3c] rounded-xl px-4 py-3.5 text-sm sm:text-base font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors pr-28"
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title={showPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!password}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30"
                  title="Salin Kata Sandi"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                {password && (
                  <button
                    type="button"
                    onClick={() => setPassword("")}
                    className="p-1.5 text-xs text-slate-500 hover:text-slate-300"
                    title="Kosongkan"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Strength Meter Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Tingkat Kekuatan:</span>
              <span className={`font-bold ${analysis.color}`}>
                {analysis.label} ({analysis.score}%)
              </span>
            </div>

            <div className="w-full bg-[#182333] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${analysis.barColor}`}
                style={{ width: `${Math.max(4, analysis.score)}%` }}
              />
            </div>
          </div>

          {/* Warnings (if any) */}
          {analysis.warnings.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3.5 space-y-1 text-xs text-rose-300">
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-4 h-4" /> Peringatan Keamanan Terdeteksi:
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-200">
                {analysis.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Crack Time Calculator Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#0c131f] border border-[#1b2738] rounded-xl p-4 space-y-1.5">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Serangan Offline (GPU Rig 100 GigaHash/dtk):</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-100 font-mono">
                {analysis.crackTimeOffline}
              </div>
              <p className="text-[10px] text-slate-500">
                Simulasi brute force hash NTLM/MD5 menggunakan rig 8x GPU modern.
              </p>
            </div>

            <div className="bg-[#0c131f] border border-[#1b2738] rounded-xl p-4 space-y-1.5">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Serangan Online (Rate-Limited 100 tebakan/dtk):</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-100 font-mono">
                {analysis.crackTimeOnline}
              </div>
              <p className="text-[10px] text-slate-500">
                Simulasi percobaan login web form dengan mekanisme proteksi rate limit.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Columns Grid: Criteria Checklist & Strong Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Criteria Checklist */}
          <div className="bg-[#101724] border border-[#1f2b3e] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Checklist Kepatuhan Keamanan
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c131f] border border-[#1a2538]">
                <span className="text-slate-300">Panjang minimal 8 karakter</span>
                {analysis.checks.minLen8 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c131f] border border-[#1a2538]">
                <span className="text-slate-300">Disarankan 14+ karakter (Enterprise Standard)</span>
                {analysis.checks.recLen14 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c131f] border border-[#1a2538]">
                <span className="text-slate-300">Mengandung huruf besar (A-Z)</span>
                {analysis.checks.hasUpper ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c131f] border border-[#1a2538]">
                <span className="text-slate-300">Mengandung huruf kecil (a-z)</span>
                {analysis.checks.hasLower ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c131f] border border-[#1a2538]">
                <span className="text-slate-300">Mengandung angka (0-9)</span>
                {analysis.checks.hasNumber ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c131f] border border-[#1a2538]">
                <span className="text-slate-300">Mengandung simbol khusus (!@#$%^&*)</span>
                {analysis.checks.hasSymbol ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c131f] border border-[#1a2538]">
                <span className="text-slate-300">Bebas dari kata kamus umum / mudah ditebak</span>
                {analysis.checks.noCommonWord ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
            </div>
          </div>

          {/* Built-in Generator & NIST Best Practices */}
          <div className="space-y-6">
            {/* Generator Card */}
            <div className="bg-[#101724] border border-[#1f2b3e] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Generator Kata Sandi Kuat
                </h3>
                <span className="text-xs text-cyan-400 font-mono font-bold">
                  {genLength} Karakter
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Panjang:</span>
                    <span>{genLength}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="32"
                    value={genLength}
                    onChange={(e) => setGenLength(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer bg-[#0c131f] p-2 rounded-lg border border-[#1a2538] text-slate-300">
                    <input
                      type="checkbox"
                      checked={genIncludeUpper}
                      onChange={(e) => setGenIncludeUpper(e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                    <span>A-Z</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-[#0c131f] p-2 rounded-lg border border-[#1a2538] text-slate-300">
                    <input
                      type="checkbox"
                      checked={genIncludeNumbers}
                      onChange={(e) => setGenIncludeNumbers(e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                    <span>0-9</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-[#0c131f] p-2 rounded-lg border border-[#1a2538] text-slate-300">
                    <input
                      type="checkbox"
                      checked={genIncludeSymbols}
                      onChange={(e) => setGenIncludeSymbols(e.target.checked)}
                      className="rounded accent-cyan-400"
                    />
                    <span>!@#$</span>
                  </label>
                </div>

                <Button
                  onClick={handleGeneratePassword}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs py-2.5 gap-2 shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Generate & Terapkan ke Checker
                </Button>
              </div>
            </div>

            {/* NIST SP 800-63B Guidelines Card */}
            <div className="bg-[#101724] border border-[#1f2b3e] rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Prinsip Keamanan NIST SP 800-63B</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                <li>
                  • <strong>Panjang mengalahkan kerumitan:</strong> Frasa sandi panjang (*Passphrase*) seperti <code className="text-cyan-300">kucing-makan-ikan-terbang-99</code> jauh lebih sulit dibobol daripada kata sandi pendek yang rumit seperti <code className="text-rose-300">P@s$1</code>.
                </li>
                <li>
                  • <strong>Gunakan Password Manager:</strong> Jangan menghafal puluhan kata sandi secara manual atau menggunakan ulang (*reuse*) password yang sama di banyak akun.
                </li>
                <li>
                  • <strong>Aktifkan MFA / Passkey:</strong> Password terkuat sekalipun tetap bisa dicuri lewat phishing jika tidak dilindungi lapisan autentikasi kedua.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
