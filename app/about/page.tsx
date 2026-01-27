import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { Footer } from '@/components/layout/Footer'
import { Users, Shield, Zap, Heart, ArrowRight, CheckCircle, Code } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="OnTheDeal" width={48} height={48} className="w-12 h-12" />
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
            OnTheDeal은 식자재 거래를 더 쉽고 공정하게 만드는 플랫폼입니다.
            구매자와 판매자를 연결하여 모두에게 이로운 거래 환경을 제공합니다.
          </p>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-10 text-white">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-white/90 leading-relaxed mb-6">
              복잡하고 불투명했던 식자재 거래를 투명하고 효율적으로 만들어,
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
            <p className="text-xl text-gray-600 leading-relaxed">
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
                구매자와 판매자 모두 win-win 합니다
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-5xl text-white font-bold">대</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">대표</h3>
              <p className="text-lg text-primary-600 font-medium">CEO & Founder</p>
              <p className="text-base text-gray-600 mt-3">
                OnTheDeal 서비스 기획 및 운영
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Code className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">NQ Solution</h3>
              <p className="text-lg text-blue-600 font-medium">Development Partner</p>
              <p className="text-base text-gray-600 mt-3">
                초기 개발 및 기술 파트너
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">함께 성장할 파트너를 찾습니다</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            OnTheDeal과 함께 더 나은 식자재 거래 환경을 만들어 가세요
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
      <Footer />
    </div>
  )
}
