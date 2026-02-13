'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Bell, MessageSquare, FileText, CheckCircle, AlertTriangle, ShoppingCart, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
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
      return <MessageSquare className="w-6 h-6 text-blue-500" />
    case 'new_quote':
      return <FileText className="w-6 h-6 text-primary-500" />
    case 'deal_confirmed':
      return <CheckCircle className="w-6 h-6 text-green-500" />
    case 'order_update':
      return <ShoppingCart className="w-6 h-6 text-purple-500" />
    case 'chat_expiring':
    case 'chat_expired':
      return <AlertTriangle className="w-6 h-6 text-yellow-500" />
    default:
      return <Bell className="w-6 h-6 text-gray-500" />
  }
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const limit = 20

  const fetchNotifications = useCallback(async (pageNum: number, append = false) => {
    if (!session?.user) return

    try {
      setLoading(true)
      const res = await fetch(`/api/notifications?limit=${limit}&offset=${(pageNum - 1) * limit}`)
      if (res.ok) {
        const data = await res.json()
        const newNotifications = data.notifications || []

        if (append) {
          setNotifications(prev => [...prev, ...newNotifications])
        } else {
          setNotifications(newNotifications)
        }

        setHasMore(newNotifications.length === limit)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  useEffect(() => {
    if (session?.user) {
      fetchNotifications(1)
    }
  }, [session?.user, fetchNotifications])

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
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotifications(nextPage, true)
  }

  if (status === 'loading' || loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 break-keep">알림</h1>
          {unreadCount > 0 && (
            <p className="text-gray-500 mt-1 whitespace-nowrap">읽지 않은 알림 {unreadCount}개</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="whitespace-nowrap shrink-0">
            모두 읽음 처리
          </Button>
        )}
      </div>

      {/* 알림 목록 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-5 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-primary-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={notification.link || '#'}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <p className={`text-lg text-gray-900 ${
                          !notification.is_read ? 'font-bold' : 'font-medium'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-gray-600 mt-1 break-keep">
                        {notification.message}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-400 mt-2">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {hasMore && notifications.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <Button
              variant="outline"
              className="w-full"
              onClick={loadMore}
              isLoading={loading}
            >
              더 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
