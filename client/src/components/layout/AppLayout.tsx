import { Outlet } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RadioProvider } from "@/context/RadioContext"
import { NotificationProvider } from "@/context/NotificationContext"
import { NotificationSheet } from "@/components/notifications/NotificationSheet"
import { MiniPlayer } from "./MiniPlayer"

export function AppLayout() {
  return (
    <RadioProvider>
      <NotificationProvider>
        <TooltipProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full" style={{ background: "var(--app-bg)", color: "var(--app-text)" }}>
              <AppSidebar />
              <SidebarInset className="flex flex-col relative overflow-hidden bg-transparent w-full">
                <main className="flex-1 flex flex-col relative pt-16 pb-24 md:pb-6 overflow-y-auto w-full">
                  <div className="w-full px-4 md:px-6">
                    <div className="mx-auto w-full max-w-2xl md:max-w-3xl">
                      <Outlet />
                    </div>
                  </div>
                </main>
                <MiniPlayer />
              <NotificationSheet />
            </SidebarInset>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </NotificationProvider>
    </RadioProvider>
  )
}
