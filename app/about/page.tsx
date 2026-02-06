'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui'
import { Footer } from '@/components/layout/Footer'
import { Users, Shield, Zap, Heart, ArrowRight, Menu, X, LayoutDashboard, LogOut, CheckCircle } from 'lucide-react'

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

export default function AboutPage() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-48 h-48 bg-blue-200/20 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-md bg-white/80 border-b border-gray-100/50 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <LogoWithFallback className="w-10 h-10 sm:w-12 sm:h-12 transition-transform group-hover:scale-110" />
              <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">OnTheDeal</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/about" className="text-base font-medium text-primary-600">
                소개
              </Link>
              <Link href="/contact" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-all hover:-translate-y-0.5">
                문의하기
              </Link>
            </nav>

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

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
              <nav className="flex flex-col gap-2 mb-4">
                <Link href="/about" className="text-lg font-medium text-primary-600 py-3 px-4 rounded-xl bg-primary-50" onClick={() => setMobileMenuOpen(false)}>소개</Link>
                <Link href="/contact" className="text-lg font-medium text-gray-600 hover:text-primary-600 py-3 px-4 rounded-xl hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>문의하기</Link>
              </nav>
              <div className="flex flex-col gap-3">
                {session ? (
                  <>
                    <Link href={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="lg" className="w-full gap-2 rounded-xl"><LayoutDashboard className="w-5 h-5" />대시보드</Button>
                    </Link>
                    <Button variant="ghost" size="lg" className="w-full gap-2 text-gray-600 hover:text-red-600" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                      <LogOut className="w-5 h-5" />로그아웃
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" size="lg" className="w-full rounded-xl">로그인</Button></Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}><Button size="lg" className="w-full rounded-xl">회원가입</Button></Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-5 py-2.5 mb-8 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-sm font-semibold whitespace-nowrap">
              About OnTheDeal
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              <span className="text-gray-900 whitespace-nowrap">B2B 거래의</span>
              <br />
              <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-green-500 bg-clip-text text-transparent whitespace-nowrap">
                새로운 기준
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              OnTheDeal은 구매자는 거래처를 찾는 데 많은 시간을 쓰고,
              판매자는 기회를 기다릴 수밖에 없었던
              기존 B2B 거래 구조를 바꾸기 위해 만들어졌습니다.
            </p>
          </div>
        </section>

        {/* Mission Section - 세로 배치 */}
        <section className="container mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            {/* Mission Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-8 sm:p-12 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8">
                발주를 중심으로 거래를 재구성해
                구매자에게는 선택이 모이는 환경을,
                판매자에게는 적극적으로 제안할 수 있는 기회를 만듭니다.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white/80" />
                  <span className="text-lg">발주를 올리면 다양한 업체의 제안이 모입니다</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white/80" />
                  <span className="text-lg">판매자는 납품 가능한 발주에만 선택적으로 참여합니다</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white/80" />
                  <span className="text-lg">구매자와 판매자가 만족하는 조건으로 거래가 이루어집니다</span>
                </li>
              </ul>
            </div>

            {/* Vision Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                식자재 거래의 새로운 기준을 만들어 갑니다.
                기술과 데이터를 활용해 구매자에게는 더 좋은 조건을,
                판매자에게는 더 많은 기회를 제공하는 플랫폼이 되겠습니다.
              </p>
              <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                <p className="text-lg text-gray-700 font-medium">
                  "쉽고 공정한 거래가 가능한 OnTheDeal"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">우리가 중요하게 생각하는 가치</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Shield, color: 'primary', title: '신뢰', desc: '모든 거래에서 신뢰를 최우선으로 생각합니다' },
              { icon: Zap, color: 'blue', title: '혁신', desc: '기술로 거래 방식을 혁신합니다' },
              { icon: Users, color: 'green', title: '상생', desc: '구매자와 판매자 모두 win-win 합니다' },
              { icon: Heart, color: 'purple', title: '고객중심', desc: '고객의 성공이 우리의 성공입니다' },
            ].map((item, i) => {
              const Icon = item.icon
              const colorClasses = {
                primary: 'bg-primary-100 text-primary-600 group-hover:bg-primary-500',
                blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-500',
                green: 'bg-green-100 text-green-600 group-hover:bg-green-500',
                purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-500',
              }
              return (
                <div key={i} className="group relative">
                  <div className="relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 text-center h-full">
                    <div className={`w-20 h-20 ${colorClasses[item.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:text-white group-hover:scale-110`}>
                      <Icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-lg text-gray-600">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[2rem] sm:rounded-[3rem]" />
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-green-500/20 rounded-full blur-3xl" />

            <div className="relative px-6 sm:px-12 py-12 sm:py-16 text-center">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6">
                쉽고 공정한 거래가 가능한 OnTheDeal
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl mx-auto">
                지금 바로 무료로 회원가입하고 시작해보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="xl" className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 rounded-2xl shadow-xl gap-2 text-lg px-8">
                    무료로 시작하기
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto border-2 border-white/50 text-white hover:bg-white/10 rounded-2xl gap-2 text-lg px-8">
                    문의하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
