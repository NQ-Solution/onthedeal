import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 border-b border-gray-100">
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
        {/* Main Hero - 심플한 배경 */}
        <div className="mb-16">
          <div className="bg-primary-500 rounded-2xl p-10 lg:p-16 text-white">
            <div className="max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                사장님, 거래처 찾는 일은<br />여기서 끝내세요
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
                간단한 발주서 하나면 제안이 모이고 거래가 끝납니다.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register?role=buyer">
                  <Button size="xl" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                    구매자로 시작하기
                  </Button>
                </Link>
                <Link href="/register?role=supplier">
                  <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/20">
                    판매자로 시작하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - For Buyers & Suppliers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* For Buyers - 심플한 카드 */}
          <div className="bg-white rounded-2xl p-10 border-2 border-gray-200">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">구매자</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                필요한 발주 내용을 간편히 등록하면<br />
                다양한 제안을 받을 수 있어요
              </p>
            </div>
            <ol className="space-y-5 mb-8 text-lg">
              <li className="flex items-start gap-4">
                <span className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">1</span>
                <div>
                  <p className="font-bold text-gray-900 text-xl">발주서 작성</p>
                  <p className="text-gray-600">필요한 품목을 자유롭게 등록</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">2</span>
                <div>
                  <p className="font-bold text-gray-900 text-xl">조건 확인</p>
                  <p className="text-gray-600">여러 판매자의 조건이 한눈에</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">3</span>
                <div>
                  <p className="font-bold text-gray-900 text-xl">거래 확정</p>
                  <p className="text-gray-600">채팅으로 최종 협의 후 안심 결제</p>
                </div>
              </li>
            </ol>
            <Link href="/register?role=buyer">
              <Button size="lg" className="w-full text-xl py-5">
                구매자로 시작하기
              </Button>
            </Link>
          </div>

          {/* For Suppliers - 심플한 카드 */}
          <div className="bg-white rounded-2xl p-10 border-2 border-gray-200">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">판매자</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                구매자의 발주요청을 확인하고<br />
                가능한 조건으로 제안하세요
              </p>
            </div>
            <ol className="space-y-5 mb-8 text-lg">
              <li className="flex items-start gap-4">
                <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">1</span>
                <div>
                  <p className="font-bold text-gray-900 text-xl">발주서 검색</p>
                  <p className="text-gray-600">납품 가능한 발주를 찾아보세요</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">2</span>
                <div>
                  <p className="font-bold text-gray-900 text-xl">조건 제안하기</p>
                  <p className="text-gray-600">품질, 가격, 납품조건 등을 제안하세요</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">3</span>
                <div>
                  <p className="font-bold text-gray-900 text-xl">거래 확정</p>
                  <p className="text-gray-600">결제 완료 후 공식 거래 이력 축적</p>
                </div>
              </li>
            </ol>
            <Link href="/register?role=supplier">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-xl py-5">
                판매자로 시작하기
              </Button>
            </Link>
          </div>
        </div>

        {/* Features - 심플한 텍스트 기반 */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">안전하고 편리한 거래</h2>
            <p className="text-xl text-gray-500">온더딜이 거래의 모든 과정을 도와드립니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">간편한 발주</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                복잡한 과정 없이 필요한 것만 입력하면<br />
                다양한 제안을 받아볼 수 있어요
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">실시간 채팅</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                가격, 품질, 배송 등 세부 조건을<br />
                직접 소통하며 조율하세요
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">안전한 에스크로</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                결제 대금은 상품 수령 확인 전까지<br />
                안전하게 보호됩니다
              </p>
            </div>
          </div>
        </div>

        {/* Trust Section - 심플한 체크리스트 */}
        <div className="bg-gray-50 rounded-2xl p-10 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">구매자와 판매자 모두를 보호합니다</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">구매자 보호</h4>
              <ul className="space-y-4 text-lg">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                  상품 수령 확인 전까지 대금 보호
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                  검증된 판매자만 참여
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                  문제 발생 시 중재 지원
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">판매자 보호</h4>
              <ul className="space-y-4 text-lg">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                  결제 확인 후 배송으로 미수금 방지
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                  배송 완료 후 빠른 정산
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                  신뢰할 수 있는 구매자 풀
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section - 심플한 배경 */}
        <div className="bg-primary-500 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">쉽고 공정한 거래가 가능한 OnTheDeal</h2>
          <p className="text-xl text-white/90 mb-8 max-w-xl mx-auto">
            회원가입은 무료입니다. 거래가 성사될 때만 수수료가 발생해요.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="xl" className="bg-white text-primary-600 hover:bg-gray-100 text-xl">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/about">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 text-xl">
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
