const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class BulkService {
  constructor() {
    this.animalsFile = path.join(__dirname, '..', '..', 'data', 'animals.json');
  }

  exportToExcel(animals, filename = 'animals_export.xlsx') {
    try {
      // Prepare data for Excel
      const data = animals.map(animal => ({
        'Animal ID': animal.id,
        'Breed': animal.predictedBreed || '',
        'Owner Name': animal.ownerName || '',
        'Location': animal.location || '',
        'Age (Months)': animal.ageMonths || '',
        'Gender': animal.gender || '',
        'Status': animal.status || 'pending',
        'GPS Latitude': animal.gps?.lat || '',
        'GPS Longitude': animal.gps?.lng || '',
        'Captured At': animal.capturedAt || '',
        'Created At': animal.createdAt || '',
        'Notes': animal.notes || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Set column widths
      const colWidths = [
        { wch: 15 }, // Animal ID
        { wch: 20 }, // Breed
        { wch: 20 }, // Owner Name
        { wch: 25 }, // Location
        { wch: 12 }, // Age
        { wch: 10 }, // Gender
        { wch: 12 }, // Status
        { wch: 15 }, // GPS Lat
        { wch: 15 }, // GPS Lng
        { wch: 20 }, // Captured At
        { wch: 20 }, // Created At
        { wch: 30 }  // Notes
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Animals');
      
      // Write to buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return buffer;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  importFromExcel(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const imported = [];
      const errors = [];

      data.forEach((row, index) => {
        try {
          // Validate required fields
          if (!row['Animal ID'] && !row['Breed']) {
            errors.push(`Row ${index + 2}: Missing Animal ID or Breed`);
            return;
          }

          const animal = {
            id: row['Animal ID'] || this.generateId(),
            predictedBreed: row['Breed'] || '',
            ownerName: row['Owner Name'] || '',
            location: row['Location'] || '',
            ageMonths: row['Age (Months)'] ? Number(row['Age (Months)']) : null,
            gender: row['Gender'] || '',
            status: 'pending', // Imported records start as pending
            notes: row['Notes'] || '',
            createdAt: new Date().toISOString(),
            createdBy: 'import', // Mark as imported
            gps: null,
            capturedAt: null,
            imageUrls: []
          };

          // Parse GPS if provided
          if (row['GPS Latitude'] && row['GPS Longitude']) {
            animal.gps = {
              lat: Number(row['GPS Latitude']),
              lng: Number(row['GPS Longitude'])
            };
          }

          // Parse dates
          if (row['Captured At']) {
            animal.capturedAt = new Date(row['Captured At']).toISOString();
          }

          imported.push(animal);
        } catch (error) {
          errors.push(`Row ${index + 2}: ${error.message}`);
        }
      });

      return { imported, errors };
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }

  generateId() {
    return 'imp_' + Math.random().toString(36).substr(2, 9);
  }

  saveImportedAnimals(animals) {
    try {
      let existing = [];
      if (fs.existsSync(this.animalsFile)) {
        existing = JSON.parse(fs.readFileSync(this.animalsFile, 'utf8'));
      }
      
      const updated = [...existing, ...animals];
      fs.writeFileSync(this.animalsFile, JSON.stringify(updated, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving imported animals:', error);
      return false;
    }
  }

  createTemplate() {
    const template = [
      {
        'Animal ID': 'AUTO_GENERATED',
        'Breed': 'Gir (Cattle)',
        'Owner Name': 'John Doe',
        'Location': 'Village Name, District',
        'Age (Months)': 24,
        'Gender': 'female',
        'Status': 'pending',
        'GPS Latitude': 28.6139,
        'GPS Longitude': 77.2090,
        'Captured At': '2024-01-15T10:30:00Z',
        'Notes': 'Healthy animal, good condition'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(template);
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 25 },
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 20 }, { wch: 30 }
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}

module.exports = BulkService;
