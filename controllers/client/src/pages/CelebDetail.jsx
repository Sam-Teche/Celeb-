import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BookingModal from '../components/BookingModal'
import toast from 'react-hot-toast'
import axios from 'axios'



const BOOKING_TYPES = [
  { key: 'meetup',  label: 'Meetup',   icon: '⬡', desc: 'Intimate 1-on-1 private session', detail: 'A 30–60 minute private virtual or in-person meeting with the celebrity.' },
  { key: 'event',   label: 'Event',    icon: '◆', desc: 'VIP live experience & appearance', detail: 'Exclusive access to attend a live event, with VIP seating and a meet-and-greet.' },
  { key: 'fancard', label: 'Fan Card', icon: '◇', desc: 'Signed digital collectible card', detail: 'A unique, signed digital collectible card delivered to your CelebConnect account.' },
]

const AVAIL_STYLE = {
  Available: { color: '#9ECA9E', border: 'rgba(158,202,158,0.25)', bg: 'rgba(158,202,158,0.1)' },
  Limited:   { color: '#C9A96E', border: 'rgba(201,169,110,0.3)',  bg: 'rgba(201,169,110,0.1)' },
  'Booked Out': { color: '#666', border: 'rgba(80,80,80,0.2)',    bg: 'rgba(80,80,80,0.08)' },
}

export default function CelebDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [celeb, setCeleb] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState(null)
  const [bookingTarget, setBookingTarget] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/celebs/${id}`)
        setCeleb(data.celeb)
      } catch (err) {
        if (err?.response?.status === 404) {
          setCeleb(null)
        } else {
          toast.error('Failed to load celebrity.')
          navigate('/')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleBook = () => {
    if (!activeType) return
    if (!isAuthenticated) {
      toast.error('Please sign in to make a booking.')
      navigate('/signin')
      return
    }
    setBookingTarget({ celeb, type: activeType })
  }

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 36, color: '#C9A96E', animation: 'spin 1s linear infinite' }}>◈</div>
    </div>
  )

  if (!celeb) return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontStyle: 'italic', color: '#F5EDD6' }}>Celebrity not found</div>
      <button className="btn-gold" style={{ padding: '10px 24px', fontSize: 14 }} onClick={() => navigate('/')}>← Back to Discover</button>
    </div>
  )

  const avail = AVAIL_STYLE[celeb.availability]

  return (
    <div className="page-enter">
      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: 'clamp(300px,45vw,500px)', overflow: 'hidden' }}>
        <img src={celeb.image} alt={celeb.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'brightness(0.35)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #0a0806 100%)' }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(201,169,110,0.25)', borderRadius: 8, padding: '8px 14px', color: '#C9A96E', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Back
        </button>

        {/* RG Exclusive */}
        <div className="rg-badge" style={{ position: 'absolute', top: 20, right: 20 }}>
          <div className="rg-chip">RG</div>
          <span style={{ fontSize: 9, color: '#C9A96E', letterSpacing: 1.5 }}>RAZORGOLD EXCLUSIVE</span>
        </div>

        {/* Name block */}
        <div style={{ position: 'absolute', bottom: 32, left: 'clamp(18px,4vw,52px)', right: 'clamp(18px,4vw,52px)' }}>
          <span style={{ color: avail.color, background: avail.bg, border: `1px solid ${avail.border}`, padding: '3px 12px', borderRadius: 20, fontSize: 10, letterSpacing: 1, display: 'inline-block', marginBottom: 10 }}>{celeb.availability}</span>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(32px,5vw,58px)', fontStyle: 'italic', color: '#F5EDD6', margin: '0 0 6px' }}>{celeb.name}</h1>
          <p style={{ color: '#999', fontSize: 14 }}>{celeb.genre} · {celeb.location}</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="detail-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px clamp(16px,4vw,52px) 80px' }}>

        {/* Left column */}
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(201,169,110,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 28 }}>
            {[{ label: 'Followers', value: celeb.followers }, { label: 'Rating', value: celeb.rating }, { label: 'Reviews', value: celeb.reviews?.toLocaleString() }].map(s => (
              <div key={s.label} style={{ background: '#141109', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: '#C9A96E', fontStyle: 'italic' }}>{s.value}</div>
                <div style={{ fontSize: 9, color: '#444', letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontStyle: 'italic', color: '#F5EDD6', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              About
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,rgba(201,169,110,0.2),transparent)' }} />
            </h2>
            <p style={{ color: '#999', lineHeight: 1.9, fontSize: 15, fontFamily: "'Cormorant Garamond',serif", borderLeft: '2px solid rgba(201,169,110,0.25)', paddingLeft: 16 }}>
              {celeb.bio}
            </p>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {celeb.tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>

          {/* Upcoming dates */}
          {celeb.upcomingDates?.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontStyle: 'italic', color: '#F5EDD6', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                Available Dates
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,rgba(201,169,110,0.2),transparent)' }} />
              </h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {celeb.upcomingDates.map((slot, i) => (
                  <div key={i} style={{ background: 'rgba(61,139,94,0.06)', border: '1px solid rgba(61,139,94,0.2)', borderRadius: 12, padding: '10px 16px', minWidth: 160 }}>
                    <div style={{ fontSize: 13, color: '#5CB87A', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 }}>
                      📅 {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      📍 {slot.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — Booking panel */}
        <div className="detail-booking-panel" style={{ position: 'sticky', top: 88 }}>
          <div style={{ background: 'linear-gradient(145deg,#161e18,#0f1511)', border: '1px solid rgba(61,139,94,0.2)', borderRadius: 20, padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            {/* RG header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
              <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#3D8B5E,#2A6042)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#EDF5EE', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontStyle: 'italic' }}>RG</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontStyle: 'italic', background: 'linear-gradient(90deg,#C9A96E,#F5E0A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Book via RazorGold</div>
            </div>

            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontStyle: 'italic', color: '#F5EDD6', marginBottom: 14 }}>Select Booking Type</h3>

            {BOOKING_TYPES.map(type => (
              <div
                key={type.key}
                onClick={() => celeb.availability !== 'Booked Out' && setActiveType(type.key)}
                style={{ background: activeType === type.key ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.02)', border: activeType === type.key ? '1px solid rgba(201,169,110,0.5)' : '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px', marginBottom: 8, cursor: celeb.availability === 'Booked Out' ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: celeb.availability === 'Booked Out' ? 0.35 : 1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, color: activeType === type.key ? '#C9A96E' : '#555' }}>{type.icon}</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: '#F5EDD6', fontStyle: 'italic' }}>{type.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>{type.detail}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: '#C9A96E', fontStyle: 'italic' }}>${celeb.price?.[type.key]?.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleBook}
              disabled={!activeType || celeb.availability === 'Booked Out'}
              className="btn-green"
              style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8 }}
            >
              {celeb.availability === 'Booked Out'
                ? 'Currently Unavailable'
                : activeType
                ? `Book ${BOOKING_TYPES.find(t => t.key === activeType)?.label} ◇`
                : 'Select a booking type'}
            </button>

            {!isAuthenticated && (
              <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 12 }}>
                <span style={{ color: '#C9A96E', cursor: 'pointer' }} onClick={() => navigate('/signin')}>Sign in</span> to make a booking
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Responsive stacking */}


      {bookingTarget && (
        <BookingModal celeb={bookingTarget.celeb} initialType={bookingTarget.type} onClose={() => setBookingTarget(null)} />
      )}
    </div>
  )
}
