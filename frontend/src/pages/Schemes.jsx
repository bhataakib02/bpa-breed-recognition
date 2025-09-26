import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'

export default function Schemes() {
  const [schemes, setSchemes] = useState([])
  const [breed, setBreed] = useState('')
  const [ageMonths, setAgeMonths] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState('')
  const [error, setError] = useState('')

  const search = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    setError('')
    try {
      const params = new URLSearchParams()
      if (breed) params.append('breed', breed)
      if (ageMonths) params.append('ageMonths', ageMonths)
      if (location) params.append('location', location)
      if (gender) params.append('gender', gender)
      const res = await fetch(`/api/schemes?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      let data = null
      try { data = await res.json() } catch {}
      if (!res.ok) throw new Error((data && data.error) || 'Failed')
      setSchemes(data.schemes || [])
    } catch (e) {
      setError(e.message || 'Search failed')
    }
  }

  useEffect(() => {
    search()
  }, [])

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <h1>Government Schemes</h1>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 16 }}>
            <input className="input" placeholder="Breed (e.g., Gir)" value={breed} onChange={e => setBreed(e.target.value)} />
            <input className="input" placeholder="Age (months)" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} />
            <input className="input" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
            <select className="select" value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <button className="btn" onClick={search}>Search Schemes</button>
          {error && <div style={{ color: 'salmon', marginTop: 10 }}>{error}</div>}
        </div>
        
        <div className="grid cards">
          {schemes.map(scheme => (
            <div key={scheme.id} className="card">
              <h2>{scheme.name}</h2>
              <p style={{ color: 'var(--color-muted)' }}>{scheme.description}</p>
              <div className="stack">
                <div><strong>Benefits:</strong></div>
                <ul>
                  {scheme.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
                <div><strong>Next Due:</strong> {scheme.nextDue}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
