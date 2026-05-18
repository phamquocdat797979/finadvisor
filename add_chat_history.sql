-- Chạy câu lệnh này trong SQL Editor của Supabase để thêm một thùng chứa siêu to (JSONB)
-- Thùng chứa này sẽ thay thế localStorage, lưu trữ toàn bộ các câu hỏi của BOT trên Đám mây.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS chat_history JSONB DEFAULT '[]'::jsonb;
