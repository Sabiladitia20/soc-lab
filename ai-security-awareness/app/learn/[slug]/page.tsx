import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Clock } from "lucide-react"
import { articles } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug)
  
  if (!article) {
    notFound()
  }

  const relatedArticles = articles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3)

  return (
    <MainLayout>
    <div className="flex-1 max-w-7xl mx-auto w-full p-6 pt-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-8">
        <Link href="/learn" className="hover:text-foreground transition-colors">
          Learn
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
          {article.title}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1 max-w-[720px]">
          {/* Header */}
          <header className="mb-10 space-y-4">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
              <span>•</span>
              <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </header>

          {/* Article Prose */}
          <article className="prose prose-invert prose-slate max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground">
            {/* Convert simple markdown-like syntax to React elements for demo purposes */}
            {article.content.split('\\n\\n').map((paragraph, index) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <h3 key={index} className="text-xl font-semibold mt-8 mb-4 text-foreground">{paragraph.replace(/\*\*/g, '')}</h3>
              }
              if (paragraph.includes('**')) {
                const parts = paragraph.split('**');
                return (
                  <p key={index} className="text-muted-foreground mb-6 leading-relaxed">
                    {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part))}
                  </p>
                )
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\\n- ').map(i => i.replace(/^- /, ''));
                return (
                   <ul key={index} className="list-disc pl-5 mb-6 text-muted-foreground space-y-2">
                     {items.map((item, i) => {
                        if (item.includes('**')) {
                          const parts = item.split('**');
                          return (
                            <li key={i}>
                              {parts.map((part, pi) => (pi % 2 === 1 ? <strong key={pi} className="text-foreground">{part}</strong> : part))}
                            </li>
                          )
                        }
                        return <li key={i}>{item}</li>
                     })}
                   </ul>
                )
              }
              if (paragraph.match(/^\d+\./)) {
                const items = paragraph.split(/\\n\d+\. /).map(i => i.replace(/^\d+\. /, ''));
                return (
                   <ol key={index} className="list-decimal pl-5 mb-6 text-muted-foreground space-y-2">
                     {items.map((item, i) => {
                        if (item.includes('**')) {
                          const parts = item.split('**');
                          return (
                            <li key={i}>
                              {parts.map((part, pi) => (pi % 2 === 1 ? <strong key={pi} className="text-foreground">{part}</strong> : part))}
                            </li>
                          )
                        }
                        return <li key={i}>{item}</li>
                     })}
                   </ol>
                )
              }
              return <p key={index} className="text-muted-foreground mb-6 leading-relaxed">{paragraph}</p>
            })}
          </article>

          {/* CTA */}
          <div className="mt-12 p-8 bg-secondary/30 rounded-2xl border border-border text-center">
            <h3 className="text-xl font-semibold mb-2">Uji Pemahamanmu</h3>
            <p className="text-muted-foreground mb-6">
              Terapkan pengetahuan yang baru saja kamu pelajari dalam simulasi interaktif kami.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/dashboard">
                Mulai Simulasi
              </Link>
            </Button>
          </div>
        </div>

        {/* Sidebar (Related Articles) */}
        {relatedArticles.length > 0 && (
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                Related Articles
              </h3>
              <div className="space-y-4">
                {relatedArticles.map((related) => (
                  <Link href={`/learn/${related.slug}`} key={related.slug} className="group block">
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                      <h4 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{related.readTime}</span>
                      </div>
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
