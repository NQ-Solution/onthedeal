import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { FileText, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="OnTheDeal" width={48} height={48} className="w-12 h-12" />
            <span className="font-bold text-3xl text-gray-900">OnTheDeal</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                홈으로
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">이용약관</h1>
          <p className="text-xl text-gray-600">최종 수정일: 2026년 1월 1일</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 space-y-10">
          {/* 제1조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              본 약관은 온더딜(OnTheDeal, 이하 "회사")이 제공하는 B2B 식자재 거래 플랫폼 서비스(이하 "서비스")의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>"서비스"란 회사가 제공하는 B2B 식자재 거래 중개 플랫폼을 의미합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원을 의미합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>"구매자"란 서비스를 통해 식자재를 구매하고자 하는 사업자를 의미합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">4.</span>
                <span>"공급자"란 서비스를 통해 식자재를 판매하고자 하는 사업자를 의미합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">5.</span>
                <span>"RFQ"란 견적요청(Request for Quotation)을 의미합니다.</span>
              </li>
            </ul>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>약관이 변경되는 경우 회사는 변경 내용을 시행일 7일 전부터 공지합니다.</span>
              </li>
            </ul>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 (회원가입)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>이용자는 회사가 정한 절차에 따라 회원가입을 신청합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>회사는 사업자등록증 등 필요한 서류를 확인한 후 회원가입을 승인합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>회원가입 승인 후 서비스를 이용할 수 있습니다.</span>
              </li>
            </ul>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (서비스 이용)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>회사는 시스템 점검, 보수 등의 사유로 서비스를 일시 중단할 수 있습니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>현재 서비스는 육류 카테고리만 이용 가능하며, 다른 카테고리는 순차적으로 확대 예정입니다.</span>
              </li>
            </ul>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (수수료)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>거래 성사 시 거래 금액의 3%가 수수료로 부과됩니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>수수료는 공급자의 크레딧에서 차감됩니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>거래가 취소된 경우 수수료는 환불됩니다.</span>
              </li>
            </ul>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 (결제 및 에스크로)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>구매자는 에스크로 결제를 통해 안전하게 대금을 지급합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>물품 수령 확인 후 공급자에게 대금이 지급됩니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>분쟁 발생 시 회사가 중재에 나설 수 있습니다.</span>
              </li>
            </ul>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 (채팅 및 데이터 보관)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>채팅은 거래 협의를 위한 목적으로만 사용해야 합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>거래가 확정되지 않은 채팅은 3일 후 자동 삭제됩니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>거래 확정 시 채팅 내용은 영구 보관됩니다.</span>
              </li>
            </ul>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 (금지행위)</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              이용자는 다음 각 호의 행위를 하여서는 안 됩니다.
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>허위 정보의 등록 또는 타인의 정보 도용</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>회사의 서비스를 이용하여 얻은 정보를 무단으로 사용하는 행위</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>회사 또는 제3자의 지적재산권을 침해하는 행위</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">4.</span>
                <span>플랫폼 외부에서의 직접 거래 유도</span>
              </li>
            </ul>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제10조 (면책조항)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>회사는 천재지변 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>회사는 이용자 간의 거래에서 발생하는 분쟁에 대해 중개자의 역할만 수행합니다.</span>
              </li>
            </ul>
          </section>

          {/* 부칙 */}
          <section className="pt-6 border-t-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">부칙</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              본 약관은 2026년 1월 1일부터 시행합니다.
            </p>
          </section>
        </div>

        {/* Back button */}
        <div className="text-center mt-10">
          <Link href="/">
            <Button size="xl" variant="outline">
              <ArrowLeft className="w-5 h-5 mr-2" />
              홈으로 돌아가기
            </Button>
          </Link>
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
            <Link href="/about" className="text-lg text-gray-600 hover:text-primary-600">회사소개</Link>
            <Link href="/contact" className="text-lg text-gray-600 hover:text-primary-600">문의하기</Link>
            <Link href="/terms" className="text-lg text-primary-600 font-bold">이용약관</Link>
            <Link href="/privacy" className="text-lg text-gray-600 hover:text-primary-600">개인정보처리방침</Link>
          </div>
          <p className="text-lg text-gray-500">© 2026 OnTheDeal. All rights reserved. | Developed by <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">NQ Solution</a></p>
        </div>
      </footer>
    </div>
  )
}
