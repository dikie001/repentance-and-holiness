"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bell,
  BookOpenText,
  House,
  ImagePlay,
  Moon,
  Music4,
  PanelLeft,
  RadioTower,
  Sun,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useNotifications } from "@/context/NotificationContext"

type NavItem = { title: string; url: string; icon: LucideIcon; badge?: string }

const NAV_ITEMS: NavItem[] = [
  { title: "Home", url: "/", icon: House },
  {
    title: "Radio",
    url: "/jesus-is-lord-radio",
    icon: RadioTower,
    badge: "LIVE",
  },
  { title: "Media", url: "/media", icon: Music4 },
  { title: "Teachings", url: "/teachings", icon: BookOpenText },
  { title: "Gallery", url: "/gallery", icon: ImagePlay },
  { title: "About", url: "/about", icon: UsersRound },
]

const MOBILE_ITEMS = [NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[3]]

/* ─── Live pulse dot ────────────────────────────────────────────── */
function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
    </span>
  )
}

/* ─── ChatGPT-style sidebar toggle (floats at sidebar edge) ─────── */
function SidebarToggleButton() {
  const { toggleSidebar, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <motion.button
      onClick={toggleSidebar}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
      aria-label="Toggle sidebar"
      className={cn(
        "group hidden md:flex",
        "h-8 w-8 items-center justify-center rounded-lg",
        "transition-colors duration-150",
        "hover:bg-white/10"
      )}
      style={{ color: "var(--app-text-muted)" }}
    >
      <PanelLeft
        size={18}
        className={cn(
          "transition-transform duration-300",
          isCollapsed && "rotate-180"
        )}
      />
    </motion.button>
  )
}

/* ─── Global top header ─────────────────────────────────────────── */
export function GlobalHeader() {
  const { unreadCount, setIsOpen } = useNotifications()

  return (
    <header
      className="absolute top-0 right-0 left-0 z-40 flex h-14 items-center justify-between border-b px-4 backdrop-blur-xl transition-all duration-200"
      style={{
        background: "var(--app-header-bg)",
        borderColor: "var(--app-border)",
      }}
    >
      {/* Left: toggle + brand */}
      <div className="flex items-center gap-3">
        <SidebarToggleButton />

        <Link to="/" className="group flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-md transition-all duration-300 group-active:scale-95">
            <img
              src="/images/logo.png"
              alt="JIL Logo"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col justify-center leading-none">
            <p
              className="text-[9px] font-black tracking-[0.2em] uppercase opacity-50"
              style={{ color: "var(--app-text)" }}
            >
              Ministry of
            </p>
            <p
              className="text-sm font-black tracking-tight uppercase"
              style={{ color: "var(--app-text)" }}
            >
              Repentance <span className="text-cyan-500">&amp;</span> Holiness
            </p>
          </div>
        </Link>
      </div>

      {/* Right: notification bell */}
      <button
        onClick={() => setIsOpen(true)}
        className="group/bell relative flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-white/5"
        style={{
          background: "var(--app-surface)",
          borderColor: "var(--app-border)",
          color: "var(--app-text-muted)",
        }}
        aria-label="Notifications"
      >
        <Bell
          size={15}
          className="transition-transform group-hover/bell:rotate-12"
        />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-black text-white shadow-[0_0_8px_rgba(37,99,235,0.6)]"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </header>
  )
}

