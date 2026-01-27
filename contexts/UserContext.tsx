'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  role: 'buyer' | 'supplier' | 'admin'
  companyName: string
  businessNumber?: string
  contactName: string
  phone: string
  storeAddress?: string
  address?: string
  createdAt: string
}

interface UserContextType {
  user: UserProfile | null
  currentRole: 'buyer' | 'supplier' | 'admin'
  isLoading: boolean
}

const defaultUser: UserProfile = {
  id: '',
  email: '',
  role: 'buyer',
  companyName: '',
  contactName: '',
  phone: '',
  createdAt: '',
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // 현재 경로에서 역할 감지
  const getCurrentRole = (): 'buyer' | 'supplier' | 'admin' => {
    if (pathname?.startsWith('/admin')) return 'admin'
    if (pathname?.startsWith('/supplier')) return 'supplier'
    return 'buyer'
  }

  const currentRole = getCurrentRole()
  const isLoading = status === 'loading'

  // session에서 사용자 정보 추출 (세션에 포함된 기본 필드만 사용)
  const user: UserProfile | null = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    role: (session.user.role as 'buyer' | 'supplier' | 'admin') || 'buyer',
    companyName: session.user.companyName || '',
    businessNumber: undefined,
    contactName: session.user.name || '',
    phone: '',
    storeAddress: undefined,
    address: undefined,
    createdAt: '',
  } : null

  return (
    <UserContext.Provider value={{ user, currentRole, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
