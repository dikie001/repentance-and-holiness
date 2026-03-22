import { useState, useRef, useEffect, useCallback } from "react"
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

/* ── Bottom Sheet ── */
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,6,0.72)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#0d0d1a",
          borderRadius: "28px 28px 0 0",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 -12px 60px rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "none",
        }}
      >
        <div
          style={{
            width: 44,
            height: 5,
            background: "#333",
            borderRadius: 999,
            margin: "18px auto 0",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px 8px",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              color: "#aaa",
              cursor: "pointer",
            }}
          >
            <X size={22} />
          </button>
        </div>
        <div style={{ padding: "0 24px 40px" }}>{children}</div>
      </div>
    </div>
  )
}

/* ── Segmented Equalizer ── */
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
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        margin: "0 auto",
        background: "transparent",
      }}
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

  // ── Audio element setup ───────────────────────────────────────
  useEffect(() => {
    const a = new Audio()
    a.crossOrigin = "anonymous"
    audioRef.current = a

    const onPlaying = () => {
      setPlaying(true)
      setLoading(false)
      setError(null)
    }
    const onPause = () => setPlaying(false)
    const onWaiting = () => setLoading(true)
    const onCanPlay = () => setLoading(false)
    const onError = () => {
      setLoading(false)
      setError("Stream failed – try another server")
      setPlaying(false)
    }

    a.addEventListener("playing", onPlaying)
    a.addEventListener("pause", onPause)
    a.addEventListener("waiting", onWaiting)
    a.addEventListener("canplay", onCanPlay)
    a.addEventListener("error", onError)

    a.src = STREAMS[0].url
    a.volume = 1
    a.load()
    a.play().catch(() => {})

    return () => {
      a.removeEventListener("playing", onPlaying)
      a.removeEventListener("pause", onPause)
      a.removeEventListener("waiting", onWaiting)
      a.removeEventListener("canplay", onCanPlay)
      a.removeEventListener("error", onError)
      a.pause()
      a.src = ""
    }
  }, [])

  // Volume & mute control
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = muted ? 0 : volume / 100
    } else if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100
    }
  }, [volume, muted])

  // Fake listener count
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
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }

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
    } catch {
      // ignore
    }

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
        } catch (err){
          console.log(err)
        }
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
      } catch (err){
        setError("Audio context failed")
        console.log(err)
      }

      a.play().catch(() => setError("Tap play to start"))
    },
    [ensureAudioContext]
  )

  // ── Recording ──────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = ensureAudioContext()
      recChunks.current = []
      recDuration.current = 0

      // Prefer webm/opus, fallback to default
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

      recTimer.current = window.setInterval(() => {
        recDuration.current++
        setRecSeconds(recDuration.current)
      }, 1000)
    } catch (err: unknown) {
      setError(`Recording failed: ${err?.message || "Unknown error"}`)
    }
  }

  const stopRecording = () => {
    if (recRef.current) {
      recRef.current.stop()
    }
    if (recTimer.current) {
      clearInterval(recTimer.current)
    }
    setRecording(false)
  }

  const deleteRec = (index: number) => {
    setRecordings((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].url)
      next.splice(index, 1)
      return next
    })
  }

  const share = async () => {
    const data = {
      title: "Jesus Is Lord Radio",
      url: STREAMS[streamIdx].url,
    }

    if (navigator.share) {
      navigator.share(data).catch(() => {})
    } else {
      try {
        await navigator.clipboard.writeText(data.url)
      } catch (error) {
        setError(`Failed to share: ${error}`)
      }
    }
  }

  const menuItems = [
    {
      icon: <Server size={20} />,
      label: "Sources",
      action: () => setSheet("sources"),
    },
    {
      icon: <Mic size={20} />,
      label: recording ? `Stop (${fmt(recSeconds)})` : "Record",
      action: recording ? stopRecording : startRecording,
      color: recording ? "#f87171" : undefined,
    },
    {
      icon: <Download size={20} />,
      label: `Clips (${recordings.length})`,
      action: () => setSheet("record"),
    },
    { icon: <Share2 size={20} />, label: "Share", action: share },
    { icon: <Info size={20} />, label: "Info", action: () => setSheet("info") },
  ]

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;900&family=Barlow+Condensed:wght@700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        html,body { height:100%; background:#000; font-family:'Barlow',sans-serif; overscroll-behavior:none; }
        button { touch-action:manipulation; cursor:pointer; }
        @keyframes spin   { to { transform:rotate(360deg) } }
        @keyframes pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(99,202,255,0.35)} 50%{box-shadow:0 0 0 28px rgba(99,202,255,0)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div
        style={{
          height: "100svh",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(170deg, #060614 0%, #0a0a1e 60%, #060610 100%)",
          color: "#fff",
          overflow: "hidden",
          position: "relative",
          padding:
            "env(safe-area-inset-top,0) env(safe-area-inset-right,0) 0 env(safe-area-inset-left,0)",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,120,255,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Logo + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg, #1a6fff, #00c8ff)",
                display: "grid",
                placeItems: "center",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 13,
                color: "#fff",
                letterSpacing: 0.5,
                boxShadow: "0 4px 20px rgba(0,170,255,0.4)",
              }}
            >
              JIL
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                Jesus Is Lord
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#4db8ff",
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                Global Radio
              </div>
            </div>
          </div>

          {/* Live badge + Menu */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                background: "rgba(255,40,40,0.15)",
                border: "1px solid rgba(255,80,80,0.35)",
                borderRadius: 999,
                padding: "5px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 800,
                color: "#ff6060",
                letterSpacing: 1.5,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ff4040",
                  animation: playing ? "blink 1.4s infinite" : "none",
                }}
              />
              LIVE
            </div>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  background: menuOpen
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  color: "#aaa",
                  transition: "background 0.2s",
                }}
              >
                <MoreVertical size={22} />
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    background: "#0f0f24",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    padding: 8,
                    minWidth: 210,
                    zIndex: 300,
                    animation: "fadeUp 0.18s ease",
                  }}
                >
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action()
                        setMenuOpen(false)
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "11px 14px",
                        border: "none",
                        background: "none",
                        color: item.color || "#e0e0ff",
                        fontWeight: 600,
                        fontSize: 14,
                        borderRadius: 10,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 20px 20px",
            overflow: "hidden",
          }}
        >
          {/* Artwork */}
          <div style={{ textAlign: "center", marginTop: "2vh", width: "100%" }}>
            <div
              style={{
                position: "relative",
                width: "fit-content",
                margin: "0 auto 8px",
              }}
            >
              <div
                style={{
                  width: "min(56vw, 220px)",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "4px solid rgba(255,255,255,0.12)",
                  boxShadow: playing
                    ? "0 0 0 12px rgba(0,140,255,0.15), 0 20px 60px rgba(0,100,255,0.4)"
                    : "0 16px 50px rgba(0,0,0,0.5)",
                  animation: playing ? "pulse 3.2s infinite" : "none",
                }}
              >
                <img
                  src="/images/radio-logo.png"
                  alt="Jesus Is Lord Radio"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    animation: playing ? "spin 28s linear infinite" : "none",
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://static-media.streema.com/media/cache/b8/70/b870ab4505ebd20d76984a8ea8025007.jpg"
                  }}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: playing
                    ? "linear-gradient(90deg,#0066ff,#00c8ff)"
                    : "#2a2a4a",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 900,
                  padding: "5px 16px",
                  borderRadius: 999,
                  border: "2px solid rgba(255,255,255,0.15)",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {playing ? "● ON AIR" : "OFF AIR"}
              </div>
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                lineHeight: 1.1,
                margin: "18px 0 4px",
                letterSpacing: -0.5,
              }}
            >
              Jesus Is Lord Radio
            </div>
            <div style={{ fontSize: 13, color: "#7080a0", fontWeight: 600 }}>
              Repentance & Holiness · {listeners} listening
            </div>
          </div>

          {/* EQ */}
          <div style={{ width: "100%", maxWidth: 400, marginTop: 16 }}>
            <SegmentedEQ analyserRef={analyserRef} playing={playing} />
          </div>

          {/* Controls */}
          <div
            style={{
              width: "100%",
              marginTop: "auto",
              paddingBottom: "env(safe-area-inset-bottom,16px)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Play / skip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 36,
              }}
            >
              <button
                onClick={() =>
                  switchStream(
                    (streamIdx - 1 + STREAMS.length) % STREAMS.length
                  )
                }
                style={{ background: "none", border: "none", color: "#5580ff" }}
              >
                <SkipBack size={30} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                disabled={loading}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "linear-gradient(145deg, #1a5fff, #00aaff)",
                  border: "none",
                  boxShadow: playing
                    ? "0 0 0 8px rgba(0,140,255,0.2), 0 12px 40px rgba(0,140,255,0.5)"
                    : "0 10px 36px rgba(0,100,255,0.4)",
                  display: "grid",
                  placeItems: "center",
                  opacity: loading ? 0.7 : 1,
                  transition: "box-shadow 0.3s",
                }}
              >
                {loading ? (
                  <Loader2
                    size={44}
                    color="#fff"
                    style={{ animation: "spin 0.9s linear infinite" }}
                  />
                ) : playing ? (
                  <Pause size={46} fill="white" color="white" />
                ) : (
                  <Play
                    size={46}
                    fill="white"
                    color="white"
                    style={{ marginLeft: 6 }}
                  />
                )}
              </button>

              <button
                onClick={() => switchStream((streamIdx + 1) % STREAMS.length)}
                style={{ background: "none", border: "none", color: "#5580ff" }}
              >
                <SkipForward size={30} fill="currentColor" />
              </button>
            </div>

            {/* Volume */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 8px",
              }}
            >
              <button
                onClick={() => setMuted((m) => !m)}
                style={{
                  background: "none",
                  border: "none",
                  color: muted ? "#444" : "#4499ff",
                }}
              >
                {muted || volume === 0 ? (
                  <VolumeX size={22} />
                ) : (
                  <Volume2 size={22} />
                )}
              </button>

              <div
                style={{
                  flex: 1,
                  position: "relative",
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${muted ? 0 : volume}%`,
                    background: "linear-gradient(90deg, #1a5fff, #00c8ff)",
                    borderRadius: 3,
                    transition: "width 0.05s",
                  }}
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
                  style={{
                    position: "absolute",
                    inset: "-8px 0",
                    opacity: 0,
                    cursor: "pointer",
                    width: "100%",
                  }}
                />
              </div>

              <span
                style={{
                  minWidth: 38,
                  textAlign: "right",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#5580aa",
                }}
              >
                {muted ? "0" : volume}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Sheets ── */}
      <Sheet
        open={sheet === "sources"}
        onClose={() => setSheet(null)}
        title="Audio Sources"
      >
        {STREAMS.map((s, i) => (
          <div
            key={s.id}
            onClick={() => switchStream(i)}
            style={{
              padding: "16px 0",
              display: "flex",
              alignItems: "center",
              gap: 16,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: i === streamIdx ? "#00aaff" : "#333",
                boxShadow: i === streamIdx ? "0 0 8px #00aaff" : "none",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#e0e8ff" }}>
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: "#556" }}>{s.sub}</div>
            </div>
            {i === streamIdx && (
              <span
                style={{
                  background: "rgba(0,140,255,0.15)",
                  color: "#00aaff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "5px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,140,255,0.3)",
                }}
              >
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
          <p
            style={{
              textAlign: "center",
              color: "#445",
              padding: "40px 0",
              fontSize: 15,
            }}
          >
            No recordings yet. Use the Record option in the menu.
          </p>
        ) : (
          recordings.map((r, idx) => (
            <div
              key={idx}
              style={{
                padding: "16px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 600, fontSize: 15, color: "#e0e8ff" }}
                  >
                    {r.name}
                  </div>
                  <div style={{ color: "#556", fontSize: 13 }}>
                    Duration: {fmt(r.dur)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <a
                    href={r.url}
                    download={`${r.name}.webm`}
                    style={{
                      background: "rgba(0,140,255,0.12)",
                      borderRadius: 10,
                      padding: 10,
                      color: "#00aaff",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Download size={18} />
                  </a>
                  <button
                    onClick={() => deleteRec(idx)}
                    style={{
                      background: "rgba(255,80,80,0.12)",
                      borderRadius: 10,
                      padding: 10,
                      color: "#ff6060",
                      border: "none",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <audio controls src={r.url} style={{ width: "100%" }} />
            </div>
          ))
        )}
      </Sheet>

      <Sheet
        open={sheet === "info"}
        onClose={() => setSheet(null)}
        title="Station Info"
      >
        <div style={{ lineHeight: 1.7, color: "#8090b0", fontSize: 14 }}>
          <p style={{ color: "#c0ccee", marginBottom: 16 }}>
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
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span>{k}</span>
              <span style={{ color: "#00aaff", fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </Sheet>

      {/* Error toast */}
      {error && (
        <div
          style={{
            position: "fixed",
            bottom: "max(env(safe-area-inset-bottom),16px)",
            left: 16,
            right: 16,
            background: "rgba(30,8,8,0.95)",
            border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: 16,
            padding: "14px 16px",
            color: "#ff8080",
            fontSize: 14,
            zIndex: 400,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            animation: "fadeUp 0.2s ease",
          }}
        >
          <Info size={20} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{ background: "none", border: "none", color: "#ff8080" }}
          >
            <X size={20} />
          </button>
        </div>
      )}
    </>
  )
}
