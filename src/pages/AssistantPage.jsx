import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPortfolios, getHoldings, getProfile, upsertProfile } from '../services/supabase'
import { getMarketNews, getMultipleQuotes } from '../services/finnhub'
import { askGemini } from '../services/gemini'

const SUGGESTIONS = [
  'Tổng quan danh mục của tôi là gì?',
  'Mã nào đang lãi, mã nào lỗ?',
  'P/E ratio là gì? Giải thích đơn giản',
  'Có tin gì đáng chú ý hôm nay không?',
  'Cách đa dạng hóa danh mục đầu tư?',
]

const renderMessage = (text) => {
  const parts = text.split('\n').filter(l => l.trim())
  return parts.map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
    return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} />
  })
}

export default function AssistantPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState(() => {
    try {
      if (user && user.id) {
        const saved = localStorage.getItem(`chat_${user.id}`);
        if (saved) return JSON.parse(saved);
      }
    } catch(e) {}
    return [
      {
        role: 'assistant',
        content: 'Xin chào! Tôi là **FinAdvisor AI** 🤖\n\nTôi có thể giúp bạn:\n- Phân tích danh mục đầu tư\n- Giải thích thuật ngữ tài chính\n- Tóm tắt tin tức thị trường\n\nHãy đặt câu hỏi bất kỳ!',
      }
    ];
  })

  // Đồng bộ lưu lịch sử liên tục lên Đám mây (fallback vào LocalStorage nếu chưa Add Column)
  useEffect(() => {
    if (user && user.id) {
      localStorage.setItem(`chat_${user.id}`, JSON.stringify(messages));
      if (messages.length > 1) {
        upsertProfile(user.id, { chat_history: messages }).catch(() => {})
      }
    }
  }, [messages, user])

  // Tải lịch sử thông minh từ Database ở lần mở đầu tiên
  useEffect(() => {
    let unmounted = false;
    if (user && user.id) {
      getProfile(user.id).then(profile => {
        if (!unmounted && profile?.chat_history && profile.chat_history.length > 1) {
          setMessages(profile.chat_history);
        }
      }).catch(() => {});
    }
    return () => { unmounted = true };
  }, [user])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Pre-load context once
  const loadContext = useCallback(async () => {
    if (!user || context) return
    try {
      const [profile, portfolios, news] = await Promise.all([
        getProfile(user.id).catch(() => null),
        getPortfolios(user.id).catch(() => []),
        getMarketNews('general').catch(() => []),
      ])

      let holdings = []
      if (portfolios.length > 0) {
        const raw = await getHoldings(portfolios[0].id).catch(() => [])
        if (raw.length > 0) {
          const quotes = await getMultipleQuotes(raw.map(h => h.ticker)).catch(() => [])
          holdings = raw.map(h => {
            const q = quotes.find(q => q.symbol === h.ticker)
            return { ...h, currentPrice: q?.c || null }
          })
        }
      }

      setContext({ profile, holdings, news: news.slice(0, 5) })
    } catch (e) {
      console.error('Context load error:', e)
    }
  }, [user, context])

  useEffect(() => { loadContext() }, [loadContext])

  const deleteMessagePair = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index && i !== index + 1))
  }

  const clearAllMessages = () => {
    if (window.confirm('Bạn có chắc muốn xoá toàn bộ lịch sử trò chuyện?')) {
      setMessages([{
        role: 'assistant',
        content: 'Xin chào! Tôi là **FinAdvisor AI** 🤖\n\nTôi có thể giúp bạn:\n- Phân tích danh mục đầu tư\n- Giải thích thuật ngữ tài chính\n- Tóm tắt tin tức thị trường\n\nHãy đặt câu hỏi bất kỳ!',
      }])
    }
  }

  const send = async (text) => {
    const question = (text || input).trim()
    if (!question || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: question }])
    setLoading(true)
    try {
      const answer = await askGemini(question, context || {})
      setMessages(m => [...m, { role: 'assistant', content: answer }])
    } catch (err) {
      console.error("LỖI GEMINI CHI TIẾT:", err)
      setMessages(m => [...m, { 
        role: 'assistant', 
        content: `❌ Lỗi từ máy chủ Google: **${err.message || 'Lỗi không xác định'}**\n\nVui lòng làm thao tác sau:\n1. Copy đoạn text tiếng Anh ở trên gửi lại cho tôi sửa.\n2. Bấm phím **F5** để tải lại trang web.` 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="chat-container">
      {/* Header info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            🤖
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>FinAdvisor AI</div>
            <div style={{ fontSize: 11, color: context?.holdings?.length > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
              {context
                ? context.holdings?.length > 0
                  ? `✅ Đã nạp ${context.holdings.length} mã từ danh mục`
                  : '⚪ Chưa có danh mục — Trả lời câu hỏi chung'
                : '⏳ Đang tải ngữ cảnh...'}
            </div>
          </div>
        </div>
        {messages.length > 1 && (
          <button className="btn btn-ghost btn-sm" onClick={clearAllMessages}>
            🧹 Xoá tất cả
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            <div className="chat-avatar">
              {m.role === 'user' ? (user?.email?.slice(0, 1).toUpperCase() || 'U') : '🤖'}
            </div>
            <div>
              <div className="chat-bubble">
                {renderMessage(m.content)}
              </div>
              {m.role === 'user' && (
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
                    onClick={() => deleteMessagePair(i)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
                    title="Xoá câu hỏi này và câu trả lời của AI tương ứng"
                  >
                    🗑 Xoá đoạn này
                  </button>
                </div>
              )}
              {m.role === 'assistant' && i > 0 && (
                <div className="chat-disclaimer">
                  ⚠️ Đây là thông tin giáo dục, không phải lời khuyên tài chính
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <div className="chat-avatar">🤖</div>
            <div className="chat-bubble" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ animation: 'spin 1s infinite', display: 'inline-block' }}>⏳</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Đang phân tích...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          id="chat-input"
          className="chat-input"
          placeholder="Hỏi về danh mục, tin tức, thuật ngữ tài chính..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button
          id="btn-send-chat"
          className="btn btn-primary"
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{ height: 40, padding: '0 14px' }}
        >
          {loading ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  )
}
