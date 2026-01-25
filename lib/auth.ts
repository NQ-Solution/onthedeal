import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('등록되지 않은 이메일입니다.')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('비밀번호가 올바르지 않습니다.')
        }

        if (user.approvalStatus !== 'approved' && user.role !== 'admin') {
          if (user.approvalStatus === 'pending') {
            throw new Error('승인 대기 중인 계정입니다. 관리자 승인 후 로그인 가능합니다.')
          }
          if (user.approvalStatus === 'rejected') {
            throw new Error('승인이 거절된 계정입니다. 관리자에게 문의해주세요.')
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.contactName,
          role: user.role,
          companyName: user.companyName,
          approvalStatus: user.approvalStatus,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyName = user.companyName
        token.approvalStatus = user.approvalStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyName = token.companyName as string
        session.user.approvalStatus = token.approvalStatus as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
