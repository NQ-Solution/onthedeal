'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'

const adminMenus = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/users', label: '회원 관리', icon: Users },
  { href: '/admin/rfqs', label: 'RFQ 관리', icon: FileText },
  { href: '/admin/quotes', label: '견적 관리', icon: Receipt },
  { href: '/admin/orders', label: '주문 관리', icon: Package },
  { href: '/admin/chats', label: '채팅 관리', icon: MessageSquare },
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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 min-h-screen shadow-xl fixed left-0 top-0 bottom-0">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-700">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logo.png" alt="OnTheDeal" width={48} height={48} className="w-12 h-12 bg-white rounded-xl p-1" />
            <div>
              <span className="font-bold text-xl text-white block">OnTheDeal</span>
              <span className="text-xs text-gray-400">Admin Console</span>
            </div>
          </Link>
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
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  5
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">알림</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm text-gray-900">새로운 회원가입 승인 요청</p>
                      <p className="text-xs text-gray-500 mt-1">5분 전</p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm text-gray-900">새로운 문의가 접수되었습니다</p>
                      <p className="text-xs text-gray-500 mt-1">10분 전</p>
                    </div>
                    <div className="p-4 hover:bg-gray-50">
                      <p className="text-sm text-gray-900">주문 #1234 결제 완료</p>
                      <p className="text-xs text-gray-500 mt-1">30분 전</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <Link href="/admin" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      모든 알림 보기
                    </Link>
                  </div>
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
