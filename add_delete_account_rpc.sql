-- 💣 CÔNG TẮC KÍCH HOẠT QUYỀN "TỰ SÁT" TÀI KHOẢN TỪ CLIENT
-- Theo mặc định, do bảo mật nên người dùng máy trạm (Trình duyệt) không thể tự ra lệnh xoá User Core Auth.
-- SQL này tạo ra ròng rọc Backend (1 Function) chạy bằng Quyền Lực Siêu Cao Definer
-- Khi Trình duyệt gõ `supabase.rpc('delete_user_account')`, máy chủ sẽ chạy hàm này cho riêng tài khoản hiện tại.

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lệnh tử hình: Xoá đích danh User đang đăng nhập khỏi bảng "auth.users"
  -- Lưu ý siêu cấp: Do Supabase có Foreign Key (ON DELETE CASCADE) tới bảng "profiles", "portfolios", "holdings"...
  -- Tự Động Toàn bộ những thông tin mua bán, lịch sử Chat AI của User này cũng sẽ "bay hơi" mà không vết tích.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
