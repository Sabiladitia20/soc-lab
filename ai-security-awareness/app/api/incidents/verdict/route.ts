import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const VALID_VERDICTS = ["TP", "FP"] as const

/**
 * PATCH /api/incidents/verdict
 * Body: { incidentId: string, verdict: "TP" | "FP", verdictBy?: string, verdictNote?: string }
 *
 * Allows SOC analysts to label an incident as True Positive or False Positive.
 * This data feeds into accuracy reporting and alert-tuning analytics.
 */
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { incidentId, verdict, verdictBy, verdictNote } = body as {
    incidentId?: string
    verdict?: string
    verdictBy?: string
    verdictNote?: string
  }

  if (!incidentId || !verdict) {
    return NextResponse.json(
      { error: "Missing required fields: incidentId and verdict" },
      { status: 400 }
    )
  }

  if (!VALID_VERDICTS.includes(verdict as typeof VALID_VERDICTS[number])) {
    return NextResponse.json(
      { error: `Invalid verdict. Must be one of: ${VALID_VERDICTS.join(", ")}` },
      { status: 400 }
    )
  }

  // Ensure the incident exists
  const existing = await prisma.incident.findUnique({
    where: { id: incidentId },
  })

  if (!existing) {
    return NextResponse.json(
      { error: `Incident not found: ${incidentId}` },
      { status: 404 }
    )
  }

  // Update the verdict
  const updated = await prisma.incident.update({
    where: { id: incidentId },
    data: {
      verdict,
      verdictBy: verdictBy || null,
      verdictNote: verdictNote || null,
      verdictAt: new Date(),
    },
  })

  return NextResponse.json({
    success: true,
    incidentId: updated.id,
    verdict: updated.verdict,
    verdictAt: updated.verdictAt,
  })
}

/**
 * DELETE /api/incidents/verdict
 * Body: { incidentId: string }
 *
 * Resets / clears the verdict on an incident (sets it back to unlabeled).
 */
export async function DELETE(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { incidentId } = body as { incidentId?: string }

  if (!incidentId) {
    return NextResponse.json(
      { error: "Missing required field: incidentId" },
      { status: 400 }
    )
  }

  const existing = await prisma.incident.findUnique({
    where: { id: incidentId },
  })

  if (!existing) {
    return NextResponse.json(
      { error: `Incident not found: ${incidentId}` },
      { status: 404 }
    )
  }

  const updated = await prisma.incident.update({
    where: { id: incidentId },
    data: {
      verdict: null,
      verdictBy: null,
      verdictNote: null,
      verdictAt: null,
    },
  })

  return NextResponse.json({
    success: true,
    incidentId: updated.id,
    verdict: null,
  })
}
