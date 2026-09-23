"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Award,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Sparkles,
  Zap,
  Sliders,
  Play,
  Layers,
  Shield,
  Target,
  Lock,
  Flame,
  Check,
  Timer,
  BarChart3,
  Settings2,
  ArrowLeft
} from "lucide-react"
import { securityQuizQuestions, QuizQuestion } from "@/lib/quiz-data"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"

type CategoryFilter = "All" | "AI Security" | "Phishing" | "SOC & DFIR" | "Authentication"
type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard"
type TimeOption = 180 | 300 | 600 | 0 // in seconds, 0 = untimed

export default function QuizPage() {
  // State: Lobby or Active Quiz or Completed
  const [quizState, setQuizState] = useState<"lobby" | "active" | "completed">("lobby")

  // Quiz Configuration Options
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>("All")
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(5)
  const [timeLimit, setTimeLimit] = useState<TimeOption>(300) // default 5 mins

  // Active Quiz State
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [secondsLeft, setSecondsLeft] = useState<number>(300)
  const [timerActive, setTimerActive] = useState(false)
  const [timeSpent, setTimeSpent] = useState<number>(0)

  // Filter pool of questions based on lobby settings
  const filteredPool = useMemo(() => {
    return securityQuizQuestions.filter((q) => {
      const matchCat = selectedCategory === "All" || q.category === selectedCategory
      const matchDiff = selectedDifficulty === "All" || q.difficulty === selectedDifficulty
      return matchCat && matchDiff
    })
  }, [selectedCategory, selectedDifficulty])

  // Count available by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: securityQuizQuestions.length,
      "AI Security": 0,
      Phishing: 0,
      "SOC & DFIR": 0,
      Authentication: 0
    }
    securityQuizQuestions.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1
    })
    return counts
  }, [])

  // Start the Quiz with selected configuration
  const handleStartQuiz = () => {
    if (filteredPool.length === 0) return

    // Shuffle filtered pool and take desired question count
    const shuffled = [...filteredPool].sort(() => 0.5 - Math.random())
    const countToTake = targetQuestionCount > shuffled.length ? shuffled.length : targetQuestionCount
    const selectedSet = shuffled.slice(0, countToTake)

    setActiveQuestions(selectedSet)
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswerSubmitted(false)
    setUserAnswers([])
    setSecondsLeft(timeLimit)
    setTimeSpent(0)
    setTimerActive(timeLimit > 0)
    setQuizState("active")
  }

  // Timer countdown
  useEffect(() => {
    if (quizState !== "active") return

    let timer: NodeJS.Timeout | null = null

    if (timerActive && timeLimit > 0) {
      timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1)
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer!)
            setTimerActive(false)
            setQuizState("completed")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timeLimit === 0) {
      // Untimed mode: just track time spent
      timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [quizState, timerActive, timeLimit])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  const currentQuestion: QuizQuestion | undefined = activeQuestions[currentIndex]

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return
    setSelectedOption(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return
    setIsAnswerSubmitted(true)
    setUserAnswers((prev) => [...prev, selectedOption])
  }

  const handleNextQuestion = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswerSubmitted(false)
    } else {
      setQuizState("completed")
      setTimerActive(false)
    }
  }

  const handleBackToLobby = () => {
    setQuizState("lobby")
    setTimerActive(false)
  }

  const handleRestartSameConfig = () => {
    handleStartQuiz()
  }

  // Calculate score
  const score = userAnswers.reduce((acc, ans, idx) => {
    return activeQuestions[idx] && ans === activeQuestions[idx].answerIndex ? acc + 1 : acc
  }, 0)
  const scorePercentage = activeQuestions.length > 0 ? Math.round((score / activeQuestions.length) * 100) : 0

  // Category visual metadata
  const categoriesList: { id: CategoryFilter; name: string; desc: string; icon: any; color: string }[] = [
    {
      id: "All",
      name: "Semua Kategori",
      desc: "Kombinasi materi AI, Phishing, SOC, dan Autentikasi",
      icon: Layers,
      color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30"
    },
    {
      id: "AI Security",
      name: "AI Security",
      desc: "Prompt Injection, Jailbreak, Deepfake, dan OWASP LLM",
      icon: Sparkles,
      color: "from-purple-500/20 to-pink-500/20 text-pink-400 border-pink-500/30"
    },
    {
      id: "Phishing",
      name: "Phishing & Social Eng",
      desc: "Spear-phishing, Quishing, Reverse-Proxy, DMARC",
      icon: Target,
      color: "from-rose-500/20 to-amber-500/20 text-amber-400 border-amber-500/30"
    },
    {
      id: "SOC & DFIR",
      name: "SOC & Incident Response",
      desc: "Alert triage, NIST containment, forensik, MITRE ATT&CK",
      icon: Shield,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30"
    },
    {
      id: "Authentication",
      name: "Authentication & Identity",
      desc: "FIDO2, MFA Fatigue, Password Salting, OAuth/OIDC",
      icon: Lock,
      color: "from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30"
    }
  ]

  const difficultyList: { id: DifficultyFilter; name: string; desc: string; badgeColor: string }[] = [
    { id: "All", name: "Semua Tingkat", desc: "Campuran soal mudah hingga lanjutan", badgeColor: "text-slate-300 border-slate-700 bg-slate-800/40" },
    { id: "Easy", name: "Easy (Pemula)", desc: "Konsep dasar dan pengenalan ancaman umum", badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    { id: "Medium", name: "Medium (Menengah)", desc: "Analisis skenario kasus dan teknik investigasi", badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    { id: "Hard", name: "Hard (Lanjutan/Expert)", desc: "Mekanisme teknis mendalam dan mitigasi arsitektur", badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10" }
  ]

  const timeOptionsList: { id: TimeOption; label: string; desc: string }[] = [
    { id: 180, label: "3 Menit", desc: "Mode Kilat / Speedrun" },
    { id: 300, label: "5 Menit", desc: "Durasi Standar Evaluasi" },
    { id: 600, label: "10 Menit", desc: "Mode Santai & Analisis" },
    { id: 0, label: "Tanpa Batas Waktu", desc: "Practice Mode / Latihan Bebas" }
  ]

  return (
    <MainLayout>
      <div className="flex-1 max-w-6xl mx-auto w-full pb-16 space-y-6 pt-2">
        {/* Header Polos & Konsisten */}
        <div className="border-b border-border/50 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <HelpCircle className="w-7 h-7 text-cyan-400" /> Quiz Arena & Assessment
          </h1>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total <strong>{securityQuizQuestions.length}</strong> Bank Soal Siap</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: LOBBY & CUSTOMIZATION SCREEN                          */}
        {/* ============================================================== */}
        {quizState === "lobby" && (
          <div className="space-y-6">

            {/* SECTION 1: PILIHAN TOPIK / KATEGORI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  1. Pilih Topik / Kategori Soal
                </label>
                <span className="text-xs text-slate-400">
                  Terpilih: <strong className="text-cyan-400">{selectedCategory}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategory === cat.id
                  const Icon = cat.icon
                  const count = categoryCounts[cat.id] || 0

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#182333] border-cyan-500 ring-1 ring-cyan-500 shadow-md shadow-cyan-950/30"
                          : "bg-[#121a26] border-[#1f2b3e] hover:border-slate-600 hover:bg-[#152030]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cat.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {count} Soal
                        </span>
                      </div>

                      <div>
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          {cat.name}
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SECTION 2: TINGKAT KESULITAN / LEVEL */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  2. Pilih Tingkat Kesulitan (Level)
                </label>
                <span className="text-xs text-slate-400">
                  Terpilih: <strong className="text-amber-400">{selectedDifficulty}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {difficultyList.map((diff) => {
                  const isSelected = selectedDifficulty === diff.id

                  return (
                    <button
                      key={diff.id}
                      onClick={() => setSelectedDifficulty(diff.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? "bg-[#182333] border-amber-500 ring-1 ring-amber-500 shadow-md"
                          : "bg-[#121a26] border-[#1f2b3e] hover:border-slate-600 hover:bg-[#152030]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${diff.badgeColor}`}>
                          {diff.name.split(" ")[0]}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="font-semibold text-xs text-slate-200">
                        {diff.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {diff.desc}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SECTION 3 & 4: JUMLAH SOAL & WAKTU (2-Columns Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Jumlah Soal */}
              <div className="bg-[#121a26] border border-[#1f2b3e] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    3. Jumlah Pertanyaan
                  </label>
                  <span className="text-xs text-slate-400">
                    Maksimal: <strong className="text-emerald-400">{filteredPool.length} Soal</strong>
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[5, 10, 15, filteredPool.length].map((count, idx) => {
                    const label = idx === 3 ? "Semua" : `${count}`
                    const isSelected = targetQuestionCount === count || (idx === 3 && targetQuestionCount >= filteredPool.length)
                    const isDisabled = count > filteredPool.length && idx !== 3

                    return (
                      <button
                        key={idx}
                        disabled={isDisabled}
                        onClick={() => setTargetQuestionCount(count)}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                          isDisabled
                            ? "opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600"
                            : isSelected
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-500"
                            : "bg-[#182333] border-[#223044] text-slate-300 hover:bg-[#1e2c40]"
                        }`}
                      >
                        <div className="text-sm font-bold">{label}</div>
                        <div className="text-[9px] text-slate-400">Soal</div>
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Soal akan diacak (*shuffled*) otomatis dari bank soal yang sesuai dengan kriteria kategori dan tingkat kesulitan.
                </p>
              </div>

              {/* Keterangan & Pilihan Waktu */}
              <div className="bg-[#121a26] border border-[#1f2b3e] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    4. Batas Waktu Pengerjaan
                  </label>
                  <span className="text-xs text-cyan-400 font-mono font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {timeLimit === 0 ? "Untimed" : formatTime(timeLimit)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {timeOptionsList.map((t) => {
                    const isSelected = timeLimit === t.id

                    return (
                      <button
                        key={t.id}
                        onClick={() => setTimeLimit(t.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-200 font-bold ring-1 ring-cyan-500"
                            : "bg-[#182333] border-[#223044] text-slate-300 hover:bg-[#1e2c40]"
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>{t.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                          {t.desc}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Estimasi Kecepatan:</span>
                  <span className="text-slate-200 font-mono">
                    {timeLimit === 0
                      ? "Tanpa Batas Waktu"
                      : `~${Math.round(timeLimit / Math.min(targetQuestionCount, filteredPool.length || 1))} detik/soal`}
                  </span>
                </div>
              </div>
            </div>

            {/* CONFIGURATION SUMMARY & LAUNCH CARD */}
            <div className="bg-[#101724] border border-cyan-500/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Ringkasan Sesi Kuis Anda
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-[#182333] text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg font-medium">
                    Topik: {selectedCategory}
                  </span>
                  <span className="bg-[#182333] text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-medium">
                    Level: {selectedDifficulty}
                  </span>
                  <span className="bg-[#182333] text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-medium">
                    {Math.min(targetQuestionCount, filteredPool.length)} Soal
                  </span>
                  <span className="bg-[#182333] text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg font-medium">
                    {timeLimit === 0 ? "Tanpa Batas Waktu" : `${formatTime(timeLimit)} Menit`}
                  </span>
                </div>
                {filteredPool.length === 0 && (
                  <p className="text-xs text-rose-400 font-semibold pt-1">
                    ⚠️ Tidak ada soal yang cocok dengan kombinasi kategori & level ini. Silakan ubah filter.
                  </p>
                )}
              </div>

              <Button
                onClick={handleStartQuiz}
                disabled={filteredPool.length === 0}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl px-6 py-3 h-auto text-sm shrink-0 gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" /> Mulai Kuis Sekarang
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: ACTIVE QUIZ VIEW                                      */}
        {/* ============================================================== */}
        {quizState === "active" && currentQuestion && (
          <div className="space-y-6">
            {/* Top Navigation & Status Bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-4">
              <button
                onClick={handleBackToLobby}
                className="hover:text-foreground transition-colors flex items-center gap-1.5 text-slate-400"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Ganti Pengaturan
              </button>

              <div className="flex items-center gap-3">
                {timeLimit > 0 ? (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-xs ${
                      secondsLeft <= 60
                        ? "bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse font-bold"
                        : "bg-secondary/60 border-border text-foreground"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{formatTime(secondsLeft)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-700 bg-slate-800/60 text-slate-300 font-mono text-xs">
                    <Timer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Latihan Bebas ({formatTime(timeSpent)})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress & Category / Difficulty Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {currentQuestion.category}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                      currentQuestion.difficulty === "Easy"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : currentQuestion.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <span className="text-muted-foreground font-medium">
                  Soal {currentIndex + 1} dari {activeQuestions.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / activeQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Box */}
            <div className="bg-[#131a26] border border-[#202c3e] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              {/* Scenario Box (if available) */}
              {currentQuestion.scenario && (
                <div className="bg-[#182333] border-l-4 border-cyan-500 rounded-r-xl p-4 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-cyan-400 block mb-1 uppercase tracking-wide text-[11px]">
                    Skenario Kasus:
                  </span>
                  {currentQuestion.scenario}
                </div>
              )}

              {/* Question Statement */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                {currentQuestion.question}
              </h2>

              {/* Options Grid */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx
                  const isCorrect = idx === currentQuestion.answerIndex
                  const isWrongSelected = isAnswerSubmitted && isSelected && !isCorrect

                  let optionStyle = "bg-[#16202f] border-[#223044] hover:bg-[#1a273a] hover:border-slate-600 text-slate-200"

                  if (isSelected && !isAnswerSubmitted) {
                    optionStyle = "bg-primary/10 border-primary text-slate-100 ring-1 ring-primary shadow-sm"
                  } else if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 ring-1 ring-emerald-500"
                    } else if (isWrongSelected) {
                      optionStyle = "bg-rose-950/40 border-rose-500/60 text-rose-200 ring-1 ring-rose-500"
                    } else {
                      optionStyle = "bg-[#16202f]/50 border-[#1e2a3c] text-slate-500 opacity-60"
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 group cursor-pointer disabled:cursor-default ${optionStyle}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border ${
                          isSelected && !isAnswerSubmitted
                            ? "bg-primary text-primary-foreground border-primary"
                            : isAnswerSubmitted && isCorrect
                            ? "bg-emerald-500 text-black border-emerald-400"
                            : isAnswerSubmitted && isWrongSelected
                            ? "bg-rose-500 text-white border-rose-400"
                            : "bg-[#1c2738] border-[#2d3e58] text-slate-400 group-hover:text-slate-200"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>

                      <span className="text-sm font-medium leading-relaxed flex-1">
                        {option}
                      </span>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 self-center" />
                      )}
                      {isAnswerSubmitted && isWrongSelected && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 self-center" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Immediate Feedback Explanation Box */}
              {isAnswerSubmitted && (
                <div
                  className={`p-5 rounded-xl border space-y-2.5 animate-in fade-in-50 duration-300 ${
                    selectedOption === currentQuestion.answerIndex
                      ? "bg-emerald-950/25 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/25 border-rose-500/40 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {selectedOption === currentQuestion.answerIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Jawaban Tepat!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400">Kurang Tepat</span>
                      </>
                    )}

                    {currentQuestion.mitreRef && (
                      <span className="ml-auto text-[11px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded border border-border">
                        {currentQuestion.mitreRef}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1e2a3c]">
                <div className="text-xs text-slate-400">
                  Pilih salah satu jawaban di atas, lalu klik <strong>Submit</strong>.
                </div>

                {!isAnswerSubmitted ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl px-6"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl px-6 flex items-center gap-1.5"
                  >
                    <span>{currentIndex + 1 === activeQuestions.length ? "Lihat Hasil" : "Soal Berikutnya"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: QUIZ RESULTS SCORE CARD                               */}
        {/* ============================================================== */}
        {quizState === "completed" && (
          <div className="bg-[#131a26] border border-[#202c3e] rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
              {scorePercentage >= 70 ? (
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-amber-400" />
              )}
            </div>

            <div className="space-y-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  scorePercentage >= 70
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {scorePercentage >= 70 ? "Passed: Security Champion" : "Review Recommended"}
              </span>

              <h2 className="text-3xl font-bold text-slate-100">
                Skor Akhir: {scorePercentage}%
              </h2>

              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Kamu menjawab benar <strong>{score}</strong> dari <strong>{activeQuestions.length}</strong> pertanyaan simulasi keamanan siber.
              </p>
            </div>

            {/* Breakdown Summary */}
            <div className="bg-[#182333] rounded-xl p-5 border border-[#23334a] max-w-md mx-auto text-left space-y-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide border-b border-border/40 pb-2 flex items-center justify-between">
                <span>Ringkasan Sesi Kuis</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {selectedCategory} • {selectedDifficulty}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Pertanyaan:</span>
                <span className="font-bold text-slate-200">{activeQuestions.length}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Jawaban Benar:</span>
                <span className="font-bold text-emerald-400">{score}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Jawaban Salah:</span>
                <span className="font-bold text-rose-400">{activeQuestions.length - score}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Waktu yang Dihabiskan:</span>
                <span className="font-bold text-slate-200 font-mono">
                  {formatTime(timeSpent)} {timeLimit > 0 && `(dari ${formatTime(timeLimit)})`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleRestartSameConfig}
                className="w-full sm:w-auto border-[#223044] bg-[#16202f] hover:bg-[#1a273a] text-slate-300 rounded-xl px-5 gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Ulangi Kuis Ini
              </Button>
              <Button
                onClick={handleBackToLobby}
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl px-5 gap-2"
              >
                <Sliders className="w-4 h-4" /> Ubah Pengaturan Kuis
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto border-border text-slate-300 rounded-xl px-5 gap-2"
              >
                <Link href="/learn">
                  <BookOpen className="w-4 h-4" /> Modul Belajar
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
