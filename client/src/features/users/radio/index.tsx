import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTheme } from "@/components/theme-provider"
import {
  Play, Pause, Loader2, SkipBack, SkipForward,
  VolumeX, Volume2, MoreVertical, X, Download,
  Trash2, Share2, Info, Server, Mic, Square,
} from "lucide-react"
import { useRadio, STREAMS, RadioToast } from "@/context/RadioContext"

/* ── Helpers ───────────────────────────────────────────────── */
const fmt = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

/* ── Bar EQ colours ────────────────────────────────────────── */
const BAR_COLORS = [
  "#ff00ff","#e000ff","#c400ff","#a800ff","#8c00ff","#6600ff","#4400ff","#2200ff",
  "#0044ff","#0088ff","#00aaff","#00ccff","#00eeff","#00ff88","#00ff44","#44ff00",
  "#88ff00","#ccff00","#ffee00","#ffcc00","#ffaa00","#ff8800","#ff6600","#ff4400",
  "#ff2200","#ff0000","#ff0033","#ff0066","#ff0099","#ff00cc",
]
const SEGMENTS = 16
const BAR_COUNT = 30

/* ── Bottom Sheet ──────────────────────────────────────────── */
function Sheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  if (!open) return null
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[200] flex items-end bg-black/70 backdrop-blur-lg">
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border border-b-0 shadow-2xl"
           style={{ background: isDark ? "var(--app-surface)" : "var(--app-nav-bg)", borderColor: "var(--app-border)" }}>

        <div className={cn("mx-auto mt-4.5 h-1.5 w-11 rounded-full", isDark ? "bg-neutral-700" : "bg-blue-900/10")} />
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <span className="text-xl font-extrabold" style={{ color: "var(--app-text)" }}>{title}</span>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full transition-colors border"
                  style={{ background: "var(--app-card)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}>
            <X size={22} />
          </button>
        </div>
        <div className="px-6 pb-10">{children}</div>
      </div>
    </div>
  )
}

/* ── Segmented EQ ──────────────────────────────────────────── */
const EQ_W = 600, EQ_H = 160

function SegmentedEQ({ analyserRef, playing, isDark }: {
  analyserRef: React.MutableRefObject<AnalyserNode | null>; playing: boolean; isDark: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number | null>(null)
  const smoothRef = useRef<Float32Array>(new Float32Array(BAR_COUNT))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const W = EQ_W, H = EQ_H
    const SEG_GAP = 2, BAR_GAP = 3
    const BAR_W   = Math.floor((W - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT)
    const BAR_STEP = BAR_W + BAR_GAP
    const SEG_H   = Math.floor((H - (SEGMENTS - 1) * SEG_GAP) / SEGMENTS)
    const MIN_BIN = 2, MAX_BIN = 60
    const barBins = Array.from({ length: BAR_COUNT }, (_, b) => {
      const lo = Math.round(MIN_BIN * Math.pow(MAX_BIN / MIN_BIN, b / BAR_COUNT))
      const hi = Math.round(MIN_BIN * Math.pow(MAX_BIN / MIN_BIN, (b + 1) / BAR_COUNT))
      return [lo, Math.max(lo + 1, hi)] as [number, number]
    })
    const emptyColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,10,80,0.05)"

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
          const raw = (sum / (end - start)) < 8 ? 0 : (sum / (end - start)) / 255
          smoothRef.current[b] = raw > smoothRef.current[b] ? raw : smoothRef.current[b] * 0.5
          levels[b] = smoothRef.current[b]
        }
      } else {
        for (let b = 0; b < BAR_COUNT; b++) { smoothRef.current[b] *= 0.85; levels[b] = smoothRef.current[b] }
      }
      ctx.clearRect(0, 0, W, H)
      
      for (let b = 0; b < BAR_COUNT; b++) {
        const filledSegs = Math.round(levels[b] * SEGMENTS)
        const color = BAR_COLORS[b % BAR_COLORS.length]
        const x = b * BAR_STEP
        for (let s = 0; s < SEGMENTS; s++) {
          const y = H - (s + 1) * (SEG_H + SEG_GAP) + SEG_GAP
          if (s < filledSegs) { ctx.shadowColor = color; ctx.shadowBlur = 8; ctx.fillStyle = color }
          else { ctx.shadowBlur = 0; ctx.fillStyle = emptyColor }
          ctx.fillRect(x, y, BAR_W, SEG_H)
        }
        ctx.shadowBlur = 0
      }
    }
    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [playing, analyserRef, isDark])

  return <canvas ref={canvasRef} width={EQ_W} height={EQ_H} className="mx-auto block h-auto w-full bg-transparent" />
}


