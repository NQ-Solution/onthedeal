'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  textClassName?: string
}

const sizeMap = {
  sm: { width: 32, height: 32, class: 'w-8 h-8' },
  md: { width: 40, height: 40, class: 'w-10 h-10' },
  lg: { width: 48, height: 48, class: 'w-12 h-12' },
  xl: { width: 64, height: 64, class: 'w-16 h-16' },
}

export function Logo({ size = 'lg', className = '', showText = false, textClassName = '' }: LogoProps) {
  const [imgError, setImgError] = useState(false)
  const dimensions = sizeMap[size]

  // 이미지 로드 실패 시 텍스트 로고 표시
  if (imgError) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className={`${dimensions.class} bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold`}
          style={{ fontSize: dimensions.width * 0.4 }}
        >
          OD
        </div>
        {showText && (
          <span className={`font-bold text-gray-900 ${textClassName}`}>OnTheDeal</span>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="OnTheDeal"
        width={dimensions.width}
        height={dimensions.height}
        className={dimensions.class}
        onError={() => setImgError(true)}
        priority
        unoptimized
      />
      {showText && (
        <span className={`font-bold text-gray-900 ${textClassName}`}>OnTheDeal</span>
      )}
    </div>
  )
}

// 간단한 이미지 전용 로고 (텍스트 없음)
export function LogoImage({ size = 'lg', className = '' }: Omit<LogoProps, 'showText' | 'textClassName'>) {
  const [imgError, setImgError] = useState(false)
  const dimensions = sizeMap[size]

  if (imgError) {
    return (
      <div
        className={`${dimensions.class} bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold ${className}`}
        style={{ fontSize: dimensions.width * 0.4 }}
      >
        OD
      </div>
    )
  }

  return (
    <Image
      src="/logo.png"
      alt="OnTheDeal"
      width={dimensions.width}
      height={dimensions.height}
      className={`${dimensions.class} ${className}`}
      onError={() => setImgError(true)}
      priority
      unoptimized
    />
  )
}
