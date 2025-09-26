import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'

export default function VetHealthRecords() {
  const [healthRecords, setHealthRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [animals, setAnimals] = useState([]) // For dropdown when adding records
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [filters, setFilters] = useState({
    severity: '',
    breed: '',
    search: '',
    dateRange: ''
  })
  const [newHealthRecord, setNewHealthRecord] = useState({
    animalId: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medication: '',
    dosage: '',
    followUpDate: '',
    notes: '',
    severity: 'mild'
  })

  useEffect(() => {
    loadHealthRecords()
    loadAnimals()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [healthRecords, filters])

  const loadHealthRecords = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch('/api/vet/health-records', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) {
        // If API fails, use mock data for demonstration
        console.log('API failed, using mock data for health records')
        setHealthRecords(generateMockHealthRecords())
        return
      }
      
      const data = await res.json()
      setHealthRecords(data)
    } catch (err) {
      console.log('Error loading health records, using mock data:', err.message)
      setHealthRecords(generateMockHealthRecords())
    } finally {
      setLoading(false)
    }
  }

  const loadAnimals = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const res = await fetch('/api/vet/animals', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) {
        // Use mock animals for dropdown
        setAnimals(generateMockAnimals())
        return
      }
      
      const data = await res.json()
      setAnimals(data)
    } catch (err) {
      console.log('Error loading animals, using mock data:', err.message)
      setAnimals(generateMockAnimals())
    }
  }

  const generateMockHealthRecords = () => {
    return [
      {
        id: 'hr1',
        animalId: 'animal1',
        symptoms: 'Lethargy, loss of appetite, fever',
        diagnosis: 'Bovine Respiratory Disease',
        treatment: 'Antibiotics and supportive care',
        medication: 'Oxytetracycline',
        dosage: '10ml twice daily for 5 days',
        severity: 'moderate',
        recordDate: '2024-01-15T10:30:00Z',
        followUpDate: '2024-01-20',
        notes: 'Animal responding well to treatment',
        vetId: 'vet1',
        animal: {
          id: 'animal1',
          earTag: 'A001',
          breed: 'Holstein',
          ownerName: 'John Doe',
          ownerPhone: '9876543210',
          village: 'Village A',
          district: 'District A',
          gender: 'Female',
          age: '3 years',
          weight: '450 kg',
          healthStatus: 'recovering'
        }
      },
      {
        id: 'hr2',
        animalId: 'animal2',
        symptoms: 'Lameness in left hind leg',
        diagnosis: 'Foot rot',
        treatment: 'Foot bath and topical treatment',
        medication: 'Copper sulfate',
        dosage: 'Foot bath daily for 7 days',
        severity: 'mild',
        recordDate: '2024-01-14T14:20:00Z',
        followUpDate: '2024-01-21',
        notes: 'Monitor for improvement',
        vetId: 'vet1',
        animal: {
          id: 'animal2',
          earTag: 'A002',
          breed: 'Gir',
          ownerName: 'Jane Smith',
          ownerPhone: '9876543211',
          village: 'Village B',
          district: 'District B',
          gender: 'Male',
          age: '2 years',
          weight: '380 kg',
          healthStatus: 'sick'
        }
      }
    ]
  }

  const generateMockAnimals = () => {
    return [
      {
        id: 'animal1',
        earTag: 'A001',
        breed: 'Holstein',
        ownerName: 'John Doe',
        healthStatus: 'recovering'
      },
      {
        id: 'animal2',
        earTag: 'A002',
        breed: 'Gir',
        ownerName: 'Jane Smith',
        healthStatus: 'sick'
      }
    ]
  }

  const applyFilters = () => {
    let filtered = [...healthRecords]

    if (filters.severity) {
      filtered = filtered.filter(record => record.severity === filters.severity)
    }
    
    if (filters.breed) {
      filtered = filtered.filter(record => 
        record.animal?.breed?.toLowerCase().includes(filters.breed.toLowerCase())
      )
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(record => 
        record.animal?.earTag?.toLowerCase().includes(searchTerm) ||
        record.animal?.ownerName?.toLowerCase().includes(searchTerm) ||
        record.symptoms?.toLowerCase().includes(searchTerm) ||
        record.diagnosis?.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredRecords(filtered)
  }

  const handleAddHealthRecord = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    setLoading(true)
    try {
      const res = await fetch('/api/vet/health-records', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newHealthRecord,
          vetId: JSON.parse(localStorage.getItem('user')).id,
          recordDate: new Date().toISOString()
        })
      })
      
      if (!res.ok) throw new Error('Failed to add health record')
      
      await loadHealthRecords()
      setShowAddRecord(false)
      setNewHealthRecord({
        animalId: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        medication: '',
        dosage: '',
        followUpDate: '',
        notes: '',
        severity: 'mild'
      })
      
      alert('✅ Health record added successfully')
    } catch (err) {
      setError(err.message || 'Failed to add health record')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateHealthRecord = async (recordId, updates) => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch(`/api/vet/health-records/${recordId}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      if (!res.ok) throw new Error('Failed to update health record')
      
      await loadHealthRecords()
      setEditingRecord(null)
      
      alert('✅ Health record updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update health record')
    }
  }

  const handleScheduleTreatment = async (animalId, treatmentData) => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch('/api/vet/schedule-treatment', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          animalId,
          ...treatmentData,
          vetId: JSON.parse(localStorage.getItem('user')).id
        })
      })
      
      if (!res.ok) throw new Error('Failed to schedule treatment')
      
      await loadHealthRecords()
      alert('✅ Treatment scheduled successfully')
    } catch (err) {
      setError(err.message || 'Failed to schedule treatment')
    }
  }

  const getHealthStatusColor = (status) => {
    const colors = {
      healthy: '#4CAF50',
      sick: '#F44336',
      recovering: '#FF9800',
      critical: '#9C27B0'
    }
    return colors[status] || '#666'
  }

  const getSeverityColor = (severity) => {
    const colors = {
      mild: '#4CAF50',
      moderate: '#FF9800',
      severe: '#F44336',
      critical: '#9C27B0'
    }
    return colors[severity] || '#666'
  }

  const getHealthStatusBadge = (status) => (
    <span style={{
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: getHealthStatusColor(status),
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold'
    }}>
      {status?.toUpperCase() || 'UNKNOWN'}
    </span>
  )

  if (loading) return <div>Loading health records...</div>
  if (error) return <div style={{ color: 'salmon' }}>{error}</div>

  const handleUpdateRecord = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')

    try {
      const res = await fetch(`/api/vet/health-records/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingRecord)
      })

      if (!res.ok) throw new Error('Failed to update health record')

      await loadHealthRecords()
      setEditingRecord(null)
      alert('✅ Health record updated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to update health record')
    }
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>🩺 Health Records Management</h1>
            <div className="row" style={{ gap: 8 }}>
              <button 
                className="btn" 
                onClick={() => setShowAddRecord(true)}
              >
                ➕ Add Health Record
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>🔍 Filters</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="stack">
                <label>Severity</label>
                <select 
                  className="select" 
                  value={filters.severity} 
                  onChange={e => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="">All Severity</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="stack">
                <label>Breed</label>
                <input 
                  className="input" 
                  value={filters.breed} 
                  onChange={e => setFilters(prev => ({ ...prev, breed: e.target.value }))}
                  placeholder="Search by breed"
                />
              </div>
              <div className="stack">
                <label>Search</label>
                <input 
                  className="input" 
                  value={filters.search} 
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by ear tag, owner, symptoms, or diagnosis"
                />
              </div>
            </div>
          </div>

          {/* Health Records List */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>🩺 Health Records ({filteredRecords.length})</h3>
            </div>

            {filteredRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🩺</div>
                <h3>No health records found</h3>
                <p>Try adjusting your filters or add a new health record.</p>
              </div>
            ) : (
              <div className="table">
                <div className="row" style={{ fontWeight: 'bold', background: 'var(--color-bg-secondary)' }}>
                  <div style={{ width: '120px' }}>Date</div>
                  <div style={{ width: '100px' }}>Ear Tag</div>
                  <div style={{ width: '120px' }}>Breed</div>
                  <div style={{ width: '200px' }}>Symptoms</div>
                  <div style={{ width: '150px' }}>Diagnosis</div>
                  <div style={{ width: '80px' }}>Severity</div>
                  <div style={{ width: '100px' }}>Owner</div>
                  <div style={{ width: '120px' }}>Actions</div>
                </div>
                
                {filteredRecords.map(record => (
                  <div key={record.id} className="row">
                    <div style={{ width: '120px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {new Date(record.recordDate).toLocaleDateString()}
                      </div>
                      <div style={{ color: 'var(--color-muted)' }}>
                        {new Date(record.recordDate).toLocaleTimeString()}
                      </div>
                    </div>
                    <div style={{ width: '100px', fontSize: '12px' }}>
                      {record.animal?.earTag || 'No tag'}
                    </div>
                    <div style={{ width: '120px', fontSize: '12px' }}>
                      {record.animal?.breed || 'Unknown'}
                    </div>
                    <div style={{ width: '200px', fontSize: '12px' }}>
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        maxWidth: '180px'
                      }}>
                        {record.symptoms || 'No symptoms'}
                      </div>
                    </div>
                    <div style={{ width: '150px', fontSize: '12px' }}>
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        maxWidth: '130px'
                      }}>
                        {record.diagnosis || 'No diagnosis'}
                      </div>
                    </div>
                    <div style={{ width: '80px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: getSeverityColor(record.severity),
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {record.severity?.toUpperCase() || 'MILD'}
                      </span>
                    </div>
                    <div style={{ width: '100px', fontSize: '12px' }}>
                      {record.animal?.ownerName || 'Unknown'}
                    </div>
                    <div style={{ width: '120px' }}>
                      <div className="row" style={{ gap: 4 }}>
                        <button 
                          className="btn secondary" 
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                          onClick={() => setSelectedRecord(record)}
                        >
                          👁️ View
                        </button>
                        <button 
                          className="btn" 
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                          onClick={() => setEditingRecord(record)}
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Statistics */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>📊 Health Statistics</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Total Records</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>
                  {healthRecords.length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Mild Cases</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {healthRecords.filter(r => r.severity === 'mild').length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Moderate Cases</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>
                  {healthRecords.filter(r => r.severity === 'moderate').length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Severe/Critical</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F44336' }}>
                  {healthRecords.filter(r => r.severity === 'severe' || r.severity === 'critical').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Health Record Modal */}
        {showAddRecord && (
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
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🩺 Add Health Record</h2>
                <button 
                  className="btn secondary" 
                  onClick={() => setShowAddRecord(false)}
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleAddHealthRecord} className="stack" style={{ gap: '16px' }}>
                <div className="stack">
                  <label>Animal *</label>
                  <select 
                    className="select" 
                    value={newHealthRecord.animalId} 
                    onChange={e => setNewHealthRecord(prev => ({ ...prev, animalId: e.target.value }))}
                    required
                  >
                    <option value="">Select Animal</option>
                    {animals.map(animal => (
                      <option key={animal.id} value={animal.id}>
                        {animal.earTag || animal.id} - {animal.breed} ({animal.ownerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="stack">
                  <label>Symptoms *</label>
                  <textarea 
                    className="textarea" 
                    value={newHealthRecord.symptoms} 
                    onChange={e => setNewHealthRecord(prev => ({ ...prev, symptoms: e.target.value }))}
                    rows={3}
                    required
                    placeholder="Describe the symptoms observed"
                  />
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Diagnosis</label>
                    <input 
                      className="input" 
                      value={newHealthRecord.diagnosis} 
                      onChange={e => setNewHealthRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Enter diagnosis"
                    />
                  </div>
                  <div className="stack">
                    <label>Severity</label>
                    <select 
                      className="select" 
                      value={newHealthRecord.severity} 
                      onChange={e => setNewHealthRecord(prev => ({ ...prev, severity: e.target.value }))}
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="stack">
                  <label>Treatment</label>
                  <textarea 
                    className="textarea" 
                    value={newHealthRecord.treatment} 
                    onChange={e => setNewHealthRecord(prev => ({ ...prev, treatment: e.target.value }))}
                    rows={2}
                    placeholder="Describe the treatment provided"
                  />
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Medication</label>
                    <input 
                      className="input" 
                      value={newHealthRecord.medication} 
                      onChange={e => setNewHealthRecord(prev => ({ ...prev, medication: e.target.value }))}
                      placeholder="Medication name"
                    />
                  </div>
                  <div className="stack">
                    <label>Dosage</label>
                    <input 
                      className="input" 
                      value={newHealthRecord.dosage} 
                      onChange={e => setNewHealthRecord(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10ml twice daily"
                    />
                  </div>
                </div>

                <div className="stack">
                  <label>Follow-up Date</label>
                  <input 
                    className="input" 
                    type="date" 
                    value={newHealthRecord.followUpDate} 
                    onChange={e => setNewHealthRecord(prev => ({ ...prev, followUpDate: e.target.value }))}
                  />
                </div>

                <div className="stack">
                  <label>Notes</label>
                  <textarea 
                    className="textarea" 
                    value={newHealthRecord.notes} 
                    onChange={e => setNewHealthRecord(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    placeholder="Additional notes"
                  />
                </div>

                <div className="row" style={{ gap: '12px' }}>
                  <button 
                    className="btn" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Health Record'}
                  </button>
                  <button 
                    className="btn secondary" 
                    type="button"
                    onClick={() => setShowAddRecord(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Health Record Detail Modal */}
        {selectedRecord && (
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
                <h2>🩺 Health Record Details - {selectedRecord.animal?.earTag || selectedRecord.id}</h2>
                <button 
                  className="btn secondary" 
                  onClick={() => setSelectedRecord(null)}
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Animal Info */}
                <div className="stack" style={{ gap: '16px' }}>
                  <h3>Animal Information</h3>
                  <div className="card">
                    <div className="stack" style={{ gap: '8px' }}>
                      <div><strong>Ear Tag:</strong> {selectedRecord.animal?.earTag || 'Not assigned'}</div>
                      <div><strong>Breed:</strong> {selectedRecord.animal?.breed || 'Unknown'}</div>
                      <div><strong>Gender:</strong> {selectedRecord.animal?.gender || 'Unknown'}</div>
                      <div><strong>Age:</strong> {selectedRecord.animal?.age || 'Unknown'}</div>
                      <div><strong>Weight:</strong> {selectedRecord.animal?.weight || 'Unknown'} kg</div>
                      <div><strong>Health Status:</strong> {getHealthStatusBadge(selectedRecord.animal?.healthStatus)}</div>
                    </div>
                  </div>

                  <h3>Owner Information</h3>
                  <div className="card">
                    <div className="stack" style={{ gap: '8px' }}>
                      <div><strong>Name:</strong> {selectedRecord.animal?.ownerName || 'Unknown'}</div>
                      <div><strong>Phone:</strong> {selectedRecord.animal?.ownerPhone || 'Not provided'}</div>
                      <div><strong>Location:</strong> {selectedRecord.animal?.village ? `${selectedRecord.animal.village}, ${selectedRecord.animal.district}` : 'Unknown'}</div>
                    </div>
                  </div>
                </div>

                {/* Health Record Details */}
                <div className="stack" style={{ gap: '16px' }}>
                  <h3>Health Record Details</h3>
                  <div className="card" style={{ border: '1px solid #e0e0e0' }}>
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {new Date(selectedRecord.recordDate).toLocaleDateString()} at {new Date(selectedRecord.recordDate).toLocaleTimeString()}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: getSeverityColor(selectedRecord.severity),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {selectedRecord.severity?.toUpperCase()}
                      </span>
                    </div>
                    <div className="stack" style={{ gap: '8px', fontSize: '14px' }}>
                      <div><strong>Symptoms:</strong> {selectedRecord.symptoms || 'No symptoms recorded'}</div>
                      {selectedRecord.diagnosis && <div><strong>Diagnosis:</strong> {selectedRecord.diagnosis}</div>}
                      {selectedRecord.treatment && <div><strong>Treatment:</strong> {selectedRecord.treatment}</div>}
                      {selectedRecord.medication && <div><strong>Medication:</strong> {selectedRecord.medication}</div>}
                      {selectedRecord.dosage && <div><strong>Dosage:</strong> {selectedRecord.dosage}</div>}
                      {selectedRecord.followUpDate && <div><strong>Follow-up Date:</strong> {new Date(selectedRecord.followUpDate).toLocaleDateString()}</div>}
                      {selectedRecord.notes && <div><strong>Notes:</strong> {selectedRecord.notes}</div>}
                    </div>
                  </div>

                  <div className="row" style={{ gap: '12px' }}>
                    <button 
                      className="btn" 
                      onClick={() => {
                        setEditingRecord(selectedRecord)
                        setSelectedRecord(null)
                      }}
                    >
                      ✏️ Edit Record
                    </button>
                    <button 
                      className="btn secondary" 
                      onClick={() => {
                        setNewHealthRecord(prev => ({ ...prev, animalId: selectedRecord.animalId }))
                        setShowAddRecord(true)
                        setSelectedRecord(null)
                      }}
                    >
                      ➕ Add New Record
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Health Record Modal */}
        {editingRecord && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3>✏️ Edit Health Record</h3>
              
              <div className="stack" style={{ gap: '12px' }}>
                <div className="row" style={{ gap: '12px' }}>
                  <div className="stack" style={{ flex: 1 }}>
                    <label>Symptoms *</label>
                    <textarea
                      className="input"
                      value={editingRecord.symptoms}
                      onChange={(e) => setEditingRecord(prev => ({ ...prev, symptoms: e.target.value }))}
                      rows={3}
                      placeholder="Describe the symptoms observed"
                    />
                  </div>
                </div>

                <div className="row" style={{ gap: '12px' }}>
                  <div className="stack" style={{ flex: 1 }}>
                    <label>Diagnosis *</label>
                    <input
                      type="text"
                      className="input"
                      value={editingRecord.diagnosis}
                      onChange={(e) => setEditingRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Enter diagnosis"
                    />
                  </div>
                  <div className="stack" style={{ flex: 1 }}>
                    <label>Severity *</label>
                    <select
                      className="input"
                      value={editingRecord.severity}
                      onChange={(e) => setEditingRecord(prev => ({ ...prev, severity: e.target.value }))}
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="row" style={{ gap: '12px' }}>
                  <div className="stack" style={{ flex: 1 }}>
                    <label>Treatment *</label>
                    <textarea
                      className="input"
                      value={editingRecord.treatment}
                      onChange={(e) => setEditingRecord(prev => ({ ...prev, treatment: e.target.value }))}
                      rows={2}
                      placeholder="Describe the treatment plan"
                    />
                  </div>
                </div>

                <div className="row" style={{ gap: '12px' }}>
                  <div className="stack" style={{ flex: 1 }}>
                    <label>Medication</label>
                    <input
                      type="text"
                      className="input"
                      value={editingRecord.medication}
                      onChange={(e) => setEditingRecord(prev => ({ ...prev, medication: e.target.value }))}
                      placeholder="Enter medication name"
                    />
                  </div>
                  <div className="stack" style={{ flex: 1 }}>
                    <label>Dosage</label>
                    <input
                      type="text"
                      className="input"
                      value={editingRecord.dosage}
                      onChange={(e) => setEditingRecord(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="Enter dosage instructions"
                    />
                  </div>
                </div>

                <div className="row" style={{ gap: '12px' }}>
                  <div className="stack" style={{ flex: 1 }}>
                    <label>Follow-up Date</label>
                    <input
                      type="date"
                      className="input"
                      value={editingRecord.followUpDate}
                      onChange={(e) => setEditingRecord(prev => ({ ...prev, followUpDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="stack">
                  <label>Notes</label>
                  <textarea
                    className="input"
                    value={editingRecord.notes}
                    onChange={(e) => setEditingRecord(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Additional notes or observations"
                  />
                </div>
              </div>
              
              <div className="row" style={{ gap: '12px', marginTop: '16px' }}>
                <button 
                  className="btn" 
                  onClick={handleUpdateRecord}
                >
                  💾 Update Record
                </button>
                <button 
                  className="btn secondary" 
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

