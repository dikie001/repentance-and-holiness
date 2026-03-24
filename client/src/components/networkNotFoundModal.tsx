import { useState, useEffect } from "react"

interface NetworkNotFoundModalProps {
  isVisible: boolean
  onRetry?: () => void
}

const troubleshootSteps = [
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" />
      </svg>
    ),
    text: "Make sure your Wi-Fi or mobile data is turned on",
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    text: "Restart your router or modem",
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    text: "Switch between Wi-Fi and mobile data",
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a10 10 0 0 1 10 10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    text: "Toggle Airplane Mode off and on again",
  },
]

export default function NetworkNotFoundModal({
  isVisible,
  onRetry,
}: NetworkNotFoundModalProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [dots, setDots] = useState("")
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!isRetrying) return
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 400)
    return () => clearInterval(interval)
  }, [isRetrying])

  const handleRetry = () => {
    setIsRetrying(true)
    setTimeout(() => {
      setIsRetrying(false)
      onRetry?.()
    }, 3000)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Glow */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-blue-600 opacity-10 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-blue-900/40 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-black/60">
        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500 to-cyan-400" />

        <div className="flex flex-col items-center px-6 pt-7 pb-6 text-center">
          {/* App logo */}
        <div></div>

          {/* Network error illustration */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-blue-600/10 blur-2xl" />
            <img
              src="/images/net-error.png"
              alt="No internet"
              className="relative h-28 w-28 object-contain opacity-90"
            />
          </div>

          {/* Title */}
          <h2 className="mb-1 text-lg font-semibold tracking-wide text-slate-100">
            No Internet Connection
          </h2>

          {/* Description */}
          <p className="text-sm leading-relaxed text-slate-400">
            You're currently offline. Please check your connection to continue
            streaming.
          </p>

          {/* Divider */}
          <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-blue-900/50 to-transparent" />

          {/* Troubleshoot toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mb-3 flex items-center gap-1.5 text-xs font-medium tracking-wider text-blue-400 uppercase transition-colors hover:text-blue-300"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            How to fix this
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Steps */}
          <div
            className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
              expanded ? "mb-4 max-h-72 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="divide-y divide-blue-900/20 rounded-xl border border-blue-900/30 bg-slate-900/60 text-left">
              {troubleshootSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 shrink-0 text-blue-400">
                    {step.icon}
                  </span>
                  <p className="text-xs leading-relaxed text-slate-400">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Retry button */}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`w-full rounded-xl border py-3 text-sm font-medium tracking-wide transition-all duration-200 active:scale-[0.98] ${
              isRetrying
                ? "cursor-not-allowed border-blue-900/20 bg-blue-950/40 text-slate-500"
                : "border-blue-700/40 bg-gradient-to-br from-blue-700 to-blue-800 text-slate-100 shadow-lg shadow-blue-900/30 hover:from-blue-600 hover:to-blue-700"
            }`}
          >
            {isRetrying ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Retrying{dots}
              </span>
            ) : (
              "Try Again"
            )}
          </button>

          <p className="mt-4 text-xs text-slate-600">
            Still having issues?{" "}
            <span className="cursor-pointer text-blue-500/70 underline underline-offset-2 transition-colors hover:text-blue-400">
              Contact support
            </span>
          </p>
        </div>

        {/* Bottom accent bar */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-900/30 to-transparent" />
      </div>
    </div>
  )
}
