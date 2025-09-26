import { useState, useEffect } from 'react'
import Layout from '../components/Layout.jsx'

export default function AdminBreeds() {
  const [breeds, setBreeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddBreed, setShowAddBreed] = useState(false)
  const [editingBreed, setEditingBreed] = useState(null)
  const [newBreed, setNewBreed] = useState({
    name: '',
    origin: '',
    description: '',
    avgMilkYield: '',
    avgWeight: '',
    traits: [],
    isRareBreed: false,
    referenceImages: []
  })

  useEffect(() => {
    loadBreeds()
  }, [])

  const loadBreeds = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch('/api/admin/breeds', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) {
        // If API fails, use mock data for demonstration
        console.log('Using mock breed data for demonstration')
        const mockBreeds = [
          {
            id: 'holstein-1',
            name: 'Holstein',
            origin: 'Netherlands',
            description: 'High milk-producing dairy breed with distinctive black and white markings.',
            avgMilkYield: '25',
            avgWeight: '650',
            traits: ['High milk yield', 'Cold tolerant', 'Large size'],
            isRareBreed: false,
            referenceImages: ['https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80']
          },
          {
            id: 'gir-1',
            name: 'Gir',
            origin: 'India',
            description: 'Indigenous Indian breed known for disease resistance and heat tolerance.',
            avgMilkYield: '12',
            avgWeight: '400',
            traits: ['Disease resistant', 'Heat tolerant', 'A2 milk'],
            isRareBreed: true,
            referenceImages: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80']
          },
          {
            id: 'sahiwal-1',
            name: 'Sahiwal',
            origin: 'Pakistan',
            description: 'Reddish-brown dairy breed known for high milk production in tropical climates.',
            avgMilkYield: '18',
            avgWeight: '450',
            traits: ['Heat tolerant', 'High milk yield', 'Tropical adapted'],
            isRareBreed: false,
            referenceImages: ['https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80']
          },
          {
            id: 'jersey-1',
            name: 'Jersey',
            origin: 'Jersey Island',
            description: 'Small, efficient dairy breed known for high butterfat content in milk.',
            avgMilkYield: '20',
            avgWeight: '400',
            traits: ['High butterfat', 'Small size', 'Efficient'],
            isRareBreed: false,
            referenceImages: []
          }
        ]
        setBreeds(mockBreeds)
        return
      }
      
      const data = await res.json()
      setBreeds(data)
    } catch (err) {
      setError(err.message || 'Failed to load breeds')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBreed = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/breeds', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBreed)
      })
      
      if (!res.ok) throw new Error('Failed to add breed')
      
      await loadBreeds()
      setShowAddBreed(false)
      setNewBreed({
        name: '',
        origin: '',
        description: '',
        avgMilkYield: '',
        avgWeight: '',
        traits: [],
        isRareBreed: false,
        referenceImages: []
      })
      
      alert('✅ Breed added successfully')
    } catch (err) {
      setError(err.message || 'Failed to add breed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBreed = async (breedId, updates) => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch(`/api/admin/breeds/${breedId}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      if (!res.ok) throw new Error('Failed to update breed')
      
      await loadBreeds()
      setEditingBreed(null)
      
      alert('✅ Breed updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update breed')
    }
  }

  const handleDeleteBreed = async (breedId) => {
    if (!confirm('Are you sure you want to delete this breed?')) return
    
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch(`/api/admin/breeds/${breedId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) {
        const errorData = await res.text()
        throw new Error(errorData || 'Failed to delete breed')
      }
      
      const result = await res.json()
      await loadBreeds()
      alert('Breed deleted successfully')
    } catch (err) {
      setError(err.message || 'Failed to delete breed')
    }
  }

  const handleImageUpload = async (e, breedData, setBreedData) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)
        
        const res = await fetch('/api/upload/breed-image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        
        if (!res.ok) throw new Error('Failed to upload image')
        
        const data = await res.json()
        return data.imageUrl
      })

      const imageUrls = await Promise.all(uploadPromises)
      setBreedData(prev => ({
        ...prev,
        referenceImages: [...(prev.referenceImages || []), ...imageUrls]
      }))
    } catch (err) {
      setError(err.message || 'Failed to upload images')
    }
  }

  if (loading) return <div>Loading breeds...</div>
  if (error) return <div style={{ color: 'salmon' }}>{error}</div>

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Breed Database Management</h1>
            <div className="row" style={{ gap: 8 }}>
              <button 
                className="btn" 
                onClick={() => setShowAddBreed(true)}
              >
                Add Breed
              </button>
            </div>
          </div>

          {/* Breeds List */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>Registered Breeds ({breeds.length})</h3>

            {breeds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>B</div>
                <h3>No breeds registered</h3>
                <p>Add your first breed to get started.</p>
              </div>
            ) : (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {breeds.map(breed => (
                  <div key={breed.id} className="card" style={{ border: '1px solid #e0e0e0' }}>
                    {/* Breed Images */}
                    {breed.referenceImages?.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                          {breed.referenceImages.slice(0, 3).map((imageUrl, i) => (
                            <img 
                              key={i} 
                              src={imageUrl} 
                              alt={`${breed.name} ${i + 1}`}
                              style={{ 
                                width: '100%', 
                                height: '80px', 
                                objectFit: 'cover', 
                                borderRadius: '8px',
                                border: '2px solid #e0e0e0'
                              }} 
                            />
                          ))}
                          {breed.referenceImages.length > 3 && (
                            <div style={{
                              width: '100%',
                              height: '80px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '8px',
                              fontSize: '12px',
                              color: 'var(--color-muted)'
                            }}>
                              +{breed.referenceImages.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Breed Info */}
                    <div className="stack" style={{ gap: '8px' }}>
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>{breed.name}</h4>
                        {breed.isRareBreed && (
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            RARE
                          </span>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                        <strong>Origin:</strong> {breed.origin || 'Unknown'}
                      </div>
                      
                      {breed.description && (
                        <div style={{ fontSize: '12px' }}>
                          {breed.description.length > 100 ? 
                            `${breed.description.substring(0, 100)}...` : 
                            breed.description
                          }
                        </div>
                      )}

                      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                        {breed.avgMilkYield && (
                          <div>
                            <strong>Milk:</strong> {breed.avgMilkYield}L/day
                          </div>
                        )}
                        {breed.avgWeight && (
                          <div>
                            <strong>Weight:</strong> {breed.avgWeight}kg
                          </div>
                        )}
                      </div>

                      {breed.traits?.length > 0 && (
                        <div style={{ fontSize: '12px' }}>
                          <strong>Traits:</strong> {breed.traits.join(', ')}
                        </div>
                      )}

                      <div className="row" style={{ gap: '8px', marginTop: '12px' }}>
                        <button 
                          className="btn secondary" 
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                          onClick={() => setEditingBreed(breed)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn" 
                          style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#F44336' }}
                          onClick={() => handleDeleteBreed(breed.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Breed Statistics */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>Breed Statistics</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Total Breeds</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>
                  {breeds.length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Rare Breeds</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>
                  {breeds.filter(b => b.isRareBreed).length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>With Images</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {breeds.filter(b => b.referenceImages?.length > 0).length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Avg Milk Yield</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0' }}>
                  {breeds.length > 0 ? 
                    Math.round(breeds.reduce((sum, b) => sum + (parseFloat(b.avgMilkYield) || 0), 0) / breeds.length) : 
                    0
                  }L
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Breed Modal */}
        {showAddBreed && (
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
                <h2>Add New Breed</h2>
                <button 
                  className="btn secondary" 
                  onClick={() => setShowAddBreed(false)}
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleAddBreed} className="stack" style={{ gap: '16px' }}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Breed Name *</label>
                    <input 
                      className="input" 
                      value={newBreed.name} 
                      onChange={e => setNewBreed(prev => ({ ...prev, name: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="stack">
                    <label>Origin</label>
                    <input 
                      className="input" 
                      value={newBreed.origin} 
                      onChange={e => setNewBreed(prev => ({ ...prev, origin: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="stack">
                  <label>Description</label>
                  <textarea 
                    className="textarea" 
                    value={newBreed.description} 
                    onChange={e => setNewBreed(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Avg Milk Yield (L/day)</label>
                    <input 
                      className="input" 
                      type="number" 
                      value={newBreed.avgMilkYield} 
                      onChange={e => setNewBreed(prev => ({ ...prev, avgMilkYield: e.target.value }))}
                    />
                  </div>
                  <div className="stack">
                    <label>Avg Weight (kg)</label>
                    <input 
                      className="input" 
                      type="number" 
                      value={newBreed.avgWeight} 
                      onChange={e => setNewBreed(prev => ({ ...prev, avgWeight: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="stack">
                  <label>Traits (comma-separated)</label>
                  <input 
                    className="input" 
                    value={newBreed.traits.join(', ')} 
                    onChange={e => setNewBreed(prev => ({ 
                      ...prev, 
                      traits: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                    }))}
                    placeholder="e.g., High milk yield, Disease resistant, Heat tolerant"
                  />
                </div>

                <div className="stack">
                  <label>Reference Images</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={e => handleImageUpload(e, newBreed, setNewBreed)}
                  />
                  {newBreed.referenceImages?.length > 0 && (
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginTop: '8px' }}>
                      {newBreed.referenceImages.map((imageUrl, i) => (
                        <img 
                          key={i} 
                          src={imageUrl} 
                          alt={`Reference ${i + 1}`}
                          style={{ 
                            width: '100%', 
                            height: '100px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            border: '2px solid #e0e0e0'
                          }} 
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="stack">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={newBreed.isRareBreed}
                      onChange={e => setNewBreed(prev => ({ ...prev, isRareBreed: e.target.checked }))}
                    />
                    Mark as rare breed
                  </label>
                </div>

                <div className="row" style={{ gap: '12px' }}>
                  <button 
                    className="btn" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Breed'}
                  </button>
                  <button 
                    className="btn secondary" 
                    type="button"
                    onClick={() => setShowAddBreed(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Breed Modal - Similar structure to Add Modal */}
        {editingBreed && (
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
                <h2>Edit Breed</h2>
                <button 
                  className="btn secondary" 
                  onClick={() => setEditingBreed(null)}
                >
                  Close
                </button>
              </div>

              <div className="stack" style={{ gap: '16px' }}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Breed Name</label>
                    <input 
                      className="input" 
                      value={editingBreed.name} 
                      onChange={e => setEditingBreed(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="stack">
                    <label>Origin</label>
                    <input 
                      className="input" 
                      value={editingBreed.origin || ''} 
                      onChange={e => setEditingBreed(prev => ({ ...prev, origin: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="stack">
                  <label>Description</label>
                  <textarea 
                    className="textarea" 
                    value={editingBreed.description || ''} 
                    onChange={e => setEditingBreed(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Avg Milk Yield (L/day)</label>
                    <input 
                      className="input" 
                      type="number" 
                      value={editingBreed.avgMilkYield || ''} 
                      onChange={e => setEditingBreed(prev => ({ ...prev, avgMilkYield: e.target.value }))}
                    />
                  </div>
                  <div className="stack">
                    <label>Avg Weight (kg)</label>
                    <input 
                      className="input" 
                      type="number" 
                      value={editingBreed.avgWeight || ''} 
                      onChange={e => setEditingBreed(prev => ({ ...prev, avgWeight: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="stack">
                  <label>Traits (comma-separated)</label>
                  <input 
                    className="input" 
                    value={(editingBreed.traits || []).join(', ')} 
                    onChange={e => setEditingBreed(prev => ({ 
                      ...prev, 
                      traits: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                    }))}
                  />
                </div>

                <div className="stack">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={editingBreed.isRareBreed || false}
                      onChange={e => setEditingBreed(prev => ({ ...prev, isRareBreed: e.target.checked }))}
                    />
                    Mark as rare breed
                  </label>
                </div>

                <div className="row" style={{ gap: '12px' }}>
                  <button 
                    className="btn" 
                    onClick={() => handleUpdateBreed(editingBreed.id, editingBreed)}
                  >
                    Update Breed
                  </button>
                  <button 
                    className="btn secondary" 
                    onClick={() => setEditingBreed(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
