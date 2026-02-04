'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, AlertCircle, Loader2, Calendar, MapPin, Building2, Upload, FileText, CheckCircle, Image, X, Download, ZoomIn } from 'lucide-react'
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
  orderSizeRange: string | null
  orderFrequency: string | null
  deliveryDate: string
  deliveryAddress: string
  status: string
  createdAt: string
  referenceImages?: string[]
  buyer: {
    companyName: string
    contactName: string
  }
}

export default function SupplierRFQDetailPage() {
  const params = useParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rfq, setRfq] = useState<RFQ | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCredit, setCurrentCredit] = useState(0)
  const [alreadyQuoted, setAlreadyQuoted] = useState(false)
  const [myQuote, setMyQuote] = useState<{
    id: string
    totalPrice: number
    deliveryDate: string
    note: string | null
    status: string
    createdAt: string
    chatRooms?: { id: string; status: string }[]
  } | null>(null)
  const [attachments, setAttachments] = useState<string[]>([])
  const [quoteForm, setQuoteForm] = useState({
    totalPrice: '',
    description: '',
    deliveryDate: '',
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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
          setMyQuote(quotes[0])
        }
      }
    } catch (error) {
      console.error('Error checking quote:', error)
    }
  }

  // 크레딧 선차감 금액 계산 (제안가 기준 3%)
  const totalPrice = quoteForm.totalPrice ? parseInt(quoteForm.totalPrice) : 0
  const depositAmount = Math.round(totalPrice * 0.03)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.')
        continue
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setAttachments(prev => [...prev, base64])
      }
      reader.readAsDataURL(file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rfq) return

    if (depositAmount > currentCredit) {
      alert('크레딧이 부족합니다. 크레딧을 충전해주세요.')
      return
    }

    if (!quoteForm.totalPrice || !quoteForm.deliveryDate) {
      alert('제안 금액과 납품 가능일을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfq_id: rfq.id,
          unit_price: Math.round(totalPrice / (rfq.quantity || 1)),
          total_price: totalPrice,
          delivery_date: quoteForm.deliveryDate,
          note: quoteForm.description,
          attachments: attachments,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('제안이 제출되었습니다.\n\n※ 3일 내 거래 미확정 시 크레딧이 환불됩니다.')
        if (data.chatRoomId) {
          router.push(`/chat/${data.chatRoomId}`)
        } else {
          router.push('/supplier/rfqs')
        }
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

  // 이미지 다운로드 함수
  const handleDownloadImage = (imageUrl: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `image_${Date.now()}.${imageUrl.includes('png') ? 'png' : 'jpg'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              <Badge variant="info">{rfq.category}</Badge>
            </div>
            {/* 1. 제목 */}
            <CardTitle className="text-2xl">{rfq.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 2. 발주상세 + 첨부파일 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">발주 상세</p>
              <div className="text-gray-700 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed">
                {rfq.description}
              </div>
              {rfq.referenceImages && rfq.referenceImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">첨부 이미지 (클릭하여 확대)</p>
                  <div className="flex flex-wrap gap-2">
                    {rfq.referenceImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img
                          src={img}
                          alt={`참고이미지 ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. 업체정보 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">업체 정보</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">업체명</p>
                    <p className="font-medium text-gray-900">{rfq.buyer.companyName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">지역</p>
                    <p className="font-medium text-gray-900">{rfq.deliveryAddress?.split(' ')[0] || '-'}</p>
                  </div>
                </div>
                {rfq.orderSizeRange && (
                  <div>
                    <p className="text-xs text-gray-500">평균발주금액</p>
                    <p className="font-medium text-green-700">{rfq.orderSizeRange}</p>
                  </div>
                )}
                {rfq.orderFrequency && (
                  <div>
                    <p className="text-xs text-gray-500">발주주기</p>
                    <p className="font-medium text-primary-700">{rfq.orderFrequency}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. 납품희망일, 배송지 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-600">납품 희망일</p>
                  <p className="font-bold text-blue-800">{formatDate(rfq.deliveryDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-orange-600">배송지</p>
                  <p className="font-medium text-sm text-orange-800">{rfq.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* 5. 등록일 */}
            <p className="text-xs text-gray-400">
              등록일: {formatDate(rfq.createdAt)}
            </p>
          </CardContent>
        </Card>

        {/* 제안 제출 폼 */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl">제안 제출</CardTitle>
          </CardHeader>
          <CardContent>
            {alreadyQuoted && myQuote ? (
              <div className="space-y-4">
                {/* 제안 상태 */}
                <div className={`p-4 rounded-xl text-center ${
                  myQuote.status === 'accepted' ? 'bg-green-50 border-2 border-green-200' :
                  myQuote.status === 'rejected' ? 'bg-red-50 border-2 border-red-200' :
                  'bg-yellow-50 border-2 border-yellow-200'
                }`}>
                  <CheckCircle className={`w-10 h-10 mx-auto mb-2 ${
                    myQuote.status === 'accepted' ? 'text-green-600' :
                    myQuote.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`} />
                  <h3 className="text-lg font-bold">
                    {myQuote.status === 'accepted' ? '제안이 수락되었습니다!' :
                     myQuote.status === 'rejected' ? '제안이 거절되었습니다' :
                     '제안 검토 중'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {myQuote.status === 'accepted' ? '채팅방에서 거래를 진행하세요' :
                     myQuote.status === 'rejected' ? '다음 기회에 더 좋은 제안 부탁드립니다' :
                     '구매자가 제안을 검토하고 있습니다'}
                  </p>
                </div>

                {/* 내 제안 정보 */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-gray-800">내 제안 내용</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">제안가</p>
                      <p className="text-xl font-bold text-primary-600">
                        {myQuote.totalPrice.toLocaleString()}원
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">납품 가능일</p>
                      <p className="font-medium">{formatDate(myQuote.deliveryDate)}</p>
                    </div>
                  </div>
                  {myQuote.note && (
                    <div>
                      <p className="text-gray-500 text-sm">제안 설명</p>
                      <p className="text-sm bg-white p-2 rounded mt-1">{myQuote.note}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    제출일: {formatDate(myQuote.createdAt)}
                  </p>
                </div>

                {/* 채팅 버튼 */}
                {myQuote.chatRooms && myQuote.chatRooms[0] && (
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/chat?room=${myQuote.chatRooms![0].id}`)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    채팅방으로 이동
                  </Button>
                )}
              </div>
            ) : rfq.status !== 'open' ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">마감된 발주입니다</h3>
                <p className="text-gray-500">더 이상 제안을 제출할 수 없습니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-5">
                {/* 1. 첨부파일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    거래명세서, 단가표 첨부
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    거래명세서 및 발주품목 단가표를 첨부해주세요 (파일형식: 이미지, PDF)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    파일 선택
                  </Button>
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="relative">
                          {file.startsWith('data:image') ? (
                            <img src={file} alt="" className="w-16 h-16 object-cover rounded border" />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. 제안 금액 */}
                <div>
                  <Input
                    label="제안 금액 (원)"
                    type="number"
                    placeholder="해당 발주의 총 금액을 기입하세요"
                    value={quoteForm.totalPrice}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, totalPrice: e.target.value }))}
                    required
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">해당 발주의 총 금액을 기입하세요</p>
                </div>

                {/* 3. 제안 설명 */}
                <div>
                  <Textarea
                    label="제안 설명"
                    placeholder="첨부파일에 담지 못한 내용이나 귀사가 이 거래에 적합한 이유를 적어주세요 (원산지, 등급, 거래 강점 등)"
                    value={quoteForm.description}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* 4. 납품 가능일 */}
                <Input
                  label="납품 가능일"
                  type="date"
                  value={quoteForm.deliveryDate}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  required
                />

                {/* 5. 크레딧 설명 */}
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-medium mb-1">수수료 안내</p>
                  <p>• 제안 제출 시 제안금액의 3% 크레딧이 선차감됩니다</p>
                  <p>• 거래 미성사 시 크레딧이 전액 환불됩니다</p>
                  <p>• 제안 제출 후 구매자와 채팅이 가능합니다</p>
                </div>

                {/* 크레딧 부족 경고 */}
                {depositAmount > 0 && depositAmount > currentCredit && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-red-800">크레딧 부족</p>
                        <p className="text-red-700 mt-1">
                          필요: {depositAmount.toLocaleString()}원 / 보유: {currentCredit.toLocaleString()}원
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

                {/* 6. 제안 제출 버튼 */}
                <Button
                  type="submit"
                  size="xl"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={depositAmount > currentCredit}
                >
                  <Send className="w-5 h-5 mr-2" />
                  제안 제출하기
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 이미지 뷰어 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={selectedImage}
              alt="확대 이미지"
              className="max-w-full max-h-[85vh] object-contain mx-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadImage(selectedImage)
                }}
                className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                title="다운로드"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                title="닫기"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <p className="text-center text-white/80 text-sm mt-4">
              클릭하여 닫기 · 다운로드 버튼으로 저장
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
