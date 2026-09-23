"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  BookOpen,
  Clock,
  ArrowRight,
  Calendar,
  FileText,
  RefreshCw,
  PenLine
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { getAllArticles, ArticleItem } from "./_actions/article-actions"
import { ArticleFormDialog } from "./_components/article-form-dialog"

export default function LearnPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const data = await getAllArticles()
      setArticles(data)
    } catch (e) {
      console.error("Failed to load articles:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles
    const q = searchQuery.toLowerCase()
    return articles.filter((article) => {
      return (
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q)
      )
    })
  }, [articles, searchQuery])

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full pb-16 pt-2">
        {/* Header Bar */}
        <div className="border-b border-border/50 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                <BookOpen className="w-7 h-7 text-cyan-400" />  Artikel & Edukasi Keamanan
              </h1>
              
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <ArticleFormDialog onArticleCreated={fetchArticles} />
            </div>
          </div>
        </div>

        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari artikel berdasarkan judul atau materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#101724] border border-[#1f2b3e] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Total: <strong>{filteredArticles.length}</strong> artikel
            </span>
            <span>•</span>
            <button
              onClick={fetchArticles}
              className="flex items-center gap-1 hover:text-cyan-400 transition-colors text-xs"
              title="Muat ulang daftar"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>

        {/* Content View */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#101724]/60 border border-[#1f2b3e] rounded-2xl p-5 h-44 animate-pulse space-y-3"
              >
                <div className="w-3/4 h-5 bg-slate-800 rounded-lg" />
                <div className="w-full h-4 bg-slate-800 rounded-lg" />
                <div className="w-1/2 h-3 bg-slate-800 rounded-lg mt-6" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/learn/${article.slug}`}
                className="group bg-[#101724] hover:bg-[#151f30] border border-[#1e2a3c] hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-cyan-950/20 relative overflow-hidden"
              >
                {article.coverImage && (
                  <div className="-mx-5 -mt-5 mb-4 h-36 overflow-hidden bg-slate-900 border-b border-[#1e2a3c]">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).parentElement!.style.display = "none"
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <h2 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#182334] flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {article.readTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(article.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Baca <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Clean Professional Empty State */
          <div className="py-20 px-4 text-center bg-[#101724]/40 rounded-2xl border border-dashed border-[#1f2b3e] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-semibold text-slate-200">
                Belum ada artikel yang diterbitkan
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mulai dokumentasikan panduan penanganan ancaman siber, SOP keamanan, atau materi edukasi untuk tim internal Anda.
              </p>
            </div>

            <div className="pt-2">
              <ArticleFormDialog
                onArticleCreated={fetchArticles}
                trigger={
                  <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl px-4 py-2 gap-2 text-xs shadow-md shadow-cyan-500/20">
                    <PenLine className="w-4 h-4" /> + Tulis Artikel Pertama
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
