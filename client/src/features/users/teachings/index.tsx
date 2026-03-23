import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Play, Clock, Eye, Heart, Share2, Bookmark, Search, Filter, ChevronRight } from "lucide-react"

const SERIES = [
  {
    id: 1, title: "Walking in the Spirit", count: 8, speaker: "Pastor Emmanuel",
    desc: "A verse-by-verse study of Galatians 5 on living by the Spirit of God.",
    gradient: "from-blue-900 to-indigo-900",
  },
  {
    id: 2, title: "The Sermon on the Mount", count: 12, speaker: "Pastor Grace",
    desc: "Deep dive into Matthew 5–7: the kingdom ethics of Jesus Christ.",
    gradient: "from-indigo-900 to-slate-900",
  },
  {
    id: 3, title: "Prophets of the Old Testament", count: 10, speaker: "Prophet Samuel",
    desc: "Lives and messages of the major prophets that shaped Israel's faith.",
    gradient: "from-slate-900 to-blue-900",
  },
]

const TEACHINGS = [
  { id: 1, title: "The Power of Repentance", speaker: "Pastor Emmanuel", duration: "1:12:44", views: "18.3K", date: "Mar 20, 2026", series: "Walking in the Spirit" },
  { id: 2, title: "Walking in Holiness", speaker: "Pastor Grace", duration: "55:10", views: "12.7K", date: "Mar 15, 2026", series: "Sermon on the Mount" },
  { id: 3, title: "The Blood of Jesus", speaker: "Pastor Emmanuel", duration: "1:05:22", views: "22.4K", date: "Mar 10, 2026", series: "None" },
  { id: 4, title: "Faith That Moves Mountains", speaker: "Pastor John", duration: "48:33", views: "9.6K", date: "Mar 5, 2026", series: "Sermon on the Mount" },
  { id: 5, title: "Prayer and Fasting", speaker: "Pastor Grace", duration: "1:18:05", views: "15.1K", date: "Feb 28, 2026", series: "Walking in the Spirit" },
  { id: 6, title: "End Times Revelation", speaker: "Prophet Samuel", duration: "1:45:20", views: "31.2K", date: "Feb 22, 2026", series: "Prophets of OT" },
  { id: 7, title: "The Fruit of the Holy Spirit", speaker: "Pastor Grace", duration: "1:02:11", views: "14.4K", date: "Feb 18, 2026", series: "Walking in the Spirit" },
  { id: 8, title: "Kingdom of God", speaker: "Pastor Emmanuel", duration: "58:40", views: "10.9K", date: "Feb 14, 2026", series: "None" },
]

const FILTERS = ["All", "Pastor Emmanuel", "Pastor Grace", "Prophet Samuel", "Pastor John"]

export default function TeachingsPage() {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [saved, setSaved] = useState<Set<number>>(new Set())
  const [liked, setLiked] = useState<Set<number>>(new Set())

  const filtered = TEACHINGS.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.speaker.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === "All" || t.speaker === activeFilter
    return matchSearch && matchFilter
  })

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Barlow:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <div className="space-y-5 pb-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border p-5"
          style={{ background: "var(--app-card)", borderColor: "var(--app-border)" }}
        >
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/20">
              <BookOpen size={16} className="text-indigo-300" />
            </div>
            <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase">Word of God</span>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "var(--app-text)", fontFamily: "'Cinzel', serif" }}>Teachings</h1>
          <p className="mt-1 text-xs" style={{ color: "var(--app-text-muted)" }}>3,200+ messages from the Word of God</p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--app-text-muted)" }} />
            <input
              type="text" placeholder="Search teachings..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm outline-none transition-colors"
              style={{ background: "var(--app-card)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors shadow-sm"
            style={{ background: "var(--app-card)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}>
            <Filter size={16} />
          </button>
        </div>

        {/* Speaker filter */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {FILTERS.map(f => {
            const isActive = activeFilter === f
            return (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-black transition-all border ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20 border-transparent"
                    : ""
                }`}
                style={!isActive ? { background: "var(--app-card)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" } : {}}
              >
                {f}
              </button>
            )
          })}
        </div>

        {/* Series */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black" style={{ color: "var(--app-text)" }}>Teaching Series</h2>
            <button className="flex items-center gap-0.5 text-[11px] font-bold text-cyan-500">
              See all <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {SERIES.map((s, i) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className={`shrink-0 w-64 rounded-2xl bg-gradient-to-br ${s.gradient} shadow-md p-4`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-black text-white mix-blend-overlay">
                    {s.count} parts
                  </span>
                  <Play size={14} className="text-white mix-blend-overlay" />
                </div>
                <h3 className="mb-1 text-[15px] font-black text-white">{s.title}</h3>
                <p className="mb-2 line-clamp-2 text-[11px] leading-relaxed text-white/70 font-medium">{s.desc}</p>
                <p className="text-[10px] font-bold text-white/50">{s.speaker}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* All Teachings */}
        <div>
          <h2 className="mb-3 text-sm font-black" style={{ color: "var(--app-text)" }}>All Teachings</h2>
          <div className="space-y-2">
            {filtered.map((t, i) => {
              const isSaved = saved.has(t.id)
              const isLiked = liked.has(t.id)
              const toggleLike = () => setLiked(s => { const n = new Set(s); if (isLiked) { n.delete(t.id) } else { n.add(t.id) } return n })
              const toggleSave = () => setSaved(s => { const n = new Set(s); if (isSaved) { n.delete(t.id) } else { n.add(t.id) } return n })
              return (
                <motion.div key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-2xl border p-3 transition-colors"
                  style={{ background: "var(--app-card)", borderColor: "var(--app-border)" }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 shadow">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--app-text)" }}>{t.title}</p>
                    <p className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>{t.speaker}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--app-text-muted)" }}><Eye size={9} />{t.views}</span>
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--app-text-faint)" }}><Clock size={9} />{t.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-1">
                    <button onClick={toggleLike}
                      className={`p-1.5 rounded-lg transition-colors ${isLiked ? "text-red-400" : "text-slate-600 hover:text-white"}`}>
                      <Heart size={13} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <button onClick={toggleSave}
                      className={`p-1.5 rounded-lg transition-colors ${isSaved ? "text-cyan-400" : "text-slate-600 hover:text-cyan-400"}`}>
                      <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-400 transition-colors">
                      <Play size={13} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-600 hover:text-white transition-colors">
                      <Share2 size={13} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
