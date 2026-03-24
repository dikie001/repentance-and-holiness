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
    <section
      className="mx-auto mb-4 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl"
      style={{
        background: "var(--app-header-bg)",
        borderColor: "var(--app-border)",
        color: "var(--app-text)",
      }}
      aria-label="Install app banner"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/12 text-cyan-300">
        <Download size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black tracking-wide">
          Install this app for faster access
        </p>
        <p className="text-xs opacity-70">
          Add Repentance &amp; Holiness to your home screen.
        </p>
      </div>

      <button
        onClick={install}
        disabled={installing}
        className="rounded-xl border border-cyan-500/40 bg-cyan-500 px-3 py-2 text-xs font-black text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
      >
        {installing ? "Installing..." : "Install"}
      </button>

      <button
        onClick={dismiss}
        className="grid h-8 w-8 place-items-center rounded-lg border transition-colors hover:bg-white/8"
        style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
        aria-label="Dismiss install banner"
      >
        <X size={16} />
      </button>
    </section>
  )
}
