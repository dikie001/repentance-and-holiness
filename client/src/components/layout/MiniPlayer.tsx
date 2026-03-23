/**
 * Persistent mini radio player
 * Appears when radio has been started; floats just above the mobile bottom nav.
 */
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Loader2, VolumeX, Volume2, X } from "lucide-react"
import { useRadio } from "@/context/RadioContext"
import { useState } from "react"

export function MiniPlayer() {
  const { playing, loading, togglePlay, muted, setMuted, volume, setVolume, error } = useRadio()
  const [dismissed, setDismissed] = useState(false)

  // Show once radio has been interacted with (playing or loading or error)
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
            className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/8 px-4 py-3 shadow-2xl"
            style={{ background: "linear-gradient(135deg,#060614 0%,#0a0a1e 60%,#0d1240 100%)" }}
          >
            {/* Glow */}
            <div className="pointer-events-none absolute -top-6 left-1/2 h-20 w-24 -translate-x-1/2 rounded-full"
              style={{ background: "radial-gradient(circle,rgba(0,140,255,.18) 0%,transparent 70%)" }} />

            {/* Cover art */}
            <div className="relative z-10 h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/10">
              <img src="/images/radio-logo.png" alt="Radio"
                className="h-full w-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).src = "https://static-media.streema.com/media/cache/b8/70/b870ab4505ebd20d76984a8ea8025007.jpg" }} />
            </div>

            {/* Info */}
            <div className="relative z-10 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black tracking-widest text-red-400 uppercase">Live</span>
              </div>
              <Link to="/jesus-is-lord-radio" className="block truncate text-xs font-bold text-white leading-tight">
                Jesus Is Lord Radio
              </Link>
            </div>

            {/* Volume mute */}
            <button
              onClick={() => setMuted(!muted)}
              className="relative z-10 text-slate-500 hover:text-white transition-colors"
            >
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={loading}
              className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 transition-transform active:scale-90 disabled:opacity-60"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin text-white" />
                : playing
                  ? <Pause size={16} className="text-white" />
                  : <Play size={16} className="ml-0.5 text-white" />
              }
            </button>

            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="relative z-10 text-slate-600 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
