'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Wallet } from 'lucide-react'
import {
  FileText,
  PlusCircle,
  Receipt,
  ShoppingBag,
  MessageSquare,
  User,
  Search,
  Package,
  Coins,
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

interface SidebarProps {
  userRole?: 'buyer' | 'supplier'
  isOpen?: boolean
  onClose?: () => void
}

const buyerMenus = [
  { href: '/buyer/rfqs', label: '내 발주', icon: FileText },
  { href: '/buyer/rfqs/new', label: '새 발주 등록', icon: PlusCircle },
  { href: '/buyer/quotes', label: '받은 제안', icon: Receipt },
  { href: '/buyer/orders', label: '주문 내역', icon: ShoppingBag },
  { href: '/chat', label: '채팅', icon: MessageSquare },
  { href: '/profile', label: '내 정보', icon: User },
]

const supplierMenus = [
  { href: '/supplier/rfqs', label: '발주 찾기', icon: Search },
  { href: '/supplier/quotes', label: '보낸 제안', icon: Receipt },
  { href: '/supplier/orders', label: '주문 관리', icon: Package },
  { href: '/supplier/credits', label: '크레딧', icon: Coins },
  { href: '/chat', label: '채팅', icon: MessageSquare },
  { href: '/profile', label: '내 정보', icon: User },
]

export function Sidebar({ userRole = 'buyer', isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const menus = userRole === 'buyer' ? buyerMenus : supplierMenus
  const [creditBalance, setCreditBalance] = useState<number | null>(null)

  // 공급자인 경우 크레딧 잔액 조회
  useEffect(() => {
    if (userRole === 'supplier') {
      fetchCreditBalance()
    }
  }, [userRole])

  const fetchCreditBalance = async () => {
    try {
      const res = await fetch('/api/credits')
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 lg:w-72 bg-gradient-to-b from-primary-500 to-primary-600
        min-h-screen shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* 로고 & 닫기 버튼 */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 border-b border-primary-400/30">
          <Link href="/" className="flex items-center gap-2 lg:gap-3">
            <LogoWithFallback className="w-10 h-10 lg:w-12 lg:h-12" />
            <span className="font-bold text-xl lg:text-2xl text-white">OnTheDeal</span>
          </Link>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/20 text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 유저 타입 표시 */}
        <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-primary-400/30">
          <div className={`inline-flex items-center px-4 lg:px-5 py-2 lg:py-3 rounded-xl text-base lg:text-lg font-bold ${
            userRole === 'buyer'
              ? 'bg-white text-primary-600'
              : 'bg-white text-green-600'
          }`}>
            {userRole === 'buyer' ? '🛒 구매자' : '🏭 판매자'}
          </div>
        </div>

        {/* 공급자 크레딧 잔액 표시 */}
        {userRole === 'supplier' && (
          <Link
            href="/supplier/credits"
            onClick={onClose}
            className="block px-4 lg:px-6 py-3 lg:py-4 border-b border-primary-400/30 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/80 text-sm lg:text-base">
                <Wallet className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>크레딧 잔액</span>
              </div>
              <span className="text-white font-bold text-lg lg:text-xl">
                {creditBalance !== null ? formatCredit(creditBalance) : '-'}
              </span>
            </div>
          </Link>
        )}

        {/* 네비게이션 메뉴 */}
        <nav className="p-3 lg:p-4">
          <ul className="space-y-1 lg:space-y-2">
            {menus.map((menu) => {
              const Icon = menu.icon
              const isActive = pathname === menu.href || pathname.startsWith(menu.href + '/')

              return (
                <li key={menu.href}>
                  <Link
                    href={menu.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3 lg:py-4 rounded-xl transition-all text-base lg:text-lg font-medium ${
                      isActive
                        ? 'bg-white text-primary-600 shadow-lg'
                        : 'text-white/90 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
                    <span>{menu.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
