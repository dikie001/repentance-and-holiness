/* eslint-disable react-refresh/only-export-components */
/**
 * Global Radio Context
 * Persists audio playback across all pages (background radio).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

type RadioToastVariant = "default" | "danger" | "success" | "error"

export function RadioToast({
  message,
  variant = "default",
}: {
  message: string
  variant?: RadioToastVariant
}) {
  const isError = variant === "danger" || variant === "error"
  const isSuccess = variant === "success"

  const Icon = isError ? AlertCircle : isSuccess ? CheckCircle2 : Info
  const accentColor = isError
    ? "rgb(239, 68, 68)"
    : isSuccess
      ? "rgb(34, 197, 94)"
      : "rgb(59, 130, 246)"
  const borderColor = isError
    ? "rgba(239, 68, 68, 0.25)"
    : isSuccess
      ? "rgba(34, 197, 94, 0.25)"
      : "var(--app-border)"

  return (
    <div
      className="group pointer-events-auto relative flex w-fit max-w-[calc(100vw-32px)] min-w-[300px] items-center gap-3.5 overflow-hidden rounded-2xl border p-2 shadow-2xl transition-all duration-300"
      style={{
        backgroundColor: "var(--app-nav-bg)",
        borderColor: borderColor,
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
      }}
    >
      {/* Dynamic Accent Glow */}
      <div
        className="absolute -top-10 -left-10 h-24 w-24 rounded-full opacity-[0.12] blur-3xl transition-colors duration-500"
        style={{ backgroundColor: accentColor }}
      />

      {/* Logo on Left */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-sm">
        <img
          src="/images/radio-logo.png"
          className="h-full w-full object-cover"
          alt="radio-logo"
        />
      </div>

      {/* Text in Middle */}
      <div className="min-w-0 flex-1 pr-2">
        <div className="mb-0.5 flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5"></span>
        </div>
        <div
          className="text-[14px] leading-tight font-extrabold tracking-tight"
          style={{ color: "var(--app-text)" }}
        >
          Jesus Is Lord Radio
        </div>
        <div
          className="truncate text-[11.5px] leading-relaxed font-semibold opacity-60"
          style={{ color: "var(--app-text)" }}
        >
          {message || "105.3 - 105.9 FM"}
        </div>
      </div>

      {/* Variant Icon at Far Right Middle */}
      <div className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center">
        <Icon className="h-4.5 w-4.5" style={{ color: accentColor }} />
      </div>
    </div>
  )
}

export const STREAMS = [
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
    url: "https://stream.zeno.fm/3gdtad95608uv",
  },
  {
    id: "backup-2",
    label: "Backup 2",
    sub: "Voscast",
    url: "https://station.voscast.com/5ca3d6cd7c777/",
  },
  {
    id: "backup-3",
    label: "Backup 3",
    sub: "Streema",
    url: "https://s3.radio.co/s97f38db97/listen",
  },
]

export interface Recording {
  url: string
  name: string
  dur: number
}

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
  notify: (message: string, variant?: RadioToastVariant) => void
}

const RadioContext = createContext<RadioState | null>(null)

const LS_KEYS = {
  streamIdx: "rh-radio-stream-idx",
  volume: "rh-radio-volume",
  muted: "rh-radio-muted",
  shouldResume: "rh-radio-should-resume",
} as const

const readStoredNumber = (key: string, fallback: number) => {
  if (typeof window === "undefined") return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

const readStoredBool = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback
  const raw = window.localStorage.getItem(key)
  if (raw === null) return fallback
  return raw === "1"
}

