'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러 로깅 (실제 프로덕션에서는 Sentry 등 사용)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* 로고 */}
        <Link href="/" className="inline-flex items-center gap-3 mb-10">
          <Image src="/logo.png" alt="OnTheDeal" width={48} height={48} className="w-12 h-12" />
          <span className="font-bold text-3xl text-gray-900">OnTheDeal</span>
        </Link>

        {/* 에러 표시 */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl font-bold text-red-500">!</span>
        </div>

        {/* 메시지 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          일시적인 오류가 발생했습니다
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          죄송합니다. 예상치 못한 문제가 발생했습니다.<br />
          잠시 후 다시 시도해주세요.
        </p>

        {/* 버튼들 */}
        <div className="space-y-4 mb-10">
          <button
            onClick={reset}
            className="w-full py-5 px-8 bg-primary-500 text-white text-xl font-bold rounded-xl hover:bg-primary-600 transition-colors"
          >
            다시 시도하기
          </button>
          <Link
            href="/"
            className="block w-full py-5 px-8 bg-white border-2 border-gray-200 text-gray-700 text-xl font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {/* 문의 안내 */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <p className="text-lg text-gray-600 mb-4">
            문제가 계속되면 연락주세요
          </p>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="tel:02-1234-5678"
              className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <p className="text-gray-500 text-sm mb-1">전화번호</p>
              <p className="text-lg font-bold text-gray-900">02-1234-5678</p>
            </a>
            <Link
              href="/contact"
              className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <p className="text-gray-500 text-sm mb-1">온라인 문의</p>
              <p className="text-lg font-bold text-primary-600">문의하기</p>
            </Link>
          </div>
        </div>

        {/* 에러 ID (디버깅용) */}
        {error.digest && (
          <p className="mt-6 text-sm text-gray-400">
            오류 ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
