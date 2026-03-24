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
import {
  useNotifications,
  type Notification,
} from "@/context/NotificationContext"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Info,
  Radio,
  Trash2,
  X,
} from "lucide-react"

function formatDistanceToNow(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

// Props removed as it now uses context
const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  switch (type) {
    case "live":
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <Radio size={16} className="animate-pulse" />
        </div>
      )
    case "success":
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500">
          <CheckCircle2 size={16} />
        </div>
      )
    case "warning":
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <AlertTriangle size={16} />
        </div>
      )
    case "error":
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <X size={16} />
        </div>
      )
    default:
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
          <Info size={16} />
        </div>
      )
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
    deleteNotification,
  } = useNotifications()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        className="flex w-full flex-col border-t p-0 backdrop-blur-xl md:top-1/2 md:left-1/2 md:h-[min(82vh,760px)] md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:border md:shadow-2xl"
        style={{
          background: "var(--app-sidebar-bg)",
          borderColor: "var(--app-border)",
        }}
      >
        <SheetHeader
          className="border-b p-6"
          style={{ borderColor: "var(--app-border)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                <Bell size={20} />
              </div>
              <div>
                <SheetTitle
                  className="text-xl font-black tracking-tight"
                  style={{ color: "var(--app-text)" }}
                >
                  Notifications
                </SheetTitle>
                <SheetDescription className="text-xs font-bold tracking-widest text-cyan-500/80 uppercase">
                  {unreadCount} UNREAD MESSAGES
                </SheetDescription>
              </div>
            </div>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-[10px] font-black tracking-tighter uppercase hover:bg-white/5"
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
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/20">
                <Bell size={32} />
              </div>
              <h3
                className="text-lg font-bold"
                style={{ color: "var(--app-text)" }}
              >
                All caught up!
              </h3>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--app-text-muted)" }}
              >
                No new notifications at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-300",
                    !notification.isRead
                      ? "border-blue-500/30 bg-white/[0.03] shadow-lg shadow-blue-500/5"
                      : "border-white/5 bg-transparent hover:bg-white/[0.02]"
                  )}
                  style={{
                    borderColor: !notification.isRead
                      ? undefined
                      : "var(--app-border)",
                  }}
                >
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="absolute top-0 right-0 p-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <NotificationIcon type={notification.type} />
                    <div className="min-w-0 flex-1">
                      <h4
                        className="mb-1 truncate text-sm leading-tight font-bold"
                        style={{ color: "var(--app-text)" }}
                      >
                        {notification.title}
                      </h4>
                      <p
                        className="mb-2 line-clamp-2 text-xs leading-relaxed"
                        style={{ color: "var(--app-text-muted)" }}
                      >
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/30 uppercase">
                        <Clock size={10} />
                        {formatDistanceToNow(notification.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg text-red-400/50 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
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
          <SheetFooter
            className="mt-0 border-t p-4"
            style={{ borderColor: "var(--app-border)" }}
          >
            <Button
              variant="outline"
              onClick={clearAll}
              className="h-11 w-full rounded-xl border-white/10 bg-white/5 font-bold transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
            >
              Clear All Notifications
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
