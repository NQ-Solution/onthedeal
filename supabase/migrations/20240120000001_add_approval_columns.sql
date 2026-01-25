-- 기존 profiles 테이블에 승인 관련 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- role 체크 제약 조건 업데이트 (admin 추가)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('buyer', 'supplier', 'admin'));
