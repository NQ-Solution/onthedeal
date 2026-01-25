'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
  Home
} from 'lucide-react'

interface SidebarProps {
  userRole?: 'buyer' | 'supplier'
}

const buyerMenus = [
  { href: '/buyer/rfqs', label: '내 발주', icon: FileText },
  { href: '/buyer/rfqs/new', label: '새 발주 등록', icon: PlusCircle },
  { href: '/buyer/quotes', label: '받은 견적', icon: Receipt },
  { href: '/buyer/orders', label: '주문 내역', icon: ShoppingBag },
  { href: '/chat', label: '채팅', icon: MessageSquare },
  { href: '/profile', label: '내 정보', icon: User },
]

const supplierMenus = [
  { href: '/supplier/rfqs', label: '발주 찾기', icon: Search },
  { href: '/supplier/quotes', label: '보낸 견적', icon: Receipt },
  { href: '/supplier/orders', label: '주문 관리', icon: Package },
  { href: '/supplier/credits', label: '크레딧', icon: Coins },
  { href: '/chat', label: '채팅', icon: MessageSquare },
  { href: '/profile', label: '내 정보', icon: User },
]

export function Sidebar({ userRole = 'buyer' }: SidebarProps) {
  const pathname = usePathname()
  const menus = userRole === 'buyer' ? buyerMenus : supplierMenus

  return (
    <aside className="w-72 bg-gradient-to-b from-primary-500 to-primary-600 min-h-screen shadow-xl">
      {/* 로고 */}
      <div className="h-20 flex items-center px-6 border-b border-primary-400/30">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="OnTheDeal" width={48} height={48} className="w-12 h-12 bg-white rounded-xl p-1" />
          <span className="font-bold text-2xl text-white">OnTheDeal</span>
        </Link>
      </div>

      {/* 유저 타입 표시 */}
      <div className="px-6 py-5 border-b border-primary-400/30">
        <div className={`inline-flex items-center px-5 py-3 rounded-xl text-lg font-bold ${
          userRole === 'buyer'
            ? 'bg-white text-primary-600'
            : 'bg-white text-green-600'
        }`}>
          {userRole === 'buyer' ? '🛒 구매자 모드' : '🏭 판매자 모드'}
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menus.map((menu) => {
            const Icon = menu.icon
            const isActive = pathname === menu.href || pathname.startsWith(menu.href + '/')

            return (
              <li key={menu.href}>
                <Link
                  href={menu.href}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-lg font-medium ${
                    isActive
                      ? 'bg-white text-primary-600 shadow-lg'
                      : 'text-white/90 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="w-7 h-7" />
                  <span>{menu.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 하단 정보 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20">
        <div className="text-base text-white/70 text-center">
          © 2026 <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">NQ Solution</a>
        </div>
      </div>
    </aside>
  )
}
