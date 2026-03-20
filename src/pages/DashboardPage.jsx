import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPortfolios, createPortfolio, getHoldings } from '../services/supabase'
import { getMultipleQuotes, getMarketNews, getMultipleProfiles, formatPrice, formatChange } from '../services/finnhub'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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
        
        // Gọi song song giá hiện tại và thông tin Profile công ty
        const [quotes, profiles] = await Promise.all([
          getMultipleQuotes(symbols),
          getMultipleProfiles(symbols)
        ])
        
        enrichedHoldings = holdings.map(h => {
          const q = quotes.find(q => q.symbol === h.ticker)
          const p = profiles.find(p => p.symbol === h.ticker)
          const currentPrice = q?.c || 0
          const value = currentPrice * h.quantity
          const cost = h.average_cost * h.quantity
          const companyName = p?.name || h.ticker
          totalValue += value
          totalCost += cost
          return { ...h, currentPrice, value, cost, companyName }
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

  // Gắn tên đầy đủ (companyName) để vẽ Legend trên biểu đồ
  const pieData = holdings.map(h => ({ name: h.companyName, value: h.value }))
  const COLORS = ['#4f9cf9', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

  return (
    <div>
      {/* Greeting & Quick AI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', marginBottom: 4 }}>
            Xin chào, {displayName} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Đây là tổng quan danh mục tài chính của bạn hôm nay.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/assistant')} style={{ padding: '8px 16px', fontSize: 13, borderRadius: '8px', boxShadow: '0 4px 12px rgba(79,156,249,0.3)' }}>
          🤖 Hỏi AI Advisor ngay
        </button>
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

      {/* Pie Chart & Holdings (Row 2) */}
      <div className="grid-2" style={{ gap: 14, alignItems: 'start', marginBottom: 14 }}>
        {/* Pie Chart Phân Bổ */}
        <div className="card" style={{ height: '100%' }}>
          <div className="card-header"><span className="card-title">Phân bổ tài sản</span></div>
          {holdings.length === 0 ? <p style={{ fontSize: 13, padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có dữ liệu</p> : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val) => formatPrice(val)} itemStyle={{ color: 'var(--text-primary)', fontSize: 13 }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '6px' }} />
                  <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ fontSize: 12, lineHeight: 1.4, color: 'var(--text-primary)', paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Holdings */}
        <div className="card" style={{ height: '100%' }}>
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
      </div>

      {/* News (Row 3 - Full width) */}
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
  )
}
