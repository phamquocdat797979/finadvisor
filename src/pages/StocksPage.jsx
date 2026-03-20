import React, { useEffect, useState, useCallback } from 'react'
import { getMultipleQuotes, getMultipleProfiles, formatPrice } from '../services/finnhub'

// Danh sách các "Siêu Cổ Phiếu" mặc định
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'BRK.B', 'JPM', 'V']

export default function StocksPage() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadBoard = useCallback(async () => {
    try {
      setLoading(true)
      const [quotes, profiles] = await Promise.all([
        getMultipleQuotes(DEFAULT_SYMBOLS),
        getMultipleProfiles(DEFAULT_SYMBOLS)
      ])

      const boardData = DEFAULT_SYMBOLS.map(symbol => {
        const q = quotes.find(q => q.symbol === symbol) || {}
        const p = profiles.find(p => p.symbol === symbol) || {}
        return {
          symbol,
          name: p.name || symbol,
          price: q.c || 0,
          change: q.d || 0,
          changePct: q.dp || 0,
          high: q.h || 0,
          low: q.l || 0,
          open: q.o || 0,
          prevClose: q.pc || 0
        }
      })
      
      // Sắp xếp theo % Tăng giảm mạnh nhất
      boardData.sort((a, b) => b.changePct - a.changePct)

      setStocks(boardData)
    } catch (err) {
      setError('Lỗi tải Bảng giá từ Finnhub: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadBoard() }, [loadBoard])

  if (loading) return <div className="loading"><div className="spinner" /><p>Đang lên sàn giao dịch trực tuyến...</p></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📈 Bảng Giá Cổ Phiếu</h1>
          <p>Giá trị giao dịch thời gian thực của Top siêu cổ phiếu thế giới (Cập nhật liên tục)</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadBoard}>
          🔄 Tải làm mới ({new Date().toLocaleTimeString('vi-VN')})
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          <table style={{ width: '100%', minWidth: 700 }}>
            <thead>
              <tr>
                <th>MÃ CP</th>
                <th>TÊN CÔNG TY</th>
                <th className="right">GIÁ KHỚP</th>
                <th className="right">+/ - TĂNG TRƯỞNG</th>
                <th className="right">MỞ CỬA</th>
                <th className="right">CAO NHẤT</th>
                <th className="right">THẤP NHẤT</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(s => {
                const isUp = s.change >= 0
                const color = isUp ? 'var(--accent-green)' : 'var(--accent-red)'
                const sign = isUp ? '+' : ''
                
                return (
                  <tr key={s.symbol} style={{ transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ fontWeight: 700 }}>
                      <span className="ticker-badge" style={{ backgroundColor: isUp ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: color, borderColor: color }}>
                        {s.symbol}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                    <td className="right" style={{ fontSize: 16, fontWeight: 700, color: color }}>
                      {formatPrice(s.price)}
                    </td>
                    <td className="right" style={{ fontWeight: 600, color: color }}>
                      {sign}{s.change.toFixed(2)} <br/>
                      <span style={{ fontSize: 11 }}>({sign}{s.changePct.toFixed(2)}%)</span>
                    </td>
                    <td className="right text-muted">{formatPrice(s.open)}</td>
                    <td className="right" style={{ color: 'var(--accent-green)' }}>{formatPrice(s.high)}</td>
                    <td className="right" style={{ color: 'var(--accent-red)' }}>{formatPrice(s.low)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
