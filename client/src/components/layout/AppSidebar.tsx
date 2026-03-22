/**
 * Repentance & Holiness Ministry — AppSidebar
 * ─────────────────────────────────────────────
 * Stack  : React + TypeScript + Tailwind CSS + Framer Motion + shadcn/ui
 * Mobile : Sheet (slide-in drawer from the left)
 * Desktop: Fixed sidebar with collapsed / expanded state
 *
 * Prerequisites
 * ─────────────
 *   npm install framer-motion lucide-react
 *   npx shadcn@latest add sheet tooltip separator badge
 *
 * Fonts (add to index.html <head>)
 * ────────────────────────────────
 *   <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
 *
 * Logo
 * ────
 *   Place your logo at /images/logo.png (served from /public)
 */

"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Bell,
  BookOpenText,
  ChevronLeft,
  Cross,
  Flame,
  Globe,
  House,
  ImagePlay,
  LayoutDashboard,
  Menu,
  Mic2,
  Music4,
  RadioTower,
  Settings2,
  Sparkles,
  UsersRound,
  X
} from "lucide-react"
import { useState } from "react"

/* ─────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────── */
type NavSection = {
  label: string
  items: NavItem[]
}

type NavItem = {
  title: string
  url: string
  icon: React.ElementType
  badge?: string
  active?: boolean
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main",
    items: [
      { title: "Home", url: "/", icon: House, active: true },
      {
        title: "Jesus Is Lord Radio",
        url: "jesus-is-lord-radio",
        icon: RadioTower,
        badge: "LIVE",
      },
      { title: "Media & Worship", url: "/media", icon: Music4 },
      { title: "Teachings", url: "/teachings", icon: BookOpenText, badge: "New" },
      { title: "Prophecies", url: "/prophesies", icon: Flame },
      { title: "Gallery", url: "/gallery", icon: ImagePlay },
    ],
  },
  {
    label: "Community",
    items: [
      { title: "About Ministry", url: "#", icon: UsersRound },
      { title: "Global Outreach", url: "#", icon: Globe },
      { title: "Evangelism", url: "#", icon: Mic2 },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Notifications", url: "#", icon: Bell, badge: "3" },
      { title: "Settings", url: "#", icon: Settings2 },
    ],
  },
]

/* ─────────────────────────────────────────────────────────────
   Framer variants
───────────────────────────────────────────────────────────── */
const sidebarVariants = {
  expanded: {
    width: 260,
    transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
  },
  collapsed: {
    width: 72,
    transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
  },
}

const labelVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    display: "block",
    transition: { delay: 0.1, duration: 0.2 },
  },
  collapsed: { opacity: 0, x: -8, transitionEnd: { display: "none" } },
}

const sectionLabelVariants = {
  expanded: {
    opacity: 1,
    height: "auto",
    marginBottom: 4,
    transition: { delay: 0.12, duration: 0.2 },
  },
  collapsed: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.15 },
  },
}

const listVariants = {
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
  hide: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
}

const itemVariants = {
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  hide: { opacity: 0, x: -12, transition: { duration: 0.18 } },
}

