"use server"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createCampaign(data: {
  name: string
  note?: string
  emailTemplateId: string
  landingPageId: string
  targets: { name: string; email: string }[]
}) {
  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      note: data.note,
      emailTemplateId: data.emailTemplateId,
      landingPageId: data.landingPageId,
      status: "draft",
      targets: {
        create: data.targets.map(t => ({
          name: t.name,
          email: t.email,
          status: "Pending"
        }))
      }
    }
  })
  
  redirect(`/dashboard/phishing-campaigns/${campaign.id}`)
}

export async function launchCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { emailTemplate: true, targets: true },
  })
  if (!campaign) throw new Error("Campaign not found")
  if (campaign.status !== "draft") throw new Error("Campaign already launched")

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!baseUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured")

  const errors: string[] = []

  for (const target of campaign.targets) {
    const trackingLink = `${baseUrl}/api/track/click/${campaign.id}/${target.id}`
    const openPixelUrl = `${baseUrl}/api/track/open/${campaign.id}/${target.id}`

    // Replace {{TRACKING_LINK}} placeholder in template with actual tracking link,
    // and append an invisible 1x1 tracking pixel before closing </body>
    let html = campaign.emailTemplate.bodyHtml.replace(
      /\{\{TRACKING_LINK\}\}/g,
      trackingLink
    )
    html += `<img src="${openPixelUrl}" width="1" height="1" style="display:none" alt="" />`

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: target.email,
        subject: campaign.emailTemplate.subject,
        html,
      })

      // Record "sent" event for this target
      await prisma.trackingEvent.create({
        data: {
          campaignId: campaign.id,
          targetId: target.id,
          type: "sent",
        },
      })

      // Update target status
      await prisma.target.update({
        where: { id: target.id },
        data: { status: "Sent" },
      })
    } catch (e) {
      console.error(`Failed to send email to ${target.email}:`, e)
      errors.push(target.email)
    }

    // Rate limit delay (500ms between sends) to avoid hitting Resend free tier limits
    await new Promise((r) => setTimeout(r, 500))
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "active", launchedAt: new Date() },
  })

  revalidatePath(`/dashboard/phishing-campaigns/${campaignId}`)

  if (errors.length > 0) {
    return {
      success: true,
      warning: `Campaign launched, but failed to send to: ${errors.join(", ")}`,
    }
  }

  return { success: true }
}

export async function deleteCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  })
  if (!campaign) throw new Error("Campaign not found")

  await prisma.campaign.delete({
    where: { id: campaignId },
  })

  revalidatePath("/dashboard/phishing-campaigns")
  return { success: true }
}
