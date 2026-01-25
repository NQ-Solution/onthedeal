import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { FileText, MessageSquare, Shield, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
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
            <Link href="/about" className="text-lg font-medium text-gray-600 hover:text-primary-600 transition-colors">
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

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        {/* Main Hero - Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Hero Main Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-10 text-white shadow-2xl">
            <div className="max-w-xl">
              <div className="inline-block bg-white/20 rounded-full px-4 py-2 mb-6">
                <span className="text-lg font-medium">B2B 식자재 거래 플랫폼</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                식자재 거래,<br />더 쉽게
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
                필요한 식자재를 올리면 공급자가 먼저 견적을 보내드립니다.<br />
                비교하고, 선택하고, 안전하게 거래하세요.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register?role=buyer">
                  <Button size="xl" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                    구매자로 시작
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                </Link>
                <Link href="/register?role=supplier">
                  <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/20">
                    공급자로 시작
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">실시간 현황</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-2xl">
                <div>
                  <p className="text-lg text-gray-600">등록된 발주</p>
                  <p className="text-4xl font-bold text-primary-600">1,234</p>
                </div>
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                <div>
                  <p className="text-lg text-gray-600">활성 공급자</p>
                  <p className="text-4xl font-bold text-green-600">567</p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                <div>
                  <p className="text-lg text-gray-600">거래 완료</p>
                  <p className="text-4xl font-bold text-blue-600">8,901</p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - For Buyers & Suppliers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {/* For Buyers */}
          <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 hover:border-primary-200 transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🛒</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">구매자</h3>
                <p className="text-lg text-gray-500">필요한 식자재를 쉽게 구매</p>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">필요한 품목을 등록하세요</p>
                  <p className="text-base text-gray-500">품목, 수량, 희망가격을 입력하면 끝</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">견적을 비교하세요</p>
                  <p className="text-base text-gray-500">여러 공급자의 가격과 조건을 한눈에</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">안전하게 거래하세요</p>
                  <p className="text-base text-gray-500">채팅으로 협의하고, 에스크로로 결제</p>
                </div>
              </li>
            </ul>
            <Link href="/register?role=buyer">
              <Button size="lg" className="w-full">
                구매자로 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* For Suppliers */}
          <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 hover:border-green-200 transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🏭</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">공급자</h3>
                <p className="text-lg text-gray-500">새로운 거래처를 만나세요</p>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">발주를 탐색하세요</p>
                  <p className="text-base text-gray-500">내 상품에 맞는 발주를 찾아보세요</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">견적을 제출하세요</p>
                  <p className="text-base text-gray-500">경쟁력 있는 가격으로 제안하세요</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">거래를 성사시키세요</p>
                  <p className="text-base text-gray-500">협의 후 결제 확인, 배송, 정산까지</p>
                </div>
              </li>
            </ul>
            <Link href="/register?role=supplier">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                공급자로 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">안전하고 편리한 거래</h2>
            <p className="text-xl text-gray-500">온더딜이 거래의 모든 과정을 도와드립니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">간편한 견적 시스템</h3>
              <p className="text-base text-gray-600">
                복잡한 과정 없이 필요한 것만 입력하면<br />
                다양한 견적을 받아볼 수 있어요
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">실시간 채팅</h3>
              <p className="text-base text-gray-600">
                가격, 품질, 배송 등 세부 조건을<br />
                직접 소통하며 조율하세요
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">안전한 에스크로</h3>
              <p className="text-base text-gray-600">
                결제 대금은 상품 수령 확인 전까지<br />
                안전하게 보호됩니다
              </p>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-gray-50 rounded-3xl p-10 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">구매자와 공급자 모두를 보호합니다</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">구매자 보호</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-base text-gray-600">
                  <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  상품 수령 확인 전까지 대금 보호
                </li>
                <li className="flex items-start gap-3 text-base text-gray-600">
                  <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  검증된 공급자만 참여
                </li>
                <li className="flex items-start gap-3 text-base text-gray-600">
                  <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  문제 발생 시 중재 지원
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">공급자 보호</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-base text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  결제 확인 후 배송으로 미수금 방지
                </li>
                <li className="flex items-start gap-3 text-base text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  배송 완료 후 빠른 정산
                </li>
                <li className="flex items-start gap-3 text-base text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  신뢰할 수 있는 구매자 풀
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">지금 바로 시작하세요</h2>
          <p className="text-xl text-white/90 mb-8 max-w-xl mx-auto">
            회원가입은 무료입니다. 거래가 성사될 때만 수수료가 발생해요.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="xl" className="bg-white text-primary-600 hover:bg-gray-100">
                무료로 시작하기
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                자세히 알아보기
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 mt-12 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="OnTheDeal" width={40} height={40} className="w-10 h-10" />
            <span className="font-bold text-2xl text-gray-900">OnTheDeal</span>
          </Link>
          <div className="flex gap-6">
            <Link href="/terms" className="text-lg text-gray-600 hover:text-primary-600">이용약관</Link>
            <Link href="/privacy" className="text-lg text-gray-600 hover:text-primary-600">개인정보처리방침</Link>
            <Link href="/about" className="text-lg text-gray-600 hover:text-primary-600">소개</Link>
            <Link href="/contact" className="text-lg text-gray-600 hover:text-primary-600">문의하기</Link>
          </div>
          <p className="text-lg text-gray-500">© 2026 OnTheDeal | <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">NQ Solution</a></p>
        </div>
      </footer>
    </div>
  )
}
