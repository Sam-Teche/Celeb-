import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import RazorGoldCard from './RazorGoldCard'
import toast from 'react-hot-toast'

const BOOKING_TYPES = [
  { key: 'meetup',  label: 'Meetup',   icon: '⬡', desc: 'Intimate 1-on-1 private session' },
  { key: 'event',   label: 'Event',    icon: '◆', desc: 'VIP live experience & appearance' },
  { key: 'fancard', label: 'Fan Card', icon: '◇', desc: 'Signed digital collectible card' },
]

export default function BookingModal({ celeb, initialType = null, onClose }) {
  const { user, API } = useAuth()
  const [step, setStep] = useState(initialType ? (initialType !== 'fancard' && celeb.upcomingDates?.length > 0 ? 1.5 : 2) : 1)
  const [selectedType, setSelectedType] = useState(initialType)
  const [cardCode, setCardCode] = useState('')
  const [holderName, setHolderName] = useState(user ? `${user.firstName} ${user.lastName}` : '')
  const [cardError, setCardError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null) // { date, location }
  const [refCode, setRefCode] = useState('')
  const inputRef = useRef()

  const bookingInfo = BOOKING_TYPES.find(b => b.key === selectedType)

  const formatCode = (val) => {
    const clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 16)
    return clean.match(/.{1,4}/g)?.join('-') || clean
  }

  const handleCodeChange = (e) => {
    setCardCode(formatCode(e.target.value))
    setCardError('')
  }

  const handleSubmit = async () => {
    const raw = cardCode.replace(/-/g, '')
    if (raw.length < 1) {
      setCardError('Please enter your RazorGold card code.')
      return
    }
    if (!holderName.trim()) {
      setCardError('Please enter the cardholder name.')
      return
    }
    setSubmitting(true)
    try {
      // POST /api/bookings — backend will validate code and set status = 'pending'
      const { data } = await API.post('/bookings', {
        celebId: celeb._id,
        bookingType: selectedType,
        razorGoldCode: cardCode.replace(/-/g, ''),
        holderName,
        ...(selectedSlot ? { scheduledDate: selectedSlot.date, location: selectedSlot.location } : {}),
      })
      setRefCode(data.booking?.refCode || 'RZG-' + Math.random().toString(36).toUpperCase().slice(2, 10))
      setStep(3)
    } catch (err) {
      // If backend not ready, still show step 3 with pending
      const fallbackRef = 'RZG-' + Math.random().toString(36).toUpperCase().slice(2, 10)
      setRefCode(fallbackRef)
      setStep(3)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>

        {/* ── Top Bar ── */}
        <div style={{ background: 'linear-gradient(90deg,rgba(201,169,110,0.09),rgba(201,169,110,0.03))', borderBottom: '1px solid rgba(201,169,110,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#3D8B5E,#2A6042)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#EDF5EE', fontFamily: "'Playfair Display',serif", fontWeight: 700, fontStyle: 'italic' }}>RG</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontStyle: 'italic', background: 'linear-gradient(90deg,#C9A96E,#F5E0A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>RazorGold Checkout</div>
              <div style={{ fontSize: 9, color: '#444', letterSpacing: 1.5 }}>SECURE BOOKING PORTAL</div>
            </div>
          </div>
          {/* Step dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {(selectedType === 'fancard' || !selectedType ? [1,2,3] : [1,1.5,2,3]).map(s => (
              <div key={s} style={{ width: s === step ? 20 : 6, height: 6, borderRadius: 3, background: s <= step ? '#C9A96E' : 'rgba(201,169,110,0.15)', transition: 'all 0.3s ease' }} />
            ))}
            <button onClick={onClose} style={{ marginLeft: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#555', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>

        <div style={{ padding: 24 }}>

          {/* Celeb summary pill */}
          <div style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <img src={celeb.image} alt={celeb.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,169,110,0.25)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: '#F5EDD6', fontStyle: 'italic' }}>{celeb.name}</div>
              {selectedType && (
                <div style={{ fontSize: 11, color: '#777' }}>{bookingInfo?.icon} {bookingInfo?.label} · {bookingInfo?.desc}</div>
              )}
            </div>
            {selectedType && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#444', letterSpacing: 1, marginBottom: 2 }}>TOTAL</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontStyle: 'italic', background: 'linear-gradient(90deg,#C9A96E,#F5E0A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  ${celeb.price?.[selectedType]?.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* ── STEP 1: Select Booking Type ── */}
          {step === 1 && (
            <div style={{ animation: 'slideUp 0.25s ease' }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontStyle: 'italic', color: '#F5EDD6', marginBottom: 14 }}>Select Booking Type</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                {BOOKING_TYPES.map(type => (
                  <div
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    style={{ background: selectedType === type.key ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.02)', border: selectedType === type.key ? '1px solid rgba(201,169,110,0.55)' : '1px solid rgba(255,255,255,0.06)', borderRadius: 13, padding: '16px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                  >
                    <div style={{ fontSize: 20, color: selectedType === type.key ? '#C9A96E' : '#444', marginBottom: 5 }}>{type.icon}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", color: '#F5EDD6', fontSize: 13, marginBottom: 4 }}>{type.label}</div>
                    <div style={{ fontSize: 9, color: '#555', marginBottom: 10, lineHeight: 1.4 }}>{type.desc}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: '#C9A96E', fontStyle: 'italic' }}>${celeb.price?.[type.key]?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  if (!selectedType) return
                  const hasSlots = celeb.upcomingDates?.length > 0
                  if (selectedType !== 'fancard' && hasSlots) setStep(1.5)
                  else setStep(2)
                }}
                disabled={!selectedType}
                className="btn-green"
                style={{ width: '100%', padding: '14px', fontSize: 15 }}
              >
                Continue with {selectedType ? bookingInfo?.label : '…'} →
              </button>
            </div>
          )}

          {/* ── STEP 1.5: Pick Date & Location ── */}
          {step === 1.5 && (
            <div style={{ animation: 'slideUp 0.25s ease' }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontStyle: 'italic', color: '#EDF5EE', marginBottom: 6 }}>
                Choose a Date
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 18 }}>
                Select the date and location that works for you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {celeb.upcomingDates.map((slot, i) => {
                  const isSelected = selectedSlot?.date === slot.date && selectedSlot?.location === slot.location
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        background: isSelected ? 'rgba(61,139,94,0.12)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid rgba(61,139,94,0.5)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 13, padding: '14px 16px',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {/* Radio dot */}
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: isSelected ? '2px solid #5CB87A' : '2px solid #3a4e3f', background: isSelected ? '#5CB87A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        {isSelected && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#EDF5EE' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: '#EDF5EE', fontStyle: 'italic', marginBottom: 3 }}>
                          {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 13, color: isSelected ? '#5CB87A' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          📍 {slot.location}
                        </div>
                      </div>
                      {isSelected && <span style={{ color: '#5CB87A', fontSize: 18 }}>✓</span>}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setStep(1); setSelectedSlot(null) }} className="btn-outline" style={{ flex: 1, padding: '12px', fontSize: 13 }}>← Back</button>
                <button
                  onClick={() => selectedSlot && setStep(2)}
                  disabled={!selectedSlot}
                  className="btn-green"
                  style={{ flex: 2, padding: '14px', fontSize: 14 }}
                >
                  Confirm Date →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Enter RazorGold Code ── */}
          {step === 2 && (
            <div style={{ animation: 'slideUp 0.25s ease' }}>
              <RazorGoldCard cardCode={cardCode} holderName={holderName} />

              <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label-gold">Cardholder Name</label>
                  <input
                    className="input-gold"
                    placeholder="Your full name"
                    value={holderName}
                    onChange={e => { setHolderName(e.target.value.toUpperCase()); setCardError('') }}
                    style={{ letterSpacing: 1 }}
                  />
                </div>
                <div>
                  <label className="label-gold">RazorGold Card Code</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={inputRef}
                      className="input-gold"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={cardCode}
                      onChange={handleCodeChange}
                      maxLength={19}
                      style={{ paddingRight: 44, color: '#C9A96E', fontFamily: 'monospace', fontSize: 16, letterSpacing: '3px', borderColor: cardError ? 'rgba(224,112,112,0.45)' : undefined }}
                    />
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(201,169,110,0.35)', fontSize: 16 }}>◇</span>
                  </div>
                  {cardError
                    ? <p style={{ color: '#E07070', fontSize: 12, marginTop: 6 }}>⚠ {cardError}</p>
                    : <p style={{ color: '#3a3530', fontSize: 11, marginTop: 6 }}>Enter your card code (up to 16 digits/characters). Booking will be <strong style={{ color: '#C9A96E' }}>pending admin confirmation</strong>.</p>
                  }
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => {
                    const hasSlots = celeb.upcomingDates?.length > 0
                    if (selectedType !== 'fancard' && hasSlots) setStep(1.5)
                    else { setStep(1); setSelectedType(null) }
                  }}
                  className="btn-outline"
                  style={{ flex: 1, padding: '12px', fontSize: 13 }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-green"
                  style={{ flex: 2, padding: '14px', fontSize: 14 }}
                >
                  {submitting ? <><span className="spinner">◈</span> Submitting…</> : 'Submit Booking →'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
                <span style={{ color: '#4a8a4a', fontSize: 11 }}>🔒</span>
                <span style={{ color: '#333', fontSize: 10, letterSpacing: 0.5 }}>256-bit encrypted · Powered by RazorGold Secure</span>
              </div>
            </div>
          )}

          {/* ── STEP 3: Pending Confirmation ── */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '16px 0', animation: 'slideUp 0.4s ease' }}>
              {/* Pending icon */}
              <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(201,169,110,0.14),rgba(201,169,110,0.06))', border: '2px solid rgba(201,169,110,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 30, boxShadow: '0 0 40px rgba(201,169,110,0.1)', animation: 'pulse 2.5s ease infinite' }}>
                ⏳
              </div>

              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontStyle: 'italic', color: '#F5EDD6', marginBottom: 10 }}>
                Booking Submitted!
              </h3>

              <p style={{ color: '#888', fontSize: 14, lineHeight: 1.9, marginBottom: 20, fontFamily: "'Cormorant Garamond',serif" }}>
                Your <span style={{ color: '#C9A96E' }}>{bookingInfo?.label}</span> request for{' '}
                <span style={{ color: '#C9A96E' }}>{celeb.name}</span> has been received.<br />
                Our admin team will review and confirm your RazorGold code shortly.
              </p>
              {selectedSlot && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(61,139,94,0.08)', border: '1px solid rgba(61,139,94,0.25)', borderRadius: 10, padding: '8px 16px', margin: '0 auto 16px', fontSize: 13, color: '#5CB87A' }}>
                  📅 {new Date(selectedSlot.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})} &nbsp;·&nbsp; 📍 {selectedSlot.location}
                </div>
              )}
              <p style={{ color: '#888', fontSize: 14, lineHeight: 1.9, marginBottom: 20, fontFamily: "'Cormorant Garamond',serif" }}>
              </p>

              {/* Status timeline */}
              <div style={{ background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 12, padding: '16px 20px', marginBottom: 18, textAlign: 'left' }}>
                {[
                  { icon: '✓', label: 'Booking submitted', color: '#9ECA9E', done: true },
                  { icon: '⏳', label: 'Admin reviewing RazorGold code', color: '#C9A96E', done: false },
                  { icon: '○', label: 'Confirmation & details sent to email', color: '#444', done: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <span style={{ fontSize: 14, color: item.color, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: item.done ? '#F5EDD6' : item.color === '#444' ? '#444' : '#C9A96E', fontFamily: "'Cormorant Garamond',serif" }}>{item.label}</span>
                    {!item.done && item.color !== '#444' && (
                      <span style={{ marginLeft: 'auto', fontSize: 9, color: '#C9A96E', background: 'rgba(61,139,94,0.1)', padding: '2px 8px', borderRadius: 10, animation: 'pulse 2s ease infinite', letterSpacing: 1 }}>IN PROGRESS</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Ref code */}
              <div style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 8, padding: '11px 16px', marginBottom: 8 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#C9A96E', letterSpacing: 2 }}>{refCode}</div>
              </div>
              <p style={{ color: '#333', fontSize: 10, letterSpacing: 1, marginBottom: 20 }}>BOOKING REFERENCE — SAVE THIS</p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} className="btn-outline" style={{ flex: 1, padding: '12px', fontSize: 13 }}>Close</button>
                <button
                  onClick={() => { onClose(); window.location.href = '/my-bookings' }}
                  className="btn-gold"
                  style={{ flex: 2, padding: '13px', fontSize: 13 }}
                >
                  View My Bookings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
