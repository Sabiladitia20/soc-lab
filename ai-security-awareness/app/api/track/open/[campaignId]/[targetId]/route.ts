import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// 1x1 transparent GIF encoded in base64
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7",
  "base64"
)

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
        type: "opened",
      },
    })

    // Also update target status if not already at a higher-level status
    const target = await prisma.target.findUnique({ where: { id: targetId } })
    if (target && (target.status === "Sent" || target.status === "Pending")) {
      await prisma.target.update({
        where: { id: targetId },
        data: { status: "Opened" },
      })
    }
  } catch (e) {
    // Don't let a logging failure prevent the pixel from being returned
    console.error("Failed to log open event:", e)
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
