import React, { useState } from 'react'
import { signIn, signUp } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        await signUp(email, password, fullName)
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.')
      }
    } catch (err) {
      const msg = err.message || 'Có lỗi xảy ra'
      if (msg.includes('Invalid login')) setError('Email hoặc mật khẩu không đúng')
      else if (msg.includes('already registered')) setError('Email này đã được đăng ký')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">FA</div>
          <h1>FinAdvisor</h1>
          <p>Cố vấn tài chính thông minh với AI</p>
        </div>

        <div className="auth-tabs">
          <button
            id="tab-login"
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
          >
            Đăng nhập
          </button>
          <button
            id="tab-register"
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
          >
            Đăng ký
          </button>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}
        {success && <div className="success-box">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                className="form-input"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            id="btn-submit-auth"
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? '⏳ Đang xử lý...' : tab === 'login' ? '🔑 Đăng nhập' : '🚀 Tạo tài khoản'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Bằng cách tiếp tục, bạn đồng ý với điều khoản dịch vụ.</p>
          <p style={{ marginTop: 4, color: 'var(--accent-yellow)', fontSize: 11 }}>
            ⚠️ Đây là ứng dụng giáo dục - không phải lời khuyên tài chính
          </p>
        </div>
      </div>
    </div>
  )
}
