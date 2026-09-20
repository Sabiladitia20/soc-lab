"use client"

import { useState, useEffect } from "react"
import { Search, Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

function ClientClock() {
  const [time, setTime] = useState<Date | null>(null)

  // Hydration safe clock
  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = time?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const timeZone = time ? Intl.DateTimeFormat().resolvedOptions().timeZone : ""

  return (
    <div className="hidden md:flex flex-col items-end justify-center text-right">
      <span className="text-[13px] font-medium text-foreground font-mono tracking-wider">
        {formattedTime || "--:--:--"}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase">
        {timeZone}
      </span>
    </div>
  )
}

export function Topbar() {
  const [open, setOpen] = useState(false)

  // Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])


  return (
    <>
      <header className="h-[60px] sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6">
        
        {/* Search / Cmd+K */}
        <div className="flex-1 max-w-md">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center w-full gap-2 px-3 py-2 text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary/80 border border-border rounded-md transition-colors"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          
          {/* Clock */}
          <ClientClock />

          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-3 border-l border-border pl-6">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-[13px] font-medium text-foreground block">User</span>
              <span className="text-[11px] text-muted-foreground">SOC Analyst</span>
            </div>
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">US</AvatarFallback>
            </Avatar>
          </div>

        </div>
      </header>

      {/* Command Palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => setOpen(false)}>Dashboard</CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>Phishing Simulator</CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>Incidents</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
