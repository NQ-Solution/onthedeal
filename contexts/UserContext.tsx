'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

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

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const isLoading = status === 'loading'

  // 세션에서 사용자 정보 추출
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

  // 세션의 실제 역할 사용 (경로 기반 제거)
  const currentRole: 'buyer' | 'supplier' | 'admin' = user?.role || 'buyer'

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
