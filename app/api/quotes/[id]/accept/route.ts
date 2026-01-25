import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quoteId = params.id

    const chatRoom = {
      id: `room-${quoteId}`,
      quote_id: quoteId,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: '견적이 수락되었습니다.',
      data: {
        quote: { id: quoteId, status: 'accepted' },
        chat_room: chatRoom,
      },
    })
  } catch (error) {
    console.error('Error accepting quote:', error)
    return NextResponse.json(
      { error: '견적 수락에 실패했습니다.' },
      { status: 500 }
    )
  }
}
