'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface SiteSettings {
  siteName: string
  ceoName?: string
  businessNumber?: string
  businessAddress?: string
  contactEmail?: string
  contactPhone?: string
}

interface FooterProps {
  variant?: 'default' | 'dashboard'
}

export function Footer({ variant = 'default' }: FooterProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
    fetchSettings()
  }, [])

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
          <p>© 2026 <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">NQ Solution</a></p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="container mx-auto px-6 py-10 mt-12 border-t border-gray-200">
      <div className="flex flex-col gap-6">
        {/* 상단: 로고와 링크 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="OnTheDeal" width={40} height={40} className="w-10 h-10" />
            <span className="font-bold text-2xl text-gray-900">OnTheDeal</span>
          </Link>
          <div className="flex gap-8">
            <Link href="/terms" className="text-lg text-gray-600 hover:text-primary-600">이용약관</Link>
            <Link href="/privacy" className="text-lg text-gray-600 hover:text-primary-600">개인정보처리방침</Link>
            <Link href="/about" className="text-lg text-gray-600 hover:text-primary-600">소개</Link>
            <Link href="/contact" className="text-lg text-gray-600 hover:text-primary-600">문의하기</Link>
          </div>
        </div>

        {/* 하단: 사업자 정보 */}
        <div className="text-center md:text-left border-t border-gray-100 pt-6">
          {(settings?.ceoName || settings?.businessNumber || settings?.businessAddress || settings?.contactEmail || settings?.contactPhone) && (
            <div className="text-base text-gray-500 space-y-1 mb-4">
              {settings?.ceoName && (
                <p>대표자: {settings.ceoName}</p>
              )}
              {settings?.businessNumber && (
                <p>사업자등록번호: {settings.businessNumber}</p>
              )}
              {settings?.businessAddress && (
                <p>주소: {settings.businessAddress}</p>
              )}
              {(settings?.contactEmail || settings?.contactPhone) && (
                <p>
                  {settings.contactPhone && <>전화: {settings.contactPhone}</>}
                  {settings.contactEmail && settings.contactPhone && ' | '}
                  {settings.contactEmail && <>이메일: {settings.contactEmail}</>}
                </p>
              )}
            </div>
          )}
          <p className="text-lg text-gray-500">
            © 2026 <a href="https://nqsolution.kr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">NQ Solution</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
