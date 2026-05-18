# 🚀 Hướng dẫn Chạy App FinAdvisor

## Bước 1: Cài Node.js (bắt buộc)
Tải và cài Node.js LTS tại: https://nodejs.org
Sau khi cài xong, **restart terminal**.

---

## Bước 2: Cài đặt Supabase

1. Tạo tài khoản tại https://supabase.com
2. Tạo project mới, đặt database password
3. Vào **SQL Editor** → paste toàn bộ nội dung file `supabase_schema.sql` → nhấn **Run**
4. Vào **Project Settings → API** → copy:
   - **Project URL** (dạng https://xyz.supabase.co)
   - **anon/public key**

---

## Bước 3: Lấy Finnhub API Key
1. Tạo tài khoản tại https://finnhub.io
2. Vào **Dashboard** → copy **API Key**

---

## Bước 4: Lấy Gemini API Key
1. Truy cập https://aistudio.google.com
2. Nhấn **Get API Key** → tạo key mới → copy

---

## Bước 5: Điền API Keys vào file `.env.local`

Mở file `.env.local` và thay thế các giá trị:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciO...
VITE_FINNHUB_API_KEY=your_finnhub_key
VITE_GEMINI_API_KEY=AIzaSy...
```

---

## Bước 6: Cài dependencies và chạy app

Mở terminal trong thư mục này và chạy:
```bash
npm install
npm run dev
```

Mở trình duyệt tại: **http://localhost:5173**

---

## ✅ Kiểm tra hoạt động

1. Đăng ký tài khoản mới
2. Đăng nhập
3. Thêm mã AAPL vào Portfolio
4. Vào Market → tìm kiếm "Tesla"
5. Vào AI Advisor → hỏi "Danh mục của tôi thế nào?"

---

## 🌐 Deploy lên Vercel (miễn phí)

1. Push code lên GitHub (đừng commit .env.local!)
2. Tạo tài khoản tại https://vercel.com
3. Import repository → tự động build
4. Vào **Settings → Environment Variables** → thêm 4 biến như trong .env.local
5. Redeploy → done!
