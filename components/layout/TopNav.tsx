'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Wallet, LogOut } from 'lucide-react'
import {
  FileText,
  PlusCircle,
  MessageSquare,
  User,
  Search,
} from 'lucide-react'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { Button } from '@/components/ui'

interface TopNavProps {
  userRole: 'buyer' | 'supplier'
  userName?: string
  userEmail?: string
  onLogout: () => void
}

const buyerMenus = [
  { href: '/buyer/rfqs', label: '내 발주', icon: FileText },
  { href: '/buyer/rfqs/new', label: '새 발주', icon: PlusCircle },
  { href: '/chat', label: '채팅', icon: MessageSquare },
  { href: '/profile', label: '내 정보', icon: User },
]

const supplierMenus = [
  { href: '/supplier/rfqs', label: '발주 찾기', icon: Search },
  { href: '/chat', label: '채팅', icon: MessageSquare },
  { href: '/profile', label: '내 정보', icon: User },
]

export function TopNav({ userRole, userName, userEmail, onLogout }: TopNavProps) {
  const pathname = usePathname()
  const menus = userRole === 'buyer' ? buyerMenus : supplierMenus
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)

  useEffect(() => {
    if (userRole === 'supplier') {
      fetchCreditBalance()
    }
  }, [userRole])

  const fetchCreditBalance = async () => {
    try {
      const res = await fetch('/api/supplier/credits')
      if (res.ok) {
        const data = await res.json()
        setCreditBalance(data.balance ?? 0)
      }
    } catch (error) {
      console.error('크레딧 조회 실패:', error)
    }
  }

  const formatCredit = (amount: number) => {
    if (amount >= 10000) {
      return `${Math.floor(amount / 10000).toLocaleString()}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* 메인 헤더 */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* 왼쪽: 로고 + 역할 */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                OD
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:block">OnTheDeal</span>
            </Link>
            <div className={`hidden sm:flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              userRole === 'buyer'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {userRole === 'buyer' ? '구매자' : '판매자'}
            </div>
          </div>

          {/* 중앙: 네비게이션 메뉴 (데스크톱) */}
          <nav className="hidden lg:flex items-center gap-1">
            {menus.map((menu) => {
              const Icon = menu.icon
              const isActive = pathname === menu.href || pathname.startsWith(menu.href + '/')

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{menu.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* 오른쪽: 크레딧 + 알림 + 로그아웃 */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* 크레딧 (판매자만) */}
            {userRole === 'supplier' && (
              <Link
                href="/supplier/credits"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {creditBalance !== null ? formatCredit(creditBalance) : '-'}
                </span>
              </Link>
            )}

            {/* 알림 */}
            <NotificationBell />

            {/* 로그아웃 (데스크톱) */}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="hidden sm:flex text-sm"
            >
              로그아웃
            </Button>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-2">
            {/* 역할 표시 (모바일) */}
            <div className="flex items-center justify-between py-2 mb-2 border-b border-gray-100">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                userRole === 'buyer'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {userRole === 'buyer' ? '구매자' : '판매자'}
              </div>

              {/* 크레딧 (판매자, 모바일) */}
              {userRole === 'supplier' && (
                <Link
                  href="/supplier/credits"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {creditBalance !== null ? formatCredit(creditBalance) : '-'}
                  </span>
                </Link>
              )}
            </div>

            {/* 메뉴 아이템 */}
            <div className="space-y-1">
              {menus.map((menu) => {
                const Icon = menu.icon
                const isActive = pathname === menu.href || pathname.startsWith(menu.href + '/')

                return (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{menu.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* 로그아웃 (모바일) */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onLogout()
                }}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">로그아웃</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
