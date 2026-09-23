import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight,
  Clock,
  Layers,
  CheckCircle2,
  PlayCircle,
  Shield,
  FileText,
  HelpCircle,
  Terminal,
  Award,
  ArrowLeft,
  Calendar,
  BadgeCheck
} from "lucide-react"
import { learningModules } from "@/lib/learning-modules"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"
import { getArticleBySlug, getAllArticles } from "../_actions/article-actions"

export default async function LearnSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // 1. Check if it's an Article (Database or Default)
  const article = await getArticleBySlug(slug)
  if (article) {
    const allArticles = await getAllArticles()
    const relatedArticles = allArticles
      .filter((a) => a.slug !== article.slug && (a.category === article.category || Math.random() > 0.5))
      .slice(0, 3)

    return (
      <MainLayout>
        <div className="flex-1 max-w-5xl mx-auto w-full pb-16 space-y-8 pt-2">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/50 pb-4">
            <Link href="/learn" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Knowledge Base
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[280px] sm:max-w-none">
              {article.title}
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Main Article Content */}
            <div className="flex-1 max-w-3xl w-full">
              {/* Header */}
              <header className="mb-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-400 border border-cyan-500/20">
                    Security Guide
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100 leading-tight">
                  {article.title}
                </h1>

                <div className="flex items-center gap-4 text-xs text-slate-400 border-b border-[#1e2a3c] pb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{article.readTime}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>
                      {new Date(article.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </header>

              {/* Article Content Markdown Renderer */}
              <article className="prose prose-invert prose-slate max-w-none text-sm text-slate-300 space-y-5 leading-relaxed">
                {article.content.split("\n\n").map((block, idx) => {
                  const trimmed = block.trim()

                  // Images: ![alt](url)
                  const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
                  if (imgMatch) {
                    const altText = imgMatch[1]
                    const imgUrl = imgMatch[2]
                    return (
                      <figure key={idx} className="my-6 space-y-2">
                        <div className="rounded-2xl overflow-hidden border border-[#1f2b3e] bg-[#0c121c] max-h-[460px] flex items-center justify-center">
                          <img
                            src={imgUrl}
                            alt={altText || "Gambar Artikel"}
                            className="w-full h-auto max-h-[460px] object-cover rounded-xl"
                            loading="lazy"
                          />
                        </div>
                        {altText && altText !== "Cover Image" && (
                          <figcaption className="text-center text-xs text-slate-500 italic">
                            {altText}
                          </figcaption>
                        )}
                      </figure>
                    )
                  }

                  // Headings
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3 key={idx} className="text-base font-bold text-slate-100 mt-6 mb-2">
                        {trimmed.replace("### ", "")}
                      </h3>
                    )
                  }
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={idx} className="text-lg sm:text-xl font-bold text-slate-100 mt-8 mb-3 pb-2 border-b border-[#1e2a3c]">
                        {trimmed.replace("## ", "")}
                      </h2>
                    )
                  }
                  if (trimmed.startsWith("# ")) {
                    return (
                      <h1 key={idx} className="text-xl sm:text-2xl font-bold text-slate-100 mt-8 mb-3">
                        {trimmed.replace("# ", "")}
                      </h1>
                    )
                  }

                  // Blockquotes
                  if (trimmed.startsWith("> ")) {
                    return (
                      <div
                        key={idx}
                        className="bg-[#141e2e] border-l-4 border-cyan-500 rounded-r-xl p-4 text-xs text-slate-300 italic my-4 leading-relaxed"
                      >
                        {trimmed.replace(/^>\s*/, "")}
                      </div>
                    )
                  }

                  // Code blocks
                  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
                    const lines = trimmed.split("\n")
                    const codeContent = lines.slice(1, -1).join("\n")
                    return (
                      <pre key={idx} className="bg-[#0b101a] border border-[#1f2b3e] rounded-xl p-4 overflow-x-auto text-xs font-mono text-cyan-300 my-4">
                        <code>{codeContent}</code>
                      </pre>
                    )
                  }

                  // Lists
                  if (trimmed.startsWith("- ") || trimmed.startsWith("1. ")) {
                    const items = trimmed.split("\n")
                    return (
                      <ul key={idx} className="space-y-1.5 my-3 pl-4 list-disc text-slate-300">
                        {items.map((item, i) => (
                          <li key={i} className="pl-1">
                            {item.replace(/^-\s*|^\d+\.\s*/, "")}
                          </li>
                        ))}
                      </ul>
                    )
                  }

                  // Standard paragraphs with bold parsing
                  return (
                    <p key={idx} className="leading-relaxed">
                      {trimmed}
                    </p>
                  )
                })}
              </article>

              {/* Assessment / Quiz CTA Box */}
              <div className="mt-12 p-6 sm:p-8 bg-[#121a26] rounded-2xl border border-cyan-500/30 text-center space-y-3 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  Uji Pemahaman Materi Ini
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Terapkan pengetahuan yang baru Anda pelajari dengan mengikuti evaluasi terstruktur di Quiz Arena.
                </p>
                <div className="pt-2">
                  <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl px-6 text-xs">
                    <Link href="/simulator/quiz">Ambil Kuis Interaktif</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar: Related Articles */}
            {relatedArticles.length > 0 && (
              <aside className="w-full lg:w-80 shrink-0 space-y-4">
                <div className="bg-[#121a26] border border-[#1f2b3e] rounded-2xl p-5 space-y-4 sticky top-24">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" /> Artikel Terkait
                  </h3>

                  <div className="space-y-3">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/learn/${related.slug}`}
                        className="block p-3 rounded-xl border border-[#1f2b3e] hover:border-cyan-500/40 bg-[#0f1622] hover:bg-[#141e2e] transition-colors group"
                      >
                        <span className="text-[9px] font-bold text-cyan-400 block mb-1">
                          {related.category}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2">
                          <Clock className="w-3 h-3" />
                          <span>{related.readTime}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </MainLayout>
    )
  }

  // 2. Fallback: Check if it's a Learning Module (preserving legacy module paths)
  const moduleData = learningModules.find((m) => m.slug === slug)
  if (moduleData) {
    const rooms = [
      {
        id: "room-1",
        number: 1,
        title: `Introduction to ${moduleData.title}`,
        type: "Walkthrough",
        time: "15 mins",
        status: "completed",
        description: `Understand the core concepts, background, and threat models associated with ${moduleData.title}.`
      },
      {
        id: "room-2",
        number: 2,
        title: "Technical Mechanisms & Attack Vectors",
        type: "Theory & Analysis",
        time: "35 mins",
        status: "in-progress",
        description: "Deep dive into real-world exploitation techniques, indicators of compromise, and telemetry analysis."
      }
    ]

    return (
      <MainLayout>
        <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full pb-16">
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/50 pb-4">
            <Link href="/learn" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Knowledge Base
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{moduleData.title}</span>
          </div>

          <div className="bg-[#101724] border border-[#1f2b3e] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <h1 className="text-2xl font-bold text-slate-100">{moduleData.title}</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{moduleData.description}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return notFound()
}
