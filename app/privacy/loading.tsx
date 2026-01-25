import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="OnTheDeal" width={48} height={48} className="w-12 h-12" />
            <span className="font-bold text-3xl text-gray-900">OnTheDeal</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Skeleton */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-2xl mx-auto mb-6 animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-xl w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 space-y-8">
          {/* Skeleton blocks */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-4/6 animate-pulse" />
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
