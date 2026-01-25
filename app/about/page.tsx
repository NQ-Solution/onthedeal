import Link from 'next/link'
import { Button } from '@/components/ui'
import { Users, Shield, Zap, TrendingUp, Award, Heart, ArrowRight, CheckCircle } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">OD</span>
            </div>
            <span className="font-bold text-3xl text-gray-900">OnTheDeal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-lg font-medium text-primary-600">
              소개
            </Link>
            <Link href="/contact" className="text-lg font-medium text-gray-600 hover:text-primary-600 transition-colors">
              문의하기
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline" size="lg">로그인</Button>
            </Link>
            <Link href="/register">
              <Button size="lg">회원가입</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">About Us</h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            OnTheDeal은 B2B 식자재 거래의 혁신을 이끄는 플랫폼입니다.
            신뢰할 수 있는 거래 환경을 통해 구매자와 공급자를 연결합니다.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-10 text-white">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-white/90 leading-relaxed mb-6">
              복잡하고 불투명했던 B2B 식자재 거래를 투명하고 효율적으로 만들어,
              모든 참여자가 공정한 가치를 얻을 수 있는 생태계를 구축합니다.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-white/80" />
                <span className="text-lg">투명한 가격 정보 제공</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-white/80" />
                <span className="text-lg">안전한 거래 시스템</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-white/80" />
                <span className="text-lg">효율적인 매칭 서비스</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              대한민국 모든 식자재 거래가 OnTheDeal을 통해 이루어지는 날을 목표로 합니다.
              기술과 데이터를 활용해 더 나은 거래 경험을 제공하겠습니다.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-50 rounded-2xl p-6 text-center">
                <p className="text-4xl font-bold text-primary-600">1,000+</p>
                <p className="text-lg text-gray-600 mt-2">등록 기업</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <p className="text-4xl font-bold text-green-600">10억+</p>
                <p className="text-lg text-gray-600 mt-2">누적 거래액</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 text-center hover:shadow-2xl transition-shadow">
              <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">신뢰</h3>
              <p className="text-lg text-gray-600">
                모든 거래에서 신뢰를 최우선으로 생각합니다
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 text-center hover:shadow-2xl transition-shadow">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">혁신</h3>
              <p className="text-lg text-gray-600">
                기술로 거래 방식을 혁신합니다
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 text-center hover:shadow-2xl transition-shadow">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">상생</h3>
              <p className="text-lg text-gray-600">
                구매자와 공급자 모두 win-win 합니다
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 text-center hover:shadow-2xl transition-shadow">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">고객중심</h3>
              <p className="text-lg text-gray-600">
                고객의 성공이 우리의 성공입니다
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-10">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-5xl text-white font-bold">김</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">김대표</h3>
              <p className="text-lg text-primary-600 font-medium">CEO & Founder</p>
              <p className="text-base text-gray-600 mt-3">
                식자재 유통 20년 경력의 전문가
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-5xl text-white font-bold">이</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">이개발</h3>
              <p className="text-lg text-blue-600 font-medium">CTO</p>
              <p className="text-base text-gray-600 mt-3">
                IT 스타트업 연쇄 창업자
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-5xl text-white font-bold">박</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">박운영</h3>
              <p className="text-lg text-green-600 font-medium">COO</p>
              <p className="text-base text-gray-600 mt-3">
                대기업 SCM 전문가 출신
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">함께 성장할 파트너를 찾습니다</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            OnTheDeal과 함께 B2B 식자재 거래의 미래를 만들어 가세요
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="xl" className="bg-primary-500 hover:bg-primary-600">
                지금 시작하기
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                문의하기
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 mt-12 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">OD</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">OnTheDeal</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="text-lg text-gray-600 hover:text-primary-600">회사소개</Link>
            <Link href="/contact" className="text-lg text-gray-600 hover:text-primary-600">문의하기</Link>
            <Link href="/terms" className="text-lg text-gray-600 hover:text-primary-600">이용약관</Link>
            <Link href="/privacy" className="text-lg text-gray-600 hover:text-primary-600">개인정보처리방침</Link>
          </div>
          <p className="text-lg text-gray-500">© 2026 OnTheDeal. All rights reserved. | Developed by <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">NQ Solution</a></p>
        </div>
      </footer>
    </div>
  )
}
