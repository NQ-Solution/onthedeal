import Link from 'next/link'
import { Button } from '@/components/ui'
import { Footer } from '@/components/layout/Footer'
import { LogoImage } from '@/components/ui/Logo'
import { Users, Shield, Zap, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <LogoImage size="lg" />
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
            OnTheDeal은<br />
            구매자는 거래처를 찾는 데 많은 시간을 쓰고,<br />
            판매자는 기회를 기다릴 수밖에 없었던<br />
            기존 B2B 거래 구조를 바꾸기 위해 만들어졌습니다.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-10 text-white text-center">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
              발주를 중심으로 거래를 재구성해<br />
              구매자에게는 선택이 모이는 환경을,<br />
              판매자에게는 적극적으로 제안할 수 있는 기회를 만듭니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <p className="text-lg">
                  발주를 올리면<br />다양한 업체의 제안이 모입니다
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <p className="text-lg">
                  판매자는 납품 가능한 발주에만<br />선택적으로 참여합니다
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <p className="text-lg">
                  구매자와 판매자가 만족하는<br />조건으로 거래가 이루어집니다
                </p>
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

        {/* CTA Section */}
        <div className="bg-primary-500 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">쉽고 공정한 거래가 가능한 OnTheDeal</h2>
          <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-xl mx-auto">
            회원가입은 무료입니다. 거래가 성사될 때만 수수료가 발생해요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="xl" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100 text-base sm:text-xl">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-base sm:text-xl">
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
