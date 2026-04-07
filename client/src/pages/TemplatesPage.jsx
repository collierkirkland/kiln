import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'kiln_templates'

const CATEGORIES = ['Drinkware', 'Apparel', 'Accessories', 'Home & Living', 'Stationery', 'Other']

function loadTemplates() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

// Highlight [PLACEHOLDERS] in preview
function renderPreview(content) {
  const parts = content.split(/(\[[^\]]+\])/g)
  return parts.map((part, i) =>
    /^\[[^\]]+\]$/.test(part)
      ? <mark key={i} style={{
          background: 'rgba(232,98,26,0.18)',
          color: 'var(--kiln-ember)',
          borderRadius: 3,
          padding: '0 3px',
          fontWeight: 500,
        }}>{part}</mark>
      : <span key={i}>{part}</span>
  )
}

const STARTER_TEMPLATES = [
  {
    name: 'Classic Mug',
    category: 'Drinkware',
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
    category: 'Apparel',
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
  {
    name: 'Tote Bag',
    category: 'Accessories',
    content: `[DESIGN THEME] Tote Bag — Carry What You Love

This [DESIGN THEME] tote is as functional as it is expressive. Whether you're headed to the farmers market, the beach, or just running errands — this bag does it in style.

👜 PRODUCT DETAILS
• 100% natural cotton canvas
• Sturdy stitched handles
• Spacious main compartment
• Machine washable

🎨 ABOUT THE DESIGN
[2-3 sentences about the design and the vibe it brings]

🌿 GREAT FOR
• Grocery runs, beach days, book hauls
• Eco-conscious shoppers ditching plastic
• Gifting to the [TARGET AUDIENCE] in your life

📦 SHIPS WITHIN 3-5 BUSINESS DAYS
Printed and packed with care. Questions? We're happy to help!`,
  },
  {
    name: 'Sweatshirt / Hoodie',
    category: 'Apparel',
    content: `[DESIGN THEME] Sweatshirt — Cozy Meets Cool

Wrap yourself in comfort with this [DESIGN THEME] sweatshirt. Soft, warm, and made to be worn everywhere.

🧥 PRODUCT DETAILS
• Premium fleece blend (50% cotton / 50% polyester)
• Relaxed unisex fit
• Ribbed cuffs and waistband
• Available in crew and hoodie styles
• DTG printed for lasting vibrancy

🎨 ABOUT THE DESIGN
[2-3 sentences about the design, who it's for, and what makes it special]

❄️ PERFECT FOR
• Cooler weather and cozy days in
• Gifting to [TARGET AUDIENCE]
• Anyone who takes their comfort seriously

📦 SHIPS WITHIN 3-5 BUSINESS DAYS
Size guide in photos. Runs true to size. Questions? Just ask!`,
  },
  {
    name: 'Poster / Print',
    category: 'Home & Living',
    content: `[DESIGN THEME] Art Print — Wall-Ready & Frame-Worthy

Transform your space with this [DESIGN THEME] art print. Crisp, vibrant, and designed to make a statement.

🖼 PRODUCT DETAILS
• Available in multiple sizes (8x10, 11x14, 16x20)
• Printed on premium matte paper
• Ships flat in a protective sleeve
• Frame not included

🎨 ABOUT THE DESIGN
[2-3 sentences about the design, its mood, and the aesthetic it brings to a room]

🏡 PERFECT FOR
• Living rooms, bedrooms, offices, and studios
• Housewarming and holiday gifts
• [TARGET AUDIENCE] who loves [THEME/STYLE] art

📦 SHIPS WITHIN 3-5 BUSINESS DAYS
Arrives flat and ready to frame. Questions? Message us anytime!`,
  },
  {
    name: 'Sticker',
    category: 'Stationery',
    content: `[DESIGN THEME] Sticker — Stick It Everywhere

This [DESIGN THEME] sticker is made for laptops, water bottles, journals, and anywhere else you want to show off your style.

✦ PRODUCT DETAILS
• Durable vinyl with UV-resistant ink
• Waterproof and scratch-resistant
• Kiss-cut for easy peeling
• Available in multiple sizes

🎨 ABOUT THE DESIGN
[1-2 sentences about the design and its personality]

💻 STICK IT ON
• Laptops, phone cases, hydro flasks
• Planners, journals, skateboards
• Anywhere that needs a little [THEME/VIBE] energy

📦 SHIPS WITHIN 2-3 BUSINESS DAYS
Lightweight and ships fast. Stock up — they make great gifts!`,
  },
  {
    name: 'Phone Case',
    category: 'Accessories',
    content: `[DESIGN THEME] Phone Case — Protect Your Phone in Style

Why settle for boring when your phone case can say something? This [DESIGN THEME] case keeps your phone safe and your aesthetic intact.

📱 PRODUCT DETAILS
• Available for iPhone and Samsung Galaxy models
• Slim profile with full camera cutout
• Shock-absorbent TPU material
• Printed wrap-around design

🎨 ABOUT THE DESIGN
[2 sentences about the design and who it's made for]

✅ WHY YOU'LL LOVE IT
• Slim enough for your pocket, sturdy enough for real life
• Vivid print that won't fade
• Great gift for [TARGET AUDIENCE]

📦 SHIPS WITHIN 3-5 BUSINESS DAYS
Select your model from the dropdown. Questions? We've got you!`,
  },
  {
    name: 'Pillow / Cushion',
    category: 'Home & Living',
    content: `[DESIGN THEME] Throw Pillow — Comfort Meets Character

Add a pop of personality to your couch, bed, or reading nook with this [DESIGN THEME] throw pillow.

🛋 PRODUCT DETAILS
• Available in 14x14, 16x16, and 18x18 inch sizes
• Soft spun polyester cover
• Double-sided print
• Hidden zipper closure
• Insert included

🎨 ABOUT THE DESIGN
[2-3 sentences about the design, its mood, and what spaces it suits best]

🏡 PERFECT FOR
• Living rooms, bedrooms, and cozy corners
• Housewarming, birthday, and holiday gifts
• [TARGET AUDIENCE] who loves [THEME/STYLE] décor

📦 SHIPS WITHIN 3-5 BUSINESS DAYS
Arrives ready to fluff. Questions? Message us anytime!`,
  },
]

const CATEGORY_COLORS = {
  'Drinkware':     { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd' },
  'Apparel':       { bg: 'rgba(168,85,247,0.12)', color: '#c4b5fd' },
  'Accessories':   { bg: 'rgba(234,179,8,0.12)',  color: '#fde047' },
  'Home & Living': { bg: 'rgba(34,197,94,0.12)',  color: '#86efac' },
  'Stationery':    { bg: 'rgba(236,72,153,0.12)', color: '#f9a8d4' },
  'Other':         { bg: 'rgba(100,116,139,0.12)',color: '#94a3b8' },
}

function CategoryBadge({ category }) {
  const style = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: 20,
      background: style.bg,
      color: style.color,
      letterSpacing: '0.04em',
    }}>{category}</span>
  )
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'Other', content: '' })
  const [previewId, setPreviewId] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { setTemplates(loadTemplates()) }, [])

  const persist = (updated) => {
    setTemplates(updated)
    saveTemplates(updated)
  }

  const startNew = () => {
    setForm({ name: '', category: 'Other', content: '' })
    setEditing('new')
    setPreviewId(null)
  }

  const startEdit = (t) => {
    setForm({ name: t.name, category: t.category || 'Other', content: t.content })
    setEditing(t.id)
    setPreviewId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = () => {
    if (!form.name.trim() || !form.content.trim()) return
    if (editing === 'new') {
      persist([...templates, { id: Date.now().toString(), ...form }])
    } else {
      persist(templates.map(t => t.id === editing ? { ...t, ...form } : t))
    }
    setEditing(null)
  }

  const duplicate = (t) => {
    const copy = { ...t, id: Date.now().toString(), name: `${t.name} (copy)` }
    persist([...templates, copy])
  }

  const remove = (id) => {
    persist(templates.filter(t => t.id !== id))
    setConfirmDelete(null)
  }

  const move = (id, dir) => {
    const idx = templates.findIndex(t => t.id === id)
    const next = idx + dir
    if (next < 0 || next >= templates.length) return
    const arr = [...templates]
    ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
    persist(arr)
  }

  const addStarter = (starter) => {
    const already = templates.some(t => t.name === starter.name)
    if (already) return
    persist([...templates, { id: Date.now().toString(), ...starter }])
  }

  const filteredTemplates = filterCategory === 'All'
    ? templates
    : templates.filter(t => (t.category || 'Other') === filterCategory)

  const usedCategories = [...new Set(templates.map(t => t.category || 'Other'))]

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--kiln-cream)', marginBottom: 6 }}>
            Templates
          </h1>
          <p style={{ color: 'var(--kiln-muted)', fontSize: 14 }}>
            {templates.length} template{templates.length !== 1 ? 's' : ''} · Claude fills in the [PLACEHOLDERS] from your listing
          </p>
        </div>
        <button className="btn btn-primary" onClick={startNew}>+ New Template</button>
      </div>

      {/* Editor */}
      {editing !== null && (
        <div className="card ember-glow fade-in" style={{ marginBottom: 28, borderColor: 'rgba(232,98,26,0.3)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--kiln-cream)', marginBottom: 20 }}>
            {editing === 'new' ? '✦ New Template' : '✦ Edit Template'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
              <div>
                <label>Template Name</label>
                <input
                  placeholder="e.g. Classic Mug, Unisex Tee, Tote Bag..."
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: 160 }}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label>
                Description Template
                <span style={{ color: 'var(--kiln-muted)', marginLeft: 8, textTransform: 'none', fontSize: 12, fontWeight: 400 }}>
                  Use <code style={{ color: 'var(--kiln-ember)', background: 'rgba(232,98,26,0.1)', padding: '1px 5px', borderRadius: 3 }}>[PLACEHOLDERS]</code> where Claude should fill in specifics
                </span>
              </label>
              <textarea
                placeholder={`✨ [DESIGN THEME] Mug — Perfect for [TARGET AUDIENCE]\n\n☕ PRODUCT DETAILS\n• [DETAIL 1]\n...`}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                style={{ minHeight: 300, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }}
              />
              <div style={{ fontSize: 11, color: 'var(--kiln-muted)', marginTop: 6 }}>
                {form.content.length} chars · {(form.content.match(/\[[^\]]+\]/g) || []).length} placeholder{(form.content.match(/\[[^\]]+\]/g) || []).length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Live preview */}
            {form.content && (
              <div>
                <label>Preview</label>
                <div style={{
                  background: 'var(--kiln-bg)',
                  border: '1px solid var(--kiln-border)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 16px',
                  fontSize: 13,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  maxHeight: 200,
                  overflowY: 'auto',
                  color: 'var(--kiln-text)',
                }}>
                  {renderPreview(form.content)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={save}
                disabled={!form.name.trim() || !form.content.trim()}>
                Save Template
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {templates.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['All', ...usedCategories].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                border: '1px solid',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                borderColor: filterCategory === cat ? 'var(--kiln-ember)' : 'var(--kiln-border)',
                background: filterCategory === cat ? 'rgba(232,98,26,0.1)' : 'transparent',
                color: filterCategory === cat ? 'var(--kiln-ember)' : 'var(--kiln-muted)',
                transition: 'all var(--transition)',
              }}
            >{cat}</button>
          ))}
        </div>
      )}

      {/* Template list */}
      {templates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
          {filteredTemplates.map((t, idx) => (
            <div key={t.id}>
              <div className="card fade-in" style={{
                borderColor: previewId === t.id ? 'rgba(232,98,26,0.25)' : 'var(--kiln-border)',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Reorder buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2, flexShrink: 0 }}>
                    <button onClick={() => move(t.id, -1)} disabled={idx === 0}
                      style={{ background: 'none', border: 'none', color: idx === 0 ? 'var(--kiln-border)' : 'var(--kiln-muted)', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 12, lineHeight: 1, padding: '2px 4px' }}>▲</button>
                    <button onClick={() => move(t.id, 1)} disabled={idx === filteredTemplates.length - 1}
                      style={{ background: 'none', border: 'none', color: idx === filteredTemplates.length - 1 ? 'var(--kiln-border)' : 'var(--kiln-muted)', cursor: idx === filteredTemplates.length - 1 ? 'default' : 'pointer', fontSize: 12, lineHeight: 1, padding: '2px 4px' }}>▼</button>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--kiln-cream)' }}>{t.name}</span>
                      <CategoryBadge category={t.category || 'Other'} />
                      <span style={{ fontSize: 11, color: 'var(--kiln-border)', marginLeft: 'auto' }}>
                        {(t.content.match(/\[[^\]]+\]/g) || []).length} placeholders
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--kiln-muted)', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.content.slice(0, 100)}...
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => setPreviewId(previewId === t.id ? null : t.id)}>
                      {previewId === t.id ? 'Hide' : 'Preview'}
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => startEdit(t)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => duplicate(t)} title="Duplicate">⧉</button>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, color: '#fca5a5' }}
                      onClick={() => setConfirmDelete(t.id)}>✕</button>
                  </div>
                </div>

                {/* Inline preview */}
                {previewId === t.id && (
                  <div className="fade-in" style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid var(--kiln-border)',
                    fontSize: 13,
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--kiln-text)',
                    maxHeight: 320,
                    overflowY: 'auto',
                  }}>
                    {renderPreview(t.content)}
                  </div>
                )}

                {/* Delete confirm */}
                {confirmDelete === t.id && (
                  <div className="fade-in" style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid var(--kiln-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 13,
                    color: 'var(--kiln-muted)',
                  }}>
                    <span>Delete <strong style={{ color: 'var(--kiln-text)' }}>{t.name}</strong>? This can't be undone.</span>
                    <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12, color: '#fca5a5', borderColor: 'rgba(252,165,165,0.3)' }}
                      onClick={() => remove(t.id)}>Delete</button>
                    <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}
                      onClick={() => setConfirmDelete(null)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {templates.length === 0 && editing === null && (
        <div className="card" style={{ textAlign: 'center', padding: 52, marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--kiln-cream)', marginBottom: 8 }}>No templates yet</h3>
          <p style={{ color: 'var(--kiln-muted)', fontSize: 14, marginBottom: 20 }}>
            Create a template for each product type — or grab one from the starters below.
          </p>
          <button className="btn btn-primary" onClick={startNew}>Create Your First Template</button>
        </div>
      )}

      {/* Starter templates */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--kiln-cream)', marginBottom: 4 }}>
            Starter Templates
          </h2>
          <p style={{ color: 'var(--kiln-muted)', fontSize: 13 }}>
            8 POD-ready templates to get you going. Customize them to match your brand voice.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {STARTER_TEMPLATES.map(s => {
            const already = templates.some(t => t.name === s.name)
            return (
              <div key={s.name} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                opacity: already ? 0.5 : 1,
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--kiln-cream)' }}>{s.name}</span>
                    <CategoryBadge category={s.category} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--kiln-muted)', lineHeight: 1.5 }}>
                    {s.content.slice(0, 80)}...
                  </div>
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 12, justifyContent: 'center' }}
                  onClick={() => addStarter(s)}
                  disabled={already}
                >
                  {already ? '✓ Already added' : '+ Add to My Templates'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
