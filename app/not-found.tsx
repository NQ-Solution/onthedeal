import Link from 'next/link'
import { Button } from '@/components/ui'
import { Construction, Home, Mail, Phone, MessageSquare } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">OD</span>
          </div>
          <span className="font-bold text-3xl text-gray-900">OnTheDeal</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl">
          {/* Icon */}
          <div className="w-32 h-32 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Construction className="w-16 h-16 text-primary-600" />
          </div>

          {/* 404 */}
          <div className="text-8xl font-bold text-primary-500 mb-4">404</div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            온더딜 준비중입니다
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            요청하신 페이지를 찾을 수 없거나 현재 준비 중인 페이지입니다.<br />
            불편을 드려 죄송합니다.
          </p>

          {/* Contact Info */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              문제가 있으시면 연락주세요
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center gap-3 p-4 bg-primary-50 rounded-2xl">
                <Phone className="w-6 h-6 text-primary-600" />
                <span className="text-lg font-bold text-primary-700">02-1234-5678</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-2xl">
                <Mail className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-blue-700">support@onthedeal.com</span>
              </div>
              <Link href="/contact" className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <span className="text-lg font-bold text-green-700">문의하기</span>
              </Link>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/">
              <Button size="xl">
                <Home className="w-6 h-6 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="xl" variant="outline">
                <MessageSquare className="w-6 h-6 mr-2" />
                문의하기
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">OD</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">OnTheDeal</span>
          </div>
          <p className="text-lg text-gray-500">© 2026 OnTheDeal. All rights reserved. | Developed by <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">NQ Solution</a></p>
        </div>
      </footer>
    </div>
  )
}
