"use client"

import React, { createContext, useContext, useState } from 'react'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'live'

export interface Notification {
  id: string
  title: string
  description: string
  timestamp: Date
  type: NotificationType
  isRead: boolean
  link?: string
}

interface NotificationContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Live Radio Started',
    description: 'The Jesus Is Lord Radio is now live with a powerful message.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    type: 'live',
    isRead: false,
    link: '/jesus-is-lord-radio'
  },
  {
    id: '2',
    title: 'New Teaching Uploaded',
    description: 'A new teaching titled "The Walk of Holiness" has been added to the library.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    type: 'info',
    isRead: false,
    link: '/teachings'
  },
  {
    id: '3',
    title: 'Upcoming Prophecy',
    description: 'Prepare your hearts for the upcoming prophecy broadcast this Sunday.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    type: 'warning',
    isRead: true,
    link: '/prophecies'
  }
]

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...n,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      isRead: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{
      isOpen,
      setIsOpen,
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
