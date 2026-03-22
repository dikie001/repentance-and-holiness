import { Outlet } from "react-router-dom"
import { AppNavigation } from "./AppSidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppLayout() {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen w-full bg-[#060614] text-white">
        {/* Navigation bars (Fixed/Sticky) */}
        <AppNavigation />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative pt-16 md:pt-18 pb-18 md:pb-0">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-6 md:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
