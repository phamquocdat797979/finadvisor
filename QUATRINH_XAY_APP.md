# 📖 NHẬT KÝ QUÁ TRÌNH TẠO ỨNG DỤNG FINANCIAL ADVISOR SAAS
*(Bản báo cáo chi tiết từ lúc khởi đầu đến lúc hoàn thiện chạy trên máy)*

---

## BƯỚC 1: Phân Tích Ý Tưởng & Lên Kế Hoạch 
Ban đầu, thay vì lao vào code ngay lập tức, dự án bắt đầu bằng việc đọc kỹ tài liệu ý tưởng `huong_dan_build_app_bang_agent.md`. Dựa trên luồng xây dựng một phần mềm (SaaS), tôi đã tóm tắt và sinh ra bản thiết kế kỹ thuật **`NHUNG_THU_CAN_THUC_HIEN.md`** gồm 6 mục:
- 6 màn hình chính (Auth, Dashboard, Portfolio, Market, Assistant, Settings).
- Cấu trúc Database (Supabase) gồm: `profiles`, `portfolios`, `holdings`.
- Chuẩn bị danh sách API: **Finnhub** (Giá + Tin Tức) và **Gemini** (AI tư vấn).

## BƯỚC 2: Khắc Phục Lỗi Môi Trường (Thiếu Node.js)
Khi tôi cố gắng chạy lệnh tự động cài Vite `npx create-vite@latest`, hệ thống báo lỗi không nhận diện `npx` vì máy tính của bạn **chưa được cài Node.js**.
- Thay vì để bạn chờ đợi tôi hướng dẫn tải Node.js (tại *nodejs.org*) xong mới code tiếp, hệ thống AI đã chuyển sang chiến thuật **Tạo cấu trúc Web thủ công**.

## BƯỚC 3: Dựng Khung Sườn Hệ Thống (Manual Build)
Khi chưa có Node.js để tự load các module, tôi đã trực tiếp dùng các công cụ ghi file (write_to_file) tạo ra toàn bộ kiến trúc của React Vite từ thư mục gốc:
- `package.json` định nghĩa các thư viện React, Supabase, Google Generative AI, Router.
- `vite.config.js`, `index.html` và `.env.local` bảo mật API.
- Tự tay tạo toàn bộ cấu trúc thư mục: `src/pages`, `src/services`, `src/components`.
- Dựng trước File `src/index.css` định nghĩa toàn bộ Giao diện (Design System) chuẩn phong cách Dark mode của SaaS Tài chính (màu than, xanh accent, badge xanh đỏ mô phỏng sàn giao dịch).

## BƯỚC 4: Code 3 Dịch Vụ Core (API Services)
Tôi đã code riêng 3 file cấu hình API trong phần `src/services` tách biệt ra khỏi giao diện để dễ quản lý:
1. **`supabase.js`**: Lo việc kết nối với Đám mây Supabase để chứng thực người dùng (Auth) và thao tác Database (Lấy holdings/danh mục).
2. **`finnhub.js`**: Quản lý truy xuất giá realtime (`/quote`), tìm mã Ticker (`/search`) và cập nhật báo chí (`/news`).
3. **`gemini.js`**: Là linh hồn của app. Cấu hình sẵn lời nhắc Hệ thống (System Instruct) ép bot là Financial Advisor chứ không phải AI chung chung, đặc biệt là gửi gói **Dữ liệu Context** chứa Tên tài khoản, Cổ phiếu mà User đang giữ và Tin tức thị trường vào trí não mô hình trước khi cho phép User đặt câu hỏi.

## BƯỚC 5: Code Giao Diện 6 Màn Hình (React Pages)
- **Layout.jsx**: Xây dựng Sidebar bên trái và Header hiển thị ngày tháng thay đổi linh động.
- **AuthPage**: Thiết kế Tabs Đăng nhập / Đăng ký dùng Supabase Auth.
- **Dashboard**: Màn hình bảng điều khiển tính tổng % Lãi/Lỗ của số vốn dựa vào API Finnhub gọi lên giá mới nhất.
- **Portfolio**: Bảng liệt kê mã chứng khoán. Tạo nút xoá và popup thêm số lượng mua.
- **Market**: Tab tìm kiếm. Nắm rõ logic gọi tin tức Market hay Company riêng lẻ vào ô hiển thị.
- **Assistant**: Tạo khung chat bong bóng (bubble text) UI/UX, in lỗi vàng Disclamer "Không phải tư vấn tài chính".

## BƯỚC 6: Tạo Cấu Trúc Database (SQL Schema)
Tôi tạo file `supabase_schema.sql` bằng tiếng SQL thuần và chỉ rõ bước copy vào phần SQL Editor của trang Supabase. File này chứa Row-Level-Security (RLS) để *User nào chỉ thấy dòng cổ phiếu (Row) của người đó, bảo mật 100%*.

## BƯỚC 7: Cài Đặt Node.js & npm install
Vào lúc này, bạn thông báo cài xong Node.js. Các biến môi trường của Windows được AI cập nhật. Chạy thành công `npm install` (12 giây tải 87 packages) và bắt đầu Server Dev bằng `npm run dev` để khởi chạy máy chủ ảo tại `http://localhost:5173`.

## BƯỚC 8: Khắc phục Lỗi Kết Nối Gemini 404
Khi chạy giao diện Web lên để chat thì phát hiện AI báo **Lỗi 404 Tới Máy Chủ GenerativeLanguage**.
1. **Debug**: Tôi thay thế bằng cách viết File Node.js Test (`test_models.js`) đọc trực tiếp lên Server của Google thông qua API key của bạn để xem có sự vụ gì.
2. **Nguyên Nhân**: Phát hiện sự thay đổi cấu trúc phiên bản Google ở năm 2026. Models `gemini-1.5-flash` được đề cập trong bản phác thảo đã bị gỡ.
3. **Sửa lỗi**: Kết quả check API trả về mảng có dòng `models/gemini-3-flash-preview`. Tôi tiến hành sửa trong `gemini.js` sang phiên bản mới này. Tool Chat ngay lập tức hoạt động cực tốt và thông minh.

## BƯỚC 9: Hệ Thống Lưu Trữ Chat & Nâng Cấp Nút "Xoá" 
Sau khi bạn F5 Web, khung chat bị xoá nguyên hàm mảng (do React xoá Memory Ram ảo của App). 
- Tôi đã can thiệp vào trang `AssistantPage.jsx` để nối với `localStorage` Trình duyệt lưu tin nhắn vô tận theo Tên tài khoản `user.id`.
- Kèm theo đó, bổ sung thêm giao diện:
  - **🧹 Nút xoá tất cả** ở góc cao bên phải.
  - **🗑 Nút xoá từng dòng của User** (Đính kèm logic: Filter/Xóa index câu hỏi của bạn và xóa tiếp `index + 1` của Trợ lý nhằm đảm bảo gọn vạch hoàn toàn đoạn đó).

---
*(Bản ghi này lưu lại toàn bộ các phương pháp kết hợp sức mạnh Tool Control, Cấu hình API và React/Supabase trên con đường lập trình WebApp do AI tư vấn. Mong rằng khi nhìn lại đây, bạn sẽ dễ dàng clone và tạo ra nhiều sản phẩm công nghệ khác cho cá nhân! Chúc bạn thành công! 🎉)*
