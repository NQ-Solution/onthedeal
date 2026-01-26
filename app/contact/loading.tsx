import Link from 'next/link'
import Image from 'next/image'

export default function ContactLoading() {
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

      <main className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Hero Skeleton */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-2xl mx-auto mb-6 animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-xl w-32 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse" />
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ))}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <div className="h-14 bg-green-200 rounded-xl animate-pulse" />
        </div>

        {/* Contact info skeleton */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mx-auto mb-2" />
              <div className="h-4 bg-gray-100 rounded w-32 mx-auto" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
