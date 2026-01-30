'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button, Input, Select, Textarea, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

// 거래 규모 옵션
const ORDER_SIZE_OPTIONS = [
  { value: '50만미만', label: '50만원 미만' },
  { value: '50~100만원', label: '50~100만원' },
  { value: '100~300만원', label: '100~300만원' },
  { value: '300만원이상', label: '300만원 이상' },
]

// 발주 주기 옵션
const ORDER_FREQUENCY_OPTIONS = [
  { value: '비정기', label: '비정기' },
  { value: '주1회이상', label: '주 1회 이상' },
  { value: '주2~3회', label: '주 2~3회' },
  { value: '월1~2회', label: '월 1~2회' },
]

export default function NewRFQPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    orderSizeRange: '',
    orderFrequency: '',
    deadline: '',
    delivery_address: '',
  })
  const [images, setImages] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 거래 규모를 기반으로 예산 범위 추정
      let budgetMin = 0
      let budgetMax = 0
      switch (formData.orderSizeRange) {
        case '50만미만':
          budgetMin = 100000
          budgetMax = 500000
          break
        case '50~100만원':
          budgetMin = 500000
          budgetMax = 1000000
          break
        case '100~300만원':
          budgetMin = 1000000
          budgetMax = 3000000
          break
        case '300만원이상':
          budgetMin = 3000000
          budgetMax = 10000000
          break
      }

      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: '육류',
          description: formData.description,
          quantity: 1, // 간소화된 폼에서는 기본값
          unit: '건',
          budget_min: budgetMin,
          budget_max: budgetMax,
          order_size_range: formData.orderSizeRange,
          order_frequency: formData.orderFrequency,
          reference_images: images,
          delivery_date: formData.deadline,
          delivery_address: formData.delivery_address,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('발주가 등록되었습니다.')
        router.push('/buyer/rfqs')
      } else {
        console.error('발주 등록 실패:', data)
        alert(data.error || '발주 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('RFQ 생성 오류:', error)
      alert('발주 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 이미지 업로드 처리 (Base64 변환)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = 5 - images.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하로 업로드해주세요.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // 상세 설명 예시 (placeholder로 사용)
  const descriptionPlaceholder = `원하시는 품목과 상세 조건을 자유롭게 작성해주세요.

예시)
- 품목: 한우 1++ 등심 20kg, 제주흑돼지 삼겹살 30kg
- 도축 후 3일 이내 배송 희망
- 등급판정확인서 필요
- 진공포장 요청`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="lg" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          뒤로가기
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">새 발주 등록</h1>
      </div>

      {/* 카테고리 표시 */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🥩</span>
          <div>
            <span className="font-bold text-primary-700">육류</span>
            <span className="ml-2 text-sm text-primary-600">현재 서비스 중</span>
          </div>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">발주 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 제목 */}
            <Input
              label="제목"
              placeholder="예: 한우 등심 및 삼겹살 구매"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            {/* 상세 요청 */}
            <Textarea
              label="상세 요청"
              placeholder={descriptionPlaceholder}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
              required
            />

            {/* 참고 사진 첨부 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                참고 사진 (선택, 최대 5장)
              </label>
              <div className="space-y-3">
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`참고 이미지 ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>이미지 업로드 ({images.length}/5)</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* 평균 거래 규모 */}
            <Select
              label="평균 거래 규모"
              options={[
                { value: '', label: '선택해주세요' },
                ...ORDER_SIZE_OPTIONS,
              ]}
              value={formData.orderSizeRange}
              onChange={(e) => handleChange('orderSizeRange', e.target.value)}
              required
            />

            {/* 발주 주기 */}
            <Select
              label="발주 주기"
              options={[
                { value: '', label: '선택해주세요' },
                ...ORDER_FREQUENCY_OPTIONS,
              ]}
              value={formData.orderFrequency}
              onChange={(e) => handleChange('orderFrequency', e.target.value)}
              required
            />

            {/* 납품 희망일 */}
            <Input
              label="납품 희망일"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              required
            />

            {/* 배송 주소 */}
            <Textarea
              label="배송 주소"
              placeholder="배송받을 주소를 입력해주세요."
              value={formData.delivery_address}
              onChange={(e) => handleChange('delivery_address', e.target.value)}
              rows={2}
              required
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" size="lg" className="flex-1" isLoading={isSubmitting}>
                발주 등록
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
