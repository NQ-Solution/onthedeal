import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { Shield, ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getPage() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: '/privacy' },
    })
    return page
  } catch {
    return null
  }
}

export default async function PrivacyPage() {
  const page = await getPage()

  // DB에 페이지가 없거나 초안인 경우 기본 콘텐츠 표시
  const showDefault = !page || page.status === 'draft'

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
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{page?.title || '개인정보처리방침'}</h1>
          <p className="text-xl text-gray-600">
            최종 수정일: {page ? new Date(page.updatedAt).toLocaleDateString('ko-KR') : '2026년 1월 1일'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100">
          {showDefault ? (
            <DefaultPrivacyContent />
          ) : (
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:mb-4 prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-ul:space-y-2"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
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
            <Link href="/terms" className="text-lg text-gray-600 hover:text-primary-600">이용약관</Link>
            <Link href="/privacy" className="text-lg text-primary-600 font-bold">개인정보처리방침</Link>
          </div>
          <p className="text-lg text-gray-500">© 2026 OnTheDeal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function DefaultPrivacyContent() {
  return (
    <div className="space-y-10">
      <section>
        <p className="text-lg text-gray-700 leading-relaxed">
          온더딜(OnTheDeal, 이하 "회사")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (개인정보의 수집 항목)</h2>
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
          <div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">필수 수집 항목</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• 회사명, 사업자등록번호</li>
              <li>• 담당자명, 연락처, 이메일</li>
              <li>• 사업장 주소</li>
              <li>• 아이디, 비밀번호</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">선택 수집 항목</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• 사업자등록증 사본</li>
              <li>• 계좌 정보 (공급자의 경우)</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (개인정보의 수집 및 이용 목적)</h2>
        <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
          <li className="flex gap-3">
            <span className="font-bold text-primary-600">1.</span>
            <span><strong>서비스 제공:</strong> 회원 가입, RFQ 등록, 견적 제출, 거래 체결 등</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary-600">2.</span>
            <span><strong>회원 관리:</strong> 회원제 서비스 이용, 본인 확인, 부정 이용 방지</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary-600">3.</span>
            <span><strong>결제 처리:</strong> 에스크로 결제, 대금 정산, 환불 처리</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (개인정보 보호책임자)</h2>
        <div className="bg-primary-50 rounded-2xl p-6">
          <ul className="text-lg text-primary-700 space-y-2">
            <li>• 성명: 김대표</li>
            <li>• 직책: 대표이사</li>
            <li>• 이메일: privacy@onthedeal.com</li>
          </ul>
        </div>
      </section>

      <section className="pt-6 border-t-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">부칙</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          본 개인정보처리방침은 2026년 1월 1일부터 시행합니다.
        </p>
      </section>
    </div>
  )
}