/* ─────────────────────────────────────────────────────────────
   Live radio pulse
───────────────────────────────────────────────────────────── */
function LiveDot() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   Single nav item row
───────────────────────────────────────────────────────────── */
function NavRow({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem
  collapsed: boolean
  onClick?: () => void
}) {
  const Icon = item.icon
  const isLive = item.badge === "LIVE"

  const inner = (
    <motion.a
      href={item.url}
      onClick={onClick}
      whileHover={{ x: collapsed ? 0 : 3 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        item.active
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
          : "text-slate-600 hover:bg-blue-50/80 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
      )}
    >
      {/* active indicator bar */}
      {item.active && (
        <motion.span
          layoutId="activeBar"
          className="absolute top-2 bottom-2 left-0 w-0.5 rounded-r-full bg-white/60"
        />
      )}

      {/* icon */}
      <span
        className={cn(
          "flex-shrink-0 transition-transform group-hover:scale-110",
          item.active ? "text-white" : "text-blue-500"
        )}
      >
        <Icon size={18} strokeWidth={item.active ? 2.5 : 2} />
      </span>

      {/* label */}
      <motion.span
        variants={labelVariants}
        className="flex-1 truncate leading-none"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {item.title}
      </motion.span>

      {/* badge */}
      {item.badge && (
        <motion.span variants={labelVariants}>
          {isLive ? (
            <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
              <LiveDot /> LIVE
            </span>
          ) : (
            <Badge
              className={cn(
                "h-4 rounded-full px-1.5 py-0 text-[10px] font-bold",
                item.active
                  ? "border-0 bg-white/20 text-white"
                  : "border-0 bg-blue-100 text-blue-700"
              )}
            >
              {item.badge}
            </Badge>
          )}
        </motion.span>
      )}
    </motion.a>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{inner}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
            {item.badge && (
              <span className="ml-1 text-blue-500">{item.badge}</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return inner
}

/* ─────────────────────────────────────────────────────────────
   Sidebar inner content (shared between desktop + Sheet)
───────────────────────────────────────────────────────────── */
function SidebarBody({
  collapsed = false,
  onNavClick,
}: {
  collapsed?: boolean
  onNavClick?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* ── Logo header ── */}
      <div
        className={cn(
          "flex items-center border-b border-blue-900/8 dark:border-white/5",
          collapsed ? "justify-center px-0 py-4" : "gap-3 px-5 py-4"
        )}
      >
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="flex-shrink-0"
        >
          <img
            src="/images/logo.png"
            alt="Repentance & Holiness Ministry logo"
            className={cn(
              "object-contain drop-shadow-md",
              collapsed ? "h-9 w-9 rounded-lg" : "h-11 w-11 rounded-xl"
            )}
            onError={(e) => {
              /* fallback cross icon if image missing */
              ;(e.currentTarget as HTMLImageElement).style.display = "none"
              const next = e.currentTarget
                .nextElementSibling as HTMLElement | null
              if (next) next.style.display = "flex"
            }}
          />
          {/* fallback */}
          <div
            className={cn(
              "hidden items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md",
              collapsed ? "h-9 w-9" : "h-11 w-11"
            )}
          >
            <Cross size={collapsed ? 16 : 20} strokeWidth={2.5} />
          </div>
        </motion.div>

        <motion.div variants={labelVariants} className="min-w-0">
          <p
            className="truncate text-[13px] leading-tight font-black text-blue-900 dark:text-blue-100"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Repentance &
          </p>
          <p
            className="truncate text-[11px] leading-tight font-semibold text-blue-500 dark:text-blue-400"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Holiness Ministry
          </p>
        </motion.div>
      </div>

      {/* ── Nav sections ── */}
      <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-100 flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-3 py-4">
        <motion.ul
          variants={listVariants}
          initial="hide"
          animate="show"
          className="space-y-5"
        >
          {NAV_SECTIONS.map((section) => (
            <li key={section.label}>
              {/* section label */}
              <motion.p
                variants={sectionLabelVariants}
                className="overflow-hidden px-3 text-[10px] font-extrabold tracking-widest text-blue-400/70 uppercase dark:text-blue-600/70"
              >
                {section.label}
              </motion.p>

              <ul className="mt-1 space-y-0.5">
                {section.items.map((item) => (
                  <motion.li key={item.title} variants={itemVariants}>
                    <NavRow
                      item={item}
                      collapsed={collapsed}
                      onClick={onNavClick}
                    />
                  </motion.li>
                ))}
              </ul>
            </li>
          ))}
        </motion.ul>
      </div>

      {/* ── Footer radio teaser ── */}
      <div className="mt-2 px-3 pb-4">
        <Separator className="mb-4 bg-blue-900/6 dark:bg-white/5" />

        <motion.div
          whileHover={{ scale: collapsed ? 1.04 : 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative cursor-pointer overflow-hidden rounded-2xl select-none",
            "bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-lg shadow-blue-900/20",
            collapsed ? "flex items-center justify-center p-2.5" : "p-4"
          )}
        >
          {/* cross watermark */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='18' y='2' width='4' height='36' fill='white'/%3E%3Crect x='4' y='12' width='32' height='4' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: "40px 40px",
            }}
          />
          {/* glow */}
          <motion.div
            className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(147,197,253,0.3) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {collapsed ? (
            <div className="relative z-10 flex items-center justify-center">
              <RadioTower size={18} />
              <LiveDot />
            </div>
          ) : (
            <div className="relative z-10">
              <div className="mb-1 flex items-center gap-1.5">
                <LiveDot />
                <span className="text-[10px] font-extrabold tracking-widest text-blue-200 uppercase">
                  On Air
                </span>
              </div>
              <p
                className="mb-0.5 text-xs leading-snug font-bold"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Jesus Is Lord Radio
              </p>
              <p className="text-[10px] text-blue-300/80">
                12,347 listeners worldwide
              </p>
              <div className="mt-2 flex h-4 items-end gap-[3px]">
                {[1, 2, 3, 4, 3, 2].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-blue-300"
                    animate={{ height: [`${h * 16}%`, "100%", `${h * 16}%`] }}
                    transition={{
                      duration: 0.5 + i * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.07,
                    }}
                    style={{ minHeight: 3 }}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Desktop Sidebar
───────────────────────────────────────────────────────────── */
function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? "collapsed" : "expanded"}
      initial={false}
      className={cn(
        "relative sticky top-0 hidden h-screen flex-shrink-0 flex-col md:flex",
        "bg-white/80 backdrop-blur-xl dark:bg-slate-900/80",
        "border-r border-blue-900/8 dark:border-white/5",
        "shadow-[1px_0_0_0_rgba(29,78,216,0.04)]"
      )}
    >
      {/* subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/40 via-transparent to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10" />

      <div className="relative z-10 flex-1 overflow-hidden">
        <motion.div animate={collapsed ? "collapsed" : "expanded"}>
          <SidebarBody collapsed={collapsed} />
        </motion.div>
      </div>

      {/* collapse toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-20 -right-3.5 z-20",
          "flex h-7 w-7 items-center justify-center rounded-full",
          "border border-blue-100 bg-white dark:border-slate-700 dark:bg-slate-800",
          "text-blue-500 shadow-md shadow-blue-900/10",
          "transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
        </motion.div>
      </motion.button>
    </motion.aside>
  )
}

/* ─────────────────────────────────────────────────────────────
   Mobile trigger button (hamburger → X)
───────────────────────────────────────────────────────────── */
function MobileTrigger({ open }: { open: boolean }) {
  return (
    <motion.div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl",
        "bg-white/90 backdrop-blur-sm dark:bg-slate-800/90",
        "border border-blue-100 shadow-sm dark:border-slate-700"
      )}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="x"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <X size={18} className="text-blue-700 dark:text-blue-300" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Menu size={18} className="text-blue-700 dark:text-blue-300" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Mobile Sheet Sidebar
───────────────────────────────────────────────────────────── */
function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none md:hidden"
          aria-label="Open navigation menu"
        >
          <MobileTrigger open={open} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className={cn(
          "w-[280px] border-r-0 p-0",
          "bg-white/95 backdrop-blur-2xl dark:bg-slate-900/95",
          "border-r border-blue-900/8 dark:border-white/5",
          "[&>button]:hidden" /* hide default close X from Sheet */
        )}
      >
        {/* subtle gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-indigo-50/30 dark:from-blue-950/20 dark:to-transparent" />
        <div className="relative z-10 h-full">
          <SidebarBody onNavClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ─────────────────────────────────────────────────────────────
   Mobile Top Bar (shows on mobile only, contains hamburger)
───────────────────────────────────────────────────────────── */
export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-blue-900/8 bg-white/80 px-4 py-3 backdrop-blur-xl md:hidden dark:border-white/5 dark:bg-slate-900/80">
      <MobileSidebar />
      <div className="flex flex-1 items-center gap-2.5">
        <img
          src="/images/logo.png"
          alt="Ministry logo"
          className="h-8 w-8 rounded-lg object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = "none"
          }}
        />
        <div>
          <p
            className="text-[12px] leading-tight font-black text-blue-900 dark:text-blue-100"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Repentance & Holiness
          </p>
          <p className="text-[10px] leading-tight font-semibold text-blue-500">
            Ministry
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
        >
          <Sparkles size={15} />
        </motion.button>
      </div>
    </header>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main export — drop into your layout like:
   
   <div className="flex min-h-screen">
     <AppSidebar />
     <main>
       <MobileTopBar />
       {children}
     </main>
   </div>
───────────────────────────────────────────────────────────── */
export function AppSidebar() {
  return <DesktopSidebar />
}

/* ─────────────────────────────────────────────────────────────
   Preview wrapper (remove in production)
───────────────────────────────────────────────────────────── */
export default function Preview() {
  return (
    <div
      className="flex min-h-screen bg-slate-50 dark:bg-slate-950"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <MobileTopBar />
        <main className="flex-1 p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1
              className="mb-1 text-2xl font-black text-slate-800 dark:text-slate-100"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Welcome Back
            </h1>
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
              Repentance & Holiness Ministry — Dashboard
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: "Jesus Is Lord Radio",
                  sub: "12,347 live listeners",
                  icon: RadioTower,
                  color: "from-blue-600 to-indigo-700",
                  badge: "LIVE",
                },
                {
                  label: "New Prophecy Posted",
                  sub: "Prophet Samuel · Mar 20",
                  icon: Flame,
                  color: "from-blue-700 to-blue-900",
                },
                {
                  label: "Latest Teaching",
                  sub: "Pastor Grace · 55 min",
                  icon: BookOpenText,
                  color: "from-indigo-600 to-blue-700",
                },
              ].map(({ label, sub, icon: Icon, color, badge }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} cursor-pointer p-5 text-white shadow-lg`}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='18' y='2' width='4' height='36' fill='white'/%3E%3Crect x='4' y='12' width='32' height='4' fill='white'/%3E%3C/svg%3E")`,
                      backgroundSize: "40px 40px",
                    }}
                  />
                  <div className="relative z-10">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <Icon size={20} />
                      </div>
                      {badge && (
                        <span className="flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/20 px-2 py-0.5 text-[10px] font-extrabold text-red-300">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />{" "}
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="mb-0.5 text-sm leading-snug font-bold">
                      {label}
                    </p>
                    <p className="text-xs text-white/60">{sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
