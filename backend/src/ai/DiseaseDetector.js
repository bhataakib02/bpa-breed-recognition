const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class DiseaseDetector {
  constructor() {
    this.diseaseModels = new Map();
    this.loadModels();
  }

  async loadModels() {
    // In a real implementation, these would be actual ONNX models
    console.log('Loading disease detection models...');
    
    // Mock disease detection capabilities
    this.diseaseModels.set('skin_infection', {
      name: 'Skin Infection Detection',
      confidence: 0.85,
      description: 'Detects bacterial and fungal skin infections'
    });
    
    this.diseaseModels.set('malnutrition', {
      name: 'Malnutrition Detection', 
      confidence: 0.78,
      description: 'Detects signs of malnutrition and poor body condition'
    });
    
    this.diseaseModels.set('lameness', {
      name: 'Lameness Detection',
      confidence: 0.72,
      description: 'Detects mobility issues and lameness'
    });
    
    this.diseaseModels.set('mastitis', {
      name: 'Mastitis Detection',
      confidence: 0.80,
      description: 'Detects udder inflammation and mastitis'
    });
    
    console.log('Disease detection models loaded');
  }

  async detectDiseases(imageBuffer) {
    try {
      // Process image for disease detection
      const processedImage = await sharp(imageBuffer)
        .resize(224, 224)
        .normalize()
        .raw()
        .toBuffer();

      // Mock disease detection results
      const diseases = [];
      
      // Simulate different disease detections based on image analysis
      const randomFactor = Math.random();
      
      if (randomFactor > 0.7) {
        diseases.push({
          type: 'skin_infection',
          confidence: 0.75 + Math.random() * 0.2,
          severity: this.getSeverity(0.75 + Math.random() * 0.2),
          symptoms: ['Redness', 'Swelling', 'Discharge'],
          recommendations: [
            'Apply topical antibiotic ointment',
            'Keep area clean and dry',
            'Monitor for spreading',
            'Consult veterinarian if condition worsens'
          ],
          urgency: 'medium'
        });
      }
      
      if (randomFactor > 0.8) {
        diseases.push({
          type: 'malnutrition',
          confidence: 0.65 + Math.random() * 0.25,
          severity: this.getSeverity(0.65 + Math.random() * 0.25),
          symptoms: ['Poor body condition', 'Visible ribs', 'Dull coat'],
          recommendations: [
            'Improve nutrition quality',
            'Increase feed quantity',
            'Add mineral supplements',
            'Regular health monitoring'
          ],
          urgency: 'high'
        });
      }
      
      if (randomFactor > 0.85) {
        diseases.push({
          type: 'lameness',
          confidence: 0.70 + Math.random() * 0.2,
          severity: this.getSeverity(0.70 + Math.random() * 0.2),
          symptoms: ['Limping', 'Swollen joints', 'Reluctance to move'],
          recommendations: [
            'Rest and limit movement',
            'Apply cold compress',
            'Check for hoof problems',
            'Veterinary examination recommended'
          ],
          urgency: 'high'
        });
      }

      return {
        diseases,
        overallHealthScore: this.calculateHealthScore(diseases),
        recommendations: this.getGeneralRecommendations(diseases),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Disease detection error:', error);
      return {
        diseases: [],
        overallHealthScore: 0.5,
        recommendations: ['Unable to analyze image'],
        error: 'Detection failed'
      };
    }
  }

  getSeverity(confidence) {
    if (confidence > 0.8) return 'severe';
    if (confidence > 0.6) return 'moderate';
    return 'mild';
  }

  calculateHealthScore(diseases) {
    if (diseases.length === 0) return 0.9; // Healthy
    
    const avgConfidence = diseases.reduce((sum, d) => sum + d.confidence, 0) / diseases.length;
    return Math.max(0.1, 1 - avgConfidence);
  }

  getGeneralRecommendations(diseases) {
    const recommendations = [
      'Regular veterinary checkups',
      'Maintain clean living environment',
      'Provide balanced nutrition',
      'Monitor animal behavior daily'
    ];
    
    if (diseases.some(d => d.type === 'skin_infection')) {
      recommendations.push('Improve hygiene practices');
    }
    
    if (diseases.some(d => d.type === 'malnutrition')) {
      recommendations.push('Review feeding program');
    }
    
    if (diseases.some(d => d.type === 'lameness')) {
      recommendations.push('Check flooring and environment');
    }
    
    return recommendations;
  }

  async generateHealthReport(animalId, diseases, healthScore) {
    const report = {
      animalId,
      timestamp: new Date().toISOString(),
      healthScore,
      diseases: diseases.map(d => ({
        type: d.type,
        confidence: d.confidence,
        severity: d.severity,
        urgency: d.urgency
      })),
      recommendations: this.getGeneralRecommendations(diseases),
      nextCheckup: this.calculateNextCheckup(diseases)
    };
    
    return report;
  }

  calculateNextCheckup(diseases) {
    const urgencyLevels = diseases.map(d => d.urgency);
    
    if (urgencyLevels.includes('high')) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    } else if (urgencyLevels.includes('medium')) {
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
    } else {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month
    }
  }
}

module.exports = DiseaseDetector;
