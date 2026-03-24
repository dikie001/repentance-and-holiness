import { Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RadioProvider } from "@/context/RadioContext"
import { NotificationProvider } from "@/context/NotificationContext"
import { NotificationSheet } from "@/components/notifications/NotificationSheet"
import { MiniPlayer } from "./MiniPlayer"
import { InstallBanner } from "@/components/pwa/InstallBanner"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const location = useLocation()
  const isRadioRoute = location.pathname.startsWith("/jesus-is-lord-radio")
  const useCardShell = true

  return (
    <RadioProvider>
      <NotificationProvider>
        <TooltipProvider>
          <SidebarProvider>
            <div
              className={cn(
                "h-screen w-full overflow-hidden",
                isRadioRoute ? "px-0" : "px-0 md:px-6 xl:px-10"
              )}
              style={{ background: "var(--app-bg)", color: "var(--app-text)" }}
            >
              <div
                className={cn(
                  "mx-auto h-full w-full overflow-hidden",
                  useCardShell
                    ? "max-w-[1180px] md:my-3 md:h-[calc(100vh-24px)] md:rounded-xl md:border md:shadow-[0_20px_70px_-32px_rgba(15,23,42,0.45)]"
                    : ""
                )}
                style={
                  useCardShell
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
                    <main
                      className={cn(
                        "relative flex min-h-0 w-full flex-1 flex-col",
                        isRadioRoute
                          ? "overflow-hidden pt-0 pb-0"
                          : "overflow-y-auto pt-8 pb-24 md:pb-6"
                      )}
                    >
                      <div
                        className={cn(
                          "w-full",
                          isRadioRoute ? "px-0" : "px-4 sm:px-6"
                        )}
                      >
                        <div
                          className={cn(
                            "mx-auto w-full",
                            isRadioRoute
                              ? "max-w-none"
                              : "max-w-4xl xl:max-w-6xl"
                          )}
                        >
                          <div className="hidden justify-end pt-2 pb-4 lg:flex">
                            <div
                              className="inline-flex items-center gap-1 rounded-xl border p-1 shadow-sm"
                              style={{
                                background: "var(--app-surface)",
                                borderColor: "var(--app-border)",
                              }}
                            ></div>
                          </div>

                          <div className="w-full">
                            <InstallBanner />
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
