'use client'

import { LogOut, RefreshCw } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { NotificationBell } from './NotificationBell'

interface HeaderProps {
  user?: {
    email: string
    company_name?: string
    role?: 'buyer' | 'supplier'
  }
  onLogout?: () => void
  onRoleSwitch?: (role: 'buyer' | 'supplier') => void
  currentRole?: 'buyer' | 'supplier'
}

export function Header({ user, onLogout, onRoleSwitch, currentRole }: HeaderProps) {
  const handleRoleToggle = () => {
    if (onRoleSwitch) {
      const newRole = currentRole === 'buyer' ? 'supplier' : 'buyer'
      onRoleSwitch(newRole)
    }
  }

  return (
    <header className="h-20 bg-white border-b-2 border-gray-200 px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
          {user?.company_name || '대시보드'}
        </h1>
        {/* 개발 모드 표시 */}
        <Badge variant="warning" className="text-sm px-3 py-1">
          DEV MODE
        </Badge>
      </div>

      <div className="flex items-center gap-6">
        {/* 역할 전환 버튼 */}
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-xl">
          <span className="text-base text-gray-500 whitespace-nowrap">현재:</span>
          <span className={`text-lg font-bold whitespace-nowrap ${currentRole === 'buyer' ? 'text-primary-600' : 'text-green-600'}`}>
            {currentRole === 'buyer' ? '구매자' : '공급자'}
          </span>
          <button
            onClick={handleRoleToggle}
            className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="역할 전환"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 알림 벨 */}
        <NotificationBell />

        <div className="flex items-center gap-4">
          <span className="text-lg text-gray-600">{user?.email}</span>
          <Button variant="outline" size="md" onClick={onLogout}>
            <LogOut className="w-5 h-5 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  )
}
