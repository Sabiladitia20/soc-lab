"use client"

import { useState, useMemo } from "react"
import {
  Link2,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Copy,
  Check,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Info,
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
    name: "Phishing BCA",
    url: "https://klikbca.com.auth-secure-login.xyz/ib/login.jsp",
    badge: "Subdomain Spoof",
    badgeType: "danger"
  },
  {
    name: "Malware APK",
    url: "http://194.87.139.42:8080/undangan_pernikahan_digital.apk",
    badge: "Direct IP",
    badgeType: "danger"
  },
  {
    name: "Typosquatting",
    url: "https://acc0unts-g00gle.com/signin/v2",
    badge: "Ejaan Tiruan",
    badgeType: "warning"
  },
  {
    name: "Punycode",
    url: "https://xn--pypal-4ve.com/security/verify",
    badge: "Manipulasi Karakter",
    badgeType: "warning"
  },
  {
    name: "DANA Kaget",
    url: "http://dana-kaget-claim-saldo.top/login",
    badge: "Scam Social Eng",
    badgeType: "warning"
  },
  {
    name: "Resmi BCA",
    url: "https://www.klikbca.com/default.html",
    badge: "Domain Sah",
    badgeType: "safe"
  },
  {
    name: "Resmi Google",
    url: "https://accounts.google.com/ServiceLogin",
    badge: "Domain Sah",
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
      <div className="flex flex-col gap-6 pb-12 w-full">
        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Link Inspector</h1>
          </div>
          
        </div>

        {/* 1. URL INPUT BAR */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1.5 shadow-sm focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
            <div className="pl-3 text-muted-foreground shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <Input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Tempel tautan yang ingin diperiksa (contoh: https://klikbca.com.auth-secure.xyz)..."
              className="border-0 shadow-none focus-visible:ring-0 text-sm font-mono bg-transparent h-10 px-2 text-foreground placeholder:text-muted-foreground/60"
            />
            <div className="flex items-center gap-1 shrink-0 pr-1">
              {inputUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputUrl("")}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              )}
              {analysis && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyUrlInfo}
                  className="h-8 px-2.5 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Tersalin" : "Salin"}
                </Button>
              )}
            </div>
          </div>

          {/* Compact Horizontal Preset Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1">
            <span className="text-[11px] font-medium text-muted-foreground/80">Contoh cepat:</span>
            {PRESET_SCENARIOS.map((item, idx) => {
              const isSelected = inputUrl === item.url
              return (
                <button
                  key={idx}
                  onClick={() => setInputUrl(item.url)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors ${
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-medium"
                      : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border"
                  }`}
                >
                  <span>{item.name}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      item.badgeType === "danger"
                        ? "text-red-400 bg-red-500/10"
                        : item.badgeType === "warning"
                        ? "text-amber-400 bg-amber-500/10"
                        : "text-emerald-400 bg-emerald-500/10"
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. RESULTS AREA */}
        {analysis ? (
          <div className="space-y-8 pt-2">
            {/* ─── 2. SECURITY VERDICT (Prominent Single Alert Container) ─── */}
            <div
              className={`rounded-2xl p-6 border transition-all ${
                analysis.threatLevel === "CRITICAL"
                  ? "bg-red-950/20 border-red-500/30"
                  : analysis.threatLevel === "SUSPICIOUS"
                  ? "bg-amber-950/20 border-amber-500/30"
                  : "bg-emerald-950/20 border-emerald-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {analysis.threatLevel === "CRITICAL" ? (
                      <XCircle className="w-6 h-6 text-red-400" />
                    ) : analysis.threatLevel === "SUSPICIOUS" ? (
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-xs uppercase tracking-wider font-bold ${
                          analysis.threatLevel === "CRITICAL"
                            ? "text-red-400"
                            : analysis.threatLevel === "SUSPICIOUS"
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {analysis.threatLevel === "CRITICAL"
                          ? "BAHAYA KRITIS"
                          : analysis.threatLevel === "SUSPICIOUS"
                          ? "MENCURIGAKAN"
                          : "AMAN"}
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-xs font-mono font-medium text-muted-foreground">
                        Risk Score: {analysis.riskScore}%
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      {analysis.verdictTitle}
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed pt-0.5 max-w-2xl">
                      {analysis.verdictDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Integrated Action Recommendation (Visually Secondary) */}
              <div className="mt-4 pt-3.5 border-t border-border/40 flex items-start gap-2 text-xs">
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    analysis.threatLevel === "CRITICAL"
                      ? "text-red-400"
                      : analysis.threatLevel === "SUSPICIOUS"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                />
                <p className="text-slate-300 leading-relaxed">
                  <span className="font-semibold text-foreground mr-1.5">Rekomendasi Tindakan:</span>
                  {analysis.recommendation}
                </p>
              </div>
            </div>

            {/* ─── 3. WHY IT IS DANGEROUS / REASONS ─── */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {analysis.threatLevel === "SAFE" ? "Evaluasi Keamanan" : "Mengapa tautan ini berbahaya?"}
              </h3>
              <div className="bg-card/50 border border-border/60 rounded-xl p-4">
                <ul className="space-y-2 text-sm text-slate-300">
                  {analysis.redFlags.length > 0 ? (
                    analysis.redFlags.map((flag) => (
                      <li key={flag.id} className="flex items-start gap-2.5">
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                            flag.severity === "CRITICAL"
                              ? "bg-red-400"
                              : flag.severity === "HIGH"
                              ? "bg-rose-400"
                              : "bg-amber-400"
                          }`}
                        />
                        <span className="leading-relaxed">
                          <strong className="text-foreground font-medium mr-1.5">{flag.title}:</strong>
                          {flag.description}
                        </span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="leading-relaxed">Domain terdaftar resmi dan tidak ditemukan pola penyamaran nama merek.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="leading-relaxed">Menggunakan protokol HTTPS terenkripsi untuk keamanan data transfer.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="leading-relaxed">Tidak ditemukan file unduhan mencurigakan (.apk, .exe, .scr).</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* ─── 4. URL ANATOMY & 5. SECURITY INDICATORS (Side by Side on Large Screens) ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ─── 4. URL ANATOMY ─── */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  Anatomi Tautan
                </h3>

                <div className="bg-card/50 border border-border/60 rounded-xl p-4 space-y-3.5 text-xs">
                  {/* Domain Sebenarnya (Apex Domain) - Highlighted */}
                  <div className="space-y-1 pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-[11px] font-medium uppercase tracking-wider">Domain Sebenarnya (Apex)</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Server Pemilik</span>
                    </div>
                    <div className="font-mono text-sm font-semibold text-cyan-300 break-all bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg">
                      {analysis.apexDomain}
                    </div>
                    <p className="text-[11px] text-muted-foreground pt-0.5 leading-normal">
                      Hanya domain ini yang mengontrol website. Bagian sebelum titik ini hanyalah subdomain.
                    </p>
                  </div>

                  {/* Subdomain */}
                  {analysis.subdomain && (
                    <div className="space-y-1 pb-3 border-b border-border/40">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-[11px] font-medium uppercase tracking-wider">Subdomain</span>
                        <span className="text-[10px] text-amber-400 font-medium">Potensi Kamuflase</span>
                      </div>
                      <div className="font-mono text-xs text-amber-300 break-all bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                        {analysis.subdomain}
                      </div>
                    </div>
                  )}

                  {/* Path & Protocol */}
                  <div className="grid grid-cols-2 gap-3 pt-0.5">
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                        Protokol
                      </span>
                      <span className={`font-mono text-xs flex items-center gap-1.5 ${analysis.isHttps ? "text-emerald-400" : "text-red-400"}`}>
                        {analysis.isHttps ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        {analysis.protocol.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                        Ekstensi File
                      </span>
                      <span className={`font-mono text-xs ${analysis.isDangerousExtension ? "text-red-400 font-bold" : "text-slate-300"}`}>
                        {analysis.fileExtension ? `.${analysis.fileExtension}` : "Halaman Web"}
                      </span>
                    </div>
                  </div>

                  {/* Full Pathname */}
                  {analysis.pathname && analysis.pathname !== "/" && (
                    <div className="space-y-1 pt-2 border-t border-border/40">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                        Path Direktori
                      </span>
                      <span className="font-mono text-xs text-slate-300 break-all block">
                        {analysis.pathname}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── 5. SECURITY INDICATORS ─── */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Indikator Keamanan
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    {analysis.redFlags.length} temuan
                  </span>
                </div>

                <div className="bg-card/50 border border-border/60 rounded-xl p-4">
                  {analysis.redFlags.length > 0 ? (
                    <div className="space-y-3.5 divide-y divide-border/40">
                      {analysis.redFlags.map((flag, idx) => (
                        <div key={flag.id} className={`flex items-start gap-3 ${idx > 0 ? "pt-3" : ""}`}>
                          <div className="mt-0.5 shrink-0">
                            {flag.severity === "CRITICAL" ? (
                              <XCircle className="w-4 h-4 text-red-400" />
                            ) : flag.severity === "HIGH" ? (
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <div className="flex-1 space-y-0.5 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground truncate">
                                {flag.title}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold shrink-0 ${
                                  flag.severity === "CRITICAL"
                                    ? "bg-red-500/15 text-red-400"
                                    : flag.severity === "HIGH"
                                    ? "bg-rose-500/15 text-rose-400"
                                    : "bg-amber-500/15 text-amber-400"
                                }`}
                              >
                                {flag.severity}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {flag.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-muted-foreground space-y-1.5">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                      <p className="font-medium text-foreground">Tidak Ada Indikasi Ancaman</p>
                      <p className="text-[11px] text-muted-foreground">Domain lulus semua aturan deteksi kami.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── 6. EDUCATIONAL TIPS (Calm, Minimal Presentation) ─── */}
            <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  Cara Membaca Domain yang Benar
                </span>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Abaikan kata di awal seperti `https://` atau `klikbca`. Cari tanda garis miring (`/`) pertama setelah nama domain, lalu baca mundur ke kiri hingga titik pertama. Itulah pemilik asli website.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Mitos Logo Gembok (HTTPS)
                </span>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Logo gembok di browser hanya menjamin data Anda dienkripsi saat dikirimkan, bukan jaminan bahwa pemilik website adalah instansi resmi atau terpercaya.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-border/60 rounded-2xl p-12 text-center space-y-2 bg-card/30">
            <Link2 className="w-8 h-8 text-muted-foreground/60 mx-auto" />
            <h3 className="font-semibold text-foreground text-sm">Masukkan URL untuk memulai analisis</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Ketik atau klik salah satu contoh skenario serangan di atas untuk menguji detektor.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