/* ── Main component ────────────────────────────────────────── */
export default function RadioPlayer() {
  // Pull shared state from context
  const {
    playing, loading,
    streamIdx, volume, muted,
    listeners, analyserRef,
    togglePlay, switchStream,
    setVolume, setMuted,
    // Global recording state
    recording, recordings,
    startRecording, stopRecording, deleteRecording,
  } = useRadio()

  const [sheet,      setSheet]      = useState<"sources" | "record" | "info" | null>(null)
  const [menuOpen,   setMenuOpen]   = useState(false)

  const share = useCallback(async () => {
    const data = { title: "Jesus Is Lord Radio", url: STREAMS[streamIdx].url }
    if (navigator.share) { navigator.share(data).catch(() => {}) }
    else {
      try {
        await navigator.clipboard.writeText(data.url);
        toast.custom(() => <RadioToast message="Link copied!" />, { position: "top-center" })
      } catch { /* */ }
    }
  }, [streamIdx])

  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;900&display=swap" rel="stylesheet" />

      <div className={cn("font-barlow relative flex h-full flex-col overflow-hidden transition-colors duration-500", 
        isDark ? "bg-gradient-to-br from-[#060614] via-[#0a0a1e] to-[#060610] text-white" : "bg-[#eef1ff] text-[#0f1535]")}>
        
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-60"
          style={{ background: isDark 
            ? "radial-gradient(circle,rgba(0,100,255,.12) 0%,transparent 70%)" 
            : "radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 70%)" 
          }} />

        <main className="flex flex-1 flex-col items-center overflow-hidden px-4 pt-8 pb-5">
          {/* Artwork */}
          <div className="w-full text-center">
            <div className="relative mx-auto mb-4 w-fit">
              <div className={cn("aspect-square w-[min(54vw,200px)] overflow-hidden rounded-full border-4 transition-all duration-700",
                isDark ? "border-white/12" : "border-white/60 shadow-xl",
                playing 
                  ? "animate-pulse-slow shadow-[0_0_0_12px_rgba(0,140,255,0.15),0_20px_60px_rgba(0,100,255,0.4)]" 
                  : (isDark ? "shadow-xl shadow-black/50" : "shadow-xl shadow-blue-900/10"))}>
                <img src="/images/radio-logo.png" alt="Jesus Is Lord Radio"
                  className={`h-full w-full object-cover ${playing ? "animate-spin-slow" : ""}`}
                  onError={e => { e.currentTarget.src = "https://static-media.streema.com/media/cache/b8/70/b870ab4505ebd20d76984a8ea8025007.jpg" }} />
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-2xl font-black tracking-tight">
                <h1>Jesus Is Lord Radio</h1>
                {playing && (
                  <div className={cn("flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-widest uppercase",
                    isDark ? "border-red-600/35 bg-red-900/15 text-red-400" : "border-red-200 bg-red-50 text-red-600")}>
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold opacity-70" style={{ color: "var(--app-text)" }}>
                Repentance &amp; Holiness · {listeners} listening
              </p>
            </div>
          </div>

          {/* EQ */}
          <div className="mt-6 w-full max-w-md">
            <SegmentedEQ analyserRef={analyserRef} playing={playing} isDark={isDark} />
          </div>

          {/* Controls */}
          <div className="mt-auto flex w-full flex-col gap-6 pb-[env(safe-area-inset-bottom,16px)]">
            <div className="mt-4 flex items-center justify-center gap-1 sm:gap-4 px-2 sm:px-6">

              {/* Ellipses menu */}
              <div className="relative shrink-0 flex items-center">
                <button onClick={() => setMenuOpen(o => !o)}
                  className={cn("grid h-12 w-12 place-items-center rounded-full transition-all",
                    isDark ? "text-slate-400" : "text-blue-900/40",
                    menuOpen 
                      ? (isDark ? "bg-white/10 text-white" : "bg-blue-600/10 text-blue-600") 
                      : (isDark ? "hover:bg-white/5 hover:text-white" : "hover:bg-blue-600/5 hover:text-blue-600"))}>
                  <MoreVertical size={24} />
                </button>
                {menuOpen && (
                  <div className={cn("animate-fade-up absolute bottom-full left-0 z-30 mb-4 min-w-[210px] rounded-2xl border backdrop-blur-xl py-2 shadow-2xl overflow-hidden",
                    isDark ? "border-white/10 bg-[#0f0f24]/95" : "border-blue-200 bg-white/95")}>
                    {[
                      { icon: Server,   label: "Sources",              action: () => { setSheet("sources"); setMenuOpen(false) } },
                      { icon: Download, label: `Clips (${recordings.length})`, action: () => { setSheet("record"); setMenuOpen(false) } },
                      { icon: Share2,   label: "Share",                action: () => { share(); setMenuOpen(false) } },
                      { icon: Info,     label: "Info",                 action: () => { setSheet("info"); setMenuOpen(false) } },
                    ].map(({ icon: Icon, label, action }) => (
                      <button key={label} onClick={action}
                        className={cn("flex w-full items-center gap-3.5 px-3.5 py-3 text-sm font-bold transition-colors",
                          isDark ? "text-indigo-100 hover:bg-white/7" : "text-blue-900 hover:bg-blue-600/5")}>
                        <Icon size={20} /> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 shrink-0 relative z-10 mx-2">
                <button onClick={() => switchStream((streamIdx - 1 + STREAMS.length) % STREAMS.length)}
                  className={cn("active:scale-95 shrink-0 transition-colors",
                    isDark ? "text-blue-400/80 hover:text-blue-300" : "text-blue-600/70 hover:text-blue-700")}>
                  <SkipBack size={32} fill="currentColor" />
                </button>

                <button onClick={togglePlay} disabled={loading}
                  className={cn("grid h-[80px] w-[80px] sm:h-[88px] sm:w-[88px] shrink-0 aspect-square place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg transition-all duration-300",
                    playing ? "shadow-[0_0_0_6px_rgba(0,140,255,0.2),0_12px_40px_rgba(0,140,255,0.5)]" : "shadow-[0_10px_36px_rgba(0,100,255,0.4)]",
                    loading ? "opacity-70" : "hover:scale-105 active:scale-95")}>
                  {loading ? <Loader2 size={36} className="animate-spin text-white" />
                    : playing ? <Pause size={38} fill="white" color="white" />
                      : <Play size={38} fill="white" color="white" className="ml-1.5" />}
                </button>

                <button onClick={() => switchStream((streamIdx + 1) % STREAMS.length)}
                  className={cn("active:scale-95 shrink-0 transition-colors",
                    isDark ? "text-blue-400/80 hover:text-blue-300" : "text-blue-600/70 hover:text-blue-700")}>
                  <SkipForward size={32} fill="currentColor" />
                </button>
              </div>

              {/* Record button */}
              <div className="shrink-0 flex items-center">
                <button onClick={recording ? stopRecording : startRecording}
                  className={cn("grid h-12 w-12 place-items-center rounded-full transition-all",
                    recording 
                      ? "bg-red-500/10 text-red-500 animate-pulse" 
                      : cn(isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-blue-900/40 hover:bg-blue-600/5 hover:text-blue-600"))}>
                  {recording ? <Square size={20} fill="currentColor" className="text-red-500" /> : <Mic size={24} />}
                </button>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 px-2">
              <button onClick={() => setMuted(!muted)} className={muted ? "text-neutral-500" : "text-cyan-500"}>
                {muted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
              <div className={cn("relative h-1.5 flex-1 rounded-full", isDark ? "bg-white/8" : "bg-blue-900/10")}>
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-100"
                  style={{ width: `${muted ? 0 : volume}%` }} />
                <input type="range" min={0} max={100} value={muted ? 0 : volume}
                  onChange={e => { setVolume(+e.target.value); setMuted(false) }}
                  className="absolute inset-y-[-8px] w-full cursor-pointer opacity-0" />
              </div>
              <span className="min-w-9 text-right text-sm font-bold opacity-60" style={{ color: "var(--app-text)" }}>
                {muted ? "0" : volume}%
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Sources sheet */}
      <Sheet open={sheet === "sources"} onClose={() => setSheet(null)} title="Audio Sources">
        {STREAMS.map((s, i) => (
          <div key={s.id} onClick={() => { switchStream(i); setSheet(null) }}
            className="flex cursor-pointer items-center gap-4 border-b py-4 hover:opacity-80 transition-opacity"
            style={{ borderColor: "var(--app-border)" }}>
            <div className={`h-2.5 w-2.5 rounded-full ${i === streamIdx ? "bg-cyan-400 shadow-[0_0_8px] shadow-cyan-400" : "bg-neutral-500"}`} />
            <div className="flex-1">
              <div className="text-[15px] font-bold" style={{ color: "var(--app-text)" }}>{s.label}</div>
              <div className="text-xs" style={{ color: "var(--app-text-muted)" }}>{s.sub}</div>
            </div>
            {i === streamIdx && <span className="rounded-full border border-cyan-500/30 bg-cyan-900/15 px-3.5 py-1 text-xs font-extrabold text-cyan-400">ACTIVE</span>}
          </div>
        ))}
      </Sheet>

      {/* Clips sheet */}
      <Sheet open={sheet === "record"} onClose={() => setSheet(null)} title="Recordings">
        {recordings.length === 0
          ? <p className="py-10 text-center text-[15px]" style={{ color: "var(--app-text-muted)" }}>No recordings yet. Tap the mic button to record.</p>
          : recordings.map((r, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 border-b py-4" style={{ borderColor: "var(--app-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold" style={{ color: "var(--app-text)" }}>{r.name}</div>
                  <div className="text-xs" style={{ color: "var(--app-text-muted)" }}>Duration: {fmt(r.dur)}</div>
                </div>
                <div className="flex gap-2.5">
                  <a href={r.url} download={`${r.name}.webm`}
                    className="grid place-items-center rounded-lg bg-cyan-900/12 p-2.5 text-cyan-400 hover:bg-cyan-900/20 transition-colors">
                    <Download size={18} />
                  </a>
                   <button onClick={() => deleteRecording(idx)}
                    className="grid place-items-center rounded-lg bg-red-900/12 p-2.5 text-red-400 hover:bg-red-900/20 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <audio controls src={r.url} className="w-full" />
            </div>
          ))}
      </Sheet>

      {/* Info sheet */}
      <Sheet open={sheet === "info"} onClose={() => setSheet(null)} title="Station Info">
        <div className="text-sm leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
          <p className="mb-4 font-medium" style={{ color: "var(--app-text)" }}><strong>Jesus Is Lord Radio</strong> — 24/7 Christian broadcast from Nakuru, Kenya.</p>
          {[
            ["Frequencies", "105.3 · 105.9 FM"],
            ["Format", "Christian / Gospel"],
            ["Broadcast", "24/7 Live"],
            ["Ministry", "Repentance & Holiness"],
            ["Location", "Nakuru, Kenya"],
            ["Listeners", `${listeners} online`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b py-2.5" style={{ borderColor: "var(--app-border)" }}>
              <span>{k}</span>
              <span className="font-bold text-cyan-500">{v}</span>
            </div>
          ))}
        </div>
      </Sheet>

    </>
  )
}
