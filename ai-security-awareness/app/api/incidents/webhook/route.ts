import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const VALID_SEVERITIES = ["Low", "Medium", "High", "Critical"] as const

/** Deduplication window in seconds */
const DEDUP_WINDOW_SECONDS = 60

export async function POST(req: NextRequest) {
  // 1. Authenticate via API key header
  const apiKey = req.headers.get("x-api-key")
  if (!apiKey || apiKey !== process.env.SOC_AGENT_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Parse & validate body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { ruleName, severity, ruleId, sourceIp, details, mitreTechnique, rawUrl, userAgent } = body as {
    ruleName?: string
    severity?: string
    ruleId?: string
    sourceIp?: string
    details?: string
    mitreTechnique?: string
    rawUrl?: string
    userAgent?: string
    timestamp?: string
  }

  if (!ruleName || !severity) {
    return NextResponse.json(
      { error: "Missing required fields: ruleName and severity are required" },
      { status: 400 }
    )
  }

  // 3. Normalize severity — default to "Medium" if invalid
  const normalizedSeverity = VALID_SEVERITIES.includes(severity as typeof VALID_SEVERITIES[number])
    ? severity
    : "Medium"

  // 4. Build rawDetails from available fields
  const rawDetailsParts: string[] = []
  if (details) rawDetailsParts.push(`Details: ${details}`)
  if (rawUrl) rawDetailsParts.push(`URL: ${rawUrl}`)
  if (userAgent) rawDetailsParts.push(`User-Agent: ${userAgent}`)
  const rawDetails = rawDetailsParts.length > 0 ? rawDetailsParts.join("\n") : null

  // 5. Deduplication: check for existing incident with same ruleId + sourceIp
  //    created within the last 60 seconds and still status "New"
  if (ruleId && sourceIp) {
    const cutoff = new Date(Date.now() - DEDUP_WINDOW_SECONDS * 1000)

    const existingIncident = await prisma.incident.findFirst({
      where: {
        ruleId,
        sourceIp,
        status: "New",
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: "desc" },
    })

    if (existingIncident) {
      // Deduplicate: increment alert count and touch updatedAt
      const updated = await prisma.incident.update({
        where: { id: existingIncident.id },
        data: {
          alerts: existingIncident.alerts + 1,
        },
      })

      return NextResponse.json({
        success: true,
        incidentId: updated.id,
        deduplicated: true,
        alerts: updated.alerts,
      })
    }
  }

  // 6. Create new incident
  const incident = await prisma.incident.create({
    data: {
      title: ruleName,
      severity: normalizedSeverity,
      status: "New",
      sla: "OK",
      sourceIp: sourceIp || null,
      ruleId: ruleId || null,
      ruleName: ruleName,
      mitreTechnique: mitreTechnique || null,
      rawDetails,
    },
  })

  return NextResponse.json({
    success: true,
    incidentId: incident.id,
    deduplicated: false,
  })
}
