/**
 * Repentance & Holiness Ministry — Homepage
 * Stack: React + TypeScript + Tailwind CSS + Framer Motion + shadcn/ui
 *
 * Install deps (if not already present):
 *   npm install framer-motion lucide-react
 *   npx shadcn@latest add badge button card scroll-area
 *
 * Fonts — add to your index.html <head>:
 *   <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
 *
 * Tailwind config — add to tailwind.config.ts fontFamily:
 *   cinzel: ['Cinzel', 'serif'],
 *   lato:   ['Lato', 'sans-serif'],
 */

import { motion, useScroll, useTransform } from "framer-motion"
import {
    ArrowRight,
    Bell,
    Bookmark,
    BookOpen,
    ChevronRight,
    Flame,
    Globe,
    Headphones,
    Heart,
    ImageIcon,
    Music2,
    Pause,
    Play,
    Radio,
    Share2,
    SkipBack,
    SkipForward,
    Star,
    TrendingUp,
    Video,
    Volume2,
    VolumeX
} from "lucide-react"
import { useState } from "react"


const MEDIA_CATEGORIES = [
  {
    id: "songs",
    label: "Songs",
    icon: Music2,
    count: "2,400+",
    gradient: "from-blue-600 to-blue-800",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    desc: "Worship & Praise",
  },
  {
    id: "videos",
    label: "Videos",
    icon: Video,
    count: "1,800+",
    gradient: "from-sky-500 to-cyan-700",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    desc: "Ministry Films",
  },
  {
    id: "teachings",
    label: "Teachings",
    icon: BookOpen,
    count: "3,200+",
    gradient: "from-indigo-600 to-blue-700",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    desc: "Word of God",
  },
  {
    id: "prophecies",
    label: "Prophecies",
    icon: Flame,
    count: "960+",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    desc: "Prophetic Word",
  },
  {
    id: "pictures",
    label: "Gallery",
    icon: ImageIcon,
    count: "5,100+",
    gradient: "from-slate-600 to-blue-700",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    desc: "Photo Gallery",
  },
]

const FEATURED = [
  {
    title: "The Power of Repentance",
    type: "Teaching",
    pastor: "Pastor Emmanuel",
    duration: "1:12:44",
    icon: BookOpen,
    hot: true,
    date: "Mar 20, 2026",
  },
  {
    title: "Holy Spirit Come Down",
    type: "Song",
    pastor: "Choir Ministry",
    duration: "5:34",
    icon: Music2,
    hot: false,
    date: "Mar 18, 2026",
  },
  {
    title: "Vision of the End Times",
    type: "Prophecy",
    pastor: "Prophet Samuel",
    duration: "38:21",
    icon: Flame,
    hot: true,
    date: "Mar 17, 2026",
  },
  {
    title: "Walking in Holiness",
    type: "Teaching",
    pastor: "Pastor Grace",
    duration: "55:10",
    icon: BookOpen,
    hot: false,
    date: "Mar 15, 2026",
  },
  {
    title: "Revival Fire Crusade",
    type: "Video",
    pastor: "Ministry Team",
    duration: "2:04:15",
    icon: Video,
    hot: true,
    date: "Mar 12, 2026",
  },
  {
    title: "Abide in Me – Worship",
    type: "Song",
    pastor: "Worship Team",
    duration: "7:02",
    icon: Music2,
    hot: false,
    date: "Mar 10, 2026",
  },
]

const PROPHECIES = [
  {
    text: "The Lord says: 'I am calling My people to a deeper place of consecration and separation from the world. The hour of My return draws near.'",
    prophet: "Prophet Samuel",
    date: "Mar 20, 2026",
  },
  {
    text: "'A great outpouring is coming to East Africa. Prepare your hearts with fasting and prayer. I will pour out My Spirit on all flesh.'",
    prophet: "Prophetess Ruth",
    date: "Mar 18, 2026",
  },
  {
    text: "'Do not be afraid of the shaking — I am purifying My Bride. Those who endure to the end shall be saved,' says the Lord of Hosts.",
    prophet: "Prophet David",
    date: "Mar 15, 2026",
  },
]

