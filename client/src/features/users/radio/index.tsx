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
  Info,
  Server,
  Mic,
  Square,
  Timer,
} from "lucide-react"
import { useRadio, STREAMS } from "@/context/RadioContext"

/* ── Helpers ───────────────────────────────────────────────── */
const fmt = (s: number) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

/* ── Spectrum EQ settings ──────────────────────────────────── */
const MIN_BARS = 56
const MAX_BARS = 180

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
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 backdrop-blur-lg md:items-center"
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border border-b-0 shadow-2xl md:max-h-[82vh] md:rounded-2xl md:border"
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
  analyserReady,
}: {
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  playing: boolean
  analyserReady: number
}) {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const smoothRef = useRef<Float32Array>(new Float32Array(0))
  const freqDataRef = useRef<Uint8Array>(new Uint8Array(0))
  const timeDataRef = useRef<Uint8Array>(new Uint8Array(0))
  const phaseRef = useRef<Float32Array>(new Float32Array(0))
  const jitterRef = useRef<Float32Array>(new Float32Array(0))
  const responseRef = useRef<Float32Array>(new Float32Array(0))
  const normRef = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const width = Math.max(240, canvas.clientWidth)
      const height = Math.max(120, canvas.clientHeight)
      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const nextW = Math.floor(width * dpr)
      const nextH = Math.floor(height * dpr)
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW
        canvas.height = nextH
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resizeCanvas()
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)

    const colorAt = (t: number) => {
      // Reduce saturation and lightness for subtle, elegant spectrum
      const sat = isDark ? 85 : 65
      const light = isDark ? 52 : 48
      return `hsl(${(300 + t * 300) % 360}, ${sat}%, ${light}%)`
    }

    const sampleBand = (
      data: Uint8Array,
      center: number,
      radius: number,
      offset: number
    ) => {
      const start = Math.max(0, center - radius + offset)
      const end = Math.min(data.length - 1, center + radius + offset)
      let sum = 0
      let count = 0
      for (let i = start; i <= end; i++) {
        sum += data[i]
        count++
      }
      return count > 0 ? sum / count / 255 : 0
    }

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)

      const width = Math.max(240, canvas.clientWidth)
      const height = Math.max(120, canvas.clientHeight)
      const centerY = height * 0.5
      ctx.clearRect(0, 0, width, height)

      const barPitch = Math.max(3.4, width / 152)
      const barWidth = Math.max(1.2, barPitch * 0.4)
      const barCountRaw = Math.min(
        MAX_BARS,
        Math.max(MIN_BARS, Math.floor(width / barPitch))
      )
      const barCount = barCountRaw % 2 === 0 ? barCountRaw : barCountRaw - 1

      if (smoothRef.current.length !== barCount) {
        smoothRef.current = new Float32Array(barCount)
      }
      if (phaseRef.current.length !== barCount) {
        const next = new Float32Array(barCount)
        for (let i = 0; i < barCount; i++) {
          next[i] = Math.random() * Math.PI * 2
        }
        phaseRef.current = next
      }
      if (jitterRef.current.length !== barCount) {
        const next = new Float32Array(barCount)
        for (let i = 0; i < barCount; i++) {
          next[i] = (Math.random() * 2 - 1) * 0.12
        }
        jitterRef.current = next
      }
      if (responseRef.current.length !== barCount) {
        const next = new Float32Array(barCount)
        for (let i = 0; i < barCount; i++) {
          next[i] = 0.86 + Math.random() * 0.34
        }
        responseRef.current = next
      }

      let rms = 0
      let centroid = 0
      let spectralMass = 0
      let meanEnergy = 0
      if (playing && analyserRef.current) {
        const analyser = analyserRef.current

        if (freqDataRef.current.length !== analyser.frequencyBinCount) {
          freqDataRef.current = new Uint8Array(analyser.frequencyBinCount)
        }
        if (timeDataRef.current.length !== analyser.fftSize) {
          timeDataRef.current = new Uint8Array(analyser.fftSize)
        }

        try {
          analyser.getByteFrequencyData(
            freqDataRef.current as unknown as Uint8Array<ArrayBuffer>
          )
          analyser.getByteTimeDomainData(
            timeDataRef.current as unknown as Uint8Array<ArrayBuffer>
          )
        } catch {
          // Some streams intermittently block analyser reads; keep animation alive.
          freqDataRef.current.fill(0)
          timeDataRef.current.fill(128)
        }

        for (let i = 0; i < timeDataRef.current.length; i++) {
          const sample = (timeDataRef.current[i] - 128) / 128
          rms += sample * sample
        }
        rms = Math.sqrt(rms / Math.max(1, timeDataRef.current.length))

        const maxSpectralBin = Math.max(
          48,
          Math.floor(freqDataRef.current.length * 0.6)
        )

        for (let i = 1; i < maxSpectralBin; i++) {
          meanEnergy += freqDataRef.current[i] / 255
        }
        meanEnergy /= Math.max(1, maxSpectralBin - 1)

        const targetNorm = Math.min(
          3.2,
          Math.max(0.85, 0.24 / (meanEnergy + 0.02))
        )
        normRef.current += (targetNorm - normRef.current) * 0.08

        for (let i = 1; i < maxSpectralBin; i++) {
          const n = freqDataRef.current[i] / 255
          spectralMass += n
          centroid += n * i
        }
        centroid =
          spectralMass > 0 ? centroid / spectralMass : maxSpectralBin * 0.3

        const minBin = 3
        const maxBin = Math.min(freqDataRef.current.length - 1, maxSpectralBin)
        const centroidNorm = Math.min(1, centroid / Math.max(1, maxSpectralBin))
        const noiseGate = Math.max(
          0.012,
          0.024 + rms * 0.045 - meanEnergy * 0.03
        )
        const now = performance.now()

        for (let i = 0; i < barCount; i++) {
          const barT = i / Math.max(1, barCount - 1)
          const distFromCenter = Math.abs(barT - 0.5)
          const centerWeight = Math.pow(1 - distFromCenter, 0.7)
          const jitter = jitterRef.current[i]
          const response = responseRef.current[i]

          // Keep the spectrum musically active by biasing toward low-mid bands.
          const barPhase = (i * 0.41 + barT * 1.3) % 1
          const baseT = Math.pow(barT, 1.48)
          const freqT = Math.min(
            1,
            baseT * 0.64 + barPhase * 0.18 + centroidNorm * 0.13 + jitter
          )
          const activeMaxBin = Math.floor(minBin + (maxBin - minBin) * 0.8)
          const bin = Math.floor(
            minBin +
              freqT * (activeMaxBin - minBin) +
              Math.sin(phaseRef.current[i] + now * 0.0008) * 4
          )
          const radius = 1 + Math.floor(1.5 + distFromCenter * 8)
          const offset = Math.floor(
            Math.sin(phaseRef.current[i] * 0.5 + i * 0.11 + now * 0.0012) * 3
          )
          const rawValue = Math.min(
            1,
            sampleBand(freqDataRef.current, bin, radius, offset) *
              normRef.current
          )

          // Staggered dynamics: each bar has slightly different attack/release
          const indexStagger =
            Math.sin((i * 0.19 + now * 0.00015) % Math.PI) * 0.1
          const attack = (0.5 + centerWeight * 0.2 + indexStagger) * response
          const release =
            (0.15 + centerWeight * 0.14 + indexStagger * 0.4) *
            (0.92 + response * 0.18)

          const prev = smoothRef.current[i]
          const edgeFloor = 0.004 + (1 - centerWeight) * 0.005
          const rightTilt = 0.84 + barT * 0.3
          const target = Math.max(
            edgeFloor,
            Math.max(0, rawValue - noiseGate) *
              (0.42 + 1.34 * centerWeight) *
              rightTilt
          )

          smoothRef.current[i] =
            target > prev
              ? prev + (target - prev) * attack
              : prev + (target - prev) * release
        }
      } else {
        for (let i = 0; i < smoothRef.current.length; i++) {
          smoothRef.current[i] *= 0.82
        }
      }

      const minHalf = 1
      const maxHalf = height * 0.36
      const energyScale = 0.45 + rms * 1.65
      const glow = Math.min(1, rms * 6)
      const span = Math.max(0, width - barPitch * (barCount - 1)) * 0.5

      for (let i = 0; i < barCount; i++) {
        const x = span + i * barPitch
        const t = i / Math.max(1, barCount - 1)
        const edge = Math.abs((i / Math.max(1, barCount - 1)) * 2 - 1)
        const centerWeight = Math.pow(1 - edge, 0.62)
        const level = Math.pow(Math.max(0, smoothRef.current[i]), 0.88)
        const half = Math.min(
          maxHalf,
          minHalf + level * maxHalf * energyScale * (0.32 + 0.9 * centerWeight)
        )
        const color = colorAt(t)

        ctx.lineCap = "round"
        ctx.strokeStyle = color
        ctx.lineWidth = barWidth + 0.9
        ctx.shadowColor = color
        ctx.shadowBlur = 5 + glow * 12
        ctx.beginPath()
        ctx.moveTo(x, centerY - half)
        ctx.lineTo(x, centerY + half)
        ctx.stroke()

        ctx.shadowBlur = 0
        ctx.lineWidth = Math.max(0.9, barWidth - 0.45)
        ctx.beginPath()
        ctx.moveTo(x, centerY - half)
        ctx.lineTo(x, centerY + half)
        ctx.stroke()
      }
    }

    draw()
    return () => {
      resizeObserver.disconnect()
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [playing, analyserRef, analyserReady, isDark])

  return (
    <div className="overflow-hidden">
      <canvas
        ref={canvasRef}
        className="mx-auto block h-[clamp(120px,22vw,190px)] w-full"
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
    analyserReady,
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
  const [sleepNowMs, setSleepNowMs] = useState(() => Date.now())
  const [pauseConfirm, setPauseConfirm] = useState(false)

  const handlePlayPause = useCallback(() => {
    if (playing && recording) {
      setPauseConfirm(true)
      return
    }
    togglePlay()
  }, [playing, recording, togglePlay])

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

  return (
    <>
      {/* <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;900&display=swap"
        rel="stylesheet"
      /> */}

      <div
        className={cn(
          "font-barlow relative flex h-full flex-col overflow-hidden transition-colors duration-500",
          isDark
            ? "bg-gradient-to-br from-[#060614] via-[#0a0a1e] to-[#060610] text-white"
            : "bg-[#eef1ff] text-[#0f1535]"
        )}
      >
        <main className="flex flex-1 flex-col items-center overflow-y-auto">
          {/* Artwork */}
          <div className="w-full pt-6 text-center">
            <div className="relative mx-auto mb-3 w-fit">
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

            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-2xl font-black tracking-tight">
                <h1>Jesus Is Lord Radio</h1>
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
              {loading && (
                <p className="animate-pulse text-[11px] font-semibold text-cyan-400">
                  Connecting to {STREAMS[streamIdx].label}...
                </p>
              )}
              {sleepEndAt && (
                <p className="text-[11px] font-semibold text-cyan-400">
                  Sleep in {String(sleepMinutes).padStart(2, "0")}:
                  {String(sleepSeconds).padStart(2, "0")}
                </p>
              )}
            </div>
          </div>

          {/* EQ */}
          <div className="mt-4 w-full max-w-2xl shrink-0 overflow-hidden">
            <SegmentedEQ analyserRef={analyserRef} playing={playing} analyserReady={analyserReady} />
          </div>

          {/* Controls */}
          <div className="mt-auto flex w-full flex-col gap-6 pb-[max(env(safe-area-inset-bottom),24px)] lg:-mt-4">
            <div className="mt-4 flex items-center justify-center gap-1 px-4 sm:gap-4 sm:px-6">
              {/* Ellipses menu */}
              <div className="relative flex shrink-0 items-center">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className={cn(
                    "grid h-12 w-12 cursor-pointer place-items-center rounded-full border transition-all",
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
                  onClick={handlePlayPause}
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
            <div className="mb-8 flex items-center gap-3 px-4">
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

      {/* Pause while recording confirmation */}
      <Sheet
        open={pauseConfirm}
        onClose={() => setPauseConfirm(false)}
        title="Recording Active"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            You are currently recording. Pausing the radio will stop the
            recording. Continue?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPauseConfirm(false)
              }}
              className="flex-1 rounded-xl border px-4 py-3 font-bold transition-colors"
              style={{
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                togglePlay()
                stopRecording()
                setPauseConfirm(false)
                notify("Recording stopped", "success")
              }}
              className="flex-1 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-bold text-red-400 transition-colors hover:bg-red-500/20"
            >
              Pause & Stop
            </button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
