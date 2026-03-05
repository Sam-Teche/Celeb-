import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_STYLE = {
  payment_pending: { color: '#E0A44A', bg: 'rgba(224,164,74,0.1)',  border: 'rgba(224,164,74,0.25)',  icon: '⏳', label: 'Payment Pending' },
  approved:        { color: '#9ECA9E', bg: 'rgba(158,202,158,0.1)', border: 'rgba(158,202,158,0.25)', icon: '✓',  label: 'Approved' },
  failed:          { color: '#E07070', bg: 'rgba(224,112,112,0.1)', border: 'rgba(224,112,112,0.25)', icon: '✕',  label: 'Failed' },
}

const BOOKING_ICONS = { meetup: '⬡', event: '◆', fancard: '◇' }

function BookingCard({ booking }) {
  const [expanded, setExpanded] = useState(false)
  const st = STATUS_STYLE[booking.status]

  return (
    <div style={{ background: 'linear-gradient(145deg,#1c1812,#141109)', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 18, overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.28)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.12)'}
    >
      <div style={{ display: 'flex', gap: 16, padding: '20px 22px', alignItems: 'center' }}>
        {/* Celeb photo */}
        <img src={booking.celeb.image} alt={booking.celeb.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,169,110,0.2)', flexShrink: 0 }} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: '#F5EDD6', fontStyle: 'italic', marginBottom: 3 }}>{booking.celeb.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#888' }}>{BOOKING_ICONS[booking.bookingType]} {booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)}</span>
                <span style={{ color: '#333', fontSize: 12 }}>·</span>
                <span style={{ fontSize: 12, color: '#C9A96E', fontFamily: "'Playfair Display',serif", fontStyle: 'italic' }}>${(booking.amount ?? 0).toLocaleString()}</span>
              </div>
            </div>
            {/* Status badge */}
            <span style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}`, padding: '4px 12px', borderRadius: 20, fontSize: 11, letterSpacing: 1, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              {st.icon} {st.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', letterSpacing: 1 }}>{booking.refCode}</span>
            <span style={{ color: '#333', fontSize: 11 }}>·</span>
            <span style={{ fontSize: 11, color: '#444' }}>{new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {booking.scheduledDate && (
              <>
                <span style={{ color: '#333', fontSize: 11 }}>·</span>
                <span style={{ fontSize: 11, color: '#9ECA9E' }}>📅 {new Date(booking.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
        >▾</button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: '0 22px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', animation: 'slideDown 0.2s ease' }}>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1px', background: 'rgba(201,169,110,0.08)', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { label: 'Card Code',    value: booking.razorGoldCode },
              { label: 'Genre',        value: booking.celeb.genre },
              { label: 'Amount Paid',  value: '$' + (booking.amount ?? 0).toLocaleString() },
              ...(booking.scheduledDate ? [{ label: 'Date',     value: new Date(booking.scheduledDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) }] : []),
              ...(booking.location      ? [{ label: 'Location', value: booking.location }] : []),
              { label: 'Reference',    value: booking.refCode },
            ].map(row => (
              <div key={row.label} style={{ background: '#141109', padding: '11px 14px' }}>
                <div style={{ fontSize: 9, color: '#444', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>{row.label}</div>
                <div style={{ fontSize: 13, color: '#AAA', fontFamily: "'Cormorant Garamond',serif" }}>{row.value}</div>
              </div>
            ))}
          </div>

          {booking.status === 'payment_pending' && (
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 10, fontSize: 13, color: '#888', lineHeight: 1.7, fontFamily: "'Cormorant Garamond',serif" }}>
              <span style={{ color: '#C9A96E' }}>⏳ Awaiting review</span> — Our admin team is verifying your RazorGold card code. You'll receive an email and in-app notification once confirmed.
            </div>
          )}
          {booking.status === 'approved' && booking.scheduledDate && (
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(158,202,158,0.05)', border: '1px solid rgba(158,202,158,0.18)', borderRadius: 10, fontSize: 13, color: '#9ECA9E', lineHeight: 1.7 }}>
              ✓ Your booking is confirmed! More details and joining instructions will be sent 48 hours before your scheduled time.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MyBookings() {
  const { user, API } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/bookings/my')
        setBookings(data.bookings)
      } catch {
        toast.error('Failed to load bookings.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filters = [
    { key: 'all',             label: 'All Bookings' },
    { key: 'payment_pending', label: 'Pending' },
    { key: 'approved',        label: 'Approved' },
    { key: 'failed',          label: 'Failed' },
  ]

  const displayed = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const counts = {
    payment_pending: bookings.filter(b => b.status === 'payment_pending').length,
    approved:        bookings.filter(b => b.status === 'approved').length,
    failed:          bookings.filter(b => b.status === 'failed').length,
  }

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 68px)', padding: 'clamp(32px,5vw,60px) clamp(18px,4vw,52px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#C9A96E', letterSpacing: 2 }}>⬡ MY BOOKINGS</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,40px)', fontStyle: 'italic', color: '#F5EDD6', marginBottom: 6 }}>
            Your Fan Experiences
          </h1>
          <p style={{ color: '#666', fontSize: 15, fontFamily: "'Cormorant Garamond',serif" }}>
            Track and manage all your RazorGold-powered celebrity bookings
          </p>
        </div>

        {/* Summary cards */}
        <div className="booking-summary-grid" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total',     value: bookings.length, color: '#C9A96E' },
            { label: 'Pending',  value: counts.payment_pending, color: '#E0A44A' },
            { label: 'Approved', value: counts.approved,        color: '#9ECA9E' },
            { label: 'Failed',   value: counts.failed,          color: '#E07070' },
          ].map(s => (
            <div key={s.label} style={{ background: 'linear-gradient(145deg,#1c1812,#141109)', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: s.color, fontStyle: 'italic' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#444', letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{ background: filter === f.key ? 'linear-gradient(135deg,#C9A96E,#A07840)' : 'rgba(255,255,255,0.03)', border: filter === f.key ? 'none' : '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: '7px 16px', color: filter === f.key ? '#0a0806' : '#777', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', fontWeight: filter === f.key ? 700 : 400 }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 32, color: '#C9A96E', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◈</div>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#333' }}>
            <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.3 }}>⬡</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontStyle: 'italic', marginBottom: 8 }}>No bookings found.</p>
            <p style={{ fontSize: 13, color: '#3a3530' }}>Head to the homepage to book your first celebrity experience!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {displayed.map(b => <BookingCard key={b._id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}
