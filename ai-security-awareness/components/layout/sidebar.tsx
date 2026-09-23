"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Target,
  AlertTriangle,
  Shield,
  Globe,
  Bot,
  Info,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ListChecks,
  HelpCircle,
  Terminal,
  KeyRound,
  Gamepad2,
  Link2
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigationGroups = [
  {
    label: "Utama",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Learn", href: "/learn", icon: BookOpen },
      { name: "Quiz Arena", href: "/simulator/quiz", icon: HelpCircle },
      { name: "Password Checker", href: "/simulator/checker", icon: KeyRound },
      { name: "Link Inspector", href: "/simulator/link-inspector", icon: Link2 },
      { name: "Mini Games", href: "/games", icon: Gamepad2 },
    ],
  },
  {
    label: "SOC Demo",
    items: [
      { name: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle },
      { name: "Rules", href: "/dashboard/rules", icon: ListChecks },
      { name: "MITRE ATT&CK", href: "/dashboard/mitre", icon: Shield },
      { name: "Phishing Campaign", href: "/dashboard/phishing-campaigns", icon: Target },
    ],
  },
  {
    label: "AI",
    items: [
      { name: "Assistant", href: "/assistant", icon: Bot },
      { name: "Prompt Sandbox", href: "/simulator/prompt-sandbox", icon: Terminal },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { name: "About", href: "/about", icon: Info },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 left-0 bg-secondary border-r border-border transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo Area */}
      <div className="h-[60px] flex items-center px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-foreground text-sm truncate">
              AI SecAwareness
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-none">
        <div className="flex flex-col gap-6 px-3">
          {navigationGroups.map((group, i) => (
            <div key={i} className="flex flex-col gap-1">
              {!collapsed && (
                <span className="text-[11px] font-semibold uppercase text-muted-foreground px-3 mb-1 tracking-wider">
                  {group.label}
                </span>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors group relative",
                      isActive
                        ? "bg-muted/50 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    {/* Active Border */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-primary rounded-r-md" />
                    )}
                    
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!collapsed && (
                      <span className="text-[13px] font-medium truncate">
                        {item.name}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-border flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  )
}
