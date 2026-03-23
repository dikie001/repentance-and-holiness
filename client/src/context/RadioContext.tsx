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
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

export function RadioToast({ message, variant = "default" }: { message: string, variant?: "default" | "danger" | "success" | "error" }) {
  const isError = variant === "danger" || variant === "error"
  const isSuccess = variant === "success"
  
  const Icon = isError ? AlertCircle : isSuccess ? CheckCircle2 : Info
  const accentColor = isError ? "rgb(239, 68, 68)" : isSuccess ? "rgb(34, 197, 94)" : "rgb(59, 130, 246)"
  const borderColor = isError ? "rgba(239, 68, 68, 0.4)" : isSuccess ? "rgba(34, 197, 94, 0.4)" : "var(--app-border)"

  return (
    <div className="group relative flex items-center gap-4 rounded-[20px] border p-2.5 shadow-2xl w-[340px] max-w-[calc(100vw-32px)] pointer-events-auto transition-all duration-300 overflow-hidden"
      style={{ 
        backgroundColor: "var(--app-nav-bg)", 
        borderColor: borderColor,
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)"
      }}>
      
      {/* Dynamic Accent Glow */}
      <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full opacity-[0.2] blur-3xl transition-colors duration-500"
        style={{ backgroundColor: accentColor }} />

      {/* Logo on Left */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-sm">
        <img src="/images/radio-logo.png" className="h-full w-full object-cover" alt="radio-logo" />
      </div>

      {/* Text in Middle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
          </span>
          <span className="text-[9px] font-black tracking-[0.15em] uppercase text-red-500 leading-none">LIVE</span>
        </div>
        <div className="text-[14.5px] font-extrabold tracking-tight leading-tight" style={{ color: "var(--app-text)" }}>
          Jesus Is Lord Radio
        </div>
        <div className="text-[12px] font-semibold leading-relaxed truncate opacity-60" style={{ color: "var(--app-text)" }}>
          {message || "105.3 - 105.9 FM"}
        </div>
      </div>

      {/* Variant Icon at Far Right Middle */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">
         <Icon className="h-5.5 w-5.5" style={{ color: accentColor }} />
      </div>
    </div>
  )
}

export const STREAMS = [
  { id: "primary",  label: "Main Server", sub: "Radio.co",  url: "https://s3.radio.co/s97f38db97/listen" },
  { id: "backup-1", label: "Backup 1",    sub: "Zeno FM",   url: "https://stream.zeno.fm/3gdtad95608uv" },
  { id: "backup-2", label: "Backup 2",    sub: "Voscast",   url: "https://station.voscast.com/5ca3d6cd7c777/" },
  { id: "backup-3", label: "Backup 3",    sub: "Streema",   url: "https://s3.radio.co/s97f38db97/listen" },
]

export interface Recording { url: string; name: string; dur: number }

interface RadioState {
  playing: boolean
  loading: boolean
  error: string | null
  streamIdx: number
  volume: number
  muted: boolean
  listeners: number
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  // Recording state
  recording: boolean
  recordings: Recording[]
  recDuration: number
  // Methods
  togglePlay: () => void
  switchStream: (idx: number, auto?: boolean) => void
  setVolume: (v: number) => void
  setMuted: (m: boolean) => void
  startRecording: () => Promise<void>
  stopRecording: () => void
  deleteRecording: (idx: number) => void
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
  
  // Recording State
  const [recording, setRecording]   = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [recDuration, setRecDuration] = useState(0)

  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const ctxRef      = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainRef     = useRef<GainNode | null>(null)
  const srcRef      = useRef<MediaElementAudioSourceNode | null>(null)
  
  // Recording Refs
  const recRef      = useRef<MediaRecorder | null>(null)
  const recChunks   = useRef<Blob[]>([])
  const recTimer    = useRef<number | null>(null)
  const recDurationRef = useRef(0)

  const streamIdxRef = useRef(streamIdx)
  const failedAttemptsRef = useRef(0)
  const isCORSFallbackRef = useRef(false)
  const handleErrorRef = useRef<() => void>(() => {})

  useEffect(() => { streamIdxRef.current = streamIdx }, [streamIdx])

  useEffect(() => {
    const a = new Audio()
    // Start with anonymous to support visualizer
    a.crossOrigin = "anonymous"
    audioRef.current = a

    a.addEventListener("playing", () => { 
      setPlaying(true);  
      setLoading(false); 
      setError(null); 
      failedAttemptsRef.current = 0 
      // Ensure AudioContext is running when playback starts
      if (ctxRef.current && ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {})
      }
    })
    a.addEventListener("pause",   () => setPlaying(false))
    a.addEventListener("waiting", () => setLoading(true))
    a.addEventListener("canplay", () => setLoading(false))
    a.addEventListener("error",   () => handleErrorRef.current())

    a.src = STREAMS[0].url
    a.volume = volume / 100
    a.load()

    return () => { 
      a.pause(); 
      a.src = "";
      if (recTimer.current) clearInterval(recTimer.current);
    }
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
    
    // If we're in CORS fallback mode, skip AudioContext source (it would be silent)
    if (isCORSFallbackRef.current) {
       if (ctxRef.current?.state === "running") {
          ctxRef.current.suspend().catch(() => {})
       }
       return
    }

    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      ctxRef.current = new AC()
    }
    const ctx = ctxRef.current
    
    // Always attempt to resume on user interaction or state change
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }

    if (!srcRef.current) {
       try {
          srcRef.current = ctx.createMediaElementSource(a)
       } catch (e) {
          console.warn("AudioContext source creation failed:", e)
          return
       }
    }
    
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
    a.play().then(() => {
      toast.custom(() => <RadioToast message={`Connected: ${STREAMS[streamIdxRef.current].label}`} variant="success" />, { id: "radio-status" })
    }).catch((err) => {
      if (err instanceof Error && err.name === "NotAllowedError") {
        toast.custom(() => <RadioToast message="Playback blocked – tap again" variant="danger" />, { id: "radio-status" })
      }
      setLoading(false)
    })
  }, [playing, ensureCtx])

  const switchStream = useCallback((idx: number, auto?: boolean) => {
    const a = audioRef.current
    if (!a) return
    if (!auto) failedAttemptsRef.current = 0
    
    // Reset CORS state when switching
    isCORSFallbackRef.current = false
    a.crossOrigin = "anonymous"
    
    // Feedback immediately with a consistent ID to replace previous ones
    if (auto) {
      toast.custom(() => <RadioToast message={`Source error – trying ${STREAMS[idx].label}...`} variant="danger" />, { id: "radio-status" })
    } else {
      toast.custom(() => <RadioToast message={`Connecting to ${STREAMS[idx].label}...`} />, { id: "radio-status" })
    }

    try { srcRef.current?.disconnect() } catch { /* */ }
    // srcRef.current = null; // Do NOT reset this as earlier identified
    gainRef.current = null; analyserRef.current = null
    a.pause()
    a.src = STREAMS[idx].url
    setStreamIdx(idx)
    streamIdxRef.current = idx
    setError(null)
    setLoading(true)
    a.load()
    try { ensureCtx() } catch { /* */ }
    a.play().then(() => {
      // Direct success feedback
      toast.custom(() => <RadioToast message={`Connected: ${STREAMS[idx].label}`} variant="success" />, { id: "radio-status" })
    }).catch((err) => {
      if (!auto && err instanceof Error && err.name === "NotAllowedError") {
        toast.custom(() => <RadioToast message="Tap play to start" variant="danger" />, { id: "radio-status" })
      }
    })
  }, [ensureCtx])

  useEffect(() => {
    handleErrorRef.current = () => {
      const a = audioRef.current
      if (!a) return

      // If we failed with CORS, try again WITHOUT CORS before skipping to next server
      if (a.crossOrigin === "anonymous" && !isCORSFallbackRef.current) {
        console.warn("Retrying stream without CORS...")
        isCORSFallbackRef.current = true
        a.crossOrigin = null
        a.load()
        a.play().catch(() => {}) // Audio only now
        return
      }

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

  const startRecording = useCallback(async () => {
    try {
      if (!analyserRef.current) {
        toast.custom(() => <RadioToast message="Start radio first" variant="danger" />, { position: "top-center" })
        return
      }
      
      const ctx = analyserRef.current.context as AudioContext
      const dest = ctx.createMediaStreamDestination()
      analyserRef.current.connect(dest)

      recChunks.current = []
      recDurationRef.current = 0
      setRecDuration(0)
      
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm"
      const recorder = new MediaRecorder(dest.stream, { mimeType })
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recChunks.current.push(e.data)
      }
      
      recorder.onstop = () => {
        const blob = new Blob(recChunks.current, { type: "audio/webm" })
        setRecordings(prev => [
          { 
            url: URL.createObjectURL(blob), 
            name: `Clip ${new Date().toLocaleTimeString([], { hour12: false })}`, 
            dur: recDurationRef.current 
          }, 
          ...prev
        ])
      }

      recorder.start(1000)
      recRef.current = recorder
      setRecording(true)
      
      toast.custom(() => <RadioToast message="Recording started" />)
      
      recTimer.current = window.setInterval(() => {
        recDurationRef.current++
        setRecDuration(recDurationRef.current)
      }, 1000)
    } catch {
      toast.custom(() => <RadioToast message="Failed to start recording" variant="danger" />, { position: "top-center" })
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (recRef.current && recRef.current.state !== "inactive") {
      recRef.current.stop()
    }
    if (recTimer.current) {
      clearInterval(recTimer.current)
      recTimer.current = null
    }
    setRecording(false)
    toast.custom(() => <RadioToast message="Recording saved to Clips" />)
  }, [])

  const deleteRecording = useCallback((idx: number) => {
    setRecordings(prev => {
      const next = [...prev]
      if (next[idx]) {
        URL.revokeObjectURL(next[idx].url)
        next.splice(idx, 1)
      }
      return next
    })
  }, [])

  return (
    <RadioContext.Provider value={{
      playing, loading, error, streamIdx, volume, muted, listeners,
      analyserRef, togglePlay, switchStream, setVolume, setMuted,
      recording, recordings, recDuration,
      startRecording, stopRecording, deleteRecording,
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
