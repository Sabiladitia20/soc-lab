"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Globe, Tag, Crosshair, FileText } from "lucide-react"
import { Incident } from "@/lib/mock-data"
import { SeverityBadge } from "./severity-badge"
import { StatusBadge } from "./status-badge"
import { SLABadge } from "./sla-badge"
import React from "react"

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface IncidentTableProps {
  data: Incident[]
}

export function IncidentTable({ data }: IncidentTableProps) {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const totalPages = Math.ceil(data.length / rowsPerPage)
  const startIndex = (page - 1) * rowsPerPage
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  /** Check if incident has any extra detail fields worth showing */
  const hasDetails = (incident: Incident) => {
    return incident.sourceIp || incident.ruleId || incident.mitreTechnique || incident.rawDetails
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[100px] font-semibold text-foreground">ID</TableHead>
              <TableHead className="font-semibold text-foreground">Severity</TableHead>
              <TableHead className="min-w-[300px] font-semibold text-foreground">Title</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground">SLA</TableHead>
              <TableHead className="font-semibold text-foreground">Assignee</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Alerts</TableHead>
              <TableHead className="font-semibold text-foreground">Created</TableHead>
              <TableHead className="font-semibold text-foreground">Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No incidents found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((incident) => (
                <React.Fragment key={incident.id}>
                  <TableRow
                    key={incident.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    onClick={() => hasDetails(incident) && toggleRow(incident.id)}
                  >
                    <TableCell className="w-[40px] px-2">
                      {hasDetails(incident) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRow(incident.id)
                          }}
                        >
                          {expandedRow === incident.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-foreground">
                      {incident.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={incident.severity} />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {incident.title}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} />
                    </TableCell>
                    <TableCell>
                      <SLABadge sla={incident.sla} timeLeft={incident.slaTimeLeft} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {incident.assignee || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {incident.alerts}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(incident.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {timeAgo(new Date(incident.lastActivity))}
                    </TableCell>
                  </TableRow>

                  {/* Expandable Detail Row */}
                  {expandedRow === incident.id && hasDetails(incident) && (
                    <TableRow key={`${incident.id}-detail`} className="bg-muted/20 hover:bg-muted/30">
                      <TableCell colSpan={10} className="py-4 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          {incident.sourceIp && (
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Source IP</p>
                                <p className="text-foreground font-mono mt-0.5">{incident.sourceIp}</p>
                              </div>
                            </div>
                          )}
                          {incident.ruleId && (
                            <div className="flex items-start gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rule ID</p>
                                <p className="text-foreground font-mono mt-0.5">{incident.ruleId}</p>
                              </div>
                            </div>
                          )}
                          {incident.mitreTechnique && (
                            <div className="flex items-start gap-2">
                              <Crosshair className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">MITRE ATT&CK</p>
                                <p className="text-foreground font-mono mt-0.5">{incident.mitreTechnique}</p>
                              </div>
                            </div>
                          )}
                          {incident.rawDetails && (
                            <div className="flex items-start gap-2 md:col-span-2 lg:col-span-4">
                              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Raw Details</p>
                                <pre className="text-foreground font-mono text-xs mt-1 whitespace-pre-wrap break-all bg-background/60 rounded p-2 border border-border">
                                  {incident.rawDetails}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(val) => {
              setRowsPerPage(Number(val))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={rowsPerPage} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">
            {data.length > 0 ? `${startIndex + 1}-${Math.min(startIndex + rowsPerPage, data.length)} of ${data.length}` : "0 of 0"}
          </div>
          <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">
            Page {page} of {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
