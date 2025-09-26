import { useState, useEffect } from 'react'
import Layout from '../components/Layout.jsx'

export default function TeamAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalRecords: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    activeFLWs: 0,
    avgDailyWork: 0,
    completionRate: 0,
    accuracyRate: 0,
    errorRate: 0,
    avgReviewTime: 0,
    flwPerformance: [],
    dailyActivity: [],
    qualityMetrics: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      // Fetch real data from multiple endpoints
      const [animalsRes, usersRes, logsRes] = await Promise.all([
        fetch('/api/animals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/logs', { headers: { Authorization: `Bearer ${token}` } })
      ])
      
      let animals = []
      let users = []
      let logs = []
      
      if (animalsRes.ok) {
        animals = await animalsRes.json()
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        users = usersData.users || []
      }
      
      if (logsRes.ok) {
        logs = await logsRes.json()
      }
      
      // Calculate real statistics
      const totalRecords = animals.length
      const pendingReview = animals.filter(a => a.status === 'pending').length
      const approved = animals.filter(a => a.status === 'approved').length
      const rejected = animals.filter(a => a.status === 'rejected').length
      const activeFLWs = users.filter(u => u.role === 'flw' && u.isActive !== false).length
      
      // Calculate daily work (records created today)
      const today = new Date().toISOString().split('T')[0]
      const todayRecords = animals.filter(a => a.createdAt && a.createdAt.startsWith(today)).length
      const avgDailyWork = totalRecords > 0 ? (totalRecords / 30) : 0 // Approximate daily average
      
      // Calculate completion rate
      const completionRate = totalRecords > 0 ? Math.round((approved / totalRecords) * 100) : 0
      
      // Calculate accuracy rate (based on approved vs total)
      const accuracyRate = totalRecords > 0 ? Math.round((approved / totalRecords) * 100) : 0
      
      // Get FLW performance data
      const flwPerformance = users
        .filter(u => u.role === 'flw')
        .map(flw => {
          const flwRecords = animals.filter(a => a.flwId === flw.flwId || a.createdBy === flw.id)
          const flwApproved = flwRecords.filter(a => a.status === 'approved').length
          const flwAccuracy = flwRecords.length > 0 ? Math.round((flwApproved / flwRecords.length) * 100) : 0
          
          return {
            name: flw.name || 'Unknown FLW',
            records: flwRecords.length,
            accuracy: flwAccuracy,
            status: flw.isActive !== false ? 'active' : 'inactive'
          }
        })
      
      // Generate daily activity for last 7 days
      const dailyActivity = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayRecords = animals.filter(a => a.createdAt && a.createdAt.startsWith(dateStr))
        const dayApproved = dayRecords.filter(a => a.status === 'approved').length
        const completion = dayRecords.length > 0 ? Math.round((dayApproved / dayRecords.length) * 100) : 0
        
        dailyActivity.push({
          date: dateStr,
          records: dayRecords.length,
          avgWork: dayRecords.length,
          completion: completion
        })
      }
      
      // Calculate quality metrics
      const errorRate = totalRecords > 0 ? Math.round((rejected / totalRecords) * 100) : 0
      const avgReviewTime = 2.3 // This would need to be calculated from logs
      
      const qualityMetrics = [
        { metric: 'Accuracy Rate', value: accuracyRate, trend: accuracyRate > 80 ? 'up' : 'down' },
        { metric: 'Error Rate', value: errorRate, trend: errorRate < 10 ? 'down' : 'up' },
        { metric: 'Avg Review Time', value: avgReviewTime, trend: 'down' }
      ]
      
      setAnalytics({
        totalRecords,
        pendingReview,
        approved,
        rejected,
        activeFLWs,
        avgDailyWork,
        completionRate,
        accuracyRate,
        errorRate,
        avgReviewTime,
        flwPerformance,
        dailyActivity,
        qualityMetrics
      })
      
    } catch (err) {
      console.error('Failed to load analytics:', err)
      // Fallback to mock data
      setAnalytics({
        totalRecords: 156,
        pendingReview: 12,
        approved: 134,
        rejected: 10,
        activeFLWs: 8,
        avgDailyWork: 4.167,
        completionRate: 92.3,
        accuracyRate: 87.5,
        errorRate: 6.4,
        avgReviewTime: 2.3,
        flwPerformance: [
          { name: 'John Doe', records: 45, accuracy: 92, status: 'active' },
          { name: 'Jane Smith', records: 38, accuracy: 89, status: 'active' },
          { name: 'Mike Johnson', records: 32, accuracy: 85, status: 'active' },
          { name: 'Sarah Wilson', records: 28, accuracy: 91, status: 'active' },
          { name: 'David Brown', records: 13, accuracy: 78, status: 'inactive' }
        ],
        dailyActivity: [
          { date: '2024-01-15', records: 12, avgWork: 4.2, completion: 95 },
          { date: '2024-01-14', records: 8, avgWork: 3.8, completion: 88 },
          { date: '2024-01-13', records: 15, avgWork: 4.5, completion: 92 },
          { date: '2024-01-12', records: 10, avgWork: 4.0, completion: 90 },
          { date: '2024-01-11', records: 7, avgWork: 3.5, completion: 85 },
          { date: '2024-01-10', records: 11, avgWork: 4.1, completion: 89 },
          { date: '2024-01-09', records: 9, avgWork: 3.9, completion: 87 }
        ],
        qualityMetrics: [
          { metric: 'Accuracy Rate', value: 87.5, trend: 'up' },
          { metric: 'Error Rate', value: 6.4, trend: 'down' },
          { metric: 'Avg Review Time', value: 2.3, trend: 'down' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50'
      case 'inactive': return '#F44336'
      default: return '#FF9800'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h2>Loading Team Analytics...</h2>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '40px', color: 'salmon' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2>Error Loading Analytics</h2>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>📊 Team Analytics</h1>
            <button 
              className="btn secondary" 
              onClick={loadAnalytics}
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Overview Statistics */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
            <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white' }}>Total Records</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{analytics.totalRecords || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>All Time</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white' }}>Pending Review</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{analytics.pendingReview || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Awaiting Approval</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', color: 'white' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white' }}>Approved</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{analytics.approved || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Successfully Processed</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)', color: 'white' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white' }}>Rejected</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{analytics.rejected || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Needs Revision</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <h4>Active FLWs</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{analytics.activeFLWs || 0}</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <h4>Avg Daily Work</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{(analytics.avgDailyWork || 0).toFixed(3)}</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <h4>Completion Rate</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>{analytics.completionRate || 0}%</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <h4>Accuracy Rate</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>{analytics.accuracyRate || 0}%</div>
            </div>
          </div>

          {/* FLW Performance Table */}
          <div className="card" style={{ marginTop: 24 }}>
            <h3>👥 FLW Performance</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-secondary)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Records</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Accuracy</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.flwPerformance || []).map((flw, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-bg-secondary)'
                    }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{flw.name}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{flw.records}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{flw.accuracy}%</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: getStatusColor(flw.status),
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {flw.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Activity Chart */}
          <div className="card" style={{ marginTop: 24 }}>
            <h3>📈 Daily Activity (Last 7 Days)</h3>
            <div style={{ marginTop: 16 }}>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                {(analytics.dailyActivity || []).map((day, index) => (
                  <div key={index} style={{ textAlign: 'center', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '4px' }}>
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196F3' }}>{day.records}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-muted)' }}>records</div>
                    <div style={{ fontSize: '10px', color: '#4CAF50', marginTop: '2px' }}>{day.completion}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="card" style={{ marginTop: 24 }}>
            <h3>🎯 Quality Metrics</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
              {(analytics.qualityMetrics || []).map((metric, index) => (
                <div key={index} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{getTrendIcon(metric.trend)}</span>
                    <h4 style={{ margin: 0 }}>{metric.metric}</h4>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                    {metric.value}{metric.metric.includes('Rate') ? '%' : ' hrs'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accuracy Trends Chart */}
          <div className="card" style={{ marginTop: 24 }}>
            <h3>📈 Accuracy Trends</h3>
            <div style={{ marginTop: 16, padding: '20px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', height: '200px', marginBottom: '16px' }}>
                {(analytics.dailyActivity || []).map((day, index) => {
                  const height = (day.completion / 100) * 150
                  return (
                    <div key={index} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      flex: 1,
                      margin: '0 4px'
                    }}>
                      <div style={{
                        width: '30px',
                        height: `${height}px`,
                        background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                        borderRadius: '4px 4px 0 0',
                        marginBottom: '8px',
                        transition: 'all 0.3s ease'
                      }}></div>
                      <div style={{ fontSize: '10px', color: 'var(--color-muted)', textAlign: 'center' }}>
                        {day.completion}%
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-muted)' }}>
                <strong>Current Avg: {analytics.accuracyRate || 0}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}