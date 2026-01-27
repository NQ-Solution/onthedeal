'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Send, Info, AlertCircle, RefreshCw, Loader2, Calendar, MapPin, Package, Building2 } from 'lucide-react'
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

interface RFQ {
  id: string
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  budgetMin: number | null
  budgetMax: number | null
  desiredPrice: number | null
  deliveryDate: string
  deliveryAddress: string
  status: string
  createdAt: string
  buyer: {
    companyName: string
    contactName: string
  }
}

export default function SupplierRFQDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [rfq, setRfq] = useState<RFQ | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCredit, setCurrentCredit] = useState(0)
  const [alreadyQuoted, setAlreadyQuoted] = useState(false)
  const [quoteForm, setQuoteForm] = useState({
    price: '',
    description: '',
    delivery_date: '',
  })

  useEffect(() => {
    if (params.id) {
      fetchRFQDetail()
      fetchCreditBalance()
      checkExistingQuote()
    }
  }, [params.id])

  const fetchRFQDetail = async () => {
    try {
      const res = await fetch(`/api/rfqs/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setRfq(data)
      } else {
        console.error('Failed to fetch RFQ')
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCreditBalance = async () => {
    try {
      const res = await fetch('/api/supplier/credits')
      if (res.ok) {
        const data = await res.json()
        setCurrentCredit(data.balance || 0)
      }
    } catch (error) {
      console.error('Error fetching credit:', error)
    }
  }

  const checkExistingQuote = async () => {
    try {
      const res = await fetch(`/api/quotes?rfq_id=${params.id}&role=supplier`)
      if (res.ok) {
        const quotes = await res.json()
        if (quotes.length > 0) {
          setAlreadyQuoted(true)
        }
      }
    } catch (error) {
      console.error('Error checking quote:', error)
    }
  }

  // 크레딧 선차감 금액 계산 (구매 희망가 최소금액의 3%)
  const depositAmount = rfq ? Math.round((rfq.budgetMin || rfq.desiredPrice || 100000) * 0.03) : 0

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rfq) return

    if (depositAmount > currentCredit) {
      alert('크레딧이 부족합니다. 크레딧을 충전해주세요.')
      return
    }

    if (!quoteForm.price || !quoteForm.delivery_date) {
      alert('제안가와 납품 가능일을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfq_id: rfq.id,
          unit_price: parseInt(quoteForm.price),
          delivery_date: quoteForm.delivery_date,
          note: quoteForm.description,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(`제안이 제출되었습니다.\n\n선차감 크레딧: ${data.creditDeduction?.toLocaleString() || depositAmount.toLocaleString()}원\n\n※ 3일 내 거래 미확정 시 크레딧이 환불됩니다.`)
        router.push('/supplier/quotes')
      } else {
        if (data.required && data.current !== undefined) {
          alert(`크레딧이 부족합니다.\n필요: ${data.required.toLocaleString()}원\n보유: ${data.current.toLocaleString()}원`)
        } else {
          alert(data.error || '제안 제출에 실패했습니다.')
        }
      }
    } catch (error) {
      alert('제안 제출 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!rfq) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">발주를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          뒤로가기
        </Button>
      </div>
    )
  }

  const statusBadge = {
    open: { variant: 'success' as const, label: '모집중' },
    in_progress: { variant: 'warning' as const, label: '진행중' },
    closed: { variant: 'default' as const, label: '마감' },
    cancelled: { variant: 'error' as const, label: '취소됨' },
  }[rfq.status] || { variant: 'default' as const, label: rfq.status }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 발주 정보 */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              <Badge variant="info">{rfq.category}</Badge>
            </div>
            <CardTitle className="text-2xl">{rfq.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Building2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">구매자</p>
                <p className="font-bold text-gray-900">{rfq.buyer.companyName}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">상세 설명</p>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{rfq.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-500">수량</p>
                  <p className="font-bold text-lg">{rfq.quantity.toLocaleString()} {rfq.unit}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">구매 희망가</p>
                <p className="font-bold text-lg text-primary-600">
                  {rfq.budgetMin && rfq.budgetMax ? (
                    `${(rfq.budgetMin / 10000).toFixed(0)}만원 ~ ${(rfq.budgetMax / 10000).toFixed(0)}만원`
                  ) : rfq.desiredPrice ? (
                    `${(rfq.desiredPrice / 10000).toFixed(0)}만원`
                  ) : (
                    '협의'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">납품 희망일</p>
                  <p className="font-bold">{formatDate(rfq.deliveryDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">배송지</p>
                  <p className="font-medium text-sm">{rfq.deliveryAddress}</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 pt-4 border-t">
              등록일: {formatDate(rfq.createdAt)}
            </div>
          </CardContent>
        </Card>

        {/* 제안 제출 폼 */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl">제안 제출</CardTitle>
            <div className="flex items-center gap-2 mt-2 p-3 bg-primary-50 rounded-xl">
              <span className="text-gray-600">현재 보유 크레딧:</span>
              <span className="text-xl font-bold text-primary-600">{currentCredit.toLocaleString()}원</span>
            </div>
          </CardHeader>
          <CardContent>
            {alreadyQuoted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">이미 제안을 제출하셨습니다</h3>
                <p className="text-gray-500 mb-4">이 발주에 대한 제안은 한 번만 가능합니다.</p>
                <Button variant="outline" onClick={() => router.push('/supplier/quotes')}>
                  내 제안 목록 보기
                </Button>
              </div>
            ) : rfq.status !== 'open' ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">마감된 발주입니다</h3>
                <p className="text-gray-500">더 이상 제안을 제출할 수 없습니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-6">
                <Input
                  label="제안가 (단가, 원)"
                  type="number"
                  placeholder="단가를 입력하세요"
                  value={quoteForm.price}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, price: e.target.value }))}
                  required
                />

                {quoteForm.price && (
                  <div className="p-3 bg-gray-50 rounded-xl text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 금액 (예상)</span>
                      <span className="font-bold text-primary-600">
                        {(parseInt(quoteForm.price) * rfq.quantity).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                )}

                <Textarea
                  label="제안 설명"
                  placeholder="상품의 특징, 품질, 배송 조건 등을 설명해주세요."
                  value={quoteForm.description}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />

                <Input
                  label="납품 가능일"
                  type="date"
                  value={quoteForm.delivery_date}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, delivery_date: e.target.value }))}
                  required
                />

                {/* 크레딧 선차감 안내 */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 w-full">
                      <p className="font-bold mb-2">크레딧 선차감 안내</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>기준 금액</span>
                          <span>{((rfq.budgetMin || rfq.desiredPrice || 100000)).toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>선차감 비율</span>
                          <span>3%</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-blue-200">
                          <span>제안 제출 시 차감</span>
                          <span className="text-blue-800">{depositAmount.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 환불 정책 안내 */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-700">
                      <p className="font-bold mb-2">환불 정책</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>거래 확정 시: 크레딧 차감 유지 (수수료로 전환)</li>
                        <li className="text-green-800 font-medium">3일 내 거래 미확정 시: 크레딧 전액 환불</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 크레딧 부족 경고 */}
                {depositAmount > currentCredit && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-red-800">크레딧 부족</p>
                        <p className="text-red-700 mt-1">
                          필요 크레딧: {depositAmount.toLocaleString()}원 / 보유: {currentCredit.toLocaleString()}원
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 text-red-600 border-red-300"
                          onClick={() => router.push('/supplier/credits')}
                        >
                          크레딧 충전하기
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  size="xl"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={depositAmount > currentCredit}
                >
                  <Send className="w-5 h-5 mr-2" />
                  제안 제출하기 ({depositAmount.toLocaleString()}원 선차감)
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
