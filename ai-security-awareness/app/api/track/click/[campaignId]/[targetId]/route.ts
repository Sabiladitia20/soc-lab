import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string; targetId: string } }
) {
  const { campaignId, targetId } = await params

  try {
    await prisma.trackingEvent.create({
      data: {
        campaignId,
        targetId,
        type: "clicked",
      },
    })

    // Update target status to Clicked
    const target = await prisma.target.findUnique({ where: { id: targetId } })
    if (target && target.status !== "Submitted") {
      await prisma.target.update({
        where: { id: targetId },
        data: { status: "Clicked" },
      })
    }
  } catch (e) {
    console.error("Failed to log click event:", e)
  }

  // Redirect to the simulation landing page
  return NextResponse.redirect(
    new URL(`/lp/${campaignId}/${targetId}`, req.url)
  )
}
