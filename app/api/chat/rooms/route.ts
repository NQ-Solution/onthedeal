import { NextRequest, NextResponse } from 'next/server'

// GET /api/chat/rooms - Get all chat rooms for current user
export async function GET(request: NextRequest) {
  try {
    // In real app, this would fetch from Prisma with user filter
    const mockRooms = [
      {
        id: 'room-1',
        rfq: { id: '1', title: '한우 등심 대량 구매' },
        quote: { price: 620000 },
        buyer: { id: 'b1', company_name: '맛있는식당' },
        supplier: { id: 's1', company_name: '명품축산' },
        last_message: {
          content: '좋습니다. 그럼 거래 진행하겠습니다!',
          created_at: '2024-02-05T10:40:00Z',
        },
        unread_count: 0,
        deal_confirmed: false,
        created_at: '2024-02-05T10:30:00Z',
      },
      {
        id: 'room-2',
        rfq: { id: '2', title: '유기농 채소 세트' },
        quote: { price: 250000 },
        buyer: { id: 'b1', company_name: '맛있는식당' },
        supplier: { id: 's2', company_name: '청정농원' },
        last_message: {
          content: '네, 신선한 채소로 준비하겠습니다.',
          created_at: '2024-02-06T14:20:00Z',
        },
        unread_count: 2,
        deal_confirmed: true,
        created_at: '2024-02-06T14:00:00Z',
      },
    ]

    return NextResponse.json({
      success: true,
      data: mockRooms,
    })
  } catch (error) {
    console.error('Error fetching chat rooms:', error)
    return NextResponse.json(
      { error: '채팅방 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