export function RadioProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamIdx, setStreamIdx] = useState(() =>
    Math.min(Math.max(readStoredNumber(LS_KEYS.streamIdx, 0), 0), STREAMS.length - 1)
  )
  const [volume, setVolumeState] = useState(() =>
    Math.min(Math.max(readStoredNumber(LS_KEYS.volume, 82), 0), 100)
  )
  const [muted, setMutedState] = useState(() =>
    readStoredBool(LS_KEYS.muted, false)
  )
  const [listeners, setListeners] = useState(48)

  // Recording State
  const [recording, setRecording] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [recDuration, setRecDuration] = useState(0)
  const [inlineToast, setInlineToast] = useState<{
    message: string
    variant: RadioToastVariant
  } | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const srcRef = useRef<MediaElementAudioSourceNode | null>(null)
  const streamSrcRef = useRef<MediaStreamAudioSourceNode | null>(null)

  // Recording Refs
  const recRef = useRef<MediaRecorder | null>(null)
  const recChunks = useRef<Blob[]>([])
  const recTimer = useRef<number | null>(null)
  const recDurationRef = useRef(0)
  const toastTimerRef = useRef<number | null>(null)

  const streamIdxRef = useRef(streamIdx)
  const failedAttemptsRef = useRef(0)
  const isCORSFallbackRef = useRef(false)
  const handleErrorRef = useRef<() => void>(() => {})
  const shouldResumeRef = useRef(readStoredBool(LS_KEYS.shouldResume, false))

  useEffect(() => {
    streamIdxRef.current = streamIdx
  }, [streamIdx])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(LS_KEYS.streamIdx, String(streamIdx))
  }, [streamIdx])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(LS_KEYS.volume, String(volume))
  }, [volume])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(LS_KEYS.muted, muted ? "1" : "0")
  }, [muted])

  useEffect(() => {
    if (typeof window === "undefined") return
    shouldResumeRef.current = playing
    window.localStorage.setItem(LS_KEYS.shouldResume, playing ? "1" : "0")
  }, [playing])

  useEffect(() => {
    const a = new Audio()
    // Start with anonymous to support visualizer
    a.crossOrigin = "anonymous"
    audioRef.current = a

    a.addEventListener("playing", () => {
      setPlaying(true)
      setLoading(false)
      setError(null)
      failedAttemptsRef.current = 0
      // Ensure AudioContext is running when playback starts
      if (ctxRef.current && ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {})
      }
    })
    a.addEventListener("pause", () => setPlaying(false))
    a.addEventListener("waiting", () => setLoading(true))
    a.addEventListener("canplay", () => setLoading(false))
    a.addEventListener("error", () => handleErrorRef.current())

    a.src = STREAMS[streamIdxRef.current].url
    a.volume = volume / 100
    a.load()

    // Best effort restore when app is reopened. Browsers may still gate autoplay.
    if (shouldResumeRef.current) {
      setLoading(true)
      try {
        ensureCtx()
      } catch {
        /* */
      }
      a.play()
        .then(() => {
          notify(`Resumed: ${STREAMS[streamIdxRef.current].label}`, "success")
        })
        .catch(() => {
          setLoading(false)
        })
    }

    return () => {
      a.pause()
      a.src = ""
      if (recTimer.current) clearInterval(recTimer.current)
    }
  }, [])

  /* ── Fake listeners count ─── */
  useEffect(() => {
    const id = setInterval(
      () =>
        setListeners((n) =>
          Math.max(
            1,
            n + (Math.random() > 0.5 ? 1 : -1) * ~~(Math.random() * 5)
          )
        ),
      6000
    )
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

  const notify = useCallback(
    (message: string, variant: RadioToastVariant = "default") => {
      setInlineToast({ message, variant })
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
      toastTimerRef.current = window.setTimeout(() => {
        setInlineToast(null)
      }, 3200)
    },
    []
  )

  const ensureCtx = useCallback(() => {
    const a = audioRef.current
    if (!a) return

    // Create AudioContext if it doesn't exist
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      ctxRef.current = new AC()
    }
    const ctx = ctxRef.current

    // Always attempt to resume on user interaction or state change
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }

    // If direct media source fails because of CORS, analyze the element output stream instead.
    if (isCORSFallbackRef.current) {
      if (!streamSrcRef.current) {
        const capture =
          ((
            a as HTMLAudioElement & {
              captureStream?: () => MediaStream
              mozCaptureStream?: () => MediaStream
            }
          ).captureStream?.() ||
            (
              a as HTMLAudioElement & {
                captureStream?: () => MediaStream
                mozCaptureStream?: () => MediaStream
              }
            ).mozCaptureStream?.()) ??
          null

        if (capture) {
          streamSrcRef.current = ctx.createMediaStreamSource(capture)
        }
      }

      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser()
        analyserRef.current.fftSize = 2048
        analyserRef.current.smoothingTimeConstant = 0.65
      }

      if (streamSrcRef.current) {
        try {
          streamSrcRef.current.disconnect()
        } catch {
          /* */
        }
        streamSrcRef.current.connect(analyserRef.current)
      }

      return
    }

    // Try to create source from audio element
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
      analyserRef.current.fftSize = 2048
      analyserRef.current.smoothingTimeConstant = 0.65
      gainRef.current.connect(analyserRef.current)
      analyserRef.current.connect(ctx.destination)
    }
  }, [muted, volume])

  const togglePlay = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      return
    }
    try {
      ensureCtx()
    } catch {
      /* */
    }
    setLoading(true)
    setError(null)
    a.play()
      .then(() => {
        notify(`Connected: ${STREAMS[streamIdxRef.current].label}`, "success")
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "NotAllowedError") {
          notify("Playback blocked - tap again", "danger")
        }
        setLoading(false)
      })
  }, [playing, ensureCtx, notify])

  const switchStream = useCallback(
    (idx: number, auto?: boolean) => {
      const a = audioRef.current
      if (!a) return
      if (!auto) failedAttemptsRef.current = 0

      // Reset CORS state when switching
      isCORSFallbackRef.current = false
      a.crossOrigin = "anonymous"

      // Feedback immediately with a consistent ID to replace previous ones
      if (auto) {
        notify(`Source error - trying ${STREAMS[idx].label}...`, "danger")
      } else {
        notify(`Connecting to ${STREAMS[idx].label}...`)
      }

      try {
        srcRef.current?.disconnect()
      } catch {
        /* */
      }
      try {
        streamSrcRef.current?.disconnect()
      } catch {
        /* */
      }
      // srcRef.current = null; // Do NOT reset this as earlier identified
      gainRef.current = null
      analyserRef.current = null
      streamSrcRef.current = null
      a.pause()
      a.src = STREAMS[idx].url
      setStreamIdx(idx)
      streamIdxRef.current = idx
      setError(null)
      setLoading(true)
      a.load()
      try {
        ensureCtx()
      } catch {
        /* */
      }
      a.play()
        .then(() => {
          // Direct success feedback
          notify(`Connected: ${STREAMS[idx].label}`, "success")
        })
        .catch((err) => {
          if (!auto && err instanceof Error && err.name === "NotAllowedError") {
            notify("Tap play to start", "danger")
          }
        })
    },
    [ensureCtx, notify]
  )

  useEffect(() => {
    if (!playing) return

    // Self-heal analyser wiring for streams that start but expose delayed media graph data.
    const id = window.setInterval(() => {
      if (!analyserRef.current) {
        try {
          ensureCtx()
        } catch {
          /* */
        }
      }
    }, 1200)

    return () => window.clearInterval(id)
  }, [playing, streamIdx, ensureCtx])

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
        try {
          ensureCtx()
        } catch {
          /* */
        }
        a.play().catch(() => {}) // Audio only now
        return
      }

      setLoading(false)
      setPlaying(false)
      failedAttemptsRef.current += 1
      if (failedAttemptsRef.current < STREAMS.length) {
        const nextIdx = (streamIdxRef.current + 1) % STREAMS.length
        switchStream(nextIdx, true)
      } else {
        notify("Stream failed - try another server", "danger")
      }
    }
  }, [switchStream, notify, ensureCtx])

  const setVolume = useCallback((v: number) => setVolumeState(v), [])
  const setMuted = useCallback((m: boolean) => setMutedState(m), [])

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Jesus Is Lord Radio",
      artist: "Repentance & Holiness",
      album: STREAMS[streamIdx].label,
      artwork: [
        { src: "/images/radio-logo.png", sizes: "96x96", type: "image/png" },
        {
          src: "/images/radio-logo.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    })

    navigator.mediaSession.playbackState = playing ? "playing" : "paused"

    navigator.mediaSession.setActionHandler("play", () => {
      const a = audioRef.current
      if (!a) return
      try {
        ensureCtx()
      } catch {
        /* */
      }
      a.play().catch(() => {})
    })
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause()
    })
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      const prev = (streamIdxRef.current - 1 + STREAMS.length) % STREAMS.length
      switchStream(prev)
    })
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      const next = (streamIdxRef.current + 1) % STREAMS.length
      switchStream(next)
    })

    return () => {
      if (!("mediaSession" in navigator)) return
      navigator.mediaSession.setActionHandler("play", null)
      navigator.mediaSession.setActionHandler("pause", null)
      navigator.mediaSession.setActionHandler("previoustrack", null)
      navigator.mediaSession.setActionHandler("nexttrack", null)
    }
  }, [playing, streamIdx, switchStream, ensureCtx])

  const startRecording = useCallback(async () => {
    try {
      if (!analyserRef.current) {
        notify("Start radio first", "danger")
        return
      }

      const ctx = analyserRef.current.context as AudioContext
      const dest = ctx.createMediaStreamDestination()
      analyserRef.current.connect(dest)

      recChunks.current = []
      recDurationRef.current = 0
      setRecDuration(0)

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm"
      const recorder = new MediaRecorder(dest.stream, { mimeType })

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recChunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(recChunks.current, { type: "audio/webm" })
        setRecordings((prev) => [
          {
            url: URL.createObjectURL(blob),
            name: `Clip ${new Date().toLocaleTimeString([], { hour12: false })}`,
            dur: recDurationRef.current,
          },
          ...prev,
        ])
      }

      recorder.start(1000)
      recRef.current = recorder
      setRecording(true)

      notify("Recording started")

      recTimer.current = window.setInterval(() => {
        recDurationRef.current++
        setRecDuration(recDurationRef.current)
      }, 1000)
    } catch {
      notify("Failed to start recording", "danger")
    }
  }, [notify])

  const stopRecording = useCallback(() => {
    if (recRef.current && recRef.current.state !== "inactive") {
      recRef.current.stop()
    }
    if (recTimer.current) {
      clearInterval(recTimer.current)
      recTimer.current = null
    }
    setRecording(false)
    notify("Recording saved to Clips", "success")
  }, [notify])

  const deleteRecording = useCallback((idx: number) => {
    setRecordings((prev) => {
      const next = [...prev]
      if (next[idx]) {
        URL.revokeObjectURL(next[idx].url)
        next.splice(idx, 1)
      }
      return next
    })
  }, [])

  // Keyboard shortcuts (Enter & Space to Toggle Radio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // If user typing in input, textarea, or contentEditable - skip
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  return (
    <RadioContext.Provider
      value={{
        playing,
        loading,
        error,
        streamIdx,
        volume,
        muted,
        listeners,
        analyserRef,
        togglePlay,
        switchStream,
        setVolume,
        setMuted,
        recording,
        recordings,
        recDuration,
        startRecording,
        stopRecording,
        deleteRecording,
        notify,
      }}
    >
      {children}
      {inlineToast && (
        <div className="pointer-events-none fixed top-4 left-1/2 z-[500] -translate-x-1/2 px-3">
          <RadioToast
            message={inlineToast.message}
            variant={inlineToast.variant}
          />
        </div>
      )}
    </RadioContext.Provider>
  )
}

export function useRadio() {
  const ctx = useContext(RadioContext)
  if (!ctx) throw new Error("useRadio must be used inside <RadioProvider>")
  return ctx
}
