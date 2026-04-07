import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function ConnectPage() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background texture */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(232,98,26,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(212,168,67,0.04) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      <div className="fade-in" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        {/* Logo mark */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🔥</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 48,
            fontWeight: 900,
            color: 'var(--kiln-cream)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 8,
          }}>Kiln</h1>
          <p style={{
            color: 'var(--kiln-muted)',
            fontSize: 15,
            fontStyle: 'italic',
            fontFamily: 'var(--font-display)',
          }}>Fire your listings.</p>
        </div>

        {/* Card */}
        <div className="card ember-glow" style={{ padding: 36 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            marginBottom: 10,
            color: 'var(--kiln-cream)',
          }}>Connect Your Etsy Shop</h2>
          <p style={{ color: 'var(--kiln-text-dim)', fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
            Kiln reads your draft listings and uses AI to generate optimized titles, descriptions, and tags — then pushes them back to Etsy in one click.
          </p>

          {error && (
            <div style={{
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 'var(--radius)',
              padding: '10px 14px',
              marginBottom: 20,
              fontSize: 13,
              color: '#fca5a5',
            }}>
              Authentication failed. Please try again.
            </div>
          )}

          <a
            href="/auth/etsy"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px 24px' }}
          >
            <span>Connect with Etsy</span>
            <span style={{ fontSize: 18 }}>→</span>
          </a>

          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--kiln-muted)', lineHeight: 1.6 }}>
            Kiln only requests access to read and update your listings. We never access payment information.
          </div>
        </div>

        {/* Features */}
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { icon: '✦', label: 'Draft Queue', desc: 'See all your drafts at once' },
            { icon: '◈', label: 'Templates', desc: 'Reusable formats per product type' },
            { icon: '⚡', label: 'One Click', desc: 'Generate & push back to Etsy' },
          ].map(f => (
            <div key={f.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6, color: 'var(--kiln-ember)' }}>{f.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--kiln-text)', marginBottom: 3 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'var(--kiln-muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
