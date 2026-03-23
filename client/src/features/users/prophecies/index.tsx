import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, ChevronRight, ChevronDown, Search, Share2, Bookmark, Heart, Filter } from "lucide-react"

const PROPHECIES = [
  {
    id: 1,
    prophet: "Prophet Samuel",
    date: "Mar 20, 2026",
    title: "A Call to Consecration",
    text: "The Lord says: 'I am calling My people to a deeper place of consecration and separation from the world. The hour of My return draws near. Prepare your hearts as a Bride preparing herself for the Bridegroom. Do not love the world, nor the things in the world. Those who are pure in heart shall see Me.'",
    tags: ["End Times", "Holiness"],
  },
  {
    id: 2,
    prophet: "Prophetess Ruth",
    date: "Mar 18, 2026",
    title: "East Africa Outpouring",
    text: "'A great outpouring is coming to East Africa. Prepare your hearts with fasting and prayer. I will pour out My Spirit on all flesh — your sons and daughters shall prophesy, your young men shall see visions, and your old men shall dream dreams,' says the Lord God of Israel.",
    tags: ["Revival", "Africa"],
  },
  {
    id: 3,
    prophet: "Prophet David",
    date: "Mar 15, 2026",
    title: "Do Not Fear the Shaking",
    text: "'Do not be afraid of the shaking — I am purifying My Bride. Those who endure to the end shall be saved,' says the Lord of Hosts. 'I am separating the wheat from the tares. Stand firm in My Word and do not be moved. My grace is sufficient for you.'",
    tags: ["Persecution", "Faith"],
  },
  {
    id: 4,
    prophet: "Prophet Emmanuel",
    date: "Mar 12, 2026",
    title: "The Hour of Harvest",
    text: "'The fields are ripe for harvest,' says the Lord. 'Go into all the world and preach the Gospel to every creature. I have opened doors that no man can shut. Step through in faith and obedience. I will confirm My Word with signs and wonders following.'",
    tags: ["Evangelism", "Harvest"],
  },
  {
    id: 5,
    prophet: "Prophetess Grace",
    date: "Mar 10, 2026",
    title: "Return to First Love",
    text: "'I have seen your works, your labor, and your patience — but I have this against you: you have left your first love. Remember therefore from where you have fallen; repent and do the first works. The lamp of your ministry will only shine bright with the oil of intimacy with Me.'",
    tags: ["Love", "Repentance"],
  },
  {
    id: 6,
    prophet: "Prophet Moses",
    date: "Mar 7, 2026",
    title: "Rise Up, Church of God",
    text: "'Arise, shine, for your light has come! The glory of the Lord has risen upon you. Though darkness covers the earth and deep darkness the peoples, the Lord rises upon you and His glory appears over you. Nations shall come to your light, and kings to the brightness of your rising.'",
    tags: ["Glory", "Kingdom"],
  },
]

const TAGS = ["All", "End Times", "Revival", "Africa", "Holiness", "Faith", "Evangelism", "Love", "Glory"]

export default function PropheciesPage() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState("All")
  const [saved, setSaved] = useState<Set<number>>(new Set())
  const [liked, setLiked] = useState<Set<number>>(new Set())

  const filtered = PROPHECIES.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.prophet.toLowerCase().includes(search.toLowerCase())
    const matchTag = activeTag === "All" || p.tags.includes(activeTag)
    return matchSearch && matchTag
  })

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Barlow:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <div className="space-y-5 pb-28 md:pb-10">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 p-5"
          style={{ background: "linear-gradient(145deg, #060614, #0a0a1e, #0d1535)" }}>
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect x='27' y='4' width='6' height='52' fill='white'/%3E%3Crect x='8' y='18' width='44' height='6' fill='white'/%3E%3C/svg%3E")`, backgroundSize: "60px 60px" }} />
          <div className="relative z-10">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
                <Flame size={16} className="text-amber-400" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">Prophetic Word</span>
            </div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>Prophecies</h1>
            <p className="mt-1 text-xs text-slate-500">960+ words from the Spirit of God</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Search prophecies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/40 transition-colors"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-slate-400 hover:text-white transition-colors">
            <Filter size={16} />
          </button>
        </div>

        {/* Tags */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-black transition-all ${
                activeTag === tag
                  ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/20"
                  : "border border-white/8 bg-white/3 text-slate-400 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Prophecy cards */}
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const isOpen = expanded === p.id
            const isSaved = saved.has(p.id)
            const isLiked = liked.has(p.id)
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="overflow-hidden rounded-2xl border border-white/5"
                style={{ background: "linear-gradient(145deg, #060614, #0a0a1e)" }}
              >
                <button
                  className="w-full p-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Flame size={13} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-amber-300">{p.prophet}</p>
                        <p className="text-[9px] text-slate-600">{p.date}</p>
                      </div>
                    </div>
                    <ChevronDown size={16} className={`text-slate-600 shrink-0 transition-transform mt-0.5 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-white">{p.title}</h3>
                  <p className={`text-xs leading-relaxed text-slate-400 italic ${isOpen ? "" : "line-clamp-2"}`}>{p.text}</p>
                  {!isOpen && (
                    <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                      Read full word <ChevronRight size={11} />
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                        {p.tags.map(tag => (
                          <span key={tag} className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setLiked(s => { const n = new Set(s); isLiked ? n.delete(p.id) : n.add(p.id); return n })}
                            className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${isLiked ? "text-red-400" : "text-slate-600 hover:text-white"}`}
                          >
                            <Heart size={13} fill={isLiked ? "currentColor" : "none"} /> {isLiked ? "Liked" : "Like"}
                          </button>
                          <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-white transition-colors">
                            <Share2 size={13} /> Share
                          </button>
                        </div>
                        <button
                          onClick={() => setSaved(s => { const n = new Set(s); isSaved ? n.delete(p.id) : n.add(p.id); return n })}
                          className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${isSaved ? "text-cyan-400" : "text-slate-600 hover:text-cyan-400"}`}
                        >
                          <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} /> {isSaved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </>
  )
}
