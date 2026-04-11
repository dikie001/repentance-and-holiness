/* eslint-disable react-refresh/only-export-components */
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
        borderColor,
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
      }}
    >
      <div
        className="absolute -top-10 -left-10 h-24 w-24 rounded-full opacity-[0.12] blur-3xl transition-colors duration-500"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-sm">
        <img
          src="/images/radio-logo.png"
          className="h-full w-full object-cover"
          alt="radio-logo"
        />
      </div>

      <div className="min-w-0 flex-1 pr-2">
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

      <div className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center">
        <Icon className="h-4.5 w-4.5" style={{ color: accentColor }} />
      </div>
    </div>
  )
}

export const STREAMS = [
  {
    id: "radio-co",
    label: "Jesus Is Lord Radio",
    sub: "Primary Stream",
    url: "https://s3.radio.co/s97f38db97/listen",
  },
  {
    id: "voscast",
    label: "Jesus Is Lord Radio",
    sub: "Backup Stream",
    url: "http://station.voscast.com/5ca3d6cd7c777/",
  },
  {
    id: "zeno",
    label: "Jesus Is Lord Radio",
    sub: "Alternative Stream",
    url: "https://stream-155.zeno.fm/3gdtad95608uv?zs=WOywo-IiRiexGZXqWFKejQ",
  },
] as const

export interface Recording {
  url: string
  name: string
  dur: number
}

