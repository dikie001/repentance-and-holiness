import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { createPortal } from "react-dom"
import {
  Play,
  Pause,
  Loader2,
  SkipBack,
  SkipForward,
  VolumeX,
  Volume2,
  MoreVertical,
  X,
  Download,
  Trash2,
  Share2,
  Info,
  Server,
  Mic,
  Square,
  Timer,
  Heart,
} from "lucide-react"
import { useRadio, STREAMS } from "@/context/RadioContext"

/* ── Helpers ───────────────────────────────────────────────── */
const fmt = (s: number) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

/* ── Spectrum EQ settings ──────────────────────────────────── */
const EQ_W = 980
const EQ_H = 220
const BAR_COUNT = 44

/* ── Bottom Sheet ──────────────────────────────────────────── */
function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  if (!open || typeof document === "undefined") return null
  return createPortal(
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[200] flex items-end bg-black/70 backdrop-blur-lg"
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border border-b-0 shadow-2xl"
        style={{
          background: isDark ? "var(--app-surface)" : "var(--app-nav-bg)",
          borderColor: "var(--app-border)",
        }}
      >
        <div
          className={cn(
            "mx-auto mt-4.5 h-1.5 w-11 rounded-full",
            isDark ? "bg-neutral-700" : "bg-blue-900/10"
          )}
        />
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <span
            className="text-xl font-extrabold"
            style={{ color: "var(--app-text)" }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border transition-colors"
            style={{
              background: "var(--app-card)",
              borderColor: "var(--app-border)",
              color: "var(--app-text-muted)",
            }}
          >
            <X size={22} />
          </button>
        </div>
        <div className="px-6 pb-10">{children}</div>
      </div>
    </div>,
    document.body
  )
}

function SegmentedEQ({
  analyserRef,
  playing,
}: {
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  playing: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const smoothRef = useRef<Float32Array>(new Float32Array(BAR_COUNT))
  const phaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const W = EQ_W
    const H = EQ_H
    const centerY = H * 0.5

    const colorAt = (t: number) => {
      // Left-to-right rainbow progression close to the reference style.
      if (t < 0.34) {
        const p = t / 0.34
        const hue = 74 + (188 - 74) * p
        return `hsl(${hue}, 98%, 58%)`
      }
      if (t < 0.7) {
        const p = (t - 0.34) / 0.36
        const hue = 188 + (244 - 188) * p
        return `hsl(${hue}, 98%, 60%)`
      }
      const p = (t - 0.7) / 0.3
      const hue = 244 + (312 - 244) * p
      return `hsl(${hue}, 98%, 62%)`
    }

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)

      phaseRef.current += 0.018
      const levels = new Float32Array(BAR_COUNT)
      let energy = 0

      if (playing && analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(data)

        const minBin = 2
        const maxBin = Math.min(220, data.length - 1)
        for (let i = 0; i < BAR_COUNT; i++) {
          const t0 = i / BAR_COUNT
          const t1 = (i + 1) / BAR_COUNT
          const start = Math.max(
            minBin,
            Math.floor(minBin * Math.pow(maxBin / minBin, t0))
          )
          const end = Math.max(
            start + 1,
            Math.floor(minBin * Math.pow(maxBin / minBin, t1))
          )

          let sum = 0
          for (let b = start; b < end; b++) sum += data[b]
          const raw = (sum / (end - start)) / 255
          energy += raw

          const previous = smoothRef.current[i]
          const attack = 0.62
          const release = 0.2
          const eased =
            raw > previous
              ? previous + (raw - previous) * attack
              : previous + (raw - previous) * release

          smoothRef.current[i] = eased
          levels[i] = eased
        }
      } else {
        for (let i = 0; i < BAR_COUNT; i++) {
          smoothRef.current[i] *= 0.9
          levels[i] = smoothRef.current[i]
        }
      }

      const avgEnergy = energy / Math.max(1, BAR_COUNT)
      const glowBoost = Math.min(1, avgEnergy * 2.4)

      ctx.clearRect(0, 0, W, H)

      // Pure black studio-like background.
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, W, H)

      const contentW = W * 0.78
      const startX = (W - contentW) / 2
      const step = contentW / (BAR_COUNT - 1)
      const lineW = Math.max(2.4, step * 0.34)
      const maxHalf = H * 0.39
      const minHalf = 10

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = startX + i * step
        const t = i / (BAR_COUNT - 1)
        const c = colorAt(t)

        const shaped = Math.pow(levels[i], 0.72)
        const breathing = Math.sin(phaseRef.current * 6 + i * 0.3) * 1.2
        const half = minHalf + shaped * maxHalf + breathing

        // Glow stroke.
        ctx.strokeStyle = c
        ctx.lineWidth = lineW + 2.2
        ctx.lineCap = "round"
        ctx.shadowColor = c
        ctx.shadowBlur = 16 + glowBoost * 16
        ctx.beginPath()
        ctx.moveTo(x, centerY - half)
        ctx.lineTo(x, centerY + half)
        ctx.stroke()

        // Bright core stroke.
        ctx.shadowBlur = 0
        ctx.lineWidth = Math.max(1.3, lineW - 0.7)
        ctx.strokeStyle = "rgba(255,255,255,0.9)"
        ctx.beginPath()
        ctx.moveTo(x, centerY - half)
        ctx.lineTo(x, centerY + half)
        ctx.stroke()
      }
    }

    draw()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [playing, analyserRef])

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: "rgba(255,255,255,0.12)" }}
    >
      <canvas
        ref={canvasRef}
        width={EQ_W}
        height={EQ_H}
        className="mx-auto block h-auto w-full bg-black"
      />
    </div>
  )
}

