import React, { useState } from 'react'
import { signIn, signUp, resetPassword, verifyOtpToken, supabase, checkEmailExists } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const isResetting = sessionStorage.getItem('isResettingPassword') === 'true'
  const [tab, setTab] = useState(isResetting ? 'forgot' : 'login') // 'login' | 'register' | 'forgot'
  const [forgotStep, setForgotStep] = useState(isResetting ? 3 : 1) // 1: Email, 2: OTP, 3: New Pass
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
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
        const isExists = await checkEmailExists(email)
        
        if (isExists === false) {
          throw new Error('🛑 Lỗi: Tài khoản Email này chưa được đăng ký trong mạng lưới FinAdvisor!')
        }
        
        try {
          await signIn(email, password)
          navigate('/dashboard')
        } catch (loginErr) {
          if (loginErr.message?.includes('Invalid login')) {
            if (isExists) throw new Error('🔑 Lỗi: Mật khẩu bạn nhập không chính xác!')
            else throw new Error('Email chưa đăng ký hoặc Mật khẩu không đúng! (Chú ý: Cần dán mã lệnh ở file SQL add_check_email_rpc.sql vào Supabase Editor để chia tách thông báo lỗi).')
          }
          throw loginErr
        }
      } else if (tab === 'register') {
        const data = await signUp(email, password, fullName)
        // Check "Gương chiếu yêu": Bắt bài Supabase cố tình trả về success ảo khi trùng Email
        if (data?.user?.identities && data.user.identities.length === 0) {
          setError('Thất bại: Email này đã được đăng ký từ trước. Vui lòng quay lại tab Đăng Nhập!')
          setLoading(false)
          return
        }
        setSuccess('Tạo tài khoản thành công! Tự động chuyển sang Đăng nhập sau 2 giây...')
        setTimeout(() => setTab('login'), 2000)
      } else if (tab === 'forgot') {
        if (forgotStep === 1) {
          await resetPassword(email)
          setSuccess('Đã gửi mã OTP (hoặc link) đến email của bạn! (Kiểm tra cả hộp thư rác).')
          setForgotStep(2)
        } else if (forgotStep === 2) {
          // Gắn biển hiệu để chặn 'Thằng Bảo Vệ PublicRoute' không sỉ nhục đá mình vào Trang Chủ
          sessionStorage.setItem('isResettingPassword', 'true')
          
          await verifyOtpToken(email, otp)
          setSuccess('Xác thực Mã OTP thành công! Mời nhập mật khẩu mới.')
          setForgotStep(3)
        } else if (forgotStep === 3) {
          const { error } = await supabase.auth.updateUser({ password: newPassword })
          if (error) throw error
          
          // Gỡ biển hiệu, thay xong rùi!
          sessionStorage.removeItem('isResettingPassword')
          
          setSuccess('Đổi Mật Khẩu thành công! Đang vào hệ thống...')
          setTimeout(() => navigate('/dashboard'), 2000)
        }
      }
    } catch (err) {
      sessionStorage.removeItem('isResettingPassword') // Có lỗi thì giải tán
      const msg = err.message || 'Có lỗi xảy ra'
      if (msg.includes('Email not confirmed')) setError('⚠️ Vui lòng mở Hộp thư Email của bạn và bấn link xác nhận để kích hoạt tài khoản!')
      else if (msg.includes('rate limit')) setError('⛔ Thao tác quá nhanh! Bạn đã vượt giới hạn gửi Email từ máy chủ. Vui lòng thử lại sau.')
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
          {tab === 'forgot' ? (
            <>
              {forgotStep === 1 && (
                <div className="form-group">
                  <label className="form-label" htmlFor="emailForgot">Email tài khoản cần khôi phục</label>
                  <input id="emailForgot" className="form-input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              )}
              {forgotStep === 2 && (
                <div className="form-group">
                  <label className="form-label" htmlFor="otpCode">Mã OTP từ Email</label>
                  <input id="otpCode" className="form-input" type="text" placeholder="Nhập dãy mã số..." value={otp} onChange={e => setOtp(e.target.value)} required />
                  <p style={{fontSize: 11, color:'var(--text-muted)', marginTop: 4}}>* Lưu ý quan trọng: Điền mã này xong VÀ tuyệt đối không bấm vào link xanh trong Email để tránh làm hỏng mã.</p>
                </div>
              )}
              {forgotStep === 3 && (
                <div className="form-group">
                  <label className="form-label" htmlFor="newPass">Mật khẩu mới</label>
                  <input id="newPass" className="form-input" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                </div>
              )}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                {loading ? '⏳ Xin chờ...' : forgotStep === 1 ? '📩 Gửi yêu cầu OTP' : forgotStep === 2 ? '✅ Xác thực OTP' : '🔒 Đặt lại mật khẩu'}
              </button>
              <button type="button" onClick={() => { setTab('login'); setForgotStep(1); setError(''); setSuccess(''); sessionStorage.removeItem('isResettingPassword'); }} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                ← Quay lại Đăng nhập
              </button>
            </>
          ) : (
            <>
              {tab === 'register' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Họ và tên</label>
                  <input id="fullName" className="form-input" type="text" placeholder="Nguyễn Văn A" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" className="form-input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Mật khẩu</label>
                <input id="password" className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>

              {tab === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: 12 }}>
                  <button type="button" onClick={() => { setTab('forgot'); setForgotStep(1); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer' }}>
                    Bạn quên mật khẩu?
                  </button>
                </div>
              )}

              <button id="btn-submit-auth" className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                {loading ? '⏳ Đang xử lý...' : tab === 'login' ? '🔑 Đăng nhập' : '🚀 Tạo tài khoản'}
              </button>
            </>
          )}
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
