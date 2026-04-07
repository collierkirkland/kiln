import React, { useState, useEffect } from 'react'
import ListingCard from '../components/ListingCard.jsx'

export default function DashboardPage() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDrafts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/listings/drafts', { credentials: 'include' })
      const data = await res.json()
      if (data.results) {
        setDrafts(data.results)
      } else {
        setError('Could not load drafts.')
      }
    } catch {
      setError('Failed to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDrafts() }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--kiln-cream)',
            marginBottom: 6,
          }}>Draft Queue</h1>
          <p style={{ color: 'var(--kiln-muted)', fontSize: 14 }}>
            {loading ? 'Loading your drafts...' : `${drafts.length} draft listing${drafts.length !== 1 ? 's' : ''} ready to fire`}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={fetchDrafts} disabled={loading}>
          {loading ? <span className="spinner" /> : '↻'} Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="card" style={{
          borderColor: 'rgba(220,38,38,0.3)',
          background: 'rgba(220,38,38,0.05)',
          color: '#fca5a5',
          textAlign: 'center',
          padding: 40,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
          <div>{error}</div>
          <button className="btn btn-ghost" onClick={fetchDrafts} style={{ marginTop: 16 }}>Try Again</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && drafts.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--kiln-cream)', marginBottom: 8 }}>
            No draft listings found
          </h3>
          <p style={{ color: 'var(--kiln-muted)', fontSize: 14 }}>
            Create some draft listings in Etsy and they'll appear here ready to generate.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: 120, opacity: 0.4 }}>
              <div style={{ background: 'var(--kiln-border)', borderRadius: 4, height: 16, width: '40%', marginBottom: 12 }} />
              <div style={{ background: 'var(--kiln-border)', borderRadius: 4, height: 12, width: '60%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Listing cards */}
      {!loading && !error && drafts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {drafts.map(listing => (
            <ListingCard key={listing.listing_id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
