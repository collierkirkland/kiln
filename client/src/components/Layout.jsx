import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout({ authStatus, setAuthStatus }) {
  const navigate = useNavigate()

  const disconnect = async () => {
    await fetch('/auth/disconnect', { method: 'POST', credentials: 'include' })
    setAuthStatus({ connected: false })
    navigate('/connect')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--kiln-surface)',
        borderRight: '1px solid var(--kiln-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid var(--kiln-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🔥</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--kiln-cream)',
              letterSpacing: '-0.02em',
            }}>Kiln</span>
          </div>
          {authStatus.shopName && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--kiln-muted)' }}>
              {authStatus.shopName}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem to="/dashboard" icon="⬡" label="Draft Queue" />
          <NavItem to="/templates" icon="◈" label="Templates" />
        </nav>

        {/* Bottom */}
        <div style={{ padding: '0 12px' }}>
          <button
            className="btn btn-ghost"
            onClick={disconnect}
            style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
          >
            Disconnect Shop
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: '40px 48px', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 'var(--radius)',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 500,
        color: isActive ? 'var(--kiln-ember)' : 'var(--kiln-text-dim)',
        background: isActive ? 'rgba(232,98,26,0.08)' : 'transparent',
        transition: 'all var(--transition)',
      })}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </NavLink>
  )
}
