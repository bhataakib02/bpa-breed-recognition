import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [region, setRegion] = useState('')
  const [language, setLanguage] = useState('')
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed')
        return r.json()
      })
      .then(p => {
        setProfile(p)
        setName(p.name || '')
        setPhone(p.phone || '')
        setRegion(p.region || '')
        setLanguage(p.language || '')
      })
      .catch(e => setError(e.message || 'Error'))
  }, [])

  const onSave = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('phone', phone)
      fd.append('region', region)
      fd.append('language', language)
      if (photo) fd.append('photo', photo)
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      let data = null
      try { data = await res.json() } catch {}
      if (!res.ok) throw new Error((data && data.error) || 'Save failed')
      setProfile(data)
      localStorage.setItem('user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('user')||'{}')), name: data.name }))
    } catch (e) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <h1>My Profile</h1>
          {error && <div style={{ color: 'salmon' }}>{error}</div>}
          <div className="grid" style={{ gridTemplateColumns: '220px 1fr' }}>
            <div className="stack">
              {profile?.photoUrl && <img src={profile.photoUrl} alt="avatar" style={{ width: 200, height: 200, borderRadius: 12, objectFit: 'cover' }} />}
              <input className="file" type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
            </div>
            <div className="stack">
              <div className="stack">
                <label>Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="stack">
                <label>Phone</label>
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="stack">
                <label>Region</label>
                <input className="input" value={region} onChange={e => setRegion(e.target.value)} />
              </div>
              <div className="stack">
                <label>Language</label>
                <input className="input" value={language} onChange={e => setLanguage(e.target.value)} />
              </div>
              <div>
                <button className="btn" disabled={saving} onClick={onSave}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


