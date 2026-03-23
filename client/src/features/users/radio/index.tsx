import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
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
} from "lucide-react"

interface Stream {
  id: string
  label: string
  sub: string
  url: string
}

const STREAMS: Stream[] = [
  {
    id: "primary",
    label: "Main Server",
    sub: "Radio.co",
    url: "https://s3.radio.co/s97f38db97/listen",
  },
  {
    id: "backup-1",
    label: "Backup 1",
    sub: "Zeno FM",
    url: "https://stream-155.zeno.fm/3gdtad95608uv",
  },
  {
    id: "backup-2",
    label: "Backup 2",
    sub: "Voscast",
    url: "http://station.voscast.com/5ca3d6cd7c777/",
  },
  {
    id: "backup-3",
    label: "Backup 3",
    sub: "Streema",
    url: "https://s3.radio.co/s97f38db97/listen",
  },
]

const fmt = (s: number): string =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

const BAR_COLORS = [
  "#ff00ff",
  "#e000ff",
  "#c400ff",
  "#a800ff",
  "#8c00ff",
  "#6600ff",
  "#4400ff",
  "#2200ff",
  "#0044ff",
  "#0088ff",
  "#00aaff",
  "#00ccff",
  "#00eeff",
  "#00ff88",
  "#00ff44",
  "#44ff00",
  "#88ff00",
  "#ccff00",
  "#ffee00",
  "#ffcc00",
  "#ffaa00",
  "#ff8800",
  "#ff6600",
  "#ff4400",
  "#ff2200",
  "#ff0000",
  "#ff0033",
  "#ff0066",
  "#ff0099",
  "#ff00cc",
]

const SEGMENTS = 16
const BAR_COUNT = 30

// ── Bottom Sheet ────────────────────────────────────────────────
interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

function Sheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[200] flex items-end bg-black/70 backdrop-blur-lg"
    >
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border border-b-0 border-white/7 bg-[#0d0d1a] shadow-2xl">
        <div className="mx-auto mt-4.5 h-1.5 w-11 rounded-full bg-neutral-700" />
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <span className="text-xl font-extrabold text-white">{title}</span>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-neutral-400 transition-colors hover:bg-white/12"
          >
            <X size={22} />
          </button>
        </div>
        <div className="px-6 pb-10">{children}</div>
      </div>
    </div>
  )
}

// ── Segmented Equalizer ─────────────────────────────────────────
const EQ_W = 600
const EQ_H = 160

interface SegmentedEQProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  playing: boolean
}

function SegmentedEQ({ analyserRef, playing }: SegmentedEQProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const smoothRef = useRef<Float32Array>(new Float32Array(BAR_COUNT))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = EQ_W
    const H = EQ_H
    const SEG_GAP = 2
    const BAR_GAP = 3
    const BAR_W = Math.floor((W - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT)
    const BAR_STEP = BAR_W + BAR_GAP
    const SEG_H = Math.floor((H - (SEGMENTS - 1) * SEG_GAP) / SEGMENTS)

    const MIN_BIN = 2
    const MAX_BIN = 60

    const barBins = Array.from({ length: BAR_COUNT }, (_, b) => {
      const lo = Math.round(
        MIN_BIN * Math.pow(MAX_BIN / MIN_BIN, b / BAR_COUNT)
      )
      const hi = Math.round(
        MIN_BIN * Math.pow(MAX_BIN / MIN_BIN, (b + 1) / BAR_COUNT)
      )
      return [lo, Math.max(lo + 1, hi)] as [number, number]
    })

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)

      const levels = new Float32Array(BAR_COUNT)

      if (playing && analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(data)

        for (let b = 0; b < BAR_COUNT; b++) {
          const [start, end] = barBins[b]
          let sum = 0
          for (let i = start; i < end; i++) sum += data[i]
          const avg = sum / (end - start)
          const raw = avg < 8 ? 0 : avg / 255
          smoothRef.current[b] =
            raw > smoothRef.current[b] ? raw : smoothRef.current[b] * 0.5
          levels[b] = smoothRef.current[b]
        }
      } else {
        for (let b = 0; b < BAR_COUNT; b++) {
          smoothRef.current[b] *= 0.85
          levels[b] = smoothRef.current[b]
        }
      }

      ctx.clearRect(0, 0, W, H)

      for (let b = 0; b < BAR_COUNT; b++) {
        const filledSegs = Math.round(levels[b] * SEGMENTS)
        const color = BAR_COLORS[b % BAR_COLORS.length]
        const x = b * BAR_STEP

        for (let s = 0; s < SEGMENTS; s++) {
          const y = H - (s + 1) * (SEG_H + SEG_GAP) + SEG_GAP
          if (s < filledSegs) {
            ctx.shadowColor = color
            ctx.shadowBlur = 8
            ctx.fillStyle = color
          } else {
            ctx.shadowBlur = 0
            ctx.fillStyle = "rgba(255,255,255,0.05)"
          }
          ctx.fillRect(x, y, BAR_W, SEG_H)
        }
        ctx.shadowBlur = 0
      }
    }

    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [playing, analyserRef])

  return (
    <canvas
      ref={canvasRef}
      width={EQ_W}
      height={EQ_H}
      className="mx-auto block h-auto w-full bg-transparent"
    />
  )
}

