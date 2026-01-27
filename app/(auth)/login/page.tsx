'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button, Input } from '@/components/ui'
import { LogIn, Mail, Lock, ShoppingCart, Factory, ArrowRight } from 'lucide-react'
import { DEMO_MODE, DEMO_ACCOUNTS } from '@/lib/demo-mode'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 데모 모드: 바로 대시보드로 이동
  const handleDemoLogin = (role: 'buyer' | 'supplier' | 'admin') => {
    if (role === 'buyer') {
      router.push('/buyer/rfqs')
    } else if (role === 'supplier') {
      router.push('/supplier/rfqs')
    } else {
      router.push('/admin')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 데모 모드에서는 계정에 따라 바로 이동
    if (DEMO_MODE) {
      if (formData.email.includes('buyer') || formData.email === DEMO_ACCOUNTS.buyer.email) {
        router.push('/buyer/rfqs')
      } else if (formData.email.includes('supplier') || formData.email === DEMO_ACCOUNTS.supplier.email) {
        router.push('/supplier/rfqs')
      } else {
        // 기본 구매자로 이동
        router.push('/buyer/rfqs')
      }
      setLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.ok) {
        // 로그인 성공 시 역할에 따라 리다이렉트
        const response = await fetch('/api/auth/session')
        const session = await response.json()

        if (session?.user?.role === 'supplier') {
          router.push('/supplier/rfqs')
        } else if (session?.user?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/buyer/rfqs')
        }
      }
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">로그인</h1>
        <p className="text-xl text-gray-500">OnTheDeal에 오신 것을 환영합니다</p>
      </div>

      {/* 데모 모드 배너 & 빠른 접속 */}
      {DEMO_MODE && (
        <div className="bg-gradient-to-r from-blue-50 to-primary-50 border-2 border-blue-200 rounded-3xl p-6">
          <p className="text-blue-700 font-bold text-xl text-center mb-5">
            데모 버전 - 아래 버튼으로 바로 접속하세요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleDemoLogin('buyer')}
              className="p-5 bg-white border-2 border-primary-200 rounded-2xl hover:border-primary-400 hover:bg-primary-50 hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-7 h-7 text-primary-600" />
              </div>
              <p className="text-xl font-bold text-primary-600">구매자</p>
              <p className="text-gray-500 mt-1">발주서 작성, 제안 비교</p>
            </button>
            <button
              onClick={() => handleDemoLogin('supplier')}
              className="p-5 bg-white border-2 border-green-200 rounded-2xl hover:border-green-400 hover:bg-green-50 hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Factory className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-xl font-bold text-green-600">공급자</p>
              <p className="text-gray-500 mt-1">발주 확인, 제안 제출</p>
            </button>
          </div>
        </div>
      )}

      <Card className="shadow-2xl border-2 rounded-3xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-8 space-y-6">
            {message === 'registered' && (
              <div className="p-5 bg-green-50 text-green-700 text-lg rounded-2xl border-2 border-green-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-green-600" />
                </div>
                <span>회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.</span>
              </div>
            )}
            {error && (
              <div className="p-5 bg-red-50 text-red-700 text-lg rounded-2xl border-2 border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 mt-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  label="이메일"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="pl-12"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 mt-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  label="비밀번호"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="비밀번호를 입력하세요"
                  className="pl-12"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-lg text-primary-600 hover:underline font-medium">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-5 pt-2 pb-8">
            <Button type="submit" size="xl" className="w-full text-lg py-4" isLoading={loading}>
              <LogIn className="w-6 h-6 mr-2" />
              로그인
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-base">
                <span className="bg-white px-4 text-gray-500">또는</span>
              </div>
            </div>

            <p className="text-lg text-center text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/register" className="text-primary-600 hover:underline font-bold">
                회원가입
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* 서비스 소개 링크 */}
      <div className="text-center bg-gray-50 rounded-2xl p-6">
        <p className="text-lg text-gray-600">
          OnTheDeal이 처음이신가요?{' '}
          <Link href="/" className="text-primary-600 hover:underline font-bold inline-flex items-center gap-1">
            서비스 소개 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-gray-500">로딩 중...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
