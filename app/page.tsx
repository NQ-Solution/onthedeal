'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, LayoutDashboard, LogOut, ArrowRight, Shield, Truck, Check } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-md bg-white/80 border-b border-gray-100/50 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <LogoWithFallback className="w-10 h-10 sm:w-12 sm:h-12 transition-transform group-hover:scale-110" />
              <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">OnTheDeal</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/about" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-all hover:-translate-y-0.5">
                소개
              </Link>
              <Link href="/contact" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-all hover:-translate-y-0.5">
                문의하기
              </Link>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden sm:flex gap-3">
              {status === 'loading' ? (
                <div className="w-24 h-10 bg-gray-100 rounded-xl animate-pulse"></div>
              ) : session ? (
                <>
                  <Link href={getDashboardPath()}>
                    <Button variant="outline" size="md" className="gap-2 rounded-xl border-2 hover:border-primary-300 hover:bg-primary-50">
                      <LayoutDashboard className="w-4 h-4" />
                      대시보드
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="md"
                    className="gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="md" className="text-gray-600 hover:text-primary-600">로그인</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="md" className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25">회원가입</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
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
            <div className="sm:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-in slide-in-from-top-2">
              <nav className="flex flex-col gap-2 mb-4">
                <Link
                  href="/about"
                  className="text-lg font-medium text-gray-600 hover:text-primary-600 py-3 px-4 rounded-xl hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  소개
                </Link>
                <Link
                  href="/contact"
                  className="text-lg font-medium text-gray-600 hover:text-primary-600 py-3 px-4 rounded-xl hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  문의하기
                </Link>
              </nav>
              <div className="flex flex-col gap-3">
                {session ? (
                  <>
                    <Link href={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="lg" className="w-full gap-2 rounded-xl">
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
                      <Button variant="outline" size="lg" className="w-full rounded-xl">로그인</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="lg" className="w-full rounded-xl">회원가입</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        {/* Main Hero - Orange Background */}
        <section className="relative overflow-hidden bg-primary-500">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
            <div className="text-center text-white">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-balance">
                거래처 찾는 일은
                <br />
                {`'발주서'`} 작성 한 번으로
                <br />
                끝낼 수 있어요
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto text-pretty">
                축산물을 시작으로 다양한 거래로 확장될 예정입니다.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={session ? (session.user?.role === 'buyer' ? '/buyer/rfqs' : '/register?role=buyer') : '/register?role=buyer'}>
                  <Button size="xl" className="w-full sm:w-auto rounded-xl bg-white text-primary-600 hover:bg-gray-100 shadow-lg gap-2 text-lg px-8 font-bold">
                    {session?.user?.role === 'buyer' ? '내 발주 보기' : '구매자로 시작하기'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href={session ? (session.user?.role === 'supplier' ? '/supplier/rfqs' : '/register?role=supplier') : '/register?role=supplier'}>
                  <Button size="xl" variant="outline" className="w-full sm:w-auto rounded-xl border-2 border-white text-white hover:bg-white/10 gap-2 text-lg px-8 font-bold">
                    {session?.user?.role === 'supplier' ? '판매자 대시보드' : '판매자로 시작하기'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - For Buyers & Suppliers */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* For Buyers */}
            <div className="bg-white rounded-2xl p-6 sm:p-10 border-2 border-gray-200">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-balance">식당 사장님이라면?</h3>
                <p className="text-lg sm:text-xl text-gray-500 text-pretty">필요한 발주 내용을 간편히 등록하면 다양한 제안을 받을 수 있어요</p>
              </div>
              <ol className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
                <li className="flex items-start gap-3 sm:gap-4">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">1</span>
                  <div>
                    <p className="font-bold text-gray-900 text-lg sm:text-xl">{`'발주서'`} 작성</p>
                    <p className="text-gray-600 text-sm sm:text-base">필요한 품목 자유롭게 등록</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 sm:gap-4">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">2</span>
                  <div>
                    <p className="font-bold text-gray-900 text-lg sm:text-xl">조건 확인</p>
                    <p className="text-gray-600 text-sm sm:text-base">여러 판매자의 조건이 한눈에</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 sm:gap-4">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">3</span>
                  <div>
                    <p className="font-bold text-gray-900 text-lg sm:text-xl">거래 확정</p>
                    <p className="text-gray-600 text-sm sm:text-base">채팅으로 최종 협의 후 안심 결제</p>
                  </div>
                </li>
              </ol>
              <Link href={session?.user?.role === 'buyer' ? '/buyer/rfqs' : '/register?role=buyer'}>
                <Button size="lg" className="w-full text-lg sm:text-xl py-4 sm:py-5">
                  {session?.user?.role === 'buyer' ? '내 발주 보기' : '구매자로 시작하기'}
                </Button>
              </Link>
            </div>

            {/* For Suppliers */}
            <div className="bg-white rounded-2xl p-6 sm:p-10 border-2 border-gray-200">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-balance">축산물 판매자라면?</h3>
                <p className="text-lg sm:text-xl text-gray-500 text-pretty">{`구매자의 '발주'요청을 확인하고 가능한 조건으로 제안하세요`}</p>
              </div>
              <ol className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
                <li className="flex items-start gap-3 sm:gap-4">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">1</span>
                  <div>
                    <p className="font-bold text-gray-900 text-lg sm:text-xl">{`'발주서'`} 검색</p>
                    <p className="text-gray-600 text-sm sm:text-base">납품 가능한 발주를 찾아보세요</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 sm:gap-4">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">2</span>
                  <div>
                    <p className="font-bold text-gray-900 text-lg sm:text-xl">조건 제안하기</p>
                    <p className="text-gray-600 text-sm sm:text-base">품질, 가격, 납품조건 등 제안하세요</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 sm:gap-4">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">3</span>
                  <div>
                    <p className="font-bold text-gray-900 text-lg sm:text-xl">거래확정</p>
                    <p className="text-gray-600 text-sm sm:text-base">결제 완료 후 거래 이력 축적</p>
                  </div>
                </li>
              </ol>
              <Link href={session?.user?.role === 'supplier' ? '/supplier/rfqs' : '/register?role=supplier'}>
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg sm:text-xl py-4 sm:py-5">
                  {session?.user?.role === 'supplier' ? '발주 확인하기' : '판매자로 시작하기'}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Process Section - Unique Cards */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:whitespace-nowrap text-balance">
              온더딜에서는 거래가 복잡하지 않아요
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 whitespace-nowrap">간편한 발주</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  복잡한 과정 없이 필요한 것만 입력하면 다양한 제안을 받아볼 수 있어요
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 whitespace-nowrap">실시간 채팅</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  가격, 품질, 배송 등 세부 조건을 직접 소통하며 조율하세요
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 whitespace-nowrap">안전한 에스크로</h3>
                <p className="text-gray-600 leading-relaxed text-pretty">
                  결제 대금은 상품 수령 확인 전까지 안전하게 보호됩니다
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section - Modern Cards */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-50 via-white to-green-50 rounded-[3rem] -z-10" />

            <div className="py-12 sm:py-16 px-4 sm:px-10">
              <div className="text-center mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm border border-gray-100 text-gray-700 text-sm font-semibold mb-6 whitespace-nowrap">
                  <Shield className="w-4 h-4 text-primary-600" />
                  안전한 거래 시스템
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 sm:whitespace-nowrap text-balance">
                  구매자와 판매자 모두를 보호합니다
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                {/* Buyer Protection */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-primary-500/5 border border-primary-100/50 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 whitespace-nowrap">구매자 보호</h4>
                  </div>
                  <ul className="space-y-4">
                    {[
                      '상품 수령 확인 전까지 대금 보호',
                      '검증된 판매자만 참여',
                      '문제 발생 시 중재 지원',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700">
                        <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-primary-600" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Seller Protection */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-green-500/5 border border-green-100/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 whitespace-nowrap">판매자 보호</h4>
                  </div>
                  <ul className="space-y-4">
                    {[
                      '결제 확인 후 배송 진행',
                      '배송 완료 후 빠른 정산',
                      '신뢰할 수 있는 구매자 풀',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-[2rem] sm:rounded-[3rem]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-green-400/20 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative px-6 sm:px-12 py-12 sm:py-16 text-center">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6 sm:whitespace-nowrap text-balance">
                쉽고 공정한 거래가 가능한 OnTheDeal
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl mx-auto sm:whitespace-nowrap text-pretty">
                입점비X, 광고비X, 무료 회원가입으로 시작하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={session ? getDashboardPath() : '/register'}>
                  <Button size="xl" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100 rounded-2xl shadow-xl shadow-black/10 gap-2 text-lg px-8">
                    {session ? '대시보드로 이동' : '무료로 시작하기'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto border-2 border-white/50 text-white hover:bg-white/10 rounded-2xl gap-2 text-lg px-8">
                    자세히 알아보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
