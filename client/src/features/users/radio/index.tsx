import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import {
  Play,
  Pause,
  Loader2,
  SkipBack,
  SkipForward,
  VolumeX,
  Volume2,
} from "lucide-react"
import { useRadio, STREAMS } from "@/context/RadioContext"

/**
 * Minimal, lightweight radio player
 * Removed visualizer, recordings, sleep timer - focus on playback
 */
export default function RadioPlayer() {
  const {
    playing,
    loading,
    streamIdx,
    volume,
    muted,
    togglePlay,
    switchStream,
    setVolume,
    setMuted,
  } = useRadio()

  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden",
        isDark
          ? "bg-gradient-to-br from-[#060614] via-[#0a0a1e] to-[#060610]"
          : "bg-[#eef1ff]"
      )}
    >
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6 overflow-hidden rounded-full border-4 border-blue-500 shadow-lg">
            <img
              src="/images/radio-logo.png"
              alt="Jesus Is Lord Radio"
              className="h-40 w-40 object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://static-media.streema.com/media/cache/b8/70/b870ab4505ebd20d76984a8ea8025007.jpg"
              }}
            />
          </div>
          <h1 className="text-3xl font-black">Jesus Is Lord Radio</h1>
          <p className="mt-2 text-sm opacity-70">Repentance & Holiness Ministry</p>
          {loading && (
            <p className="mt-2 text-xs text-cyan-400">Connecting...</p>
          )}
        </div>

        {/* Play Button */}
        <div className="mb-12 flex items-center justify-center gap-6">
          <button
            onClick={() =>
              switchStream((streamIdx - 1 + STREAMS.length) % STREAMS.length)
            }
            className="text-blue-500 transition-transform active:scale-90"
          >
            <SkipBack size={32} fill="currentColor" />
          </button>

          <button
            onClick={() => togglePlay()}
            disabled={loading}
            className={cn(
              "grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-xl transition-all",
              loading ? "opacity-70" : "hover:scale-110 active:scale-95"
            )}
          >
            {loading ? (
              <Loader2 size={48} className="animate-spin text-white" />
            ) : playing ? (
              <Pause size={48} fill="white" color="white" />
            ) : (
              <Play size={48} fill="white" color="white" className="ml-2" />
            )}
          </button>

          <button
            onClick={() => switchStream((streamIdx + 1) % STREAMS.length)}
            className="text-blue-500 transition-transform active:scale-90"
          >
            <SkipForward size={32} fill="currentColor" />
          </button>
        </div>

        {/* Volume */}
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMuted(!muted)} className="text-cyan-500">
              {muted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
            <div className="relative h-2 flex-1 rounded-full bg-gray-700">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
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
                className="absolute inset-y-[-6px] w-full cursor-pointer opacity-0"
              />
            </div>
            <span className="min-w-8 text-right text-sm font-bold opacity-60">
              {muted ? "0" : volume}%
            </span>
          </div>
        </div>

        {/* Current Stream */}
        <div className="mt-8 text-center text-xs opacity-50">
          <p>{STREAMS[streamIdx].label}</p>
          <p>{STREAMS[streamIdx].sub}</p>
        </div>
      </main>
    </div>
  )
}
