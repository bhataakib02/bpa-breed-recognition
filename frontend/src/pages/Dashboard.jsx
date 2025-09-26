import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [stats, setStats] = useState({ 
    total: 0, 
    pending: 0, 
    approved: 0, 
    rejected: 0, 
    breeds: {},
    todayRegistered: 0,
    accuracyRate: 0,
    pendingReviews: 0,
    totalUsers: 0,
    activeFLWs: 0,
    systemHealth: 98,
    recentAnimals: []
  })
  const [location, setLocation] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      setLoading(true)
      
      // Fetch animals data (filtered by FLW ID for FLW users)
      const animalsRes = await fetch('/api/animals', { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      let animals = []
      if (animalsRes.ok) {
        animals = await animalsRes.json()
      } else {
        // Fallback to mock data if API fails
        animals = [
          {
            id: '1',
            ownerName: 'John Doe',
            location: 'Village A, District X',
            predictedBreed: 'Holstein Friesian',
            status: 'approved',
            flwId: user?.flwId || 'FLW001',
            ageMonths: 24,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            ownerName: 'Jane Smith',
            location: 'Village B, District Y',
            predictedBreed: 'Murrah',
            status: 'pending',
            flwId: user?.flwId || 'FLW001',
            ageMonths: 18,
            createdAt: new Date().toISOString()
          }
        ]
      }

      // Fetch users data (for all roles to show real data)
      let usersData = { users: [], activeFLWs: 0, totalUsers: 0, activeUsers: 0 }
      try {
        const usersRes = await fetch('/api/admin/users', { 
          headers: { Authorization: `Bearer ${token}` } 
        })
        if (usersRes.ok) {
          usersData = await usersRes.json()
        }
      } catch (err) {
        console.log('Users data not available:', err)
        // Fallback to mock data if API fails
        usersData = {
          users: [
            { id: '1', role: 'admin', isActive: true },
            { id: '2', role: 'flw', isActive: true },
            { id: '3', role: 'flw', isActive: true },
            { id: '4', role: 'supervisor', isActive: true },
            { id: '5', role: 'vet', isActive: true },
            { id: '6', role: 'govt', isActive: false }
          ],
          activeFLWs: 2,
          totalUsers: 6,
          activeUsers: 5
        }
      }

      // Calculate statistics
      const total = animals.length
      const pending = animals.filter(i => i.status === 'pending').length
      const approved = animals.filter(i => i.status === 'approved').length
      const rejected = animals.filter(i => i.status === 'rejected').length
      
      // Calculate breed distribution
      const breeds = {}
      animals.forEach(animal => {
        const breed = animal.predictedBreed || animal.breed || 'Unknown'
        breeds[breed] = (breeds[breed] || 0) + 1
      })

      // Calculate today's registrations
      const today = new Date().toISOString().split('T')[0]
      const todayRegistered = animals.filter(i => 
        i.createdAt && i.createdAt.startsWith(today)
      ).length

      // Calculate accuracy rate
      const accuracyRate = total > 0 ? Math.round((approved / total) * 100) : 0

      // Calculate system health
      const systemHealth = Math.min(100, Math.max(80, 100 - (pending / Math.max(total, 1)) * 20))

      // Calculate health records count for vet dashboard
      let healthRecordsCount = 0
      let sickAnimalsCount = 0
      if (user?.role === 'vet') {
        animals.forEach(animal => {
          if (animal.healthRecords) {
            healthRecordsCount += animal.healthRecords.length
          }
          if (animal.healthStatus === 'sick' || animal.healthStatus === 'critical') {
            sickAnimalsCount++
          }
        })
      }

      // Calculate real user statistics
      const totalUsers = usersData.users?.length || usersData.totalUsers || 0
      const activeUsers = usersData.users?.filter(u => u.isActive !== false).length || usersData.activeUsers || 0
      const activeFLWs = usersData.users?.filter(u => u.role === 'flw' && u.isActive !== false).length || usersData.activeFLWs || 0

      setStats({
        total: user?.role === 'vet' ? healthRecordsCount : total,
        pending: user?.role === 'vet' ? sickAnimalsCount : pending,
        approved,
        rejected,
        breeds,
        todayRegistered,
        accuracyRate,
        pendingReviews: pending,
        totalUsers,
        activeUsers,
        activeFLWs,
        systemHealth: Math.round(systemHealth)
      })

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial data fetch
    fetchDashboardData()

    // Set up automatic refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const renderRoleSpecificDashboard = () => {
    switch (user?.role) {
      case 'flw':
        return (
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1>Field Worker Dashboard</h1>
                <p style={{ color: 'var(--color-muted)', margin: 0 }}>
                  Welcome back, {user.name}! 📍 {user.village}, {user.district}
                </p>
              </div>
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <div style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  backgroundColor: isOnline ? '#4CAF50' : '#F44336',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </div>
                {location && (
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                    📍 GPS: {location.accuracy}m accuracy
                  </div>
                )}
              </div>
            </div>

            {/* FLW Quick Actions */}
            <div className="row" style={{ gap: 12, marginTop: 16 }}>
              <Link className="btn" to="/records/new">
                📷 Capture New Animal
              </Link>
              <Link className="btn secondary" to="/scan">
                📱 Scan QR Code
              </Link>
              <Link className="btn secondary" to="/records">
                📋 My Records
              </Link>
            </div>

            {/* FLW Specific Stats */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginTop: 20 }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <h3>Today's Work</h3>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#4CAF50' }}>
                  {stats.todayRegistered}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Animals Registered</div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h3>Accuracy Rate</h3>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: stats.accuracyRate > 80 ? '#4CAF50' : '#FF9800' }}>
                  {stats.accuracyRate}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>AI Predictions</div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h3>Pending Review</h3>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#FF9800' }}>
                  {stats.pendingReviews}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Awaiting Approval</div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h3>Total Animals</h3>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#2196F3' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>All Time</div>
              </div>
            </div>

            {/* Location Map Preview */}
            {location && (
              <div className="card" style={{ marginTop: 16 }}>
                <h3>📍 Current Location</h3>
                <div style={{ 
                  height: '200px', 
                  background: 'linear-gradient(45deg, #e3f2fd, #bbdefb)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-muted)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️</div>
                    <div>Lat: {location.lat.toFixed(6)}</div>
                    <div>Lng: {location.lng.toFixed(6)}</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'supervisor':
        return (
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h1>Supervisor Dashboard</h1>
              <span>Hi, {user.name} (Supervisor)</span>
            </div>
            <div className="row" style={{ gap: 12, marginTop: 10 }}>
              <Link className="btn" to="/review">Review Pending ({stats.pending})</Link>
              <Link className="btn secondary" to="/bulk">Bulk Operations</Link>
              <Link className="btn secondary" to="/analytics">Team Analytics</Link>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 16 }}>
              <div className="card"><h2>Pending Reviews</h2><div style={{ fontSize: 28, color: '#FF9800' }}>{stats.pending}</div></div>
              <div className="card"><h2>Approved Today</h2><div style={{ fontSize: 28, color: '#4CAF50' }}>{stats.approved}</div></div>
              <div className="card"><h2>Team Performance</h2><div style={{ fontSize: 28, color: '#2196F3' }}>85%</div></div>
            </div>
          </div>
        )

      case 'admin':
        return (
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontFamily: 'Times New Roman, serif', fontSize: '2rem', margin: 0 }}>
                  👑 Admin Dashboard
                </h1>
                <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                  Welcome back, {user.name}
                </p>
              </div>
              <div className="row" style={{ alignItems: 'center', gap: 12 }}>
                <button 
                  onClick={fetchDashboardData}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: '#9C27B0',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🔄 Refresh
                </button>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: isOnline ? '#4CAF50' : '#F44336',
                  color: 'white'
                }}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row" style={{ gap: 12, marginTop: 16 }}>
              <Link className="btn" to="/admin/users" style={{ background: '#9C27B0', color: 'white' }}>
                👥 Manage Users
              </Link>
              <Link className="btn secondary" to="/admin/breeds" style={{ background: '#FF5722', color: 'white' }}>
                🐄 Breed Database
              </Link>
              <Link className="btn secondary" to="/advanced-analytics" style={{ background: '#2196F3', color: 'white' }}>
                📊 System Analytics
              </Link>
            </div>

            {/* Main Statistics Cards */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>👥</span>
                  <h3 style={{ margin: 0, color: 'white' }}>Total Users</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {loading ? '...' : stats.totalUsers}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Registered Users</div>
              </div>

              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>✅</span>
                  <h3 style={{ margin: 0, color: 'white' }}>Active Users</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {loading ? '...' : stats.activeUsers}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Currently Active</div>
              </div>
              
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>👷</span>
                  <h3 style={{ margin: 0, color: 'white' }}>Active FLWs</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {loading ? '...' : stats.activeFLWs}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Field Workers</div>
              </div>
              
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>💚</span>
                  <h3 style={{ margin: 0, color: 'white' }}>System Health</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {loading ? '...' : `${stats.systemHealth}%`}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Overall Status</div>
              </div>

              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🐄</span>
                  <h3 style={{ margin: 0, color: 'white' }}>Total Animals</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {loading ? '...' : stats.total}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Registered Animals</div>
              </div>
            </div>

            {/* Secondary Statistics */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 16 }}>
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>⏳</span>
                  <h4 style={{ margin: 0, color: 'white', fontSize: '14px' }}>Pending Reviews</h4>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {loading ? '...' : stats.pending}
                </div>
              </div>
              
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>✅</span>
                  <h4 style={{ margin: 0, color: 'white', fontSize: '14px' }}>Approved Today</h4>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {loading ? '...' : stats.approved}
                </div>
              </div>
              
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🎯</span>
                  <h4 style={{ margin: 0, color: 'white', fontSize: '14px' }}>Accuracy Rate</h4>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {loading ? '...' : `${stats.accuracyRate}%`}
                </div>
              </div>
            </div>

            {/* Breed Distribution */}
            <div className="card" style={{ marginTop: 24 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span>📈</span>
                Breed Distribution
              </h3>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {Object.entries(stats.breeds).slice(0, 6).map(([breed, count], index) => {
                  const colors = [
                    'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)',
                    'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                    'linear-gradient(135deg, #45B7D1 0%, #96C93D 100%)',
                    'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
                    'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
                    'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)'
                  ]
                  const color = colors[index % colors.length]
                  
                  return (
                    <div key={breed} style={{ 
                      textAlign: 'center', 
                      padding: '16px 12px', 
                      background: color,
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        {breed}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{count}</div>
                      <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                        {breed.includes('Buffalo') ? '🐃' : '🐄'} animals
                      </div>
                    </div>
                  )
                })}
              </div>
              {Object.keys(stats.breeds).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <h3>No breed data available</h3>
                  <p>Breed distribution will appear here as animals are registered</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'vet':
        return (
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>🩺 Veterinarian Dashboard</h1>
              <div className="row" style={{ alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Hi, {user.name} (Vet)</span>
                <button 
                  onClick={fetchDashboardData}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🔄 Refresh
                </button>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: isOnline ? '#4CAF50' : '#F44336',
                  color: 'white'
                }}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
            </div>
            
            <div className="row" style={{ gap: 12, marginTop: 16 }}>
              <Link className="btn" to="/vet/health-records" style={{ background: '#2196F3', color: 'white' }}>
                🩺 Health Records
              </Link>
              <Link className="btn secondary" to="/vet/disease-detection" style={{ background: '#FF5722', color: 'white' }}>
                🔬 Disease Detection
              </Link>
            </div>

            {/* Health Statistics Cards */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: 24, gap: 16 }}>
              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🩺</span>
                  <h3 style={{ margin: 0, color: 'white' }}>Health Records</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{stats.total}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Total medical records</div>
              </div>


              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🤒</span>
                  <h3 style={{ margin: 0, color: 'white' }}>Sick Animals</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{stats.pending}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Requiring attention</div>
              </div>

              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>💉</span>
                  <h3 style={{ margin: 0, color: 'white' }}>Vaccinations Due</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>8</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Scheduled this week</div>
              </div>

              <div className="card" style={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>📊</span>
                  <h3 style={{ margin: 0, color: 'white' }}>Health Score</h3>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {Math.max(85, Math.min(98, 100 - (stats.pending / Math.max(stats.total, 1)) * 15))}%
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Overall herd health</div>
              </div>
            </div>

            {/* Breed Distribution */}
            <div className="card" style={{ marginTop: 24 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span>📈</span>
                Breed Distribution
              </h3>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {Object.entries(stats.breeds).slice(0, 6).map(([breed, count], index) => {
                  const colors = [
                    'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)',
                    'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                    'linear-gradient(135deg, #45B7D1 0%, #96C93D 100%)',
                    'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
                    'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
                    'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)'
                  ]
                  const color = colors[index % colors.length]
                  
                  return (
                    <div key={breed} style={{ 
                      textAlign: 'center', 
                      padding: '16px 12px', 
                      background: color,
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        {breed}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{count}</div>
                      <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                        {breed.includes('Buffalo') ? '🐃' : '🐄'} animals
                      </div>
                    </div>
                  )
                })}
              </div>
              {Object.keys(stats.breeds).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <h3>No breed data available</h3>
                  <p>Breed distribution will appear here as animals are registered</p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h1>Dashboard</h1>
              <div className="row">
                {user && <span>Hi, {user.name} ({user.role})</span>}
              </div>
            </div>
            <div className="row" style={{ gap: 12, marginTop: 10 }}>
              <Link className="btn" to="/records/new">New Record</Link>
              <Link className="btn secondary" to="/records">View Records</Link>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 16 }}>
              <div className="card"><h2>Total</h2><div style={{ fontSize: 28 }}>{stats.total}</div></div>
              <div className="card"><h2>Pending</h2><div style={{ fontSize: 28 }}>{stats.pending}</div></div>
              <div className="card"><h2>Approved</h2><div style={{ fontSize: 28 }}>{stats.approved}</div></div>
              <div className="card"><h2>Rejected</h2><div style={{ fontSize: 28 }}>{stats.rejected}</div></div>
            </div>
          </div>
        )
    }
  }

  return (
    <Layout>
      <div className="container">
        {/* Dashboard Header with Refresh Button */}
        <div className="row" style={{ 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16,
          '@media (max-width: 768px)': {
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
            alignItems: 'center'
          }
        }}>
          <div style={{ textAlign: 'center', '@media (min-width: 769px)': { textAlign: 'left' } }}>
            <h1 style={{ 
              fontFamily: 'Times New Roman, serif', 
              fontSize: '2.5rem', 
              margin: 0,
              '@media (max-width: 768px)': {
                fontSize: '1.8rem'
              },
              '@media (max-width: 480px)': {
                fontSize: '1.5rem'
              }
            }}>
                                PashuVision Dashboard
            </h1>
            <p style={{ 
              color: 'var(--color-text-muted)', 
              margin: '4px 0 0 0',
              '@media (max-width: 768px)': {
                fontSize: '0.9rem'
              }
            }}>
              Real-time livestock management system
            </p>
          </div>
          <div className="row" style={{ alignItems: 'center', gap: 12 }}>
            <button 
              className="btn secondary" 
              onClick={fetchDashboardData}
              disabled={loading}
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <div style={{
              padding: '8px 12px',
              backgroundColor: isOnline ? '#e8f5e8' : '#ffebee',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '600',
              color: isOnline ? '#4CAF50' : '#F44336'
            }}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </div>
          </div>
        </div>

        {renderRoleSpecificDashboard()}
        
        {/* Common breed distribution for all roles */}
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Breed Distribution</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {Object.entries(stats.breeds).map(([b, n]) => (
              <div key={b} className="row" style={{ justifyContent: 'space-between' }}>
                <span>{b}</span>
                <strong>{n}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}


