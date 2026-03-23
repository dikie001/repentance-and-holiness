"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useNotifications, type Notification } from "@/context/NotificationContext"
import { cn } from "@/lib/utils"
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, Clock, Info, Radio, Trash2, X } from "lucide-react"

function formatDistanceToNow(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}


// Props removed as it now uses context
const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'live':
      return <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
        <Radio size={16} className="animate-pulse" />
      </div>
    case 'success':
      return <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
        <CheckCircle2 size={16} />
      </div>
    case 'warning':
      return <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
        <AlertTriangle size={16} />
      </div>
    case 'error':
      return <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
        <X size={16} />
      </div>
    default:
      return <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
        <Info size={16} />
      </div>
  }
}

// Props removed as it now uses context
export function NotificationSheet() {
  const { 
    isOpen, 
    setIsOpen, 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    deleteNotification 
  } = useNotifications()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l backdrop-blur-xl" style={{ background: "var(--app-sidebar-bg)", borderColor: "var(--app-border)" }}>
        <SheetHeader className="p-6 border-b" style={{ borderColor: "var(--app-border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                <Bell size={20} />
              </div>
              <div>
                <SheetTitle className="text-xl font-black tracking-tight" style={{ color: "var(--app-text)" }}>
                  Notifications
                </SheetTitle>
                <SheetDescription className="text-xs font-bold uppercase tracking-widest text-cyan-500/80">
                  {unreadCount} UNREAD MESSAGES
                </SheetDescription>
              </div>
            </div>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-[10px] font-black uppercase tracking-tighter hover:bg-white/5"
                style={{ color: "var(--app-text-muted)" }}
              >
                <CheckCheck size={14} className="mr-1.5" />
                Read All
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4">
                <Bell size={32} />
              </div>
              <h3 className="font-bold text-lg" style={{ color: "var(--app-text)" }}>All caught up!</h3>
              <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>No new notifications at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    "group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                    !notification.isRead
                      ? "bg-white/[0.03] border-blue-500/30 shadow-lg shadow-blue-500/5"
                      : "bg-transparent border-white/5 hover:bg-white/[0.02]"
                  )}
                  style={{ borderColor: !notification.isRead ? undefined : "var(--app-border)" }}
                >
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="absolute top-0 right-0 p-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <NotificationIcon type={notification.type} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm leading-tight mb-1 truncate" style={{ color: "var(--app-text)" }}>
                        {notification.title}
                      </h4>
                      <p className="text-xs line-clamp-2 leading-relaxed mb-2" style={{ color: "var(--app-text-muted)" }}>
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <Clock size={10} />
                        {formatDistanceToNow(notification.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all absolute top-2 right-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <SheetFooter className="p-4 border-t mt-0" style={{ borderColor: "var(--app-border)" }}>
            <Button
              variant="outline"
              onClick={clearAll}
              className="w-full h-11 rounded-xl border-white/10 bg-white/5 font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
            >
              Clear All Notifications
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
