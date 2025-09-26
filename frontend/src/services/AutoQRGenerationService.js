// Auto QR Generation Service
import QRCode from 'qrcode'

class AutoQRGenerationService {
  constructor() {
    this.qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    }
  }

  // Generate QR code for animal record
  async generateAnimalQR(animalData) {
    try {
      const qrData = {
        type: 'animal_record',
        id: animalData.id,
        earTag: animalData.earTag,
        breed: animalData.breed,
        owner: animalData.owner,
        village: animalData.village,
        district: animalData.district,
        state: animalData.state,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }

      const qrString = JSON.stringify(qrData)
      const qrCodeDataURL = await QRCode.toDataURL(qrString, this.qrOptions)
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrData,
        qrString: qrString
      }
    } catch (error) {
      console.error('QR generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate QR code for vaccination record
  async generateVaccinationQR(vaccinationData) {
    try {
      const qrData = {
        type: 'vaccination_record',
        animalId: vaccinationData.animalId,
        vaccineType: vaccinationData.vaccineType,
        date: vaccinationData.date,
        veterinarian: vaccinationData.veterinarian,
        nextDue: vaccinationData.nextDue,
        batchNumber: vaccinationData.batchNumber,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }

      const qrString = JSON.stringify(qrData)
      const qrCodeDataURL = await QRCode.toDataURL(qrString, this.qrOptions)
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrData,
        qrString: qrString
      }
    } catch (error) {
      console.error('Vaccination QR generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate QR code for health record
  async generateHealthQR(healthData) {
    try {
      const qrData = {
        type: 'health_record',
        animalId: healthData.animalId,
        healthStatus: healthData.healthStatus,
        symptoms: healthData.symptoms,
        diagnosis: healthData.diagnosis,
        treatment: healthData.treatment,
        veterinarian: healthData.veterinarian,
        date: healthData.date,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }

      const qrString = JSON.stringify(qrData)
      const qrCodeDataURL = await QRCode.toDataURL(qrString, this.qrOptions)
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrData,
        qrString: qrString
      }
    } catch (error) {
      console.error('Health QR generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate QR code for field worker
  async generateWorkerQR(workerData) {
    try {
      const qrData = {
        type: 'field_worker',
        id: workerData.id,
        name: workerData.name,
        phone: workerData.phone,
        role: workerData.role,
        village: workerData.village,
        district: workerData.district,
        state: workerData.state,
        permissions: workerData.permissions,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }

      const qrString = JSON.stringify(qrData)
      const qrCodeDataURL = await QRCode.toDataURL(qrString, this.qrOptions)
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrData,
        qrString: qrString
      }
    } catch (error) {
      console.error('Worker QR generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate QR code for location
  async generateLocationQR(locationData) {
    try {
      const qrData = {
        type: 'location',
        village: locationData.village,
        district: locationData.district,
        state: locationData.state,
        coordinates: locationData.coordinates,
        pincode: locationData.pincode,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }

      const qrString = JSON.stringify(qrData)
      const qrCodeDataURL = await QRCode.toDataURL(qrString, this.qrOptions)
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrData,
        qrString: qrString
      }
    } catch (error) {
      console.error('Location QR generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate QR code for scheme
  async generateSchemeQR(schemeData) {
    try {
      const qrData = {
        type: 'scheme',
        schemeId: schemeData.schemeId,
        schemeName: schemeData.schemeName,
        description: schemeData.description,
        eligibility: schemeData.eligibility,
        benefits: schemeData.benefits,
        applicationProcess: schemeData.applicationProcess,
        contactInfo: schemeData.contactInfo,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }

      const qrString = JSON.stringify(qrData)
      const qrCodeDataURL = await QRCode.toDataURL(qrString, this.qrOptions)
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrData,
        qrString: qrString
      }
    } catch (error) {
      console.error('Scheme QR generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate QR code with custom data
  async generateCustomQR(data, options = {}) {
    try {
      const qrOptions = { ...this.qrOptions, ...options }
      const qrString = typeof data === 'string' ? data : JSON.stringify(data)
      const qrCodeDataURL = await QRCode.toDataURL(qrString, qrOptions)
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: data,
        qrString: qrString
      }
    } catch (error) {
      console.error('Custom QR generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate QR code as SVG
  async generateQRSVG(data, options = {}) {
    try {
      const qrOptions = { ...this.qrOptions, ...options }
      const qrString = typeof data === 'string' ? data : JSON.stringify(data)
      const qrCodeSVG = await QRCode.toString(qrString, { ...qrOptions, type: 'svg' })
      
      return {
        success: true,
        qrCode: qrCodeSVG,
        qrData: data,
        qrString: qrString
      }
    } catch (error) {
      console.error('QR SVG generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate QR code for printing
  async generateQRForPrinting(data, options = {}) {
    try {
      const printOptions = {
        ...this.qrOptions,
        ...options,
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }

      const qrString = typeof data === 'string' ? data : JSON.stringify(data)
      const qrCodeDataURL = await QRCode.toDataURL(qrString, printOptions)
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: data,
        qrString: qrString,
        printReady: true
      }
    } catch (error) {
      console.error('Print QR generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Batch generate QR codes
  async generateBatchQRCodes(dataArray, type = 'custom') {
    const results = []
    
    for (const data of dataArray) {
      let result
      
      switch (type) {
        case 'animal':
          result = await this.generateAnimalQR(data)
          break
        case 'vaccination':
          result = await this.generateVaccinationQR(data)
          break
        case 'health':
          result = await this.generateHealthQR(data)
          break
        case 'worker':
          result = await this.generateWorkerQR(data)
          break
        case 'location':
          result = await this.generateLocationQR(data)
          break
        case 'scheme':
          result = await this.generateSchemeQR(data)
          break
        default:
          result = await this.generateCustomQR(data)
      }
      
      results.push({
        data: data,
        result: result
      })
    }
    
    return results
  }

  // Validate QR code data
  validateQRData(qrData, expectedType) {
    try {
      if (!qrData || typeof qrData !== 'object') {
        return { valid: false, error: 'Invalid QR data format' }
      }

      if (qrData.type !== expectedType) {
        return { valid: false, error: `Expected type ${expectedType}, got ${qrData.type}` }
      }

      if (!qrData.version) {
        return { valid: false, error: 'Missing version information' }
      }

      if (!qrData.generatedAt) {
        return { valid: false, error: 'Missing generation timestamp' }
      }

      // Check if QR code is expired (older than 1 year)
      const generatedDate = new Date(qrData.generatedAt)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      if (generatedDate < oneYearAgo) {
        return { valid: false, error: 'QR code has expired' }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  // Get QR code information
  getQRInfo(qrData) {
    return {
      type: qrData.type,
      version: qrData.version,
      generatedAt: qrData.generatedAt,
      age: this.getQRAge(qrData.generatedAt),
      isValid: this.validateQRData(qrData, qrData.type).valid
    }
  }

  // Calculate QR code age
  getQRAge(generatedAt) {
    const generatedDate = new Date(generatedAt)
    const now = new Date()
    const diffTime = Math.abs(now - generatedDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Generate QR code with logo
  async generateQRWithLogo(data, logoDataURL, options = {}) {
    try {
      const qrOptions = { ...this.qrOptions, ...options }
      const qrString = typeof data === 'string' ? data : JSON.stringify(data)
      
      // Generate base QR code
      const qrCodeDataURL = await QRCode.toDataURL(qrString, qrOptions)
      
      // Create canvas to add logo
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Set canvas size
      canvas.width = qrOptions.width
      canvas.height = qrOptions.width
      
      // Draw QR code
      const qrImage = new Image()
      qrImage.src = qrCodeDataURL
      
      return new Promise((resolve) => {
        qrImage.onload = () => {
          ctx.drawImage(qrImage, 0, 0)
          
          // Draw logo in center
          const logoSize = qrOptions.width * 0.2
          const logoX = (qrOptions.width - logoSize) / 2
          const logoY = (qrOptions.width - logoSize) / 2
          
          const logoImage = new Image()
          logoImage.src = logoDataURL
          
          logoImage.onload = () => {
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
            
            const finalQRCode = canvas.toDataURL('image/png')
            
            resolve({
              success: true,
              qrCode: finalQRCode,
              qrData: data,
              qrString: qrString,
              hasLogo: true
            })
          }
        }
      })
    } catch (error) {
      console.error('QR with logo generation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default AutoQRGenerationService


