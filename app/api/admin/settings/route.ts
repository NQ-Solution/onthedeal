import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET - 사이트 설정 조회 (관리자)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' }
    })

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
          siteName: 'OnTheDeal',
          siteDescription: 'B2B 식자재 거래 플랫폼',
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Admin settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - 사이트 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        siteName: body.siteName,
        siteDescription: body.siteDescription,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        address: body.address,
        ceoName: body.ceoName,
        businessNumber: body.businessNumber,
        businessAddress: body.businessAddress,
        bankName: body.bankName,
        bankAccount: body.bankAccount,
        bankHolder: body.bankHolder,
        emailNotifications: body.emailNotifications,
        smsNotifications: body.smsNotifications,
        adminAlertEmail: body.adminAlertEmail,
        businessHoursStart: body.businessHoursStart,
        businessHoursEnd: body.businessHoursEnd,
        businessDays: body.businessDays,
      },
      create: {
        id: 'default',
        siteName: body.siteName || 'OnTheDeal',
        siteDescription: body.siteDescription,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        address: body.address,
        ceoName: body.ceoName,
        businessNumber: body.businessNumber,
        businessAddress: body.businessAddress,
        bankName: body.bankName,
        bankAccount: body.bankAccount,
        bankHolder: body.bankHolder,
        emailNotifications: body.emailNotifications ?? true,
        smsNotifications: body.smsNotifications ?? true,
        adminAlertEmail: body.adminAlertEmail,
        businessHoursStart: body.businessHoursStart,
        businessHoursEnd: body.businessHoursEnd,
        businessDays: body.businessDays,
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Admin settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
