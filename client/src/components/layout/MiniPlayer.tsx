/**
 * Persistent mini radio player — appears when radio is active.
 * Floats above the mobile bottom nav. Theme-aware via CSS vars.
 */
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Loader2, VolumeX, Volume2, X } from "lucide-react"
import { useRadio } from "@/context/RadioContext"
import { useState } from "react"

export function MiniPlayer() {
  const { playing, loading, togglePlay, muted, setMuted, volume, error } = useRadio()
  const [dismissed, setDismissed] = useState(false)

  const visible = !dismissed && (playing || loading || !!error)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 md:bottom-4 left-3 right-3 z-40 md:left-auto md:right-6 md:w-80"
        >
          <div
            className="relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl"
            style={{ background: "var(--app-header-bg)", borderColor: "var(--app-border)" }}
          >
            {/* Dark mode glow only */}
            <div className="dark:block hidden pointer-events-none absolute -top-6 left-1/2 h-20 w-24 -translate-x-1/2 rounded-full"
              style={{ background: "radial-gradient(circle,rgba(0,140,255,.15) 0%,transparent 70%)" }} />

            {/* Logo */}
            <div className="relative z-10 h-9 w-9 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: "var(--app-border)" }}>
              <img src="/images/radio-logo.png" alt="JIL Radio"
                className="h-full w-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).src = "https://static-media.streema.com/media/cache/b8/70/b870ab4505ebd20d76984a8ea8025007.jpg" }} />
            </div>

            {/* Info */}
            <div className="relative z-10 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-px">
                <span className={`h-1.5 w-1.5 rounded-full bg-red-500 ${playing ? "animate-pulse" : ""} inline-block`} />
                <span className="text-[9px] font-black tracking-widest text-red-400 uppercase">Live</span>
              </div>
              <Link to="/jesus-is-lord-radio"
                className="block truncate text-xs font-bold hover:text-cyan-400 transition-colors"
                style={{ color: "var(--app-text)" }}>
                Jesus Is Lord Radio
              </Link>
              <p className="text-[10px]" style={{ color: "var(--app-text-muted)" }}>95.3 · 105.9 FM</p>
            </div>

            {/* Mute */}
            <button onClick={() => setMuted(!muted)}
              className="relative z-10 transition-colors hover:text-cyan-400"
              style={{ color: "var(--app-text-faint)" }}>
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Play/Pause */}
            <button onClick={togglePlay} disabled={loading}
              className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25 transition-transform active:scale-90 disabled:opacity-60">
              {loading
                ? <Loader2 size={16} className="animate-spin text-white" />
                : playing ? <Pause size={16} className="text-white" />
                  : <Play size={16} className="ml-0.5 text-white" />}
            </button>

            {/* Dismiss */}
            <button onClick={() => setDismissed(true)}
              className="relative z-10 transition-colors hover:opacity-80"
              style={{ color: "var(--app-text-faint)" }}>
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
