import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── AUTH ────────────────────────────────────────────────
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw error
  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export const verifyOtpToken = async (email, token) => {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' })
  if (error) throw error
  return data
}

export const deleteUserAccount = async () => {
  // Cần chạy mã hàm SQL tạo function delete_user_account() trên Supabase trước
  const { error } = await supabase.rpc('delete_user_account')
  if (error) throw error
  await signOut()
}

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── PROFILES ────────────────────────────────────────────
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const upsertProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── PORTFOLIOS ──────────────────────────────────────────
export const getPortfolios = async (userId) => {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createPortfolio = async (userId, name = 'Danh mục chính') => {
  const { data, error } = await supabase
    .from('portfolios')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── HOLDINGS ────────────────────────────────────────────
export const getHoldings = async (portfolioId) => {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const addHolding = async (portfolioId, ticker, quantity, averageCost) => {
  const { data, error } = await supabase
    .from('holdings')
    .insert({
      portfolio_id: portfolioId,
      ticker: ticker.toUpperCase(),
      quantity: parseFloat(quantity),
      average_cost: parseFloat(averageCost),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteHolding = async (holdingId) => {
  const { error } = await supabase
    .from('holdings')
    .delete()
    .eq('id', holdingId)
  if (error) throw error
}
