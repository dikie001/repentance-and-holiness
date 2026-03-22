import { Play, Home, Radio, Music2, Flame, Users, LayoutDashboard, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Home", url: "#", icon: Home },
  { title: "Jesus Is Lord Radio", url: "#", icon: Radio },
  { title: "Media & Worship", url: "#", icon: Music2 },
  { title: "Prophecies", url: "#", icon: Flame },
  { title: "About Ministry", url: "#", icon: Users },
  { title: "Dashboard", url: "#", icon: LayoutDashboard },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-blue-900/10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SidebarHeader className="flex h-16 items-center border-b border-blue-900/10 px-6">
        <div className="flex items-center gap-3 mt-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
             <Play size={16} fill="currentColor" />
          </div>
          <span className="text-lg font-black text-blue-900 dark:text-blue-100" style={{ fontFamily: "'Cinzel', serif" }}>
            Ministry
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-blue-600/70 mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 rounded-xl transition-colors mb-1">
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-900/10 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 rounded-xl transition-colors">
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
