-- 🛡️ LỆNH MỞ CỬA HẬU: KIỂM TRA EMAIL TỒN TẠI (BYPASS BẢO MẬT HIỂN THỊ)
-- Mặc định Supabase cấm người ngoài dò xem Email nào đã đăng ký.
-- File này tạo một mạch ngầm ưu tiên (SECURITY DEFINER) cho phép Trình duyệt gõ cửa hỏi: "Email này có nhà không?" trước khi Đăng nhập.

CREATE OR REPLACE FUNCTION check_email_exists(lookup_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = lookup_email
  );
END;
$$;
