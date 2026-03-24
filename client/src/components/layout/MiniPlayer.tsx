/**
 * Persistent mini radio player — appears when radio is active.
 * Floats above the mobile bottom nav. Theme-aware via CSS vars.
 * Volume slider lives at the bottom of the card.
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
    setVolume,
    volume,
    error,
    recording,
    stopRecording,
    recDuration,
  } = useRadio()
  const [dismissed, setDismissed] = useState(false)

  const visible = !dismissed && (playing || !!error || recording)

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

  const effectiveVolume = muted ? 0 : volume

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="absolute right-3 bottom-3 left-3 z-50 md:right-5 md:bottom-5 md:left-auto md:w-80"
        >
          <div
            className="relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl"
            style={{
              background: "var(--app-header-bg)",
              borderColor: "var(--app-border)",
            }}
          >
            {/* Ambient glow — dark mode only */}
            <div
              className="pointer-events-none absolute -top-8 left-1/2 hidden h-24 w-32 -translate-x-1/2 rounded-full dark:block"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,140,255,.18) 0%, transparent 70%)",
              }}
            />

            {/* ── Top row: logo · info · controls · dismiss ── */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
              {/* Logo */}
              <div
                className="relative z-10 h-10 w-10 shrink-0 overflow-hidden rounded-xl border shadow-inner"
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

              {/* Station info */}
              <div className="relative z-10 min-w-0 flex-1">
                {/* Live badge */}
                <div className="mb-0.5 flex items-center gap-1.5">
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
                  className="block truncate text-xs leading-tight font-bold transition-colors hover:text-cyan-400"
                  style={{ color: "var(--app-text)" }}
                >
                  Jesus Is Lord Radio
                </Link>

                <p
                  className="mt-0.5 text-[10px] leading-none"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {recording ? (
                    <span className="flex animate-pulse items-center gap-1 font-bold text-red-500">
                      ● REC {fmt(recDuration)}
                    </span>
                  ) : (
                    "105.3 · 105.9 FM"
                  )}
                </p>
              </div>

              {/* Stop recording (only when recording) */}
              {recording && (
                <button
                  onClick={stopRecording}
                  className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-red-500/20 bg-red-500/10 text-red-500 transition-all hover:bg-red-500/20 active:scale-90"
                >
                  <Square size={14} fill="currentColor" />
                </button>
              )}

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                disabled={loading}
                className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 transition-transform active:scale-90 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin text-white" />
                ) : playing ? (
                  <Pause size={15} className="text-white" />
                ) : (
                  <Play size={15} className="ml-0.5 text-white" />
                )}
              </button>

              {/* Dismiss */}
              <button
                onClick={() => setDismissed(true)}
                className="relative z-10 -mr-1 grid h-6 w-6 place-items-center rounded-full transition-colors hover:opacity-70"
                style={{ color: "var(--app-text-faint)" }}
              >
                <X size={13} />
              </button>
            </div>

            {/* ── Bottom row: volume strip ── */}
            <div className="flex items-center gap-2.5 px-4 pb-3">
              {/* Mute toggle */}
              <button
                onClick={() => setMuted(!muted)}
                className="relative z-10 shrink-0 transition-colors hover:text-cyan-400"
                style={{ color: "var(--app-text-faint)" }}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? (
                  <VolumeX size={14} />
                ) : (
                  <Volume2 size={14} />
                )}
              </button>

              {/* Slider track */}
              <div className="relative z-10 flex-1">
                {/* Track background */}
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
                  {/* Filled portion */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-75"
                    style={{ width: `${effectiveVolume}%` }}
                  />
                </div>
                {/* Invisible range input on top */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={effectiveVolume}
                  onChange={(e) => {
                    setMuted(false)
                    setVolume(+e.target.value)
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Volume"
                  style={{ margin: 0 }}
                />
              </div>

              {/* Numeric volume — subtle */}
              <span
                className="relative z-10 w-7 shrink-0 text-right text-[10px] tabular-nums"
                style={{ color: "var(--app-text-faint)" }}
              >
                {effectiveVolume}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
