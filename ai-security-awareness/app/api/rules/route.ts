import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const rules = await prisma.rule.findMany({
      where: { enabled: true },
      select: {
        ruleCode: true,
        name: true,
        severity: true,
        mitreTechnique: true,
        matchField: true,
        pattern: true,
        thresholdCount: true,
        thresholdWindowSeconds: true,
      },
      orderBy: { ruleCode: "asc" },
    })

    return NextResponse.json({ rules })
  } catch (error) {
    console.error("Failed to fetch rules:", error)
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    )
  }
}
