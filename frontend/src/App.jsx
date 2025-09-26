import { Link } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import DynamicStats from './components/DynamicStats.jsx'
import './App.css'

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <main style={{ flex: 1 }}>
        {/* Hero Section - Government Style */}
        <section style={{
          background: 'linear-gradient(135deg, #1B5E20 0%, #0D47A1 50%, #E8F5E8 100%)',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4
          }}></div>
          
          <div className="container" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--spacing-xl)',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr',
              gap: 'var(--spacing-lg)',
              textAlign: 'center'
            }
          }}>
            {/* Left Content */}
            <div style={{
              color: 'white',
              '@media (max-width: 768px)': {
                order: 2
              }
            }}>
              
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: 'bold',
                marginBottom: 'var(--spacing-md)',
                fontFamily: 'Times New Roman, serif',
                lineHeight: 1.2,
                textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
                background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                '@media (max-width: 768px)': {
                  fontSize: '2.5rem'
                },
                '@media (max-width: 480px)': {
                  fontSize: '2rem'
                }
              }}>
                PashuVision
              </h1>
              
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '600',
                marginBottom: 'var(--spacing-md)',
                opacity: 0.95,
                lineHeight: 1.4,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                fontFamily: 'Times New Roman, serif',
                '@media (max-width: 768px)': {
                  fontSize: '1.5rem'
                }
              }}>
                Digital Livestock Management System
              </h2>
              
              <p style={{
                fontSize: '1.2rem',
                marginBottom: 'var(--spacing-lg)',
                opacity: 0.9,
                lineHeight: 1.6,
                fontWeight: '400',
                '@media (max-width: 768px)': {
                  fontSize: '1.1rem'
                }
              }}>
                Empowering farmers with AI-powered breed recognition, health monitoring, and comprehensive livestock analytics for sustainable agriculture
              </p>
              
              {/* Key Features */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-lg)',
                '@media (max-width: 768px)': {
                  justifyContent: 'center'
                }
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  🤖 AI Breed Recognition
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  📱 Mobile Ready
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  🌐 Multi-Language
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  🔒 Secure & Reliable
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                flexWrap: 'wrap',
                '@media (max-width: 768px)': {
                  justifyContent: 'center'
                }
              }}>
                <Link 
                  className="btn" 
                  to="/login"
                  style={{
                    fontSize: '1.1rem',
                    padding: 'var(--spacing-md) var(--spacing-xl)',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'all 0.3s ease',
                    fontWeight: '600',
                    fontFamily: 'Times New Roman, serif'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)'
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  Login to System
                </Link>
                <Link 
                  className="btn secondary" 
                  to="/register"
                  style={{
                    fontSize: '1.1rem',
                    padding: 'var(--spacing-md) var(--spacing-xl)',
                    background: 'transparent',
                    border: '2px solid white',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'all 0.3s ease',
                    fontWeight: '600',
                    fontFamily: 'Times New Roman, serif'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  Register Now
                </Link>
              </div>
            </div>

            {/* Right Content - Official Style */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '@media (max-width: 768px)': {
                order: 1
              }
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(15px)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-xl)',
                border: '2px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-md)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                    alt="Indian Cow"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                    alt="Indian Buffalo"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: 'var(--spacing-sm)',
                  fontFamily: 'Times New Roman, serif',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  Digital Livestock Registry
                </h3>
                <p style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1rem',
                  margin: 0,
                  fontWeight: '500',
                  lineHeight: 1.5
                }}>
                  Comprehensive AI-powered platform for cattle and buffalo management, health monitoring, and breed identification
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Government Statistics Section */}
        <section style={{
          padding: 'var(--spacing-xl) 0',
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <div className="container">
            <div style={{
              textAlign: 'center',
              marginBottom: 'var(--spacing-xl)'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: 'var(--spacing-md)',
                fontFamily: 'Times New Roman, serif',
                color: 'var(--color-text-primary)'
              }}>
                Platform Statistics
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-secondary)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6
              }}>
                Trusted by thousands of farmers and agricultural professionals across India
              </p>
            </div>
            
            <DynamicStats />
          </div>
        </section>

        {/* Features Section - Government Style */}
        <section style={{
          padding: 'var(--spacing-xl) 0',
          background: 'var(--color-bg-primary)'
        }}>
      <div className="container">
            <div style={{
              textAlign: 'center',
              marginBottom: 'var(--spacing-xl)'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: 'var(--spacing-md)',
                fontFamily: 'Times New Roman, serif',
                color: 'var(--color-text-primary)'
              }}>
                Key Features
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-secondary)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6
              }}>
                Advanced technology meets traditional livestock management for modern agricultural practices
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              {/* Feature 1 */}
              <div className="card" style={{
                textAlign: 'center',
                padding: 'var(--spacing-xl)',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                transition: 'transform 0.3s ease',
                boxShadow: 'var(--shadow-md)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="AI Technology"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: 'var(--spacing-md)',
                    border: '3px solid var(--color-primary-green)'
                  }}
                />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: 'var(--spacing-sm)',
                  fontFamily: 'Times New Roman, serif',
                  color: 'var(--color-text-primary)'
                }}>
                  AI-Powered Recognition
                </h3>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6
                }}>
                  Advanced machine learning algorithms for accurate breed identification and health monitoring
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card" style={{
                textAlign: 'center',
                padding: 'var(--spacing-xl)',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                transition: 'transform 0.3s ease',
                boxShadow: 'var(--shadow-md)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="Mobile Technology"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: 'var(--spacing-md)',
                    border: '3px solid var(--color-primary-blue)'
                  }}
                />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: 'var(--spacing-sm)',
                  fontFamily: 'Times New Roman, serif',
                  color: 'var(--color-text-primary)'
                }}>
                  Multi-Language Support
                </h3>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6
                }}>
                  Available in English, Hindi, and Urdu with voice commands for accessibility
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card" style={{
                textAlign: 'center',
                padding: 'var(--spacing-xl)',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                transition: 'transform 0.3s ease',
                boxShadow: 'var(--shadow-md)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                  alt="Mobile Ready"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: 'var(--spacing-md)',
                    border: '3px solid var(--color-golden-yellow)'
                  }}
                />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: 'var(--spacing-sm)',
                  fontFamily: 'Times New Roman, serif',
                  color: 'var(--color-text-primary)'
                }}>
                  Mobile Ready
                </h3>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6
                }}>
                  Responsive design that works perfectly on all devices with offline capabilities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Official CTA Section */}
        <section style={{
          padding: 'var(--spacing-xl) 0',
          background: 'linear-gradient(135deg, var(--color-primary-green), var(--color-primary-blue))',
          textAlign: 'center'
        }}>
          <div className="container">
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-md)',
              fontFamily: 'Times New Roman, serif',
              color: 'white'
            }}>
              Join the Digital Livestock Revolution
            </h2>
            <p style={{
              fontSize: '1.2rem',
              marginBottom: 'var(--spacing-xl)',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '600px',
              margin: '0 auto var(--spacing-xl) auto'
            }}>
              Be part of India's digital transformation in livestock management
            </p>
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link 
                className="btn secondary" 
                to="/help"
                style={{
                  fontSize: '1.2rem',
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Times New Roman, serif'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                  e.target.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                Learn More
              </Link>
        </div>
      </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App