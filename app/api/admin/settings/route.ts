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
        // 수수료 설정
        ...(body.firstTradeCommissionRate !== undefined && { firstTradeCommissionRate: body.firstTradeCommissionRate }),
        ...(body.repeatTradeCommissionRate !== undefined && { repeatTradeCommissionRate: body.repeatTradeCommissionRate }),
        ...(body.buyerCardPaymentRate !== undefined && { buyerCardPaymentRate: body.buyerCardPaymentRate }),
        ...(body.buyerBankTransferRate !== undefined && { buyerBankTransferRate: body.buyerBankTransferRate }),
        ...(body.chatExpiryDays !== undefined && { chatExpiryDays: body.chatExpiryDays }),
        ...(body.maxProposalsPerHour !== undefined && { maxProposalsPerHour: body.maxProposalsPerHour }),
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
        // 수수료 설정
        firstTradeCommissionRate: body.firstTradeCommissionRate ?? 3.0,
        repeatTradeCommissionRate: body.repeatTradeCommissionRate ?? 1.0,
        buyerCardPaymentRate: body.buyerCardPaymentRate ?? 3.0,
        buyerBankTransferRate: body.buyerBankTransferRate ?? 0.0,
        chatExpiryDays: body.chatExpiryDays ?? 3,
        maxProposalsPerHour: body.maxProposalsPerHour ?? 0,
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Admin settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
