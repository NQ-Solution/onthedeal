-- 프로필 테이블에 추가 필드 (회원가입 폼에서 사용)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS representative_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_category TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fax TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_detail_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS introduction TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_license_image TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_images TEXT[];

-- 주문 상태 업데이트 (새로운 플로우: preparing, shipping, delivered, confirmed, completed)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'preparing', 'shipping', 'delivered', 'confirmed', 'completed', 'cancelled'));

-- RFQs에 구매희망가 범위 필드 추가 (기존 desired_price → budget_min, budget_max)
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS budget_min INTEGER;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS budget_max INTEGER;

-- RFQs에 품목 리스트 지원을 위한 JSON 필드 추가
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS items JSONB;

-- RFQs에 조회수 및 견적 수 카운트 필드 추가
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Quotes에 견적 수락 관련 필드 추가
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Orders에 수수료 구분 필드 추가 (구매자 3.5%, 공급자 3%)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_fee INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS supplier_fee INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_amount INTEGER;

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_rfq_view_count(rfq_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE rfqs SET view_count = view_count + 1 WHERE id = rfq_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
