import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['Musicians / Artists', 'Actors / Actresses', 'Athletes / Sports Stars', 'Content Creators / Influencers']
const AVAILABILITIES = ['Available', 'Limited', 'Booked Out']

const EMPTY = {
  name: '', category: 'Musicians / Artists', genre: '', location: '',
  bio: '', followers: '', tags: '',
  price: { meetup: '', event: '', fancard: '' },
  availability: 'Available',
  upcomingDates: [],   // [{ date: '', location: '' }]
  image: '',
}

export default function CelebForm() {
  const { id } = useParams()
  const isEdit = !!id
  const { API } = useAdminAuth()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [form, setForm] = useState(EMPTY)
  const [imagePreview, setImagePreview] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    API.get(`/admin/celebs/${id}`)
      .then(r => {
        const c = r.data.celeb
        setForm({ ...c, tags: c.tags?.join(', ') || '', upcomingDates: c.upcomingDates ?? [] })
        setImagePreview(c.image)
      })
      .catch(() => {
        toast.error('Failed to load celebrity data.')
        navigate('/celebrities')
      })
      .finally(() => setLoading(false))
  }, [id])

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const setPrice = (k, v) => setForm(prev => ({ ...prev, price: { ...prev.price, [k]: v } }))

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB.')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())     return toast.error('Celebrity name is required.')
    if (!form.genre.trim())    return toast.error('Genre is required.')
    if (!form.location.trim()) return toast.error('Location is required.')
    if (!form.bio.trim())      return toast.error('Bio is required.')
    if (!form.price.meetup || !form.price.event || !form.price.fancard) return toast.error('All price values are required.')
    if (!imagePreview && !isEdit) return toast.error('Please upload a celebrity image.')

    setSaving(true)
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'upcomingDates') {
          payload.append('upcomingDates', JSON.stringify(v))
        } else if (k === 'price') {
          payload.append('price[meetup]',  v.meetup)
          payload.append('price[event]',   v.event)
          payload.append('price[fancard]', v.fancard)
        } else {
          payload.append(k, v)
        }
      })
      if (imageFile) payload.append('image', imageFile)

      if (isEdit) {
        await API.put(`/admin/celebs/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success(`${form.name} updated successfully!`)
      } else {
        await API.post('/admin/celebs', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success(`${form.name} added to platform!`)
      }
      navigate('/celebrities')
    } catch {
      toast.error(isEdit ? 'Failed to update celebrity.' : 'Failed to add celebrity.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
      <div style={{ fontSize: 32, color: '#C9A96E', animation: 'spin 1s linear infinite' }}>◈</div>
    </div>
  )

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => navigate('/celebrities')} className="btn-ghost" style={{ fontSize: 13, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9 }}>← Back</button>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontStyle: 'italic', color: '#F0EDF8' }}>{isEdit ? 'Edit Celebrity' : 'Add New Celebrity'}</h1>
          <p style={{ color: '#3d3a50', fontSize: 13, marginTop: 2 }}>{isEdit ? `Editing ${form.name}` : 'Fill in all details for the new celebrity'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="celebform-grid">

          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Basic Info */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 className="section-title" style={{ marginBottom: 20 }}>Basic Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label-admin">Celebrity Name *</label>
                  <input className="input-admin" placeholder="e.g. Aria Solenne" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label className="label-admin">Category *</label>
                  <select className="input-admin" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-admin">Genre / Specialty *</label>
                  <input className="input-admin" placeholder="e.g. R&B · Soul" value={form.genre} onChange={e => set('genre', e.target.value)} />
                </div>
                <div>
                  <label className="label-admin">Location *</label>
                  <input className="input-admin" placeholder="e.g. Los Angeles, CA" value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
                <div>
                  <label className="label-admin">Followers</label>
                  <input className="input-admin" placeholder="e.g. 42.3M" value={form.followers} onChange={e => set('followers', e.target.value)} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label-admin">Bio *</label>
                  <textarea className="input-admin" placeholder="Write a compelling bio for this celebrity…" value={form.bio} onChange={e => set('bio', e.target.value)} style={{ minHeight: 110 }} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label-admin">Tags (comma-separated)</label>
                  <input className="input-admin" placeholder="Grammy Winner, World Tour 2025, Top 10 Artist" value={form.tags} onChange={e => set('tags', e.target.value)} />
                  <p style={{ fontSize: 11, color: '#3d3a50', marginTop: 5 }}>These appear as badge pills on the celebrity profile.</p>
                </div>
              </div>
            </div>

            {/* RazorGold Points */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 className="section-title" style={{ marginBottom: 6 }}>Pricing (USD)</h2>
              <p style={{ color: '#3d3a50', fontSize: 13, marginBottom: 18 }}>Set the dollar price for each booking type. Fans redeem with their RazorGold card code.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[{ key: 'meetup', label: 'Meetup', icon: '⬡', desc: '1-on-1 session' }, { key: 'event', label: 'Event', icon: '◆', desc: 'VIP appearance' }, { key: 'fancard', label: 'Fan Card', icon: '◇', desc: 'Digital collectible' }].map(t => (
                  <div key={t.key} style={{ background: 'rgba(61,139,94,0.04)', border: '1px solid rgba(61,139,94,0.15)', borderRadius: 12, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <span style={{ color: '#C9A96E', fontSize: 14 }}>{t.icon}</span>
                      <div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 14, color: '#F0EDF8' }}>{t.label}</div>
                        <div style={{ fontSize: 10, color: '#3d3a50' }}>{t.desc}</div>
                      </div>
                    </div>
                    <label className="label-admin">Price (USD) *</label>
                    <input
                      className="input-admin"
                      type="number"
                      min="1"
                      placeholder="e.g. 1200"
                      value={form.price[t.key]}
                      onChange={e => setPrice(t.key, e.target.value)}
                      style={{ color: '#C9A96E', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 16 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 className="section-title" style={{ marginBottom: 6 }}>Booking Schedule</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 18 }}>
                Add available dates with their specific location. Fans will pick from these when booking.
              </p>

              {/* Date+Location rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                {form.upcomingDates.map((slot, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                    <div>
                      {i === 0 && <label className="label-admin" style={{ marginBottom: 4 }}>Date</label>}
                      <input
                        type="date"
                        className="input-admin"
                        value={slot.date}
                        onChange={e => {
                          const updated = [...form.upcomingDates]
                          updated[i] = { ...updated[i], date: e.target.value }
                          set('upcomingDates', updated)
                        }}
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                    <div>
                      {i === 0 && <label className="label-admin" style={{ marginBottom: 4 }}>Location</label>}
                      <input
                        className="input-admin"
                        placeholder="e.g. Lagos, Nigeria"
                        value={slot.location}
                        onChange={e => {
                          const updated = [...form.upcomingDates]
                          updated[i] = { ...updated[i], location: e.target.value }
                          set('upcomingDates', updated)
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => set('upcomingDates', form.upcomingDates.filter((_, idx) => idx !== i))}
                      style={{ background: 'rgba(224,107,107,0.1)', border: '1px solid rgba(224,107,107,0.25)', borderRadius: 8, color: 'var(--red)', width: 36, height: 36, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: i === 0 ? 22 : 0 }}
                      title="Remove"
                    >✕</button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => set('upcomingDates', [...form.upcomingDates, { date: '', location: '' }])}
                className="btn-outline"
                style={{ width: '100%', padding: '10px', fontSize: 13 }}
              >
                + Add Date & Location
              </button>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Image upload */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 className="section-title" style={{ marginBottom: 18 }}>Celebrity Photo</h2>
              {/* Preview */}
              <div
                onClick={() => fileRef.current?.click()}
                style={{ width: '100%', aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden', border: imagePreview ? '2px solid rgba(201,169,110,0.3)' : '2px dashed rgba(201,169,110,0.2)', background: imagePreview ? 'transparent' : 'rgba(201,169,110,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', marginBottom: 14 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = imagePreview ? 'rgba(201,169,110,0.3)' : 'rgba(201,169,110,0.2)'}
              >
                {imagePreview
                  ? <>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                        <span style={{ fontSize: 13, color: '#F0EDF8', opacity: 0 }} className="change-hint">Change Photo</span>
                      </div>
                    </>
                  : <div style={{ textAlign: 'center', padding: '20px' }}>
                      <div style={{ fontSize: 36, color: '#C9A96E', marginBottom: 10, opacity: 0.5 }}>📷</div>
                      <p style={{ color: '#3d3a50', fontSize: 13 }}>Click to upload photo</p>
                      <p style={{ color: '#2a2838', fontSize: 11, marginTop: 4 }}>JPG, PNG, WebP · Max 5MB</p>
                    </div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline" style={{ width: '100%', padding: '10px', fontSize: 13 }}>
                {imagePreview ? '↑ Change Photo' : '↑ Upload Photo'}
              </button>
              <p style={{ fontSize: 11, color: '#3d3a50', marginTop: 8, textAlign: 'center' }}>Recommended: Portrait ratio (3:4), min 600×800px</p>
            </div>

            {/* Availability */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Availability Status</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {AVAILABILITIES.map(a => (
                  <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: form.availability === a ? 'rgba(61,139,94,0.08)' : 'rgba(255,255,255,0.02)', border: form.availability === a ? '1px solid rgba(61,139,94,0.4)' : '1px solid rgba(255,255,255,0.05)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input type="radio" name="availability" value={a} checked={form.availability === a} onChange={() => set('availability', a)} style={{ accentColor: '#C9A96E' }} />
                    <div>
                      <div style={{ fontSize: 14, color: form.availability === a ? '#F0EDF8' : '#7a7690' }}>{a}</div>
                      <div style={{ fontSize: 11, color: '#3d3a50' }}>
                        {a === 'Available' && 'Fans can book freely'}
                        {a === 'Limited' && 'Shows limited slots warning'}
                        {a === 'Booked Out' && 'Booking buttons disabled'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Save */}
            <button type="submit" disabled={saving} className="btn-green" style={{ width: '100%', padding: '15px', fontSize: 16 }}>
              {saving ? <><span className="spinner">◈</span> Saving…</> : isEdit ? 'Save Changes ✦' : 'Add Celebrity ✦'}
            </button>
            <button type="button" onClick={() => navigate('/celebrities')} className="btn-outline" style={{ width: '100%', padding: '12px', fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      </form>

      <style>{`.change-hint{opacity:0;transition:opacity 0.2s}div:hover>.change-hint{opacity:1!important}`}</style>
    </div>
  )
}
