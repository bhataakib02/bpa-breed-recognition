import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'

export default function GovtDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly')
  const [exportFormat, setExportFormat] = useState('csv')

  useEffect(() => {
    loadAnalytics()
  }, [selectedRegion, selectedTimeframe])

  const loadAnalytics = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    setLoading(true)
    try {
      const res = await fetch(`/api/govt/analytics?region=${selectedRegion}&timeframe=${selectedTimeframe}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to load analytics')
      
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (type) => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch(`/api/govt/export?type=${type}&format=${exportFormat}&region=${selectedRegion}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to export data')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_data_${new Date().toISOString().split('T')[0]}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert('✅ Data exported successfully')
    } catch (err) {
      setError(err.message || 'Failed to export data')
    }
  }

  const generateReport = async (reportType) => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch('/api/govt/generate-report', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType,
          region: selectedRegion,
          timeframe: selectedTimeframe
        })
      })
      
      if (!res.ok) throw new Error('Failed to generate report')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert('✅ Report generated successfully')
    } catch (err) {
      setError(err.message || 'Failed to generate report')
    }
  }

  if (loading) return <div>Loading analytics...</div>
  if (error) return <div style={{ color: 'salmon' }}>{error}</div>
  if (!analytics) return <div>No analytics data available</div>

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>🏛️ Government Dashboard</h1>
            <div className="row" style={{ gap: 8 }}>
              <button 
                className="btn" 
                onClick={() => generateReport('comprehensive')}
              >
                📊 Generate Report
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>🎛️ Dashboard Controls</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="stack">
                <label>Region</label>
                <select 
                  className="select" 
                  value={selectedRegion} 
                  onChange={e => setSelectedRegion(e.target.value)}
                >
                  <option value="all">All Regions</option>
                  <option value="north">North India</option>
                  <option value="south">South India</option>
                  <option value="east">East India</option>
                  <option value="west">West India</option>
                  <option value="central">Central India</option>
                </select>
              </div>
              <div className="stack">
                <label>Timeframe</label>
                <select 
                  className="select" 
                  value={selectedTimeframe} 
                  onChange={e => setSelectedTimeframe(e.target.value)}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="stack">
                <label>Export Format</label>
                <select 
                  className="select" 
                  value={exportFormat} 
                  onChange={e => setExportFormat(e.target.value)}
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>📊 Key Performance Indicators</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="card" style={{ textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                <h4>Total Animals</h4>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2196F3' }}>
                  {analytics.totalAnimals?.toLocaleString() || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  {analytics.animalsGrowth > 0 ? '+' : ''}{analytics.animalsGrowth}% vs last period
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center', backgroundColor: '#e8f5e8' }}>
                <h4>Active FLWs</h4>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {analytics.activeFLWs || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  {analytics.flwGrowth > 0 ? '+' : ''}{analytics.flwGrowth}% vs last period
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center', backgroundColor: '#fff3e0' }}>
                <h4>Vaccination Coverage</h4>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#FF9800' }}>
                  {analytics.vaccinationCoverage || 0}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  Target: 80%
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center', backgroundColor: '#fce4ec' }}>
                <h4>Disease Outbreaks</h4>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#E91E63' }}>
                  {analytics.diseaseOutbreaks || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  {analytics.outbreakTrend > 0 ? '+' : ''}{analytics.outbreakTrend} vs last period
                </div>
              </div>
            </div>
          </div>

          {/* Breed Distribution */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>🐄 Breed Distribution Analysis</h3>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4>Top Breeds by Population</h4>
                <div className="stack" style={{ gap: '12px' }}>
                  {analytics.breedDistribution?.slice(0, 5).map((breed, i) => (
                    <div key={i} className="card" style={{ border: '1px solid #e0e0e0' }}>
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{breed.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                            {breed.percentage}% of total population
                          </div>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                          {breed.count?.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: '#e0e0e0', 
                        borderRadius: '4px',
                        marginTop: '8px'
                      }}>
                        <div style={{
                          width: `${breed.percentage}%`,
                          height: '100%',
                          backgroundColor: '#2196F3',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4>Rare Breed Conservation</h4>
                <div className="stack" style={{ gap: '12px' }}>
                  {analytics.rareBreeds?.map((breed, i) => (
                    <div key={i} className="card" style={{ border: '1px solid #ff9800' }}>
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#FF9800' }}>{breed.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                            {breed.conservationStatus}
                          </div>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>
                          {breed.count}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', marginTop: '8px' }}>
                        <strong>Conservation Priority:</strong> {breed.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Regional Analysis */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>🗺️ Regional Analysis</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {analytics.regionalData?.map((region, i) => (
                <div key={i} className="card" style={{ border: '1px solid #e0e0e0' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>{region.name}</h4>
                  <div className="stack" style={{ gap: '8px' }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span>Animals:</span>
                      <span style={{ fontWeight: 'bold' }}>{region.animals?.toLocaleString()}</span>
                    </div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span>FLWs:</span>
                      <span style={{ fontWeight: 'bold' }}>{region.flws}</span>
                    </div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span>Vaccination:</span>
                      <span style={{ fontWeight: 'bold' }}>{region.vaccinationCoverage}%</span>
                    </div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span>Health Score:</span>
                      <span style={{ 
                        fontWeight: 'bold',
                        color: region.healthScore > 80 ? '#4CAF50' : region.healthScore > 60 ? '#FF9800' : '#F44336'
                      }}>
                        {region.healthScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheme Performance */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>📋 Government Scheme Performance</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {analytics.schemePerformance?.map((scheme, i) => (
                <div key={i} className="card" style={{ border: '1px solid #e0e0e0' }}>
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0 }}>{scheme.name}</h4>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: scheme.status === 'active' ? '#4CAF50' : '#F44336',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {scheme.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="stack" style={{ gap: '8px' }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span>Target:</span>
                      <span style={{ fontWeight: 'bold' }}>{scheme.target?.toLocaleString()}</span>
                    </div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span>Achieved:</span>
                      <span style={{ fontWeight: 'bold' }}>{scheme.achieved?.toLocaleString()}</span>
                    </div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span>Progress:</span>
                      <span style={{ fontWeight: 'bold' }}>{scheme.progress}%</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: '4px',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        width: `${scheme.progress}%`,
                        height: '100%',
                        backgroundColor: scheme.progress > 80 ? '#4CAF50' : scheme.progress > 60 ? '#FF9800' : '#F44336',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Export */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>📤 Data Export & Reports</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <button 
                className="btn" 
                onClick={() => exportData('animals')}
              >
                🐄 Export Animal Data
              </button>
              <button 
                className="btn" 
                onClick={() => exportData('breeds')}
              >
                🧬 Export Breed Data
              </button>
              <button 
                className="btn" 
                onClick={() => exportData('health')}
              >
                🩺 Export Health Data
              </button>
              <button 
                className="btn" 
                onClick={() => exportData('users')}
              >
                👥 Export User Data
              </button>
              <button 
                className="btn" 
                onClick={() => generateReport('policy')}
              >
                📋 Policy Report
              </button>
              <button 
                className="btn" 
                onClick={() => generateReport('conservation')}
              >
                🌱 Conservation Report
              </button>
            </div>
          </div>

          {/* Predictive Analytics */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>🔮 Predictive Analytics</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ backgroundColor: '#e8f5e8' }}>
                <h4>Population Growth Forecast</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '8px' }}>
                  +{analytics.populationForecast?.growth}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  Expected growth in next 6 months
                </div>
              </div>
              <div className="card" style={{ backgroundColor: '#fff3e0' }}>
                <h4>Disease Risk Assessment</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800', marginBottom: '8px' }}>
                  {analytics.diseaseRisk?.level}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  Risk level for {analytics.diseaseRisk?.region}
                </div>
              </div>
              <div className="card" style={{ backgroundColor: '#e3f2fd' }}>
                <h4>Resource Requirements</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3', marginBottom: '8px' }}>
                  {analytics.resourceNeeds?.priority}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  Priority areas for resource allocation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

