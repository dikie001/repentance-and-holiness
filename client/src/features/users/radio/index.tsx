import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { Play, Pause, Loader2 } from "lucide-react"
import { useRadio, STREAMS } from "@/context/RadioContext"
import { SpectrumVisualizer } from "./SpectrumVisualizer"

/**
 * Professional radio player with spectrum visualization
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
          ? "bg-gradient-to-b from-slate-950 to-slate-900"
          : "bg-gradient-to-b from-slate-50 to-slate-100"
      )}
    >
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Spectrum Visualizer - Full Width at Top */}
        <div className="w-full bg-black/40 backdrop-blur-sm">
          <div className="h-40 w-full">
            <SpectrumVisualizer analyserRef={analyserRef} playing={playing} />
          </div>
        </div>

        {/* Content Area */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1
              className={cn(
                "text-4xl font-black tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Jesus Is Lord Radio
            </h1>
            <p
              className={cn(
                "mt-2 text-sm font-semibold tracking-wide",
                isDark ? "text-pink-400" : "text-pink-600"
              )}
            >
              Repentance & Holiness
            </p>
          </div>

          {/* Status */}
          {(loading || error) && (
            <div
              className={cn(
                "mb-6 rounded-lg px-4 py-2 text-sm font-medium",
                error
                  ? isDark
                    ? "bg-red-900/20 text-red-300"
                    : "bg-red-100 text-red-700"
                  : isDark
                    ? "bg-pink-900/20 text-pink-300"
                    : "bg-pink-100 text-pink-700"
              )}
            >
              {error || "Connecting..."}
            </div>
          )}

          {/* Play Button */}
          <button
            onClick={() => togglePlay()}
            disabled={loading}
            className={cn(
              "mb-8 flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all duration-200",
              isDark
                ? "bg-gradient-to-br from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400"
                : "bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500",
              loading ? "opacity-75 cursor-not-allowed" : "hover:scale-110 active:scale-95 cursor-pointer"
            )}
            aria-label={playing ? "Pause" : "Play"}
          >
            {loading ? (
              <Loader2 size={40} className="animate-spin text-white" />
            ) : playing ? (
              <Pause size={40} fill="white" color="white" />
            ) : (
              <Play size={40} fill="white" color="white" className="ml-1" />
            )}
          </button>

          {/* Stream Info Card */}
          <div
            className={cn(
              "mb-8 w-full max-w-md rounded-xl p-4 backdrop-blur-sm",
              isDark
                ? "border border-white/10 bg-white/5"
                : "border border-white/20 bg-white/40"
            )}
          >
            <p
              className={cn(
                "text-center text-sm font-semibold",
                isDark ? "text-pink-300" : "text-pink-600"
              )}
            >
              {STREAMS[streamIdx].label}
            </p>
            <p
              className={cn(
                "mt-1 text-center text-xs",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              {STREAMS[streamIdx].sub}
            </p>
          </div>

          {/* Stream Selector */}
          <div className="w-full max-w-md">
            <p
              className={cn(
                "mb-3 text-center text-xs font-semibold tracking-widest uppercase",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Streams
            </p>
            <div className="flex justify-center gap-2">
              {STREAMS.map((stream, idx) => (
                <button
                  key={stream.id}
                  onClick={() => switchStream(idx)}
                  disabled={loading}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                    streamIdx === idx
                      ? isDark
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-500/50"
                        : "bg-pink-500 text-white shadow-lg shadow-pink-400/50"
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
        </main>
      </div>
    </div>
  )
}
