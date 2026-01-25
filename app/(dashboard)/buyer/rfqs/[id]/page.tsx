'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, Check, X } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

// Mock RFQ data
const mockRFQ = {
  id: '1',
  title: '한우 등심 대량 구매',
  description: '프리미엄 한우 등심 1++ 등급으로 50kg 필요합니다. 신선도가 중요하며, 진공포장 필수입니다.',
  category: '육류',
  quantity: 50,
  unit: 'kg',
  budget_min: 500000,
  budget_max: 700000,
  deadline: '2024-02-15',
  delivery_address: '서울시 강남구 역삼동 123-45',
  status: 'open',
  created_at: '2024-02-01',
  quotes: [
    {
      id: 'q1',
      supplier: { company_name: '프리미엄 한우농장', id: 's1' },
      price: 650000,
      description: '1++ 등급 한우 등심입니다. 당일 도축 후 진공포장하여 배송합니다.',
      delivery_date: '2024-02-10',
      status: 'pending',
      created_at: '2024-02-02',
    },
    {
      id: 'q2',
      supplier: { company_name: '명품축산', id: 's2' },
      price: 620000,
      description: '최상급 한우 등심을 합리적인 가격에 제공합니다. 신선도 보장.',
      delivery_date: '2024-02-12',
      status: 'pending',
      created_at: '2024-02-03',
    },
    {
      id: 'q3',
      supplier: { company_name: '한우명가', id: 's3' },
      price: 680000,
      description: '횡성 한우 1++ 등급. 마블링이 뛰어납니다.',
      delivery_date: '2024-02-11',
      status: 'pending',
      created_at: '2024-02-04',
    },
  ],
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  open: { label: '모집중', variant: 'success' },
  in_progress: { label: '진행중', variant: 'warning' },
  closed: { label: '마감', variant: 'default' },
  cancelled: { label: '취소', variant: 'error' },
}

const quoteStatusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  pending: { label: '대기중', variant: 'warning' },
  accepted: { label: '수락됨', variant: 'success' },
  rejected: { label: '거절됨', variant: 'error' },
  expired: { label: '만료됨', variant: 'default' },
}

export default function BuyerRFQDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null)

  const handleAcceptQuote = (quoteId: string) => {
    alert(`견적 ${quoteId}를 수락합니다. 채팅방으로 이동합니다.`)
    router.push(`/chat/room-${quoteId}`)
  }

  const handleRejectQuote = (quoteId: string) => {
    alert(`견적 ${quoteId}를 거절했습니다.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={statusLabels[mockRFQ.status].variant}>
                  {statusLabels[mockRFQ.status].label}
                </Badge>
                <Badge variant="info">{mockRFQ.category}</Badge>
              </div>
              <CardTitle className="text-xl">{mockRFQ.title}</CardTitle>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>작성일: {mockRFQ.created_at}</p>
              <p>마감일: {mockRFQ.deadline}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{mockRFQ.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">수량</p>
              <p className="font-medium">{mockRFQ.quantity} {mockRFQ.unit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">예산</p>
              <p className="font-medium">
                {(mockRFQ.budget_min / 10000).toFixed(0)}만원 ~ {(mockRFQ.budget_max / 10000).toFixed(0)}만원
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">배송지</p>
              <p className="font-medium">{mockRFQ.delivery_address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">받은 견적</p>
              <p className="font-medium text-primary-600">{mockRFQ.quotes.length}개</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">받은 견적 ({mockRFQ.quotes.length})</h2>
        <div className="space-y-4">
          {mockRFQ.quotes.map((quote) => (
            <Card key={quote.id} className={selectedQuote === quote.id ? 'ring-2 ring-primary-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={quoteStatusLabels[quote.status].variant}>
                        {quoteStatusLabels[quote.status].label}
                      </Badge>
                      <span className="font-medium">{quote.supplier.company_name}</span>
                    </div>
                    <p className="text-gray-600">{quote.description}</p>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">견적가: </span>
                        <span className="font-semibold text-primary-600">
                          {quote.price.toLocaleString()}원
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">납품일: </span>
                        <span>{quote.delivery_date}</span>
                      </div>
                    </div>
                  </div>
                  {quote.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" onClick={() => handleAcceptQuote(quote.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        수락
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectQuote(quote.id)}>
                        <X className="w-4 h-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
