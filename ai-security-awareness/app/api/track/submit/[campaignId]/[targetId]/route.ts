import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string; targetId: string } }
) {
  const { campaignId, targetId } = await params

  try {
    const body = await req.json()
    const capturedData = JSON.stringify(body)

    await prisma.trackingEvent.create({
      data: {
        campaignId,
        targetId,
        type: "submitted",
        capturedData,
      },
    })

    // Update target status to Submitted
    await prisma.target.update({
      where: { id: targetId },
      data: { status: "Submitted" },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Failed to log submit event:", e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
