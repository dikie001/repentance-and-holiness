import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Footer } from "./Footer"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex flex-1 min-h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
          <AppSidebar />
          
          <div className="flex flex-1 flex-col overflow-hidden w-full relative">
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
              <SidebarTrigger className="-ml-1 text-slate-600 hover:text-blue-600" />
              <div className="ml-4 flex-1">
                <span className="text-lg font-black text-blue-900 md:hidden dark:text-blue-100" style={{ fontFamily: "'Cinzel', serif" }}>
                  R & H Ministry
                </span>
              </div>
            </header>
            
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
              <div className="mx-auto w-full max-w-7xl max-w-[100vw] sm:max-w-none lg:p-8">
                <Outlet />
              </div>
              {/* <Footer /> */}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
