import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { Play, Pause, Loader2 } from "lucide-react"
import { useRadio, STREAMS } from "@/context/RadioContext"
import { SpectrumVisualizer } from "./SpectrumVisualizer"

/**
 * Professional radio player
 * Clean, minimal interface optimized for streaming
 */
export default function RadioPlayer() {
  const {
    playing,
    loading,
    error,
    streamIdx,
    togglePlay,
    switchStream,
    analyserRef,
  } = useRadio()

  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden",
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50"
      )}
    >
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 pb-32">
        {/* Logo Section */}
        <div className="relative mb-12 flex flex-col items-center pt-4">
          <style>{`
            @keyframes spin-smooth {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .spin-logo {
              animation: spin-smooth 8s linear infinite;
            }
          `}</style>
          <div
            className={cn(
              "spin-logo mb-8 overflow-hidden rounded-full border-4 shadow-2xl",
              isDark
                ? "border-blue-400 bg-black/50"
                : "border-blue-500 bg-white/50"
            )}
          >
            <img
              src="/images/radio-logo.png"
              alt="Jesus Is Lord Radio"
              className="h-56 w-56 object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://static-media.streema.com/media/cache/b8/70/b870ab4505ebd20d76984a8ea8025007.jpg"
              }}
            />
          </div>
          <h1
            className={cn(
              "text-5xl font-black tracking-tighter",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Jesus Is Lord Radio
          </h1>
          <p
            className={cn(
              "mt-3 text-lg font-semibold tracking-wide",
              isDark ? "text-cyan-400" : "text-blue-600"
            )}
          >
            Repentance &amp; Holiness
          </p>
        </div>

        {/* Play Controls */}
        <div className="relative mb-16 flex items-center justify-center">
          <button
            onClick={() => togglePlay()}
            disabled={loading}
            className={cn(
              "relative grid h-32 w-32 place-items-center rounded-full shadow-2xl transition-all duration-200",
              isDark
                ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400"
                : "bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-400 hover:via-indigo-400 hover:to-blue-500",
              loading ? "opacity-75" : "hover:scale-110 active:scale-95"
            )}
          >
            {/* Spectrum Visualizer Background */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <SpectrumVisualizer analyserRef={analyserRef} playing={playing} />
            </div>

            {/* Play/Pause Icon */}
            <div className="relative z-10">
              {loading ? (
                <Loader2 size={64} className="animate-spin text-white" />
              ) : playing ? (
                <Pause size={64} fill="white" color="white" />
              ) : (
                <Play size={64} fill="white" color="white" className="ml-1" />
              )}
            </div>
          </button>
        </div>

        {/* Status & Stream Info */}
        {(loading || error) && (
          <div
            className={cn(
              "mb-8 rounded-lg px-4 py-2 text-sm font-medium",
              error
                ? isDark
                  ? "bg-red-900/20 text-red-300"
                  : "bg-red-100 text-red-700"
                : isDark
                  ? "bg-cyan-900/20 text-cyan-300"
                  : "bg-cyan-100 text-cyan-700"
            )}
          >
            {error || "Connecting..."}
          </div>
        )}

        {/* Current Stream Info & Selector */}
        <div className="w-full max-w-sm space-y-4">
          <div
            className={cn(
              "rounded-xl p-4 text-center backdrop-blur-sm",
              isDark
                ? "border border-white/10 bg-white/5"
                : "border border-white/40 bg-white/60"
            )}
          >
            <p
              className={cn(
                "text-sm font-semibold",
                isDark ? "text-cyan-300" : "text-blue-600"
              )}
            >
              {STREAMS[streamIdx].label}
            </p>
            <p
              className={cn(
                "mt-1 text-xs",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              {STREAMS[streamIdx].sub}
            </p>
          </div>

          {/* Stream selector */}
          <div className="space-y-2">
            <p
              className={cn(
                "text-center text-xs font-semibold tracking-wide uppercase",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Available Streams
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STREAMS.map((stream, idx) => (
                <button
                  key={stream.id}
                  onClick={() => switchStream(idx)}
                  disabled={loading}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                    streamIdx === idx
                      ? isDark
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : isDark
                        ? "bg-white/10 text-gray-300 hover:bg-white/20"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300",
                    loading && "cursor-not-allowed opacity-60"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
