import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Footer } from "./Footer"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
          <AppSidebar />
          
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-blue-900/10 bg-white/80 px-4 backdrop-blur-md dark:bg-slate-950/80">
              <SidebarTrigger className="-ml-1 text-slate-600 hover:text-blue-600" />
              <div className="ml-4 flex-1">
                <span className="text-lg font-black text-blue-900 md:hidden dark:text-blue-100" style={{ fontFamily: "'Cinzel', serif" }}>
                  R & H Ministry
                </span>
              </div>
            </header>
            
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
