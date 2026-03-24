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
import { motion } from "framer-motion"
import {
  Bell,
  BookOpenText,
  Copy,
  House,
  ImagePlay,
  Moon,
  Music4,
  PanelLeft,
  RadioTower,
  Share2,
  Sun,
  UsersRound,
  Menu, // <-- Added Menu icon for mobile
  type LucideIcon,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useNotifications } from "@/context/NotificationContext"
import { toast } from "sonner"

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

// Original 3-item mobile list — UNCHANGED
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

// ── GlobalHeader ────────────────────────────────────────────────────────
export function GlobalHeader() {
  const { toggleSidebar, state } = useSidebar()
  const { unreadCount, setIsOpen } = useNotifications()
  const isCollapsed = state === "collapsed"

  return (
    <header
      className={cn(
        "absolute top-0 right-0 z-40 flex h-16 items-center justify-between border-b px-3 backdrop-blur-xl transition-all duration-300 md:px-4",
        isCollapsed ? "left-0 md:left-12" : "left-0 md:left-60"
      )}
      style={{
        background: "var(--app-header-bg)",
        borderColor: "var(--app-border)",
      }}
    >
      {/* Left: Navbar Text is ALWAYS INTACT. Logo ONLY shows here when sidebar is CLOSED */}
      <div className="flex items-center gap-3">
        <Link to="/" className="group flex items-center gap-3">
          {isCollapsed && (
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg ring-1 ring-black/5 transition-all duration-300 group-active:scale-95 dark:ring-white/5">
              <img
                src="/images/logo.png"
                alt="JIL Logo"
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
          )}
          <div className={`${state === "expanded" && "lg:ml-4"} flex flex-col justify-center`}>
            <p
              className={` hidden text-[10px] leading-tight font-black tracking-[0.15em] uppercase opacity-60 sm:block sm:text-[11px]`}
              style={{ color: "var(--app-text)" }}
            >
              Ministry of
            </p>
            <p
              className="text-sm leading-none font-black tracking-tighter uppercase sm:text-base md:text-lg"
              style={{ color: "var(--app-text)" }}
            >
              Repentance <span className="text-cyan-500">&amp;</span> Holiness
            </p>
          </div>
        </Link>
      </div>

      {/* Right: bell + mobile hamburger */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="group/bell relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors"
          style={{
            background: "var(--app-surface)",
            borderColor: "var(--app-border)",
            color: "var(--app-text-muted)",
          }}
        >
          <Bell
            size={16}
            className="transition-transform group-hover/bell:rotate-12"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-black text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Mobile menu toggle: CHANGED TO MENU (HAMBURGER) ICON */}
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-90 md:hidden"
          style={{
            background: "var(--app-surface)",
            borderColor: "var(--app-border)",
            color: "var(--app-text-muted)",
          }}
          aria-label="Toggle Menu"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  )
}

