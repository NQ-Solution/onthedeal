'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">OD</span>
          </div>
          <span className="font-bold text-3xl text-gray-900">OnTheDeal</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto text-primary-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">로딩 중...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
