import { NotificationSheet } from "@/components/notifications/NotificationSheet"
import { InstallBanner } from "@/components/pwa/InstallBanner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NotificationProvider } from "@/context/NotificationContext"
import { RadioProvider } from "@/context/RadioContext"
import { cn } from "@/lib/utils"
import { Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { MiniPlayer } from "./MiniPlayer"


export function AppLayout() {
  const location = useLocation()
  const isRadioRoute = location.pathname.startsWith("/jesus-is-lord-radio")

  return (
    <RadioProvider>
      <NotificationProvider>
        <TooltipProvider>
          <SidebarProvider>
            <div
              className={cn(
                "h-dvh w-full overflow-hidden",
                isRadioRoute ? "px-0" : "md:px-4 md:py-4"
              )}
              style={{ background: "var(--app-bg)", color: "var(--app-text)" }}
            >
              <div
                className={cn(
                  "mx-auto h-full w-full overflow-hidden",
                  isRadioRoute
                    ? "max-w-none"
                    : "max-w-[1240px] md:rounded-[28px] md:border md:bg-[var(--app-panel)] md:shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]"
                )}
                style={!isRadioRoute ? { borderColor: "var(--app-border)" } : undefined}
              >
                <div className="relative flex h-full w-full overflow-hidden md:rounded-[28px]">
                  <AppSidebar />
                  <SidebarInset className="relative flex w-full flex-col overflow-hidden bg-transparent">
                    <main
                      className={cn(
                        "relative flex min-h-0 w-full flex-1 flex-col",
                        isRadioRoute
                          ? "overflow-hidden pt-0 pb-0"
                          : "overflow-y-auto pt-20 pb-28 md:pb-8"
                      )}
                    >
                      <div
                        className={cn(
                          "w-full",
                          isRadioRoute ? "px-0" : "px-4 sm:px-6 lg:px-8"
                        )}
                      >
                        <div
                          className={cn(
                            "mx-auto w-full",
                            isRadioRoute
                              ? "max-w-none"
                              : "max-w-5xl"
                          )}
                        >
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
