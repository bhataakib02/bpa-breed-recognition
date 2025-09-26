import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'

export default function Analytics() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    breeds: {},
    monthly: {},
    flwActivity: {}
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    setError('')
    
    Promise.all([
      fetch('/api/animals', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/logs', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => [])
    ]).then(([animals, logs]) => {
      const total = animals.length
      const pending = animals.filter(i => i.status === 'pending').length
      const approved = animals.filter(i => i.status === 'approved').length
      const rejected = animals.filter(i => i.status === 'rejected').length
      
      const breeds = {}
      animals.forEach(i => {
        const b = i.predictedBreed || 'Unknown'
        breeds[b] = (breeds[b] || 0) + 1
      })
      
      const monthly = {}
      animals.forEach(a => {
        const month = new Date(a.createdAt).toISOString().slice(0, 7)
        monthly[month] = (monthly[month] || 0) + 1
      })
      
      const flwActivity = {}
      logs.forEach(log => {
        if (log.type === 'animal.create') {
          const flw = log.payload.by || 'unknown'
          flwActivity[flw] = (flwActivity[flw] || 0) + 1
        }
      })
      
      setStats({ total, pending, approved, rejected, breeds, monthly, flwActivity })
    }).catch(e => setError(e.message || 'Failed to load analytics'))
  }, [])

  return (
    <>
      <Header />
      <div className="container">
        <h1>Analytics Dashboard</h1>
        {error && <div style={{ color: 'salmon' }}>{error}</div>}
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 20 }}>
          <div className="card">
            <h2>Total Records</h2>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.total}</div>
          </div>
          <div className="card">
            <h2>Pending</h2>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ffa500' }}>{stats.pending}</div>
          </div>
          <div className="card">
            <h2>Approved</h2>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#11a36a' }}>{stats.approved}</div>
          </div>
          <div className="card">
            <h2>Rejected</h2>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ff6b6b' }}>{stats.rejected}</div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <h2>Breed Distribution</h2>
            <div className="stack">
              {Object.entries(stats.breeds).map(([breed, count]) => (
                <div key={breed} className="row" style={{ justifyContent: 'space-between' }}>
                  <span>{breed}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h2>Monthly Trends</h2>
            <div className="stack">
              {Object.entries(stats.monthly).slice(-6).map(([month, count]) => (
                <div key={month} className="row" style={{ justifyContent: 'space-between' }}>
                  <span>{month}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h2>FLW Activity</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {Object.entries(stats.flwActivity).map(([flw, count]) => (
              <div key={flw} className="row" style={{ justifyContent: 'space-between' }}>
                <span>{flw.slice(0, 8)}...</span>
                <strong>{count} records</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
