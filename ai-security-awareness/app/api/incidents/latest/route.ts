import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const since = searchParams.get("since")

    // If no `since` param, return the current latest timestamp as a baseline
    if (!since) {
      const latest = await prisma.incident.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      })

      return NextResponse.json({
        baseline: latest ? latest.createdAt.toISOString() : new Date().toISOString(),
        incidents: [],
      })
    }

    const sinceDate = new Date(since)
    if (isNaN(sinceDate.getTime())) {
      return NextResponse.json({ error: "Invalid since timestamp" }, { status: 400 })
    }

    // Query incidents created strictly after `since`
    const newIncidents = await prisma.incident.findMany({
      where: {
        createdAt: {
          gt: sinceDate,
        },
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    })

    const latestTimestamp =
      newIncidents.length > 0
        ? newIncidents[newIncidents.length - 1].createdAt.toISOString()
        : since

    return NextResponse.json({
      latestTimestamp,
      count: newIncidents.length,
      incidents: newIncidents.map((inc) => ({
        id: inc.id,
        title: inc.title,
        severity: inc.severity,
        status: inc.status,
        sourceIp: inc.sourceIp,
        ruleId: inc.ruleId,
        ruleName: inc.ruleName,
        mitreTechnique: inc.mitreTechnique,
        alerts: inc.alerts,
        createdAt: inc.createdAt.toISOString(),
      })),
    })
  } catch (err: unknown) {
    console.error("Polling incidents error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
