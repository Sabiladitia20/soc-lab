"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  PenLine,
  Eye,
  FileText,
  Heading,
  Bold,
  List,
  Quote,
  Code,
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from "lucide-react"
import { createArticleAction } from "../_actions/article-actions"

interface ArticleFormDialogProps {
  onArticleCreated?: () => void
  trigger?: React.ReactNode
}

export function ArticleFormDialog({ onArticleCreated, trigger }: ArticleFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

  // Form states
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [content, setContent] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleInsertMarkdown = (prefix: string, suffix: string = "") => {
    setContent((prev) => prev + `${prefix}${suffix}`)
  }

  const handleInsertImage = () => {
    const inputUrl = window.prompt("Masukkan URL gambar yang ingin disisipkan:")
    if (inputUrl && inputUrl.trim()) {
      const caption = window.prompt("Keterangan/caption gambar (opsional):", "") || "Gambar"
      handleInsertMarkdown(`\n\n![${caption}](${inputUrl.trim()})\n\n`)
    }
  }

  const resetForm = () => {
    setTitle("")
    setExcerpt("")
    setCoverImage("")
    setContent("")
    setErrorMsg(null)
    setActiveTab("write")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    if (!title.trim()) {
      setErrorMsg("Silakan masukkan judul artikel.")
      setIsLoading(false)
      return
    }

    if (!content.trim()) {
      setErrorMsg("Silakan masukkan isi artikel.")
      setIsLoading(false)
      return
    }

    try {
      const result = await createArticleAction({
        title: title.trim(),
        excerpt: excerpt.trim(),
        coverImage: coverImage.trim(),
        content: content.trim(),
      })

      if (result.success && result.slug) {
        resetForm()
        setOpen(false)
        if (onArticleCreated) {
          onArticleCreated()
        }
        router.push(`/learn/${result.slug}`)
      } else {
        setErrorMsg(result.error || "Gagal menyimpan artikel.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan artikel.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) resetForm()
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl px-4 py-2 gap-2 text-xs shadow-md shadow-cyan-500/20">
            <PenLine className="w-4 h-4" /> + Tulis Artikel Baru
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-[#0b121e] border-[#1e2a3c] text-slate-100 max-h-[88vh] overflow-y-auto rounded-2xl shadow-2xl p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <DialogHeader className="border-b border-[#182436] pb-3 text-left">
          <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Tulis Artikel Baru
          </DialogTitle>
          <p className="text-xs text-slate-400">
            Publikasikan materi panduan atau edukasi keamanan siber untuk tim internal.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Judul Artikel <span className="text-rose-400">*</span>
            </label>
            <Input
              placeholder="Contoh: Langkah Tanggap Insiden Phishing untuk Seluruh Karyawan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-[#0f1726] border-[#1e2d42] text-slate-100 text-xs rounded-xl focus-visible:ring-cyan-500"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Ringkasan Singkat</span>
              <span className="text-[10px] text-slate-500">Opsional</span>
            </label>
            <Input
              placeholder="1-2 kalimat ringkas untuk pengantar pada kartu artikel..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="bg-[#0f1726] border-[#1e2d42] text-slate-100 text-xs rounded-xl focus-visible:ring-cyan-500"
            />
          </div>

          {/* Cover Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> URL Gambar Sampul
              </span>
              <span className="text-[10px] text-slate-500">Opsional</span>
            </label>
            <Input
              placeholder="https://images.unsplash.com/... atau link gambar"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="bg-[#0f1726] border-[#1e2d42] text-slate-100 text-xs rounded-xl focus-visible:ring-cyan-500"
            />
          </div>

          {/* Editor Area */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between border-b border-[#182436] pb-2">
              <div className="flex items-center gap-1 bg-[#0f1726] p-0.5 rounded-lg border border-[#1e2d42]">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeTab === "write"
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeTab === "preview"
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Pratinjau
                </button>
              </div>

              {activeTab === "write" && (
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <button
                    type="button"
                    onClick={handleInsertImage}
                    title="Sisipkan Gambar"
                    className="flex items-center gap-1 px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                  >
                    <ImageIcon className="w-3 h-3 text-cyan-400" /> Gambar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown("\n\n## Subjudul\n")}
                    title="Heading"
                    className="p-1 hover:bg-slate-800 rounded hover:text-slate-200"
                  >
                    <Heading className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown("**teks tebal**")}
                    title="Tebal"
                    className="p-1 hover:bg-slate-800 rounded hover:text-slate-200"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown("\n- Poin\n")}
                    title="Daftar"
                    className="p-1 hover:bg-slate-800 rounded hover:text-slate-200"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertMarkdown("\n```\n# Kode\n```\n")}
                    title="Kode"
                    className="p-1 hover:bg-slate-800 rounded hover:text-slate-200"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {activeTab === "write" ? (
              <Textarea
                placeholder="Tulis materi artikel di sini menggunakan Markdown...\n\n## Pendahuluan\nJelaskan topik materi ini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="bg-[#0f1726] border-[#1e2d42] text-slate-100 font-mono text-xs rounded-xl min-h-[220px] leading-relaxed focus-visible:ring-cyan-500"
              />
            ) : (
              <div className="bg-[#0f1726] border border-[#1e2d42] rounded-xl p-4 min-h-[220px] max-h-[300px] overflow-y-auto text-xs text-slate-300 space-y-3 prose prose-invert prose-sm max-w-none">
                <h2 className="text-base font-bold text-slate-100">
                  {title || "Judul Artikel"}
                </h2>
                {excerpt && (
                  <p className="text-slate-400 italic text-xs">
                    {excerpt}
                  </p>
                )}
                {content ? (
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-200 pt-2 border-t border-slate-800">
                    {content}
                  </div>
                ) : (
                  <div className="text-slate-500 italic py-6 text-center text-xs">
                    Belum ada konten.
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-[#182436] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-700 text-slate-300 text-xs rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !content.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl px-5 gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menerbitkan...
                </>
              ) : (
                <>
                  <PenLine className="w-3.5 h-3.5" /> Terbitkan Artikel
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
