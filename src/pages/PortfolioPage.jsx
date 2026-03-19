import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getPortfolios, createPortfolio, getHoldings, addHolding, deleteHolding,
} from '../services/supabase'
import { getMultipleQuotes, getQuote, formatPrice } from '../services/finnhub'

const EMPTY_FORM = { ticker: '', quantity: '', averageCost: '' }

export default function PortfolioPage() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState(null)
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [tickerCheck, setTickerCheck] = useState(null) // validated price
  const [deleting, setDeleting] = useState(null)

  const loadPortfolio = useCallback(async () => {
    if (!user) return
    try {
      let portfolios = await getPortfolios(user.id)
      if (!portfolios.length) {
        const p = await createPortfolio(user.id)
        portfolios = [p]
      }
      const p = portfolios[0]
      setPortfolio(p)
      const raw = await getHoldings(p.id)
      if (raw.length > 0) {
        const quotes = await getMultipleQuotes(raw.map(h => h.ticker))
        const enriched = raw.map(h => {
          const q = quotes.find(q => q.symbol === h.ticker)
          const cp = q?.c || 0
          const val = cp * h.quantity
          const cost = h.average_cost * h.quantity
          const chg = val - cost
          const pct = cost > 0 ? (chg / cost) * 100 : 0
          return { ...h, currentPrice: cp, value: val, cost, gainLoss: chg, gainPct: pct }
        })
        setHoldings(enriched)
      } else {
        setHoldings([])
      }
    } catch (err) {
      setError('Không thể tải danh mục. Kiểm tra Supabase & Finnhub API key.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadPortfolio() }, [loadPortfolio])

  // Verify ticker on lost focus
  const handleTickerBlur = async () => {
    if (!form.ticker.trim()) return
    setTickerCheck(null)
    try {
      const q = await getQuote(form.ticker.trim())
      if (q.c && q.c > 0) {
        setTickerCheck({ valid: true, price: q.c })
      } else {
        setTickerCheck({ valid: false })
      }
    } catch {
      setTickerCheck({ valid: false })
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.ticker.trim() || !form.quantity || !form.averageCost) {
      setFormError('Vui lòng điền đầy đủ thông tin')
      return
    }
    setFormLoading(true)
    try {
      await addHolding(portfolio.id, form.ticker.trim(), form.quantity, form.averageCost)
      setShowModal(false)
      setForm(EMPTY_FORM)
      setTickerCheck(null)
      await loadPortfolio()
    } catch (err) {
      setFormError(err.message || 'Lỗi khi thêm cổ phiếu')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá cổ phiếu này?')) return
    setDeleting(id)
    try {
      await deleteHolding(id)
      await loadPortfolio()
    } catch (err) {
      setError('Không thể xoá: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  const totalValue = holdings.reduce((s, h) => s + (h.value || 0), 0)
  const totalCost = holdings.reduce((s, h) => s + (h.cost || 0), 0)
  const totalGain = totalValue - totalCost
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  if (loading) return <div className="loading"><div className="spinner" /><p>Đang tải...</p></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Danh mục đầu tư</h1>
          {portfolio && <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{portfolio.name}</p>}
        </div>
        <button id="btn-add-stock" className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); setForm(EMPTY_FORM); setTickerCheck(null) }}>
          + Thêm cổ phiếu
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* Summary */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Tổng giá trị</div>
          <div className="stat-value">{formatPrice(totalValue)}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Tổng vốn bỏ ra</div>
          <div className="stat-value">{formatPrice(totalCost)}</div>
        </div>
        <div className={`stat-card ${totalGain >= 0 ? 'green' : 'red'}`}>
          <div className="stat-label">Lãi / Lỗ</div>
          <div className="stat-value small" style={{ color: totalGain >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {totalGain >= 0 ? '+' : ''}{formatPrice(totalGain)}
          </div>
          <div className={`stat-badge ${totalGainPct >= 0 ? 'positive' : 'negative'}`}>
            {totalGainPct >= 0 ? '▲' : '▼'} {Math.abs(totalGainPct).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Cổ phiếu nắm giữ ({holdings.length})</span>
          <button className="btn btn-ghost btn-sm" onClick={loadPortfolio}>🔄 Cập nhật giá</button>
        </div>

        {holdings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Danh mục trống</h3>
            <p>Thêm cổ phiếu đầu tiên để bắt đầu theo dõi</p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}>
              + Thêm cổ phiếu
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th className="right">Số lượng</th>
                  <th className="right">Giá mua TB</th>
                  <th className="right">Giá hiện tại</th>
                  <th className="right">Giá trị</th>
                  <th className="right">Lãi/Lỗ</th>
                  <th className="right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => (
                  <tr key={h.id}>
                    <td><span className="ticker-badge">{h.ticker}</span></td>
                    <td className="right">{h.quantity}</td>
                    <td className="right">{formatPrice(h.average_cost)}</td>
                    <td className="right">{h.currentPrice > 0 ? formatPrice(h.currentPrice) : <span className="text-muted">--</span>}</td>
                    <td className="right" style={{ fontWeight: 600 }}>{h.value > 0 ? formatPrice(h.value) : '--'}</td>
                    <td className="right">
                      {h.value > 0 ? (
                        <div>
                          <span style={{ color: h.gainLoss >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                            {h.gainLoss >= 0 ? '+' : ''}{formatPrice(h.gainLoss)}
                          </span>
                          <div style={{ fontSize: 11, color: h.gainPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                            {h.gainPct >= 0 ? '▲' : '▼'} {Math.abs(h.gainPct).toFixed(2)}%
                          </div>
                        </div>
                      ) : '--'}
                    </td>
                    <td className="right">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(h.id)}
                        disabled={deleting === h.id}
                      >
                        {deleting === h.id ? '...' : '🗑'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Thêm cổ phiếu</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {formError && <div className="error-box">{formError}</div>}

            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label" htmlFor="ticker">Mã cổ phiếu (Ticker)</label>
                <input
                  id="ticker"
                  className="form-input"
                  placeholder="Ví dụ: AAPL, TSLA, GOOGL"
                  value={form.ticker}
                  onChange={e => { setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() })); setTickerCheck(null) }}
                  onBlur={handleTickerBlur}
                  required
                  style={{ textTransform: 'uppercase' }}
                />
                {tickerCheck && (
                  <div style={{ marginTop: 4, fontSize: 12 }}>
                    {tickerCheck.valid
                      ? <span className="text-green">✅ Hợp lệ — Giá hiện tại: {formatPrice(tickerCheck.price)}</span>
                      : <span className="text-red">❌ Mã không hợp lệ hoặc không tìm thấy</span>}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="quantity">Số lượng cổ phiếu</label>
                <input
                  id="quantity"
                  className="form-input"
                  type="number"
                  placeholder="Ví dụ: 10"
                  min="0.0001"
                  step="any"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="averageCost">Giá mua trung bình (USD)</label>
                <input
                  id="averageCost"
                  className="form-input"
                  type="number"
                  placeholder="Ví dụ: 150.50"
                  min="0.01"
                  step="any"
                  value={form.averageCost}
                  onChange={e => setForm(f => ({ ...f, averageCost: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Huỷ</button>
                <button id="btn-confirm-add" type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? '⏳ Đang lưu...' : '✅ Thêm vào danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
