"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Clock } from "lucide-react"
import { articles, ArticleCategory } from "@/lib/mock-data"
import { MainLayout } from "@/components/layout/main-layout"

const categories: ArticleCategory[] = [
  "All",
  "Phishing AI",
  "Deepfake & Voice Cloning",
  "Prompt Injection",
  "Social Engineering",
]

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<ArticleCategory>("All")

  const filteredArticles = useMemo(() => articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "All" || article.category === activeCategory
    return matchesSearch && matchesCategory
  }), [searchQuery, activeCategory])

  return (
    <MainLayout>
    <div className="flex-1 space-y-8 p-6 pt-8 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Learn</h1>
          <p className="text-sm text-muted-foreground">
            Pelajari ancaman siber berbasis AI
          </p>
        </div>

        {/* Search Bar (Topbar style) */}
        <div className="flex-1 max-w-md w-full">
          <div className="flex items-center w-full gap-2 px-3 py-2 text-sm text-foreground bg-secondary/50 border border-border rounded-md transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari artikel..."
              className="flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === category
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-border"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <Link href={`/learn/${article.slug}`} key={article.slug} className="group outline-none">
              <div className="flex flex-col h-full bg-card rounded-xl border border-border p-5 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-md group-hover:-translate-y-1 group-focus-visible:border-primary group-focus-visible:ring-1 group-focus-visible:ring-primary">
                {/* Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                    {article.category}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{article.readTime}</span>
                  </div>
                  <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
            <p>Tidak ada artikel yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
    </MainLayout>
  )
}
