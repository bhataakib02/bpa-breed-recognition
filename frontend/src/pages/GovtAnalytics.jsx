import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'

export default function GovtAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMetric, setSelectedMetric] = useState('population')
  const [selectedPeriod, setSelectedPeriod] = useState('12months')
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [selectedMetric, selectedPeriod])

  const loadAnalytics = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    setLoading(true)
    try {
      const res = await fetch(`/api/govt/detailed-analytics?metric=${selectedMetric}&period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to load analytics')
      
      const data = await res.json()
      setAnalytics(data)
      setChartData(data.chartData)
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const getMetricTitle = (metric) => {
    const titles = {
      population: 'Animal Population Trends',
      health: 'Health Status Distribution',
      vaccination: 'Vaccination Coverage',
      disease: 'Disease Incidence',
      breed: 'Breed Distribution',
      productivity: 'Productivity Metrics',
      scheme: 'Scheme Performance',
      regional: 'Regional Comparison'
    }
    return titles[metric] || 'Analytics'
  }

  const getMetricDescription = (metric) => {
    const descriptions = {
      population: 'Track animal population growth and distribution across regions',
      health: 'Monitor health status trends and disease patterns',
      vaccination: 'Analyze vaccination coverage and effectiveness',
      disease: 'Track disease outbreaks and prevention measures',
      breed: 'Monitor breed diversity and conservation efforts',
      productivity: 'Analyze milk yield and productivity trends',
      scheme: 'Evaluate government scheme implementation and impact',
      regional: 'Compare performance metrics across different regions'
    }
    return descriptions[metric] || 'Detailed analytics and insights'
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
            <h1>📊 Advanced Analytics</h1>
            <div className="row" style={{ gap: 8 }}>
              <button 
                className="btn" 
                onClick={() => window.print()}
              >
                🖨️ Print Report
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>🎛️ Analysis Controls</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="stack">
                <label>Metric</label>
                <select 
                  className="select" 
                  value={selectedMetric} 
                  onChange={e => setSelectedMetric(e.target.value)}
                >
                  <option value="population">Population Trends</option>
                  <option value="health">Health Status</option>
                  <option value="vaccination">Vaccination Coverage</option>
                  <option value="disease">Disease Incidence</option>
                  <option value="breed">Breed Distribution</option>
                  <option value="productivity">Productivity Metrics</option>
                  <option value="scheme">Scheme Performance</option>
                  <option value="regional">Regional Comparison</option>
                </select>
              </div>
              <div className="stack">
                <label>Time Period</label>
                <select 
                  className="select" 
                  value={selectedPeriod} 
                  onChange={e => setSelectedPeriod(e.target.value)}
                >
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="12months">Last 12 Months</option>
                  <option value="24months">Last 24 Months</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Metric Overview */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>{getMetricTitle(selectedMetric)}</h3>
            <p style={{ color: 'var(--color-muted)', marginBottom: '20px' }}>
              {getMetricDescription(selectedMetric)}
            </p>

            {/* Key Statistics */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {analytics.keyStats?.map((stat, i) => (
                <div key={i} className="card" style={{ textAlign: 'center', backgroundColor: stat.color || '#f5f5f5' }}>
                  <h4>{stat.label}</h4>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.valueColor || '#2196F3' }}>
                    {stat.value}
                  </div>
                  {stat.change && (
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                      {stat.change > 0 ? '+' : ''}{stat.change}% vs previous period
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chart Visualization */}
          {chartData && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3>📈 Trend Analysis</h3>
              <div style={{ 
                height: '400px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <h4>Chart Visualization</h4>
                  <p style={{ color: 'var(--color-muted)' }}>
                    Interactive charts would be rendered here using Chart.js or similar library
                  </p>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '16px' }}>
                    Data points: {chartData.length} | Period: {selectedPeriod}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Data Table */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>📋 Detailed Data</h3>
            {analytics.detailedData && analytics.detailedData.length > 0 ? (
              <div className="table">
                <div className="row" style={{ fontWeight: 'bold', background: 'var(--color-bg-secondary)' }}>
                  {Object.keys(analytics.detailedData[0]).map((key, i) => (
                    <div key={i} style={{ width: '150px' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                  ))}
                </div>
                {analytics.detailedData.slice(0, 10).map((row, i) => (
                  <div key={i} className="row">
                    {Object.values(row).map((value, j) => (
                      <div key={j} style={{ width: '150px', fontSize: '12px' }}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </div>
                    ))}
                  </div>
                ))}
                {analytics.detailedData.length > 10 && (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--color-muted)' }}>
                    Showing first 10 rows of {analytics.detailedData.length} total records
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3>No detailed data available</h3>
                <p>Select a different metric or time period to view data.</p>
              </div>
            )}
          </div>

          {/* Insights and Recommendations */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>💡 Insights & Recommendations</h3>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4>Key Insights</h4>
                <div className="stack" style={{ gap: '12px' }}>
                  {analytics.insights?.map((insight, i) => (
                    <div key={i} className="card" style={{ border: '1px solid #e0e0e0' }}>
                      <div className="row" style={{ alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>
                          {insight.type === 'positive' ? '✅' : insight.type === 'negative' ? '⚠️' : 'ℹ️'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{insight.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                            {insight.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4>Recommendations</h4>
                <div className="stack" style={{ gap: '12px' }}>
                  {analytics.recommendations?.map((rec, i) => (
                    <div key={i} className="card" style={{ border: '1px solid #4CAF50' }}>
                      <div className="row" style={{ alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>🎯</div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>{rec.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                            {rec.description}
                          </div>
                          {rec.priority && (
                            <div style={{ 
                              fontSize: '10px', 
                              color: '#4CAF50',
                              fontWeight: 'bold',
                              marginTop: '4px'
                            }}>
                              Priority: {rec.priority}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Regional Comparison */}
          {selectedMetric === 'regional' && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3>🗺️ Regional Performance Comparison</h3>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {analytics.regionalComparison?.map((region, i) => (
                  <div key={i} className="card" style={{ border: '1px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>{region.name}</h4>
                    <div className="stack" style={{ gap: '8px' }}>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span>Performance Score:</span>
                        <span style={{ 
                          fontWeight: 'bold',
                          color: region.score > 80 ? '#4CAF50' : region.score > 60 ? '#FF9800' : '#F44336'
                        }}>
                          {region.score}/100
                        </span>
                      </div>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span>Rank:</span>
                        <span style={{ fontWeight: 'bold' }}>#{region.rank}</span>
                      </div>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span>Growth:</span>
                        <span style={{ 
                          fontWeight: 'bold',
                          color: region.growth > 0 ? '#4CAF50' : '#F44336'
                        }}>
                          {region.growth > 0 ? '+' : ''}{region.growth}%
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: '#e0e0e0', 
                        borderRadius: '4px',
                        marginTop: '8px'
                      }}>
                        <div style={{
                          width: `${region.score}%`,
                          height: '100%',
                          backgroundColor: region.score > 80 ? '#4CAF50' : region.score > 60 ? '#FF9800' : '#F44336',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>📤 Export Analytics Data</h3>
            <div className="row" style={{ gap: '12px' }}>
              <button 
                className="btn" 
                onClick={() => {
                  const dataStr = JSON.stringify(analytics, null, 2)
                  const dataBlob = new Blob([dataStr], { type: 'application/json' })
                  const url = URL.createObjectURL(dataBlob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `analytics_${selectedMetric}_${selectedPeriod}.json`
                  link.click()
                  URL.revokeObjectURL(url)
                }}
              >
                📊 Export JSON
              </button>
              <button 
                className="btn" 
                onClick={() => {
                  const csvData = analytics.detailedData?.map(row => 
                    Object.values(row).join(',')
                  ).join('\n') || ''
                  const csvBlob = new Blob([csvData], { type: 'text/csv' })
                  const url = URL.createObjectURL(csvBlob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `analytics_${selectedMetric}_${selectedPeriod}.csv`
                  link.click()
                  URL.revokeObjectURL(url)
                }}
              >
                📋 Export CSV
              </button>
              <button 
                className="btn" 
                onClick={() => window.print()}
              >
                🖨️ Print Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

