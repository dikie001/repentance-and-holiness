import {  RefreshCw } from "lucide-react"
import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"

export function OfflineNotice() {
  const { theme } = useTheme()
  const isDark = theme !== "light"

  const handleRetry = () => {
    // Try to reload the page
    window.location.reload()
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[999] flex items-center justify-center p-4",
        isDark
          ? "bg-gradient-to-br from-slate-900 to-slate-950"
          : "bg-gradient-to-br from-blue-50 to-blue-100"
      )}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl",
          isDark ? "border-slate-700 bg-slate-800" : "border-blue-200 bg-white"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full",
            isDark ? "bg-red-900/30" : "bg-red-100"
          )}
        >
          <img
            src="/images/net-error.png"
            alt="No internet"
            className="relative h-28 w-28 object-contain opacity-90"
          />
        </div>

        {/* Title */}
        <h1
          className="mb-2 text-2xl font-black tracking-tight"
          style={{ color: isDark ? "rgb(255, 255, 255)" : "rgb(15, 23, 42)" }}
        >
          No Internet Connection
        </h1>

        {/* Description */}
        <p
          className="mb-6 text-sm leading-relaxed"
          style={{
            color: isDark
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(15, 23, 42, 0.7)",
          }}
        >
          You're currently offline. This app works best with an internet
          connection. Some features may be limited or unavailable.
        </p>

        {/* Status Indicator */}
        <div
          className={cn(
            "mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-widest uppercase",
            isDark
              ? "border border-red-600/35 bg-red-900/15 text-red-400"
              : "border border-red-200 bg-red-50 text-red-600"
          )}
        >
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          OFFLINE
        </div>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold transition-all duration-300 hover:scale-105 active:scale-95",
            isDark
              ? "border border-white/20 bg-white/10 text-white hover:bg-white/15"
              : "border border-blue-300 bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          <RefreshCw size={18} />
          Try Again
        </button>

        {/* Additional Context */}
        <p
          className="mt-6 text-xs opacity-60"
          style={{ color: isDark ? "rgb(255, 255, 255)" : "rgb(15, 23, 42)" }}
        >
          Some cached content may still be available while you're offline.
        </p>
      </div>
    </div>
  )
}
