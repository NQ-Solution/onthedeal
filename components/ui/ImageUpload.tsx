'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react'

interface ImageUploadProps {
  label?: string
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  maxFiles?: number
  accept?: string
  className?: string
  placeholder?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  accept = 'image/*',
  className = '',
  placeholder = '이미지를 업로드하세요',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [sizeError, setSizeError] = useState('')

  // 현재 이미지들 배열로 변환
  const images = Array.isArray(value) ? value : value ? [value] : []

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    setSizeError('')

    const newFiles = Array.from(files)
    const remainingSlots = multiple ? maxFiles - images.length : 1

    // 파일 크기 검증 (5MB 제한)
    const oversizedFile = newFiles.find(f => f.size > MAX_FILE_SIZE)
    if (oversizedFile) {
      setSizeError(`파일 크기는 5MB 이하만 가능합니다. (${oversizedFile.name}: ${(oversizedFile.size / 1024 / 1024).toFixed(1)}MB)`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // 파일을 Data URL로 변환 (실제 프로덕션에서는 클라우드 스토리지 사용)
    const filesToProcess = newFiles.slice(0, remainingSlots)

    filesToProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (multiple) {
          onChange([...images, result])
        } else {
          onChange(result)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemove = (index: number) => {
    if (multiple) {
      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)
    } else {
      onChange('')
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-lg font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* 업로드 영역 */}
      {(multiple ? images.length < maxFiles : images.length === 0) && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
            ${dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-700">{placeholder}</p>
          <p className="text-base text-gray-500 mt-2">
            클릭하거나 파일을 드래그하세요
          </p>
          <p className="text-sm text-gray-400 mt-1">
            최대 5MB{multiple ? ` / ${maxFiles}개까지 업로드 가능 (${images.length}/${maxFiles})` : ''}
          </p>
        </div>
      )}

      {/* 파일 크기 에러 */}
      {sizeError && (
        <p className="text-sm text-red-500 mt-2">{sizeError}</p>
      )}

      {/* 이미지 미리보기 */}
      {images.length > 0 && (
        <div className={`grid gap-4 mt-4 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group rounded-2xl overflow-hidden border-2 border-gray-200"
            >
              <img
                src={img}
                alt={`업로드 이미지 ${index + 1}`}
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 프로필 이미지 전용 컴포넌트
interface ProfileImageUploadProps {
  value?: string
  onChange: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export function ProfileImageUpload({
  value,
  onChange,
  size = 'lg',
}: ProfileImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sizeError, setSizeError] = useState('')

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !files[0]) return
    setSizeError('')

    if (files[0].size > MAX_FILE_SIZE) {
      setSizeError(`파일 크기는 5MB 이하만 가능합니다. (${(files[0].size / 1024 / 1024).toFixed(1)}MB)`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onChange(result)
    }
    reader.readAsDataURL(files[0])
  }

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`
          ${sizeClasses[size]} rounded-full border-4 border-gray-200 overflow-hidden cursor-pointer
          hover:border-primary-400 transition-all relative group
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        {value ? (
          <>
            <img
              src={value}
              alt="프로필"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-2">클릭하여 변경</p>
      {sizeError && (
        <p className="text-sm text-red-500 mt-1">{sizeError}</p>
      )}
    </div>
  )
}
