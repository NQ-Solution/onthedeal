'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { UserProvider } from '@/contexts/UserContext'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { Button } from '@/components/ui'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 로그인 상태 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  // 로딩 중 또는 세션 정보가 아직 없을 때
  if (status === 'loading' || !session?.user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // 세션이 완전히 로드된 후에만 역할 결정 (기본값 사용 안함)
  const currentRole: 'buyer' | 'supplier' = session.user.role as 'buyer' | 'supplier'

  return (
    <UserProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          userRole={currentRole}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 lg:h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
            {/* Left: Menu Button (Mobile) & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
                {session?.user?.companyName || '대시보드'}
              </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Notification */}
              <NotificationBell />

              {/* User Info (Desktop only) */}
              <span className="hidden md:block text-sm text-gray-500 truncate max-w-[150px]">
                {session?.user?.email}
              </span>

              {/* Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-sm"
              >
                <span className="hidden sm:inline">로그아웃</span>
                <span className="sm:hidden">나가기</span>
              </Button>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>

          {/* Footer */}
          <Footer variant="dashboard" />
        </div>
      </div>
    </UserProvider>
  )
}
