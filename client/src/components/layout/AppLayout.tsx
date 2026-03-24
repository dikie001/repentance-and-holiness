import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RadioProvider } from "@/context/RadioContext"
import { NotificationProvider } from "@/context/NotificationContext"
import { NotificationSheet } from "@/components/notifications/NotificationSheet"
import { MiniPlayer } from "./MiniPlayer"
import { cn } from "@/lib/utils"
import { Maximize2, PanelTop } from "lucide-react"

type LayoutViewMode = "card" | "full"

const VIEW_MODE_KEY = "rh-layout-view-mode"

export function AppLayout() {
  const [viewMode, setViewMode] = useState<LayoutViewMode>(() => {
    if (typeof window === "undefined") return "card"
    return window.localStorage.getItem(VIEW_MODE_KEY) === "full"
      ? "full"
      : "card"
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(VIEW_MODE_KEY, viewMode)
  }, [viewMode])

  const cardMode = viewMode === "card"

  return (
    <RadioProvider>
      <NotificationProvider>
        <TooltipProvider>
          <SidebarProvider>
            <div
              className="h-screen w-full overflow-hidden px-0 md:px-6 xl:px-10"
              style={{ background: "var(--app-bg)", color: "var(--app-text)" }}
            >
              <div
                className={cn(
                  "mx-auto h-full w-full overflow-hidden",
                  cardMode
                    ? "max-w-[1180px] md:my-3 md:h-[calc(100vh-24px)] md:rounded-xl md:border md:shadow-[0_20px_70px_-32px_rgba(15,23,42,0.45)]"
                    : ""
                )}
                style={
                  cardMode
                    ? {
                        background: "var(--app-card)",
                        borderColor: "var(--app-border)",
                      }
                    : undefined
                }
              >
                <div className="relative flex h-full w-full overflow-hidden md:rounded-xl">
                  <AppSidebar />
                  <SidebarInset className="relative flex w-full flex-col overflow-hidden bg-transparent">
                    <main className="relative flex min-h-0 w-full flex-1 flex-col overflow-y-auto pt-8 pb-16 md:pb-6">
                      <div className="w-full ">
                        <div
                          className={cn(
                            "mx-auto w-full",
                            cardMode
                              ? "max-w-4xl xl:max-w-5xl"
                              : "max-w-[1400px]"
                          )}
                        >
                          <div className="hidden justify-end pt-2 pb-4 lg:flex">
                            <div
                              className="inline-flex items-center gap-1 rounded-xl border p-1 shadow-sm"
                              style={{
                                background: "var(--app-surface)",
                                borderColor: "var(--app-border)",
                              }}
                            >
                    
                            </div>
                          </div>

                          <div
                            className={cn("w-full", cardMode && "p-1 md:p-2")}
                          >
                            <Outlet />
                          </div>
                        </div>
                      </div>
                    </main>
                    <MiniPlayer />
                    <NotificationSheet />
                  </SidebarInset>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </NotificationProvider>
    </RadioProvider>
  )
}
