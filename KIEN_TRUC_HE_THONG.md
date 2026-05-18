# 🏗️ KIẾN TRÚC HỆ THỐNG - FINANCIAL ADVISOR SAAS
Bản tài liệu phân tích kỹ thuật toàn diện về toàn bộ công nghệ, vòng đời dữ liệu, kết nối API và cấu trúc mã nguồn của Ứng dụng.

---

## 1. NGĂN XẾP CÔNG NGHỆ (TECH STACK)
Ứng dụng được thiết kế theo mô hình **Single Page Application (SPA)** kết hợp kiến trúc **Serverless** (Không cần tự quản lý máy chủ backend cục bộ).
- **Frontend Core:** `React.js` (Thư viện UI) + `Vite` (Công cụ biên dịch siêu tốc).
- **Routing:** `React Router v6` (Chuyển trang mượt mà không cần chớp/tải lại web).
- **Styling:** `Vanilla CSS` + CSS Variables (Hệ thống màu nền Sáng/Tối CSS tùy biến).
- **Data Viz:** `Recharts` (Vẽ biểu đồ phân bổ tài sản dạng hình tròn PieChart).
- **Deployment:** `GitHub` (Quản lý mã nguồn) + `Vercel` (Hosting và CDN toàn cầu).

---

## 2. HỆ THẦN KINH DỮ LIỆU & CÁC BÊN THỨ BẢY (INTEGRATIONS)
Ứng dụng hoạt động xoay quanh 4 "Trụ cột đám mây". Mỗi nền tảng có một nhiệm vụ độc lập, được App gọi tới thông qua **API Keys**:

### 🗄️ A. Supabase (Backend & Database)
Đóng vai trò là Não bộ lưu trữ vĩnh viễn (Database-as-a-Service).
- **Tương tác:** App dùng bộ cài `supabase-js`, gọi trực tiếp từ trình duyệt Frontend thẳng vào Cơ sở dữ liệu PostgreSQL của Supabase.
- **Lưu trữ gì?** 
  - **Auth:** Hệ thống chứa Email/Mật khẩu (đã được mã hoá), quản lý phiên làm việc hiện tại (Session/Token).
  - **Tables:** Bảng `profiles` (Lưu Tên, Lưu Mảng JSONB Lịch sử Chat AI), `portfolios` (Lưu Tên danh mục), `holdings` (Lưu số lượng cổ phiếu AAPL, TSLA... bạn mua và giá vốn).
- **Bảo mật:** Nhờ cài đặt `Row Level Security (RLS)` bằng lệnh SQL, Supabase chặn đứng hành vi "Lấy trộm" dữ liệu của người khác. Mỗi tài khoản chỉ được tải (SELECT) và xoá (DELETE) đúng dữ liệu của User ID đó.

### 📈 B. Finnhub (Market Data API)
Là Cảm biến thị trường theo thời gian thực (Realtime).
- **Tương tác:** Mỗi khi mở tab "Dashboard" hoặc "Bảng Giá", thư mục `services/finnhub.js` của App sẽ gửi một lệnh `HTTP GET` (kèm cái thẻ VITE_FINNHUB_API_KEY) chạy thẳng tới máy chủ Finnhub ở Mỹ.
- **Lấy dữ liệu:** Finnhub trả về file JSON chứa: Giá chốt phiên (`/quote`), Tên công ty (`/stock/profile2`), Tin tức toàn cầu (`/news`). Toàn bộ được lấy trong dưới 1 giây. App **không hề lưu** lại giá này vào Database, mà chỉ quét trực tiếp để hiện lên màn hình.

### 🤖 C. Google Gemini (Generative AI LLM)
Khối phân tích ngôn ngữ tự nhiên.
- **Tương tác:** Module `services/gemini.js` bọc (Prompt) toàn bộ câu hỏi của bạn (VD: "Mã nào đang lãi?") + Gắn kèm biến dữ liệu `holdings` (Dữ liệu Cổ phiếu đã lấy từ Supabase/Finnhub) rồi nén gửi lên Google. 
- **Chức năng:** Gemini dùng thuật toán cao cấp đọc bối cảnh đó và sinh ra câu trả lời chuẩn xác. File `AssistantPage.jsx` tiếp nhận luồng Text và hiện ra bong bóng Chat, sau đó đẩy đoạn hội thoại này nhờ Supabase cất hộ.

### ☁️ D. GitHub & Vercel (Quản lý & Vận hành Web)
- **GitHub:** Là "Két sắt" chứa 60+ file Code mã nguồn React của bạn.
- **Vercel:** Vercel móc trực tiếp vào GitHub. Khi tôi gõ lệnh `git push`, toàn bộ Code bay lên Github. Vercel tự động nhận tin báo (Webhook), nạp lại Code mới, bấm nút BUILD ra một gói HTML/JS siêu nhẹ gọn, và ném lên mạng Internet cực nhanh để mọi người trên toàn cầu xem trang Web của bạn.

---

## 3. BẢN ĐỒ CẤU TRÚC THƯ MỤC CỐT LÕI (FILES & FOLDERS)
Mọi file trong thư mục `financial-advisor-saas` đều có liên kết chặt chẽ để lắp ráp thành cỗ máy hoàn chỉnh:

