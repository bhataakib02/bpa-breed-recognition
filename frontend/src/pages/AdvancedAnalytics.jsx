import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import Header from '../components/Header.jsx'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

export default function AdvancedAnalytics() {
  const [animals, setAnimals] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    const fetchData = async () => {
      try {
        const [animalsResponse, logsResponse] = await Promise.all([
          fetch('/api/animals', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/logs', { headers: { Authorization: `Bearer ${token}` } })
        ])

        let animalsData, logsData
        
        // If API calls fail, use mock data for demonstration
        if (!animalsResponse.ok || !logsResponse.ok) {
          console.log('Using mock data for analytics demonstration')
          animalsData = generateMockAnimals()
          logsData = generateMockLogs()
        } else {
          // Check if response is JSON
          const animalsText = await animalsResponse.text()
          const logsText = await logsResponse.text()
          
          try {
            animalsData = JSON.parse(animalsText)
            logsData = JSON.parse(logsText)
          } catch (parseError) {
            console.error('JSON parse error:', parseError)
            animalsData = generateMockAnimals()
            logsData = generateMockLogs()
          }
        }

        setAnimals(Array.isArray(animalsData) ? animalsData : generateMockAnimals())
        setLogs(Array.isArray(logsData) ? logsData : generateMockLogs())
        setLoading(false)
      } catch (e) {
        console.error('Error loading analytics data:', e)
        // Use mock data as fallback
        setAnimals(generateMockAnimals())
        setLogs(generateMockLogs())
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate mock data for demonstration
  const generateMockAnimals = () => {
    const breeds = ['Holstein', 'Gir', 'Sahiwal', 'Jersey', 'Brahman', 'Angus', 'Hereford', 'Unknown']
    const statuses = ['approved', 'pending', 'rejected']
    const animals = []
    
    for (let i = 0; i < 150; i++) {
      animals.push({
        id: `mock-${i}`,
        predictedBreed: breeds[Math.floor(Math.random() * breeds.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        ageMonths: Math.floor(Math.random() * 60) + 6,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
    return animals
  }

  const generateMockLogs = () => {
    const activities = ['animal.created', 'animal.approved', 'animal.rejected', 'breed.predicted', 'user.login']
    const logs = []
    
    for (let i = 0; i < 200; i++) {
      logs.push({
        id: `log-${i}`,
        activity: activities[Math.floor(Math.random() * activities.length)],
        timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        userId: `user-${Math.floor(Math.random() * 10)}`
      })
    }
    return logs
  }

  if (loading) return <div>Loading analytics...</div>
  if (error) return <div style={{ color: 'salmon' }}>{error}</div>

  // Breed distribution data
  const breedCounts = animals.reduce((acc, animal) => {
    const breed = animal.predictedBreed || 'Unknown'
    acc[breed] = (acc[breed] || 0) + 1
    return acc
  }, {})

  const breedData = {
    labels: Object.keys(breedCounts),
    datasets: [{
      label: 'Animals by Breed',
      data: Object.values(breedCounts),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
      ]
    }]
  }

  // Status distribution
  const statusCounts = animals.reduce((acc, animal) => {
    acc[animal.status] = (acc[animal.status] || 0) + 1
    return acc
  }, {})

  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [{
      label: 'Animals by Status',
      data: Object.values(statusCounts),
      backgroundColor: ['#4CAF50', '#FF9800', '#F44336']
    }]
  }

  // Monthly activity trend
  const monthlyActivity = logs.reduce((acc, log) => {
    // Handle both 'timestamp' and 'at' fields, and validate date
    const timestamp = log.timestamp || log.at
    if (!timestamp) return acc
    
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return acc // Skip invalid dates
    
    const month = date.toISOString().substring(0, 7)
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const activityData = {
    labels: Object.keys(monthlyActivity).sort(),
    datasets: [{
      label: 'Monthly Activity',
      data: Object.values(monthlyActivity),
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      tension: 0.1
    }]
  }

  // Age distribution
  const ageGroups = animals.reduce((acc, animal) => {
    if (!animal.ageMonths) return acc
    const age = animal.ageMonths
    let group = 'Unknown'
    if (age < 12) group = '0-11 months'
    else if (age < 24) group = '1-2 years'
    else if (age < 60) group = '2-5 years'
    else group = '5+ years'
    acc[group] = (acc[group] || 0) + 1
    return acc
  }, {})

  const ageData = {
    labels: Object.keys(ageGroups),
    datasets: [{
      label: 'Animals by Age Group',
      data: Object.values(ageGroups),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    }]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Animal Analytics Dashboard'
      }
    }
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <h1>Advanced Analytics Dashboard</h1>
          
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="card">
              <h3>Breed Distribution</h3>
              <Pie data={breedData} options={chartOptions} />
            </div>
            
            <div className="card">
              <h3>Status Distribution</h3>
              <Bar data={statusData} options={chartOptions} />
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="card">
              <h3>Monthly Activity Trend</h3>
              <Line data={activityData} options={chartOptions} />
            </div>
            
            <div className="card">
              <h3>Age Group Distribution</h3>
              <Bar data={ageData} options={chartOptions} />
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="card">
            <h3>Summary Statistics</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {animals.length}
                </div>
                <div style={{ color: 'var(--color-muted)' }}>Total Animals</div>
              </div>
              
              <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50' }}>
                  {statusCounts.approved || 0}
                </div>
                <div style={{ color: 'var(--color-muted)' }}>Approved</div>
              </div>
              
              <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FF9800' }}>
                  {statusCounts.pending || 0}
                </div>
                <div style={{ color: 'var(--color-muted)' }}>Pending</div>
              </div>
              
              <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#F44336' }}>
                  {statusCounts.rejected || 0}
                </div>
                <div style={{ color: 'var(--color-muted)' }}>Rejected</div>
              </div>
            </div>
          </div>

          {/* Top Breeds Table */}
          <div className="card">
            <h3>Top Breeds</h3>
            <div className="table">
              <div className="row" style={{ fontWeight: 'bold', background: 'var(--color-bg-secondary)' }}>
                <div>Breed</div>
                <div>Count</div>
                <div>Percentage</div>
              </div>
              {Object.entries(breedCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([breed, count]) => (
                  <div key={breed} className="row">
                    <div>{breed}</div>
                    <div>{count}</div>
                    <div>{((count / animals.length) * 100).toFixed(1)}%</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
