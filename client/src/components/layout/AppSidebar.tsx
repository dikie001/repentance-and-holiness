/**
 * Repentance & Holiness Ministry — AppNavigation
 * ─────────────────────────────────────────────
 * Mobile : Sticky Bottom Nav + Minimal Top Header
 * Desktop: Sticky Top Navbar with glassmorphism
 */

"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Bell,
  BookOpenText,
  Flame,
  House,
  ImagePlay,
  Music4,
  RadioTower,
  Settings2,
  Sparkles,
  UsersRound,
  type LucideIcon
} from "lucide-react"
import { useEffect, useState } from "react"
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

// Bottom nav usually looks best with 5 items
const BOTTOM_NAV_ITEMS = NAV_ITEMS.slice(0, 5)

/* ─────────────────────────────────────────────────────────────
   Components
 ───────────────────────────────────────────────────────────── */

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/20">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
      </span>
      LIVE
    </span>
  )
}

/** ── Desktop Top Navbar ─────────────────────────────────────── */
function DesktopNavbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 h-18 hidden md:flex items-center justify-between border-b",
        scrolled
          ? "bg-[#060614]/80 backdrop-blur-xl border-white/5 shadow-lg"
          : "bg-transparent border-transparent"
      )}
    >
      {/* Logo & Brand */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          <div className="h-full w-full rounded-[10px] bg-black/20 flex items-center justify-center text-white font-black text-xs tracking-tighter">
            JIL
          </div>
        </div>
        <div>
          <p className="text-sm font-black text-white leading-none tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>
            Repentance & Holiness
          </p>
          <p className="text-[10px] font-bold text-cyan-400/80 leading-none mt-1 uppercase tracking-widest">
            Ministry
          </p>
        </div>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all",
                active
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-full border border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                />
              )}
              <item.icon size={16} className={active ? "text-cyan-400" : "text-slate-500"} />
              <span className="relative z-10">{item.title}</span>
              {item.badge === "LIVE" && <LiveBadge />}
            </Link>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="h-9 w-9 rounded-xl flex items-center justify-center bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
          <Bell size={18} />
        </button>
        <button className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
          <Sparkles size={18} />
        </button>
      </div>
    </nav>
  )
}

/** ── Mobile Top Header ──────────────────────────────────────── */
function MobileTopHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 h-16 md:hidden bg-[#060614]/60 backdrop-blur-lg border-b border-white/5">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-[10px] tracking-tighter">
          JIL
        </div>
        <div>
          <p className="text-[11px] font-black text-white leading-none uppercase tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>
            Repentance & Holiness
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <button className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 text-slate-400 active:scale-90 transition-transform">
          <Bell size={16} />
        </button>
        <button className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 text-slate-400 active:scale-90 transition-transform">
          <Settings2 size={16} />
        </button>
      </div>
    </header>
  )
}

/** ── Mobile Bottom Nav ───────────────────────────────────────── */
function MobileBottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-18 md:hidden px-4 pb-safe bg-[#060614]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const active = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))
        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 min-w-[64px] transition-all",
              active ? "text-cyan-400" : "text-slate-500"
            )}
          >
            <div className="relative">
              <item.icon
                size={22}
                className={cn("transition-transform", active && "scale-110")}
                strokeWidth={active ? 2.5 : 2}
              />
              {active && (
                <motion.div
                  layoutId="mobileActiveDot"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                />
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main Export
 ───────────────────────────────────────────────────────────── */

export function AppNavigation() {
  return (
    <>
      <DesktopNavbar />
      <MobileTopHeader />
      <MobileBottomNav />
    </>
  )
}

// Keep the name AppSidebar for backward compatibility in imports
export const AppSidebar = AppNavigation

export default AppNavigation
