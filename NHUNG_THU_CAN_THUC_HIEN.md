# 📋 NHỮNG THỨ CẦN THỰC HIỆN: Financial Advisor SaaS

> **Mục tiêu**: Xây dựng ứng dụng SaaS tư vấn tài chính đơn giản, đủ chức năng, giao diện gọn gàng.
> **Công nghệ**: React + Vite · Supabase · Finnhub API · Gemini API

---

## 🗂️ TỔNG QUAN CÁC TRANG

| Đường dẫn | Tên trang | Mô tả |
|---|---|---|
| `/auth` | Đăng nhập / Đăng ký | Màn hình vào app |
| `/dashboard` | Dashboard | Tổng quan tài chính |
| `/portfolio` | Danh mục đầu tư | Quản lý cổ phiếu nắm giữ |
| `/market` | Thị trường | Tin tức tài chính |
| `/assistant` | Trợ lý AI | Chat với AI advisor |
| `/settings` | Cài đặt | Hồ sơ người dùng |

---

## ✅ CHECKLIST CHỨC NĂNG CẦN LÀM

### 1. 🔐 Authentication (Đăng nhập / Đăng ký)
- [ ] Form đăng ký bằng email + mật khẩu
- [ ] Form đăng nhập
- [ ] Nút đăng xuất
- [ ] Giữ phiên đăng nhập (session persistence) khi refresh trang
- [ ] Chuyển hướng về `/auth` nếu chưa đăng nhập (protected routes)

---

### 2. 📊 Dashboard (Tổng quan)
- [ ] Hiển thị **tổng giá trị danh mục** (total portfolio value)
- [ ] Hiển thị **thay đổi trong ngày** (daily change %, +/-)
- [ ] **Watchlist** nhanh (danh sách mã đang theo dõi)
- [ ] **Tin tức thị trường nổi bật** (market headlines, tối đa 5 tin)
- [ ] **Quick AI insight** (1–2 câu nhận xét nhanh từ Gemini)

---

### 3. 💼 Portfolio (Danh mục đầu tư)
- [ ] Nút **thêm mã cổ phiếu** (Add Stock)
  - Nhập ticker (VD: AAPL, TSLA)
  - Nhập số lượng nắm giữ
  - Nhập giá mua trung bình (average cost)
- [ ] Danh sách các mã đang nắm giữ dạng bảng:
  - Ticker
  - Số lượng
  - Giá hiện tại (lấy từ Finnhub)
  - Giá trị vị thế (position value)
  - Lãi/lỗ (Gain/Loss) theo %
- [ ] Nút **xoá mã** khỏi danh mục
- [ ] Dữ liệu được **lưu vào Supabase** (theo từng user)

---

### 4. 📰 Market (Thị trường & Tin tức)
- [ ] **Ô tìm kiếm ticker** (search by ticker/symbol)
- [ ] **Danh sách tin tức thị trường chung** (market news feed)
- [ ] **Tin tức theo mã cụ thể** (company news) khi tìm kiếm ticker
- [ ] Hiển thị trạng thái **Loading** khi đang tải
- [ ] Hiển thị thông báo lỗi nếu API thất bại

---

### 5. 🤖 AI Assistant (Trợ lý AI)
- [ ] **Widget chat** đặt trong trang `/assistant`
- [ ] AI trả lời dựa trên **ngữ cảnh người dùng**:
  - Biết user đang nắm mã nào (lấy từ Supabase)
  - Biết giá/tin tức hiện tại (lấy từ Finnhub)
- [ ] AI có thể:
  - Giải thích danh mục đầu tư của user
  - Tóm tắt tin tức tài chính
  - Giải thích thuật ngữ tài chính (P/E, EPS, v.v.)
- [ ] Luôn **hiển thị disclaimer**: "Đây là thông tin giáo dục, không phải lời khuyên tài chính"
- [ ] Nếu user chưa có portfolio → fallback: AI vẫn trả lời câu hỏi chung

---

### 6. ⚙️ Settings (Cài đặt)
- [ ] Hiển thị thông tin hồ sơ (email, tên)
- [ ] Cho phép cập nhật **tên hiển thị**
- [ ] Nút đăng xuất

---

## 🗄️ DATABASE (Supabase)

### Các bảng cần tạo:

#### `profiles`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid | Khóa ngoại → auth.users |
| `full_name` | text | Tên hiển thị |
| `created_at` | timestamp | Tự động |

#### `portfolios`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Khóa ngoại → profiles |
| `name` | text | Tên danh mục (VD: "Danh mục chính") |
| `created_at` | timestamp | Tự động |

