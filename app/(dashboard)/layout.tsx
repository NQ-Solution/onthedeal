'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { UserProvider } from '@/contexts/UserContext'

// 개발 모드 목업 유저 - 역할 전환 가능
const mockUsers = {
  buyer: {
    email: 'buyer@company.com',
    company_name: '맛있는식당',
    role: 'buyer' as const,
  },
  supplier: {
    email: 'supplier@company.com',
    company_name: '프리미엄 한우농장',
    role: 'supplier' as const,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  // 현재 경로에서 역할 감지
  const getInitialRole = () => {
    if (pathname?.startsWith('/supplier')) return 'supplier'
    return 'buyer'
  }

  const [currentRole, setCurrentRole] = useState<'buyer' | 'supplier'>(getInitialRole)
  const [user, setUser] = useState(mockUsers[getInitialRole()])

  // 역할 전환 함수
  const handleRoleSwitch = (newRole: 'buyer' | 'supplier') => {
    setCurrentRole(newRole)
    setUser(mockUsers[newRole])
    // 해당 역할의 기본 페이지로 이동
    if (newRole === 'buyer') {
      router.push('/buyer/rfqs')
    } else {
      router.push('/supplier/rfqs')
    }
  }

  // 경로 변경 시 역할 동기화
  useEffect(() => {
    const newRole = getInitialRole()
    if (newRole !== currentRole) {
      setCurrentRole(newRole)
      setUser(mockUsers[newRole])
    }
  }, [pathname])

  const handleLogout = () => {
    // 실제로는 Supabase Auth signOut
    alert('로그아웃 되었습니다.')
    router.push('/login')
  }

  return (
    <UserProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userRole={user.role} />
        <div className="flex-1 flex flex-col">
          <Header
            user={user}
            onLogout={handleLogout}
            onRoleSwitch={handleRoleSwitch}
            currentRole={currentRole}
          />
          <main className="flex-1 p-6">
            {children}
          </main>
          <Footer variant="dashboard" />
        </div>
      </div>
    </UserProvider>
  )
}
