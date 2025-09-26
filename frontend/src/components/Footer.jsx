import { useTranslation } from 'react-i18next'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      borderTop: '1px solid var(--glass-border)',
      marginTop: 'auto',
      padding: 'var(--spacing-md) 0',
      fontFamily: 'Times New Roman, serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 var(--spacing-lg)',
        '@media (max-width: 768px)': {
          padding: '0 var(--spacing-md)'
        }
      }}>
        {/* Professional Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)',
          '@media (max-width: 768px)': {
            flexDirection: 'column',
            textAlign: 'center',
            gap: 'var(--spacing-sm)'
          }
        }}>
          {/* Copyright */}
          <div style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
            fontWeight: '400',
            letterSpacing: '0.3px'
          }}>
            © 2024 PashuVision. All rights reserved.
          </div>
          
          {/* Contact Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            '@media (max-width: 768px)': {
              flexDirection: 'column',
              gap: 'var(--spacing-xs)'
            }
          }}>
            <div style={{
              color: 'var(--color-text-primary)',
              fontSize: '0.85rem',
              fontWeight: '500',
              letterSpacing: '0.2px'
            }}>
              support@pashuvision.com
            </div>
            <div style={{
              width: '1px',
              height: '16px',
              background: 'var(--color-border)',
              '@media (max-width: 768px)': {
                display: 'none'
              }
            }}></div>
            <div style={{
              color: 'var(--color-text-primary)',
              fontSize: '0.85rem',
              fontWeight: '500',
              letterSpacing: '0.2px'
            }}>
              +91 98765 43210
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
