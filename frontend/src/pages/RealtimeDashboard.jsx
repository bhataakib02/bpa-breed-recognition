import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Header from '../components/Header.jsx'

export default function RealtimeDashboard() {
  const [socket, setSocket] = useState(null)
  const [updates, setUpdates] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const newSocket = io('http://localhost:4000', {
      auth: { token }
    })

    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to WebSocket')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from WebSocket')
    })

    newSocket.on('update', (data) => {
      setUpdates(prev => [data, ...prev.slice(0, 19)]) // Keep last 20 updates
      console.log('Real-time update:', data)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'animal_created': return '🆕'
      case 'animal_approved': return '✅'
      case 'animal_rejected': return '❌'
      default: return '📢'
    }
  }

  const getUpdateColor = (type) => {
    switch (type) {
      case 'animal_created': return '#4CAF50'
      case 'animal_approved': return '#2196F3'
      case 'animal_rejected': return '#F44336'
      default: return '#FF9800'
    }
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Real-time Updates</h1>
            <div className="row" style={{ alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                background: connected ? '#4CAF50' : '#F44336' 
              }} />
              <span style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {updates.length === 0 ? (
            <div style={{ color: 'var(--color-muted)', textAlign: 'center', padding: 40 }}>
              Waiting for real-time updates...
              <br />
              <small>Create, approve, or reject animals to see live updates</small>
            </div>
          ) : (
            <div className="stack">
              {updates.map((update, index) => (
                <div 
                  key={index} 
                  className="card" 
                  style={{ 
                    borderLeft: `4px solid ${getUpdateColor(update.type)}`,
                    animation: 'slideIn 0.3s ease-out'
                  }}
                >
                  <div className="row" style={{ alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>
                      {getUpdateIcon(update.type)}
                    </span>
                    <div className="stack" style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>
                        {update.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                        {update.timestamp && new Date(update.timestamp).toLocaleString()}
                      </div>
                      {update.data && (
                        <div style={{ fontSize: 14, marginTop: 4 }}>
                          {update.data.predictedBreed && `Breed: ${update.data.predictedBreed}`}
                          {update.data.ownerName && ` • Owner: ${update.data.ownerName}`}
                          {update.data.location && ` • Location: ${update.data.location}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
