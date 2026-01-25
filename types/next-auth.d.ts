import 'next-auth'
import { UserRole, ApprovalStatus } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    companyName: string
    approvalStatus: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      companyName: string
      approvalStatus: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    companyName: string
    approvalStatus: string
  }
}
