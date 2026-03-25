import { useEffect, useMemo, useState } from "react"
import { Download, X } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISS_KEY = "rh-install-banner-dismissed"

const isStandalone = () => {
  if (typeof window === "undefined") return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(nav.standalone)
  )
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1")

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const onInstalled = () => {
      setDeferredPrompt(null)
      setDismissed(true)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const visible = useMemo(
    () => !dismissed && !isStandalone() && Boolean(deferredPrompt),
    [dismissed, deferredPrompt]
  )

  const dismiss = () => {
    setDismissed(true)
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISS_KEY, "1")
    }
  }

  const install = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setInstalling(false)
    setDeferredPrompt(null)
    if (choice.outcome === "dismissed") return
    dismiss()
  }

  if (!visible) return null

  return (
    <div className="fixed right-4 bottom-4 left-4 z-[100] animate-in duration-500 fade-in slide-in-from-bottom-8 sm:right-6 sm:bottom-6 sm:left-auto sm:w-80">
      <section
        className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        aria-label="Install app banner"
      >
        {/* Dismiss Button (Top Right) */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Dismiss install banner"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4 pr-6">
          {/* Professional Blue Icon Container */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Download size={24} strokeWidth={2} />
          </div>

          {/* Text Content */}
          <div className="flex flex-col pt-0.5">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Install  App
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Add Repentance & Holiness App to your home screen for faster access.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={install}
          disabled={installing}
          className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {installing ? "Installing..." : "Install Now"}
        </button>
      </section>
    </div>
  )
}
