import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Music2, Video, BookOpen, ImageIcon, Plus, Upload, X, Play,
  Search, Filter, Download, Heart, Share2, MoreVertical, Clock, Eye
} from "lucide-react"

const TABS = [
  { id: "songs", label: "Songs", icon: Music2 },
  { id: "videos", label: "Videos", icon: Video },
  { id: "teachings", label: "Teachings", icon: BookOpen },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
]

const SONGS = [
  { title: "Holy Spirit Come Down", artist: "Choir Ministry", duration: "5:34", plays: "12.4K", date: "Mar 18, 2026" },
  { title: "Abide in Me – Worship", artist: "Worship Team", duration: "7:02", plays: "8.1K", date: "Mar 10, 2026" },
  { title: "You Are Lord", artist: "Praise Team", duration: "4:21", plays: "6.3K", date: "Mar 5, 2026" },
  { title: "Hallelujah Chorus", artist: "Full Choir", duration: "6:47", plays: "15.2K", date: "Feb 28, 2026" },
  { title: "Amazing Grace Medley", artist: "Worship Team", duration: "8:15", plays: "9.7K", date: "Feb 20, 2026" },
  { title: "Come Holy Fire", artist: "Youth Choir", duration: "5:08", plays: "4.9K", date: "Feb 15, 2026" },
]

const VIDEOS = [
  { title: "Revival Fire Crusade 2026", speaker: "Ministry Team", duration: "2:04:15", views: "45.2K", date: "Mar 12, 2026" },
  { title: "Sunday Service – March 17", speaker: "Pastor Emmanuel", duration: "1:32:44", views: "22.1K", date: "Mar 17, 2026" },
  { title: "Healing & Deliverance Night", speaker: "Prophet Samuel", duration: "1:58:30", views: "31.8K", date: "Mar 8, 2026" },
  { title: "Youth Conference Highlights", speaker: "Youth Ministry", duration: "48:21", views: "17.3K", date: "Feb 25, 2026" },
  { title: "Miracle Prayer Service", speaker: "Pastor Grace", duration: "1:15:10", views: "28.6K", date: "Feb 18, 2026" },
]

const TEACHINGS = [
  { title: "The Power of Repentance", speaker: "Pastor Emmanuel", duration: "1:12:44", views: "18.3K", date: "Mar 20, 2026" },
  { title: "Walking in Holiness", speaker: "Pastor Grace", duration: "55:10", views: "12.7K", date: "Mar 15, 2026" },
  { title: "The Blood of Jesus", speaker: "Pastor Emmanuel", duration: "1:05:22", views: "22.4K", date: "Mar 10, 2026" },
  { title: "Faith That Moves Mountains", speaker: "Pastor John", duration: "48:33", views: "9.6K", date: "Mar 5, 2026" },
  { title: "Prayer and Fasting", speaker: "Pastor Grace", duration: "1:18:05", views: "15.1K", date: "Feb 28, 2026" },
  { title: "End Times Revelation", speaker: "Prophet Samuel", duration: "1:45:20", views: "31.2K", date: "Feb 22, 2026" },
]

const GALLERY_ITEMS = [
  { title: "Revival Night 2026", date: "Mar 2026", count: 48 },
  { title: "Youth Conference", date: "Feb 2026", count: 32 },
  { title: "Crusade Nakuru", date: "Feb 2026", count: 67 },
  { title: "Sunday Service", date: "Mar 2026", count: 24 },
  { title: "Prayer Mountain", date: "Jan 2026", count: 19 },
  { title: "Christmas Service", date: "Dec 2025", count: 55 },
]

// Gradient colors for gallery
const GALLERY_GRADS = [
  "from-blue-900 to-indigo-900",
  "from-indigo-900 to-slate-900",
  "from-slate-900 to-blue-900",
  "from-cyan-900 to-blue-900",
  "from-blue-900 to-cyan-900",
  "from-indigo-900 to-blue-900",
]

interface UploadModalProps {
  tab: string
  onClose: () => void
}

