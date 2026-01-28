'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { User, Building2, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'

const TEST_ACCOUNTS = {
  buyer: { email: 'buyer@test.com', password: 'Test1234!', redirect: '/buyer/rfqs' },
  supplier: { email: 'supplier@test.com', password: 'Test1234!', redirect: '/supplier/rfqs' },
}

export default function AdminTestPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDevLogin = async (role: 'buyer' | 'supplier') => {
    setLoading(role)
    setError(null)

    const account = TEST_ACCOUNTS[role]

    try {
      const result = await signIn('credentials', {
        email: account.email,
        password: account.password,
        redirect: false,
      })

      if (result?.error) {
        setError(`로그인 실패: ${result.error}`)
        setLoading(null)
      } else {
        window.location.href = account.redirect
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">영업 데모 모드</h1>
            <p className="text-gray-600">테스트 계정으로 빠르게 접속</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              size="xl"
              variant="outline"
              onClick={() => handleDevLogin('buyer')}
              disabled={loading !== null}
              className="w-full justify-between h-20 text-lg border-2 hover:border-primary-500 hover:bg-primary-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  {loading === 'buyer' ? (
                    <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                  ) : (
                    <User className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">구매자 (Buyer)</p>
                  <p className="text-sm text-gray-500">발주 등록, 제안 확인</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </Button>

            <Button
              size="xl"
              variant="outline"
              onClick={() => handleDevLogin('supplier')}
              disabled={loading !== null}
              className="w-full justify-between h-20 text-lg border-2 hover:border-green-500 hover:bg-green-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  {loading === 'supplier' ? (
                    <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                  ) : (
                    <Building2 className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">공급자 (Supplier)</p>
                  <p className="text-sm text-gray-500">제안 제출, 주문 관리</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500 mb-4">
              <p className="font-medium">테스트 계정 정보</p>
              <p>buyer@test.com / Test1234!</p>
              <p>supplier@test.com / Test1234!</p>
            </div>
            <Link href="/login">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                일반 로그인으로 돌아가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
