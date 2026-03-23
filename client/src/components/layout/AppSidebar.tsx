/**
 * Repentance & Holiness Ministry — AppNavigation
 * ─────────────────────────────────────────────
 * Sidebar : Collapsible for Desktop + Drawer for Mobile
 * Header  : Sticky Top with Logo (Left) and Menu (Right)
 * Bottom  : Sticky Bottom Nav (3 key links) for Mobile
 */

"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bell,
  BookOpenText,
  Flame,
  House,
  ImagePlay,
  Menu,
  Music4,
  RadioTower,
  Settings2,
  UsersRound,
  type LucideIcon
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

/* ─────────────────────────────────────────────────────────────
   Data
 ───────────────────────────────────────────────────────────── */
type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { title: "Home", url: "/", icon: House },
  { title: "Radio", url: "/jesus-is-lord-radio", icon: RadioTower, badge: "LIVE" },
  { title: "Media", url: "/media", icon: Music4 },
  { title: "Teachings", url: "/teachings", icon: BookOpenText },
  { title: "Prophecies", url: "/prophecies", icon: Flame },
  { title: "Gallery", url: "/gallery", icon: ImagePlay },
  { title: "About", url: "/about", icon: UsersRound },
]

// User requested exactly 3 links for mobile bottom nav
const MOBILE_BOTTOM_ITEMS = NAV_ITEMS.slice(0, 3)

/* ─────────────────────────────────────────────────────────────
   Sub-components
 ───────────────────────────────────────────────────────────── */

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  )
}

/** ── Global Top Header ──────────────────────────────────────── */
export function GlobalHeader() {
  const { toggleSidebar } = useSidebar()
  
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-16 bg-[#060614]/60 backdrop-blur-xl border-b border-white/5 md:left-[var(--sidebar-width)] md:data-[state=collapsed]:left-[var(--sidebar-width-icon)] transition-all duration-200">
      {/* Logo on Left */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-[10px] tracking-tighter shadow-lg shadow-blue-500/20 group-active:scale-95 transition-transform">
          JIL
        </div>
        <div className="hidden sm:block">
          <p className="text-[11px] font-black text-white leading-none uppercase tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>
            Repentance & Holiness
          </p>
          <p className="text-[8px] font-bold text-cyan-400/60 leading-none mt-0.5 uppercase tracking-widest">
            Ministry
          </p>
        </div>
      </Link>

      {/* Actions & Menu Button on Right */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 mr-2">
           <button className="h-9 w-9 rounded-xl flex items-center justify-center bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/5">
            <Bell size={18} />
          </button>
        </div>

        {/* Modern Menu Button */}
        <button 
          onClick={toggleSidebar}
          className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 group active:scale-90"
          aria-label="Toggle Menu"
        >
          <Menu size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  )
}

/** ── Mobile Bottom Navigation ───────────────────────────────── */
export function MobileBottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 md:hidden px-6 pb-safe bg-[#060614]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {MOBILE_BOTTOM_ITEMS.map((item) => {
        const active = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))
        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 transition-all relative px-4",
              active ? "text-cyan-400" : "text-slate-500"
            )}
          >
            <div className="relative">
              <item.icon
                size={22}
                className={cn("transition-all duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}
                strokeWidth={active ? 2.5 : 2}
              />
              {active && (
                <motion.div
                  layoutId="bottomNavDot"
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/** ── Sidebar Content ─────────────────────────────────────────── */
function SidebarContentInner() {
  const { pathname } = useLocation()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <>
      <SidebarHeader className="h-20 flex items-center px-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20">
            JIL
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-black text-white leading-none tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>
                  Repentance & Holiness
                </p>
                <p className="text-[10px] font-bold text-cyan-400/70 leading-none mt-1 uppercase tracking-widest">
                  Ministry
                </p>
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
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className={cn(
                    "h-11 rounded-xl transition-all duration-200",
                    active 
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/20" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                  )}
                >
                  <Link to={item.url}>
                    <item.icon size={20} className={active ? "text-cyan-400" : "text-slate-500"} />
                    <span className="font-bold tracking-wide">{item.title}</span>
                    {item.badge === "LIVE" && !collapsed && (
                      <div className="ml-auto flex items-center gap-1.5 bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[9px] font-black border border-red-500/20">
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

      <SidebarFooter className="p-4 border-t border-white/5">
        <SidebarMenuButton 
          className="h-12 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5 gap-3"
          tooltip="Settings"
        >
          <Settings2 size={20} />
          <span className="font-bold">Settings</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main Export
 ───────────────────────────────────────────────────────────── */

export function AppSidebar() {
  return (
    <>
      {/* Desktop/Mobile Sidebar Context handles both based on state */}
      <Sidebar 
        collapsible="icon" 
        className="bg-[#060611] border-r border-white/5 shadow-2xl z-50"
      >
        <SidebarContentInner />
      </Sidebar>

      <GlobalHeader />
      <MobileBottomNav />
    </>
  )
}

export default AppSidebar
