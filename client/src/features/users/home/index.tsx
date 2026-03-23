import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Play, Pause, Loader2, BookOpen, Flame, Music2, Video, ChevronRight,
} from "lucide-react"
import { useRadio } from "@/context/RadioContext"

/* ── Static media feed data ─────────────────────────────────── */
const TRENDING = [
  { id: 1, title: "The Power of Repentance",   type: "Teaching",  speaker: "Pastor Emmanuel", dur: "1:12:44", grad: "from-indigo-700 to-blue-800",  icon: BookOpen },
  { id: 2, title: "Holy Spirit Come Down",      type: "Song",      speaker: "Choir Ministry",  dur: "5:34",    grad: "from-blue-600 to-cyan-700",    icon: Music2   },
  { id: 3, title: "Vision of the End Times",    type: "Prophecy",  speaker: "Prophet Samuel",  dur: "38:21",   grad: "from-blue-800 to-indigo-900",  icon: Flame    },
  { id: 4, title: "Revival Fire Crusade 2026",  type: "Video",     speaker: "Ministry Team",   dur: "2:04:15", grad: "from-cyan-800 to-blue-900",    icon: Video    },
  { id: 5, title: "Walking in Holiness",        type: "Teaching",  speaker: "Pastor Grace",    dur: "55:10",   grad: "from-slate-700 to-indigo-800", icon: BookOpen },
  { id: 6, title: "Healing & Deliverance Night",type: "Video",     speaker: "Ministry Team",   dur: "1:58:30", grad: "from-blue-900 to-indigo-900",  icon: Video    },
]

const RECENT = [
  { id: 1, title: "A Call to Consecration",    type: "Prophecy", speaker: "Prophet Samuel", dur: "Mar 20", grad: "from-indigo-700 to-blue-800",  icon: Flame    },
  { id: 2, title: "Prayer and Fasting",         type: "Teaching", speaker: "Pastor Grace",   dur: "55:10",  grad: "from-blue-700 to-indigo-700",  icon: BookOpen },
  { id: 3, title: "Abide in Me – Worship",      type: "Song",     speaker: "Worship Team",   dur: "7:02",   grad: "from-blue-600 to-cyan-600",    icon: Music2   },
]

const TYPE_BADGE: Record<string, string> = {
  Teaching:  "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  Song:      "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Prophecy:  "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Video:     "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
}

function EqBars({ active }: { active: boolean }) {
  return (
    <div className="flex h-3.5 items-end gap-[2px]">
      {[1, 2, 3, 2, 1].map((h, i) => (
        <motion.div
          key={i}
          className="w-[2.5px] rounded-full bg-red-400"
          animate={active ? { height: [`${h * 20}%`, "100%", `${h * 20}%`] } : { height: "30%" }}
          transition={active ? { duration: 0.6 + i * 0.12, repeat: Infinity, ease: "easeInOut" } : {}}
          style={{ minHeight: 3 }}
        />
      ))}
    </div>
  )
}

/* ── Helpers ────────────────────────────────────────────────── */
const fmt = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

