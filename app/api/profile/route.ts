import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 현재 사용자 프로필 조회 (전체 필드)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        companyName: true,
        businessNumber: true,
        representativeName: true,
        businessType: true,
        businessCategory: true,
        contactName: true,
        phone: true,
        fax: true,
        postalCode: true,
        storeAddress: true,
        storeDetailAddress: true,
        address: true,
        website: true,
        introduction: true,
        bankName: true,
        bankAccount: true,
        bankHolder: true,
        profileImage: true,
        businessLicenseImage: true,
        storeImages: true,
        approvalStatus: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: '프로필 조회에 실패했습니다' }, { status: 500 })
  }
}

// PUT - 프로필 업데이트 (전체 필드)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const {
      contactName,
      phone,
      companyName,
      businessNumber,
      representativeName,
      businessType,
      businessCategory,
      fax,
      postalCode,
      storeAddress,
      storeDetailAddress,
      address,
      website,
      introduction,
      bankName,
      bankAccount,
      bankHolder,
      profileImage,
      businessLicenseImage,
      storeImages,
    } = body

    // 필수 필드 검증
    if (contactName !== undefined && typeof contactName !== 'string') {
      return NextResponse.json({ error: '담당자명이 올바르지 않습니다' }, { status: 400 })
    }

    if (phone !== undefined && typeof phone !== 'string') {
      return NextResponse.json({ error: '연락처가 올바르지 않습니다' }, { status: 400 })
    }

    const updateData: Record<string, any> = {}

    // undefined가 아닌 필드만 업데이트
    if (contactName !== undefined) updateData.contactName = contactName
    if (phone !== undefined) updateData.phone = phone
    if (companyName !== undefined) updateData.companyName = companyName
    if (businessNumber !== undefined) updateData.businessNumber = businessNumber
    if (representativeName !== undefined) updateData.representativeName = representativeName
    if (businessType !== undefined) updateData.businessType = businessType
    if (businessCategory !== undefined) updateData.businessCategory = businessCategory
    if (fax !== undefined) updateData.fax = fax
    if (postalCode !== undefined) updateData.postalCode = postalCode
    if (storeAddress !== undefined) updateData.storeAddress = storeAddress
    if (storeDetailAddress !== undefined) updateData.storeDetailAddress = storeDetailAddress
    if (address !== undefined) updateData.address = address
    if (website !== undefined) updateData.website = website
    if (introduction !== undefined) updateData.introduction = introduction
    if (bankName !== undefined) updateData.bankName = bankName
    if (bankAccount !== undefined) updateData.bankAccount = bankAccount
    if (bankHolder !== undefined) updateData.bankHolder = bankHolder
    if (profileImage !== undefined) updateData.profileImage = profileImage
    if (businessLicenseImage !== undefined) updateData.businessLicenseImage = businessLicenseImage
    if (storeImages !== undefined) updateData.storeImages = storeImages

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        companyName: true,
        businessNumber: true,
        representativeName: true,
        businessType: true,
        businessCategory: true,
        contactName: true,
        phone: true,
        fax: true,
        postalCode: true,
        storeAddress: true,
        storeDetailAddress: true,
        address: true,
        website: true,
        introduction: true,
        bankName: true,
        bankAccount: true,
        bankHolder: true,
        profileImage: true,
        businessLicenseImage: true,
        storeImages: true,
        approvalStatus: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: '프로필 업데이트에 실패했습니다' }, { status: 500 })
  }
}
