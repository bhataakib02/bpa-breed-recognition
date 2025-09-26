import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('flw')
  const [aadhaarId, setAadhaarId] = useState('')
  const [village, setVillage] = useState('')
  const [district, setDistrict] = useState('')
  const [state, setState] = useState('')
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const checkBiometricSupport = () => {
    setBiometricEnabled('credentials' in navigator && 'create' in navigator.credentials)
  }

  useEffect(() => {
    checkBiometricSupport()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          phone,
          password, 
          role,
          aadhaarId,
          village,
          district,
          state,
          biometricEnabled
        }),
      })
      let data = null
      try { data = await res.json() } catch { /* ignore parse errors */ }
      if (!res.ok) throw new Error((data && data.error) || `Register failed (${res.status})`)
      if (!data) throw new Error('Empty response from server')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Show FLW ID for FLW users
      if (role === 'flw' && data.user.flwId) {
        alert(`Registration successful!\n\nYour FLW ID: ${data.user.flwId}\n\nPlease save this ID for future reference.`)
      }
      
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && name && email && phone && password && confirmPassword) {
      setStep(2)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E8F5E8 0%, #F3E5F5 50%, #E3F2FD 100%)',
        padding: 'var(--spacing-lg)'
      }}>
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-xl)',
          width: '100%',
          maxWidth: '500px',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--color-primary-green), var(--color-primary-blue))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-md) auto',
              fontSize: '2rem',
              color: 'white',
              fontWeight: 'bold',
              fontFamily: 'Times New Roman, serif'
            }}>
              P
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-sm)',
              fontFamily: 'Times New Roman, serif',
              color: 'var(--color-text-primary)'
            }}>
              Join PashuVision
            </h1>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '1rem',
              margin: 0
            }}>
              Create your account to start managing livestock
            </p>
          </div>

          {/* Progress Steps */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: step >= 1 ? 'var(--color-primary-green)' : 'var(--color-border)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                fontFamily: 'Times New Roman, serif'
              }}>
                1
              </div>
              <div style={{
                width: '40px',
                height: '2px',
                background: step >= 2 ? 'var(--color-primary-green)' : 'var(--color-border)'
              }}></div>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: step >= 2 ? 'var(--color-primary-green)' : 'var(--color-border)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                fontFamily: 'Times New Roman, serif'
              }}>
                2
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'Times New Roman, serif'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    fontSize: '1rem',
                    fontFamily: 'Times New Roman, serif'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'Times New Roman, serif'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    fontSize: '1rem',
                    fontFamily: 'Times New Roman, serif'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'Times New Roman, serif'
                }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    fontSize: '1rem',
                    fontFamily: 'Times New Roman, serif'
                  }}
                />
          </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'Times New Roman, serif'
                }}>
                  Password *
                </label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    fontSize: '1rem',
                    fontFamily: 'Times New Roman, serif'
                  }}
                />
          </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'Times New Roman, serif'
                }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  className="input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    fontSize: '1rem',
                    fontFamily: 'Times New Roman, serif'
                  }}
                />
          </div>

              <button
                type="submit"
                className="btn"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  fontFamily: 'Times New Roman, serif',
                  marginTop: 'var(--spacing-sm)'
                }}
              >
                Next Step
              </button>
            </form>
          )}

          {/* Step 2: Role & Location */}
          {step === 2 && (
            <form onSubmit={onSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'Times New Roman, serif'
                }}>
                  Role *
                </label>
                <select
                  className="input"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    fontSize: '1rem',
                    fontFamily: 'Times New Roman, serif'
                  }}
                >
                  <option value="flw">Field Level Worker</option>
              <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrator</option>
              <option value="vet">Veterinarian</option>
                  <option value="govt">Government Official</option>
            </select>
          </div>

              {role === 'flw' && (
                <>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-xs)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'Times New Roman, serif'
                    }}>
                      Aadhaar ID *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={aadhaarId}
                      onChange={e => setAadhaarId(e.target.value)}
                      placeholder="Enter your Aadhaar ID"
                      required
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        fontSize: '1rem',
                        fontFamily: 'Times New Roman, serif'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-xs)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'Times New Roman, serif'
                    }}>
                      Village *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={village}
                      onChange={e => setVillage(e.target.value)}
                      placeholder="Enter your village"
                      required
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        fontSize: '1rem',
                        fontFamily: 'Times New Roman, serif'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-xs)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'Times New Roman, serif'
                    }}>
                      District *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="Enter your district"
                      required
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        fontSize: '1rem',
                        fontFamily: 'Times New Roman, serif'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-xs)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'Times New Roman, serif'
                    }}>
                      State *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="Enter your state"
                      required
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        fontSize: '1rem',
                        fontFamily: 'Times New Roman, serif'
                      }}
                    />
                  </div>
                </>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-sm)'
              }}>
                <input
                  type="checkbox"
                  id="biometric"
                  checked={biometricEnabled}
                  onChange={e => setBiometricEnabled(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px'
                  }}
                />
                <label htmlFor="biometric" style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'Times New Roman, serif',
                  cursor: 'pointer'
                }}>
                  Enable biometric login (fingerprint/face ID)
                </label>
              </div>

              {error && (
                <div style={{
                  background: '#ffebee',
                  color: '#c62828',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  border: '1px solid #ffcdd2'
                }}>
                  {error}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-sm)'
              }}>
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn secondary"
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-md)',
                    fontSize: '1rem',
                    fontFamily: 'Times New Roman, serif'
                  }}
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-md)',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    fontFamily: 'Times New Roman, serif'
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
          </div>
        </form>
          )}

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            marginTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--spacing-md)'
          }}>
            <p style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.9rem',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Already have an account?
            </p>
            <Link
              to="/login"
              style={{
                color: 'var(--color-primary-green)',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                fontFamily: 'Times New Roman, serif'
              }}
            >
              Sign In
            </Link>
          </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}