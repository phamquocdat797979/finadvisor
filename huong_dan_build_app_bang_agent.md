HƯỚNG DẪN TOÀN TẬP: 
Tự xây dựng SaaS “Cố vấn Tài chính” bằng AI Agents (không cần biết code)

Học cách quản lý AI như một nhân viên kỹ thuật số: giao việc rõ ràng, cung cấp đúng ngữ cảnh, chia nhỏ đầu bài, kiểm tra kết quả và lắp ghép các dịch vụ lại với nhau thành một sản phẩm SaaS thực tế.
Trong hướng dẫn này, chúng ta sẽ xây một ứng dụng kiểu Financial Advisor SaaS gồm: màn hình đăng nhập/đăng ký, dashboard tài chính, danh mục đầu tư, dữ liệu chứng khoán và tin tức tài chính từ Finnhub, lưu dữ liệu người dùng bằng Supabase, và một trợ lý AI dùng Gemini để trả lời câu hỏi dựa trên danh mục đầu tư của người dùng.

1) Tư duy đúng trước khi bắt đầu
Nếu trước đây dùng ChatGPT theo kiểu hỏi–đáp, thì ở đây đang chuyển sang một cấp độ khác: Giao cho AI một dự án phần mềm. AI sẽ cùng anh đi qua các bước: phân tích yêu cầu, thiết kế giao diện, tạo cấu trúc dự án, kết nối API, tạo database, dựng đăng nhập, rồi kiểm thử.
Antigravity là môi trường IDE do Google cung cấp cho phát triển với AI; hệ thống này có tài liệu về skills, MCP integration, và rules/workflows để giúp agent làm việc theo quy trình thay vì viết lung tung. Trong Antigravity, skills có thể sống trong thư mục .agents/skills, còn rules/workflows trong .agents/rules.
Nói đơn giản: Bạn không cần trở thành lập trình viên. Nhưng bạn cần trở thành người biết điều phối AI để làm ra sản phẩm.

2) Kết quả cuối cùng anh sẽ có
Sau khi hoàn tất, ứng dụng có thể gồm:
• Trang đăng ký / đăng nhập
• Dashboard tổng quan tài chính
• Portfolio để thêm mã cổ phiếu, số lượng nắm giữ, theo dõi tổng giá trị
• Market page để xem tin tức tài chính
• AI Assistant widget để hỏi về danh mục đầu tư, xu hướng thị trường, giải thích dữ liệu
• Cơ sở dữ liệu người dùng để mỗi người có tài khoản riêng, dữ liệu riêng
Finnhub có sẵn các API cho quote, market news, company news và nhiều loại dữ liệu tài chính khác. Supabase cung cấp Auth và Postgres database cho ứng dụng web. Google AI Studio là nơi nhanh nhất để lấy Gemini API key và thử model trước khi tích hợp vào app.

PHẦN A - CHUẨN BỊ TOÀN BỘ CÔNG CỤ
3) Tạo các tài khoản cần thiết
Bạn cần chuẩn bị 4 thứ:
3.1. Antigravity
Đây là môi trường chính để bạn “làm việc với AI” giống như đang giao việc cho một kỹ sư phần mềm. Bạn tải từ trang chính thức của Antigravity.
3.2. Finnhub
Dùng để lấy:
• giá cổ phiếu
• market news
• company news
• dữ liệu thị trường phục vụ dashboard tài chính.
3.3. Supabase
Dùng để:
• tạo database
• làm authentication
• lưu danh mục đầu tư
• lưu lịch sử giao dịch nếu cần.
3.4. Google AI Studio / Gemini API
Dùng để:
• tạo trợ lý AI chat trong app
• phân tích danh mục đầu tư
• giải thích tin tức tài chính
• trả lời câu hỏi người dùng.
Google AI Studio là điểm vào chính để lấy API key và bắt đầu dùng Gemini API.

