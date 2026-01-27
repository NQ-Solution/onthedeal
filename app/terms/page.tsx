import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { Footer } from '@/components/layout/Footer'
import { FileText, ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { sanitizeContent } from '@/lib/sanitize'

async function getPage() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: '/terms' },
    })
    return page
  } catch {
    return null
  }
}

export default async function TermsPage() {
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
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{page?.title || '이용약관'}</h1>
          <p className="text-xl text-gray-600">
            최종 수정일: {page ? new Date(page.updatedAt).toLocaleDateString('ko-KR') : '2026년 1월 1일'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100">
          {showDefault ? (
            <DefaultTermsContent />
          ) : (
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-ul:space-y-2"
              dangerouslySetInnerHTML={{ __html: sanitizeContent(page.content) }}
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
      <Footer />
    </div>
  )
}

function DefaultTermsContent() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          본 약관은 온더딜(OnTheDeal, 이하 "회사")이 제공하는 B2B 식자재 거래 플랫폼 서비스(이하 "서비스")의 이용과 관련하여
          회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

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
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (수수료)</h2>
        <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
          <li className="flex gap-3">
            <span className="font-bold text-primary-600">1.</span>
            <span>거래 성사 시 거래 금액의 3%가 수수료로 부과됩니다.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary-600">2.</span>
            <span>수수료는 공급자의 크레딧에서 차감됩니다.</span>
          </li>
        </ul>
      </section>

      <section className="pt-6 border-t-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">부칙</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          본 약관은 2026년 1월 1일부터 시행합니다.
        </p>
      </section>
    </div>
  )
}
