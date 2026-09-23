"use client"

import { useState, useMemo } from "react"
import {
  Link2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Lock,
  Unlock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RedFlagItem {
  id: string
  title: string
  description: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "SAFE"
}

interface AnalysisResult {
  isValid: boolean
  rawUrl: string
  protocol: string
  isHttps: boolean
  hostname: string
  port: string
  subdomain: string
  apexDomain: string
  tld: string
  pathname: string
  fileExtension: string | null
  isDangerousExtension: boolean
  isIpAddress: boolean
  riskScore: number
  threatLevel: "SAFE" | "SUSPICIOUS" | "CRITICAL"
  verdictTitle: string
  verdictDesc: string
  recommendation: string
  redFlags: RedFlagItem[]
}

const TARGETED_BRANDS = [
  { name: "Bank Central Asia (BCA)", keywords: ["bca", "klikbca", "mybca"], legitDomain: "klikbca.com" },
  { name: "Bank Mandiri (Livin)", keywords: ["mandiri", "livin"], legitDomain: "bankmandiri.co.id" },
  { name: "Bank BRI (BRImo)", keywords: ["bri", "brimo"], legitDomain: "bri.co.id" },
  { name: "Bank BNI", keywords: ["bni", "wondr"], legitDomain: "bni.co.id" },
  { name: "Google", keywords: ["google", "gmail"], legitDomain: "google.com" },
  { name: "Microsoft", keywords: ["microsoft", "office365", "outlook"], legitDomain: "microsoft.com" },
  { name: "PayPal", keywords: ["paypal"], legitDomain: "paypal.com" },
  { name: "DANA", keywords: ["dana", "danaindonesia"], legitDomain: "dana.id" },
  { name: "Shopee", keywords: ["shopee"], legitDomain: "shopee.co.id" },
  { name: "Tokopedia", keywords: ["tokopedia"], legitDomain: "tokopedia.com" },
  { name: "Gojek", keywords: ["gojek", "gopay"], legitDomain: "gojek.com" },
]

const HIGH_RISK_TLDS = ["xyz", "top", "click", "buzz", "work", "rest", "tk", "ml", "ga", "cf", "gq", "site", "vip", "icu", "club"]
const HIGH_TRUST_TLDS = ["gov", "go.id", "mil", "mil.id", "edu", "ac.id"]
const DANGEROUS_EXTENSIONS = ["apk", "exe", "scr", "bat", "cmd", "vbs", "iso", "zip", "rar", "msi"]
const URL_SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy", "shorturl.at"]

const PRESET_SCENARIOS = [
  {
    name: "Phishing BCA (Subdomain)",
    url: "https://klikbca.com.auth-secure-login.xyz/ib/login.jsp",
    badge: "Phishing",
    badgeType: "danger"
  },
  {
    name: "Undangan Paket .APK",
    url: "http://194.87.139.42:8080/undangan_pernikahan_digital.apk",
    badge: "Malware APK",
    badgeType: "danger"
  },
  {
    name: "Akun Google Palsu",
    url: "https://acc0unts-g00gle.com/signin/v2",
    badge: "Typosquatting",
    badgeType: "warning"
  },
  {
    name: "PayPal Punycode",
    url: "https://xn--pypal-4ve.com/security/verify",
    badge: "Punycode",
    badgeType: "warning"
  },
  {
    name: "DANA Kaget Scam",
    url: "http://dana-kaget-claim-saldo.top/login",
    badge: "Social Eng",
    badgeType: "warning"
  },
  {
    name: "Situs Resmi BCA",
    url: "https://www.klikbca.com/default.html",
    badge: "Resmi",
    badgeType: "safe"
  },
  {
    name: "Situs Resmi Google",
    url: "https://accounts.google.com/ServiceLogin",
    badge: "Resmi",
    badgeType: "safe"
  }
]

export default function LinkInspectorPage() {
  const [inputUrl, setInputUrl] = useState("https://klikbca.com.auth-secure-login.xyz/ib/login.jsp")
  const [copied, setCopied] = useState(false)

  const analysis: AnalysisResult | null = useMemo(() => {
    const raw = inputUrl.trim()
    if (!raw) return null

    let parsed: URL | null = null
    try {
      const withProto = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`
      parsed = new URL(withProto)
    } catch {
      return null
    }

    const protocol = parsed.protocol.replace(":", "").toLowerCase()
    const isHttps = protocol === "https"
    const hostname = parsed.hostname.toLowerCase()
    const port = parsed.port || (isHttps ? "443" : "80")
    const pathname = parsed.pathname

    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
    let subdomain = ""
    let apexDomain = ""
    let tld = ""

    if (isIpAddress) {
      apexDomain = hostname
      tld = "(Direct IP)"
    } else {
      const parts = hostname.split(".")
      if (parts.length >= 2) {
        const secondLast = parts[parts.length - 2]
        const isTwoPartTld = ["co", "go", "ac", "or", "sch", "net", "com", "mil"].includes(secondLast) && parts.length >= 3
        if (isTwoPartTld) {
          tld = parts.slice(-2).join(".")
          apexDomain = parts.slice(-3).join(".")
          subdomain = parts.slice(0, -3).join(".")
        } else {
          tld = parts[parts.length - 1]
          apexDomain = parts.slice(-2).join(".")
          subdomain = parts.slice(0, -2).join(".")
        }
      } else {
        apexDomain = hostname
      }
    }

    const pathSegments = pathname.split("/").filter(Boolean)
    const lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : ""
    const fileExtMatch = lastSegment.match(/\.([a-zA-Z0-9]+)$/)
    const fileExtension = fileExtMatch ? fileExtMatch[1].toLowerCase() : null
    const isDangerousExtension = fileExtension ? DANGEROUS_EXTENSIONS.includes(fileExtension) : false

    const redFlags: RedFlagItem[] = []
    let riskScore = 0

    // 1. Protocol
    if (!isHttps) {
      riskScore += 25
      redFlags.push({
        id: "proto-http",
        title: "Protokol Tidak Terenkripsi (HTTP)",
        description: "Koneksi tidak disandikan. Kredensial atau data yang dikirim dapat disadap pada jaringan lokal.",
        severity: "HIGH"
      })
    }

    // 2. Direct IP
    if (isIpAddress) {
      riskScore += 45
      redFlags.push({
        id: "ip-host",
        title: "Menggunakan Alamat IP Mentah",
        description: "Website dijalankan langsung di IP publik tanpa domain resmi perusahaan.",
        severity: "CRITICAL"
      })
    }

    // 3. Dangerous File (.APK / .EXE)
    if (isDangerousExtension && fileExtension) {
      riskScore += 50
      redFlags.push({
        id: "payload-apk",
        title: `Unduhan File Berbahaya (.${fileExtension.toUpperCase()})`,
        description: `Tautan mengarah langsung ke pengunduhan file .${fileExtension.toUpperCase()} yang sering disusupi malware pencuri OTP.`,
        severity: "CRITICAL"
      })
    }

    // 4. Subdomain Spoofing
    for (const b of TARGETED_BRANDS) {
      const matchInSub = b.keywords.some((k) => subdomain.toLowerCase().includes(k))
      const isLegit = apexDomain.toLowerCase() === b.legitDomain.toLowerCase()
      if (matchInSub && !isLegit) {
        riskScore += 50
        redFlags.push({
          id: "sub-spoof",
          title: `Penyamaran Merek: ${b.name}`,
          description: `Nama merek ditempatkan di subdomain untuk mengelabui mata, padahal domain pemilik sebenarnya adalah ${apexDomain}.`,
          severity: "CRITICAL"
        })
        break
      }
    }

    // 5. Typosquatting
    if (/g00gle|paypa1|micros0ft|app1e|dana-kaget|bri-mo/i.test(hostname)) {
      riskScore += 35
      redFlags.push({
        id: "typo-spoof",
        title: "Ejaan Tiruan (Typosquatting)",
        description: "Domain sengaja menggunakan huruf/angka mirip (misal angka 0 menggantikan huruf o).",
        severity: "HIGH"
      })
    }

    // 6. Punycode
    if (hostname.includes("xn--")) {
      riskScore += 45
      redFlags.push({
        id: "punycode",
        title: "Manipulasi Karakter (Punycode Attack)",
        description: "Menggunakan karakter alfabet non-Latin yang tampak identik dengan huruf asli.",
        severity: "CRITICAL"
      })
    }

    // 7. Risky TLD
    const cleanTld = tld.toLowerCase().replace(/^\./, "")
    if (HIGH_RISK_TLDS.includes(cleanTld)) {
      riskScore += 20
      redFlags.push({
        id: "tld-risk",
        title: `Domain Menggunakan TLD .${cleanTld}`,
        description: `Ekstensi .${cleanTld} bertarif murah dan tercatat sering dipakai sindikat penipuan masal.`,
        severity: "MEDIUM"
      })
    }

    // 8. Shortener
    if (URL_SHORTENERS.includes(hostname)) {
      riskScore += 20
      redFlags.push({
        id: "shortener",
        title: "Layanan Pemendek URL (Shortlink)",
        description: "Tautan disembunyikan di balik shortlink sehingga alamat asli tidak terlihat langsung.",
        severity: "MEDIUM"
      })
    }

    // Known legit check
    const isLegitBrand = TARGETED_BRANDS.some((b) => apexDomain.toLowerCase() === b.legitDomain.toLowerCase() && isHttps && !isDangerousExtension)
    if (isLegitBrand && riskScore < 30) {
      riskScore = 0
    }

    const finalScore = Math.min(100, Math.max(0, riskScore))

    let threatLevel: "SAFE" | "SUSPICIOUS" | "CRITICAL" = "SAFE"
    let verdictTitle = "Tautan Relatif Aman"
    let verdictDesc = "Tautan ini menggunakan domain terverifikasi dan tidak memiliki pola ancaman siber yang mencurigakan."
    let recommendation = "Aman untuk dibuka, namun tetap pastikan Anda tidak membagikan informasi rahasia ke sembarang pihak."

    if (finalScore >= 60) {
      threatLevel = "CRITICAL"
      verdictTitle = "Bahaya Kritis (Phishing / Malware)"
      verdictDesc = "Tautan ini memiliki indikasi kuat penipuan, penyamaran merek resmi, atau penyebaran malware pencuri data."
      recommendation = "Jangan pernah membuka tautan ini, mengunduh file, atau memasukkan nomor rekening/password."
    } else if (finalScore >= 25) {
      threatLevel = "SUSPICIOUS"
      verdictTitle = "Mencurigakan / Perlu Verifikasi"
      verdictDesc = "Ditemukan parameter atau struktur tautan yang tidak lazim. Disarankan untuk berhati-hati sebelum membuka."
      recommendation = "Buka situs langsung lewat pencarian resmi di browser, jangan mengklik dari pesan pribadi."
    }

    return {
      isValid: true,
      rawUrl: raw,
      protocol,
      isHttps,
      hostname,
      port,
      subdomain,
      apexDomain,
      tld,
      pathname,
      fileExtension,
      isDangerousExtension,
      isIpAddress,
      riskScore: finalScore,
      threatLevel,
      verdictTitle,
      verdictDesc,
      recommendation,
      redFlags
    }
  }, [inputUrl])

  const copyUrlInfo = () => {
    if (!analysis) return
    const text = `Audit Link: ${analysis.rawUrl}\nDomain Asli: ${analysis.apexDomain}\nStatus: ${analysis.verdictTitle} (${analysis.riskScore}% Risiko)`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full pb-16 pt-2">
        {/* Header Polos & Konsisten */}
        <div className="border-b border-border/50 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Link2 className="w-7 h-7 text-cyan-400" /> Link Inspector
          </h1>
        </div>

        {/* Search & Input Box */}
        <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Ketik atau tempel URL yang ingin dianalisis (contoh: https://klikbca.com.auth-secure.xyz)..."
                className="pl-10 font-mono text-xs sm:text-sm bg-[#090d16] border-slate-800 focus-visible:ring-cyan-500 h-11 text-slate-100 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputUrl("")}
                className="h-11 px-4 border-slate-800 text-slate-400 hover:text-slate-100 rounded-xl text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </Button>
              {analysis && (
                <Button
                  size="sm"
                  onClick={copyUrlInfo}
                  className="h-11 px-4 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copied ? "Tersalin" : "Salin"}
                </Button>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Contoh Cepat:</span>
            {PRESET_SCENARIOS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setInputUrl(item.url)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  inputUrl === item.url
                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-medium"
                    : "bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <span>{item.name}</span>
                <span
                  className={`text-[9px] px-1 py-0.5 rounded font-mono ${
                    item.badgeType === "danger"
                      ? "bg-red-500/20 text-red-400"
                      : item.badgeType === "warning"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        {analysis ? (
          <div className="space-y-6">
            {/* 1. Concise Verdict Card */}
            <div
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                analysis.threatLevel === "CRITICAL"
                  ? "bg-red-950/20 border-red-900/50"
                  : analysis.threatLevel === "SUSPICIOUS"
                  ? "bg-amber-950/20 border-amber-900/50"
                  : "bg-emerald-950/20 border-emerald-900/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      analysis.threatLevel === "CRITICAL"
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : analysis.threatLevel === "SUSPICIOUS"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {analysis.threatLevel === "CRITICAL" ? (
                      <ShieldX className="w-5 h-5" />
                    ) : analysis.threatLevel === "SUSPICIOUS" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-lg font-bold ${
                          analysis.threatLevel === "CRITICAL"
                            ? "text-red-400"
                            : analysis.threatLevel === "SUSPICIOUS"
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {analysis.verdictTitle}
                      </h2>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                          analysis.threatLevel === "CRITICAL"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : analysis.threatLevel === "SUSPICIOUS"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        Skor Risiko: {analysis.riskScore}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {analysis.verdictDesc}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 shrink-0">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                    Saran Tindakan
                  </span>
                  <span className="text-xs font-semibold text-slate-100 block mt-0.5 max-w-xs">
                    {analysis.recommendation}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Side-by-Side: Anatomi vs Temuan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolom Kiri: Pembedahan URL (5 cols) */}
              <div className="lg:col-span-5 bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-cyan-400" /> Anatomi Tautan
                  </h3>
                  <span className="text-[11px] text-slate-400">Komponen Domain</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Domain Utama */}
                  <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Domain Pemilik Sebenarnya:</span>
                      <span className="text-cyan-400 font-semibold font-mono">Apex Domain</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-cyan-300 block truncate">
                      {analysis.apexDomain}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Hanya nama ini yang memiliki server website. Huruf di sebelah kiri hanyalah subdomain.
                    </p>
                  </div>

                  {/* Subdomain */}
                  {analysis.subdomain && (
                    <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Subdomain:</span>
                        <span className="text-amber-400 font-medium">Kamuflase</span>
                      </div>
                      <span className="font-mono text-amber-300 font-semibold block truncate">
                        {analysis.subdomain}
                      </span>
                    </div>
                  )}

                  {/* Info List */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Protokol</span>
                      <span className={`font-mono font-semibold text-xs flex items-center gap-1 ${analysis.isHttps ? "text-emerald-400" : "text-red-400"}`}>
                        {analysis.isHttps ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {analysis.protocol.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Ekstensi File</span>
                      <span className={`font-mono font-semibold text-xs ${analysis.isDangerousExtension ? "text-red-400 font-bold" : "text-slate-300"}`}>
                        {analysis.fileExtension ? `.${analysis.fileExtension}` : "Halaman Web"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Temuan Keamanan (7 cols) */}
              <div className="lg:col-span-7 bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" /> Hasil Evaluasi Keamanan
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {analysis.redFlags.length} Indikator Terdeteksi
                  </span>
                </div>

                <div className="space-y-2.5">
                  {analysis.redFlags.length > 0 ? (
                    analysis.redFlags.map((flag) => (
                      <div
                        key={flag.id}
                        className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-start gap-3 text-xs"
                      >
                        <div className="mt-0.5 shrink-0">
                          {flag.severity === "CRITICAL" ? (
                            <XCircle className="w-4 h-4 text-red-400" />
                          ) : flag.severity === "HIGH" ? (
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-200">{flag.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold ${
                                flag.severity === "CRITICAL"
                                  ? "bg-red-500/20 text-red-400"
                                  : flag.severity === "HIGH"
                                  ? "bg-rose-500/20 text-rose-400"
                                  : "bg-amber-500/20 text-amber-400"
                              }`}
                            >
                              {flag.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {flag.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <span className="font-semibold text-slate-200 block">Tidak Ditemukan Indikasi Bahaya</span>
                      <p className="text-[11px]">Domain terdaftar resmi dan memiliki sertifikat keamanan valid.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Edukasi Ringkas (2 Kartu Bersih) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0f172a]/50 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" /> Cara Membaca Domain yang Benar
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Abaikan kata di depan seperti `https://` atau `klikbca`. Cari tanda garis miring (`/`) pertama setelah nama domain, lalu baca mundur ke kiri sampai menemukan titik pertama. Itulah pemilik asli website.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0f172a]/50 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" /> Mitos Logo Gembok (HTTPS)
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Logo gembok di browser hanya menjamin data Anda dienkripsi saat dikirimkan, bukan jaminan bahwa pemilik website adalah instansi resmi yang jujur.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
            <Link2 className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="font-semibold text-slate-300 text-sm">Masukkan URL di atas untuk memulai analisis</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Anda juga bisa mengklik salah satu contoh skenario serangan di atas untuk menguji detektor.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