4) Cài Antigravity và tạo project mới
Sau khi cài Antigravity, bạn tạo một project mới, ví dụ đặt tên:
financial-advisor-saas
Sau đó mở project này như một workspace riêng.
Từ đây, toàn bộ quá trình sẽ xoay quanh 3 lớp:
1. Frontend: giao diện người dùng
2. Backend/Data: Supabase + Finnhub
3. AI layer: Gemini assistant
Ngay từ đầu, bạn nên nói rõ với AI rằng mình là non-tech, muốn đi theo quy trình an toàn, giải thích từng bước và tránh tạo kiến trúc quá phức tạp.
Bạn có thể bắt đầu bằng prompt này:
I am a non-technical founder. Help me build a Financial Advisor SaaS step by step.
Use a simple, production-minded architecture.
Explain what you are doing in plain language.
Do not over-engineer.
Use React frontend, Supabase for auth/database, Finnhub for finance data, and Gemini API for AI assistant.
Before coding, first propose the app structure, pages, and data model.
Prompt này không phải “mẹo prompt”, mà là brief vận hành. Nó giúp AI hiểu vai trò, ràng buộc và cách giao tiếp.

PHẦN B - CÀI “KỸ NĂNG” CHO AI AGENT
5) Vì sao phải dùng Skills?
Nếu bạn để AI tự làm từ đầu mà không có khung làm việc, rất dễ gặp các lỗi:
• giao diện lộn xộn
• code chạy được nhưng khó bảo trì
• thêm tính năng mới thì vỡ cấu trúc
• AI sửa chỗ này lại hỏng chỗ khác
Skills giúp AI làm việc như một kỹ sư bài bản hơn.
Antigravity có hệ thống skills riêng; repo google-labs-code/stitch-skills của Google Labs cung cấp các skill tương thích với Antigravity, Gemini CLI, Claude Code, Cursor. Repo này còn có các skill như stitch-design, stitch-loop, design-md, enhance-prompt, react:components.

6) Cài Stitch Skills để AI làm UI đẹp hơn
Stitch skills là bộ kỹ năng chuyên cho thiết kế và chuyển ý tưởng giao diện thành component React có cấu trúc tốt hơn. Repo chính thức hiện hướng dẫn cài qua skills CLI, ví dụ:
npx skills add google-labs-code/stitch-skills --list
npx skills add google-labs-code/stitch-skills --skill stitch-design --global
npx skills add google-labs-code/stitch-skills --skill react:components --global
Các skill này được mô tả rõ trong repo chính thức.
Bạn nên cài những skill nào?
Với dự án này, ưu tiên 3 skill:
• stitch-design
• enhance-prompt
• react:components
Nếu video dùng cách dán URL GitHub vào chat?
Điều đó vẫn đúng về mặt ý tưởng, nhưng cú pháp cài skill có thể đã thay đổi theo phiên bản. Hiện repo chính thức đang dùng npx skills add ..., và Antigravity docs cũng xác nhận skills được quản lý theo chuẩn Agent Skills. Vì vậy, nếu prompt trong video không chạy, hãy dùng cách cài chính thức qua CLI hoặc theo menu skills hiện tại trong Antigravity.

7) Cài “Superpowers” để AI biết lập kế hoạch và debug
Repo obra/superpowers mô tả chính nó là một agentic skills framework & software development workflow. Mục tiêu của nó là buộc coding agent không lao ngay vào code, mà phải đi qua các bước:
• hiểu mục tiêu
• chốt spec
• tạo implementation plan
• rồi mới build, review, test.
Đây là thứ cực kỳ phù hợp với người không biết code, vì nó ép AI làm việc có quy trình.
Cách dùng thực tế
Với Antigravity, anh có thể:
• làm theo hướng dẫn cài/plugin tương thích nếu repo hỗ trợ trực tiếp cho agent anh đang dùng
• hoặc dùng tinh thần của Superpowers bằng cách yêu cầu AI luôn brainstorm → viết spec → viết plan → mới code
Prompt nên dùng:
Use a superpowers-style workflow for this project.
First brainstorm features.
Then write a short product spec.
Then write an implementation plan.
Wait for my approval before generating code.
Kể cả khi bạn chưa cài Superpowers hoàn hảo theo plugin, chỉ riêng việc ép agent đi theo workflow này cũng đã giúp kết quả ổn định hơn rất nhiều.