/* ─── Mobile bottom nav (4 items, dynamic notch) ───────────────── */
export function MobileBottomNav() {
  const { pathname } = useLocation()

  const activeIndex = MOBILE_ITEMS.findIndex((item) =>
    item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
  )
  const idx = activeIndex === -1 ? 0 : activeIndex
  const count = MOBILE_ITEMS.length
  const pct = (idx / (count - 1)) * 100

  // notch center X in the 0-300 viewBox
  const notchX = (idx / (count - 1)) * 300

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 h-[4.5rem] md:hidden">
      {/* SVG background with animated notch */}
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        <svg
          viewBox="0 0 300 72"
          preserveAspectRatio="none"
          className="h-full w-full drop-shadow-[0_-4px_20px_rgba(0,0,0,0.35)]"
        >
          <motion.path
            animate={{
              d: `M0,0 
                  L${notchX - 40},0 
                  C${notchX - 22},0 ${notchX - 22},26 ${notchX},26 
                  C${notchX + 22},26 ${notchX + 22},0 ${notchX + 40},0 
                  L300,0 L300,72 L0,72 Z`,
            }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{
              fill: "var(--app-nav-bg)",
              stroke: "var(--app-border)",
              strokeWidth: 0.5,
            }}
          />
        </svg>
      </div>

      {/* Nav items */}
      <div className="relative z-10 flex h-full w-full items-end justify-around px-2 pb-2">
        {MOBILE_ITEMS.map((item, index) => {
          const active = index === idx
          return (
            <Link
              key={item.url}
              to={item.url}
              className="relative flex flex-1 flex-col items-center"
            >
              <AnimatePresence mode="wait">
                {active ? (
                  <motion.div
                    key="active"
                    layoutId="mobileActiveIcon"
                    initial={{ y: 0 }}
                    animate={{ y: -30 }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_8px_24px_-4px_rgba(6,182,212,0.5)]"
                    style={{
                      background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
                      color: "white",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <item.icon size={22} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="inactive"
                    className="flex h-10 w-10 flex-col items-center justify-center gap-1 opacity-40 transition-opacity hover:opacity-70"
                  >
                    <item.icon size={19} style={{ color: "var(--app-text)" }} />
                    <span
                      className="text-[9px] font-black tracking-wider uppercase"
                      style={{ color: "var(--app-text)" }}
                    >
                      {item.title}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active label below the floating icon */}
              {active && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-[9px] font-black tracking-wider text-cyan-400 uppercase"
                >
                  {item.title}
                </motion.span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/* ─── Sidebar inner content ─────────────────────────────────────── */
function SidebarContentInner() {
  const { pathname } = useLocation()
  const { state, setOpenMobile, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  const { theme, setTheme } = useTheme()
  const isDark = theme !== "light"

  return (
    <>
      {/* Header row: logo + collapse toggle */}
      <SidebarHeader
        className="flex h-14 flex-row items-center justify-between border-b px-3"
        style={{ borderColor: "var(--app-border)" }}
      >
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 overflow-hidden"
          onClick={() => setOpenMobile(false)}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 text-[10px] font-black text-white shadow-md shadow-blue-500/25">
            JIL
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p
                  className="text-[11px] leading-tight font-black tracking-tight"
                  style={{ color: "var(--app-text)" }}
                >
                  Repentance &amp; Holiness
                </p>
                <p className="mt-0.5 text-[9px] font-black tracking-[0.18em] text-cyan-400 uppercase">
                  Ministry
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* ChatGPT-style in-sidebar toggle (desktop only) */}
        <motion.button
          onClick={toggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/10 md:flex"
          style={{ color: "var(--app-text-muted)" }}
          aria-label="Collapse sidebar"
        >
          <PanelLeft
            size={16}
            className={cn(
              "transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </motion.button>
      </SidebarHeader>

      {/* Nav items */}
      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.url ||
              (item.url !== "/" && pathname.startsWith(item.url))

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  onClick={() => setOpenMobile(false)}
                  className={cn(
                    "relative h-10 rounded-lg transition-all duration-200",
                    active
                      ? "bg-white/10 text-white"
                      : "text-[--app-text-muted] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Link to={item.url}>
                    {/* Active left accent bar */}
                    {active && (
                      <motion.span
                        layoutId="activeBar"
                        className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-cyan-400"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}

                    <item.icon
                      size={18}
                      className={cn(
                        "shrink-0 transition-colors",
                        active ? "text-cyan-400" : "text-[--app-text-faint]"
                      )}
                    />

                    <span className="text-sm font-semibold tracking-wide">
                      {item.title}
                    </span>

                    {item.badge === "LIVE" && !collapsed && (
                      <div className="ml-auto flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-black text-red-400">
                        <LiveDot />
                        LIVE
                      </div>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer: theme toggle */}
      <SidebarFooter
        className="border-t p-3"
        style={{ borderColor: "var(--app-border)" }}
      >
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5",
            "transition-colors duration-150 hover:bg-white/5",
            collapsed && "justify-center px-0"
          )}
          style={{
            background: "var(--app-surface)",
            borderColor: "var(--app-border)",
            color: "var(--app-text-muted)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.span
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={16} className="shrink-0 text-amber-400" />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={16} className="shrink-0 text-blue-500" />
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden text-xs font-semibold whitespace-nowrap"
              >
                {isDark ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </SidebarFooter>
    </>
  )
}

/* ─── Root export ───────────────────────────────────────────────── */
export function AppSidebar() {
  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <>
      <Sidebar
        collapsible="icon"
        className={cn(
          "z-50 overflow-hidden border-r backdrop-blur-xl transition-all duration-300",
          "**:data-[slot=sidebar-inner]:bg-transparent"
        )}
        style={
          {
            background: isDark
              ? "linear-gradient(160deg,#07071a 0%,#0b0b20 60%,#060612 100%)"
              : "var(--app-sidebar-bg)",
            borderColor: "var(--app-border)",
            "--sidebar-width": "14rem",
            "--sidebar-width-icon": "3.25rem",
            "--sidebar": "transparent",
            "--sidebar-background": "transparent",
          } as React.CSSProperties
        }
      >
        {/* Subtle radial ambient glow */}
        {isDark && (
          <div
            className="pointer-events-none absolute -top-16 left-1/2 z-0 h-80 w-80 -translate-x-1/2 rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
            }}
          />
        )}

        <div className="relative z-10 flex h-full flex-col">
          <SidebarContentInner />
        </div>
      </Sidebar>

      <GlobalHeader />
      <MobileBottomNav />
    </>
  )
}

export default AppSidebar
