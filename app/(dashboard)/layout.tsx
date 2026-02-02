'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { UserProvider } from '@/contexts/UserContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()

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

  // 세션이 완전히 로드된 후에만 역할 결정
  const currentRole: 'buyer' | 'supplier' = session.user.role as 'buyer' | 'supplier'

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 상단 네비게이션 */}
        <TopNav
          userRole={currentRole}
          userName={session?.user?.companyName}
          userEmail={session?.user?.email}
          onLogout={handleLogout}
        />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* 푸터 */}
        <Footer variant="dashboard" />
      </div>
    </UserProvider>
  )
}
