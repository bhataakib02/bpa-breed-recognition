import { useState, useEffect } from 'react'
import Layout from '../components/Layout.jsx'

export default function BulkOperations() {
  const [records, setRecords] = useState([])
  const [selectedRecords, setSelectedRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [operation, setOperation] = useState('')
  const [operationData, setOperationData] = useState({})
  const [filters, setFilters] = useState({
    status: '',
    breed: '',
    location: '',
    dateRange: ''
  })

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch('/api/animals', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to load records')
      
      const data = await res.json()
      setRecords(data)
    } catch (err) {
      setError(err.message || 'Failed to load records')
      // Fallback to mock data if API fails
      const mockRecords = [
        {
          id: '1',
          createdAt: new Date().toISOString(),
          ownerName: 'John Doe',
          location: 'Village A, District X',
          predictedBreed: 'Holstein Friesian',
          status: 'approved',
          flwId: 'FLW001',
          createdBy: 'user1'
        },
        {
          id: '2',
          createdAt: new Date().toISOString(),
          ownerName: 'Jane Smith',
          location: 'Village B, District Y',
          predictedBreed: 'Murrah',
          status: 'pending',
          flwId: 'FLW002',
          createdBy: 'user2'
        }
      ]
      setRecords(mockRecords)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkOperation = async () => {
    if (!operation || selectedRecords.length === 0) return
    
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    setLoading(true)
    try {
      const promises = selectedRecords.map(recordId => {
        const endpoint = getOperationEndpoint(operation, recordId)
        return fetch(endpoint, {
        method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(operationData)
        })
      })
      
      await Promise.all(promises)
      
      // Reload records
      await loadRecords()
      setSelectedRecords([])
      setOperation('')
      setOperationData({})
      
      alert(`✅ Bulk operation completed on ${selectedRecords.length} records`)
    } catch (err) {
      setError(err.message || 'Bulk operation failed')
    } finally {
      setLoading(false)
    }
  }

  const getOperationEndpoint = (operation, recordId) => {
    const baseUrl = `/api/animals/${recordId}`
    
    switch (operation) {
      case 'approve':
        return `${baseUrl}/approve`
      case 'reject':
        return `${baseUrl}/reject`
      case 'update_breed':
        return `${baseUrl}/update-breed`
      case 'update_status':
        return `${baseUrl}/update-status`
      case 'merge':
        return `${baseUrl}/merge`
      case 'export':
        return `${baseUrl}/export`
      default:
        return baseUrl
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
    if (selectedRecords.length === records.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(records.map(r => r.id))
    }
  }

  const viewRecordDetails = (record) => {
    alert(`Record Details:\n\nID: ${record.id}\nOwner: ${record.ownerName}\nLocation: ${record.location}\nBreed: ${record.predictedBreed || 'Not predicted'}\nStatus: ${record.status}\nFLW ID: ${record.flwId}\nCreated: ${new Date(record.createdAt).toLocaleString()}`)
  }

  const editRecord = (record) => {
    const editModal = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
    editModal.document.write(`
      <html>
        <head>
          <title>Edit Record - ${record.id}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              padding: 30px; 
              border-radius: 12px; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
            }
            h2 { 
              color: #333; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #007bff; 
              padding-bottom: 10px; 
            }
            .form-group { 
              margin-bottom: 20px; 
            }
            label { 
              display: block; 
              margin-bottom: 5px; 
              font-weight: 600; 
              color: #555; 
            }
            input, select, textarea { 
              width: 100%; 
              padding: 12px; 
              border: 2px solid #ddd; 
              border-radius: 8px; 
              font-size: 14px; 
              box-sizing: border-box; 
              transition: border-color 0.3s ease; 
            }
            input:focus, select:focus, textarea:focus { 
              outline: none; 
              border-color: #007bff; 
              box-shadow: 0 0 0 3px rgba(0,123,255,0.1); 
            }
            .btn { 
              padding: 12px 24px; 
              border: none; 
              border-radius: 8px; 
              font-size: 14px; 
              font-weight: 600; 
              cursor: pointer; 
              margin-right: 10px; 
              transition: all 0.3s ease; 
            }
            .btn-primary { 
              background: #007bff; 
              color: white; 
            }
            .btn-primary:hover { 
              background: #0056b3; 
              transform: translateY(-2px); 
            }
            .btn-secondary { 
              background: #6c757d; 
              color: white; 
            }
            .btn-secondary:hover { 
              background: #545b62; 
              transform: translateY(-2px); 
            }
            .buttons { 
              margin-top: 30px; 
              text-align: center; 
            }
            .status-badge { 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px; 
              font-weight: bold; 
              text-transform: uppercase; 
            }
            .status-approved { background: #d4edda; color: #155724; }
            .status-pending { background: #fff3cd; color: #856404; }
            .status-rejected { background: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>✏️ Edit Animal Record</h2>
            <form id="editForm">
              <div class="form-group">
                <label>Record ID</label>
                <input type="text" value="${record.id}" readonly style="background: #f8f9fa; color: #6c757d;">
              </div>
              
              <div class="form-group">
                <label>Owner Name *</label>
                <input type="text" id="ownerName" value="${record.ownerName || ''}" required>
              </div>
              
              <div class="form-group">
                <label>Location *</label>
                <input type="text" id="location" value="${record.location || ''}" required>
              </div>
              
              <div class="form-group">
                <label>Predicted Breed</label>
                <input type="text" id="predictedBreed" value="${record.predictedBreed || ''}">
              </div>
              
              <div class="form-group">
                <label>Age (months)</label>
                <input type="number" id="ageMonths" value="${record.ageMonths || ''}" min="0" max="300">
              </div>
              
              <div class="form-group">
                <label>Gender</label>
                <select id="gender">
                  <option value="">Select Gender</option>
                  <option value="male" ${record.gender === 'male' ? 'selected' : ''}>Male</option>
                  <option value="female" ${record.gender === 'female' ? 'selected' : ''}>Female</option>
                  <option value="unknown" ${record.gender === 'unknown' ? 'selected' : ''}>Unknown</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Status</label>
                <select id="status">
                  <option value="pending" ${record.status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="approved" ${record.status === 'approved' ? 'selected' : ''}>Approved</option>
                  <option value="rejected" ${record.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Notes</label>
                <textarea id="notes" rows="3" placeholder="Additional notes about this animal...">${record.notes || ''}</textarea>
              </div>
              
              <div class="form-group">
                <label>FLW ID</label>
                <input type="text" value="${record.flwId || record.createdBy || 'FLW001'}" readonly style="background: #f8f9fa; color: #6c757d;">
              </div>
              
              <div class="form-group">
                <label>Created Date</label>
                <input type="text" value="${new Date(record.createdAt).toLocaleString()}" readonly style="background: #f8f9fa; color: #6c757d;">
              </div>
              
              <div class="buttons">
                <button type="button" class="btn btn-primary" onclick="saveRecord()">💾 Save Changes</button>
                <button type="button" class="btn btn-secondary" onclick="window.close()">❌ Cancel</button>
              </div>
            </form>
          </div>
          
          <script>
            function saveRecord() {
              const data = {
                ownerName: document.getElementById('ownerName').value,
                location: document.getElementById('location').value,
                predictedBreed: document.getElementById('predictedBreed').value,
                ageMonths: parseInt(document.getElementById('ageMonths').value) || 0,
                gender: document.getElementById('gender').value,
                status: document.getElementById('status').value,
                notes: document.getElementById('notes').value
              };
              
              // Validate required fields
              if (!data.ownerName || !data.location) {
                alert('Please fill in all required fields (Owner Name and Location)');
                return;
              }
              
              fetch('/api/animals/${record.id}', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(data)
              })
              .then(response => response.json())
              .then(result => {
                alert('✅ Record updated successfully!');
                window.close();
                window.opener.location.reload();
              })
              .catch(error => {
                console.error('Error:', error);
                alert('❌ Error updating record: ' + error.message);
              });
            }
          </script>
        </body>
      </html>
    `)
  }

  const deleteRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch(`/api/animals/${recordId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` } 
      })
      
      if (!res.ok) throw new Error('Failed to delete record')
      
      await loadRecords()
      alert('Record deleted successfully!')
    } catch (err) {
      setError(err.message || 'Failed to delete record')
    }
  }

  const filteredRecords = records.filter(record => {
    if (filters.status && record.status !== filters.status) return false
    if (filters.breed && !record.predictedBreed?.toLowerCase().includes(filters.breed.toLowerCase())) return false
    if (filters.location && !record.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.dateRange) {
      const days = parseInt(filters.dateRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      if (new Date(record.createdAt) < cutoffDate) return false
    }
    return true
  })

  const getOperationForm = () => {
    switch (operation) {
      case 'update_breed':
        return (
          <div className="stack">
            <label>New Breed</label>
            <input 
              className="input" 
              value={operationData.newBreed || ''} 
              onChange={e => setOperationData(prev => ({ ...prev, newBreed: e.target.value }))}
              placeholder="Enter new breed name"
            />
          </div>
        )
      
      case 'update_status':
        return (
          <div className="stack">
            <label>New Status</label>
            <select 
              className="select" 
              value={operationData.newStatus || ''} 
              onChange={e => setOperationData(prev => ({ ...prev, newStatus: e.target.value }))}
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
          </div>
        )
      
      case 'merge':
        return (
          <div className="stack">
            <label>Target Record ID</label>
            <input 
              className="input" 
              value={operationData.targetId || ''} 
              onChange={e => setOperationData(prev => ({ ...prev, targetId: e.target.value }))}
              placeholder="Enter target record ID to merge with"
            />
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) return <div>Loading records...</div>
  if (error) return <div style={{ color: 'salmon' }}>{error}</div>

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>⚡ Bulk Operations</h1>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ color: 'var(--color-muted)' }}>
                {records.length} total records
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>🔍 Filters</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="stack">
                <label>Search</label>
                <input 
                  className="input" 
                  placeholder="Search"
                />
              </div>
              <div className="stack">
                <label>Filter by breed</label>
                <input 
                  className="input" 
                  value={filters.breed} 
                  onChange={e => setFilters(prev => ({ ...prev, breed: e.target.value }))}
                  placeholder="Filter by breed"
                />
              </div>
              <div className="stack">
                <label>Filter by location</label>
                <input 
                  className="input" 
                  value={filters.location} 
                  onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Filter by location"
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn" style={{ background: '#4CAF50', color: 'white' }}>
                Export CSV
              </button>
            </div>
          </div>

          {/* Bulk Operations */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>⚡ Bulk Operations</h3>
            
            {selectedRecords.length > 0 ? (
              <div className="stack" style={{ gap: 16 }}>
                <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {selectedRecords.length} records selected
                  </span>
                  <button 
                    className="btn secondary" 
                    onClick={() => setSelectedRecords([])}
                  >
                    Clear Selection
                  </button>
                </div>
                
                <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                  <label>Operation:</label>
                  <select 
                    className="select" 
                    value={operation} 
                    onChange={e => setOperation(e.target.value)}
                  >
                    <option value="">Select Operation</option>
                    <option value="approve">✅ Approve Records</option>
                    <option value="reject">❌ Reject Records</option>
                    <option value="update_breed">🔄 Update Breed</option>
                    <option value="update_status">📝 Update Status</option>
                    <option value="merge">🔗 Merge Records</option>
                    <option value="export">📤 Export Records</option>
                  </select>
                </div>

                {getOperationForm()}

                <div className="row" style={{ gap: 12 }}>
                <button 
                  className="btn" 
                    onClick={handleBulkOperation}
                    disabled={!operation}
                >
                    Execute Operation
                </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                <p>Select records below to perform bulk operations</p>
                  </div>
                )}
            </div>

          {/* Records List */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>📋 Records ({filteredRecords.length})</h3>
              <div className="row" style={{ gap: 8 }}>
                <button 
                  className="btn secondary" 
                  onClick={selectAllRecords}
                >
                  {selectedRecords.length === records.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3>No records found</h3>
                <p>Try adjusting your filters to see more records.</p>
          </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-secondary)' }}>
                    <th style={{ width: '40px', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>✓</th>
                    <th style={{ width: '60px', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Sr No</th>
                    <th style={{ width: '120px', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Date</th>
                    <th style={{ width: '150px', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Owner</th>
                    <th style={{ width: '80px', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>FLW ID</th>
                    <th style={{ width: '200px', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Location</th>
                    <th style={{ width: '150px', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Breed</th>
                    <th style={{ width: '100px', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Age</th>
                    <th style={{ width: '100px', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                    <th style={{ width: '120px', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, index) => {
                    const formatAge = (ageMonths) => {
                      if (!ageMonths) return '—'
                      const years = Math.floor(ageMonths / 12)
                      const months = ageMonths % 12
                      return `${years} years ${months} months`
                    }
                    
                    return (
                      <tr key={record.id} style={{ 
                        backgroundColor: selectedRecords.includes(record.id) ? '#e3f2fd' : 
                                        (index % 2 === 0 ? 'transparent' : 'var(--color-bg-secondary)')
                      }}>
                        <td style={{ width: '40px', padding: '8px' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedRecords.includes(record.id)}
                            onChange={() => toggleRecordSelection(record.id)}
                          />
                        </td>
                        <td style={{ width: '60px', padding: '8px', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                          {index + 1}
                        </td>
                        <td style={{ width: '120px', padding: '8px', fontSize: '12px' }}>
                          {record.capturedAt ? new Date(record.capturedAt).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ width: '150px', padding: '8px', fontSize: '12px' }}>
                          {record.ownerName || '—'}
                        </td>
                        <td style={{ width: '80px', padding: '8px', fontSize: '12px', color: '#666' }}>
                          {record.flwId || record.createdBy || 'FLW001'}
                        </td>
                        <td style={{ width: '200px', padding: '8px', fontSize: '12px' }}>
                          {record.location || '—'}
                        </td>
                        <td style={{ width: '150px', padding: '8px', fontSize: '12px' }}>
                          {record.predictedBreed || '—'}
                        </td>
                        <td style={{ width: '100px', padding: '8px', fontSize: '12px' }}>
                          {formatAge(record.ageMonths)}
                        </td>
                        <td style={{ width: '100px', padding: '8px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: record.status === 'approved' ? '#4CAF50' : 
                                            record.status === 'rejected' ? '#F44336' : '#FF9800',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            {record.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        <td style={{ width: '120px', padding: '8px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn secondary" 
                              style={{ 
                                fontSize: '11px', 
                                padding: '4px 6px', 
                                minWidth: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                border: '2px solid #007bff',
                                background: '#ffffff',
                                color: '#007bff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => viewRecordDetails(record)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn" 
                              style={{ 
                                fontSize: '11px', 
                                padding: '4px 6px', 
                                minWidth: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                background: '#fd7e14',
                                color: 'white',
                                border: '2px solid #fd7e14',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => editRecord(record)}
                              title="Edit Record"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn" 
                              style={{ 
                                fontSize: '11px', 
                                padding: '4px 6px', 
                                minWidth: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                background: '#6c757d',
                                color: 'white',
                                border: '2px solid #6c757d',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => deleteRecord(record.id)}
                              title="Delete Record"
                            >
                              🗑️
                            </button>
            </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Performance Analytics */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>📊 Performance Analytics</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Total Records</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>
                  {records.length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Pending Review</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>
                  {records.filter(r => r.status === 'pending').length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Approved</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {records.filter(r => r.status === 'approved').length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Rejected</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F44336' }}>
                  {records.filter(r => r.status === 'rejected').length}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