/* ── Main component ────────────────────────────────────────── */
export default function RadioPlayer() {
  // Pull shared state from context
  const {
    playing,
    loading,
    streamIdx,
    volume,
    muted,
    listeners,
    analyserRef,
    togglePlay,
    switchStream,
    setVolume,
    setMuted,
    // Global recording state
    recording,
    recordings,
    startRecording,
    stopRecording,
    deleteRecording,
    notify,
  } = useRadio()

  const [sheet, setSheet] = useState<
    "sources" | "record" | "info" | "sleep" | null
  >(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sleepEndAt, setSleepEndAt] = useState<number | null>(null)
  const [sleepNowMs, setSleepNowMs] = useState(Date.now())
  const [favorite, setFavorite] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem("rh-radio-favorite") === "1"
  })

  const share = useCallback(async () => {
    const data = { title: "Jesus Is Lord Radio", url: STREAMS[streamIdx].url }
    if (navigator.share) {
      navigator.share(data).catch(() => {})
    } else {
      try {
        await navigator.clipboard.writeText(data.url)
        notify("Link copied!", "success")
      } catch {
        /* */
      }
    }
  }, [streamIdx, notify])

  const { theme } = useTheme()
  const isDark = theme !== "light"

  const sleepRemainingMs = sleepEndAt ? Math.max(0, sleepEndAt - sleepNowMs) : 0
  const sleepMinutes = Math.floor(sleepRemainingMs / 60000)
  const sleepSeconds = Math.floor((sleepRemainingMs % 60000) / 1000)

  const setSleepTimer = useCallback(
    (minutes: number) => {
      if (minutes <= 0) {
        setSleepEndAt(null)
        notify("Sleep timer cleared")
        return
      }
      const endAt = Date.now() + minutes * 60_000
      setSleepEndAt(endAt)
      notify(`Sleep timer set: ${minutes} min`, "success")
    },
    [notify]
  )

  useEffect(() => {
    if (!sleepEndAt) return
    const id = window.setInterval(() => setSleepNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [sleepEndAt])

  useEffect(() => {
    if (!sleepEndAt) return
    if (sleepRemainingMs > 0) return
    if (playing) {
      togglePlay()
      notify("Sleep timer ended. Playback paused.")
    }
    setSleepEndAt(null)
  }, [sleepEndAt, sleepRemainingMs, playing, togglePlay, notify])

  const toggleFavorite = useCallback(() => {
    setFavorite((prev) => {
      const next = !prev
      if (typeof window !== "undefined") {
        window.localStorage.setItem("rh-radio-favorite", next ? "1" : "0")
      }
      notify(
        next ? "Added to Favorites" : "Removed from Favorites",
        next ? "success" : "default"
      )
      return next
    })
  }, [notify])

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;900&display=swap"
        rel="stylesheet"
      />

      <div
        className={cn(
          "font-barlow relative flex h-full flex-col overflow-hidden transition-colors duration-500",
          isDark
            ? "bg-gradient-to-br from-[#060614] via-[#0a0a1e] to-[#060610] text-white"
            : "bg-[#eef1ff] text-[#0f1535]"
        )}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-60"
          style={{
            background: isDark
              ? "radial-gradient(circle,rgba(0,100,255,.12) 0%,transparent 70%)"
              : "radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 70%)",
          }}
        />

        <main className="flex flex-1 flex-col items-center overflow-hidden px-4 pt-8 pb-5">
          {/* Artwork */}
          <div className="w-full text-center">
            <div className="relative mx-auto mb-4 w-fit">
              <div
                className={cn(
                  "aspect-square w-[min(54vw,200px)] overflow-hidden rounded-full border-4 transition-all duration-700",
                  isDark ? "border-white/12" : "border-white/60 shadow-xl",
                  playing
                    ? "animate-pulse-slow shadow-[0_0_0_12px_rgba(0,140,255,0.15),0_20px_60px_rgba(0,100,255,0.4)]"
                    : isDark
                      ? "shadow-xl shadow-black/50"
                      : "shadow-xl shadow-blue-900/10"
                )}
              >
                <img
                  src="/images/radio-logo.png"
                  alt="Jesus Is Lord Radio"
                  className={`h-full w-full object-cover ${playing ? "animate-spin-slow" : ""}`}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://static-media.streema.com/media/cache/b8/70/b870ab4505ebd20d76984a8ea8025007.jpg"
                  }}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-2xl font-black tracking-tight">
                <h1>Jesus Is Lord Radio</h1>
                <button
                  onClick={toggleFavorite}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full border transition-colors",
                    favorite
                      ? "border-rose-400/40 bg-rose-500/10 text-rose-500"
                      : isDark
                        ? "border-white/15 bg-white/5 text-slate-300 hover:text-white"
                        : "border-blue-300/80 bg-white/80 text-blue-700 hover:text-blue-900"
                  )}
                  aria-label="Toggle favorite"
                >
                  <Heart size={15} fill={favorite ? "currentColor" : "none"} />
                </button>
                {playing && (
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-widest uppercase",
                      isDark
                        ? "border-red-600/35 bg-red-900/15 text-red-400"
                        : "border-red-200 bg-red-50 text-red-600"
                    )}
                  >
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                    LIVE
                  </div>
                )}
              </div>
              <p
                className="text-sm font-semibold opacity-70"
                style={{ color: "var(--app-text)" }}
              >
                Repentance &amp; Holiness · {listeners} listening
              </p>
              {sleepEndAt && (
                <p className="text-[11px] font-semibold text-cyan-400">
                  Sleep in {String(sleepMinutes).padStart(2, "0")}:
                  {String(sleepSeconds).padStart(2, "0")}
                </p>
              )}
            </div>
          </div>

          {/* EQ */}
          <div className="mt-6 w-full max-w-md">
            <SegmentedEQ analyserRef={analyserRef} playing={playing} />
          </div>

          {/* Controls */}
          <div className="mt-auto flex w-full flex-col gap-6 pb-[env(safe-area-inset-bottom,16px)]">
            <div className="mt-4 flex items-center justify-center gap-1 px-2 sm:gap-4 sm:px-6">
              {/* Ellipses menu */}
              <div className="relative flex shrink-0 items-center">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full border transition-all",
                    menuOpen
                      ? isDark
                        ? "border-white/15 bg-white/10 text-white"
                        : "border-blue-300/80 bg-blue-600/10 text-blue-700 shadow-sm"
                      : isDark
                        ? "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                        : "border-blue-200 bg-white/85 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                  )}
                >
                  <MoreVertical size={24} />
                </button>
                {menuOpen && (
                  <div
                    className={cn(
                      "animate-fade-up absolute bottom-full left-0 z-30 mb-4 min-w-[210px] overflow-hidden rounded-2xl border py-2 shadow-2xl backdrop-blur-xl",
                      isDark
                        ? "border-white/10 bg-[#0f0f24]/95"
                        : "border-blue-200 bg-white/95"
                    )}
                  >
                    {[
                      {
                        icon: Server,
                        label: "Sources",
                        action: () => {
                          setSheet("sources")
                          setMenuOpen(false)
                        },
                      },
                      {
                        icon: Download,
                        label: `Clips (${recordings.length})`,
                        action: () => {
                          setSheet("record")
                          setMenuOpen(false)
                        },
                      },
                      {
                        icon: Share2,
                        label: "Share",
                        action: () => {
                          share()
                          setMenuOpen(false)
                        },
                      },
                      {
                        icon: Info,
                        label: "Info",
                        action: () => {
                          setSheet("info")
                          setMenuOpen(false)
                        },
                      },
                      {
                        icon: Timer,
                        label: sleepEndAt ? "Sleep Timer (On)" : "Sleep Timer",
                        action: () => {
                          setSheet("sleep")
                          setMenuOpen(false)
                        },
                      },
                    ].map(({ icon: Icon, label, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        className={cn(
                          "flex w-full items-center gap-3.5 px-3.5 py-3 text-sm font-bold transition-colors",
                          isDark
                            ? "text-indigo-100 hover:bg-white/7"
                            : "text-blue-900 hover:bg-blue-600/5"
                        )}
                      >
                        <Icon size={20} /> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Playback controls */}
              <div className="relative z-10 mx-2 flex shrink-0 items-center justify-center gap-4 sm:gap-6">
                <button
                  onClick={() =>
                    switchStream(
                      (streamIdx - 1 + STREAMS.length) % STREAMS.length
                    )
                  }
                  className={cn(
                    "shrink-0 transition-colors active:scale-95",
                    isDark
                      ? "text-blue-400/80 hover:text-blue-300"
                      : "text-blue-600/70 hover:text-blue-700"
                  )}
                >
                  <SkipBack size={32} fill="currentColor" />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={loading}
                  className={cn(
                    "grid aspect-square h-[80px] w-[80px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg transition-all duration-300 sm:h-[88px] sm:w-[88px]",
                    playing
                      ? "shadow-[0_0_0_6px_rgba(0,140,255,0.2),0_12px_40px_rgba(0,140,255,0.5)]"
                      : "shadow-[0_10px_36px_rgba(0,100,255,0.4)]",
                    loading ? "opacity-70" : "hover:scale-105 active:scale-95"
                  )}
                >
                  {loading ? (
                    <Loader2 size={36} className="animate-spin text-white" />
                  ) : playing ? (
                    <Pause size={38} fill="white" color="white" />
                  ) : (
                    <Play
                      size={38}
                      fill="white"
                      color="white"
                      className="ml-1.5"
                    />
                  )}
                </button>

                <button
                  onClick={() => switchStream((streamIdx + 1) % STREAMS.length)}
                  className={cn(
                    "shrink-0 transition-colors active:scale-95",
                    isDark
                      ? "text-blue-400/80 hover:text-blue-300"
                      : "text-blue-600/70 hover:text-blue-700"
                  )}
                >
                  <SkipForward size={32} fill="currentColor" />
                </button>
              </div>

              {/* Record button */}
              <div className="flex shrink-0 items-center">
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full border transition-all",
                    recording
                      ? "animate-pulse border-red-300/50 bg-red-500/10 text-red-500"
                      : cn(
                          isDark
                            ? "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                            : "border-blue-200 bg-white/85 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                        )
                  )}
                >
                  {recording ? (
                    <Square
                      size={20}
                      fill="currentColor"
                      className="text-red-500"
                    />
                  ) : (
                    <Mic size={24} />
                  )}
                </button>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={() => setMuted(!muted)}
                className={muted ? "text-neutral-500" : "text-cyan-500"}
              >
                {muted || volume === 0 ? (
                  <VolumeX size={22} />
                ) : (
                  <Volume2 size={22} />
                )}
              </button>
              <div
                className={cn(
                  "relative h-1.5 flex-1 rounded-full",
                  isDark ? "bg-white/8" : "bg-blue-900/10"
                )}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-100"
                  style={{ width: `${muted ? 0 : volume}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(+e.target.value)
                    setMuted(false)
                  }}
                  className="absolute inset-y-[-8px] w-full cursor-pointer opacity-0"
                />
              </div>
              <span
                className="min-w-9 text-right text-sm font-bold opacity-60"
                style={{ color: "var(--app-text)" }}
              >
                {muted ? "0" : volume}%
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Sources sheet */}
      <Sheet
        open={sheet === "sources"}
        onClose={() => setSheet(null)}
        title="Audio Sources"
      >
        {STREAMS.map((s, i) => (
          <div
            key={s.id}
            onClick={() => {
              switchStream(i)
              setSheet(null)
            }}
            className="flex cursor-pointer items-center gap-4 border-b py-4 transition-opacity hover:opacity-80"
            style={{ borderColor: "var(--app-border)" }}
          >
            <div
              className={`h-2.5 w-2.5 rounded-full ${i === streamIdx ? "bg-cyan-400 shadow-[0_0_8px] shadow-cyan-400" : "bg-neutral-500"}`}
            />
            <div className="flex-1">
              <div
                className="text-[15px] font-bold"
                style={{ color: "var(--app-text)" }}
              >
                {s.label}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--app-text-muted)" }}
              >
                {s.sub}
              </div>
            </div>
            {i === streamIdx && (
              <span className="rounded-full border border-cyan-500/30 bg-cyan-900/15 px-3.5 py-1 text-xs font-extrabold text-cyan-400">
                ACTIVE
              </span>
            )}
          </div>
        ))}
      </Sheet>

      {/* Clips sheet */}
      <Sheet
        open={sheet === "record"}
        onClose={() => setSheet(null)}
        title="Recordings"
      >
        {recordings.length === 0 ? (
          <p
            className="py-10 text-center text-[15px]"
            style={{ color: "var(--app-text-muted)" }}
          >
            No recordings yet. Tap the mic button to record.
          </p>
        ) : (
          recordings.map((r, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2.5 border-b py-4"
              style={{ borderColor: "var(--app-border)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="text-[15px] font-semibold"
                    style={{ color: "var(--app-text)" }}
                  >
                    {r.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    Duration: {fmt(r.dur)}
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <a
                    href={r.url}
                    download={`${r.name}.webm`}
                    className="grid place-items-center rounded-lg bg-cyan-900/12 p-2.5 text-cyan-400 transition-colors hover:bg-cyan-900/20"
                  >
                    <Download size={18} />
                  </a>
                  <button
                    onClick={() => deleteRecording(idx)}
                    className="grid place-items-center rounded-lg bg-red-900/12 p-2.5 text-red-400 transition-colors hover:bg-red-900/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <audio controls src={r.url} className="w-full" />
            </div>
          ))
        )}
      </Sheet>

      {/* Info sheet */}
      <Sheet
        open={sheet === "info"}
        onClose={() => setSheet(null)}
        title="Station Info"
      >
        <div
          className="text-sm leading-relaxed"
          style={{ color: "var(--app-text-muted)" }}
        >
          <p className="mb-4 font-medium" style={{ color: "var(--app-text)" }}>
            <strong>Jesus Is Lord Radio</strong> — 24/7 Christian broadcast from
            Nakuru, Kenya.
          </p>
          {[
            ["Frequencies", "105.3 · 105.9 FM"],
            ["Format", "Christian / Gospel"],
            ["Broadcast", "24/7 Live"],
            ["Ministry", "Repentance & Holiness"],
            ["Location", "Nakuru, Kenya"],
            ["Listeners", `${listeners} online`],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between border-b py-2.5"
              style={{ borderColor: "var(--app-border)" }}
            >
              <span>{k}</span>
              <span className="font-bold text-cyan-500">{v}</span>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet
        open={sheet === "sleep"}
        onClose={() => setSheet(null)}
        title="Sleep Timer"
      >
        <p className="mb-4 text-sm" style={{ color: "var(--app-text-muted)" }}>
          Stop playback automatically after a set duration.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {[15, 30, 45, 60].map((min) => (
            <button
              key={min}
              onClick={() => {
                setSleepTimer(min)
                setSheet(null)
              }}
              className="rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors hover:bg-cyan-500/10"
              style={{
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
              }}
            >
              {min} min
            </button>
          ))}
          <button
            onClick={() => {
              setSleepTimer(0)
              setSheet(null)
            }}
            className="col-span-2 rounded-xl border px-3 py-2.5 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10"
            style={{ borderColor: "var(--app-border)" }}
          >
            Clear Timer
          </button>
        </div>
      </Sheet>
    </>
  )
}