PHẦN C - LÊN Ý TƯỞNG VÀ THIẾT KẾ ỨNG DỤNG
 Bắt AI brainstorm đúng cách
Đừng ra lệnh “làm app tài chính” ngay lập tức.
Hãy bắt AI cùng bạn thiết kế “bản đồ sản phẩm” trước.
Dùng prompt:
I want to build a Financial Advisor SaaS for retail investors.
Please brainstorm the core features for:
1) Dashboard
2) Portfolio page
3) Market news page
4) AI assistant
5) Settings/Profile
Also suggest the minimum viable version first, then optional premium features.
Mục tiêu của bước này
Bạn cần AI trả lời được 5 câu hỏi:
1. Ứng dụng gồm những trang nào?
2. Mỗi trang hiển thị thông tin gì?
3. Tính năng nào là MVP?
4. Dữ liệu nào cần lưu vào database?
5. Chỗ nào cần gọi API ngoài?
Gợi ý cấu trúc MVP tốt nhất
Nếu AI đưa quá nhiều option, hãy chốt một bản gọn như sau:
MVP nên gồm:
• Sign up / Login
• Dashboard
• Portfolio
• Market News
• AI Assistant
• User Profile
Dashboard nên có:
• Total portfolio value
• Daily change
• Watchlist
• Market headlines
• Quick AI insights
Portfolio nên có:
• Add stock
• Quantity
• Current price
• Position value
• Gain/loss cơ bản
Market page nên có:
• General market news
• Search by ticker
• Company news
AI Assistant nên làm được:
• giải thích danh mục đầu tư
• tóm tắt tin tức
• trả lời bằng ngôn ngữ dễ hiểu
• nhắc rõ “not financial advice”

9) Chốt spec trứớc khi code
Sau brainstorm, yêu cầu AI viết một bản spec ngắn:
Now write a concise product spec for the MVP.
Include:
- target user
- pages
- key features
- data model
- API integrations
- success criteria
Keep it simple and practical.
Đây là một bước rất quan trọng.
Vì nếu không có spec, AI sẽ “ứng tác”, và sản phẩm thường bị rối.

PHẦN D - RA LỆNH CHO AI XÂY FRONTEND
10) Tạo giao diện dashboard
Sau khi đã chốt spec, mới ra lệnh build UI.
Prompt:
Go ahead and build the frontend for the MVP.
Use a modern professional financial dashboard style.
Create responsive pages for:
- Auth
- Dashboard
- Portfolio
- Market News
- Settings
Use reusable components and clean structure.
Do not connect real APIs yet. Use mock data first.
Tại sao phải dùng mock data trước?
Vì đây là cách build rất đúng:
• Bước 1: UI chạy được
• Bước 2: data thật vào sau
• Bước 3: auth/database vào sau nữa
Người mới hay mắc lỗi:
• vừa làm UI
• vừa gọi API
• vừa kết nối DB
• vừa sửa bug
Kết quả là hỏng toàn bộ mạch làm việc.
Sau khi AI code xong
Mở terminal trong Antigravity và chạy:
npm install
npm run dev
Với các dự án frontend kiểu Vite/React, npm run dev sẽ khởi động local development server để anh xem bản chạy thử trên máy. Supabase cũng có quickstart React dùng Vite và supabase-js, nên đây là luồng rất phổ biến.

