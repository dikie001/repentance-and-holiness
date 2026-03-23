import { useState } from "react"
import { motion } from "framer-motion"
import { createPortal } from "react-dom"
import {
  ImageIcon,
  Search,
  Grid3X3,
  List,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const ALBUMS = [
  {
    id: 1,
    title: "Revival Night 2026",
    date: "Mar 2026",
    count: 48,
    grad: "from-blue-900 to-indigo-900",
  },
  {
    id: 2,
    title: "Youth Conference",
    date: "Feb 2026",
    count: 32,
    grad: "from-indigo-900 to-slate-900",
  },
  {
    id: 3,
    title: "Crusade Nakuru",
    date: "Feb 2026",
    count: 67,
    grad: "from-slate-900 to-blue-900",
  },
  {
    id: 4,
    title: "Sunday Service",
    date: "Mar 2026",
    count: 24,
    grad: "from-cyan-900 to-blue-900",
  },
  {
    id: 5,
    title: "Prayer Mountain",
    date: "Jan 2026",
    count: 19,
    grad: "from-blue-900 to-cyan-900",
  },
  {
    id: 6,
    title: "Christmas Service",
    date: "Dec 2025",
    count: 55,
    grad: "from-indigo-900 to-blue-900",
  },
  {
    id: 7,
    title: "Evangelism Outreach",
    date: "Nov 2025",
    count: 41,
    grad: "from-blue-900 to-slate-800",
  },
  {
    id: 8,
    title: "Baptism Service",
    date: "Oct 2025",
    count: 28,
    grad: "from-slate-800 to-indigo-900",
  },
  {
    id: 9,
    title: "Healing & Deliverance",
    date: "Sep 2025",
    count: 36,
    grad: "from-blue-800 to-indigo-800",
  },
]

// Simulate grid images per album
const COLORS = [
  "#0a1650",
  "#0f2167",
  "#1e3a8a",
  "#1d4ed8",
  "#0055aa",
  "#003988",
  "#0a1f5e",
  "#091640",
  "#0d1a45",
  "#163060",
]

export default function GalleryPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [lightbox, setLightbox] = useState<{
    album: (typeof ALBUMS)[0]
    imgIdx: number
  } | null>(null)
  const [openAlbum, setOpenAlbum] = useState<(typeof ALBUMS)[0] | null>(null)

  const filtered = ALBUMS.filter(
    (a) => !search || a.title.toLowerCase().includes(search.toLowerCase())
  )
  const canPortal = typeof document !== "undefined"

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Barlow:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />

      {/* Album modal */}
      {canPortal &&
        openAlbum &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 p-4 backdrop-blur-xl"
            onClick={(e) => e.target === e.currentTarget && setOpenAlbum(null)}
          >
            <div className="mx-auto max-w-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">
                    {openAlbum.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {openAlbum.count} photos · {openAlbum.date}
                  </p>
                </div>
                <button
                  onClick={() => setOpenAlbum(null)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({
                  length: openAlbum.count > 12 ? 12 : openAlbum.count,
                }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setLightbox({ album: openAlbum, imgIdx: i })}
                    className="aspect-square cursor-pointer overflow-hidden rounded-xl"
                    style={{
                      background: `linear-gradient(145deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 3) % COLORS.length]})`,
                    }}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon size={20} className="text-white/20" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Lightbox */}
      {canPortal &&
        lightbox &&
        createPortal(
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightbox((l) =>
                  l ? { ...l, imgIdx: Math.max(0, l.imgIdx - 1) } : null
                )
              }}
              className="absolute top-1/2 left-4 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft size={20} />
            </button>
            <div
              className="aspect-square w-72 overflow-hidden rounded-2xl"
              style={{
                background: `linear-gradient(145deg, ${COLORS[lightbox.imgIdx % COLORS.length]}, ${COLORS[(lightbox.imgIdx + 3) % COLORS.length]})`,
              }}
            >
              <div className="flex h-full items-center justify-center">
                <ImageIcon size={48} className="text-white/20" />
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightbox((l) =>
                  l && lightbox.album
                    ? {
                        ...l,
                        imgIdx: Math.min(
                          lightbox.album.count - 1,
                          l.imgIdx + 1
                        ),
                      }
                    : null
                )
              }}
              className="absolute top-1/2 right-4 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white"
            >
              <X size={18} />
            </button>
            <p className="absolute bottom-6 text-xs text-slate-400">
              {lightbox.album.title} · {lightbox.imgIdx + 1} /{" "}
              {lightbox.album.count}
            </p>
          </div>,
          document.body
        )}

      <div className="space-y-5 pb-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border p-5"
          style={{
            background: "var(--app-card)",
            borderColor: "var(--app-border)",
          }}
        >
          <div className="relative z-10">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-600/15">
                <ImageIcon size={16} className="text-cyan-400" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                Photo Gallery
              </span>
            </div>
            <h1
              className="text-2xl font-black"
              style={{
                color: "var(--app-text)",
                fontFamily: "'Cinzel', serif",
              }}
            >
              Gallery
            </h1>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--app-text-muted)" }}
            >
              5,100+ ministry photos
            </p>
          </div>
        </motion.div>

        {/* Search + View toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-600"
            />
            <input
              type="text"
              placeholder="Search albums..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pr-4 pl-9 text-sm text-white placeholder-slate-600 transition-colors outline-none focus:border-cyan-500/40"
            />
          </div>
          <button
            onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-slate-400 transition-colors hover:text-white"
          >
            {view === "grid" ? <List size={16} /> : <Grid3X3 size={16} />}
          </button>
        </div>

        {/* Albums */}
        {view === "grid" ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {filtered.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setOpenAlbum(album)}
                className={`relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${album.grad} border border-white/5`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={28} className="text-white/15" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 p-3">
                  <p className="text-xs leading-snug font-black text-white">
                    {album.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {album.count} photos · {album.date}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setOpenAlbum(album)}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/5 bg-white/3 p-3 transition-colors hover:bg-white/5"
              >
                <div
                  className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${album.grad} flex items-center justify-center border border-white/5`}
                >
                  <ImageIcon size={18} className="text-white/30" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{album.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {album.count} photos · {album.date}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
