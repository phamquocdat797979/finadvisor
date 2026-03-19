import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPortfolios, createPortfolio, getHoldings } from '../services/supabase'
import { getMultipleQuotes, getMarketNews, formatPrice, formatChange } from '../services/finnhub'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [portfolioData, setPortfolioData] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError('')

      // Load portfolio
      let portfolios = await getPortfolios(user.id)
      if (!portfolios.length) {
        const p = await createPortfolio(user.id, 'Danh mục chính')
        portfolios = [p]
      }
      const portfolio = portfolios[0]
      const holdings = await getHoldings(portfolio.id)

      let enrichedHoldings = holdings
      let totalValue = 0
      let totalCost = 0

      if (holdings.length > 0) {
        const symbols = holdings.map(h => h.ticker)
        const quotes = await getMultipleQuotes(symbols)
        enrichedHoldings = holdings.map(h => {
          const q = quotes.find(q => q.symbol === h.ticker)
          const currentPrice = q?.c || 0
          const value = currentPrice * h.quantity
          const cost = h.average_cost * h.quantity
          totalValue += value
          totalCost += cost
          return { ...h, currentPrice, value, cost }
        })
      }

      const totalGainLoss = totalValue - totalCost
      const totalGainPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

      setPortfolioData({
        portfolio,
        holdings: enrichedHoldings,
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainPct,
      })

      // Load news
      const newsData = await getMarketNews('general')
      setNews(newsData.slice(0, 5))
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng kiểm tra API keys.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'bạn'

  if (loading) return <div className="loading"><div className="spinner" /><p>Đang tải dữ liệu...</p></div>

  const { totalValue = 0, totalGainLoss = 0, totalGainPct = 0, holdings = [] } = portfolioData || {}

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.3rem', marginBottom: 4 }}>
          Xin chào, {displayName} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Đây là tổng quan danh mục tài chính của bạn hôm nay.
        </p>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Tổng giá trị danh mục</div>
          <div className="stat-value">{formatPrice(totalValue)}</div>
          <div className="stat-sub">{holdings.length} mã cổ phiếu</div>
        </div>
        <div className={`stat-card ${totalGainLoss >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Lãi / Lỗ tổng</div>
          <div className="stat-value small" style={{ color: totalGainLoss >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {totalGainLoss >= 0 ? '+' : ''}{formatPrice(totalGainLoss)}
          </div>
          <div className={`stat-badge ${totalGainPct >= 0 ? 'positive' : 'negative'}`}>
            {totalGainPct >= 0 ? '▲' : '▼'} {Math.abs(totalGainPct).toFixed(2)}%
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Số mã nắm giữ</div>
          <div className="stat-value">{holdings.length}</div>
          <div className="stat-sub">mã cổ phiếu</div>
        </div>
      </div>

      {/* Holdings & News */}
      <div className="grid-2" style={{ gap: 14, alignItems: 'start' }}>
        {/* Holdings */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Danh mục</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/portfolio')}>Xem tất cả →</button>
          </div>
          {holdings.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon">📭</div>
              <p>Chưa có cổ phiếu nào</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => navigate('/portfolio')}>
                + Thêm ngay
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th className="right">Giá</th>
                    <th className="right">Giá trị</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.slice(0, 5).map(h => {
                    const chg = h.currentPrice - h.average_cost
                    const pct = (chg / h.average_cost) * 100
                    return (
                      <tr key={h.id}>
                        <td><span className="ticker-badge">{h.ticker}</span></td>
                        <td className="right">
                          <div>{formatPrice(h.currentPrice)}</div>
                          <div style={{ fontSize: 11, color: chg >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                            {chg >= 0 ? '+' : ''}{pct.toFixed(2)}%
                          </div>
                        </td>
                        <td className="right" style={{ fontWeight: 600 }}>{formatPrice(h.value)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* News */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tin tức nổi bật</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/market')}>Xem thêm →</button>
          </div>
          {news.length === 0 ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {news.map((n, i) => (
                <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', padding: '8px 0', borderBottom: i < news.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>
                    {n.headline}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {n.source} • {new Date(n.datetime * 1000).toLocaleDateString('vi-VN')}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick AI */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-header">
          <span className="card-title">🤖 Trợ lý AI</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
          Hỏi AI về danh mục đầu tư, giải thích thuật ngữ tài chính, hoặc tóm tắt tin tức thị trường.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/assistant')}>
          🤖 Mở AI Advisor
        </button>
      </div>
    </div>
  )
}
