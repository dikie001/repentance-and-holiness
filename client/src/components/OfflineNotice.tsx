import { useState, useEffect } from "react"
import {
  RefreshCw,
  Wifi,
  Router,
  ArrowRightLeft,
  Plane,
  HelpCircle,
  ChevronDown,
} from "lucide-react"

const troubleshootSteps = [
  {
    icon: <Wifi size={16} />,
    text: "Make sure your Wi-Fi or mobile data is turned on",
  },
  {
    icon: <Router size={16} />,
    text: "Restart your router or modem",
  },
  {
    icon: <ArrowRightLeft size={16} />,
    text: "Switch between Wi-Fi and mobile data",
  },
  {
    icon: <Plane size={16} />,
    text: "Toggle Airplane Mode off and on again",
  },
]

export function OfflineNotice() {
  const [isRetrying, setIsRetrying] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [dots, setDots] = useState("")

  // Animate the "Retrying..." dots
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
      window.location.reload()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-[#05050a]/80 p-4 backdrop-blur-md transition-colors duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#1a1f3a] bg-[#0b0c16] shadow-2xl shadow-black/80">
        {/* Top Cyan Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#00c8ff] to-transparent opacity-80" />

        <div className="flex flex-col items-center px-8 pt-6 pb-8 text-center">
          {/* Icon with cyan glow */}
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#00c8ff] opacity-15 blur-[32px]" />
            <img
              src="/images/net-error.png"
              alt="No internet"
              className="relative h-full w-full object-contain brightness-110"
            />
          </div>

          {/* Title */}
          <h1 className="mb-2 text-2xl font-black tracking-tight text-white">
            No Internet Connection
          </h1>

          {/* Description */}
          <p className="mb-6 text-sm leading-relaxed text-[#8a8d9e]">
            An active internet connection is required to use this app. Please
            connect to a network to continue.
          </p>

          {/* Divider */}
          <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-[#1a1f3a] to-transparent" />

          {/* Troubleshoot Toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[#00c8ff] transition-opacity hover:opacity-80"
          >
            <HelpCircle size={16} />
            How to fix this
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </button>

          {/* Troubleshoot Steps Accordion */}
          <div
            className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
              expanded ? "mb-6 max-h-72 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="rounded-xl border border-[#1a1f3a] bg-[#121424] text-left shadow-inner">
              {troubleshootSteps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-4 py-3 ${i !== 0 ? "border-t border-[#1a1f3a]" : ""}`}
                >
                  <span className="mt-0.5 shrink-0 text-[#00c8ff] opacity-80">
                    {step.icon}
                  </span>
                  <p className="text-sm leading-relaxed text-[#8a8d9e]">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Retry Button (Matches your center play button) */}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#0277b6]/50 bg-gradient-to-b from-[#0288d1] to-[#02669b] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#0277b6]/20 transition-all duration-300 ${
              isRetrying
                ? "cursor-wait opacity-70"
                : "hover:scale-[1.02] hover:shadow-[#0277b6]/40 active:scale-[0.98]"
            }`}
          >
            <RefreshCw size={18} className={isRetrying ? "animate-spin" : ""} />
            {isRetrying ? `Retrying${dots}` : "Try Again"}
          </button>
        </div>
      </div>
    </div>
  )
}
