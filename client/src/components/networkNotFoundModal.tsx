import { useState, useEffect } from "react"

interface NetworkNotFoundModalProps {
  isVisible: boolean
  onRetry?: () => void
}

export default function NetworkNotFoundModal({
  isVisible,
  onRetry,
}: NetworkNotFoundModalProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [dots, setDots] = useState("")

  // Animate dots when retrying
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
    // Backdrop — covers everything beneath
    <div className="fixed inset-0 z-55 flex items-center justify-center">
      {/* Blurred dark overlay */}
      <div className="absolute inset-0 bg-[#070b14]/80 backdrop-blur-md" />

      {/* Animated radial glow behind the card */}
      <div
        className="pointer-events-none absolute h-[480px] w-[480px] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #1a6fff 0%, #0d3a8a 40%, transparent 70%)",
        }}
      />

      {/* Modal Card */}
      <div
        className="relative z-10 w-[360px] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #0f1628 0%, #0a0f1e 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow:
            "0 0 0 1px rgba(59,130,246,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(29,78,216,0.12)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #3b82f6, #06b6d4, transparent)",
          }}
        />

        <div className="flex flex-col items-center px-8 py-8 text-center">
          {/* Icon container */}
          <div className="relative mb-6">
            {/* Outer pulse ring */}
            <div
              className="absolute inset-0 animate-ping rounded-full opacity-20"
              style={{ background: "rgba(59,130,246,0.4)" }}
            />
            {/* Icon bg */}
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(29,78,216,0.3), rgba(7,15,30,0.8))",
                border: "1px solid rgba(59,130,246,0.3)",
                boxShadow: "0 0 30px rgba(59,130,246,0.15)",
              }}
            >
              {/* Wifi-off SVG icon */}
              <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#iconGrad)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient
                    id="iconGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                {/* Wifi arcs with slash */}
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle
                  cx="12"
                  cy="20"
                  r="1"
                  fill="url(#iconGrad)"
                  stroke="none"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2
            className="mb-1 text-xl font-semibold tracking-wide"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#e2e8f0",
              letterSpacing: "0.01em",
            }}
          >
            No Network Connection
          </h2>

          {/* Subtitle */}
          <p
            className="mb-1 text-sm leading-relaxed"
            style={{
              color: "rgba(148,163,184,0.8)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Unable to reach{" "}
            <span style={{ color: "#60a5fa" }}>Jesus Is Lord Radio</span>.
            <br />
            Check your internet connection and try again.
          </p>

          {/* Divider */}
          <div
            className="my-5 w-full"
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)",
            }}
          />

          {/* Status indicator row */}
          <div className="mb-6 flex w-full items-center justify-center gap-6">
            {[
              { label: "Signal", ok: false },
              { label: "DNS", ok: false },
              { label: "Server", ok: null },
            ].map(({ label, ok }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background:
                      ok === null
                        ? "rgba(148,163,184,0.3)"
                        : ok
                          ? "#22c55e"
                          : "#ef4444",
                    boxShadow:
                      ok === false ? "0 0 6px rgba(239,68,68,0.5)" : "none",
                  }}
                />
                <span
                  className="text-[10px] tracking-widest uppercase"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Retry button */}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full rounded-xl py-3 text-sm font-medium tracking-wide transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: isRetrying
                ? "rgba(29,78,216,0.2)"
                : "linear-gradient(135deg, #1d4ed8, #1e40af)",
              color: isRetrying ? "rgba(148,163,184,0.6)" : "#e2e8f0",
              border: "1px solid rgba(59,130,246,0.3)",
              boxShadow: isRetrying ? "none" : "0 4px 20px rgba(29,78,216,0.3)",
            }}
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
                Reconnecting{dots}
              </span>
            ) : (
              "Try Again"
            )}
          </button>

          {/* Help link */}
          <p
            className="mt-4 text-xs"
            style={{
              color: "rgba(100,116,139,0.7)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Still having issues?{" "}
            <span
              className="cursor-pointer underline underline-offset-2"
              style={{ color: "rgba(96,165,250,0.7)" }}
            >
              Contact support
            </span>
          </p>
        </div>

        {/* Bottom accent bar */}
        <div
          className="h-[1px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)",
          }}
        />
      </div>
    </div>
  )
}

// ── Demo wrapper so you can preview it standalone ──────────────────────────
export function Demo() {
  const [show, setShow] = useState(true)

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ background: "#070b14" }}
    >
      {/* Fake app background hint */}
      <p className="text-xs tracking-widest text-slate-600 uppercase">
        App content beneath
      </p>

      <button
        onClick={() => setShow(true)}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-blue-500"
      >
        Show Modal
      </button>

      <NetworkNotFoundModal
        isVisible={show}
        onRetry={() => {
          console.log("Retrying...")
          setShow(false)
        }}
      />
    </div>
  )
}
