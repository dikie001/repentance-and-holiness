"use client"

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bell, BookOpenText, Flame, House, ImagePlay, Menu,
  Moon, Music4, RadioTower, Sun, UsersRound, type LucideIcon
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useNotifications } from "@/context/NotificationContext"

type NavItem = { title: string; url: string; icon: LucideIcon; badge?: string }

const NAV_ITEMS: NavItem[] = [
  { title: "Home",       url: "/",                    icon: House                      },
  { title: "Radio",      url: "/jesus-is-lord-radio", icon: RadioTower, badge: "LIVE" },
  { title: "Media",      url: "/media",               icon: Music4                    },
  { title: "Teachings",  url: "/teachings",           icon: BookOpenText              },
  { title: "Prophecies", url: "/prophecies",          icon: Flame                     },
  { title: "Gallery",    url: "/gallery",             icon: ImagePlay                 },
  { title: "About",      url: "/about",               icon: UsersRound                },
]

const MOBILE_ITEMS = [
  NAV_ITEMS[0], // Home
  NAV_ITEMS[1], // Radio
  NAV_ITEMS[2], // Media
]

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  )
}

export function GlobalHeader() {
  const { toggleSidebar } = useSidebar()
  const { unreadCount, setIsOpen } = useNotifications()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between px-4 backdrop-blur-xl border-b md:left-[var(--sidebar-width)] transition-all duration-200"
      style={{ background: "var(--app-header-bg)", borderColor: "var(--app-border)" }}
    >
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg shadow-md group-active:scale-95 transition-transform">
          <img src="/images/logo.png" alt="JIL Logo" className="h-full w-full object-cover" />
        </div>
        <p className="hidden sm:block text-xs sm:text-sm font-black leading-tight uppercase tracking-tight" style={{ color: "var(--app-text)" }}>
          Repentance &amp; Holiness
        </p>
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors border relative group/bell"
          style={{ background: "var(--app-surface)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
        >
          <Bell size={16} className="group-hover/bell:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-[9px] font-black text-white flex items-center justify-center border-2 border-slate-950 shadow-[0_0_8px_rgba(37,99,235,0.5)]">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={toggleSidebar}
          className="h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-90 border"
          style={{ background: "var(--app-surface)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}

export function MobileBottomNav() {
  const { pathname } = useLocation()
  
  // Find active index based on route
  const activeIndex = MOBILE_ITEMS.findIndex(item => {
    if (item.url === "/") return pathname === "/"
    return pathname.startsWith(item.url)
  })
  
  const idx = activeIndex === -1 ? 0 : activeIndex

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[76px] md:hidden backdrop-blur-md">
      {/* Premium Background with Dynamic Notch */}
      <div className="absolute inset-x-0 bottom-0 h-[64px] pointer-events-none overflow-visible">
        <svg
          viewBox="0 0 300 64"
          preserveAspectRatio="none"
          className="w-full h-full drop-shadow-[0_-5px_24px_rgba(0,0,0,0.4)]"
        >
          <motion.path
            animate={{
              d: `M 0 0 
                  L ${(idx * 100) + 24} 0 
                  C ${(idx * 100) + 36} 0 ${(idx * 100) + 34} 24 ${(idx * 100) + 50} 24 
                  C ${(idx * 100) + 66} 24 ${(idx * 100) + 64} 0 ${(idx * 100) + 76} 0 
                  L 300 0 
                  L 300 64 
                  L 0 64 
                  Z`
            }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            style={{ 
              fill: "var(--app-nav-bg)", 
              stroke: "var(--app-border)", 
              strokeWidth: 0.8 
            }}
          />
        </svg>
      </div>

      <div className="relative w-full h-full flex items-center justify-around z-10 px-0">
        {MOBILE_ITEMS.map((item, index) => {
          const active = index === idx
          return (
            <Link 
              key={item.url} 
              to={item.url} 
              className="flex-1 flex flex-col items-center justify-center relative h-full transition-all duration-300"
            >
              <div className="relative flex flex-col items-center justify-center w-full h-full pt-1">
                {active ? (
                  <motion.div
                    layoutId="activeCircle"
                    className="absolute -top-8 w-[60px] h-[60px] rounded-full flex items-center justify-center z-20 shadow-[0_12px_28px_-6px_rgba(6,182,212,0.45)]"
                    style={{ 
                      background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                      color: "white",
                      border: "4px solid var(--app-bg)"
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <item.icon size={26} className="drop-shadow-lg" />
                    <motion.div 
                      layoutId="activeDot"
                      className="absolute -bottom-5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                    />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                    <item.icon size={20} style={{ color: "var(--app-text)" }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] leading-none" style={{ color: "var(--app-text)" }}>
                      {item.title}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function SidebarContentInner() {
  const { pathname } = useLocation()
  const { state, setOpenMobile } = useSidebar()
  const collapsed = state === "collapsed"
  const { theme, setTheme } = useTheme()
  const isDark = theme !== "light"

  return (
    <>
      <SidebarHeader
        className="h-20 flex items-center px-4 border-b"
        style={{ borderColor: "var(--app-border)" }}
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20">
            JIL
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden whitespace-nowrap">
                <p className="text-sm font-black leading-none tracking-tight" style={{ color: "var(--app-text)" }}>
                  Repentance &amp; Holiness
                </p>
                <p className="text-[10px] font-black text-cyan-400 leading-none mt-1 uppercase tracking-widest">Ministry</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <SidebarMenu className="gap-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}
                  onClick={() => setOpenMobile(false)}
                  className={cn("h-11 rounded-xl transition-all duration-300 border",
                    active
                      ? "bg-white/10 text-cyan-400 border-white/10 shadow-lg"
                      : "border-transparent hover:bg-white/5 hover:text-white"
                  )}
                  style={!active ? { color: "var(--app-text-muted)" } : {}}
                >
                  <Link to={item.url}>
                    <item.icon size={20} style={{ color: active ? "#22d3ee" : "var(--app-text-faint)" }} />
                    <span className="font-bold tracking-wide">{item.title}</span>
                    {item.badge === "LIVE" && !collapsed && (
                      <div className="ml-auto flex items-center gap-1.5 bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full text-[9px] font-black border border-red-500/20">
                        <LiveDot /> LIVE
                      </div>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Theme toggle — sidebar footer */}
      <SidebarFooter className="p-4 border-t" style={{ borderColor: "var(--app-border)" }}>
        <SidebarMenuButton
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="h-11 rounded-xl border cursor-pointer transition-colors"
          style={{
            background: "var(--app-surface)",
            borderColor: "var(--app-border)",
            color: "var(--app-text-muted)",
          }}
          tooltip={isDark ? "Switch to Light" : "Switch to Dark"}
        >
          {isDark
            ? <Sun size={18} className="text-amber-400 shrink-0" />
            : <Moon size={18} className="text-blue-600 shrink-0" />}
          <span className="font-bold">{isDark ? "Light Mode" : "Dark Mode"}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </>
  )
}

export function AppSidebar() {
  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r shadow-2xl z-50 transition-all duration-300 backdrop-blur-xl [&_[data-slot=sidebar-inner]]:bg-transparent overflow-hidden"
        style={{ 
          background: "linear-gradient(to bottom right, #060614, #0a0a1e, #060610)", 
          borderColor: "var(--app-border)",
          "--sidebar": "transparent",
          "--sidebar-background": "transparent"
        } as React.CSSProperties}
      >
        {/* Deep ambient glow - ensuring it's visible */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-40 z-0"
          style={{ background: "radial-gradient(circle,rgba(37,99,235,0.2) 0%,transparent 70%)" }} />
          
        <div className="relative z-10 flex flex-col h-full"> 
          <SidebarContentInner />
        </div>
      </Sidebar>
      <GlobalHeader />
      <MobileBottomNav />
    </>
  )
}

export default AppSidebar
