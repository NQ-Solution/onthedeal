'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { mockBuyers, mockSuppliers } from '@/lib/mock-data'
import { Profile } from '@/types'

interface UserContextType {
  user: Profile
  currentRole: 'buyer' | 'supplier'
  setCurrentRole: (role: 'buyer' | 'supplier') => void
}

// 개발 모드 목업 유저 (mock-data에서 가져옴)
const mockUsers: Record<'buyer' | 'supplier', Profile> = {
  buyer: mockBuyers[0],
  supplier: mockSuppliers[0],
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // 현재 경로에서 역할 감지
  const getInitialRole = (): 'buyer' | 'supplier' => {
    if (pathname?.startsWith('/supplier')) return 'supplier'
    return 'buyer'
  }

  const [currentRole, setCurrentRole] = useState<'buyer' | 'supplier'>(getInitialRole)
  const [user, setUser] = useState<Profile>(mockUsers[getInitialRole()])

  // 경로 변경 시 역할 동기화
  useEffect(() => {
    const newRole = getInitialRole()
    if (newRole !== currentRole) {
      setCurrentRole(newRole)
      setUser(mockUsers[newRole])
    }
  }, [pathname])

  // 역할 변경 시 사용자 정보도 업데이트
  useEffect(() => {
    setUser(mockUsers[currentRole])
  }, [currentRole])

  return (
    <UserContext.Provider value={{ user, currentRole, setCurrentRole }}>
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
