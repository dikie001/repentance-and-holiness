/* eslint-disable react-refresh/only-export-components */
/**
 * Global Radio Context
 * Persists audio playback across all pages (background radio).
 */
import {
  createContext, useCallback, useContext, useEffect,
  useRef, useState, type ReactNode,
} from "react"
import { toast } from "sonner"

export function RadioToast({ message, variant = "default" }: { message: string, variant?: "default" | "danger" }) {
  const isDanger = variant === "danger"
  return (
    <div className={`flex items-center gap-3.5 rounded-2xl border p-3 pl-3.5 shadow-2xl w-[320px] max-w-full m-0 pointer-events-auto transition-all ${
      isDanger ? "bg-red-50 border-red-200 text-red-950" : "bg-[#0f0f24] border-white/10 text-white"
    }`}>
      <img src="/images/radio-logo.png" className="h-11 w-11 shrink-0 rounded-full object-cover shadow-sm bg-black" alt="" />
      <div>
        <div className={`text-[15px] font-bold leading-tight mb-0.5 ${isDanger ? "text-red-950" : "text-white"}`}>Jesus Is Lord Radio</div>
        <div className={`text-xs font-medium ${isDanger ? "text-red-800" : "text-slate-400"}`}>{message}</div>
      </div>
    </div>
  )
}

export const STREAMS = [
  { id: "primary",  label: "Main Server", sub: "Radio.co",  url: "https://s3.radio.co/s97f38db97/listen" },
  { id: "backup-1", label: "Backup 1",    sub: "Zeno FM",   url: "https://stream-155.zeno.fm/3gdtad95608uv" },
  { id: "backup-2", label: "Backup 2",    sub: "Voscast",   url: "http://station.voscast.com/5ca3d6cd7c777/" },
  { id: "backup-3", label: "Backup 3",    sub: "Streema",   url: "https://s3.radio.co/s97f38db97/listen" },
]

interface RadioState {
  playing: boolean
  loading: boolean
  error: string | null
  streamIdx: number
  volume: number
  muted: boolean
  listeners: number
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  togglePlay: () => void
  switchStream: (idx: number, auto?: boolean) => void
  setVolume: (v: number) => void
  setMuted: (m: boolean) => void
}

const RadioContext = createContext<RadioState | null>(null)

export function RadioProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState<string | null>(null)
  const [streamIdx, setStreamIdx] = useState(0)
  const [volume, setVolumeState]  = useState(82)
  const [muted, setMutedState]    = useState(false)
  const [listeners, setListeners] = useState(48)

  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const ctxRef      = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainRef     = useRef<GainNode | null>(null)
  const srcRef      = useRef<MediaElementAudioSourceNode | null>(null)

  const streamIdxRef = useRef(streamIdx)
  const failedAttemptsRef = useRef(0)
  const handleErrorRef = useRef<() => void>(() => {})

  useEffect(() => { streamIdxRef.current = streamIdx }, [streamIdx])

  /* ── Audio element setup (once) ─── */
  useEffect(() => {
    const a = new Audio()
    a.crossOrigin = "anonymous"
    audioRef.current = a

    a.addEventListener("playing", () => { setPlaying(true);  setLoading(false); setError(null); failedAttemptsRef.current = 0 })
    a.addEventListener("pause",   () => setPlaying(false))
    a.addEventListener("waiting", () => setLoading(true))
    a.addEventListener("canplay", () => setLoading(false))
    a.addEventListener("error",   () => handleErrorRef.current())

    a.src = STREAMS[0].url
    a.volume = 0.82
    a.load()

    return () => { a.pause(); a.src = "" }
  }, [])

  /* ── Fake listeners count ─── */
  useEffect(() => {
    const id = setInterval(() =>
      setListeners(n => Math.max(1, n + (Math.random() > 0.5 ? 1 : -1) * ~~(Math.random() * 5))), 6000)
    return () => clearInterval(id)
  }, [])

  /* ── Volume / mute control ─── */
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = muted ? 0 : volume / 100
    } else if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100
    }
  }, [volume, muted])

  const ensureCtx = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctxRef.current = new AC()
    }
    const ctx = ctxRef.current
    if (ctx.state === "suspended") ctx.resume().catch(() => {})

    if (!srcRef.current) srcRef.current = ctx.createMediaElementSource(a)
    if (!gainRef.current) {
      gainRef.current = ctx.createGain()
      gainRef.current.gain.value = muted ? 0 : volume / 100
      srcRef.current.connect(gainRef.current)
    }
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser()
      analyserRef.current.fftSize = 1024
      analyserRef.current.smoothingTimeConstant = 0.75
      gainRef.current.connect(analyserRef.current)
      analyserRef.current.connect(ctx.destination)
    }
  }, [muted, volume])

  const togglePlay = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); return }
    try { ensureCtx() } catch { /* */ }
    setLoading(true)
    setError(null)
    a.play().catch(() => {
      toast.custom(() => <RadioToast message="Playback blocked – tap again" variant="danger" />, { position: "top-center" })
      setLoading(false)
    })
  }, [playing, ensureCtx])

  const switchStream = useCallback((idx: number, auto?: boolean) => {
    const a = audioRef.current
    if (!a) return
    if (!auto) failedAttemptsRef.current = 0
    try { srcRef.current?.disconnect() } catch { /* */ }
    srcRef.current = null; gainRef.current = null; analyserRef.current = null
    a.pause()
    a.src = STREAMS[idx].url
    setStreamIdx(idx)
    setError(null)
    setLoading(true)
    a.load()
    try { ensureCtx() } catch { /* */ }
    a.play().catch(() => {
      if (!auto) toast.custom(() => <RadioToast message="Tap play to start" variant="danger" />, { position: "top-center" })
    })
    if (!auto) {
      toast.custom(() => <RadioToast message={`Switched to ${STREAMS[idx].label}`} />)
    }
  }, [ensureCtx])

  useEffect(() => {
    handleErrorRef.current = () => {
      setLoading(false); setPlaying(false);
      failedAttemptsRef.current += 1;
      if (failedAttemptsRef.current < STREAMS.length) {
         const nextIdx = (streamIdxRef.current + 1) % STREAMS.length
         switchStream(nextIdx, true)
      } else {
         toast.custom(() => <RadioToast message="Stream failed – try another server" variant="danger" />, { position: "top-center" })
      }
    }
  }, [switchStream])

  const setVolume = useCallback((v: number) => setVolumeState(v), [])
  const setMuted  = useCallback((m: boolean) => setMutedState(m), [])

  return (
    <RadioContext.Provider value={{
      playing, loading, error, streamIdx, volume, muted, listeners,
      analyserRef, togglePlay, switchStream, setVolume, setMuted,
    }}>
      {children}
    </RadioContext.Provider>
  )
}

export function useRadio() {
  const ctx = useContext(RadioContext)
  if (!ctx) throw new Error("useRadio must be used inside <RadioProvider>")
  return ctx
}
