import { Outlet } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function AppLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#060614] text-white overflow-hidden">
          {/* Main Sidebar Component */}
          <AppSidebar />
          
          <SidebarInset className="flex flex-col relative bg-transparent overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative pt-16 pb-20 md:pb-0 overflow-y-auto">
              <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-6 md:py-10">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
