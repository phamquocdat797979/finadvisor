import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfile, upsertProfile, signOut, supabase, deleteUserAccount } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        const profile = await getProfile(user.id)
        setFullName(profile?.full_name || user.user_metadata?.full_name || '')
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const [newPassword, setNewPassword] = useState('')
  const [pwdStatus, setPwdStatus] = useState({ error: '', success: '', loading: false })

  const handleSave = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setSaving(true)
    try {
      await upsertProfile(user.id, { full_name: fullName })
      // Đồng bộ thông tin tên vào hệ thống Auth của Supabase để toàn Web cập nhật tên ngay lập tức
      await supabase.auth.updateUser({ data: { full_name: fullName } }) 
      setSuccess('Đã cập nhật hồ sơ thành công!')
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setPwdStatus({ error: 'Mật khẩu mới phải từ 6 ký tự trở lên', success: '', loading: false })
      return
    }
    setPwdStatus({ error: '', success: '', loading: true })
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      setPwdStatus({ error: error.message, success: '', loading: false })
    } else {
      setPwdStatus({ error: '', success: 'Đổi mật khẩu thành công! Hãy ghi nhớ nó nhé.', loading: false })
      setNewPassword('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("💣 CẢNH BÁO MỨC ĐỘ CAO: Hành động này sẽ phế truất VĨNH VIỄN tài khoản của bạn khỏi hệ thống. Bạn có chắn chắn muốn xoá không?")) return;
    try {
      await deleteUserAccount()
      navigate('/auth')
    } catch (err) {
      alert("❌ Khóa máy chủ bảo vệ: Để nhấn được nút Này bạn phải chạy cài đặt file 'add_delete_account_rpc.sql' bên trong SQL Editor của Supabase trước.\nChi tiết bắt lỗi: " + err.message)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const initials = (fullName || user?.email || 'U').slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: 500 }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1>Cài đặt tài khoản</h1>
      </div>

      {/* Avatar */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white' }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{fullName || 'Người dùng'}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
              Tham gia: {new Date(user?.created_at).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <span className="card-title">Thông tin cá nhân</span>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullNameInput">Họ và tên</label>
            <input
              id="fullNameInput"
              className="form-input"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nhập họ và tên"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gmail</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <button id="btn-save-profile" className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* Thay đổi mật khẩu */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <span className="card-title">Thay đổi mật khẩu</span>
        </div>
        {pwdStatus.error && <div className="error-box">{pwdStatus.error}</div>}
        {pwdStatus.success && <div className="success-box">{pwdStatus.success}</div>}
        <form onSubmit={handleUpdatePassword}>
          <div className="form-group">
            <label className="form-label" htmlFor="newPasswordInput">Mật khẩu mới</label>
            <input
              id="newPasswordInput"
              type="password"
              className="form-input"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nhập ít nhất 6 ký tự..."
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white' }} disabled={pwdStatus.loading}>
            {pwdStatus.loading ? '⏳ Xin chờ...' : '🔒 Cập nhật mật khẩu'}
          </button>
        </form>
      </div>

      {/* Xóa tài khoản (Danger Zone) */}
      <div className="card" style={{ marginBottom: 14, borderColor: 'rgba(239, 68, 68, 0.4)', borderWidth: 1, borderStyle: 'solid' }}>
        <div className="card-header">
          <span className="card-title" style={{ color: 'var(--accent-red)' }}>⚠️ Vùng nguy hiểm</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          Mọi dữ liệu theo dõi Danh mục, Cổ phiếu tự sinh, Lưu trữ Chat AI của bạn sẽ bị xóa sổ hoàn toàn khỏi Hệ thống. KHÔNG THỂ KHÔI PHỤC!
        </p>
        <button className="btn" onClick={handleDeleteAccount} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}>
          🗑️ Khởi động hủy diệt Tài khoản
        </button>
      </div>

      {/* API Info */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <span className="card-title">🔑 Trạng thái API</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Supabase', key: import.meta.env.VITE_SUPABASE_URL },
            { label: 'Finnhub', key: import.meta.env.VITE_FINNHUB_API_KEY },
            { label: 'Gemini', key: import.meta.env.VITE_GEMINI_API_KEY },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
              <span className={`badge ${item.key && !item.key.startsWith('your_') ? 'badge-green' : 'badge-red'}`}>
                {item.key && !item.key.startsWith('your_') ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
        <div className="card-header">
          <span className="card-title" style={{ color: 'var(--accent-red)' }}>⚠️ Vùng nguy hiểm</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          Đăng xuất khỏi tất cả thiết bị
        </p>
        <button id="btn-signout" className="btn btn-danger" onClick={handleSignOut}>
          ↪ Đăng xuất
        </button>
      </div>
    </div>
  )
}
