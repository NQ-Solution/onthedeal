import Link from 'next/link'
import { ShoppingBag, FileText, MessageSquare, Shield } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex">
      {/* 왼쪽 - 브랜딩 영역 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-600 p-12 flex-col justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-primary-600 font-bold text-xl">OD</span>
          </div>
          <span className="font-bold text-3xl text-white">OnTheDeal</span>
        </Link>

        {/* 중앙 콘텐츠 */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              B2B 식자재 거래의<br />새로운 기준
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              신뢰할 수 있는 공급자와 구매자를 연결합니다.<br />
              간편한 RFQ 등록부터 안전한 거래까지.
            </p>
          </div>

          {/* 특징 카드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <FileText className="w-10 h-10 text-white mb-3" />
              <h3 className="text-lg font-bold text-white">RFQ 등록</h3>
              <p className="text-white/70 text-sm mt-1">간편하게 견적 요청</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <MessageSquare className="w-10 h-10 text-white mb-3" />
              <h3 className="text-lg font-bold text-white">실시간 채팅</h3>
              <p className="text-white/70 text-sm mt-1">직접 소통하며 협의</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Shield className="w-10 h-10 text-white mb-3" />
              <h3 className="text-lg font-bold text-white">안전 거래</h3>
              <p className="text-white/70 text-sm mt-1">에스크로 결제 시스템</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <ShoppingBag className="w-10 h-10 text-white mb-3" />
              <h3 className="text-lg font-bold text-white">주문 관리</h3>
              <p className="text-white/70 text-sm mt-1">체계적인 거래 관리</p>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <p className="text-white/60 text-lg">
          © 2026 OnTheDeal. All rights reserved. | Developed by <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">NQ Solution</a>
        </p>
      </div>

      {/* 오른쪽 - 폼 영역 */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* 모바일 헤더 */}
        <header className="lg:hidden p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">OD</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">OnTheDeal</span>
          </Link>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg">
            {children}
          </div>
        </main>

        {/* 모바일 푸터 */}
        <footer className="lg:hidden p-6 text-center text-base text-gray-500">
          © 2026 OnTheDeal. All rights reserved. | Developed by <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">NQ Solution</a>
        </footer>
      </div>
    </div>
  )
}