// ── MobileBottomNav ───────────────────────────────────────────────────────
export function MobileBottomNav() {
  const { pathname } = useLocation()

  const activeIndex = MOBILE_ITEMS.findIndex((item) => {
    if (item.url === "/") return pathname === "/"
    return pathname.startsWith(item.url)
  })

  const idx = activeIndex === -1 ? 0 : activeIndex

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 h-19 backdrop-blur-md md:hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 overflow-visible">
        <svg
          viewBox="0 0 300 64"
          preserveAspectRatio="none"
          className="h-full w-full drop-shadow-[0_-5px_24px_rgba(0,0,0,0.4)]"
        >
          <motion.path
            animate={{
              d: `M 0 0 
                  L ${idx * 100 + 17} 0 
                  C ${idx * 100 + 32} 0 ${idx * 100 + 32} 28 ${idx * 100 + 50} 28 
                  C ${idx * 100 + 68} 28 ${idx * 100 + 68} 0 ${idx * 100 + 83} 0 
                  L 300 0 
                  L 300 64 
                  L 0 64 
                  Z`,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            style={{
              fill: "var(--app-nav-bg)",
              stroke: "var(--app-border)",
              strokeWidth: 0.8,
            }}
          />
        </svg>
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-around px-0">
        {MOBILE_ITEMS.map((item, index) => {
          const active = index === idx
          return (
            <Link
              key={item.url}
              to={item.url}
              className="relative flex h-full flex-1 flex-col items-center justify-center transition-all duration-300"
            >
              <div className="relative flex h-full w-full flex-col items-center justify-center pt-1">
                {active ? (
                  <motion.div
                    layoutId="activeCircle"
                    className="absolute -top-7 z-20 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_12px_28px_-6px_rgba(6,182,212,0.45)]"
                    style={{
                      background:
                        "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                      color: "white",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <item.icon size={26} className="drop-shadow-lg" />
                    <motion.div
                      layoutId="activeDot"
                      className="absolute -bottom-5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                    />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 opacity-40 transition-opacity hover:opacity-100">
                    <item.icon size={20} style={{ color: "var(--app-text)" }} />
                    <span
                      className="text-[10px] leading-none font-black tracking-[0.12em] uppercase"
                      style={{ color: "var(--app-text)" }}
                    >
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

// ── SidebarContentInner ────────────────────────────────────────────────────
function SidebarContentInner() {
  const { pathname } = useLocation()
  const { state, setOpenMobile, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  const { theme, setTheme } = useTheme()
  const isDark = theme !== "light"
  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function"

  const onShareApp = async () => {
    const data = {
      title: "Repentance & Holiness App",
      text: "Install and listen on the Repentance & Holiness app",
      url: window.location.origin,
    }

    if (canShare) {
      await navigator.share(data).catch(() => undefined)
      return
    }

    try {
      await navigator.clipboard.writeText(data.url)
      toast.success("App link copied to clipboard")
    } catch {
      toast.error("Unable to copy app link")
    }
  }

  return (
    <>
      <SidebarHeader
        className={cn(
          "flex h-16 w-full shrink-0 items-center border-b transition-all duration-300",
          // Strictly enforce flex-row and spacing
          collapsed ? "justify-center px-0" : "flex-row justify-between px-4"
        )}
        style={{ borderColor: "var(--app-border)" }}
      >
        {/* Render Logo on the far LEFT ONLY when sidebar is OPEN */}
        {!collapsed && (
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setOpenMobile(false)}
          >
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
              <img
                src="/images/logo.png"
                alt="JIL Logo"
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
        )}

        {/* Toggle Button: pushed to far RIGHT when open, centered when closed */}
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-white/8 active:scale-95"
          style={{
            background: "var(--app-surface)",
            borderColor: "var(--app-border)",
            color: "var(--app-text-muted)",
          }}
          aria-label="Toggle Sidebar"
        >
          <PanelLeft
            size={18}
            className={cn(
              "transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <SidebarMenu className="gap-2">
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
                    "h-11 rounded-xl border transition-all duration-200",
                    active
                      ? "border-cyan-500/40 bg-blue-600 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)] backdrop-blur-sm"
                      : "border-transparent hover:bg-white/5 hover:text-white"
                  )}
                  style={!active ? { color: "var(--app-text-muted)" } : {}}
                >
                  <Link to={item.url} onClick={() => setOpenMobile(false)}>
                    <item.icon
                      size={20}
                      style={{
                        color: active ? "#22d3ee" : "var(--app-text-faint)",
                      }}
                    />
                    <span className="font-bold tracking-wide">
                      {item.title}
                    </span>
                    {item.badge === "LIVE" && !collapsed && (
                      <div className="ml-auto flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-black text-red-400">
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

      <SidebarFooter
        className="border-t p-4"
        style={{ borderColor: "var(--app-border)" }}
      >
        <SidebarMenuButton
          onClick={onShareApp}
          tooltip="Share App"
          className="mb-2 h-11 w-full cursor-pointer rounded-xl border transition-colors hover:bg-white/5"
          style={{
            background: "var(--app-surface)",
            borderColor: "var(--app-border)",
            color: "var(--app-text-muted)",
          }}
        >
          {canShare ? (
            <Share2 size={18} className="shrink-0 text-cyan-400" />
          ) : (
            <Copy size={18} className="shrink-0 text-cyan-400" />
          )}
          <span className="font-bold">Share App</span>
        </SidebarMenuButton>

        <SidebarMenuButton
          onClick={() => setTheme(isDark ? "light" : "dark")}
          tooltip={isDark ? "Switch to Light" : "Switch to Dark"}
          className="h-11 w-full cursor-pointer rounded-xl border transition-colors hover:bg-white/5"
          style={{
            background: "var(--app-surface)",
            borderColor: "var(--app-border)",
            color: "var(--app-text-muted)",
          }}
        >
          {isDark ? (
            <Sun size={18} className="shrink-0 text-amber-400" />
          ) : (
            <Moon size={18} className="shrink-0 text-blue-600" />
          )}
          <span className="font-bold">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </SidebarMenuButton>
      </SidebarFooter>
    </>
  )
}

export function AppSidebar() {
  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="z-50 overflow-hidden border-r backdrop-blur-xl transition-all duration-300 **:data-[slot=sidebar-inner]:bg-transparent md:border-r"
        style={
          {
            background: isDark
              ? "linear-gradient(to bottom right, #060614, #0a0a1e, #060610)"
              : "var(--app-sidebar-bg)",
            borderColor: "var(--app-border)",
            "--sidebar-width": "15rem",
            "--sidebar-width-icon": "3.5rem",
            "--sidebar": "transparent",
            "--sidebar-background": "transparent",
          } as React.CSSProperties
        }
      >
        {isDark && (
          <div
            className="pointer-events-none absolute -top-24 left-1/2 z-0 h-125 w-125 -translate-x-1/2 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle,rgba(37,99,235,0.2) 0%,transparent 70%)",
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
