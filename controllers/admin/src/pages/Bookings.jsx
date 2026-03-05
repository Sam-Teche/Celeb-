import { useState, useEffect } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import toast from 'react-hot-toast'

const TYPE_ICONS = { meetup: '⬡', event: '◆', fancard: '◇' }

const STATUS_STYLE = {
  payment_pending: { cls: 'badge-pending',   label: 'Payment Pending' },
  approved:        { cls: 'badge-confirmed', label: 'Approved' },
  failed:          { cls: 'badge-rejected',  label: 'Failed' },
}

function BookingRow({ booking, onAction }) {
  const [expanded, setExpanded] = useState(false)
  const [note,     setNote]     = useState(booking.adminNote || '')
  const [schedDate,setSchedDate]= useState(booking.scheduledDate || '')
  const [location, setLocation] = useState(booking.location || '')
  const [acting,   setActing]   = useState(false)

  const isPending = booking.status === 'payment_pending'
  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.payment_pending

  const handleAction = async (status) => {
    setActing(true)
    await onAction(booking._id, status, note, schedDate, location)
    setActing(false)
  }

  return (
    <>
      <tr>
        <td><span className="mono" style={{ fontSize: 11, color: '#C9A96E' }}>{booking.refCode}</span></td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={booking.celeb.image} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(201,169,110,0.2)', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 13, color: '#F0EDF8' }}>{booking.celeb.name}</div>
              <div style={{ fontSize: 10, color: '#3d3a50', textTransform: 'capitalize' }}>{TYPE_ICONS[booking.bookingType]} {booking.bookingType}</div>
            </div>
          </div>
        </td>
        <td>
          <div style={{ fontSize: 13, color: '#F0EDF8' }}>{booking.user.name}</div>
          <div style={{ fontSize: 11, color: '#3d3a50' }}>{booking.user.email}</div>
        </td>
        <td><div className="mono" style={{ fontSize: 12, color: '#7a7690', letterSpacing: 1 }}>{booking.razorGoldCode}</div></td>
        <td><span style={{ color: '#C9A96E', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 14 }}>{`$${(booking.amount ?? booking.rzp ?? 0).toLocaleString()}`}</span></td>
        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
        <td style={{ fontSize: 11, color: '#3d3a50' }}>{new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
        <td>
          <button onClick={() => setExpanded(!expanded)} className="btn-outline" style={{ padding: '5px 12px', fontSize: 11 }}>
            {expanded ? 'Close ▴' : 'Review ▾'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={8} style={{ padding: 0 }}>
            <div style={{ background: 'rgba(201,169,110,0.03)', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 12, margin: '4px 8px 8px', padding: '20px 22px', animation: 'slideUp 0.2s ease' }}>
              {(booking.scheduledDate || booking.location) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(61,139,94,0.06)', border: '1px solid rgba(61,139,94,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#5CB87A', flexWrap: 'wrap', gap: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1, textTransform: 'uppercase' }}>Fan selected:</span>
                  {booking.scheduledDate && <span>📅 {new Date(booking.scheduledDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>}
                  {booking.location && <span>📍 {booking.location}</span>}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 18 }}>
                <div>
                  <div className="label-admin">Full Card Code</div>
                  <div className="mono" style={{ fontSize: 15, color: '#C9A96E', letterSpacing: 2, padding: '10px 14px', background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 8 }}>{booking.razorGoldCode}</div>
                </div>
                <div>
                  <label className="label-admin">Scheduled Date</label>
                  <input type="date" className="input-admin" value={schedDate} onChange={e => setSchedDate(e.target.value)} disabled={!isPending} style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="label-admin">Location</label>
                  <input className="input-admin" placeholder="e.g. Lagos, Nigeria" value={location} onChange={e => setLocation(e.target.value)} disabled={!isPending} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label-admin">Admin Note (included in email to fan)</label>
                  <input className="input-admin" placeholder="e.g. Your card has been verified. Looking forward to seeing you!" value={note} onChange={e => setNote(e.target.value)} disabled={!isPending} />
                </div>
              </div>

              {isPending ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button onClick={() => handleAction('approved')} disabled={acting} className="btn-green" style={{ padding: '10px 24px', fontSize: 13 }}>
                    {acting ? <><span className="spinner">◈</span> Processing…</> : '✓ Approve · Send Email'}
                  </button>
                  <button onClick={() => handleAction('failed')} disabled={acting} className="btn-danger" style={{ padding: '10px 20px', fontSize: 13 }}>
                    ✕ Mark Failed · Send Email
                  </button>
                  <span style={{ fontSize: 11, color: '#3d3a50', fontStyle: 'italic' }}>Fan receives automatic email on status change.</span>
                </div>
              ) : (
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 13, color: '#3d3a50' }}>
                  Status: <span style={{ color: booking.status === 'approved' ? '#6EC47A' : '#E06B6B', textTransform: 'capitalize' }}>{st.label}</span>
                  {booking.adminNote && <span>  ·  Note: "{booking.adminNote}"</span>}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function Bookings() {
  const { API } = useAdminAuth()
  const [bookings, setBookings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    API.get('/admin/bookings')
      .then(r => { setBookings(r.data.bookings); setFiltered(r.data.bookings) })
      .catch(() => toast.error('Failed to load bookings.'))
  }, [])

  useEffect(() => {
    let list = bookings
    if (statusFilter !== 'all') list = list.filter(b => b.status === statusFilter)
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(b =>
        b.refCode.toLowerCase().includes(s) ||
        b.user.name.toLowerCase().includes(s) ||
        b.celeb.name.toLowerCase().includes(s) ||
        b.razorGoldCode.toLowerCase().includes(s)
      )
    }
    setFiltered(list)
  }, [statusFilter, search, bookings])

  const handleAction = async (id, status, adminNote, scheduledDate) => {
    try {
      await API.patch(`/admin/bookings/${id}/status`, { status, adminNote, scheduledDate })
    } catch {}
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status, adminNote, scheduledDate } : b))
    if (status === 'approved') toast.success('✓ Booking approved! Email sent to fan.')
    else toast.success('✕ Booking marked failed. Email sent to fan.')
  }

  const pendingCount = bookings.filter(b => b.status === 'payment_pending').length

  const FILTERS = [
    { key: 'all',             label: 'All' },
    { key: 'payment_pending', label: 'Payment Pending' },
    { key: 'approved',        label: 'Approved' },
    { key: 'failed',          label: 'Failed' },
  ]

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontStyle: 'italic', color: '#F0EDF8', marginBottom: 4 }}>Bookings</h1>
          <p style={{ color: '#3d3a50', fontSize: 14 }}>Review fan bookings and send approval or failure emails</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(224,164,74,0.1)', border: '1px solid rgba(224,164,74,0.25)', borderRadius: 10, padding: '10px 16px' }}>
            <span style={{ color: '#E0A44A', animation: 'pulse 2s ease infinite' }}>⏳</span>
            <span style={{ fontSize: 13, color: '#E0A44A' }}>{pendingCount} booking{pendingCount > 1 ? 's' : ''} awaiting review</span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total',           val: bookings.length,                                              color: '#C9A96E' },
          { label: 'Payment Pending', val: bookings.filter(b => b.status === 'payment_pending').length,  color: '#E0A44A' },
          { label: 'Approved',        val: bookings.filter(b => b.status === 'approved').length,         color: '#6EC47A' },
          { label: 'Failed',          val: bookings.filter(b => b.status === 'failed').length,           color: '#E06B6B' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: s.color, fontStyle: 'italic' }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#3d3a50', letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <span className="search-icon">◎</span>
          <input className="input-admin" placeholder="Search ref, fan, celeb, card code…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{ background: statusFilter === f.key ? 'linear-gradient(135deg,#3D8B5E,#2A6042)' : 'rgba(255,255,255,0.03)', border: statusFilter === f.key ? 'none' : '1px solid rgba(61,139,94,0.18)', borderRadius: 20, padding: '7px 14px', color: statusFilter === f.key ? '#EDF5EE' : '#4a6050', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', fontWeight: statusFilter === f.key ? 700 : 400 }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Celebrity</th>
                <th>Fan</th>
                <th>Card Code</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => <BookingRow key={b._id} booking={b} onAction={handleAction} />)}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#3d3a50', fontSize: 14 }}>No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
