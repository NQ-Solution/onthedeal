'use client'

import Link from 'next/link'

interface FooterProps {
  variant?: 'default' | 'dashboard'
}

export function Footer({ variant = 'default' }: FooterProps) {
  if (variant === 'dashboard') {
    return (
      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-primary-600 transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">개인정보처리방침</Link>
            <Link href="/about" className="hover:text-primary-600 transition-colors">회사소개</Link>
            <Link href="/contact" className="hover:text-primary-600 transition-colors">문의하기</Link>
          </div>
          <p>© 2026 OnTheDeal | <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">NQ Solution</a></p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="container mx-auto px-6 py-10 mt-12 border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">OD</span>
          </div>
          <span className="font-bold text-2xl text-gray-900">OnTheDeal</span>
        </div>
        <div className="flex gap-6">
          <Link href="/terms" className="text-lg text-gray-600 hover:text-primary-600">이용약관</Link>
          <Link href="/privacy" className="text-lg text-gray-600 hover:text-primary-600">개인정보처리방침</Link>
          <Link href="/about" className="text-lg text-gray-600 hover:text-primary-600">회사소개</Link>
          <Link href="/contact" className="text-lg text-gray-600 hover:text-primary-600">문의하기</Link>
        </div>
        <p className="text-lg text-gray-500">© 2026 OnTheDeal | <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">NQ Solution</a></p>
      </div>
    </footer>
  )
}