const STATS = [
  { label: "Souls Reached", value: "500K+", icon: Globe },
  { label: "Media Files", value: "13K+", icon: Headphones },
  { label: "Live Listeners", value: "12K", icon: Radio },
  { label: "Prophecies", value: "960+", icon: Flame },
]

/* ─── Equalizer Bars ─────────────────────────────────────── */
function EqBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex h-5 items-end gap-[2px]">
      {[1, 2, 3, 4, 3].map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-blue-400"
          animate={
            playing
              ? { height: ["30%", `${h * 20}%`, "30%"], opacity: [0.7, 1, 0.7] }
              : { height: "30%", opacity: 0.4 }
          }
          transition={
            playing
              ? {
                  duration: 0.5 + i * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }
              : {}
          }
          style={{ minHeight: 4 }}
        />
      ))}
    </div>
  )
}

/* ─── Radio Player Card ───────────────────────────────────── */
function RadioPlayerCard() {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [liked, setLiked] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl shadow-2xl"
      style={{
        background:
          "linear-gradient(145deg, #0f2167 0%, #1e3a8a 40%, #1d4ed8 80%, #2563eb 100%)",
      }}
    >
      {/* cross watermark */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect x='35' y='5' width='10' height='70' fill='white'/%3E%3Crect x='10' y='25' width='60' height='10' fill='white'/%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* glow orb */}
      <motion.div
        className="absolute -top-10 -right-10 h-48 w-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.25) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 p-5 md:p-7">
        {/* header row */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-2.5 w-2.5 rounded-full bg-red-400"
              animate={playing ? { opacity: [1, 0.3, 1] } : { opacity: 0.4 }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-xs font-bold tracking-widest text-blue-200 uppercase">
              {playing ? "Live Now" : "Jesus Is Lord Radio"}
            </span>
          </div>
          <EqBars playing={playing} />
        </div>

        {/* station info */}
        <div className="mb-6">
          <motion.h2
            className="mb-1 text-2xl leading-tight font-black text-white md:text-3xl"
            style={{ fontFamily: "'Cinzel', serif" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Jesus Is Lord Radio
          </motion.h2>
          <p className="text-sm font-medium text-blue-300">
            Broadcasting the Gospel 24 / 7 · Worldwide
          </p>
          <p className="mt-1 text-xs text-blue-200/70">
            Now Playing:{" "}
            <span className="font-semibold text-white">
              Evening Worship Service
            </span>
          </p>
        </div>

        {/* progress */}
        <div className="mb-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #60a5fa, #a5b4fc)" }}
              animate={playing ? { width: ["35%", "38%"] } : { width: "35%" }}
              transition={
                playing
                  ? { duration: 10, repeat: Infinity, ease: "linear" }
                  : {}
              }
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-blue-300/70">
            <span>LIVE</span>
            <span>12,347 listeners</span>
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLiked(!liked)}
              className="text-blue-300 transition-colors hover:text-white"
            >
              <Heart
                size={20}
                fill={liked ? "currentColor" : "none"}
                className={liked ? "text-red-400" : ""}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="text-blue-300 transition-colors hover:text-white"
            >
              <Share2 size={20} />
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.88 }}
              className="text-blue-300 transition-colors hover:text-white"
            >
              <SkipBack size={22} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setPlaying(!playing)}
              className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
              style={{
                background: "linear-gradient(135deg, #ffffff, #dbeafe)",
              }}
            >
              {playing && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/50"
                  animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {playing ? (
                <Pause size={22} className="text-blue-800" />
              ) : (
                <Play size={22} className="ml-0.5 text-blue-800" />
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.88 }}
              className="text-blue-300 transition-colors hover:text-white"
            >
              <SkipForward size={22} />
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMuted(!muted)}
            className="text-blue-300 transition-colors hover:text-white"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Media Category Card ─────────────────────────────────── */
function MediaCategoryCard({
  cat,
  index,
}: {
  cat: (typeof MEDIA_CATEGORIES)[0]
  index: number
}) {
  const Icon = cat.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.07,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden rounded-2xl border ${cat.border} ${cat.bg} group cursor-pointer p-4`}
    >
      <div
        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${cat.gradient} mb-3 flex items-center justify-center shadow-md`}
      >
        <Icon size={18} className="text-white" />
      </div>
      <p className={`text-sm font-bold ${cat.text}`}>{cat.label}</p>
      <p className="mb-1 text-xs text-slate-400">{cat.desc}</p>
      <p className={`text-lg font-black ${cat.text}`}>{cat.count}</p>

      <motion.div
        className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100"
        initial={{ x: 6 }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <ArrowRight size={16} className={cat.text} />
      </motion.div>
    </motion.div>
  )
}