function LiveRadioCard() {
  const { playing, loading, togglePlay, recording, recDuration } = useRadio()

  return (
    <motion.div
      whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.97 }}
      onClick={togglePlay}
      className="relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border px-5 py-4"
      style={{ background: "linear-gradient(135deg,var(--app-card) 0%,var(--app-surface) 100%)", borderColor: "var(--app-border)" }}
    >
      {/* Accent glow — only visible in dark */}
      <div className="pointer-events-none absolute -top-8 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full dark:block hidden"
        style={{ background: "radial-gradient(circle,rgba(0,140,255,.14) 0%,transparent 70%)" }} />

      <div className="relative z-10 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: "var(--app-border)" }}>
          <img src="/images/radio-logo.png" alt="Radio"
            className="h-full w-full object-cover"
            onError={e => { (e.currentTarget as HTMLImageElement).src = "https://static-media.streema.com/media/cache/b8/70/b870ab4505ebd20d76984a8ea8025007.jpg" }} />
        </div>
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-px text-[9px] font-black text-red-400 uppercase">
              <span className={`inline-block h-1.5 w-1.5 rounded-full bg-red-500 ${playing ? "animate-pulse" : ""}`} />
              Live
            </span>
            {recording && (
              <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-px text-[9px] font-black text-rose-400 uppercase">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                REC {fmt(recDuration)}
              </span>
            )}
            <EqBars active={playing} />
          </div>
          <p className="text-sm font-black" style={{ color: "var(--app-text)" }}>Jesus Is Lord Radio</p>
          <p className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>
            {playing ? "Now Playing · 105.9 FM" : "Tap to play · 105.9 FM"}
          </p>
        </div>
      </div>


      <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-lg transition-all
        ${playing ? "bg-white/10 shadow-none" : "bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-500/30"}`}>
        {loading ? <Loader2 size={16} className="animate-spin text-white" />
          : playing ? <Pause size={16} className="text-white" />
            : <Play size={16} className="ml-0.5 text-white" />}
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 pb-28 md:pb-10 p-4">

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black leading-tight" style={{ color: "var(--app-text)" }}>
          Repentance &amp; Holiness
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--app-text-muted)" }}>
          Nakuru, Kenya 
        </p>
      </motion.div>

      {/* Live Radio card */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: "var(--app-text-faint)" }}>
            Live Radio
          </p>
          <Link to="/jesus-is-lord-radio" onClick={e => e.stopPropagation()}
            className="flex items-center gap-0.5 text-[11px] font-bold text-cyan-500 hover:text-cyan-400">
            Full Player <ChevronRight size={11} />
          </Link>
        </div>
        <LiveRadioCard />
      </section>

      {/* Trending — horizontal card scroll */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: "var(--app-text-faint)" }}>
            Trending
          </p>
          <Link to="/media" className="flex items-center gap-0.5 text-[11px] font-bold text-cyan-500 hover:text-cyan-400">
            See all <ChevronRight size={11} />
          </Link>
        </div>
        {/* Horizontal scroll grid 2 rows × 3 cols */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {TRENDING.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="shrink-0 w-44 cursor-pointer rounded-2xl overflow-hidden border"
                style={{ borderColor: "var(--app-border)" }}
              >
                {/* Thumbnail */}
                <div className={`relative h-24 bg-gradient-to-br ${item.grad} flex items-center justify-center`}>
                  <Icon size={28} className="text-white/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur">
                      <Play size={15} className="ml-0.5 text-white" />
                    </div>
                  </div>
                  <span className={`absolute top-2 left-2 rounded-full border px-2 py-0.5 text-[9px] font-black ${TYPE_BADGE[item.type] ?? ""}`}>
                    {item.type}
                  </span>
                  <span className="absolute bottom-1.5 right-2 text-[10px] font-bold text-white/80">{item.dur}</span>
                </div>
                {/* Info */}
                <div className="p-2.5" style={{ background: "var(--app-card)" }}>
                  <p className="text-xs font-bold leading-snug line-clamp-2" style={{ color: "var(--app-text)" }}>{item.title}</p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "var(--app-text-muted)" }}>{item.speaker}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Recently Added — vertical list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: "var(--app-text-faint)" }}>
            Recently Added
          </p>
          <Link to="/teachings" className="flex items-center gap-0.5 text-[11px] font-bold text-cyan-500 hover:text-cyan-400">
            See all <ChevronRight size={11} />
          </Link>
        </div>
        <div className="space-y-2">
          {RECENT.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="flex items-center gap-3 rounded-2xl border p-3 cursor-pointer"
                style={{ background: "var(--app-card)", borderColor: "var(--app-border)" }}
              >
                <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center shadow`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--app-text)" }}>{item.title}</p>
                  <p className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>{item.speaker}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black ${TYPE_BADGE[item.type] ?? ""}`}>
                  {item.type}
                </span>
                <Play size={14} className="shrink-0" style={{ color: "var(--app-text-faint)" }} />
              </motion.div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
