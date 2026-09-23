"use client"

import { useState, useTransition } from "react"
import { Rocket, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { launchCampaign } from "../actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Props {
  campaignId: string
  campaignStatus: string
  targetCount: number
}

export function CampaignLaunchButton({ campaignId, campaignStatus, targetCount }: Props) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const isLaunched = campaignStatus !== "draft"

  if (isLaunched) {
    return (
      <Button disabled variant="secondary" className="gap-2 shrink-0">
        <CheckCircle2 className="w-4 h-4" />
        Campaign Launched
      </Button>
    )
  }

  const handleLaunch = () => {
    startTransition(async () => {
      try {
        const result = await launchCampaign(campaignId)
        if (result?.warning) {
          toast.warning(result.warning)
        } else {
          toast.success(`Campaign berhasil diluncurkan! Email terkirim ke ${targetCount} target.`)
        }
        router.refresh()
      } catch (error) {
        toast.error("Gagal meluncurkan campaign. Periksa konfigurasi Resend.")
        console.error(error)
      } finally {
        setOpen(false)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="gap-2 shrink-0" disabled={targetCount === 0}>
          <Rocket className="w-4 h-4" />
          Launch Campaign
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Launch Campaign</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Kamu akan mengirim email ke <strong>{targetCount} target</strong>. 
              Pastikan semua target sudah memberikan izin untuk menerima email simulasi phishing.
            </span>
            <span className="block text-amber-500 text-sm">
              ⚠️ Aksi ini tidak bisa dibatalkan setelah email terkirim.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleLaunch()
            }}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim Email...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Ya, Launch Sekarang
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

import { Trash2 } from "lucide-react"
import { deleteCampaign } from "../actions"

export function CampaignDeleteButton({ campaignId, campaignName }: { campaignId: string, campaignName: string }) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCampaign(campaignId)
        toast.success(`Campaign "${campaignName}" berhasil dihapus.`)
        router.push("/dashboard/phishing-campaigns")
      } catch (error) {
        toast.error("Gagal menghapus campaign.")
        console.error(error)
      } finally {
        setOpen(false)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
          <Trash2 className="w-4 h-4" />
          Hapus
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Campaign</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Apakah kamu yakin ingin menghapus campaign <strong>&quot;{campaignName}&quot;</strong>?
            </span>
            <span className="block text-red-500 text-sm">
              ⚠️ Semua data target dan tracking event pada campaign ini akan ikut terhapus. Aksi ini tidak bisa dibatalkan.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            {isPending ? "Menghapus..." : "Ya, Hapus Campaign"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