function UploadModal({ tab, onClose }: UploadModalProps) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const accept: Record<string, string> = {
    songs: "audio/*",
    videos: "video/*",
    teachings: "audio/*,video/*",
    gallery: "image/*",
  }

  const handleFile = (file: File) => setFileName(file.name)

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-lg p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-lg rounded-3xl border border-white/8 bg-[#0d0d1a] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Add New {tab.charAt(0).toUpperCase() + tab.slice(1, -1)}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          className={`mb-4 flex flex-col items-center justify-center gap-3 cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all ${dragging ? "border-cyan-400 bg-cyan-400/5" : "border-white/10 hover:border-white/20 bg-white/2"}`}
        >
          <input ref={fileRef} type="file" accept={accept[tab]} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500">
            <Upload size={22} className="text-white" />
          </div>
          {fileName ? (
            <p className="text-sm font-semibold text-cyan-400">{fileName}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-300">Drop file here or click to browse</p>
              <p className="text-xs text-slate-600">{tab === "gallery" ? "Images: JPG, PNG, WebP" : "Audio/Video: MP3, MP4, WebM"}</p>
            </>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-3 mb-5">
          <input
            type="text"
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/8 bg-white/4 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!fileName || !title}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Upload
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

function SongCard({ s, i }: { s: (typeof SONGS)[0]; i: number }) {
  const [liked, setLiked] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/3 p-3 hover:bg-white/5 transition-colors"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
        <Music2 size={16} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{s.title}</p>
        <p className="text-[11px] text-slate-500">{s.artist}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[10px] text-slate-500">{s.plays} plays</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-600"><Clock size={9} />{s.duration}</span>
      </div>
      <div className="flex gap-1.5 ml-1">
        <button onClick={() => setLiked(!liked)} className={`p-1.5 rounded-lg transition-colors ${liked ? "text-red-400" : "text-slate-600 hover:text-white"}`}>
          <Heart size={13} fill={liked ? "currentColor" : "none"} />
        </button>
        <button className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-400 transition-colors">
          <Play size={13} />
        </button>
        <button className="p-1.5 rounded-lg text-slate-600 hover:text-white transition-colors">
          <MoreVertical size={13} />
        </button>
      </div>
    </motion.div>
  )
}

function VideoCard({ v, i }: { v: (typeof VIDEOS)[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden"
    >
      <div className="relative aspect-video bg-gradient-to-br from-blue-900/40 to-indigo-900/40 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur">
          <Play size={20} className="text-white ml-0.5" />
        </div>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{v.duration}</span>
      </div>
      <div className="p-3">
        <p className="mb-1 text-sm font-semibold text-white leading-snug">{v.title}</p>
        <p className="text-[11px] text-slate-500">{v.speaker}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-slate-600"><Eye size={9} />{v.views}</span>
          <div className="flex gap-2">
            <button className="text-slate-600 hover:text-white transition-colors"><Share2 size={13} /></button>
            <button className="text-slate-600 hover:text-cyan-400 transition-colors"><Download size={13} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TeachingCard({ t, i }: { t: (typeof TEACHINGS)[0]; i: number }) {
  const [liked, setLiked] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/3 p-3 hover:bg-white/5 transition-colors"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700">
        <BookOpen size={16} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{t.title}</p>
        <p className="text-[11px] text-slate-500">{t.speaker}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-1 text-[10px] text-slate-500"><Eye size={9} />{t.views}</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-600"><Clock size={9} />{t.duration}</span>
      </div>
      <div className="flex gap-1.5 ml-1">
        <button onClick={() => setLiked(!liked)} className={`p-1.5 rounded-lg transition-colors ${liked ? "text-red-400" : "text-slate-600 hover:text-white"}`}>
          <Heart size={13} fill={liked ? "currentColor" : "none"} />
        </button>
        <button className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-400 transition-colors">
          <Play size={13} />
        </button>
      </div>
    </motion.div>
  )
}

function GalleryCard({ g, i }: { g: (typeof GALLERY_ITEMS)[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.06 }}
      whileHover={{ scale: 1.02 }}
      className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${GALLERY_GRADS[i % GALLERY_GRADS.length]} cursor-pointer border border-white/5`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <ImageIcon size={28} className="text-white/30" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent flex flex-col justify-end p-3">
        <p className="text-xs font-bold text-white">{g.title}</p>
        <p className="text-[10px] text-slate-400">{g.count} photos · {g.date}</p>
      </div>
    </motion.div>
  )
}

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState("songs")
  const [search, setSearch] = useState("")
  const [showUpload, setShowUpload] = useState(false)

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap" rel="stylesheet" />

      <AnimatePresence>
        {showUpload && <UploadModal tab={activeTab} onClose={() => setShowUpload(false)} />}
      </AnimatePresence>

      <div className="space-y-5 pb-28 md:pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Media Library</h1>
            <p className="text-xs text-slate-500">13,000+ spirit-filled resources</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} /> Add Media
          </motion.button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-colors"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-slate-400 hover:text-white transition-colors">
            <Filter size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.97 }}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                  : "border border-white/8 bg-white/3 text-slate-400 hover:text-white"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "songs" && (
            <motion.div key="songs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {SONGS.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase())).map((s, i) => (
                <SongCard key={s.title} s={s} i={i} />
              ))}
            </motion.div>
          )}
          {activeTab === "videos" && (
            <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {VIDEOS.filter(v => !search || v.title.toLowerCase().includes(search.toLowerCase())).map((v, i) => (
                <VideoCard key={v.title} v={v} i={i} />
              ))}
            </motion.div>
          )}
          {activeTab === "teachings" && (
            <motion.div key="teachings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {TEACHINGS.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase())).map((t, i) => (
                <TeachingCard key={t.title} t={t} i={i} />
              ))}
            </motion.div>
          )}
          {activeTab === "gallery" && (
            <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {GALLERY_ITEMS.filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase())).map((g, i) => (
                  <GalleryCard key={g.title} g={g} i={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
