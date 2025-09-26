import Header from '../components/Header.jsx'
import { useEffect, useRef, useState } from 'react'

export default function Scan() {
  const videoRef = useRef(null)
  const [manualId, setManualId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let stream
    ;(async () => {
      try {
        if ('BarcodeDetector' in window) {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          const video = videoRef.current
          if (!video) return
          video.srcObject = stream
          await video.play()
          const scan = async () => {
            if (!video.videoWidth) return requestAnimationFrame(scan)
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0)
            const codes = await detector.detect(canvas)
            if (codes && codes.length) {
              const v = codes[0].rawValue || ''
              const id = v.startsWith('animal:') ? v.slice(7) : v
              window.location.href = `/records?id=${encodeURIComponent(id)}`
              return
            }
            requestAnimationFrame(scan)
          }
          requestAnimationFrame(scan)
        } else {
          setError('BarcodeDetector not supported; use manual ID below')
        }
      } catch {
        setError('Camera access denied. Use manual ID below')
      }
    })()
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [])

  const go = () => {
    if (!manualId) return
    window.location.href = `/records?id=${encodeURIComponent(manualId)}`
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <h1>Scan QR</h1>
          {error && <div style={{ color: 'salmon' }}>{error}</div>}
          <video ref={videoRef} style={{ width: '100%', borderRadius: 8 }} muted playsInline />
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            <input className="input" placeholder="Enter Animal ID" value={manualId} onChange={e => setManualId(e.target.value)} />
            <button className="btn" onClick={go}>Open</button>
          </div>
        </div>
      </div>
    </>
  )
}


