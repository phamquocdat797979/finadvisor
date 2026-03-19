import React, { useEffect, useState } from 'react'
import { getMarketNews, getCompanyNews, searchSymbol } from '../services/finnhub'

const formatDate = (ts) => new Date(ts * 1000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

const NewsItem = ({ news }) => (
  <a href={news.url} target="_blank" rel="noopener noreferrer" className="news-card" style={{ display: 'block', textDecoration: 'none' }}>
    <div className="news-card-content">
      {news.image && (
        <img className="news-card-image" src={news.image} alt="" onError={e => { e.target.style.display = 'none' }} />
      )}
      <div className="news-card-body">
        <div className="news-card-headline">{news.headline}</div>
        {news.summary && (
          <div className="news-card-summary">{news.summary.slice(0, 120)}...</div>
        )}
        <div className="news-card-meta">
          <span className="tag">{news.source}</span>
          <span>{formatDate(news.datetime)}</span>
          {news.related && <span className="ticker-badge">{news.related}</span>}
        </div>
      </div>
    </div>
  </a>
)

export default function MarketPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedTicker, setSelectedTicker] = useState(null)
  const [companyNews, setCompanyNews] = useState([])
  const [companyLoading, setCompanyLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState('market') // 'market' | 'company'
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMarketNews('general')
        setNews(data.slice(0, 20))
      } catch (err) {
        setError('Không thể tải tin tức. Kiểm tra Finnhub API key.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSearch = async (val) => {
    setSearchInput(val)
    if (!val.trim() || val.length < 2) { setSearchResults([]); setShowDropdown(false); return }
    setSearchLoading(true)
    try {
      const results = await searchSymbol(val)
      setSearchResults(results.slice(0, 6))
      setShowDropdown(true)
    } catch { setSearchResults([]) }
    finally { setSearchLoading(false) }
  }

  const handleSelectTicker = async (ticker, name) => {
    setSelectedTicker({ ticker, name })
    setSearchInput(`${ticker} — ${name}`)
    setShowDropdown(false)
    setActiveTab('company')
    setCompanyLoading(true)
    try {
      const data = await getCompanyNews(ticker)
      setCompanyNews(data.slice(0, 20))
    } catch {
      setCompanyNews([])
    } finally {
      setCompanyLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Thị trường</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>Tin tức tài chính và dữ liệu thị trường</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <input
            id="ticker-search"
            className="form-input"
            placeholder="🔍 Tìm mã cổ phiếu... (Ví dụ: AAPL, Tesla)"
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          />
          {searchInput && (
            <button className="btn btn-ghost" onClick={() => { setSearchInput(''); setSearchResults([]); setShowDropdown(false); setSelectedTicker(null); setActiveTab('market') }}>
              ✕ Xoá
            </button>
          )}
        </div>

        {showDropdown && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)', marginTop: 4
          }}>
            {searchLoading && <div style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 13 }}>Đang tìm...</div>}
            {searchResults.map((r, i) => (
              <div key={i}
                onClick={() => handleSelectTicker(r.symbol, r.description)}
                style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', borderBottom: i < searchResults.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="ticker-badge">{r.symbol}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.description}</span>
                <span className="tag" style={{ marginLeft: 'auto' }}>{r.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: 'var(--bg-secondary)', padding: 3, borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
        <button
          className={`auth-tab${activeTab === 'market' ? ' active' : ''}`}
          onClick={() => setActiveTab('market')}
          style={{ padding: '6px 16px' }}
        >
          📰 Tin chung
        </button>
        <button
          className={`auth-tab${activeTab === 'company' ? ' active' : ''}`}
          onClick={() => setActiveTab('company')}
          style={{ padding: '6px 16px' }}
          disabled={!selectedTicker}
        >
          🏢 {selectedTicker ? selectedTicker.ticker : 'Tin công ty'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* Market news */}
      {activeTab === 'market' && (
        <div>
          {loading ? (
            <div className="loading"><div className="spinner" /><p>Đang tải tin tức...</p></div>
          ) : (
            <div className="news-list">
              {news.map((n, i) => <NewsItem key={i} news={n} />)}
            </div>
          )}
        </div>
      )}

      {/* Company news */}
      {activeTab === 'company' && (
        <div>
          {selectedTicker && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ticker-badge" style={{ fontSize: 13, padding: '3px 10px' }}>{selectedTicker.ticker}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selectedTicker.name}</span>
            </div>
          )}
          {companyLoading ? (
            <div className="loading"><div className="spinner" /><p>Đang tải tin tức công ty...</p></div>
          ) : companyNews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Không có tin tức gần đây cho mã này</p>
            </div>
          ) : (
            <div className="news-list">
              {companyNews.map((n, i) => <NewsItem key={i} news={n} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
