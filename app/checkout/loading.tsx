'use client'

import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="py-16 text-center">
          <Loader2 className="w-16 h-16 mx-auto text-primary-500 animate-spin mb-6" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">결제 정보 로딩 중...</h1>
          <p className="text-gray-600">잠시만 기다려주세요</p>
        </CardContent>
      </Card>
    </div>
  )
}
