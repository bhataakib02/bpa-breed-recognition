import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  })
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'flw',
    password: '',
    village: '',
    district: '',
    state: '',
    aadhaarId: '',
    permissions: []
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, filters])

  const loadUsers = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to load users')
      
      const data = await res.json()
      setUsers(data.users || data) // Handle both old array format and new object format
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role)
    }
    
    if (filters.status) {
      filtered = filtered.filter(user => user.isActive === (filters.status === 'active'))
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.village?.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredUsers(filtered)
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })
      
      if (!res.ok) throw new Error('Failed to add user')
      
      await loadUsers()
      setShowAddUser(false)
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'flw',
        password: '',
        village: '',
        district: '',
        state: '',
        aadhaarId: '',
        permissions: []
      })
      
      alert('✅ User added successfully')
    } catch (err) {
      setError(err.message || 'Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userId, updates) => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      if (!res.ok) throw new Error('Failed to update user')
      
      await loadUsers()
      setEditingUser(null)
      
      alert('✅ User updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to delete user')
      
      await loadUsers()
      alert('✅ User deleted successfully')
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const handleToggleUserStatus = async (userId, isActive) => {
    const token = localStorage.getItem('token')
    if (!token) return setError('Login required')
    
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (!res.ok) throw new Error('Failed to update user status')
      
      await loadUsers()
      alert(`✅ User ${!isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (err) {
      setError(err.message || 'Failed to update user status')
    }
  }

  const getRolePermissions = (role) => {
    const permissions = {
      flw: ['create_animal', 'view_own_animals', 'update_own_animals'],
      supervisor: ['review_animals', 'approve_animals', 'view_team_performance', 'bulk_operations'],
      admin: ['all'],
      vet: ['view_animals', 'update_health', 'schedule_treatments', 'view_health_reports'],
      govt: ['view_analytics', 'export_data', 'view_reports']
    }
    return permissions[role] || []
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: '#F44336',
      supervisor: '#FF9800',
      flw: '#4CAF50',
      vet: '#2196F3',
      govt: '#9C27B0'
    }
    return colors[role] || '#666'
  }

  const getStatusBadge = (isActive) => (
    <span style={{
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: isActive ? '#4CAF50' : '#F44336',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold'
    }}>
      {isActive ? 'ACTIVE' : 'INACTIVE'}
    </span>
  )

  if (loading) return <div>Loading users...</div>
  if (error) return <div style={{ color: 'salmon' }}>{error}</div>

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>👥 User Management</h1>
            <div className="row" style={{ gap: 8 }}>
              <button 
                className="btn" 
                onClick={() => setShowAddUser(true)}
              >
                ➕ Add User
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>🔍 Filters</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="stack">
                <label>Role</label>
                <select 
                  className="select" 
                  value={filters.role} 
                  onChange={e => setFilters(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="flw">Field Worker</option>
                  <option value="vet">Veterinarian</option>
                  <option value="govt">Government</option>
                </select>
              </div>
              <div className="stack">
                <label>Status</label>
                <select 
                  className="select" 
                  value={filters.status} 
                  onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="stack">
                <label>Search</label>
                <input 
                  className="input" 
                  value={filters.search} 
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by name, email, or village"
                />
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>👤 Users ({filteredUsers.length})</h3>
            </div>

            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <h3>No users found</h3>
                <p>Try adjusting your filters or add a new user.</p>
              </div>
            ) : (
              <div className="table">
                <div className="row" style={{ fontWeight: 'bold', background: 'var(--color-bg-secondary)' }}>
                  <div style={{ width: '200px' }}>Name</div>
                  <div style={{ width: '200px' }}>Email</div>
                  <div style={{ width: '120px' }}>Role</div>
                  <div style={{ width: '150px' }}>Location</div>
                  <div style={{ width: '100px' }}>Status</div>
                  <div style={{ width: '120px' }}>Last Active</div>
                  <div style={{ width: '150px' }}>Actions</div>
                </div>
                
                {filteredUsers.map(user => (
                  <div key={user.id} className="row">
                    <div style={{ width: '200px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                      <div style={{ color: 'var(--color-muted)' }}>{user.phone || 'No phone'}</div>
                    </div>
                    <div style={{ width: '200px', fontSize: '12px' }}>
                      {user.email}
                    </div>
                    <div style={{ width: '120px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: getRoleColor(user.role),
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ width: '150px', fontSize: '12px' }}>
                      {user.village ? `${user.village}, ${user.district}` : 'Not specified'}
                    </div>
                    <div style={{ width: '100px' }}>
                      {getStatusBadge(user.isActive)}
                    </div>
                    <div style={{ width: '120px', fontSize: '12px' }}>
                      {user.lastActive ? 
                        new Date(user.lastActive).toLocaleDateString() : 
                        'Never'
                      }
                    </div>
                    <div style={{ width: '150px' }}>
                      <div className="row" style={{ gap: 4 }}>
                        <button 
                          className="btn secondary" 
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                          onClick={() => setEditingUser(user)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn" 
                          style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px',
                            backgroundColor: user.isActive ? '#F44336' : '#4CAF50'
                          }}
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? '🔒' : '🔓'}
                        </button>
                        <button 
                          className="btn" 
                          style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#F44336' }}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Statistics */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3>📊 User Statistics</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Total Users</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>
                  {users.length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Active Users</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {users.filter(u => u.isActive).length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Field Workers</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>
                  {users.filter(u => u.role === 'flw').length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <h4>Supervisors</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0' }}>
                  {users.filter(u => u.role === 'supervisor').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUser && (
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
                <h2>➕ Add New User</h2>
                <button 
                  className="btn secondary" 
                  onClick={() => setShowAddUser(false)}
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleAddUser} className="stack" style={{ gap: '16px' }}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Name *</label>
                    <input 
                      className="input" 
                      value={newUser.name} 
                      onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="stack">
                    <label>Email *</label>
                    <input 
                      className="input" 
                      type="email" 
                      value={newUser.email} 
                      onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Phone</label>
                    <input 
                      className="input" 
                      type="tel" 
                      value={newUser.phone} 
                      onChange={e => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="stack">
                    <label>Role *</label>
                    <select 
                      className="select" 
                      value={newUser.role} 
                      onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      required
                    >
                      <option value="flw">Field Worker</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                      <option value="vet">Veterinarian</option>
                      <option value="govt">Government Official</option>
                    </select>
                  </div>
                </div>

                <div className="stack">
                  <label>Password *</label>
                  <input 
                    className="input" 
                    type="password" 
                    value={newUser.password} 
                    onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    required 
                  />
                </div>

                {newUser.role === 'flw' && (
                  <>
                    <div className="stack">
                      <label>Aadhaar ID</label>
                      <input 
                        className="input" 
                        value={newUser.aadhaarId} 
                        onChange={e => setNewUser(prev => ({ ...prev, aadhaarId: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="stack">
                        <label>Village</label>
                        <input 
                          className="input" 
                          value={newUser.village} 
                          onChange={e => setNewUser(prev => ({ ...prev, village: e.target.value }))}
                        />
                      </div>
                      <div className="stack">
                        <label>District</label>
                        <input 
                          className="input" 
                          value={newUser.district} 
                          onChange={e => setNewUser(prev => ({ ...prev, district: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="stack">
                      <label>State</label>
                      <input 
                        className="input" 
                        value={newUser.state} 
                        onChange={e => setNewUser(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div className="row" style={{ gap: '12px' }}>
                  <button 
                    className="btn" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add User'}
                  </button>
                  <button 
                    className="btn secondary" 
                    type="button"
                    onClick={() => setShowAddUser(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
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
                <h2>✏️ Edit User</h2>
                <button 
                  className="btn secondary" 
                  onClick={() => setEditingUser(null)}
                >
                  ✕ Close
                </button>
              </div>

              <div className="stack" style={{ gap: '16px' }}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Name</label>
                    <input 
                      className="input" 
                      value={editingUser.name} 
                      onChange={e => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="stack">
                    <label>Email</label>
                    <input 
                      className="input" 
                      type="email" 
                      value={editingUser.email} 
                      onChange={e => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="stack">
                    <label>Phone</label>
                    <input 
                      className="input" 
                      type="tel" 
                      value={editingUser.phone || ''} 
                      onChange={e => setEditingUser(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="stack">
                    <label>Role</label>
                    <select 
                      className="select" 
                      value={editingUser.role} 
                      onChange={e => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="flw">Field Worker</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                      <option value="vet">Veterinarian</option>
                      <option value="govt">Government Official</option>
                    </select>
                  </div>
                </div>

                {editingUser.role === 'flw' && (
                  <>
                    <div className="stack">
                      <label>Aadhaar ID</label>
                      <input 
                        className="input" 
                        value={editingUser.aadhaarId || ''} 
                        onChange={e => setEditingUser(prev => ({ ...prev, aadhaarId: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="stack">
                        <label>Village</label>
                        <input 
                          className="input" 
                          value={editingUser.village || ''} 
                          onChange={e => setEditingUser(prev => ({ ...prev, village: e.target.value }))}
                        />
                      </div>
                      <div className="stack">
                        <label>District</label>
                        <input 
                          className="input" 
                          value={editingUser.district || ''} 
                          onChange={e => setEditingUser(prev => ({ ...prev, district: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="stack">
                      <label>State</label>
                      <input 
                        className="input" 
                        value={editingUser.state || ''} 
                        onChange={e => setEditingUser(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div className="stack">
                  <label>Permissions</label>
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {getRolePermissions(editingUser.role).map(permission => (
                      <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="checkbox" 
                          checked={editingUser.permissions?.includes(permission) || false}
                          onChange={e => {
                            const permissions = editingUser.permissions || []
                            if (e.target.checked) {
                              setEditingUser(prev => ({ 
                                ...prev, 
                                permissions: [...permissions, permission] 
                              }))
                            } else {
                              setEditingUser(prev => ({ 
                                ...prev, 
                                permissions: permissions.filter(p => p !== permission) 
                              }))
                            }
                          }}
                        />
                        <span style={{ fontSize: '12px' }}>{permission.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="row" style={{ gap: '12px' }}>
                  <button 
                    className="btn" 
                    onClick={() => handleUpdateUser(editingUser.id, editingUser)}
                  >
                    Update User
                  </button>
                  <button 
                    className="btn secondary" 
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

