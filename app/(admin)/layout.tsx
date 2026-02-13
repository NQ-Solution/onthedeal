'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Package,
  MessageSquare,
  Mail,
  Settings,
  FileEdit,
  LogOut,
  Bell,
  ChevronDown,
  Coins,
  Megaphone,
} from 'lucide-react'

// 로고 컴포넌트 (fallback 포함)
function LogoWithFallback({ className = '' }: { className?: string }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div className={`bg-white rounded-xl flex items-center justify-center text-primary-600 font-bold ${className}`}>
        OD
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="OnTheDeal"
      className={`bg-white rounded-xl p-1 ${className}`}
      onError={() => setImgError(true)}
    />
  )
}

interface Notification {
  id: string
  type: 'user' | 'inquiry' | 'order' | 'rfq'
  message: string
  createdAt: string
  link: string
}

const adminMenus = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/users', label: '회원 관리', icon: Users },
  { href: '/admin/credits', label: '크레딧 관리', icon: Coins },
  { href: '/admin/rfqs', label: '발주 관리', icon: FileText },
  { href: '/admin/quotes', label: '제안 관리', icon: Receipt },
  { href: '/admin/orders', label: '주문 관리', icon: Package },
  { href: '/admin/chats', label: '채팅 관리', icon: MessageSquare },
  { href: '/admin/announcements', label: '공지사항 관리', icon: Megaphone },
  { href: '/admin/inquiries', label: '문의 관리', icon: Mail },
  { href: '/admin/content', label: '콘텐츠 관리', icon: FileEdit },
  { href: '/admin/settings', label: '사이트 설정', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    // 30초마다 알림 갱신
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setNotificationCount(data.totalCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 min-h-screen shadow-xl fixed left-0 top-0 bottom-0">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <LogoWithFallback className="w-12 h-12" />
            <div>
              <span className="font-bold text-xl text-white block">OnTheDeal</span>
              <span className="text-xs text-gray-400">Admin Console</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {adminMenus.map((menu) => {
            const Icon = menu.icon
            const isActive = pathname === menu.href ||
              (menu.href !== '/admin' && pathname.startsWith(menu.href))

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-base font-medium ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{menu.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>사이트로 돌아가기</span>
          </Link>
          <div className="text-xs text-gray-500 text-center mt-4">
            © 2026 OnTheDeal Admin
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">
            {adminMenus.find(m => pathname === m.href || (m.href !== '/admin' && pathname.startsWith(m.href)))?.label || '대시보드'}
          </h1>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">알림</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.link}
                          className="block p-4 hover:bg-gray-50 border-b border-gray-100"
                          onClick={() => setShowNotifications(false)}
                        >
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        새로운 알림이 없습니다
                      </div>
                    )}
                  </div>
                  {notificationCount > 0 && (
                    <div className="p-3 border-t border-gray-200">
                      <Link
                        href="/admin/users?status=pending"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => setShowNotifications(false)}
                      >
                        처리 대기 항목 보기
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">관리자</p>
                <p className="text-xs text-gray-500">admin@onthedeal.com</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
