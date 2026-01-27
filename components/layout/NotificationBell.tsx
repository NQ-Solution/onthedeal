'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Bell, MessageSquare, FileText, CheckCircle, AlertTriangle, ShoppingCart, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_message':
      return <MessageSquare className="w-5 h-5 text-blue-500" />
    case 'new_quote':
      return <FileText className="w-5 h-5 text-primary-500" />
    case 'deal_confirmed':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'order_update':
      return <ShoppingCart className="w-5 h-5 text-purple-500" />
    case 'chat_expiring':
    case 'chat_expired':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    default:
      return <Bell className="w-5 h-5 text-gray-500" />
  }
}

export function NotificationBell() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return

    try {
      setLoading(true)
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // 초기 로드 및 주기적 갱신
  useEffect(() => {
    if (session?.user) {
      fetchNotifications()

      // 30초마다 알림 갱신
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [session?.user, fetchNotifications])

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 개별 알림 읽음 처리
  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  // 로그인하지 않은 경우 숨김
  if (!session?.user) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-7 h-7 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b-2 border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-base text-primary-600 hover:underline font-medium"
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-lg text-gray-500">새로운 알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link || '#'}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id)
                    }
                    setIsOpen(false)
                  }}
                >
                  <div className={`px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-primary-50/50' : ''
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-base font-semibold text-gray-900 ${
                            !notification.is_read ? 'font-bold' : ''
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* 푸터 */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 border-t-2 border-gray-100 bg-gray-50">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-base text-primary-600 hover:underline font-medium"
              >
                모든 알림 보기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
