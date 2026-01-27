'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { Footer } from '@/components/layout/Footer'
import { Send, Phone, Mail, MapPin, Clock, MessageSquare, HelpCircle, CheckCircle } from 'lucide-react'

const faqItems = [
  {
    question: '가입 후 바로 거래할 수 있나요?',
    answer: '회원가입 후 사업자 승인 과정이 필요합니다. 승인은 영업일 기준 1-2일 내에 처리됩니다.',
  },
  {
    question: '수수료는 어떻게 되나요?',
    answer: '거래 성사 시에만 거래 금액의 3%가 수수료로 부과됩니다. 거래 불성사 시에는 수수료가 없습니다.',
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1500))

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full shadow-2xl">
          <CardContent className="py-16 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">문의가 접수되었습니다</h2>
            <p className="text-xl text-gray-600 mb-8">
              빠른 시일 내에 답변 드리겠습니다.<br />
              감사합니다.
            </p>
            <Link href="/">
              <Button size="xl">홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <Link href="/contact" className="text-lg font-medium text-primary-600">
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
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">문의하기</h1>
          <p className="text-2xl text-gray-600">궁금한 점이 있으시면 언제든 문의해 주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* 연락처 정보 */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardContent className="py-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">전화 문의</h3>
                    <p className="text-lg text-primary-600 font-bold mt-1">02-1234-5678</p>
                    <p className="text-base text-gray-500 mt-1">평일 09:00 - 18:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardContent className="py-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">이메일 문의</h3>
                    <p className="text-lg text-blue-600 font-bold mt-1">support@onthedeal.com</p>
                    <p className="text-base text-gray-500 mt-1">24시간 접수 가능</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardContent className="py-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">찾아오시는 길</h3>
                    <p className="text-lg text-gray-700 mt-1">서울특별시 강남구 테헤란로 123</p>
                    <p className="text-base text-gray-500 mt-1">온더딜 빌딩 10층</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardContent className="py-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">운영 시간</h3>
                    <p className="text-lg text-gray-700 mt-1">평일: 09:00 - 18:00</p>
                    <p className="text-base text-gray-500 mt-1">주말/공휴일 휴무</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 문의 폼 */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl">
              <CardContent className="py-10">
                <div className="flex items-center gap-3 mb-8">
                  <MessageSquare className="w-8 h-8 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">문의 양식</h2>
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
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      문의 내용
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="문의 내용을 자세히 작성해 주세요"
                      required
                      rows={6}
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>

                  <Button type="submit" size="xl" className="w-full" isLoading={loading}>
                    <Send className="w-6 h-6 mr-2" />
                    문의 접수하기
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <HelpCircle className="w-10 h-10 text-primary-600" />
            <h2 className="text-4xl font-bold text-gray-900">자주 묻는 질문</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <Card
                key={index}
                className={`shadow-lg cursor-pointer transition-all ${
                  openFaq === index ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{item.question}</h3>
                    <span className={`text-2xl text-primary-600 transition-transform ${
                      openFaq === index ? 'rotate-45' : ''
                    }`}>+</span>
                  </div>
                  {openFaq === index && (
                    <p className="text-lg text-gray-600 mt-4 pt-4 border-t border-gray-200">
                      {item.answer}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
