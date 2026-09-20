"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ListChecks,
  Plus,
  Pencil,
  Trash2,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toggleRuleEnabled, deleteRule } from "../_actions/rule-actions"
import { RuleFormDialog } from "./rule-form-dialog"
import type { RuleData } from "./rule-form-dialog"

interface RulesClientProps {
  rules: RuleData[]
}

const severityStyles: Record<string, string> = {
  Low: "bg-[var(--severity-low)]/10 text-[var(--severity-low)] border-[var(--severity-low)]/30",
  Medium:
    "bg-[var(--severity-medium)]/10 text-[var(--severity-medium)] border-[var(--severity-medium)]/30",
  High: "bg-[var(--severity-high)]/10 text-[var(--severity-high)] border-[var(--severity-high)]/30",
  Critical:
    "bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] border-[var(--severity-critical)]/30",
}

function formatThreshold(count: number, windowSec: number) {
  if (count <= 1) return "1x"
  return `${count}x / ${windowSec}s`
}

export function RulesClient({ rules }: RulesClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<RuleData | null>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<RuleData | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = rules.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.ruleCode.toLowerCase().includes(search.toLowerCase())
  )

  function handleToggle(id: string, newVal: boolean) {
    startTransition(async () => {
      await toggleRuleEnabled(id, newVal)
      router.refresh()
    })
  }

  function handleEdit(rule: RuleData) {
    setEditingRule(rule)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditingRule(null)
    setFormOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteRule(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    router.refresh()
  }

  function handleFormSuccess() {
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ListChecks className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Detection Rules
            </h1>
            <Badge
              variant="secondary"
              className="bg-secondary text-muted-foreground font-mono"
            >
              {rules.length} total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Kelola detection rule yang dikonsumsi agent Python. Perubahan berlaku
            saat agent melakukan fetch berikutnya.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg shadow-sm">
        <div className="relative w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari rule code atau nama..."
            className="pl-9 bg-background border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {filtered.length} ditampilkan
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-[120px]">
                Rule Code
              </TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                Nama
              </TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-[100px]">
                Severity
              </TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-[120px]">
                MITRE
              </TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-[110px]">
                Match Field
              </TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-[90px]">
                Threshold
              </TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-[80px] text-center">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-[90px] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-12"
                >
                  {search
                    ? "Tidak ada rule yang cocok dengan pencarian."
                    : "Belum ada detection rule. Klik \"+ New Rule\" untuk mulai."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((rule) => (
                <TableRow
                  key={rule.id}
                  className={cn(
                    "transition-colors hover:bg-muted/10",
                    !rule.enabled && "opacity-50"
                  )}
                >
                  <TableCell className="font-mono text-xs text-primary">
                    {rule.ruleCode}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {rule.name}
                      </span>
                      {rule.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                          {rule.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("font-medium text-xs", severityStyles[rule.severity])}
                    >
                      {rule.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {rule.mitreTechnique || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs border-border text-muted-foreground bg-secondary/50"
                    >
                      {rule.matchField}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatThreshold(
                      rule.thresholdCount,
                      rule.thresholdWindowSeconds
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(val) => handleToggle(rule.id, val)}
                      disabled={isPending}
                      aria-label={`Toggle ${rule.ruleCode}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                        title="Edit rule"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(rule)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-[var(--severity-critical)] hover:bg-[var(--severity-critical)]/10 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <RuleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        rule={editingRule}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-[420px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Hapus Rule</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Apakah kamu yakin ingin menghapus rule{" "}
              <span className="font-mono text-primary">
                {deleteTarget?.ruleCode}
              </span>{" "}
              ({deleteTarget?.name})? Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-border text-muted-foreground"
            >
              Batal
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-[var(--severity-critical)] text-white hover:bg-[var(--severity-critical)]/90"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