11) Kiểm tra giao diện như một Product Owner
Khi trang hiện lên, đừng chỉ nhìn “đẹp hay không”.
Hãy kiểm tra theo 4 tiêu chí:
a) Có đúng luồng người dùng không?
Ví dụ:
• vào app
• đăng nhập
• xem dashboard
• thêm mã cổ phiếu
• thấy tin tức
• hỏi AI assistant
b) Có nhất quán giao diện không?
Ví dụ:
• màu sắc
• spacing
• layout card
• side bar
• menu
c) Có chỗ nào “giả quá” không?
Ví dụ:
• số liệu không hợp lý
• biểu đồ vô nghĩa
• nút bấm có mà không hoạt động
d) Có over-design không?
Nhiều app do AI làm đẹp nhưng thừa, rối, không thực dụng.
Nếu thấy chưa ổn, bạn tiếp tục điều phối:
Refine the dashboard UI.
Make it feel more trustworthy, minimal, and SaaS-like.
Reduce unnecessary visual noise.
Keep it enterprise-ready and easy to scan.

PHẦN E — KẾT NỐI DỮ LIỆU CHỨNG KHOÁN TỪ FINNHUB
12) Xin API key Finnhub
Trên Finnhub, anh tạo tài khoản miễn phí và lấy API key.
Finnhub cung cấp API cho:
• quote
• market news
• company news
• symbol lookup
• và nhiều loại dữ liệu tài chính khác.

13) Yêu cầu AI tích hợp Finnhub
Sau khi UI ổn, ra prompt:
Now connect the app to Finnhub free API.
Implement:
- stock quote lookup
- market news feed
- company news by ticker
- search ticker/symbol
Use environment variables for the API key.
Handle loading states and empty/error states.
Bạn cần AI làm ra những gì?
Tối thiểu:
• 1 service file để gọi Finnhub
• 1 ô search ticker
• 1 khối hiển thị giá
• 1 danh sách news
• loading / error state
Ví dụ file .env.local
VITE_FINNHUB_API_KEY=your_finnhub_api_key_here
Sau đó bảo AI:
Please tell me exactly where to place the Finnhub API key in the env file,
and list all environment variables required for the project.
Bước này rất quan trọng với người mới, vì AI hay tạo file env nhưng không giải thích rõ.

14) Những endpoint anh nên ưu tiên
Với MVP, không cần quá nhiều. Chỉ cần 4 nhóm:
• Quote: giá hiện tại của mã cổ phiếu
• Search: tìm mã theo tên công ty
• Market News: tin tức chung
• Company News: tin tức theo mã
Như vậy là đủ tạo ra trải nghiệm “cố vấn tài chính” ban đầu.
PHẦN F - TÍCH HỢP GEMINI LÀM TRỢ LÝ AI

15) Chọn model Gemini phù hợp
Google AI Studio hiện là nơi chính để lấy Gemini API key và thử model. Tài liệu hiện tại của Gemini liệt kê các model như Gemini 3.1 Pro, Gemini 3 Flash, và Gemini 3.1 Flash-Lite. Đồng thời, Google cũng đã thông báo gemini-3-pro-preview bị tắt ngày 9/3/2026 và khuyến nghị chuyển sang Gemini 3.1 Pro Preview.
Gợi ý thực tế
• Nếu ưu tiên chất lượng trả lời và reasoning tốt hơn: dùng dòng 3.1 Pro
• Nếu ưu tiên tốc độ và chi phí: dùng 3 Flash hoặc 3.1 Flash-Lite

16) Ra lệnh tạo widget chat AI
Prompt:
Please create an AI assistant widget for this app.
The assistant should:
- answer questions about the user portfolio
- summarize finance news
- explain market terms in simple language
- clearly say it is not financial advice
Use Gemini API and environment variables for the API key.
Mục tiêu của widget
Không phải tạo chatbot “nói hay”.
Mà là tạo một trợ lý tài chính có ngữ cảnh.
Nó nên biết:
• người dùng đang nắm mã nào
• số lượng bao nhiêu
• tin tức gần đây là gì
• câu hỏi hiện tại là gì
Ví dụ env
GEMINI_API_KEY=your_gemini_api_key_here
Google docs cũng nêu rõ nếu đặt API key trong biến môi trường GEMINI_API_KEY, các client library có thể tự dùng biến này.

