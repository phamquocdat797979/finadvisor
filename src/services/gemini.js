import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

let genAI = null
const getClient = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(API_KEY)
  return genAI
}

const SYSTEM_INSTRUCTION = `Bạn là FinAdvisor - trợ lý tài chính thông minh trong ứng dụng quản lý danh mục đầu tư.

Quy tắc QUAN TRỌNG:
1. Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu
2. Dùng dữ liệu danh mục thực tế của người dùng nếu có
3. Giải thích thuật ngữ tài chính bằng ngôn ngữ đơn giản
4. KHÔNG bao giờ khẳng định chắc chắn về giá tương lai
5. KHÔNG đưa ra lệnh mua/bán cụ thể
6. Luôn nhắc nhở đây là thông tin giáo dục, không phải lời khuyên tài chính

Khi có dữ liệu danh mục, hãy phân tích và đưa ra nhận xét ngắn gọn, hữu ích.`

export const askGemini = async (userQuestion, context = {}) => {
  const client = getClient()
  const model = client.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_INSTRUCTION,
  })

  // Build context string
  let contextStr = ''

  if (context.profile) {
    contextStr += `\n## Thông tin người dùng\nTên: ${context.profile.full_name || 'Người dùng'}\n`
  }

  if (context.holdings && context.holdings.length > 0) {
    contextStr += `\n## Danh mục đầu tư hiện tại\n`
    context.holdings.forEach(h => {
      const currentVal = h.currentPrice ? (h.quantity * h.currentPrice).toFixed(2) : 'N/A'
      const gainLoss = h.currentPrice ? ((h.currentPrice - h.average_cost) / h.average_cost * 100).toFixed(2) : 'N/A'
      contextStr += `- ${h.ticker}: ${h.quantity} cổ phiếu, giá mua TB $${h.average_cost}, giá hiện tại $${h.currentPrice || 'N/A'}, giá trị $${currentVal}, lãi/lỗ ${gainLoss}%\n`
    })
  } else {
    contextStr += `\n## Danh mục: Người dùng chưa có danh mục đầu tư\n`
  }

  if (context.news && context.news.length > 0) {
    contextStr += `\n## Tin tức thị trường gần đây\n`
    context.news.slice(0, 5).forEach(n => {
      contextStr += `- ${n.headline}\n`
    })
  }

  const fullPrompt = contextStr
    ? `${contextStr}\n## Câu hỏi của người dùng\n${userQuestion}`
    : userQuestion

  const result = await model.generateContent(fullPrompt)
  return result.response.text()
}
