import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

interface Props {
  params: {
    id: string
  }
}

export default async function LandingPagePreview({ params }: Props) {
  // Await the params object in Next.js 15+ if needed, but in standard app router params can just be accessed
  const { id } = await params
  
  const template = await prisma.landingPageTemplate.findUnique({
    where: { id },
  })

  if (!template) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky Warning Banner */}
      <div className="sticky top-0 z-[9999] bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-semibold shadow-md">
        ⚠️ MODE PREVIEW — Ini bukan halaman asli, hanya pratinjau template
      </div>

      {/* Raw HTML Content */}
      <div 
        className="flex-1 w-full"
        dangerouslySetInnerHTML={{ __html: template.htmlContent }} 
      />
    </div>
  )
}