17) Bắt AI assistant “biết việc” hơn
Chìa khóa không nằm ở widget chat.
Chìa khóa là system prompt / instruction cho trợ lý.
Bạn nên yêu cầu AI tạo instruction như sau:
Create a system prompt for the financial AI assistant.
Requirements:
- be helpful and concise
- explain concepts in simple language
- use the user's portfolio context if available
- use finance news context if available
- never claim certainty about the future
- always include a disclaimer that this is educational information, not financial advice

Trợ lý AI phải:
• có giới hạn
• không bịa
• không hứa hẹn đầu tư
• không “phán lệnh mua bán”
Nếu bạn muốn nâng cấp sau này, có thể cho AI:
• phân tích watchlist
• cảnh báo biến động
• tóm tắt tin tức theo từng mã
• đề xuất các câu hỏi gợi ý

PHẦN G - TẠO DATABASE VÀ AUTH BẰNG SUPABASE
18) Vì sao Supabase là lựa chọn rất hợp cho người mới?
Vì Supabase gom nhiều thứ vào một nền tảng:
• Postgres database
• authentication
• API
• file storage
• SDK JavaScript
Supabase docs nêu rõ frontend browser app chỉ cần Project URL và public anon key để khởi tạo client. Auth docs và quickstart React cũng có hướng dẫn rất trực tiếp cho signup/login.

19) Ra lệnh để AI chuẩn bị Supabase
Prompt:
Set up Supabase for this project.
I need:
- email/password authentication
- user profile storage
- portfolio table
- holdings table
- optional transactions table
Generate:
1) the frontend integration
2) the SQL schema
3) row-level security policies
4) the env variables I need
Explain each step clearly.
Vì sao phải nhắc RLS?
Vì nếu không có Row-Level Security, dữ liệu người dùng có thể bị truy cập sai cách.
Đây là phần người mới rất hay bỏ qua.

20) Tạo project trong Supabase
Trong Supabase:
1. Tạo project mới
2. Vào SQL Editor
3. Dán đoạn SQL do AI tạo
4. Nhấn Run
Supabase docs xác nhận bạn có thể dùng SQL Editor để thao tác với bảng và auth.users là bảng gốc cho người dùng xác thực.

21) Schema đơn giản bạn nên dùng
Bạn nên yêu cầu AI sinh schema tối thiểu gồm 3 bảng:
profiles
• id (tham chiếu user)
• full_name
• created_at
portfolios
• id
• user_id
• name
• created_at
holdings
• id
• portfolio_id
• ticker
• quantity
• average_cost
• created_at
Nếu muốn nâng cấp:
transactions
• id
• holding_id hoặc portfolio_id
• ticker
• action (buy/sell)
• quantity
• price
• transaction_date
Đừng xây quá nhiều bảng ngay từ đầu.
MVP cần đơn giản để dễ kiểm soát.

22) Kết nối Supabase vào ứng dụng
Sau khi tạo project, vào:
Project Settings → API
Copy:
• Project URL
• anon/public key
Sau đó thêm vào .env.local:
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
Supabase docs nêu rõ createClient trong browser cần supabaseUrl và supabaseKey khi khởi tạo.

23) Yêu cầu AI dựng luôn login / signup / session
Prompt:
Now implement Supabase authentication in the app.
Add:
- sign up
- sign in
- sign out
- session persistence
- protected routes
If user is not logged in, redirect to auth page.
Nếu muốn có Google login, Supabase cũng có tài liệu riêng cho Sign in with Google.

