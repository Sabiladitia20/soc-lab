"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ---------- helpers ----------

function validateRegex(pattern: string): { valid: boolean; error?: string } {
  try {
    new RegExp(pattern)
    return { valid: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Pattern regex tidak valid"
    return { valid: false, error: message }
  }
}

export async function getNextRuleCode(): Promise<string> {
  const lastRule = await prisma.rule.findFirst({
    orderBy: { ruleCode: "desc" },
    select: { ruleCode: true },
  })

  if (!lastRule) return "RULE-001"

  const match = lastRule.ruleCode.match(/RULE-(\d+)/)
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1
  return `RULE-${String(nextNum).padStart(3, "0")}`
}

// ---------- CRUD ----------

export type RuleActionResult = {
  success: boolean
  error?: string
}

export async function createRule(formData: FormData): Promise<RuleActionResult> {
  const pattern = formData.get("pattern") as string
  const regexCheck = validateRegex(pattern)
  if (!regexCheck.valid) {
    return { success: false, error: `Pattern regex tidak valid: ${regexCheck.error}` }
  }

  try {
    await prisma.rule.create({
      data: {
        ruleCode: formData.get("ruleCode") as string,
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || null,
        severity: formData.get("severity") as string,
        mitreTechnique: (formData.get("mitreTechnique") as string) || null,
        matchField: formData.get("matchField") as string,
        pattern,
        thresholdCount: parseInt(formData.get("thresholdCount") as string, 10) || 1,
        thresholdWindowSeconds: parseInt(formData.get("thresholdWindowSeconds") as string, 10) || 0,
        enabled: formData.get("enabled") === "true",
      },
    })
    revalidatePath("/dashboard/rules")
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Gagal membuat rule"
    if (message.includes("Unique constraint")) {
      return { success: false, error: "Rule Code sudah digunakan" }
    }
    return { success: false, error: message }
  }
}

export async function updateRule(id: string, formData: FormData): Promise<RuleActionResult> {
  const pattern = formData.get("pattern") as string
  const regexCheck = validateRegex(pattern)
  if (!regexCheck.valid) {
    return { success: false, error: `Pattern regex tidak valid: ${regexCheck.error}` }
  }

  try {
    await prisma.rule.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || null,
        severity: formData.get("severity") as string,
        mitreTechnique: (formData.get("mitreTechnique") as string) || null,
        matchField: formData.get("matchField") as string,
        pattern,
        thresholdCount: parseInt(formData.get("thresholdCount") as string, 10) || 1,
        thresholdWindowSeconds: parseInt(formData.get("thresholdWindowSeconds") as string, 10) || 0,
        enabled: formData.get("enabled") === "true",
      },
    })
    revalidatePath("/dashboard/rules")
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Gagal memperbarui rule"
    return { success: false, error: message }
  }
}

export async function deleteRule(id: string): Promise<RuleActionResult> {
  try {
    await prisma.rule.delete({ where: { id } })
    revalidatePath("/dashboard/rules")
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Gagal menghapus rule"
    return { success: false, error: message }
  }
}

export async function toggleRuleEnabled(id: string, enabled: boolean): Promise<RuleActionResult> {
  try {
    await prisma.rule.update({
      where: { id },
      data: { enabled },
    })
    revalidatePath("/dashboard/rules")
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Gagal mengubah status rule"
    return { success: false, error: message }
  }
}