interface RadioState {
  playing: boolean
  loading: boolean
  loadingMsg: string
  error: string | null
  streamIdx: number
  volume: number
  muted: boolean
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  recording: boolean
  recordings: Recording[]
  recDuration: number
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

const LOADING_MSGS = [
  { after: 0, msg: "Connecting..." },
  { after: 4, msg: "Still buffering..." },
  { after: 8, msg: "Taking a while, please wait..." },
  { after: 14, msg: "Trying next server..." },
  { after: 20, msg: "Signal weak - check your connection" },
]

export function RadioProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0].msg)
  const [error, setError] = useState<string | null>(null)
  const [streamIdx, setStreamIdx] = useState(() =>
    Math.min(
      Math.max(readStoredNumber(LS_KEYS.streamIdx, 0), 0),
      STREAMS.length - 1
    )
  )
  const [volume, setVolumeState] = useState(() =>
    Math.min(Math.max(readStoredNumber(LS_KEYS.volume, 82), 0), 100)
  )
  const [muted, setMutedState] = useState(() =>
    readStoredBool(LS_KEYS.muted, false)
  )
  const [recording, setRecording] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [recDuration, setRecDuration] = useState(0)
  const [inlineToast, setInlineToast] = useState<{
    message: string
    variant: RadioToastVariant
  } | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const recChunks = useRef<Blob[]>([])
  const recTimer = useRef<number | null>(null)
  const recDurationRef = useRef(0)
  const toastTimerRef = useRef<number | null>(null)
  const loadingTimerRef = useRef<number | null>(null)
  const connectionStartRef = useRef<number>(0)
  const streamIdxRef = useRef(streamIdx)
  const failedAttemptsRef = useRef(0)
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

  const startLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current) clearInterval(loadingTimerRef.current)
    connectionStartRef.current = Date.now()
    setLoadingMsg(LOADING_MSGS[0].msg)
    loadingTimerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - connectionStartRef.current) / 1000
      let message = LOADING_MSGS[0].msg
      for (const entry of LOADING_MSGS) {
        if (elapsed >= entry.after) message = entry.msg
      }
      setLoadingMsg(message)
    }, 1000)
  }, [])

  const stopLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current)
      loadingTimerRef.current = null
    }
    setLoadingMsg(LOADING_MSGS[0].msg)
  }, [])

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

  useEffect(() => {
    const audio = new Audio()
    audio.preload = "none"
    audioRef.current = audio

    const onPlaying = () => {
      setPlaying(true)
      setLoading(false)
      setError(null)
      failedAttemptsRef.current = 0
      stopLoadingTimer()
    }
    const onPause = () => setPlaying(false)
    const onWaiting = () => setLoading(true)
    const onCanPlay = () => setLoading(false)
    const onError = () => handleErrorRef.current()

    audio.addEventListener("playing", onPlaying)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("waiting", onWaiting)
    audio.addEventListener("canplay", onCanPlay)
    audio.addEventListener("error", onError)

    audio.src = STREAMS[streamIdxRef.current].url
    audio.volume = muted ? 0 : volume / 100
    audio.load()

    if (shouldResumeRef.current) {
      setLoading(true)
      startLoadingTimer()
      audio
        .play()
        .then(() => {
          notify(`Resumed: ${STREAMS[streamIdxRef.current].label}`, "success")
        })
        .catch(() => {
          setLoading(false)
          stopLoadingTimer()
        })
    }

    return () => {
      audio.pause()
      audio.src = ""
      audio.removeEventListener("playing", onPlaying)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("waiting", onWaiting)
      audio.removeEventListener("canplay", onCanPlay)
      audio.removeEventListener("error", onError)
      if (recTimer.current) clearInterval(recTimer.current)
      stopLoadingTimer()
    }
  }, [notify, startLoadingTimer, stopLoadingTimer])

  useEffect(() => {
    if (!audioRef.current) return

    const setupAnalyser = () => {
      try {
        const ctx = new (
          window.AudioContext || (window as any).webkitAudioContext
        )()
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.85
        const source = ctx.createMediaElementSource(audioRef.current!)
        source.connect(analyser)
        analyser.connect(ctx.destination)
        analyserRef.current = analyser
      } catch (e) {
        console.warn("Analyser setup failed", e)
      }
    }

    audioRef.current.addEventListener("play", setupAnalyser, { once: true })
    return () => audioRef.current?.removeEventListener("play", setupAnalyser)
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = muted ? 0 : volume / 100
  }, [volume, muted])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      stopLoadingTimer()
      return
    }

    if (!audio.src || audio.src === window.location.href) {
      audio.src = STREAMS[streamIdxRef.current].url
      audio.load()
    }

    setLoading(true)
    setError(null)
    startLoadingTimer()

    audio
      .play()
      .then(() => {
        notify(`Connected: ${STREAMS[streamIdxRef.current].label}`, "success")
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "NotAllowedError") {
          notify("Playback blocked - tap again", "danger")
          setLoading(false)
          stopLoadingTimer()
          return
        }

        handleErrorRef.current()
      })
  }, [playing, notify, startLoadingTimer, stopLoadingTimer])

  const switchStream = useCallback(
    (idx: number, auto?: boolean) => {
      const audio = audioRef.current
      if (!audio) return
      if (!auto) failedAttemptsRef.current = 0

      if (auto) {
        notify(`Source error - trying ${STREAMS[idx].label}...`, "danger")
      }

      audio.pause()
      audio.src = STREAMS[idx].url
      setStreamIdx(idx)
      streamIdxRef.current = idx
      setError(null)
      setLoading(true)
      startLoadingTimer()
      audio.load()

      audio
        .play()
        .then(() => {
          notify(`Connected: ${STREAMS[idx].label}`, "success")
        })
        .catch((err) => {
          if (!auto && err instanceof Error && err.name === "NotAllowedError") {
            notify("Tap play to start", "danger")
            setLoading(false)
            stopLoadingTimer()
            return
          }

          handleErrorRef.current()
        })
    },
    [notify, startLoadingTimer, stopLoadingTimer]
  )

  useEffect(() => {
    handleErrorRef.current = () => {
      setLoading(false)
      setPlaying(false)
      stopLoadingTimer()
      failedAttemptsRef.current += 1

      if (failedAttemptsRef.current < STREAMS.length) {
        const nextIdx = (streamIdxRef.current + 1) % STREAMS.length
        switchStream(nextIdx, true)
        return
      }

      setError("All servers failed. Check your connection and try again.")
      notify("All servers failed - check your connection", "danger")
      failedAttemptsRef.current = 0
    }
  }, [notify, stopLoadingTimer, switchStream])

  const setVolume = useCallback((value: number) => setVolumeState(value), [])
  const setMuted = useCallback((value: boolean) => setMutedState(value), [])

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
        { src: "/images/radio-logo.png", sizes: "192x192", type: "image/png" },
      ],
    })

    navigator.mediaSession.playbackState = playing ? "playing" : "paused"
    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play().catch(() => {})
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
  }, [playing, streamIdx, switchStream])

  const startRecording = useCallback(async () => {
    try {
      if (!playing) {
        notify("Radio must be playing to record", "danger")
        return
      }

      const audio = audioRef.current
      if (!audio) {
        notify("Radio is unavailable right now", "danger")
        return
      }

      const media = audio as HTMLAudioElement & {
        captureStream?: () => MediaStream
        mozCaptureStream?: () => MediaStream
      }

      let capture: MediaStream | null = null
      try {
        capture = media.captureStream?.() ?? media.mozCaptureStream?.() ?? null
      } catch {
        capture = null
      }

      if (!capture || capture.getAudioTracks().length === 0) {
        notify(
          "Recording is not supported for this stream in your browser",
          "danger"
        )
        return
      }

      recChunks.current = []
      recDurationRef.current = 0
      setRecDuration(0)

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm"
      const recorder = new MediaRecorder(capture, { mimeType })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recChunks.current.push(event.data)
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
        recDurationRef.current += 1
        setRecDuration(recDurationRef.current)
      }, 1000)
    } catch {
      notify("Failed to start recording", "danger")
    }
  }, [notify, playing])

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
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
      stopLoadingTimer()
    }
  }, [stopLoadingTimer])

  return (
    <RadioContext.Provider
      value={{
        playing,
        loading,
        loadingMsg,
        error,
        streamIdx,
        volume,
        muted,
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