PHẦN H - KẾT NỐI DỮ LIỆU NGƯỜI DÙNG VỚI AI ASSISTANT
24) Chỗ này mới là “linh hồn” của sản phẩm
Rất nhiều người build app có chat, nhưng chat không biết gì về người dùng.
Đó chỉ là chatbot chung chung.
App của bạn phải làm được điều này:
• khi user mở app, hệ thống lấy danh mục đầu tư của user từ Supabase
• đồng thời lấy giá / tin tức mới từ Finnhub
• rồi truyền vào Gemini làm context
• AI trả lời dựa trên đúng dữ liệu đó
Prompt giao việc cho AI
Connect the AI assistant to the authenticated user's portfolio data.
When the user asks a question:
1) fetch their holdings from Supabase
2) fetch relevant quotes/news from Finnhub if needed
3) send a structured context to Gemini
4) return a simple human-friendly answer
Also add fallback behavior if no portfolio exists.
Đây là sự khác biệt giữa:
• chat với AI
và
• dùng AI như một thành phần của phần mềm SaaS

25) Định dạng context cho Gemini
Bạn nên yêu cầu AI gửi context có cấu trúc, ví dụ:
• User profile
• Holdings list
• Current prices
• News headlines
• User question
Không cần anh tự code tay phần này. Chỉ cần ra yêu cầu đúng.
Prompt:
Please structure the prompt/context sent to Gemini with these sections:
- user profile summary
- portfolio holdings
- current market data
- relevant headlines
- user question
Keep it concise to reduce token usage.

PHẦN I - KIỂM THỬ TOÀN BỘ ỨNG DỤNG
26) Checklist test cho người mới
Sau khi mọi thứ nối xong, bạn cần test theo luồng thật.
Test 1: Authentication
• đăng ký tài khoản mới
• đăng nhập
• đăng xuất
• refresh trang xem còn session không
Test 2: Portfolio
• tạo portfolio
• thêm mã AAPL
• nhập số lượng
• kiểm tra có lưu DB không
• kiểm tra giá có cập nhật không
Test 3: Market News
• có load tin tức không
• có lỗi API không
• ticker cụ thể có lên company news không
Test 4: AI Assistant
• hỏi: “Tổng quan danh mục của tôi là gì?”
• hỏi: “Có tin gì đáng chú ý về Apple không?”
• hỏi: “Giải thích P/E ratio đơn giản cho tôi”
• xem assistant có trả lời sát ngữ cảnh không
Test 5: Error handling
• tắt API key thử
• nhập ticker sai
• dùng user mới chưa có portfolio
• mạng chậm

27) Prompt để AI tự rà bug
Please audit the app for:
- broken routes
- missing env variables
- auth/session issues
- API integration bugs
- loading/error states
- data mismatch between portfolio and market data
Then fix the issues one by one and explain what changed.
Đây là cách dùng AI rất hiệu quả:
không chỉ “build”, mà còn “audit chính sản phẩm nó vừa build”.

PHẦN J - TRIỂN KHAI THỰC TẾ, BẢO MẬT VÀ TƯ DUY SAAS
28) Bảo mật tối thiểu bạn bắt buộc phải nhớ
Không bao giờ public:
• Finnhub API key
• Gemini private/server key nếu dùng phía server
• Supabase service role key
Chỉ dùng phía client:
• Supabase anon/public key
• các biến env đã được thiết kế cho frontend
Không commit file env lên GitHub
Đây là lỗi rất nhiều người mới gặp.
Với app thật
Nên cân nhắc:
• gọi Gemini qua backend/function thay vì lộ hoàn toàn từ frontend
• thêm rate limit
• log lỗi
• kiểm soát chi phí API
Supabase docs cũng nhấn mạnh những key có quyền cao như service_role chỉ dùng server-side, không được expose ở browser.

