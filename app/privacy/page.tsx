import Link from 'next/link'
import { Button } from '@/components/ui'
import { Shield, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">개인정보처리방침</h1>
          <p className="text-xl text-gray-600">최종 수정일: 2026년 1월 1일</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 space-y-10">
          {/* 개요 */}
          <section>
            <p className="text-lg text-gray-700 leading-relaxed">
              온더딜(OnTheDeal, 이하 "회사")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.
              회사는 본 개인정보처리방침을 통해 이용자의 개인정보가 어떻게 수집·이용·보관·파기되는지 안내드립니다.
            </p>
          </section>

          {/* 제1조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (개인정보의 수집 항목)</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
            </p>
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
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">자동 수집 항목</h4>
                <ul className="text-gray-700 space-y-1">
                  <li>• IP 주소, 접속 로그, 쿠키</li>
                  <li>• 서비스 이용 기록</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (개인정보의 수집 및 이용 목적)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span><strong>서비스 제공:</strong> 회원 가입, RFQ 등록, 견적 제출, 거래 체결 등 서비스 제공</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span><strong>회원 관리:</strong> 회원제 서비스 이용, 본인 확인, 부정 이용 방지</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span><strong>결제 처리:</strong> 에스크로 결제, 대금 정산, 환불 처리</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">4.</span>
                <span><strong>고객 지원:</strong> 문의 대응, 공지사항 전달, 분쟁 조정</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">5.</span>
                <span><strong>서비스 개선:</strong> 통계 분석, 맞춤 서비스 제공</span>
              </li>
            </ul>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (개인정보의 보유 및 이용 기간)</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 관련 법령에 의해 보존해야 하는 경우 아래 기간 동안 보관합니다.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6">
              <table className="w-full text-lg">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 font-bold text-gray-900">계약 또는 청약철회 기록</td>
                    <td className="py-3 text-gray-700">5년</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-gray-900">대금결제 및 재화 공급 기록</td>
                    <td className="py-3 text-gray-700">5년</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-gray-900">소비자 불만 또는 분쟁처리 기록</td>
                    <td className="py-3 text-gray-700">3년</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-gray-900">접속 로그 기록</td>
                    <td className="py-3 text-gray-700">1년</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 (개인정보의 제3자 제공)</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>이용자가 사전에 동의한 경우</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>거래 체결 시 상대방에게 필요한 최소한의 정보 (회사명, 연락처 등)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</span>
              </li>
            </ul>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (개인정보의 파기)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>전자적 파일 형태의 정보는 복구 및 재생이 불가능한 방법으로 영구 삭제합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>종이 문서에 기록된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</span>
              </li>
            </ul>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (이용자의 권리)</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>개인정보 열람 요구</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>오류 등이 있는 경우 정정 요구</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>삭제 요구</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">4.</span>
                <span>처리정지 요구</span>
              </li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              위 권리 행사는 서비스 내 설정 또는 개인정보 보호책임자에게 연락하여 요청할 수 있습니다.
            </p>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 (개인정보의 안전성 확보 조치)</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span><strong>관리적 조치:</strong> 내부 관리계획 수립, 직원 교육</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span><strong>기술적 조치:</strong> 개인정보 암호화, 접근권한 관리, 보안프로그램 설치</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">3.</span>
                <span><strong>물리적 조치:</strong> 전산실 및 자료보관실 접근 통제</span>
              </li>
            </ul>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 (쿠키의 사용)</h2>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>회사는 이용자에게 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.</span>
              </li>
            </ul>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 (개인정보 보호책임자)</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여
              아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-primary-50 rounded-2xl p-6">
              <h4 className="font-bold text-primary-800 text-xl mb-4">개인정보 보호책임자</h4>
              <ul className="text-lg text-primary-700 space-y-2">
                <li>• 성명: 김대표</li>
                <li>• 직책: 대표이사</li>
                <li>• 이메일: privacy@onthedeal.com</li>
                <li>• 전화: 02-1234-5678</li>
              </ul>
            </div>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제10조 (개인정보처리방침의 변경)</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              본 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라 내용의 추가, 삭제 및 수정이 있을 수 있으며,
              변경 시 최소 7일 전에 서비스 내 공지사항을 통해 알려드립니다.
            </p>
          </section>

          {/* 부칙 */}
          <section className="pt-6 border-t-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">부칙</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              본 개인정보처리방침은 2026년 1월 1일부터 시행합니다.
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
            <Link href="/privacy" className="text-lg text-primary-600 font-bold">개인정보처리방침</Link>
          </div>
          <p className="text-lg text-gray-500">© 2026 OnTheDeal. All rights reserved. | Developed by <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">NQ Solution</a></p>
        </div>
      </footer>
    </div>
  )
}
