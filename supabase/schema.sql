-- OnTheDeal MVP Database Schema
-- Phase 1: 기본 테이블 (profiles, rfqs, quotes, chat_rooms, chat_messages, orders)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles 테이블 (사용자 정보)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'supplier', 'admin')),
  company_name TEXT NOT NULL,
  business_number TEXT,
  representative_name TEXT,
  business_type TEXT,
  business_category TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  fax TEXT,
  postal_code TEXT,
  store_address TEXT,
  store_detail_address TEXT,
  address TEXT,
  website TEXT,
  introduction TEXT,
  profile_image TEXT,
  business_license_image TEXT,
  store_images TEXT[],
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RFQs 테이블 (견적요청서)
CREATE TABLE rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  desired_price INTEGER,
  budget_min INTEGER,
  budget_max INTEGER,
  items JSONB,
  delivery_date DATE NOT NULL,
  delivery_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'cancelled')),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quotes 테이블 (견적서)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  delivery_date DATE NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfq_id, supplier_id)
);

-- 4. Chat Rooms 테이블 (채팅방) - 3일 만료 기능 추가
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deal_confirmed', 'expired', 'closed')),
  deal_confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '3 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfq_id, supplier_id)
);

-- 5. Chat Messages 테이블 (채팅 메시지) - 읽음 표시 추가
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Orders 테이블 (주문)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  buyer_fee INTEGER,
  supplier_fee INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'shipping', 'delivered', 'confirmed', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('escrow', 'direct')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications 테이블 (알림)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_quote', 'new_message', 'deal_confirmed', 'order_update', 'chat_expiring', 'chat_expired', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Inquiries 테이블 (문의)
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_rfqs_buyer_id ON rfqs(buyer_id);
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_category ON rfqs(category);
CREATE INDEX idx_quotes_rfq_id ON quotes(rfq_id);
CREATE INDEX idx_quotes_supplier_id ON quotes(supplier_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_chat_rooms_buyer_id ON chat_rooms(buyer_id);
CREATE INDEX idx_chat_rooms_supplier_id ON chat_rooms(supplier_id);
CREATE INDEX idx_chat_rooms_expires_at ON chat_rooms(expires_at);
CREATE INDEX idx_chat_messages_chat_room_id ON chat_messages(chat_room_id);
CREATE INDEX idx_chat_messages_is_read ON chat_messages(is_read);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_supplier_id ON orders(supplier_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Profiles 정책
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RFQs 정책
CREATE POLICY "Anyone can view open RFQs" ON rfqs FOR SELECT USING (status = 'open' OR buyer_id = auth.uid());
CREATE POLICY "Buyers can create RFQs" ON rfqs FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update own RFQs" ON rfqs FOR UPDATE USING (auth.uid() = buyer_id);

-- Quotes 정책
CREATE POLICY "Users can view relevant quotes" ON quotes FOR SELECT USING (
  supplier_id = auth.uid() OR
  EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = quotes.rfq_id AND rfqs.buyer_id = auth.uid())
);
CREATE POLICY "Suppliers can create quotes" ON quotes FOR INSERT WITH CHECK (auth.uid() = supplier_id);
CREATE POLICY "Suppliers can update own quotes" ON quotes FOR UPDATE USING (auth.uid() = supplier_id);

-- Chat Rooms 정책
CREATE POLICY "Users can view own chat rooms" ON chat_rooms FOR SELECT USING (buyer_id = auth.uid() OR supplier_id = auth.uid());
CREATE POLICY "Authenticated users can create chat rooms" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() IN (buyer_id, supplier_id));
CREATE POLICY "Participants can update chat rooms" ON chat_rooms FOR UPDATE USING (buyer_id = auth.uid() OR supplier_id = auth.uid());

-- Chat Messages 정책
CREATE POLICY "Participants can view messages" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_rooms WHERE chat_rooms.id = chat_messages.chat_room_id AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.supplier_id = auth.uid()))
);
CREATE POLICY "Participants can send messages" ON chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM chat_rooms WHERE chat_rooms.id = chat_messages.chat_room_id AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.supplier_id = auth.uid()))
);
CREATE POLICY "Participants can update read status" ON chat_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM chat_rooms WHERE chat_rooms.id = chat_messages.chat_room_id AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.supplier_id = auth.uid()))
);

-- Notifications 정책
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Orders 정책
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (buyer_id = auth.uid() OR supplier_id = auth.uid());
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() IN (buyer_id, supplier_id));
CREATE POLICY "Participants can update orders" ON orders FOR UPDATE USING (buyer_id = auth.uid() OR supplier_id = auth.uid());

-- Inquiries 정책
CREATE POLICY "Anyone can create inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all inquiries" ON inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update inquiries" ON inquiries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at 트리거
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 채팅방 만료 처리 함수 (3일 후 자동 만료)
CREATE OR REPLACE FUNCTION expire_chat_rooms()
RETURNS void AS $$
BEGIN
  -- 딜이 확정되지 않은 채팅방 중 만료 시간이 지난 것들을 만료 처리
  UPDATE chat_rooms
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();

  -- 만료된 채팅방의 메시지 삭제 (선택적)
  -- DELETE FROM chat_messages
  -- WHERE chat_room_id IN (SELECT id FROM chat_rooms WHERE status = 'expired');
END;
$$ language 'plpgsql';

-- 딜 확정 시 만료 시간 제거하는 트리거 함수
CREATE OR REPLACE FUNCTION on_deal_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'deal_confirmed' AND OLD.status != 'deal_confirmed' THEN
    NEW.deal_confirmed_at = NOW();
    NEW.expires_at = NULL; -- 딜 확정 시 만료 없음
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_deal_confirmed
BEFORE UPDATE ON chat_rooms
FOR EACH ROW EXECUTE FUNCTION on_deal_confirmed();

-- 새 메시지 알림 생성 함수
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  room RECORD;
  receiver_id UUID;
BEGIN
  SELECT * INTO room FROM chat_rooms WHERE id = NEW.chat_room_id;

  -- 받는 사람 결정 (발신자가 아닌 쪽)
  IF NEW.sender_id = room.buyer_id THEN
    receiver_id := room.supplier_id;
  ELSE
    receiver_id := room.buyer_id;
  END IF;

  -- 알림 생성
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    receiver_id,
    'new_message',
    '새 메시지가 도착했습니다',
    LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END,
    '/chat/' || NEW.chat_room_id
  );

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_new_message_notification
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- 채팅방 만료 24시간 전 알림 (cron job으로 실행)
CREATE OR REPLACE FUNCTION notify_expiring_chats()
RETURNS void AS $$
DECLARE
  room RECORD;
BEGIN
  FOR room IN
    SELECT * FROM chat_rooms
    WHERE status = 'active'
      AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
      AND expires_at > NOW()
  LOOP
    -- 구매자에게 알림
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      room.buyer_id,
      'chat_expiring',
      '채팅방이 곧 만료됩니다',
      '24시간 내에 거래를 확정하지 않으면 채팅 내용이 삭제됩니다.',
      '/chat/' || room.id
    );

    -- 공급자에게 알림
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      room.supplier_id,
      'chat_expiring',
      '채팅방이 곧 만료됩니다',
      '24시간 내에 거래를 확정하지 않으면 채팅 내용이 삭제됩니다.',
      '/chat/' || room.id
    );
  END LOOP;
END;
$$ language 'plpgsql';