#### `holdings`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid | Primary key |
| `portfolio_id` | uuid | Khóa ngoại → portfolios |
| `ticker` | text | Mã cổ phiếu (VD: AAPL) |
| `quantity` | numeric | Số lượng nắm giữ |
| `average_cost` | numeric | Giá mua trung bình |
| `created_at` | timestamp | Tự động |

> ⚠️ **Bắt buộc**: Phải bật **Row-Level Security (RLS)** để mỗi user chỉ thấy dữ liệu của mình.

---

## 🌐 API CẦN TÍCH HỢP

### Finnhub API
| Chức năng | Endpoint cần dùng |
|---|---|
| Giá cổ phiếu hiện tại | `/quote?symbol=AAPL` |
| Tìm kiếm mã | `/search?q=Apple` |
| Tin tức thị trường | `/news?category=general` |
| Tin tức theo mã | `/company-news?symbol=AAPL` |

### Gemini API
- Dùng để trả lời câu hỏi trong AI Assistant
- Gửi context có cấu trúc: profile → holdings → giá hiện tại → tin tức → câu hỏi
- Dùng model: **Gemini Flash** (nhanh, tiết kiệm chi phí)

---

## 🔑 BIẾN MÔI TRƯỜNG CẦN CÀI

Tạo file `.env.local` ở thư mục gốc:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_FINNHUB_API_KEY=your_finnhub_api_key

VITE_GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ **Không commit file `.env.local` lên GitHub!** Thêm vào `.gitignore`.

---

## 🧱 CẤU TRÚC THÀNH PHẦN (Component)

```
src/
├── components/
│   ├── Layout/          # Sidebar + Header chung
│   ├── StockCard/       # Card hiển thị 1 mã cổ phiếu
│   ├── NewsCard/        # Card hiển thị 1 tin tức
│   ├── AIChat/          # Widget chat AI
│   └── ProtectedRoute/  # Route yêu cầu đăng nhập
├── pages/
│   ├── Auth.jsx
│   ├── Dashboard.jsx
│   ├── Portfolio.jsx
│   ├── Market.jsx
│   ├── Assistant.jsx
│   └── Settings.jsx
├── services/
│   ├── supabase.js      # Khởi tạo Supabase client
│   ├── finnhub.js       # Hàm gọi Finnhub API
│   └── gemini.js        # Hàm gọi Gemini API
└── App.jsx              # Router chính
```

---

## 🚀 THỨ TỰ XÂY DỰNG (Đúng quy trình)

```
Bước 1: Dựng UI với mock data (chưa nối API)
   ↓
Bước 2: Kết nối Supabase (Auth + Database)
   ↓
Bước 3: Kết nối Finnhub (giá, news)
   ↓
Bước 4: Kết nối Gemini (AI Assistant)
   ↓
Bước 5: Nối dữ liệu portfolio → AI context
   ↓
Bước 6: Test toàn bộ + xử lý lỗi
   ↓
Bước 7: Deploy lên Vercel
```

---

## 🧪 CHECKLIST KIỂM THỬ

### Auth
- [ ] Đăng ký tài khoản mới thành công
- [ ] Đăng nhập thành công
- [ ] Đăng xuất thành công
- [ ] Refresh trang vẫn còn session

### Portfolio
- [ ] Thêm mã AAPL với số lượng bất kỳ
- [ ] Dữ liệu lưu vào Supabase DB
- [ ] Giá hiện tại từ Finnhub hiển thị đúng
- [ ] Tính đúng giá trị và lãi/lỗ
- [ ] Xoá mã thành công

### Market News
- [ ] Tin tức chung load được
- [ ] Tìm ticker → hiện tin tức công ty đó
- [ ] Không bị lỗi API

### AI Assistant
- [ ] Hỏi: "Danh mục tôi đang có gì?"
- [ ] Hỏi: "Có tin gì về Apple không?"
- [ ] Hỏi: "P/E ratio là gì?"
- [ ] AI có đề cập disclaimer không
- [ ] User mới (chưa có portfolio) AI vẫn trả lời được

### Lỗi / Edge case
- [ ] Nhập ticker sai → thông báo lỗi rõ ràng
- [ ] API key sai → không crash app
- [ ] User mới chưa có portfolio → không crash

---

## 🛡️ BẢO MẬT CẦN NHỚ

| ✅ Được phép | ❌ Không được |
|---|---|
| Dùng Supabase `anon key` ở frontend | Dùng `service_role key` ở frontend |
| Đặt API key trong `.env.local` | Commit `.env.local` lên Git |
| Bật RLS trên tất cả bảng Supabase | Để bảng public không có RLS |

---

*Tài liệu này tổng hợp từ file `huong_dan_build_app_bang_agent.md`*
