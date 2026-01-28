'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, Info, Plus, X } from 'lucide-react'
import { Button, Input, Select, Textarea, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { UNITS } from '@/types'

// 품목 타입 정의
interface ItemEntry {
  id: string
  name: string
  quantity: string
  unit: string
  note: string
}

export default function NewRFQPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '육류', // 기본값을 육류로 설정
    budget_min: '',
    budget_max: '',
    deadline: '',
    delivery_address: '',
  })

  // 복수 품목 지원
  const [items, setItems] = useState<ItemEntry[]>([
    { id: '1', name: '', quantity: '', unit: '박스', note: '' }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 품목 정보 합산
      const totalQuantity = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)
      const mainUnit = items[0]?.unit || '박스'

      // 설명에 품목 정보 추가
      const itemsDescription = items.map((item, i) =>
        `품목 ${i + 1}: ${item.name} ${item.quantity}${item.unit}${item.note ? ` (${item.note})` : ''}`
      ).join('\n')
      const fullDescription = `${formData.description}\n\n[품목 목록]\n${itemsDescription}`

      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: fullDescription,
          quantity: totalQuantity,
          unit: mainUnit,
          budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
          delivery_date: formData.deadline,
          delivery_address: formData.delivery_address,
          items: items.map(item => ({
            name: item.name,
            quantity: parseInt(item.quantity) || 0,
            unit: item.unit,
            note: item.note,
          })),
        }),
      })

      if (res.ok) {
        alert('발주가 등록되었습니다.')
        router.push('/buyer/rfqs')
      } else {
        const error = await res.json()
        alert(error.error || '발주 등록에 실패했습니다.')
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

  const handleItemChange = (id: string, field: keyof ItemEntry, value: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const addItem = () => {
    const newId = (items.length + 1).toString()
    setItems(prev => [...prev, { id: newId, name: '', quantity: '', unit: '박스', note: '' }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }


  // 상세 설명 예시 (placeholder로 사용)
  const descriptionPlaceholder = `원하시는 품목의 상세 조건을 적어주세요.

예) 제주흑돼지 오겹살, 1등급 이상
- 지방이 너무 많지 않은 것
- 도축 후 3일 이내 배송 희망
- 등급판정확인서 필요`

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="lg" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">새 발주</h1>
      </div>

      {/* 카테고리 선택 - 육류 강조 */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🥩</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold">육류</h3>
            <p className="text-white/80">현재 서비스 중인 카테고리</p>
          </div>
        </div>
        <p className="text-white/90">
          한우, 돼지고기, 닭고기 등 다양한 육류 품목을 거래하세요.
        </p>
      </div>

      {/* 추후 서비스 예정 안내 */}
      <div className="text-center text-gray-500 text-sm">
        <p>추후 채소, 과일, 수산물 등 다른 영역도 추가될 예정입니다.</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">발주 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="제목"
              placeholder="예: 한우 등심 및 제주흑돼지 대량 구매"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            <div>
              <Textarea
                label="상세 설명"
                placeholder={descriptionPlaceholder}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                required
              />
              <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600">편하게 내용을 작성해주세요.</p>
              </div>
            </div>

            {/* 카테고리 (현재 육류만) */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <div className="p-4 bg-primary-50 border-2 border-primary-500 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥩</span>
                  <div>
                    <span className="text-lg font-bold text-primary-700">육류</span>
                    <span className="ml-2 text-sm text-primary-600 bg-primary-100 px-2 py-0.5 rounded">선택됨</span>
                  </div>
                </div>
              </div>
              <input type="hidden" name="category" value="육류" />
            </div>

            {/* 품목 리스트 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-medium text-gray-700">품목 목록</label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  품목 추가
                </Button>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-medium text-gray-700">품목 {index + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        placeholder="품목명 (예: 오겹살)"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="수량"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        required
                      />
                      <Select
                        options={UNITS.map(unit => ({ value: unit, label: unit }))}
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="품목별 참고사항 (예: 등급 1이상)"
                      value={item.note}
                      onChange={(e) => handleItemChange(item.id, 'note', e.target.value)}
                      className="mt-3"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                여러 품목을 한 번에 구매하려면 품목 추가 버튼을 눌러 추가하세요.
              </p>
            </div>

            {/* 구매희망가 */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                구매희망가 (범위)
              </label>
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="최소 금액 (원)"
                  type="number"
                  placeholder="500000"
                  value={formData.budget_min}
                  onChange={(e) => handleChange('budget_min', e.target.value)}
                  required
                />
                <Input
                  label="최대 금액 (원)"
                  type="number"
                  placeholder="700000"
                  value={formData.budget_max}
                  onChange={(e) => handleChange('budget_max', e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                모든 품목의 총 금액 범위를 입력해주세요.
              </p>
            </div>

            <Input
              label="납품희망일"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              required
            />

            <Textarea
              label="배송 주소"
              placeholder="배송받을 주소를 입력해주세요."
              value={formData.delivery_address}
              onChange={(e) => handleChange('delivery_address', e.target.value)}
              rows={2}
              required
            />

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" size="xl" className="flex-1" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" size="xl" className="flex-1" isLoading={isSubmitting}>
                발주 등록
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
