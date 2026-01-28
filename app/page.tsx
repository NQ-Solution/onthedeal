'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui'
import { Footer } from '@/components/layout/Footer'

// 로고 컴포넌트 (fallback 포함)
function LogoWithFallback({ className = '' }: { className?: string }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div className={`bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold ${className}`}>
        OD
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="OnTheDeal"
      className={className}
      onError={() => setImgError(true)}
    />
  )
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 로그인한 사용자의 대시보드 경로
  const getDashboardPath = () => {
    if (!session?.user?.role) return '/login'
    switch (session.user.role) {
      case 'admin': return '/admin'
      case 'supplier': return '/supplier/rfqs'
      case 'buyer': return '/buyer/rfqs'
      default: return '/login'
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <LogoWithFallback className="w-10 h-10 sm:w-12 sm:h-12" />
            <span className="font-bold text-xl sm:text-3xl text-gray-900">OnTheDeal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-lg font-medium text-gray-600 hover:text-primary-600 transition-colors">
              소개
            </Link>
            <Link href="/contact" className="text-lg font-medium text-gray-600 hover:text-primary-600 transition-colors">
              문의하기
            </Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden sm:flex gap-3 sm:gap-4">
            {status === 'loading' ? (
              <div className="w-24 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : session ? (
              <>
                <Link href={getDashboardPath()}>
                  <Button variant="outline" size="md" className="sm:text-base gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    대시보드
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="md"
                  className="sm:text-base gap-2 text-gray-600 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="md" className="sm:text-base">로그인</Button>
                </Link>
                <Link href="/register">
                  <Button size="md" className="sm:text-base">회원가입</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <nav className="flex flex-col gap-3 mb-4">
              <Link
                href="/about"
                className="text-lg font-medium text-gray-600 hover:text-primary-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                소개
              </Link>
              <Link
                href="/contact"
                className="text-lg font-medium text-gray-600 hover:text-primary-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                문의하기
              </Link>
            </nav>
            <div className="flex flex-col gap-3">
              {session ? (
                <>
                  <Link href={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="lg" className="w-full gap-2">
                      <LayoutDashboard className="w-5 h-5" />
                      대시보드
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full gap-2 text-gray-600 hover:text-red-600"
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  >
                    <LogOut className="w-5 h-5" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="lg" className="w-full">로그인</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="lg" className="w-full">회원가입</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Main Hero */}
        <div className="mb-10 sm:mb-16">
          <div className="bg-primary-500 rounded-xl sm:rounded-2xl p-6 sm:p-10 lg:p-16 text-white">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                사장님, 거래처 찾는 일은<br />여기서 끝내세요
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
                간단한 발주서 하나면 제안이 모이고 거래가 끝납니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/register?role=buyer" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100">
                    구매자로 시작하기
                  </Button>
                </Link>
                <Link href="/register?role=supplier" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/20">
                    판매자로 시작하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - For Buyers & Suppliers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-16">
          {/* For Buyers */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-10 border-2 border-gray-200">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">구매자</h3>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                필요한 발주 내용을 간편히 등록하면<br className="hidden sm:block" />
                다양한 제안을 받을 수 있어요
              </p>
            </div>
            <ol className="space-y-4 sm:space-y-5 mb-6 sm:mb-8 text-base sm:text-lg">
              <li className="flex items-start gap-3 sm:gap-4">
                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">1</span>
                <div>
                  <p className="font-bold text-gray-900 text-lg sm:text-xl">발주서 작성</p>
                  <p className="text-gray-600 text-sm sm:text-base">필요한 품목을 자유롭게 등록</p>
                </div>
              </li>
              <li className="flex items-start gap-3 sm:gap-4">
                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">2</span>
                <div>
                  <p className="font-bold text-gray-900 text-lg sm:text-xl">조건 확인</p>
                  <p className="text-gray-600 text-sm sm:text-base">여러 판매자의 조건이 한눈에</p>
                </div>
              </li>
              <li className="flex items-start gap-3 sm:gap-4">
                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">3</span>
                <div>
                  <p className="font-bold text-gray-900 text-lg sm:text-xl">거래 확정</p>
                  <p className="text-gray-600 text-sm sm:text-base">채팅으로 최종 협의 후 안심 결제</p>
                </div>
              </li>
            </ol>
            <Link href="/register?role=buyer">
              <Button size="lg" className="w-full text-base sm:text-xl py-4 sm:py-5">
                구매자로 시작하기
              </Button>
            </Link>
          </div>

          {/* For Suppliers */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-10 border-2 border-gray-200">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">판매자</h3>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                구매자의 발주요청을 확인하고<br className="hidden sm:block" />
                가능한 조건으로 제안하세요
              </p>
            </div>
            <ol className="space-y-4 sm:space-y-5 mb-6 sm:mb-8 text-base sm:text-lg">
              <li className="flex items-start gap-3 sm:gap-4">
                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">1</span>
                <div>
                  <p className="font-bold text-gray-900 text-lg sm:text-xl">발주서 검색</p>
                  <p className="text-gray-600 text-sm sm:text-base">납품 가능한 발주를 찾아보세요</p>
                </div>
              </li>
              <li className="flex items-start gap-3 sm:gap-4">
                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">2</span>
                <div>
                  <p className="font-bold text-gray-900 text-lg sm:text-xl">조건 제안하기</p>
                  <p className="text-gray-600 text-sm sm:text-base">품질, 가격, 납품조건 등을 제안하세요</p>
                </div>
              </li>
              <li className="flex items-start gap-3 sm:gap-4">
                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">3</span>
                <div>
                  <p className="font-bold text-gray-900 text-lg sm:text-xl">거래 확정</p>
                  <p className="text-gray-600 text-sm sm:text-base">결제 완료 후 공식 거래 이력 축적</p>
                </div>
              </li>
            </ol>
            <Link href="/register?role=supplier">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-base sm:text-xl py-4 sm:py-5">
                판매자로 시작하기
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mb-10 sm:mb-16">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">안전하고 편리한 거래</h2>
            <p className="text-lg sm:text-xl text-gray-500">온더딜이 거래의 모든 과정을 도와드립니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-4xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">간편한 발주</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                복잡한 과정 없이 필요한 것만 입력하면
                다양한 제안을 받아볼 수 있어요
              </p>
            </div>
            <div className="text-center p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-4xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">실시간 채팅</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                가격, 품질, 배송 등 세부 조건을
                직접 소통하며 조율하세요
              </p>
            </div>
            <div className="text-center p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-4xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">안전한 에스크로</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                결제 대금은 상품 수령 확인 전까지
                안전하게 보호됩니다
              </p>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-10 mb-10 sm:mb-16">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">구매자와 판매자 모두를 보호합니다</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">구매자 보호</h4>
              <ul className="space-y-3 sm:space-y-4 text-base sm:text-lg">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">✓</span>
                  <span>상품 수령 확인 전까지 대금 보호</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">✓</span>
                  <span>검증된 판매자만 참여</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">✓</span>
                  <span>문제 발생 시 중재 지원</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">판매자 보호</h4>
              <ul className="space-y-3 sm:space-y-4 text-base sm:text-lg">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">✓</span>
                  <span>결제 확인 후 배송으로 미수금 방지</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">✓</span>
                  <span>배송 완료 후 빠른 정산</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">✓</span>
                  <span>신뢰할 수 있는 구매자 풀</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-500 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">쉽고 공정한 거래가 가능한 OnTheDeal</h2>
          <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-xl mx-auto">
            회원가입은 무료입니다. 거래가 성사될 때만 수수료가 발생해요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100 text-base sm:text-xl">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-base sm:text-xl">
                자세히 알아보기
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
