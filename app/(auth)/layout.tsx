'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, FileText, MessageSquare, Shield, CheckCircle } from 'lucide-react'

// 로고 컴포넌트 (fallback 포함)
function LogoWithFallback({ className = '', bgClass = 'bg-white' }: { className?: string, bgClass?: string }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div className={`${bgClass} rounded-2xl flex items-center justify-center text-primary-600 font-bold ${className}`}>
        OD
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="OnTheDeal"
      className={`${bgClass} rounded-2xl p-1.5 shadow-lg ${className}`}
      onError={() => setImgError(true)}
    />
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex">
      {/* 왼쪽 - 브랜딩 영역 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* 로고 */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <LogoWithFallback className="w-12 h-12" />
          <span className="font-bold text-3xl text-white">OnTheDeal</span>
        </Link>

        {/* 중앙 콘텐츠 */}
        <div className="space-y-10 relative z-10">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              거래처 찾는 일은<br />가장 단순하게
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              발주를 올리고 제안이 모이면 거래는 끝.<br />
              회원가입은 무료입니다.
            </p>
          </div>

          {/* 특징 카드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 hover:bg-white/15 transition-colors">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">발주 등록</h3>
              <p className="text-white/70 text-sm mt-1">간편하게 발주 및 제안 요청</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 hover:bg-white/15 transition-colors">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">실시간 채팅</h3>
              <p className="text-white/70 text-sm mt-1">직접 소통하며 협의</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 hover:bg-white/15 transition-colors">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">안전 거래</h3>
              <p className="text-white/70 text-sm mt-1">에스크로 결제 시스템</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 hover:bg-white/15 transition-colors">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">주문 관리</h3>
              <p className="text-white/70 text-sm mt-1">체계적인 거래 관리</p>
            </div>
          </div>

          {/* 신뢰 지표 */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm">검증된 공급자</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm">안전한 결제</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm">빠른 정산</span>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <p className="text-white/60 text-lg relative z-10">
          © 2026 (주) 티투알웍스
        </p>
      </div>

      {/* 오른쪽 - 폼 영역 */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* 모바일 헤더 */}
        <header className="lg:hidden p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <LogoWithFallback className="w-10 h-10" bgClass="bg-primary-500" />
            <span className="font-bold text-2xl text-gray-900">OnTheDeal</span>
          </Link>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-lg py-8">
            {children}
          </div>
        </main>

        {/* 모바일 푸터 */}
        <footer className="lg:hidden p-6 text-center text-base text-gray-500 border-t border-gray-100">
          © 2026 (주) 티투알웍스
        </footer>
      </div>
    </div>
  )
}
