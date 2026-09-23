"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"

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
  return (
    <header className="h-[60px] sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-end px-6">
      
      {/* Right Section */}
      <div className="flex items-center gap-6">
        
        {/* Clock */}
        <ClientClock />

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
        </button>

      </div>
    </header>
  )
}

