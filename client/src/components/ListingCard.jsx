import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'kiln_templates'

function getTemplates() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export default function ListingCard({ listing }) {
  const [expanded, setExpanded] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [generated, setGenerated] = useState(null)
  const [edited, setEdited] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templates, setTemplates] = useState([])
  const [imageUrl, setImageUrl] = useState(null)
  const [pushSuccess, setPushSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setTemplates(getTemplates())
  }, [expanded])

  useEffect(() => {
    if (listing.images && listing.images.length > 0) {
      setImageUrl(listing.images[0].url_570xN || listing.images[0].url_fullxfull)
    } else if (expanded) {
      // Fetch images if not included
      fetch(`/api/listings/${listing.listing_id}/images`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            setImageUrl(data.results[0].url_570xN || data.results[0].url_fullxfull)
          }
        })
        .catch(() => {})
    }
  }, [expanded, listing])

  const generate = async () => {
    setGenerating(true)
    setError(null)
    setGenerated(null)
    setEdited(null)
    setPushSuccess(false)

    const template = templates.find(t => t.id === selectedTemplate)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing,
          template: template?.content || null,
          imageUrl,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setGenerated(data.generated)
        setEdited(data.generated)
      } else {
        setError(data.error || 'Generation failed')
      }
    } catch {
      setError('Failed to reach server')
    } finally {
      setGenerating(false)
    }
  }

  const pushToEtsy = async () => {
    if (!edited) return
    setPushing(true)
    setError(null)
    try {
      const res = await fetch(`/api/listings/${listing.listing_id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: edited.title,
          description: edited.description,
          tags: edited.tags,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPushSuccess(true)
      } else {
        setError(data.error || 'Update failed')
      }
    } catch {
      setError('Failed to push to Etsy')
    } finally {
      setPushing(false)
    }
  }

  const price = listing.price
    ? `$${(listing.price.amount / listing.price.divisor).toFixed(2)}`
    : null

  return (
    <div className={`card fade-in ${expanded ? 'ember-glow' : ''}`} style={{
      transition: 'all 0.2s ease',
      borderColor: expanded ? 'rgba(232,98,26,0.25)' : 'var(--kiln-border)',
    }}>
      {/* Listing header — always visible */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Thumbnail */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 4,
          background: 'var(--kiln-surface-2)',
          overflow: 'hidden',
          flexShrink: 0,
          border: '1px solid var(--kiln-border)',
        }}>
          {imageUrl && (
            <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            color: 'var(--kiln-cream)',
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {listing.title || 'Untitled Draft'}
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--kiln-muted)' }}>
            {price && <span>{price}</span>}
            {listing.taxonomy_path && <span>{listing.taxonomy_path[listing.taxonomy_path.length - 1]}</span>}
            {pushSuccess && <span style={{ color: '#6ee7b7' }}>✓ Pushed to Etsy</span>}
          </div>
        </div>

        {/* Expand toggle */}
        <div style={{
          color: 'var(--kiln-muted)',
          fontSize: 18,
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>
          ⌄
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--kiln-border)' }}>

          {/* Template selector + Generate */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>Product Template</label>
              <select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
              >
                <option value="">— No template (free form) —</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={generate}
              disabled={generating}
              style={{ flexShrink: 0, minWidth: 140 }}
            >
              {generating
                ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating...</>
                : <><span>🔥</span> Generate</>
              }
            </button>
          </div>

          {templates.length === 0 && (
            <div style={{
              fontSize: 12,
              color: 'var(--kiln-muted)',
              marginBottom: 16,
              fontStyle: 'italic',
            }}>
              No templates yet. <a href="/templates" style={{ color: 'var(--kiln-ember)' }}>Create one →</a>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 'var(--radius)',
              padding: '10px 14px',
              fontSize: 13,
              color: '#fca5a5',
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Generated content editor */}
          {edited && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label>Title <span style={{ color: 'var(--kiln-muted)' }}>({edited.title?.length || 0}/140)</span></label>
                <input
                  value={edited.title || ''}
                  onChange={e => setEdited(prev => ({ ...prev, title: e.target.value }))}
                  maxLength={140}
                />
              </div>

              <div>
                <label>Description</label>
                <textarea
                  value={edited.description || ''}
                  onChange={e => setEdited(prev => ({ ...prev, description: e.target.value }))}
                  style={{ minHeight: 200 }}
                />
              </div>

              <div>
                <label>Tags <span style={{ color: 'var(--kiln-muted)' }}>({edited.tags?.length || 0}/13)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {(edited.tags || []).map((tag, i) => (
                    <span key={i} className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {tag}
                      <button
                        onClick={() => setEdited(prev => ({
                          ...prev,
                          tags: prev.tags.filter((_, ti) => ti !== i)
                        }))}
                        style={{ background: 'none', border: 'none', color: 'var(--kiln-muted)', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}
                      >×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button
                  className="btn btn-success"
                  onClick={pushToEtsy}
                  disabled={pushing || pushSuccess}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {pushing
                    ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Pushing...</>
                    : pushSuccess
                      ? '✓ Pushed to Etsy!'
                      : '⬆ Push to Etsy'
                  }
                </button>
                <button className="btn btn-ghost" onClick={generate} disabled={generating}>
                  ↻ Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
