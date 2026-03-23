/**
 * Persistent mini radio player — appears when radio is active.
 * Floats above the mobile bottom nav. Theme-aware via CSS vars.
 */
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Loader2, VolumeX, Volume2, X, Square } from "lucide-react"
import { useRadio } from "@/context/RadioContext"
import { useState } from "react"

export function MiniPlayer() {
  const {
    playing,
    loading,
    togglePlay,
    muted,
    setMuted,
    volume,
    error,
    recording,
    stopRecording,
    recDuration,
  } = useRadio()
  const [dismissed, setDismissed] = useState(false)

  const visible = !dismissed && (playing || loading || !!error || recording)

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-4 bottom-24 left-4 z-40 md:right-8 md:bottom-6 md:left-auto md:w-80"
        >
          <div
            className="relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl"
            style={{
              background: "var(--app-header-bg)",
              borderColor: "var(--app-border)",
            }}
          >
            {/* Dark mode glow only */}
            <div
              className="pointer-events-none absolute -top-6 left-1/2 hidden h-20 w-24 -translate-x-1/2 rounded-full dark:block"
              style={{
                background:
                  "radial-gradient(circle,rgba(0,140,255,.15) 0%,transparent 70%)",
              }}
            />

            {/* Logo */}
            <div
              className="relative z-10 h-9 w-9 shrink-0 overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--app-border)" }}
            >
              <img
                src="/images/radio-logo.png"
                alt="JIL Radio"
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src =
                    "https://static-media.streema.com/media/cache/b8/70/b870ab4505ebd20d76984a8ea8025007.jpg"
                }}
              />
            </div>

            {/* Info */}
            <div className="relative z-10 min-w-0 flex-1">
              <div className="mb-px flex items-center gap-1.5">
                {playing && (
                  <>
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                    <span className="text-[9px] font-black tracking-widest text-red-400 uppercase">
                      Live
                    </span>
                  </>
                )}
              </div>
              <Link
                to="/jesus-is-lord-radio"
                className="block truncate text-xs font-bold transition-colors hover:text-cyan-400"
                style={{ color: "var(--app-text)" }}
              >
                Jesus Is Lord Radio
              </Link>
              <p
                className="text-[10px]"
                style={{ color: "var(--app-text-muted)" }}
              >
                {recording ? (
                  <span className="flex animate-pulse items-center gap-1 font-bold text-red-500">
                    RECORDING {fmt(recDuration)}
                  </span>
                ) : (
                  "105.3 · 105.9 FM"
                )}
              </p>
            </div>

            {/* Mute */}
            <button
              onClick={() => setMuted(!muted)}
              className="relative z-10 transition-colors hover:text-cyan-400"
              style={{ color: "var(--app-text-faint)" }}
            >
              {muted || volume === 0 ? (
                <VolumeX size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>

            {/* Play/Pause */}
            <div className="relative z-10 flex items-center gap-2">
              {recording && (
                <button
                  onClick={stopRecording}
                  className="grid h-9 w-9 place-items-center rounded-full border border-red-500/20 bg-red-500/10 text-red-500 transition-all hover:bg-red-500/20 active:scale-90"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              )}
              <button
                onClick={togglePlay}
                disabled={loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25 transition-transform active:scale-90 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : playing ? (
                  <Pause size={16} className="text-white" />
                ) : (
                  <Play size={16} className="ml-0.5 text-white" />
                )}
              </button>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="relative z-10 transition-colors hover:opacity-80"
              style={{ color: "var(--app-text-faint)" }}
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