29) Triển khai lên production
Bước tiếp theo là deploy.
Luồng phổ biến:
• frontend deploy lên Vercel
• database/auth ở Supabase
• APIs từ Finnhub + Gemini
• nếu cần backend an toàn hơn thì thêm serverless function
Anh có thể ra lệnh:
Prepare this project for deployment.
I want:
- production env variable checklist
- build verification
- deployment instructions for Vercel
- security notes for API keys

30) Tên các trang và cấu trúc sản phẩm nên chốt như sau
Để SaaS nhìn chuyên nghiệp, bạn nên chuẩn hóa:
• /auth
• /dashboard
• /portfolio
• /market
• /assistant
• /settings
Và menu trái:
• Dashboard
• Portfolio
• Market
• AI Advisor
• Settings
Nếu muốn bán gói SaaS sau này, có thể thêm:
• Billing
• Subscription
• Alerts
• Watchlist
• Reports

PHẦN K - BỘ PROMPT MẪU ANH CÓ THỂ DÙNG NGAY
31) Prompt tổng khởi động dự án
I want to build a Financial Advisor SaaS as a non-technical founder.
Please help me step by step.
Use a structured workflow:
1) brainstorm
2) product spec
3) implementation plan
4) frontend with mock data
5) Finnhub integration
6) Supabase auth/database
7) Gemini assistant
 testing and deployment prep
Explain in plain language and avoid over-engineering.

32) Prompt tạo UI
Build a modern finance dashboard UI with:
- authentication page
- dashboard
- portfolio page
- market news page
- settings
Use reusable React components and a clean SaaS look.
Start with mock data only.

33) Prompt nối Finnhub
Connect Finnhub free API for quote, ticker search, market news, and company news.
Use environment variables.
Add proper loading and error states.

34) Prompt nối Supabase
Set up Supabase for auth and database.
Generate the SQL schema, row-level security policies, and frontend integration.
Keep the schema simple and MVP-friendly.

35) Prompt tạo trợ lý AI
Create an AI assistant widget using Gemini API.
It should answer based on the user's portfolio and recent market news.
It must explain simply and include a disclaimer that it is not financial advice.

36) Prompt kiểm thử
Audit the app end to end and fix:
- auth issues
- broken routes
- env setup mistakes
- API errors
- missing loading states
- portfolio calculation issues
Then summarize the fixes in plain language.

PHẦN L - NHỮNG LỖI NGƯỜI MỚI HAY GẶP NHẤT
37) Lỗi 1: Cho AI làm quá nhiều thứ một lúc
Sai:
• vừa UI
• vừa DB
• vừa AI chat
• vừa deploy
Đúng:
• UI trước
• data thật sau
• auth sau nữa
• AI context sau nữa
• deploy cuối cùng

38) Lỗi 2: Không chốt spec trước
Khi không có spec, AI cứ sửa mãi, app phình ra, khó kiểm soát.

39) Lỗi 3: Không kiểm tra env
Rất nhiều lỗi là do:
• sai tên biến
• thiếu key
• file .env.local chưa được reload

40) Lỗi 4: Tưởng AI assistant tự biết dữ liệu người dùng
Không.
Bạn phải yêu cầu AI lấy dữ liệu từ Supabase và đưa vào context.

41) Lỗi 5: Làm chatbot chung chung thay vì cố vấn có ngữ cảnh
App chỉ có giá trị khi trợ lý:
• biết người dùng là ai
• đang nắm mã gì
• thị trường đang có tin gì

Trong kỷ nguyên AI Agents, người không biết code vẫn có thể xây phần mềm thật nếu họ biết cách chia bài toán, giao việc, kiểm tra đầu ra và kết nối các dịch vụ đúng cách.
Antigravity cung cấp nền IDE và cơ chế skills/rules để làm việc với agent; Stitch skills giúp nâng chất lượng thiết kế và component hóa UI; Finnhub mang dữ liệu tài chính vào app; Supabase xử lý auth và database; Gemini biến ứng dụng từ dashboard tĩnh thành một trải nghiệm có trí tuệ hỗ trợ.