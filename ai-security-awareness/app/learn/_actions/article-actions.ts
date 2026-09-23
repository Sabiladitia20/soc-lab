"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface ArticleItem {
  id: string
  slug: string
  title: string
  category?: string
  excerpt: string
  readTime: string
  content: string
  createdAt: string
  coverImage?: string
}

// Helper to convert title into URL-friendly slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Calculate approximate read time based on word count
function calculateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 180))
  return `${minutes} min read`
}

// Extract cover image from markdown content if present
function extractCoverImage(content: string): string | undefined {
  const match = content.match(/!\[.*?\]\((.*?)\)/)
  return match ? match[1] : undefined
}

// Extract excerpt from content
function extractExcerpt(content: string, customExcerpt?: string): string {
  if (customExcerpt && customExcerpt.trim().length > 0) {
    return customExcerpt.trim()
  }
  const clean = content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/^>\s*\*\*Ringkasan:\*\*\s*/gm, "")
    .replace(/[#*`_>\[\]]/g, "")
    .replace(/\n+/g, " ")
    .trim()
  return clean.slice(0, 160) + (clean.length > 160 ? "..." : "")
}

// 1. Get all articles (Only real articles from database)
export async function getAllArticles(): Promise<ArticleItem[]> {
  try {
    const dbArticles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    })

    return dbArticles.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      category: a.category || "General",
      excerpt: extractExcerpt(a.content),
      readTime: calculateReadTime(a.content),
      content: a.content,
      createdAt: a.createdAt.toISOString(),
      coverImage: extractCoverImage(a.content),
    }))
  } catch (error) {
    console.error("Error fetching articles from DB:", error)
    return []
  }
}

// 2. Get single article by slug
export async function getArticleBySlug(slug: string): Promise<ArticleItem | null> {
  try {
    const dbArticle = await prisma.article.findUnique({
      where: { slug },
    })

    if (dbArticle) {
      return {
        id: dbArticle.id,
        slug: dbArticle.slug,
        title: dbArticle.title,
        category: dbArticle.category || "General",
        excerpt: extractExcerpt(dbArticle.content),
        readTime: calculateReadTime(dbArticle.content),
        content: dbArticle.content,
        createdAt: dbArticle.createdAt.toISOString(),
        coverImage: extractCoverImage(dbArticle.content),
      }
    }
  } catch (e) {
    console.error("Error checking DB for slug:", slug, e)
  }

  return null
}

// 3. Create a new article action (No category needed)
export async function createArticleAction(formData: {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
}): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const { title, content, excerpt, coverImage } = formData

    if (!title || title.trim().length < 3) {
      return { success: false, error: "Judul artikel minimal 3 karakter." }
    }
    if (!content || content.trim().length < 10) {
      return { success: false, error: "Isi konten artikel minimal 10 karakter." }
    }

    let baseSlug = slugify(title)
    if (!baseSlug) {
      baseSlug = `article-${Date.now()}`
    }

    // Check if slug already exists, if so append random characters
    let finalSlug = baseSlug
    const existing = await prisma.article.findUnique({
      where: { slug: finalSlug },
    })
    if (existing) {
      finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
    }

    let finalContent = content.trim()

    // Add cover image at the beginning if provided
    if (coverImage && coverImage.trim().length > 0) {
      finalContent = `![Cover Image](${coverImage.trim()})\n\n${finalContent}`
    }

    // Prepend excerpt if provided so it stays in content markdown
    if (excerpt && excerpt.trim().length > 0) {
      finalContent = `> **Ringkasan:** ${excerpt.trim()}\n\n${finalContent}`
    }

    const created = await prisma.article.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        category: "General",
        content: finalContent,
      },
    })

    revalidatePath("/learn")
    revalidatePath(`/learn/${finalSlug}`)

    return { success: true, slug: created.slug }
  } catch (error: any) {
    console.error("Error creating article:", error)
    return { success: false, error: error?.message || "Gagal menyimpan artikel ke database." }
  }
}

// 4. Delete article action
export async function deleteArticleAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.article.delete({
      where: { id },
    })
    revalidatePath("/learn")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting article:", error)
    return { success: false, error: error?.message || "Gagal menghapus artikel." }
  }
}