```text
financial-advisor-saas/
 ├── .env.local             🔑 "Két an toàn" chứa 3 chiếc Thìa khoá API (Supabase, Finnhub, Gemini). Không bao giờ up lên mạng.
 ├── package.json           📦 Sổ tay khai báo toàn bộ thư viện App đang dùng (Recharts, Supabase-js...).
 ├── vite.config.js         ⚙️ Cấu hình lõi của công cụ Vite để chạy lệnh `npm run dev` hoặc Build app.
 │ 
 ├── 📂 src/                🔵 THƯ MỤC CỐT LÕI CHỨA CODE HOẠT ĐỘNG
 │   ├── main.jsx           Bản lề số 1. Nơi nhét Component App vào thẻ <div id="root"> của Trình duyệt web.
 │   ├── App.jsx            "Tổng đài chuyển mạch" (Router). Chỉ dẫn các đường link (/dashboard, /stocks) bay tới đúng Trang.
 │   ├── index.css          Toàn bộ "Son phấn" của App. File này quyết định Chế độ Sáng/Tối, Màu chữ, CSS bong bóng chat.
 │   │
 │   ├── 📂 context/        (Bộ nhớ toàn cục)
 │   │   └── AuthContext.jsx   Chiếc cúp chứa "Thẻ căn cước" của User hiện tại. Bao trùm từ ngoài vào trong để App biết ai đang đăng nhập mà khỏi phải hỏi nhiều lần.
 │   │
 │   ├── 📂 services/       (Phòng liên lạc Ngoại giao - Chỉ chứa mã kết nối ra Web ngoài)
 │   │   ├── supabase.js       Tập hợp hàm nối vào Database (getProfile, getHoldings, signIn, signUp).
 │   │   ├── finnhub.js        Tập hợp hàm nối vào API Chứng khoán (getMultipleQuotes, getCompanyNews).
 │   │   └── gemini.js         Công tắc nối gọi hàm Phân tích trí tuệ nhân tạo (askGemini).
 │   │
 │   ├── 📂 components/     (Các mảnh xếp hình dùng chung)
 │   │   └── Layout.jsx        Bố cục khung xương Web (Bao gồm Cột Menu trái, Thanh Ngang Header Đồng hồ/Nút Đổi Nền Sáng). Tất cả nội dung trang khác sẽ lồng vào giữa khung xương này (<Outlet />).
 │   │
 │   └── 📂 pages/          (Các "Phòng" chức năng riêng biệt)
 │       ├── AuthPage.jsx      Phòng bảo vệ (Đăng nhập / Đăng ký tài khoản).
 │       ├── DashboardPage.jsx Phòng Tổng quan (Nơi trộn dữ liệu của Supabase + Giá của Finnhub để tính Tổng sinh lời, Vẽ vòng tròn PieChart Phân bổ tỷ trọng).
 │       ├── PortfolioPage.jsx Phòng Sổ sách (Nơi gọi API Thêm/Xoá các danh mục Cổ phiếu).
 │       ├── StocksPage.jsx    Bảng Điện Tử (Gọi API Finnhub 10 mã cổ phiếu công nghệ lớn nhất TG, hiện xanh đỏ realtime).
 │       ├── MarketPage.jsx    Phòng Tin Tức (Đọc báo Tài chính & Ô TÌM KIẾM mã cổ phiếu bất kỳ rẽ nhánh API).
 │       ├── AssistantPage.jsx Phòng Chat (Nơi gửi/nhận lời thoại Gemini, lưu Chat xuống Supabase).
 │       └── SettingsPage.jsx  Phòng Cài Đặt (Thay tên đổi họ, nhập Mật khẩu mới bắn lệnh thay đổi vào Supabase Auth).
 │
 └── (Các file *.md khác)   📝 Lưu trữ hướng dẫn, nhật ký kỹ thuật từ AI như file bạn đang đọc.
```

---
### Tóm gọn Vòng Đời Dữ Liệu
Ví dụ luồng chạy khi bạn vào màn hình **Dashboard**:
1. `App.jsx` điều hướng bạn qua cổng **Bảo vệ** `AuthContext`.
2. Hợp lệ? Nó mở Tường trình duyệt lồng khung `Layout.jsx` bao bọc bên ngoài.
3. Ở ô chính giữa, `DashboardPage.jsx` trỗi dậy thức giấc.
4. Nó gọi qua `services/supabase.js` xin lại "Danh sách Cổ phiếu từng mua ở Database".
5. Lấy được mã Cổ phiếu, nó gọi tiếp qua `services/finnhub.js` xin "Giá Live cập nhật 1 giây trước của Thị trường chứng khoán".
6. Mã React kết hợp phép tính `Giá Hôm Nay x Số Lượng Mua` rồi tung vào `PieChart` vẽ bánh.
7. Toàn bộ thông tin hoàn tất phơi bày trước mắt bạn chỉ trong màn chớp mắt! Tốc độ bàn thờ này là đặc trưng của Kiến trúc Serverless hiện đại. Mọi thứ vận hành trơn tru thay phiên nhau cọ xát.
