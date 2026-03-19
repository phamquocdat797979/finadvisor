import React from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../services/supabase'

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/portfolio', icon: '💼', label: 'Danh mục' },
  { path: '/market', icon: '📰', label: 'Thị trường' },
  { path: '/assistant', icon: '🤖', label: 'AI Advisor' },
]

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Tổng quan tài chính của bạn' },
  '/portfolio': { title: 'Danh mục đầu tư', sub: 'Quản lý cổ phiếu nắm giữ' },
  '/market': { title: 'Thị trường', sub: 'Tin tức và dữ liệu thị trường' },
  '/assistant': { title: 'AI Advisor', sub: 'Trợ lý tài chính thông minh' },
  '/settings': { title: 'Cài đặt', sub: 'Quản lý tài khoản' },
}

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const currentPage = pageTitles[location.pathname] || { title: 'FinAdvisor', sub: '' }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (err) {
      console.error(err)
    }
  }

  const email = user?.email || ''
  const displayName = user?.user_metadata?.full_name || email.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">FA</div>
          <div className="sidebar-logo-text">Fin<span>Advisor</span></div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="nav-section-label" style={{ marginTop: 12 }}>Tài khoản</div>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">⚙️</span>
            Cài đặt
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" onClick={handleSignOut} title="Đăng xuất">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="user-name">{displayName}</div>
              <div className="user-email">{email}</div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>↪</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content">
        <header className="header">
          <div className="header-title">
            <h2>{currentPage.title}</h2>
            <p>{currentPage.sub}</p>
          </div>
          <div className="header-actions">
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