interface Recording {
  url: string
  name: string
  dur: number
}

export default function RadioPlayer() {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamIdx, setStreamIdx] = useState(0)
  const [volume, setVolume] = useState(82)
  const [muted, setMuted] = useState(false)
  const [listeners, setListeners] = useState(48)
  const [recording, setRecording] = useState(false)
  const [recSeconds, setRecSeconds] = useState(0)
  // Info sheet
  const [selectedTopic, setSelectedTopic] = useState("ministry")
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }, [])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [sheet, setSheet] = useState<"sources" | "record" | "info" | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const recChunks = useRef<Blob[]>([])
  const recTimer = useRef<number | null>(null)
  const recDuration = useRef(0)

  // Audio setup
  useEffect(() => {
    const a = new Audio()
    a.crossOrigin = "anonymous"
    audioRef.current = a

    a.addEventListener("playing", () => {
      setPlaying(true)
      setLoading(false)
      setError(null)
    })
    a.addEventListener("pause", () => setPlaying(false))
    a.addEventListener("waiting", () => setLoading(true))
    a.addEventListener("canplay", () => setLoading(false))
    a.addEventListener("error", () => {
      setLoading(false)
      setError("Stream failed – try another server")
      setPlaying(false)
    })

    a.src = STREAMS[0].url
    a.volume = 1
    a.load()
    a.play().catch(() => {})

    return () => {
      a.pause()
      a.src = ""
    }
  }, [])

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = muted ? 0 : volume / 100
    } else if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100
    }
  }, [volume, muted])

  // Fake listeners
  useEffect(() => {
    const id = setInterval(() => {
      setListeners((n) =>
        Math.max(1, n + (Math.random() > 0.5 ? 1 : -1) * ~~(Math.random() * 5))
      )
    }, 6000)
    return () => clearInterval(id)
  }, [])

  const ensureAudioContext = useCallback(() => {
    if (!audioRef.current) throw new Error("No audio element")

    if (!ctxRef.current) {
      ctxRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )()
    }
    const ctx = ctxRef.current
    if (ctx.state === "suspended") ctx.resume().catch(() => {})

    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(audioRef.current)
    }
    if (!gainNodeRef.current) {
      gainNodeRef.current = ctx.createGain()
      gainNodeRef.current.gain.value = muted ? 0 : volume / 100
      sourceRef.current.connect(gainNodeRef.current)
    }
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser()
      analyserRef.current.fftSize = 1024
      analyserRef.current.smoothingTimeConstant = 0.75
      gainNodeRef.current.connect(analyserRef.current)
      analyserRef.current.connect(ctx.destination)
    }
    if (!destRef.current) {
      destRef.current = ctx.createMediaStreamDestination()
      analyserRef.current.connect(destRef.current)
    }

    return destRef.current.stream
  }, [muted, volume])

  const togglePlay = useCallback(() => {
    const a = audioRef.current
    if (!a) return

    if (playing) {
      a.pause()
      return
    }

    try {
      ensureAudioContext()
    } catch {}
    setLoading(true)
    setError(null)
    a.play().catch(() => {
      setError("Playback blocked – tap again")
      setLoading(false)
    })
  }, [playing, ensureAudioContext])

  const switchStream = useCallback(
    (newIdx: number) => {
      setSheet(null)
      setMenuOpen(false)
      const a = audioRef.current
      if (!a) return

      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect()
        } catch {}
        sourceRef.current = null
      }
      gainNodeRef.current = null
      analyserRef.current = null

      a.pause()
      a.src = STREAMS[newIdx].url
      setStreamIdx(newIdx)
      setError(null)
      setLoading(true)
      a.load()

      try {
        ensureAudioContext()
      } catch {}
      a.play().catch(() => setError("Tap play to start"))
    },
    [ensureAudioContext]
  )

  // Recording
  const startRecording = useCallback(async () => {
    try {
      const stream = ensureAudioContext()
      recChunks.current = []
      recDuration.current = 0
 
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm"
 
      const recorder = new MediaRecorder(stream, { mimeType })
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recChunks.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(recChunks.current, { type: "audio/webm" })
        setRecordings((prev) => [
          {
            url: URL.createObjectURL(blob),
            name: `Clip ${new Date().toLocaleTimeString([], { hour12: false })}`,
            dur: recDuration.current,
          },
          ...prev,
        ])
      }
 
      recorder.start(1000)
      recRef.current = recorder
      setRecording(true)
      setRecSeconds(0)
      showToast("Recording started")
 
      recTimer.current = window.setInterval(() => {
        recDuration.current++
        setRecSeconds(recDuration.current)
      }, 1000)
    } catch (err: any) {
      setError(`Recording failed: ${err?.message || "Unknown error"}`)
      showToast("Failed to start recording")
    }
  }, [ensureAudioContext, showToast])

  const stopRecording = useCallback(() => {
    recRef.current?.stop()
    if (recTimer.current) clearInterval(recTimer.current)
    setRecording(false)
    showToast("Recording saved to Clips")
  }, [showToast])
 
  const deleteRec = (index: number) => {
    setRecordings((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].url)
      next.splice(index, 1)
      return next
    })
  }
 
  const share = useCallback(async () => {
    const data = { title: "Jesus Is Lord Radio", url: STREAMS[streamIdx].url }
    if (navigator.share) {
      navigator.share(data).catch(() => {})
    } else {
      try {
        await navigator.clipboard.writeText(data.url)
      } catch {}
    }
  }, [streamIdx])


  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;900&family=Barlow+Condensed:wght@700;900&display=swap"
        rel="stylesheet"
      />

      <div className="font-barlow relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-[#060614] via-[#0a0a1e] to-[#060610] text-white">
        
        {/* Toast Notification */}
        {toastMsg && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f0f24]/90 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${toastMsg.includes("started") ? "bg-red-500 animate-pulse" : "bg-cyan-500"}`} />
            {toastMsg}
          </div>
        )}

        {/* Ambient glow */}
        <div className="bg-gradient-radial pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full from-blue-500/12 to-transparent" />

        {/* Header */}
        <main className="flex flex-1 flex-col items-center overflow-hidden px-5 pt-8 pb-5">
          {/* Artwork + title */}
          <div className="w-full text-center">
            <div className="relative mx-auto mb-4 w-fit">
              <div
                className={`aspect-square w-[min(54vw,200px)] overflow-hidden rounded-full border-4 border-white/12 transition-all duration-700 ${
                  playing
                    ? "animate-pulse-slow shadow-[0_0_0_12px_rgba(0,140,255,0.15),0_20px_60px_rgba(0,100,255,0.4)]"
                    : "shadow-xl shadow-black/50"
                }`}
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
                <div className="flex items-center gap-1.5 rounded-full border border-red-600/35 bg-red-900/15 px-2 py-0.5 text-[9px] font-black tracking-widest text-red-400 uppercase">
                  <div className={`h-1.5 w-1.5 rounded-full bg-red-500 ${playing ? "animate-pulse" : ""}`} />
                  LIVE
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-400">
                Repentance & Holiness · {listeners} listening
              </p>
            </div>
          </div>

          {/* EQ */}
          <div className="mt-6 w-full max-w-md">
            <SegmentedEQ analyserRef={analyserRef} playing={playing} />
          </div>

          {/* Controls */}
          <div className="mt-auto flex w-full flex-col gap-6 pb-[env(safe-area-inset-bottom,16px)]">
            <div className="mt-4 flex items-center justify-center gap-1 sm:gap-4 px-2 sm:px-6">
              
              {/* Left Side: Ellipses Menu */}
              <div className="relative shrink-0 flex items-center">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full text-slate-400 transition-all",
                    menuOpen ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white active:scale-95"
                  )}
                >
                  <MoreVertical size={24} />
                </button>

                {menuOpen && (
                  <div className="animate-fade-up absolute bottom-full left-0 z-30 mb-4 min-w-[210px] rounded-2xl border border-white/10 bg-[#0f0f24]/95 backdrop-blur-xl py-2 shadow-2xl overflow-hidden">
                    <button
                      onClick={() => { setSheet("sources"); setMenuOpen(false); }}
                      className="flex w-full items-center gap-3.5 px-3.5 py-3 text-sm font-bold text-indigo-100 transition-colors hover:bg-white/7"
                    >
                      <Server size={20} />
                      Sources
                    </button>
                    <button
                      onClick={() => { setSheet("record"); setMenuOpen(false); }}
                      className="flex w-full items-center gap-3.5 px-3.5 py-3 text-sm font-bold text-indigo-100 transition-colors hover:bg-white/7"
                    >
                      <Download size={20} />
                      Clips ({recordings.length})
                    </button>
                    <button
                      onClick={() => { share(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-3.5 px-3.5 py-3 text-sm font-bold text-indigo-100 transition-colors hover:bg-white/7"
                    >
                      <Share2 size={20} />
                      Share
                    </button>
                    <button
                      onClick={() => { setSheet("info"); setMenuOpen(false); }}
                      className="flex w-full items-center gap-3.5 px-3.5 py-3 text-sm font-bold text-indigo-100 transition-colors hover:bg-white/7"
                    >
                      <Info size={20} />
                      Info
                    </button>
                  </div>
                )}
              </div>

              {/* Center: Playback Controls */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 shrink-0 relative z-10 mx-2">
                <button
                  onClick={() =>
                    switchStream(
                      (streamIdx - 1 + STREAMS.length) % STREAMS.length
                    )
                  }
                  className="text-blue-400/80 transition-colors hover:text-blue-300 active:scale-95 shrink-0"
                >
                  <SkipBack size={32} fill="currentColor" />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={loading}
                  className={cn(
                    "grid h-[80px] w-[80px] sm:h-[88px] sm:w-[88px] shrink-0 aspect-square place-items-center rounded-full border-none bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg transition-all duration-300",
                    playing
                      ? "shadow-[0_0_0_6px_rgba(0,140,255,0.2),0_12px_40px_rgba(0,140,255,0.5)]"
                      : "shadow-[0_10px_36px_rgba(0,100,255,0.4)]",
                    loading ? "opacity-70" : "hover:scale-105 active:scale-95"
                  )}
                >
                  {loading ? (
                    <Loader2 size={36} className="animate-spin text-white" />
                  ) : playing ? (
                    <Pause size={38} sm={{size: 42}} fill="white" color="white" />
                  ) : (
                    <Play
                      size={38}
                      sm={{size: 42}}
                      fill="white"
                      color="white"
                      className="ml-1.5"
                    />
                  )}
                </button>

                <button
                  onClick={() => switchStream((streamIdx + 1) % STREAMS.length)}
                  className="text-blue-400/80 transition-colors hover:text-blue-300 active:scale-95 shrink-0"
                >
                  <SkipForward size={32} fill="currentColor" />
                </button>
              </div>

              {/* Right Side: Record Button */}
              <div className="shrink-0 flex items-center">
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full transition-all",
                    recording 
                      ? "bg-white/10 text-white animate-pulse" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white active:scale-95"
                  )}
                >
                  {recording ? (
                    <Square size={20} fill="currentColor" />
                  ) : (
                    <Mic size={24} />
                  )}
                </button>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={() => setMuted((m) => !m)}
                className={muted ? "text-neutral-600" : "text-cyan-400"}
              >
                {muted || volume === 0 ? (
                  <VolumeX size={22} />
                ) : (
                  <Volume2 size={22} />
                )}
              </button>

              <div className="relative h-1.5 flex-1 rounded-full bg-white/8">
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

              <span className="min-w-9 text-right text-sm font-bold text-slate-400">
                {muted ? "0" : volume}%
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Sheets */}
      <Sheet
        open={sheet === "sources"}
        onClose={() => setSheet(null)}
        title="Audio Sources"
      >
        {STREAMS.map((s, i) => (
          <div
            key={s.id}
            onClick={() => switchStream(i)}
            className="flex cursor-pointer items-center gap-4 border-b border-white/6 py-4 transition-colors hover:bg-white/3"
          >
            <div
              className={`h-2.5 w-2.5 rounded-full ${i === streamIdx ? "bg-cyan-400 shadow-[0_0_8px] shadow-cyan-400" : "bg-neutral-700"}`}
            />
            <div className="flex-1">
              <div className="text-[15px] font-bold text-indigo-100">
                {s.label}
              </div>
              <div className="text-xs text-slate-500">{s.sub}</div>
            </div>
            {i === streamIdx && (
              <span className="rounded-full border border-cyan-500/30 bg-cyan-900/15 px-3.5 py-1 text-xs font-extrabold text-cyan-400">
                ACTIVE
              </span>
            )}
          </div>
        ))}
      </Sheet>

      <Sheet
        open={sheet === "record"}
        onClose={() => setSheet(null)}
        title="Recordings"
      >
        {recordings.length === 0 ? (
          <p className="py-10 text-center text-[15px] text-slate-600">
            No recordings yet. Use the Record option in the menu.
          </p>
        ) : (
          recordings.map((r, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2.5 border-b border-white/6 py-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold text-indigo-100">
                    {r.name}
                  </div>
                  <div className="text-xs text-slate-500">
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
                    onClick={() => deleteRec(idx)}
                    className="grid place-items-center rounded-lg border-none bg-red-900/12 p-2.5 text-red-400 transition-colors hover:bg-red-900/20"
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

      <Sheet
        open={sheet === "info"}
        onClose={() => setSheet(null)}
        title="Station Info"
      >
        <div className="text-sm leading-relaxed text-slate-400">
          <p className="mb-4 font-medium text-indigo-200">
            <strong>Jesus Is Lord Radio</strong> — 24/7 Christian broadcast from
            Nakuru, Kenya.
          </p>
          {[
            ["Frequencies", "95.3 · 105.9 FM"],
            ["Format", "Christian / Gospel"],
            ["Broadcast", "24/7 Live"],
            ["Ministry", "Repentance & Holiness"],
            ["Location", "Nakuru, Kenya"],
            ["Listeners", `${listeners} online`],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between border-b border-white/5 py-2.5"
            >
              <span>{k}</span>
              <span className="font-bold text-cyan-400">{v}</span>
            </div>
          ))}
        </div>
      </Sheet>

      {/* Error toast */}
      {error && (
        <div className="animate-fade-up fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] left-4 z-[400] flex items-center gap-3 rounded-2xl border border-red-600/30 bg-red-950/95 px-4 py-3.5 text-sm text-red-300 shadow-2xl">
          <Info size={20} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-300">
            <X size={20} />
          </button>
        </div>
      )}
    </>
  )
}
