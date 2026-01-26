-- OnTheDeal MVP Schema - Phase 2 (크레딧 시스템)

-- 크레딧 테이블 (공급자)
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 크레딧 로그 테이블
CREATE TABLE credit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('charge', 'use', 'refund')),
  description TEXT,
  reference_id UUID,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 크레딧 충전 요청 테이블
CREATE TABLE credit_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 공급자 계좌 정보 테이블
CREATE TABLE supplier_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주문 로그 테이블
CREATE TABLE order_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_credits_supplier_id ON credits(supplier_id);
CREATE INDEX idx_credit_logs_supplier_id ON credit_logs(supplier_id);
CREATE INDEX idx_credit_charges_supplier_id ON credit_charges(supplier_id);
CREATE INDEX idx_order_logs_order_id ON order_logs(order_id);

-- RLS 정책 활성화
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_logs ENABLE ROW LEVEL SECURITY;

-- Credits 정책
CREATE POLICY "Suppliers can view own credits" ON credits FOR SELECT USING (auth.uid() = supplier_id);

-- Credit logs 정책
CREATE POLICY "Suppliers can view own credit logs" ON credit_logs FOR SELECT USING (auth.uid() = supplier_id);

-- Credit charges 정책
CREATE POLICY "Suppliers can manage own charges" ON credit_charges FOR ALL USING (auth.uid() = supplier_id);

-- Supplier accounts 정책
CREATE POLICY "Suppliers can manage own account" ON supplier_accounts FOR ALL USING (auth.uid() = supplier_id);

-- Order logs 정책
CREATE POLICY "Users can view logs for their orders" ON order_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_logs.order_id AND (orders.buyer_id = auth.uid() OR orders.supplier_id = auth.uid()))
);

-- 크레딧 사용 함수 (제안 수락 시)
CREATE OR REPLACE FUNCTION use_credit(p_supplier_id UUID, p_amount INTEGER, p_description TEXT, p_reference_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT balance INTO v_balance FROM credits WHERE supplier_id = p_supplier_id FOR UPDATE;
  
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  UPDATE credits SET balance = balance - p_amount, updated_at = NOW() WHERE supplier_id = p_supplier_id;
  
  INSERT INTO credit_logs (supplier_id, amount, type, description, reference_id, balance_after)
  VALUES (p_supplier_id, -p_amount, 'use', p_description, p_reference_id, v_balance - p_amount);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 크레딧 충전 함수
CREATE OR REPLACE FUNCTION charge_credit(p_supplier_id UUID, p_amount INTEGER, p_charge_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  INSERT INTO credits (supplier_id, balance)
  VALUES (p_supplier_id, 0)
  ON CONFLICT (supplier_id) DO NOTHING;
  
  SELECT balance INTO v_balance FROM credits WHERE supplier_id = p_supplier_id FOR UPDATE;
  
  UPDATE credits SET balance = balance + p_amount, updated_at = NOW() WHERE supplier_id = p_supplier_id;
  
  INSERT INTO credit_logs (supplier_id, amount, type, description, reference_id, balance_after)
  VALUES (p_supplier_id, p_amount, 'charge', '크레딧 충전', p_charge_id, v_balance + p_amount);
  
  UPDATE credit_charges SET status = 'completed', completed_at = NOW() WHERE id = p_charge_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
