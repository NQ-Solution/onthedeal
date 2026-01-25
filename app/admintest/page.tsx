'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { User, Building2, Shield, Code, ArrowRight, Loader2 } from 'lucide-react'

const TEST_ACCOUNTS = {
  buyer: { email: 'buyer@test.com', password: 'test1234', redirect: '/buyer/rfqs' },
  supplier: { email: 'supplier@test.com', password: 'test1234', redirect: '/supplier/rfqs' },
  admin: { email: 'admin@test.com', password: 'test1234', redirect: '/admin' },
}

export default function AdminTestPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDevLogin = async (role: 'buyer' | 'supplier' | 'admin') => {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-2 border-dashed border-yellow-400 bg-yellow-50">
          <CardContent className="py-10 px-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-10 h-10 text-yellow-700" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">개발자 테스트 모드</h1>
              <p className="text-lg text-gray-600">
                로그인 없이 각 역할로 빠르게 접근할 수 있습니다
              </p>
              <p className="text-sm text-yellow-700 mt-2 font-medium">
                * 이 페이지는 개발/테스트 용도로만 사용하세요
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
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
                    <p className="text-sm text-gray-500">RFQ 등록, 견적 확인, 채팅</p>
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
                    <p className="text-sm text-gray-500">견적 제출, 주문 관리, 크레딧</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </Button>

              <Button
                size="xl"
                variant="outline"
                onClick={() => handleDevLogin('admin')}
                disabled={loading !== null}
                className="w-full justify-between h-20 text-lg border-2 border-red-200 hover:border-red-500 hover:bg-red-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    {loading === 'admin' ? (
                      <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                    ) : (
                      <Shield className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">관리자 (Admin)</p>
                    <p className="text-sm text-gray-500">회원 관리, 주문 관리, 설정</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-yellow-300">
              <h3 className="font-bold text-gray-900 mb-3">테스트 계정 정보</h3>
              <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">구매자:</span>
                  <span className="font-mono">buyer@test.com / test1234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">공급자:</span>
                  <span className="font-mono">supplier@test.com / test1234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">관리자:</span>
                  <span className="font-mono">admin@test.com / test1234</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
