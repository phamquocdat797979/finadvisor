const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY
const BASE_URL = 'https://finnhub.io/api/v1'

const fetchFinnhub = async (endpoint) => {
  const url = `${BASE_URL}${endpoint}&token=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Finnhub ${res.status}: ${res.statusText}`)
  return res.json()
}

// Lấy giá hiện tại của mã cổ phiếu
export const getQuote = async (symbol) => {
  return fetchFinnhub(`/quote?symbol=${symbol.toUpperCase()}`)
}

// Lấy giá nhiều mã cùng lúc
export const getMultipleQuotes = async (symbols) => {
  const promises = symbols.map(s => getQuote(s).then(q => ({ symbol: s, ...q })).catch(() => ({ symbol: s, error: true })))
  return Promise.all(promises)
}

// Lấy tên và thông tin công ty cơ bản
export const getCompanyProfile = async (symbol) => {
  return fetchFinnhub(`/stock/profile2?symbol=${symbol.toUpperCase()}`)
}

export const getMultipleProfiles = async (symbols) => {
  const promises = symbols.map(s => getCompanyProfile(s).then(p => ({ symbol: s, ...p })).catch(() => ({ symbol: s })))
  return Promise.all(promises)
}

// Tìm kiếm mã cổ phiếu
export const searchSymbol = async (query) => {
  const data = await fetchFinnhub(`/search?q=${encodeURIComponent(query)}`)
  return data.result || []
}

// Tin tức thị trường chung
export const getMarketNews = async (category = 'general') => {
  return fetchFinnhub(`/news?category=${category}`)
}

// Tin tức theo công ty
export const getCompanyNews = async (symbol, from, to) => {
  const today = to || new Date().toISOString().split('T')[0]
  const weekAgo = from || new Date(Date.now() - 7 * 864e5).toISOString().split('T')[0]
  return fetchFinnhub(`/company-news?symbol=${symbol.toUpperCase()}&from=${weekAgo}&to=${today}`)
}

// Format helpers
export const formatPrice = (price) => {
  if (!price && price !== 0) return '--'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

export const formatChange = (change, changePct) => {
  if (!change && change !== 0) return { text: '--', positive: null }
  const sign = change >= 0 ? '+' : ''
  return {
    text: `${sign}${change.toFixed(2)} (${sign}${changePct?.toFixed(2)}%)`,
    positive: change >= 0,
  }
}
