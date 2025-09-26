import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'

export default function Review() {
  const [pendingRecords, setPendingRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [selectedRecords, setSelectedRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    breed: '',
    location: '',
    worker: '',
    dateRange: '',
    status: 'pending'
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [bulkAction, setBulkAction] = useState('')
  const [reviewingRecord, setReviewingRecord] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    loadPendingRecords()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [pendingRecords, filters, sortBy, sortOrder])

  const loadPendingRecords = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch('/api/animals/pending', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to load records')
      
      const data = await res.json()
      setPendingRecords(data)
    } catch (err) {
      setError(err.message || 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...pendingRecords]

    // Apply filters
    if (filters.breed) {
      filtered = filtered.filter(record => 
        record.predictedBreed?.toLowerCase().includes(filters.breed.toLowerCase())
      )
    }
    
    if (filters.location) {
      filtered = filtered.filter(record => 
        record.location?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }
    
    if (filters.worker) {
      filtered = filtered.filter(record => 
        record.createdBy?.toLowerCase().includes(filters.worker.toLowerCase())
      )
    }
    
    if (filters.dateRange) {
      const days = parseInt(filters.dateRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      filtered = filtered.filter(record => 
        new Date(record.createdAt) >= cutoffDate
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (sortBy === 'createdAt') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredRecords(filtered)
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRecords.length === 0) return
    
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    setLoading(true)
    try {
      const promises = selectedRecords.map(recordId => 
        fetch(`/api/animals/${recordId}/${bulkAction}`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            notes: reviewNotes,
            reviewedBy: JSON.parse(localStorage.getItem('user')).id
          })
        })
      )
      
      await Promise.all(promises)
      
      // Reload records
      await loadPendingRecords()
      setSelectedRecords([])
      setBulkAction('')
      setReviewNotes('')
      
      alert(`✅ ${selectedRecords.length} records ${bulkAction}d successfully`)
    } catch (err) {
      setError(err.message || 'Bulk action failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSingleAction = async (recordId, action) => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch(`/api/animals/${recordId}/${action}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          notes: reviewNotes,
          reviewedBy: JSON.parse(localStorage.getItem('user')).id
        })
      })
      
      if (!res.ok) throw new Error('Action failed')
      
      // Reload records
      await loadPendingRecords()
      setReviewingRecord(null)
      setReviewNotes('')
      
      alert(`✅ Record ${action}d successfully`)
    } catch (err) {
      setError(err.message || 'Action failed')
    }
  }

  const toggleRecordSelection = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }

  const selectAllRecords = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(filteredRecords.map(r => r.id))
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50'
    if (confidence >= 0.6) return '#FF9800'
    return '#F44336'
  }

  const getStatusBadge = (record) => {
    const status = record.status
    const colors = {
      pending: '#FF9800',
      approved: '#4CAF50',
      rejected: '#F44336',
      needs_revision: '#9C27B0'
    }
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: colors[status] || '#666',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {status.toUpperCase()}
      </span>
    )
  }

  if (loading) return <div>Loading pending records...</div>
  if (error) return <div style={{ color: 'salmon' }}>{error}</div>

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>📋 Review & Verification</h1>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ color: 'var(--color-muted)' }}>
                {filteredRecords.length} pending records
              </span>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>🔍 Filters & Search</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="stack">
                <label>Breed</label>
                <input 
                  className="input" 
                  value={filters.breed} 
                  onChange={e => setFilters(prev => ({ ...prev, breed: e.target.value }))}
                  placeholder="Filter by breed"
                />
              </div>
              <div className="stack">
                <label>Location</label>
                <input 
                  className="input" 
                  value={filters.location} 
                  onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Filter by location"
                />
              </div>
              <div className="stack">
                <label>Worker</label>
                <input 
                  className="input" 
                  value={filters.worker} 
                  onChange={e => setFilters(prev => ({ ...prev, worker: e.target.value }))}
                  placeholder="Filter by worker"
                />
              </div>
              <div className="stack">
                <label>Date Range</label>
                <select 
                  className="select" 
                  value={filters.dateRange} 
                  onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                >
                  <option value="">All time</option>
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              </div>
            </div>
            
            <div className="row" style={{ gap: 16, marginTop: 16 }}>
              <div className="stack">
                <label>Sort By</label>
                <select 
                  className="select" 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Date Created</option>
                  <option value="predictedBreed">Breed</option>
                  <option value="location">Location</option>
                  <option value="aiConfidence">AI Confidence</option>
                </select>
              </div>
              <div className="stack">
                <label>Order</label>
                <select 
                  className="select" 
                  value={sortOrder} 
                  onChange={e => setSortOrder(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRecords.length > 0 && (
            <div className="card" style={{ marginTop: 16, backgroundColor: '#e3f2fd' }}>
              <h3>⚡ Bulk Actions ({selectedRecords.length} selected)</h3>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <select 
                  className="select" 
                  value={bulkAction} 
                  onChange={e => setBulkAction(e.target.value)}
                >
                  <option value="">Select Action</option>
                  <option value="approve">✅ Approve All</option>
                  <option value="reject">❌ Reject All</option>
                  <option value="flag">🚩 Flag for Revision</option>
                </select>
                <textarea 
                  className="textarea" 
                  value={reviewNotes} 
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Bulk review notes..."
                  rows={2}
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn" 
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                >
                  Execute Bulk Action
                </button>
              </div>
            </div>
          )}

          {/* Records List */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>📋 Pending Records</h3>
              <div className="row" style={{ gap: 8 }}>
                <button 
                  className="btn secondary" 
                  onClick={selectAllRecords}
                >
                  {selectedRecords.length === filteredRecords.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <h3>No pending records found</h3>
                <p>All records have been reviewed or no records match your filters.</p>
              </div>
            ) : (
              <div className="table">
                <div className="row" style={{ fontWeight: 'bold', background: 'var(--color-bg-secondary)' }}>
                  <div style={{ width: '40px' }}>✓</div>
                  <div style={{ width: '120px' }}>Date</div>
                  <div style={{ width: '150px' }}>Worker</div>
                  <div style={{ width: '200px' }}>Location</div>
                  <div style={{ width: '150px' }}>Predicted Breed</div>
                  <div style={{ width: '100px' }}>Confidence</div>
                  <div style={{ width: '100px' }}>Status</div>
                  <div style={{ width: '120px' }}>Actions</div>
                </div>
                
                {filteredRecords.map(record => (
                  <div key={record.id} className="row" style={{ 
                    backgroundColor: selectedRecords.includes(record.id) ? '#e3f2fd' : 'transparent'
                  }}>
                    <div style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedRecords.includes(record.id)}
                        onChange={() => toggleRecordSelection(record.id)}
                      />
                    </div>
                    <div style={{ width: '120px', fontSize: '12px' }}>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ width: '150px', fontSize: '12px' }}>
                      {record.createdBy || 'Unknown'}
                    </div>
                    <div style={{ width: '200px', fontSize: '12px' }}>
                      {record.location || 'Not specified'}
                    </div>
                    <div style={{ width: '150px', fontSize: '12px' }}>
                      {record.predictedBreed || 'Not predicted'}
                    </div>
                    <div style={{ width: '100px' }}>
                      {record.aiConfidence ? (
                        <div style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          backgroundColor: getConfidenceColor(record.aiConfidence),
                          color: 'white',
                          fontSize: '12px',
                          textAlign: 'center'
                        }}>
                          {(record.aiConfidence * 100).toFixed(0)}%
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-muted)' }}>N/A</span>
                      )}
                    </div>
                    <div style={{ width: '100px' }}>
                      {getStatusBadge(record)}
                    </div>
                    <div style={{ width: '120px' }}>
                      <div className="row" style={{ gap: 4 }}>
                        <button 
                          className="btn secondary" 
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                          onClick={() => setReviewingRecord(record)}
                        >
                          👁️ Review
                        </button>
                        <button 
                          className="btn" 
                          style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#4CAF50' }}
                          onClick={() => handleSingleAction(record.id, 'approve')}
                        >
                          ✅
                        </button>
                        <button 
                          className="btn" 
                          style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#F44336' }}
                          onClick={() => handleSingleAction(record.id, 'reject')}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                  </div>
                )}
              </div>
            </div>

        {/* Detailed Review Modal */}
        {reviewingRecord && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🔍 Detailed Review</h2>
                <button 
                  className="btn secondary" 
                  onClick={() => setReviewingRecord(null)}
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Images */}
                <div className="stack">
                  <h3>📸 Images</h3>
                  {reviewingRecord.imageUrls?.length > 0 ? (
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      {reviewingRecord.imageUrls.map((url, i) => (
                        <img 
                          key={i} 
                          src={url} 
                          alt={`Animal ${i + 1}`}
                          style={{ 
                            width: '100%', 
                            borderRadius: '8px', 
                            height: '150px', 
                            objectFit: 'cover',
                            border: '2px solid #e0e0e0'
                          }} 
                        />
          ))}
        </div>
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
                      No images available
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="stack">
                  <h3>📝 Record Details</h3>
                  <div className="stack" style={{ gap: '12px' }}>
                    <div>
                      <strong>Owner:</strong> {reviewingRecord.ownerName || 'Not specified'}
                    </div>
                    <div>
                      <strong>Location:</strong> {reviewingRecord.location || 'Not specified'}
                    </div>
                    <div>
                      <strong>Ear Tag:</strong> {reviewingRecord.earTag || 'Not specified'}
                    </div>
                    <div>
                      <strong>Age:</strong> {reviewingRecord.ageMonths ? `${reviewingRecord.ageMonths} months` : 'Not specified'}
                    </div>
                    <div>
                      <strong>Gender:</strong> {reviewingRecord.gender || 'Not specified'}
                    </div>
                    <div>
                      <strong>Weight:</strong> {reviewingRecord.weight ? `${reviewingRecord.weight} kg` : 'Not specified'}
                    </div>
                    <div>
                      <strong>Health Status:</strong> {reviewingRecord.healthStatus || 'Not specified'}
                    </div>
                    <div>
                      <strong>Vaccination:</strong> {reviewingRecord.vaccinationStatus || 'Not specified'}
                    </div>
                    <div>
                      <strong>Notes:</strong> {reviewingRecord.notes || 'No notes'}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {reviewingRecord.predictedBreed && (
                    <div style={{ marginTop: '20px' }}>
                      <h4>🤖 AI Analysis</h4>
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <div>
                          <strong>Predicted Breed:</strong> {reviewingRecord.predictedBreed}
                        </div>
                        {reviewingRecord.aiConfidence && (
                          <div>
                            <strong>Confidence:</strong> 
                            <span style={{ 
                              marginLeft: '8px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: getConfidenceColor(reviewingRecord.aiConfidence),
                              color: 'white',
                              fontSize: '12px'
                            }}>
                              {(reviewingRecord.aiConfidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {reviewingRecord.isCrossbreed && (
                          <div style={{ color: '#FF9800', marginTop: '8px' }}>
                            ⚠️ Crossbreed detected
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* GPS Location */}
                  {reviewingRecord.gps && (
                    <div style={{ marginTop: '20px' }}>
                      <h4>📍 Location</h4>
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#e8f5e8', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}>
                        <div>Lat: {reviewingRecord.gps.lat?.toFixed(6)}</div>
                        <div>Lng: {reviewingRecord.gps.lng?.toFixed(6)}</div>
                        <div>Accuracy: ±{Math.round(reviewingRecord.gps.accuracy || 0)}m</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Actions */}
              <div className="card" style={{ marginTop: '20px' }}>
                <h3>📝 Review Actions</h3>
                <div className="stack">
                  <textarea 
                    className="textarea" 
                    value={reviewNotes} 
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes..."
                    rows={3}
                  />
                  <div className="row" style={{ gap: '12px' }}>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: '#4CAF50' }}
                      onClick={() => handleSingleAction(reviewingRecord.id, 'approve')}
                    >
                      ✅ Approve Record
                    </button>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: '#F44336' }}
                      onClick={() => handleSingleAction(reviewingRecord.id, 'reject')}
                    >
                      ❌ Reject Record
                    </button>
                    <button 
                      className="btn secondary" 
                      onClick={() => handleSingleAction(reviewingRecord.id, 'flag')}
                    >
                      🚩 Flag for Revision
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
