import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id
    const mockMessages = [
      {
        id: 'm1',
        room_id: roomId,
        sender_id: 's1',
        sender_type: 'supplier',
        content: '안녕하세요! 견적 수락 감사합니다.',
        created_at: '2024-02-05T10:30:00Z',
      },
      {
        id: 'm2',
        room_id: roomId,
        sender_id: 'b1',
        sender_type: 'buyer',
        content: '네 감사합니다. 배송은 어떻게 진행되나요?',
        created_at: '2024-02-05T10:32:00Z',
      },
    ]

    return NextResponse.json({ success: true, data: mockMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: '메시지를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id
    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: '메시지 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    const newMessage = {
      id: `m-${Date.now()}`,
      room_id: roomId,
      sender_id: 'b1',
      sender_type: 'buyer',
      content,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, data: newMessage })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: '메시지 전송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
