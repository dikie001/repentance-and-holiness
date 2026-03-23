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
  switchStream: (idx: number) => void
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

  /* ── Audio element setup (once) ─── */
  useEffect(() => {
    const a = new Audio()
    a.crossOrigin = "anonymous"
    audioRef.current = a

    a.addEventListener("playing", () => { setPlaying(true);  setLoading(false); setError(null) })
    a.addEventListener("pause",   () => setPlaying(false))
    a.addEventListener("waiting", () => setLoading(true))
    a.addEventListener("canplay", () => setLoading(false))
    a.addEventListener("error",   () => { setLoading(false); setError("Stream failed – try another server"); setPlaying(false) })

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
    a.play().catch(() => { setError("Playback blocked – tap again"); setLoading(false) })
  }, [playing, ensureCtx])

  const switchStream = useCallback((idx: number) => {
    const a = audioRef.current
    if (!a) return
    try { srcRef.current?.disconnect() } catch { /* */ }
    srcRef.current = null; gainRef.current = null; analyserRef.current = null
    a.pause()
    a.src = STREAMS[idx].url
    setStreamIdx(idx)
    setError(null)
    setLoading(true)
    a.load()
    try { ensureCtx() } catch { /* */ }
    a.play().catch(() => setError("Tap play to start"))
    toast.success(`Switched to ${STREAMS[idx].label}`, {
      icon: <img src="/images/radio-logo.png" alt="" className="w-5 h-5 rounded-full object-cover shadow border border-white/20" />
    })
  }, [ensureCtx])

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
