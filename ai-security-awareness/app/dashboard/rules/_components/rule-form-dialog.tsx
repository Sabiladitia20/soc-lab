"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createRule, updateRule, getNextRuleCode } from "../_actions/rule-actions"
import type { RuleActionResult } from "../_actions/rule-actions"
import { Loader2 } from "lucide-react"

export interface RuleData {
  id: string
  ruleCode: string
  name: string
  description: string | null
  severity: string
  mitreTechnique: string | null
  matchField: string
  pattern: string
  thresholdCount: number
  thresholdWindowSeconds: number
  enabled: boolean
}

interface RuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: RuleData | null // null = create mode
  onSuccess: () => void
}

export function RuleFormDialog({ open, onOpenChange, rule, onSuccess }: RuleFormDialogProps) {
  const isEdit = !!rule

  const [ruleCode, setRuleCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("Medium")
  const [mitreTechnique, setMitreTechnique] = useState("")
  const [matchField, setMatchField] = useState("url")
  const [pattern, setPattern] = useState("")
  const [thresholdCount, setThresholdCount] = useState(1)
  const [thresholdWindowSeconds, setThresholdWindowSeconds] = useState(0)
  const [enabled, setEnabled] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when dialog opens
  useEffect(() => {
    if (!open) return

    if (rule) {
      setRuleCode(rule.ruleCode)
      setName(rule.name)
      setDescription(rule.description || "")
      setSeverity(rule.severity)
      setMitreTechnique(rule.mitreTechnique || "")
      setMatchField(rule.matchField)
      setPattern(rule.pattern)
      setThresholdCount(rule.thresholdCount)
      setThresholdWindowSeconds(rule.thresholdWindowSeconds)
      setEnabled(rule.enabled)
    } else {
      // Create mode — fetch next rule code
      setName("")
      setDescription("")
      setSeverity("Medium")
      setMitreTechnique("")
      setMatchField("url")
      setPattern("")
      setThresholdCount(1)
      setThresholdWindowSeconds(0)
      setEnabled(true)
      setError(null)

      getNextRuleCode().then(setRuleCode)
    }
  }, [open, rule])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set("ruleCode", ruleCode)
    formData.set("name", name)
    formData.set("description", description)
    formData.set("severity", severity)
    formData.set("mitreTechnique", mitreTechnique)
    formData.set("matchField", matchField)
    formData.set("pattern", pattern)
    formData.set("thresholdCount", String(thresholdCount))
    formData.set("thresholdWindowSeconds", String(thresholdWindowSeconds))
    formData.set("enabled", String(enabled))

    let result: RuleActionResult

    if (isEdit && rule) {
      result = await updateRule(rule.id, formData)
    } else {
      result = await createRule(formData)
    }

    setLoading(false)

    if (result.success) {
      onOpenChange(false)
      onSuccess()
    } else {
      setError(result.error || "Terjadi kesalahan")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEdit ? "Edit Rule" : "Create New Rule"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? "Ubah konfigurasi detection rule."
              : "Buat detection rule baru untuk digunakan agent."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Rule Code */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ruleCode" className="text-muted-foreground text-xs uppercase tracking-wide">
              Rule Code
            </Label>
            <Input
              id="ruleCode"
              value={ruleCode}
              onChange={(e) => setRuleCode(e.target.value)}
              readOnly={isEdit}
              className={`bg-background border-border font-mono ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
              placeholder="RULE-001"
              required
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wide">
              Nama Rule
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border"
              placeholder="SQL Injection Attempt"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-muted-foreground text-xs uppercase tracking-wide">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-border resize-none min-h-[60px]"
              placeholder="Deskripsi singkat tentang rule ini..."
            />
          </div>

          {/* Severity + Match Field row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                Severity
              </Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                Match Field
              </Label>
              <Select value={matchField} onValueChange={setMatchField}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">url</SelectItem>
                  <SelectItem value="user_agent">user_agent</SelectItem>
                  <SelectItem value="log_line">log_line</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* MITRE Technique */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mitreTechnique" className="text-muted-foreground text-xs uppercase tracking-wide">
              MITRE Technique{" "}
              <span className="text-muted-foreground/60 normal-case">(opsional)</span>
            </Label>
            <Input
              id="mitreTechnique"
              value={mitreTechnique}
              onChange={(e) => setMitreTechnique(e.target.value)}
              className="bg-background border-border font-mono"
              placeholder="T1190"
            />
          </div>

          {/* Pattern */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pattern" className="text-muted-foreground text-xs uppercase tracking-wide">
              Pattern (Regex)
            </Label>
            <Textarea
              id="pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="bg-background border-border resize-none min-h-[60px] font-mono text-xs"
              placeholder='Gunakan regex. Contoh: (<script>)|(alert\()'
              required
            />
            <span className="text-[11px] text-muted-foreground/70">
              Gunakan regex. Contoh: {'(<script>)|(alert\\()'}
            </span>
          </div>

          {/* Threshold row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="thresholdCount" className="text-muted-foreground text-xs uppercase tracking-wide">
                Threshold Count
              </Label>
              <Input
                id="thresholdCount"
                type="number"
                min={1}
                value={thresholdCount}
                onChange={(e) => setThresholdCount(parseInt(e.target.value, 10) || 1)}
                className="bg-background border-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="thresholdWindowSeconds" className="text-muted-foreground text-xs uppercase tracking-wide">
                Window (detik)
              </Label>
              <Input
                id="thresholdWindowSeconds"
                type="number"
                min={0}
                value={thresholdWindowSeconds}
                onChange={(e) => setThresholdWindowSeconds(parseInt(e.target.value, 10) || 0)}
                className="bg-background border-border"
                disabled={thresholdCount <= 1}
              />
              {thresholdCount <= 1 && (
                <span className="text-[11px] text-muted-foreground/60">
                  Aktif ketika Threshold Count &gt; 1
                </span>
              )}
            </div>
          </div>

          {/* Enabled */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
            <div>
              <Label className="text-sm text-foreground">Enabled</Label>
              <p className="text-[11px] text-muted-foreground">
                Rule yang dinonaktifkan tidak akan digunakan oleh agent.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-[var(--severity-critical)]/10 border border-[var(--severity-critical)]/30 px-3 py-2 text-sm text-[var(--severity-critical)]">
              {error}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-muted-foreground"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Buat Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