/* ─── Featured Content Card ──────────────────────────────── */
function FeaturedCard({
  item,
  index,
}: {
  item: (typeof FEATURED)[0]
  index: number
}) {
  const Icon = item.icon
  const [saved, setSaved] = useState(false)

  const typeColor: Record<string, string> = {
    Teaching: "bg-indigo-100 text-indigo-700",
    Song: "bg-blue-100 text-blue-700",
    Prophecy: "bg-amber-100 text-amber-700",
    Video: "bg-sky-100 text-sky-700",
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: "easeOut" }}
      whileHover={{ x: 4 }}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative flex-shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow">
          <Icon size={18} className="text-white" />
        </div>
        {item.hot && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
            <TrendingUp size={8} className="text-white" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {item.title}
        </p>
        <p className="truncate text-xs text-slate-400">{item.pastor}</p>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${typeColor[item.type] ?? "bg-slate-100 text-slate-600"}`}
        >
          {item.type}
        </span>
        <span className="text-[10px] text-slate-400">{item.duration}</span>
      </div>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation()
          setSaved(!saved)
        }}
        className="ml-1 flex-shrink-0 text-slate-300 transition-colors hover:text-blue-600"
      >
        <Bookmark
          size={15}
          fill={saved ? "currentColor" : "none"}
          className={saved ? "text-blue-600" : ""}
        />
      </motion.button>
    </motion.div>
  )
}

/* ─── Prophecy Card ──────────────────────────────────────── */
function ProphecyCard({
  p,
  index,
}: {
  p: (typeof PROPHECIES)[0]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl p-5 text-white"
      style={{
        background: "linear-gradient(145deg, #0f2167, #1e3a8a, #1d4ed8)",
      }}
    >
      <div
        className="pointer-events-none absolute top-0 right-0 h-24 w-24 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect x='42' y='8' width='12' height='80' fill='white'/%3E%3Crect x='16' y='32' width='64' height='12' fill='white'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="mb-3 flex items-start gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Flame size={14} className="text-amber-300" />
        </div>
        <div>
          <p className="text-xs font-bold text-blue-300">{p.prophet}</p>
          <p className="text-[10px] text-blue-400/60">{p.date}</p>
        </div>
      </div>
      <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-blue-50 italic">
        {p.text}
      </p>
      <button className="flex items-center gap-1 text-xs font-semibold text-blue-300 transition-colors hover:text-white">
        Read full word <ChevronRight size={12} />
      </button>
    </motion.div>
  )
}

/* ─── Stats Row ──────────────────────────────────────────── */
function StatsRow() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {STATS.map(({ label, value, icon: Icon }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm"
        >
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
            <Icon size={16} className="text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-900">{value}</p>
          <p className="mt-0.5 text-xs text-slate-400">{label}</p>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Section Header ─────────────────────────────────────── */
function SectionHeader({
  title,
  subtitle,
  icon,
  link,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  link?: string
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <div className="mb-0.5 flex items-center gap-1.5">
          {icon && <span className="text-blue-600">{icon}</span>}
          <h2 className="text-base font-black text-slate-800">{title}</h2>
        </div>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {link && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-0.5 text-xs font-bold text-blue-600 transition-colors hover:text-blue-800"
        >
          {link} <ChevronRight size={12} />
        </motion.button>
      )}
    </div>
  )
}

/* ─── Home Page Content ───────────────────────────────────── */
function HomeContent() {
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0.6])

  return (
    <div className="space-y-7 pb-28 md:pb-10">
      {/* Hero Banner */}
      <motion.div style={{ opacity: heroOpacity }}>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl p-6 text-white md:p-8"
          style={{
            background:
              "linear-gradient(145deg, #0a1650 0%, #0f2167 30%, #1e40af 70%, #2563eb 100%)",
          }}
        >
          {/* cross tile */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect x='27' y='4' width='6' height='52' fill='white'/%3E%3Crect x='8' y='18' width='44' height='6' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* glow */}
          <motion.div
            className="pointer-events-none absolute -right-8 -bottom-8 h-52 w-52 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-1 text-xs font-bold tracking-widest text-blue-300 uppercase"
            >
              ✝ Welcome
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-3 text-3xl leading-tight font-black md:text-4xl"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Repentance &<br />
              <span className="text-blue-300">Holiness</span> Ministry
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4 max-w-md text-sm leading-relaxed text-blue-200"
            >
              Drawing souls to Jesus Christ through worship, teaching, and
              prophetic ministry.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-800 shadow"
              >
                <Radio size={14} /> Tune In Live
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
              >
                <BookOpen size={14} /> Latest Teaching
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Radio Player */}
      <section>
        <SectionHeader
          title="Jesus Is Lord Radio"
          subtitle="Broadcasting 24 / 7 Worldwide"
          icon={<Radio size={16} />}
        />
        <RadioPlayerCard />
      </section>

      {/* Stats */}
      <section>
        <SectionHeader
          title="Ministry Reach"
          subtitle="Lives touched by the Gospel"
          icon={<Globe size={16} />}
        />
        <StatsRow />
      </section>

      {/* Media Categories */}
      <section>
        <SectionHeader
          title="Explore Media"
          subtitle="Thousands of Spirit-filled resources"
          icon={<Headphones size={16} />}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {MEDIA_CATEGORIES.map((cat, i) => (
            <MediaCategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section>
        <SectionHeader
          title="Featured Content"
          subtitle="Curated by the ministry team"
          icon={<Star size={16} />}
          link="See all"
        />
        <div className="space-y-2">
          {FEATURED.map((item, i) => (
            <FeaturedCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* Prophecies */}
      <section>
        <SectionHeader
          title="Recent Prophecies"
          subtitle="Words from the Spirit"
          icon={<Flame size={16} />}
          link="View all"
        />
        <div className="grid gap-3 md:grid-cols-3">
          {PROPHECIES.map((p, i) => (
            <ProphecyCard key={i} p={p} index={i} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl p-6 text-center"
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #1d4ed8, #4338ca)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='18' y='2' width='4' height='36' fill='white'/%3E%3Crect x='4' y='12' width='32' height='4' fill='white'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-2 text-xs font-bold tracking-widest text-blue-200 uppercase">
            Get Notified
          </p>
          <h3
            className="mb-2 text-xl font-black text-white"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Never Miss a Word
          </h3>
          <p className="mb-4 text-sm text-blue-200">
            Receive live alerts for new prophecies, teachings, and radio
            schedules.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-blue-800 shadow-lg"
          >
            <Bell size={14} /> Enable Notifications
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}


/* ─── Mobile Bottom Nav ───────────────────────────────────── */
// function BottomNav({
//   active,
//   setActive,
// }: {
//   active: NavItem
//   setActive: (n: NavItem) => void
// }) {
//   return (
//     <div className="fixed right-0 bottom-0 left-0 z-50 md:hidden">
//       <div className="border-t border-slate-100 bg-white/95 px-2 pt-2 pb-3 backdrop-blur-lg">
//         <div className="flex justify-around">
//           {NAV_ITEMS.map(({ id, label, icon }) => (
//             <motion.button
//               key={id}
//               whileTap={{ scale: 0.88 }}
//               onClick={() => setActive(id)}
//               className="relative flex flex-col items-center gap-1 px-3 py-1"
//             >
//               {active === id && (
//                 <motion.div
//                   layoutId="navIndicator"
//                   className="absolute -top-1.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-blue-600"
//                 />
//               )}
//               <motion.div
//                 animate={
//                   active === id
//                     ? { color: "#1d4ed8", scale: 1.1 }
//                     : { color: "#94a3b8", scale: 1 }
//                 }
//                 transition={{ type: "spring", stiffness: 400, damping: 20 }}
//               >
//                 {icon}
//               </motion.div>
//               <span
//                 className={`text-[10px] font-semibold ${active === id ? "text-blue-700" : "text-slate-400"}`}
//               >
//                 {label}
//               </span>
//             </motion.button>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

/* ─── App Shell ───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        <HomeContent />
      </div>
    </div>
  )
}
