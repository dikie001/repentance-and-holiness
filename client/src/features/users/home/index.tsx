import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Radio, Music2, BookOpen, Flame, ImageIcon, Globe,
  ChevronRight, Play, Pause, Loader2,
} from "lucide-react"
import { useRadio } from "@/context/RadioContext"

const ACTIONS = [
  { label: "Radio",      icon: Radio,     to: "/jesus-is-lord-radio", grad: "from-blue-600 to-cyan-500",   live: true  },
  { label: "Media",      icon: Music2,    to: "/media",               grad: "from-indigo-600 to-blue-600", live: false },
  { label: "Teachings",  icon: BookOpen,  to: "/teachings",           grad: "from-blue-700 to-indigo-700", live: false },
  { label: "Prophecies", icon: Flame,     to: "/prophecies",          grad: "from-indigo-800 to-blue-800", live: false },
  { label: "Gallery",    icon: ImageIcon, to: "/gallery",             grad: "from-cyan-800 to-blue-800",   live: false },
  { label: "About",      icon: Globe,     to: "/about",               grad: "from-slate-700 to-blue-800",  live: false },
]

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

function LiveRadioCard() {
  const { playing, loading, togglePlay } = useRadio()

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={togglePlay}
      className="relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-white/8 px-5 py-4"
      style={{ background: "linear-gradient(135deg,#060614 0%,#0a0a1e 60%,#0d1240 100%)" }}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute -top-8 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle,rgba(0,140,255,.16) 0%,transparent 70%)" }} />

      <div className="relative z-10 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/8">
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
            <EqBars active={playing} />
          </div>
          <p className="text-sm font-black text-white">Jesus Is Lord Radio</p>
          <p className="text-[11px] text-slate-500">
            {playing ? "Now Playing · 95.3 FM" : "Tap to start · 95.3 FM"}
          </p>
        </div>
      </div>

      <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-lg transition-all
        ${playing ? "bg-white/15 shadow-none" : "bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-500/30"}`}>
        {loading
          ? <Loader2 size={16} className="animate-spin text-white" />
          : playing
            ? <Pause size={16} className="text-white" />
            : <Play size={16} className="ml-0.5 text-white" />}
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 pb-28 md:pb-10">

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[11px] font-black tracking-widest text-cyan-400 uppercase mb-0.5">✝ Welcome</p>
        <h1 className="text-2xl font-black text-white leading-tight">Repentance &amp; Holiness</h1>
        <p className="text-sm text-slate-500 mt-0.5">Nakuru, Kenya · Broadcasting Worldwide</p>
      </motion.div>

      {/* Live Radio Card — tapping starts/stops radio in background */}
      <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-black tracking-widest text-slate-500 uppercase">Live Radio</p>
          <Link to="/jesus-is-lord-radio" onClick={e => e.stopPropagation()}
            className="flex items-center gap-0.5 text-[11px] font-bold text-cyan-400">
            Full Player <ChevronRight size={11} />
          </Link>
        </div>
        <LiveRadioCard />
      </motion.section>

      {/* Quick Actions */}
      <section>
        <p className="mb-3 text-[11px] font-black tracking-widest text-slate-500 uppercase">Quick Access</p>
        <div className="grid grid-cols-3 gap-3">
          {ACTIONS.map((a, i) => (
            <motion.div key={a.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link to={a.to}>
                <motion.div
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
                  className="relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-white/5 bg-white/3 py-5"
                >
                  {a.live && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                  <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${a.grad} flex items-center justify-center shadow-lg`}>
                    <a.icon size={20} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">{a.label}</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-black tracking-widest text-slate-500 uppercase">Recent</p>
          <Link to="/media" className="flex items-center gap-0.5 text-[11px] font-bold text-cyan-400">
            See all <ChevronRight size={11} />
          </Link>
        </div>
        <div className="space-y-2">
          {[
            { icon: BookOpen, label: "The Power of Repentance", sub: "Teaching · 1 h 12 min",    grad: "from-indigo-600 to-blue-700" },
            { icon: Flame,    label: "A Call to Consecration",  sub: "Prophecy · Prophet Samuel", grad: "from-blue-700 to-indigo-800" },
            { icon: Music2,   label: "Holy Spirit Come Down",   sub: "Song · Choir Ministry",     grad: "from-blue-600 to-cyan-500"   },
          ].map((item, i) => (
            <motion.div key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/3 p-3"
            >
              <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center shadow`}>
                <item.icon size={16} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-slate-500">{item.sub}</p>
              </div>
              <Play size={15} className="shrink-0 text-slate-600" />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
