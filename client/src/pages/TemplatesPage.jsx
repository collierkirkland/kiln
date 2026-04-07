import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'kiln_templates'

function loadTemplates() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

const STARTER_TEMPLATES = [
  {
    name: 'Classic Mug',
    content: `✨ [DESIGN THEME] Mug — The Perfect Gift for [TARGET AUDIENCE]

Looking for a gift that's both practical and personal? This [DESIGN THEME] coffee mug is made for the [TARGET AUDIENCE] in your life who deserves something special.

☕ PRODUCT DETAILS
• 11oz ceramic mug (15oz available)
• Dishwasher & microwave safe
• Vibrant, fade-resistant print
• Printed and shipped in the USA

🎨 ABOUT THE DESIGN
[2-3 sentences about the design concept and what makes it special]

🎁 PERFECT FOR
• Birthdays, holidays, and everyday gifting
• Coffee lovers, tea drinkers, and hot cocoa fans
• Anyone who appreciates [THEME/VIBE] humor/art/style

📦 SHIPPING
Ships within 3-5 business days. Arrives in a protective box — gift-ready!

Questions? Message us anytime. We love our customers! 🔥`,
  },
  {
    name: 'Unisex T-Shirt',
    content: `[DESIGN THEME] Shirt — Wear What You Love

Express yourself with this [DESIGN THEME] tee, designed for everyday comfort and lasting style.

👕 PRODUCT DETAILS
• Unisex sizing (true to size)
• Soft, pre-shrunk cotton blend
• Lightweight and breathable
• Available in multiple colors
• Printed using direct-to-garment (DTG) technology

🎨 ABOUT THE DESIGN
[2-3 sentences about the design, its inspiration, and who it's for]

✅ WHY YOU'LL LOVE IT
• Soft straight out of the package
• Colors stay vibrant wash after wash
• Great as a gift or a treat for yourself

📦 SHIPS WITHIN 3-5 BUSINESS DAYS
Each shirt is printed on demand just for you.

Size guide available in photos. Questions? Just ask!`,
  },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [editing, setEditing] = useState(null) // null | 'new' | id
  const [form, setForm] = useState({ name: '', content: '' })

  useEffect(() => {
    setTemplates(loadTemplates())
  }, [])

  const startNew = () => {
    setForm({ name: '', content: '' })
    setEditing('new')
  }

  const startEdit = (t) => {
    setForm({ name: t.name, content: t.content })
    setEditing(t.id)
  }

  const save = () => {
    if (!form.name.trim() || !form.content.trim()) return
    let updated
    if (editing === 'new') {
      const newTemplate = { id: Date.now().toString(), name: form.name.trim(), content: form.content.trim() }
      updated = [...templates, newTemplate]
    } else {
      updated = templates.map(t => t.id === editing ? { ...t, ...form } : t)
    }
    setTemplates(updated)
    saveTemplates(updated)
    setEditing(null)
  }

  const remove = (id) => {
    const updated = templates.filter(t => t.id !== id)
    setTemplates(updated)
    saveTemplates(updated)
  }

  const addStarter = (starter) => {
    const newTemplate = { id: Date.now().toString(), name: starter.name, content: starter.content }
    const updated = [...templates, newTemplate]
    setTemplates(updated)
    saveTemplates(updated)
  }

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
          }}>Templates</h1>
          <p style={{ color: 'var(--kiln-muted)', fontSize: 14 }}>
            Reusable description formats per product type. Claude fills in the details.
          </p>
        </div>
        <button className="btn btn-primary" onClick={startNew}>
          + New Template
        </button>
      </div>

      {/* Editor */}
      {editing !== null && (
        <div className="card ember-glow fade-in" style={{ marginBottom: 24, borderColor: 'rgba(232,98,26,0.3)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--kiln-cream)', marginBottom: 20 }}>
            {editing === 'new' ? 'New Template' : 'Edit Template'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Template Name</label>
              <input
                placeholder="e.g. Classic Mug, Unisex Tee, Tote Bag..."
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label>Description Template</label>
              <p style={{ fontSize: 12, color: 'var(--kiln-muted)', marginBottom: 8 }}>
                Write your template structure. Use <code style={{ color: 'var(--kiln-ember)', background: 'rgba(232,98,26,0.1)', padding: '1px 5px', borderRadius: 3 }}>[PLACEHOLDERS]</code> where Claude should fill in specifics.
              </p>
              <textarea
                placeholder="✨ [DESIGN THEME] Mug — Perfect for [TARGET AUDIENCE]..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                style={{ minHeight: 280, fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={save}>Save Template</button>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Existing templates */}
      {templates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {templates.map(t => (
            <div key={t.id} className="card fade-in" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  color: 'var(--kiln-cream)',
                  marginBottom: 6,
                }}>{t.name}</div>
                <div style={{
                  fontSize: 13,
                  color: 'var(--kiln-muted)',
                  whiteSpace: 'pre-line',
                  maxHeight: 60,
                  overflow: 'hidden',
                  lineHeight: 1.5,
                }}>
                  {t.content.slice(0, 120)}{t.content.length > 120 ? '...' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => startEdit(t)}>
                  Edit
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '7px 14px', fontSize: 13, color: '#fca5a5' }}
                  onClick={() => remove(t.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state + starters */}
      {templates.length === 0 && editing === null && (
        <div className="card" style={{ textAlign: 'center', padding: 48, marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--kiln-cream)', marginBottom: 8 }}>
            No templates yet
          </h3>
          <p style={{ color: 'var(--kiln-muted)', fontSize: 14, marginBottom: 20 }}>
            Create a template for each product type you sell — mugs, shirts, totes, etc.
          </p>
          <button className="btn btn-primary" onClick={startNew}>Create Your First Template</button>
        </div>
      )}

      {/* Starter templates */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          color: 'var(--kiln-cream)',
          marginBottom: 6,
        }}>Starter Templates</h2>
        <p style={{ color: 'var(--kiln-muted)', fontSize: 13, marginBottom: 16 }}>
          Add these as a starting point and customize to match your brand voice.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {STARTER_TEMPLATES.map(s => (
            <div key={s.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--kiln-cream)', marginBottom: 6 }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--kiln-muted)', lineHeight: 1.5 }}>
                  {s.content.slice(0, 100)}...
                </div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, justifyContent: 'center' }}
                onClick={() => addStarter(s)}
              >
                + Add to My Templates
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
