'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, MessageSquare, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

// Mock notifications
const mockNotifications = [
  {
    id: '1',
    type: 'new_message',
    title: '새 메시지가 도착했습니다',
    message: '네, 납품 가능합니다. 내일 오전에...',
    link: '/chat/chat-1',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
  },
  {
    id: '2',
    type: 'new_quote',
    title: '새 견적이 도착했습니다',
    message: '한우 등심 대량 구매에 대한 견적이 도착했습니다.',
    link: '/buyer/quotes',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
  },
  {
    id: '3',
    type: 'chat_expiring',
    title: '채팅방이 곧 만료됩니다',
    message: '24시간 내에 거래를 확정하지 않으면 채팅 내용이 삭제됩니다.',
    link: '/chat/chat-3',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
  },
  {
    id: '4',
    type: 'deal_confirmed',
    title: '딜이 확정되었습니다',
    message: '유기농 채소 세트 거래가 확정되었습니다.',
    link: '/buyer/orders',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
  },
]

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
    case 'chat_expiring':
    case 'chat_expired':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    default:
      return <Bell className="w-5 h-5 text-gray-500" />
  }
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 목업 데이터 로드
    setNotifications(mockNotifications)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
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
            {notifications.length === 0 ? (
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
                    markAsRead(notification.id)
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
