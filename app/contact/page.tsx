'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { Footer } from '@/components/layout/Footer'
import { Send, Phone, Mail, MapPin, Clock, MessageSquare, HelpCircle, CheckCircle, Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'

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

interface SiteSettings {
  siteName: string
  contactEmail: string
  contactPhone: string
  address?: string
  businessAddress?: string
  businessHoursStart?: string
  businessHoursEnd?: string
  businessDays?: string
}

const faqItems = [
  {
    question: '가입 후 바로 거래할 수 있나요?',
    answer: '회원가입 후 사업자 승인 과정이 필요합니다. 승인은 영업일 기준 1-2일 내에 처리됩니다.',
  },
  {
    question: '수수료는 어떻게 되나요?',
    answer: '거래 성사 시에만 소정의 수수료가 부과됩니다. 거래 불성사 시에는 수수료가 없습니다. 자세한 수수료율은 관리자 설정에 따릅니다.',
  },
  {
    question: '결제는 어떻게 진행되나요?',
    answer: '에스크로 결제 시스템을 통해 안전하게 결제됩니다. 물품 수령 확인 후 판매자에게 대금이 지급됩니다.',
  },
  {
    question: '채팅 내용은 얼마나 보관되나요?',
    answer: '거래 확정 시 채팅 내용이 영구 보관됩니다. 거래 미확정 시 3일 후 자동 삭제됩니다.',
  },
]

export default function ContactPage() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
      } else {
        alert(data.error || '문의 접수에 실패했습니다.')
      }
    } catch (error) {
      console.error('문의 접수 오류:', error)
      alert('문의 접수 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-balance">문의가 접수되었습니다</h2>
            <p className="text-xl text-gray-600 mb-8 text-pretty">
              빠른 시일 내에 답변 드리겠습니다.<br />
              감사합니다.
            </p>
            <Link href="/">
              <Button size="xl" className="rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-48 h-48 bg-green-200/20 rounded-full blur-2xl" />
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
              <Link href="/about" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-all hover:-translate-y-0.5">
                소개
              </Link>
              <Link href="/contact" className="text-base font-medium text-primary-600">
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
                <Link href="/about" className="text-lg font-medium text-gray-600 hover:text-primary-600 py-3 px-4 rounded-xl hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>소개</Link>
                <Link href="/contact" className="text-lg font-medium text-primary-600 py-3 px-4 rounded-xl bg-primary-50" onClick={() => setMobileMenuOpen(false)}>문의하기</Link>
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
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-5 py-2.5 mb-8 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-sm font-semibold">
              Contact Us
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight text-balance">
              <span className="text-gray-900">무엇이든</span>
              <br />
              <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-blue-500 bg-clip-text text-transparent">
                물어보세요
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 text-pretty">궁금한 점이 있으시면 언제든 문의해 주세요</p>
          </div>
        </section>

        {/* Contact Info Cards - 세로 배치 (2x2 그리드) */}
        <section className="container mx-auto px-4 sm:px-6 pb-12">
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">전화 문의</h3>
                    <p className="text-base text-primary-600 font-bold mt-1">{settings?.contactPhone || '02-1234-5678'}</p>
                    <p className="text-sm text-gray-500 mt-1">{settings?.businessDays || '평일'} {settings?.businessHoursStart || '09:00'} - {settings?.businessHoursEnd || '18:00'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">이메일 문의</h3>
                    <p className="text-base text-blue-600 font-bold mt-1">{settings?.contactEmail || 'support@onthedeal.com'}</p>
                    <p className="text-sm text-gray-500 mt-1">24시간 접수 가능</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">찾아오시는 길</h3>
                    <p className="text-base text-gray-700 mt-1">{settings?.businessAddress || settings?.address || '서울특별시 강남구'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">운영 시간</h3>
                    <p className="text-base text-gray-700 mt-1">{settings?.businessHoursStart || '09:00'} - {settings?.businessHoursEnd || '18:00'}</p>
                    <p className="text-sm text-gray-500 mt-1">주말/공휴일 휴무</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Form */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-2xl">
              <CardContent className="py-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">문의 양식</h2>
                    <p className="text-gray-500">아래 양식을 작성해 주시면 빠르게 답변드리겠습니다</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="이름"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="홍길동"
                      required
                    />
                    <Input
                      label="이메일"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="연락처"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="010-1234-5678"
                    />
                    <Input
                      label="문의 제목"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="문의 제목을 입력하세요"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      문의 내용
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="문의 내용을 자세히 작성해 주세요"
                      required
                      rows={6}
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none hover:border-gray-300"
                    />
                  </div>

                  {/* 개인정보 수집 동의 */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-gray-900 mb-2">개인정보 수집 및 이용 동의</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>수집 항목:</strong> 이름, 이메일, 연락처, 문의 내용</p>
                        <p><strong>수집 목적:</strong> 문의 접수 및 답변, 서비스 개선</p>
                        <p><strong>보유 기간:</strong> 문의 처리 완료 후 3년간 보관</p>
                        <p className="text-gray-500 mt-2">
                          * 개인정보 수집에 동의하지 않을 권리가 있으며, 동의 거부 시 문의 접수가 제한됩니다.
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-base text-gray-700 group-hover:text-gray-900 transition-colors">
                        개인정보 수집 및 이용에 동의합니다. <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="xl"
                    className="w-full rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25"
                    isLoading={loading}
                    disabled={!privacyAgreed}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    문의 접수하기
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-semibold">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-balance">자주 묻는 질문</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  openFaq === index ? 'border-primary-300 shadow-lg' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <h3 className="text-lg font-bold text-gray-900 pr-4">{item.question}</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                    openFaq === index ? 'rotate-180 text-primary-600' : ''
                  }`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${
                  openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <p className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
