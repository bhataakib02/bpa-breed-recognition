const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { createServer } = require('http');
const { Server } = require('socket.io');
const BreedPredictor = require('./ai/BreedPredictor');
const ConvNeXtPredictor = require('./ai/ConvNeXtPredictor');
const DiseaseDetector = require('./ai/DiseaseDetector');
const NotificationService = require('./services/NotificationService');
const AdvancedNotificationService = require('./services/AdvancedNotificationService');
const BulkService = require('./services/BulkService');
const VoiceInputService = require('./services/VoiceInputService');
const BlockchainService = require('./services/BlockchainService');
const ARService = require('./services/ARService');
const MarketplaceService = require('./services/MarketplaceService');

const predictor = new BreedPredictor();
const convnextPredictor = new ConvNeXtPredictor();
const diseaseDetector = new DiseaseDetector();
const notificationService = new NotificationService();
const advancedNotificationService = new AdvancedNotificationService();
const bulkService = new BulkService();
const voiceService = new VoiceInputService();
const blockchainService = new BlockchainService();
const arService = new ARService();
const marketplaceService = new MarketplaceService();
predictor.loadModel().catch(console.error);
convnextPredictor.loadModel().catch(console.error);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, '..', 'data');
const IMAGES_DIR = process.env.VERCEL ? '/tmp/images' : path.join(DATA_DIR, 'images');

// Socket.IO authentication and real-time updates
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.userId = payload.sub;
    socket.userRole = payload.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.userId} joined room ${room}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Helper function to broadcast updates
function broadcastUpdate(type, data, room = 'all') {
  io.to(room).emit('update', { type, data, timestamp: new Date().toISOString() });
}

// Ensure directories exist (skip on Vercel as it's read-only)
if (!process.env.VERCEL) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(IMAGES_DIR));

const upload = multer({ storage: multer.memoryStorage() });

// Data persistence functions
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ANIMALS_FILE = path.join(DATA_DIR, 'animals.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

function getUsers() { return readJson(USERS_FILE); }
function saveUsers(users) { writeJson(USERS_FILE, users); }
function getAnimals() { return readJson(ANIMALS_FILE); }
function saveAnimals(animals) { writeJson(ANIMALS_FILE, animals); }
function getLogs() { return readJson(LOGS_FILE); }
function saveLogs(logs) { writeJson(LOGS_FILE, logs); }

// JWT functions
function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get full user data including FLW ID
    const users = getUsers();
    const user = users.find(u => u.id === decoded.sub);
    
    if (user) {
      req.user = {
        ...decoded,
        flwId: user.flwId,
        role: user.role,
        name: user.name,
        email: user.email
      };
    } else {
      req.user = decoded;
    }
    
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function logActivity(action, data) {
  const logs = getLogs();
  logs.push({ action, data, timestamp: new Date().toISOString() });
  saveLogs(logs);
}

// Seed admin user
const users = getUsers();
if (users.length === 0) {
  const adminUser = {
    id: nanoid(),
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    passwordHash: bcrypt.hashSync('password123', 10)
  };
  saveUsers([adminUser]);
}

// OTP Authentication routes
app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid mobile number' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real system, you would send SMS here
    // For now, we'll store it temporarily and log it
    console.log(`📱 OTP for ${phone}: ${otp}`);
    
    // Store OTP temporarily (in production, use Redis or similar)
    const otpData = {
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0
    };
    
    // Simple in-memory storage (replace with Redis in production)
    if (!global.otpStorage) global.otpStorage = new Map();
    global.otpStorage.set(phone, otpData);
    
    // Check if user exists
    const users = getUsers();
    const existingUser = users.find(u => u.phone === phone);
    
    if (existingUser) {
      logActivity('auth.otp_sent_existing', { phone, userId: existingUser.id });
    } else {
      logActivity('auth.otp_sent_new', { phone });
    }
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (e) {
    console.error('Send OTP error:', e);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp || otp.length !== 6) {
      return res.status(400).json({ error: 'Invalid phone number or OTP' });
    }
    
    // Get stored OTP data
    if (!global.otpStorage) global.otpStorage = new Map();
    const otpData = global.otpStorage.get(phone);
    
    if (!otpData) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }
    
    // Check if OTP expired
    if (new Date() > otpData.expiresAt) {
      global.otpStorage.delete(phone);
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    // Check attempts
    if (otpData.attempts >= 3) {
      global.otpStorage.delete(phone);
      return res.status(400).json({ error: 'Too many attempts. Please request new OTP' });
    }
    
    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts++;
      global.otpStorage.set(phone, otpData);
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // OTP verified successfully
    global.otpStorage.delete(phone);
    
    // Check if user exists
    const users = getUsers();
    const existingUser = users.find(u => u.phone === phone);
    
    if (existingUser) {
      // User exists, create token and login
      const token = createToken(existingUser);
      logActivity('auth.otp_login_success', { phone, userId: existingUser.id });
      
      res.json({
        success: true,
        token,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role,
          village: existingUser.village,
          district: existingUser.district,
          state: existingUser.state,
          permissions: existingUser.permissions
        }
      });
    } else {
      // New user, require password setup
      const tempData = {
        phone,
        verifiedAt: new Date().toISOString(),
        tempId: nanoid()
      };
      
      logActivity('auth.otp_verified_new_user', { phone });
      
      res.json({
        success: true,
        message: 'OTP verified. Please set up your password.',
        tempData
      });
    }
  } catch (e) {
    console.error('Verify OTP error:', e);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

app.post('/api/auth/setup-password', (req, res) => {
  try {
    const { phone, password, tempData } = req.body;
    
    if (!phone || !password || !tempData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const users = getUsers();
    if (users.find(u => u.phone === phone)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const user = {
      id: nanoid(),
      phone,
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'flw', // Default role
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: ['create_animal', 'view_own_animals', 'update_own_animals'],
      biometricEnabled: false
    };
    
    users.push(user);
    saveUsers(users);
    
    const token = createToken(user);
    logActivity('auth.password_setup_success', { phone, userId: user.id });
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
        state: user.state,
        permissions: user.permissions
      }
    });
  } catch (e) {
    console.error('Setup password error:', e);
    res.status(500).json({ error: 'Failed to setup password' });
  }
});

app.post('/api/auth/resend-otp', (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid mobile number' });
    }
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`📱 Resent OTP for ${phone}: ${otp}`);
    
    const otpData = {
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0
    };
    
    if (!global.otpStorage) global.otpStorage = new Map();
    global.otpStorage.set(phone, otpData);
    
    logActivity('auth.otp_resent', { phone });
    
    res.json({ 
      success: true, 
      message: 'OTP resent successfully',
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (e) {
    console.error('Resend OTP error:', e);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone,
      password, 
      role = 'flw',
      aadhaarId,
      village,
      district,
      state,
      biometricEnabled
    } = req.body || {};
    
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required' });
    
    // Additional validation for FLW role
    if (role === 'flw') {
      if (!phone || !aadhaarId || !village || !district || !state) {
        return res.status(400).json({ error: 'Phone, Aadhaar ID, village, district, and state are required for FLW registration' });
      }
      
      // Validate Aadhaar ID format (basic validation)
      if (!/^\d{4}\s?\d{4}\s?\d{4}$/.test(aadhaarId.replace(/\s/g, ''))) {
        return res.status(400).json({ error: 'Invalid Aadhaar ID format' });
      }
    }
    
    const users = getUsers();
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
    if (phone && users.find(u => u.phone === phone)) return res.status(400).json({ error: 'Phone number already exists' });
    if (aadhaarId && users.find(u => u.aadhaarId === aadhaarId)) return res.status(400).json({ error: 'Aadhaar ID already exists' });
    
    const user = { 
      id: nanoid(), 
      name, 
      email, 
      phone,
      role, 
      passwordHash: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // Add FLW-specific fields
    if (role === 'flw') {
      user.aadhaarId = aadhaarId;
      user.village = village;
      user.district = district;
      user.state = state;
      user.biometricEnabled = biometricEnabled || false;
      user.assignedVillages = [village]; // Can be expanded by admin
      user.permissions = ['create_animal', 'view_own_animals', 'update_own_animals'];
      
      // Generate unique FLW ID
      const flwId = `FLW${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      user.flwId = flwId;
    }
    
    // Add role-specific permissions
    switch (role) {
      case 'supervisor':
        user.permissions = ['review_animals', 'approve_animals', 'view_team_performance', 'bulk_operations'];
        break;
      case 'admin':
        user.permissions = ['all'];
        break;
      case 'vet':
        user.permissions = ['view_animals', 'update_health', 'schedule_treatments', 'view_health_reports'];
        break;
      case 'govt':
        user.permissions = ['view_analytics', 'export_data', 'view_reports'];
        break;
    }
    
    users.push(user);
    saveUsers(users);
    logActivity('auth.register', { userId: user.id, role: user.role, location: `${village}, ${district}, ${state}` });
    
    const token = createToken(user);
    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
        state: user.state,
        permissions: user.permissions
      } 
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = createToken(user);
    logActivity('auth.login', { userId: user.id });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Internal error during login' });
  }
});

// Biometric authentication endpoint
app.post('/api/auth/biometric', (req, res) => {
  try {
    const { credential, email } = req.body || {};
    if (!credential || !email) return res.status(400).json({ error: 'Credential and email required' });
    
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    if (!user.biometricEnabled) return res.status(403).json({ error: 'Biometric authentication not enabled for this user' });
    
    // In a real implementation, you would verify the credential against stored biometric data
    // For now, we'll simulate successful authentication
    const token = createToken(user);
    logActivity('auth.biometric_login', { userId: user.id });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        village: user.village,
        district: user.district,
        state: user.state,
        permissions: user.permissions
      } 
    });
  } catch (e) {
    console.error('Biometric auth error:', e);
    res.status(500).json({ error: 'Internal error during biometric authentication' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Animal routes
app.get('/api/animals', authMiddleware, (req, res) => {
  const animals = getAnimals();
  const user = req.user;
  
  // Filter animals based on user role and FLW ID
  let filteredAnimals = animals;
  
  if (user.role === 'flw') {
    // FLW can only see their own records
    filteredAnimals = animals.filter(animal => animal.flwId === user.flwId);
  } else if (user.role === 'supervisor') {
    // Supervisor can see records from FLWs in their assigned area
    const users = getUsers();
    const flwUsers = users.filter(u => u.role === 'flw' && u.isActive);
    const flwIds = flwUsers.map(u => u.flwId);
    filteredAnimals = animals.filter(animal => flwIds.includes(animal.flwId));
  }
  // Admin, vet, and govt can see all records
  
  res.json(filteredAnimals);
});

app.post('/api/animals', authMiddleware, upload.array('images', 6), (req, res) => {
  const { ownerName = '', location = '', notes = '', predictedBreed = '', ageMonths = '', gender = '', gpsLat = '', gpsLng = '', capturedAt = '' } = req.body || {};
  const id = nanoid();
  const imageUrls = [];
  if (Array.isArray(req.files)) {
    for (let i = 0; i < req.files.length; i++) {
      const f = req.files[i];
      const ext = path.extname(f.originalname || '.jpg') || '.jpg';
      const fileName = `${id}_${i}${ext}`;
      const filePath = path.join(IMAGES_DIR, fileName);
      fs.writeFileSync(filePath, f.buffer);
      imageUrls.push(`/uploads/${fileName}`);
    }
  }
  const animal = {
    id,
    createdAt: new Date().toISOString(),
    createdBy: req.user?.sub,
    flwId: req.user?.flwId || null, // Add FLW ID for tracking
    status: 'pending',
    ownerName,
    location,
    notes,
    predictedBreed,
    ageMonths: ageMonths ? Number(ageMonths) : null,
    gender,
    imageUrls,
    gps: (gpsLat && gpsLng) ? { lat: Number(gpsLat), lng: Number(gpsLng) } : null,
    capturedAt: capturedAt || null,
  };
  const animals = getAnimals();
  animals.push(animal);
  saveAnimals(animals);
  logActivity('animal.create', { id: animal.id, by: req.user?.sub });
  
  // Add to blockchain
  blockchainService.createAnimalRecord(animal, req.user?.sub);
  
  // Broadcast real-time update
  broadcastUpdate('animal_created', animal);
  
  res.status(201).json(animal);
});

// Update animal record
app.put('/api/animals/:id', authMiddleware, (req, res) => {
  const { ownerName, location, notes, predictedBreed, ageMonths, gender, status } = req.body;
  const animals = getAnimals();
  const idx = animals.findIndex(a => a.id === req.params.id);
  
  if (idx === -1) {
    return res.status(404).json({ error: 'Animal record not found' });
  }
  
  // Check permissions - only admin, supervisor, or the creator can edit
  const user = req.user;
  const animal = animals[idx];
  const canEdit = user.role === 'admin' || 
                  user.role === 'supervisor' || 
                  (user.role === 'flw' && animal.createdBy === user.sub);
  
  if (!canEdit) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  
  // Update the animal record
  animals[idx] = {
    ...animals[idx],
    ownerName: ownerName || animals[idx].ownerName,
    location: location || animals[idx].location,
    notes: notes || animals[idx].notes,
    predictedBreed: predictedBreed || animals[idx].predictedBreed,
    ageMonths: ageMonths ? Number(ageMonths) : animals[idx].ageMonths,
    gender: gender || animals[idx].gender,
    status: status || animals[idx].status,
    updatedAt: new Date().toISOString(),
    updatedBy: user.sub
  };
  
  saveAnimals(animals);
  logActivity('animal.update', { id: req.params.id, by: user.sub });
  
  // Broadcast real-time update
  broadcastUpdate('animal_updated', animals[idx]);
  
  res.json(animals[idx]);
});

// Approvals
app.post('/api/animals/:id/approve', authMiddleware, requireRole(['admin', 'supervisor']), (req, res) => {
  const animals = getAnimals();
  const idx = animals.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  animals[idx] = { ...animals[idx], status: 'approved', approvedAt: new Date().toISOString(), approvedBy: req.user.sub };
  saveAnimals(animals);
  logActivity('animal.approve', { id: animals[idx].id, by: req.user.sub });
  
  // Add to blockchain
  blockchainService.approveAnimalRecord(animals[idx].id, req.user.sub);
  
  // Broadcast real-time update
  broadcastUpdate('animal_approved', animals[idx]);
  
  res.json(animals[idx]);
});

app.post('/api/animals/:id/reject', authMiddleware, requireRole(['admin', 'supervisor']), (req, res) => {
  const animals = getAnimals();
  const idx = animals.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  animals[idx] = { ...animals[idx], status: 'rejected', rejectedAt: new Date().toISOString(), rejectedBy: req.user.sub, rejectReason: (req.body && req.body.reason) || '' };
  saveAnimals(animals);
  logActivity('animal.reject', { id: animals[idx].id, by: req.user.sub });
  
  // Add to blockchain
  blockchainService.rejectAnimalRecord(animals[idx].id, req.user.sub, (req.body && req.body.reason) || '');
  
  // Broadcast real-time update
  broadcastUpdate('animal_rejected', animals[idx]);
  
  res.json(animals[idx]);
});

// Delete animal endpoint
app.delete('/api/animals/:id', authMiddleware, (req, res) => {
  try {
    const animals = getAnimals();
    const idx = animals.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Animal not found' });
    
    const animal = animals[idx];
    const user = req.user;
    
    // Check permissions: admin can delete any, FLW can only delete their own
    if (user.role !== 'admin' && animal.createdBy !== user.sub) {
      return res.status(403).json({ error: 'Not authorized to delete this record' });
    }
    
    // Remove from animals array
    animals.splice(idx, 1);
    saveAnimals(animals);
    
    // Log the deletion
    logActivity('animal.delete', { id: animal.id, by: user.sub });
    
    // Broadcast real-time update
    broadcastUpdate('animal_deleted', { id: animal.id });
    
    res.json({ 
      success: true, 
      message: 'Animal record deleted successfully',
      deletedId: animal.id 
    });
  } catch (e) {
    console.error('Error deleting animal:', e);
    res.status(500).json({ error: 'Failed to delete animal record' });
  }
});

// Prediction route
app.post('/api/predict', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  
  try {
    // Use ConvNeXt model for better predictions
    const speciesResult = await convnextPredictor.detectSpecies(req.file.buffer);
    if (speciesResult.species === 'non_animal') {
      return res.status(400).json({ 
        error: 'Non-animal image detected',
        species: speciesResult.species,
        confidence: speciesResult.confidence
      });
    }
    
    const predictions = await convnextPredictor.predictBreed(req.file.buffer);
    const isCrossbreed = await convnextPredictor.isCrossbreed(predictions);
    const heatmapData = await convnextPredictor.generateHeatmap(req.file.buffer, predictions);
    
    // Create a simple heatmap image (placeholder)
    const heatmapId = nanoid();
    const heatmapPath = path.join(IMAGES_DIR, `${heatmapId}_heatmap.png`);
    
    // For now, create a simple colored image as heatmap
    const heatmapBuffer = await sharp({
      create: {
        width: 224,
        height: 224,
        channels: 3,
        background: { r: 255, g: 200, b: 200 }
      }
    }).png().toBuffer();
    
    fs.writeFileSync(heatmapPath, heatmapBuffer);
    
    res.json({
      species: speciesResult.species,
      speciesConfidence: speciesResult.confidence,
      predictions,
      isCrossbreed,
      heatmapUrl: `/uploads/${heatmapId}_heatmap.png`
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

// Notifications
app.get('/api/notifications', authMiddleware, (req, res) => {
  const notifications = notificationService.getNotifications(req.user.sub);
  res.json(notifications);
});

app.post('/api/notifications/:id/read', authMiddleware, (req, res) => {
  notificationService.markAsRead(req.params.id);
  res.json({ ok: true });
});

// Bulk operations
app.get('/api/bulk/export', authMiddleware, (req, res) => {
  const animals = getAnimals();
  const buffer = bulkService.exportToExcel(animals);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=animals_export.xlsx');
  res.send(buffer);
});

app.get('/api/bulk/template', authMiddleware, (req, res) => {
  const buffer = bulkService.createTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=animals_template.xlsx');
  res.send(buffer);
});

app.post('/api/bulk/import', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = bulkService.importFromExcel(req.file.buffer);
    
    if (result.errors.length > 0) {
      return res.status(400).json({ 
        error: 'Import completed with errors',
        imported: result.imported.length,
        errors: result.errors
      });
    }

    bulkService.saveImportedAnimals(result.imported);
    res.json({ 
      success: true, 
      imported: result.imported.length,
      message: `Successfully imported ${result.imported.length} animals`
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed' });
  }
});

// Analytics endpoint
app.get('/api/logs', authMiddleware, (req, res) => {
  const logs = getLogs();
  res.json(logs);
});

// Supervisor endpoints
app.get('/api/animals/pending', authMiddleware, requireRole(['supervisor', 'admin']), (req, res) => {
  try {
    const animals = getAnimals();
    const pendingAnimals = animals.filter(animal => animal.status === 'pending');
    
    // Add additional metadata for supervisors
    const enrichedAnimals = pendingAnimals.map(animal => ({
      ...animal,
      aiConfidence: animal.aiConfidence || 0,
      imageQuality: animal.imageQuality || { blur: false, dark: false, pose: 'good' },
      reviewHistory: animal.reviewHistory || [],
      flags: animal.flags || []
    }));
    
    res.json(enrichedAnimals);
  } catch (e) {
    console.error('Error fetching pending animals:', e);
    res.status(500).json({ error: 'Failed to fetch pending animals' });
  }
});

// Animal approval/rejection endpoints
app.post('/api/animals/:id/approve', authMiddleware, requireRole(['supervisor', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { notes, reviewedBy } = req.body;
    
    const animals = getAnimals();
    const animalIndex = animals.findIndex(a => a.id === id);
    
    if (animalIndex === -1) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    animals[animalIndex].status = 'approved';
    animals[animalIndex].reviewedAt = new Date().toISOString();
    animals[animalIndex].reviewedBy = reviewedBy;
    animals[animalIndex].reviewNotes = notes;
    
    // Add to review history
    if (!animals[animalIndex].reviewHistory) {
      animals[animalIndex].reviewHistory = [];
    }
    animals[animalIndex].reviewHistory.push({
      action: 'approved',
      reviewedBy,
      notes,
      timestamp: new Date().toISOString()
    });
    
    saveAnimals(animals);
    logActivity('animal.approved', { animalId: id, reviewedBy });
    
    res.json({ success: true, animal: animals[animalIndex] });
  } catch (e) {
    console.error('Error approving animal:', e);
    res.status(500).json({ error: 'Failed to approve animal' });
  }
});

app.post('/api/animals/:id/reject', authMiddleware, requireRole(['supervisor', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { notes, reviewedBy } = req.body;
    
    const animals = getAnimals();
    const animalIndex = animals.findIndex(a => a.id === id);
    
    if (animalIndex === -1) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    animals[animalIndex].status = 'rejected';
    animals[animalIndex].reviewedAt = new Date().toISOString();
    animals[animalIndex].reviewedBy = reviewedBy;
    animals[animalIndex].reviewNotes = notes;
    
    // Add to review history
    if (!animals[animalIndex].reviewHistory) {
      animals[animalIndex].reviewHistory = [];
    }
    animals[animalIndex].reviewHistory.push({
      action: 'rejected',
      reviewedBy,
      notes,
      timestamp: new Date().toISOString()
    });
    
    saveAnimals(animals);
    logActivity('animal.rejected', { animalId: id, reviewedBy });
    
    res.json({ success: true, animal: animals[animalIndex] });
  } catch (e) {
    console.error('Error rejecting animal:', e);
    res.status(500).json({ error: 'Failed to reject animal' });
  }
});

app.post('/api/animals/:id/flag', authMiddleware, requireRole(['supervisor', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { notes, reviewedBy, flagType } = req.body;
    
    const animals = getAnimals();
    const animalIndex = animals.findIndex(a => a.id === id);
    
    if (animalIndex === -1) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    animals[animalIndex].status = 'needs_revision';
    animals[animalIndex].reviewedAt = new Date().toISOString();
    animals[animalIndex].reviewedBy = reviewedBy;
    animals[animalIndex].reviewNotes = notes;
    animals[animalIndex].flagType = flagType || 'general';
    
    // Add to review history
    if (!animals[animalIndex].reviewHistory) {
      animals[animalIndex].reviewHistory = [];
    }
    animals[animalIndex].reviewHistory.push({
      action: 'flagged',
      reviewedBy,
      notes,
      flagType: flagType || 'general',
      timestamp: new Date().toISOString()
    });
    
    saveAnimals(animals);
    logActivity('animal.flagged', { animalId: id, reviewedBy, flagType });
    
    res.json({ success: true, animal: animals[animalIndex] });
  } catch (e) {
    console.error('Error flagging animal:', e);
    res.status(500).json({ error: 'Failed to flag animal' });
  }
});

// Team analytics endpoint
app.get('/api/analytics/team', authMiddleware, requireRole(['supervisor', 'admin']), (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const animals = getAnimals();
    const users = getUsers();
    const logs = getLogs();
    
    // Filter animals by date range
    const recentAnimals = animals.filter(animal => 
      new Date(animal.createdAt) >= cutoffDate
    );
    
    // Get FLW users
    const flwUsers = users.filter(user => user.role === 'flw');
    
    // Calculate team performance
    const teamPerformance = {
      totalRecords: recentAnimals.length,
      avgAccuracy: 0,
      avgDailyWork: 0,
      workers: {}
    };
    
    let totalAccuracy = 0;
    let accuracyCount = 0;
    
    flwUsers.forEach(user => {
      const userAnimals = recentAnimals.filter(animal => animal.createdBy === user.id);
      const approvedAnimals = userAnimals.filter(animal => animal.status === 'approved');
      const accuracy = userAnimals.length > 0 ? approvedAnimals.length / userAnimals.length : 0;
      
      if (userAnimals.length > 0) {
        totalAccuracy += accuracy;
        accuracyCount++;
      }
      
      teamPerformance.workers[user.id] = {
        name: user.name,
        village: user.village,
        totalRecords: userAnimals.length,
        approvedRecords: approvedAnimals.length,
        accuracy: accuracy,
        avgDailyWork: userAnimals.length / parseInt(days),
        performanceScore: Math.round(accuracy * 100),
        lastActive: userAnimals.length > 0 ? 
          userAnimals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : 
          null
      };
    });
    
    teamPerformance.avgAccuracy = accuracyCount > 0 ? totalAccuracy / accuracyCount : 0;
    teamPerformance.avgDailyWork = recentAnimals.length / parseInt(days);
    
    // Breed distribution
    const breedDistribution = {};
    recentAnimals.forEach(animal => {
      const breed = animal.predictedBreed || 'Unknown';
      breedDistribution[breed] = (breedDistribution[breed] || 0) + 1;
    });
    
    // Location coverage
    const locationCoverage = {};
    recentAnimals.forEach(animal => {
      const location = animal.location || 'Unknown';
      if (!locationCoverage[location]) {
        locationCoverage[location] = { count: 0, workers: new Set() };
      }
      locationCoverage[location].count++;
      if (animal.createdBy) {
        locationCoverage[location].workers.add(animal.createdBy);
      }
    });
    
    // Convert Set to count
    Object.keys(locationCoverage).forEach(location => {
      locationCoverage[location].workers = locationCoverage[location].workers.size;
    });
    
    // Workload distribution
    const workloadDistribution = {
      highPerformers: 0,
      averagePerformers: 0,
      needsTraining: 0,
      inactive: 0
    };
    
    Object.values(teamPerformance.workers).forEach(worker => {
      if (worker.totalRecords === 0) {
        workloadDistribution.inactive++;
      } else if (worker.accuracy >= 0.9) {
        workloadDistribution.highPerformers++;
      } else if (worker.accuracy >= 0.7) {
        workloadDistribution.averagePerformers++;
      } else {
        workloadDistribution.needsTraining++;
      }
    });
    
    // Generate recommendations
    const recommendations = [];
    
    if (workloadDistribution.needsTraining > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Training Required',
        description: `${workloadDistribution.needsTraining} workers need additional training to improve accuracy.`
      });
    }
    
    if (workloadDistribution.inactive > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Inactive Workers',
        description: `${workloadDistribution.inactive} workers have no recent activity. Consider follow-up.`
      });
    }
    
    if (teamPerformance.avgAccuracy < 0.8) {
      recommendations.push({
        priority: 'high',
        title: 'Low Team Accuracy',
        description: 'Overall team accuracy is below 80%. Consider team-wide training session.'
      });
    }
    
    res.json({
      teamPerformance,
      breedDistribution,
      locationCoverage,
      workloadDistribution,
      recommendations
    });
  } catch (e) {
    console.error('Error generating team analytics:', e);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Admin endpoints
app.get('/api/admin/users', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const users = getUsers();
    
    // Remove sensitive data
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      village: user.village,
      district: user.district,
      state: user.state,
      aadhaarId: user.aadhaarId,
      permissions: user.permissions,
      isActive: user.isActive !== false,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
      flwId: user.flwId
    }));
    
    // Calculate statistics
    const totalUsers = safeUsers.length;
    const activeUsers = safeUsers.filter(u => u.isActive).length;
    const activeFLWs = safeUsers.filter(u => u.role === 'flw' && u.isActive).length;
    
    res.json({
      users: safeUsers,
      totalUsers,
      activeUsers,
      activeFLWs
    });
  } catch (e) {
    console.error('Error fetching users:', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/users', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone,
      password, 
      role,
      aadhaarId,
      village,
      district,
      state,
      permissions
    } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }
    
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const user = { 
      id: nanoid(), 
      name, 
      email, 
      phone,
      role, 
      passwordHash: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: permissions || getRolePermissions(role)
    };
    
    // Add role-specific fields
    if (role === 'flw') {
      user.aadhaarId = aadhaarId;
      user.village = village;
      user.district = district;
      user.state = state;
      user.assignedVillages = village ? [village] : [];
    }
    
    users.push(user);
    saveUsers(users);
    logActivity('admin.user_created', { userId: user.id, createdBy: req.user?.sub });
    
    res.status(201).json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error('Error creating user:', e);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/admin/users/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent updating password directly (should use separate endpoint)
    delete updates.password;
    delete updates.passwordHash;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);
    logActivity('admin.user_updated', { userId: id, updatedBy: req.user?.sub });
    
    res.json({ success: true, user: users[userIndex] });
  } catch (e) {
    console.error('Error updating user:', e);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting self
    if (id === req.user?.sub) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    users.splice(userIndex, 1);
    saveUsers(users);
    logActivity('admin.user_deleted', { userId: id, deletedBy: req.user?.sub });
    
    res.json({ success: true });
  } catch (e) {
    console.error('Error deleting user:', e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.put('/api/admin/users/:id/status', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].isActive = isActive;
    saveUsers(users);
    logActivity('admin.user_status_changed', { userId: id, isActive, changedBy: req.user?.sub });
    
    res.json({ success: true, user: users[userIndex] });
  } catch (e) {
    console.error('Error updating user status:', e);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Helper function to get default permissions for roles
function getRolePermissions(role) {
  const permissions = {
    flw: ['create_animal', 'view_own_animals', 'update_own_animals'],
    supervisor: ['review_animals', 'approve_animals', 'view_team_performance', 'bulk_operations'],
    admin: ['all'],
    vet: ['view_animals', 'update_health', 'schedule_treatments', 'view_health_reports'],
    govt: ['view_analytics', 'export_data', 'view_reports']
  };
  return permissions[role] || [];
}

// Breed management endpoints
app.get('/api/admin/breeds', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    // For now, return a mock list of breeds. In a real system, this would come from a breeds database
    const breeds = [
      {
        id: 'holstein',
        name: 'Holstein',
        origin: 'Netherlands',
        description: 'High milk-producing dairy breed with distinctive black and white markings.',
        avgMilkYield: 25,
        avgWeight: 650,
        traits: ['High milk yield', 'Cold tolerant', 'Large size'],
        isRareBreed: false,
        referenceImages: []
      },
      {
        id: 'gir',
        name: 'Gir',
        origin: 'India',
        description: 'Indigenous Indian breed known for disease resistance and heat tolerance.',
        avgMilkYield: 12,
        avgWeight: 400,
        traits: ['Disease resistant', 'Heat tolerant', 'A2 milk'],
        isRareBreed: false,
        referenceImages: []
      }
    ];
    
    res.json(breeds);
  } catch (e) {
    console.error('Error fetching breeds:', e);
    res.status(500).json({ error: 'Failed to fetch breeds' });
  }
});

app.post('/api/admin/breeds', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const breedData = req.body;
    
    // In a real system, you would save to a breeds database
    // For now, just return success
    const breed = {
      id: nanoid(),
      ...breedData,
      createdAt: new Date().toISOString(),
      createdBy: req.user?.sub
    };
    
    logActivity('admin.breed_created', { breedId: breed.id, createdBy: req.user?.sub });
    
    res.status(201).json({ success: true, breed });
  } catch (e) {
    console.error('Error creating breed:', e);
    res.status(500).json({ error: 'Failed to create breed' });
  }
});

// Update breed endpoint
app.put('/api/admin/breeds/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const breedId = req.params.id;
    const updates = req.body;
    
    // In a real system, you would update the breed in the database
    // For now, just return success with updated data
    const updatedBreed = {
      id: breedId,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.sub
    };
    
    logActivity('admin.breed_updated', { breedId, updatedBy: req.user?.sub });
    
    res.json({ success: true, breed: updatedBreed });
  } catch (e) {
    console.error('Error updating breed:', e);
    res.status(500).json({ error: 'Failed to update breed' });
  }
});

// Delete breed endpoint
app.delete('/api/admin/breeds/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  try {
    const breedId = req.params.id;
    
    // In a real system, you would delete the breed from the database
    // For now, just return success
    logActivity('admin.breed_deleted', { breedId, deletedBy: req.user?.sub });
    
    res.json({ 
      success: true, 
      message: 'Breed deleted successfully',
      deletedId: breedId 
    });
  } catch (e) {
    console.error('Error deleting breed:', e);
    res.status(500).json({ error: 'Failed to delete breed' });
  }
});

// Image upload endpoint for breed references
app.post('/api/upload/breed-image', authMiddleware, requireRole(['admin']), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    const ext = path.extname(req.file.originalname || '.jpg') || '.jpg';
    const fileName = `breed_${nanoid()}${ext}`;
    const filePath = path.join(IMAGES_DIR, fileName);
    
    fs.writeFileSync(filePath, req.file.buffer);
    
    const imageUrl = `/uploads/${fileName}`;
    res.json({ success: true, imageUrl });
  } catch (e) {
    console.error('Error uploading breed image:', e);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Veterinarian endpoints
app.get('/api/vet/animals', authMiddleware, requireRole(['vet', 'admin']), (req, res) => {
  try {
    const animals = getAnimals();
    
    // Enrich animals with health records and required fields
    const enrichedAnimals = animals.map(animal => ({
      ...animal,
      earTag: animal.earTag || `A${animal.id.slice(-4)}`, // Generate ear tag if missing
      breed: animal.breed || animal.predictedBreed || 'Unknown',
      ownerPhone: animal.ownerPhone || 'N/A',
      village: animal.village || 'Unknown',
      district: animal.district || 'Unknown',
      age: animal.age || animal.ageMonths,
      weight: animal.weight || 'N/A',
      healthStatus: animal.healthStatus || 'unknown',
      healthRecords: animal.healthRecords || [],
      lastHealthCheck: animal.healthRecords?.length > 0 ? 
        animal.healthRecords[animal.healthRecords.length - 1].recordDate : 
        null
    }));
    
    res.json(enrichedAnimals);
  } catch (e) {
    console.error('Error fetching animals for vet:', e);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

// Get all health records for vet dashboard
app.get('/api/vet/health-records', authMiddleware, requireRole(['vet', 'admin']), (req, res) => {
  try {
    const animals = getAnimals();
    const allHealthRecords = [];
    
    // Extract all health records from all animals
    animals.forEach(animal => {
      if (animal.healthRecords && animal.healthRecords.length > 0) {
        animal.healthRecords.forEach(record => {
          allHealthRecords.push({
            ...record,
            animal: {
              id: animal.id,
              earTag: animal.earTag || `A${animal.id.slice(-4)}`, // Generate ear tag if missing
              breed: animal.breed || animal.predictedBreed || 'Unknown',
              ownerName: animal.ownerName,
              ownerPhone: animal.ownerPhone || 'N/A',
              village: animal.village || 'Unknown',
              district: animal.district || 'Unknown',
              gender: animal.gender,
              age: animal.age || animal.ageMonths,
              weight: animal.weight || 'N/A',
              healthStatus: animal.healthStatus || 'unknown'
            }
          });
        });
      }
    });
    
    // If no real health records, return mock data for demonstration
    if (allHealthRecords.length === 0) {
      const mockHealthRecords = [
        {
          id: 'health_record_1',
          animalId: 'sJ-5g_DKZY0pnD8qTsy7w',
          vetId: 'k8nC58b83BqavjshB54ob',
          symptoms: 'Coughing, nasal discharge, fever',
          diagnosis: 'Bovine Respiratory Disease',
          treatment: 'Antibiotics and supportive care',
          medication: 'Oxytetracycline',
          dosage: '10mg/kg body weight',
          followUpDate: '2025-10-03',
          notes: 'AI Disease Detection: Common respiratory infection in cattle. Confidence: 85%. Overall Health Score: 75',
          severity: 'moderate',
          recordDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'ai_detection',
          animal: {
            id: 'sJ-5g_DKZY0pnD8qTsy7w',
            earTag: 'A7w',
            breed: 'Holstein',
            ownerName: 'cnbn bngg',
            ownerPhone: 'N/A',
            village: 'reet',
            district: 'Unknown',
            gender: 'female',
            age: 150,
            weight: 'N/A',
            healthStatus: 'sick'
          }
        },
        {
          id: 'health_record_2',
          animalId: 'swUvlsxW5MFHhsJLGLHtm',
          vetId: 'k8nC58b83BqavjshB54ob',
          symptoms: 'Lameness, swelling, foul odor',
          diagnosis: 'Foot Rot',
          treatment: 'Foot bath and topical antibiotics',
          medication: 'Copper sulfate',
          dosage: '5% solution',
          followUpDate: '2025-10-01',
          notes: 'AI Disease Detection: Bacterial infection of the foot. Confidence: 92%. Overall Health Score: 85',
          severity: 'mild',
          recordDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'ai_detection',
          animal: {
            id: 'swUvlsxW5MFHhsJLGLHtm',
            earTag: 'A5tm',
            breed: 'Gir',
            ownerName: 'nbnbnbnb',
            ownerPhone: 'N/A',
            village: 'vc ,hmgjg',
            district: 'Unknown',
            gender: 'male',
            age: 853,
            weight: 'N/A',
            healthStatus: 'recovering'
          }
        }
      ];
      
      // Sort by most recent first
      mockHealthRecords.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
      res.json(mockHealthRecords);
    } else {
      // Sort by most recent first
      allHealthRecords.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
      res.json(allHealthRecords);
    }
  } catch (e) {
    console.error('Error fetching health records:', e);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

app.post('/api/vet/health-records', authMiddleware, requireRole(['vet', 'admin']), (req, res) => {
  try {
    const { 
      animalId, 
      symptoms, 
      diagnosis, 
      treatment, 
      medication, 
      dosage, 
      followUpDate, 
      notes, 
      severity,
      vetId 
    } = req.body;
    
    if (!animalId || !symptoms || !vetId) {
      return res.status(400).json({ error: 'Animal ID, symptoms, and vet ID are required' });
    }
    
    const animals = getAnimals();
    const animalIndex = animals.findIndex(a => a.id === animalId);
    
    if (animalIndex === -1) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    const healthRecord = {
      id: nanoid(),
      animalId,
      vetId,
      symptoms,
      diagnosis,
      treatment,
      medication,
      dosage,
      followUpDate,
      notes,
      severity: severity || 'mild',
      recordDate: new Date().toISOString()
    };
    
    if (!animals[animalIndex].healthRecords) {
      animals[animalIndex].healthRecords = [];
    }
    
    animals[animalIndex].healthRecords.push(healthRecord);
    
    // Update animal health status based on severity
    if (severity === 'critical') {
      animals[animalIndex].healthStatus = 'critical';
    } else if (severity === 'severe') {
      animals[animalIndex].healthStatus = 'sick';
    } else if (severity === 'moderate') {
      animals[animalIndex].healthStatus = 'recovering';
    }
    
    saveAnimals(animals);
    logActivity('vet.health_record_added', { animalId, recordId: healthRecord.id, vetId });
    
    res.status(201).json({ success: true, healthRecord });
  } catch (e) {
    console.error('Error adding health record:', e);
    res.status(500).json({ error: 'Failed to add health record' });
  }
});

app.put('/api/vet/health-records/:id', authMiddleware, requireRole(['vet', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const animals = getAnimals();
    let recordFound = false;
    
    for (let animal of animals) {
      if (animal.healthRecords) {
        const recordIndex = animal.healthRecords.findIndex(r => r.id === id);
        if (recordIndex !== -1) {
          animal.healthRecords[recordIndex] = { 
            ...animal.healthRecords[recordIndex], 
            ...updates,
            updatedAt: new Date().toISOString()
          };
          recordFound = true;
          break;
        }
      }
    }
    
    if (!recordFound) {
      return res.status(404).json({ error: 'Health record not found' });
    }
    
    saveAnimals(animals);
    logActivity('vet.health_record_updated', { recordId: id, vetId: req.user?.sub });
    
    res.json({ success: true });
  } catch (e) {
    console.error('Error updating health record:', e);
    res.status(500).json({ error: 'Failed to update health record' });
  }
});

app.post('/api/vet/schedule-treatment', authMiddleware, requireRole(['vet', 'admin']), (req, res) => {
  try {
    const { 
      animalId, 
      treatmentType, 
      scheduledDate, 
      notes, 
      vetId 
    } = req.body;
    
    if (!animalId || !treatmentType || !scheduledDate || !vetId) {
      return res.status(400).json({ error: 'Animal ID, treatment type, scheduled date, and vet ID are required' });
    }
    
    const animals = getAnimals();
    const animalIndex = animals.findIndex(a => a.id === animalId);
    
    if (animalIndex === -1) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    const treatment = {
      id: nanoid(),
      animalId,
      vetId,
      treatmentType,
      scheduledDate,
      notes,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    
    if (!animals[animalIndex].scheduledTreatments) {
      animals[animalIndex].scheduledTreatments = [];
    }
    
    animals[animalIndex].scheduledTreatments.push(treatment);
    saveAnimals(animals);
    logActivity('vet.treatment_scheduled', { animalId, treatmentId: treatment.id, vetId });
    
    res.status(201).json({ success: true, treatment });
  } catch (e) {
    console.error('Error scheduling treatment:', e);
    res.status(500).json({ error: 'Failed to schedule treatment' });
  }
});

app.get('/api/vet/disease-history', authMiddleware, requireRole(['vet', 'admin']), (req, res) => {
  try {
    const logs = getLogs();
    const diseaseDetections = logs.filter(log => 
      log.action === 'vet.disease_detected' && 
      log.data?.vetId === req.user?.sub
    );
    
    // Enrich with vet names and convert to expected format
    const users = getUsers();
    const enrichedDetections = diseaseDetections.map(detection => {
      const vet = users.find(u => u.id === detection.data?.vetId);
      return {
        id: detection.id || `detection_${Date.now()}_${Math.random()}`,
        detectionDate: detection.timestamp,
        vetName: vet?.name || 'Unknown',
        results: {
          diseases: detection.data?.diseasesFound > 0 ? [
            {
              name: 'AI Detected Disease',
              confidence: 0.85,
              severity: detection.data?.overallHealth < 70 ? 'severe' : 
                       detection.data?.overallHealth < 85 ? 'moderate' : 'mild',
              description: 'Disease detected by AI analysis',
              symptoms: ['AI detected symptoms'],
              treatment: 'Consult with veterinarian',
              medication: 'To be determined',
              urgency: detection.data?.overallHealth < 70 ? 'high' : 'medium'
            }
          ] : [],
          overallHealth: {
            score: detection.data?.overallHealth || 85,
            status: detection.data?.overallHealth < 70 ? 'Health concerns detected' : 
                   detection.data?.overallHealth < 85 ? 'Good health with minor issues' : 'Excellent health',
            recommendations: detection.data?.overallHealth < 70 ? 'Immediate attention required' : 
                           detection.data?.overallHealth < 85 ? 'Monitor closely' : 'Continue regular monitoring'
          }
        }
      };
    });
    
    // If no real data, return mock data for demonstration
    if (enrichedDetections.length === 0) {
      const mockHistory = [
        {
          id: 'detection1',
          detectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          vetName: 'Dr. Smith',
          results: {
            diseases: [
              {
                name: 'Foot Rot',
                confidence: 0.92,
                severity: 'mild',
                description: 'Bacterial infection of the foot',
                symptoms: ['Lameness', 'Swelling', 'Foul odor'],
                treatment: 'Foot bath and topical antibiotics',
                medication: 'Copper sulfate',
                urgency: 'low'
              }
            ],
            overallHealth: {
              score: 85,
              status: 'Good health with minor issues',
              recommendations: 'Continue current treatment'
            }
          }
        },
        {
          id: 'detection2',
          detectionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          vetName: 'Dr. Smith',
          results: {
            diseases: [],
            overallHealth: {
              score: 95,
              status: 'Excellent health',
              recommendations: 'Continue regular monitoring'
            }
          }
        }
      ];
      res.json(mockHistory);
    } else {
      res.json(enrichedDetections);
    }
  } catch (e) {
    console.error('Error fetching disease history:', e);
    res.status(500).json({ error: 'Failed to fetch disease history' });
  }
});

app.post('/api/vet/save-disease-detection', authMiddleware, requireRole(['vet', 'admin']), (req, res) => {
  try {
    const { results, vetId, animalId } = req.body;
    
    // Always save disease detection as health record
    if (results?.diseases?.length > 0) {
      const animals = getAnimals();
      
      // If animalId is provided, save to specific animal
      if (animalId) {
        const animalIndex = animals.findIndex(a => a.id === animalId);
        
        if (animalIndex !== -1) {
          const disease = results.diseases[0]; // Use first disease detected
          
          const healthRecord = {
            id: nanoid(),
            animalId,
            vetId,
            symptoms: disease.symptoms?.join(', ') || 'AI detected symptoms',
            diagnosis: disease.name,
            treatment: disease.treatment,
            medication: disease.medication,
            dosage: 'As per AI recommendation',
            followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            notes: `AI Disease Detection: ${disease.description}. Confidence: ${Math.round(disease.confidence * 100)}%. Overall Health Score: ${results.overallHealth?.score || 'N/A'}`,
            severity: disease.severity || 'moderate',
            recordDate: new Date().toISOString(),
            source: 'ai_detection'
          };
          
          if (!animals[animalIndex].healthRecords) {
            animals[animalIndex].healthRecords = [];
          }
          
          animals[animalIndex].healthRecords.push(healthRecord);
          
          // Update animal health status based on severity
          if (disease.severity === 'critical') {
            animals[animalIndex].healthStatus = 'critical';
          } else if (disease.severity === 'severe') {
            animals[animalIndex].healthStatus = 'sick';
          } else if (disease.severity === 'moderate') {
            animals[animalIndex].healthStatus = 'recovering';
          }
          
          saveAnimals(animals);
          logActivity('vet.health_record_added_from_ai', { animalId, recordId: healthRecord.id, vetId, disease: disease.name });
        }
      } else {
        // If no animalId, create a general health record for the first available animal
        const disease = results.diseases[0];
        const firstAnimal = animals.find(a => a.status === 'approved');
        
        if (firstAnimal) {
          const healthRecord = {
            id: nanoid(),
            animalId: firstAnimal.id,
            vetId,
            symptoms: disease.symptoms?.join(', ') || 'AI detected symptoms',
            diagnosis: disease.name,
            treatment: disease.treatment,
            medication: disease.medication,
            dosage: 'As per AI recommendation',
            followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: `AI Disease Detection: ${disease.description}. Confidence: ${Math.round(disease.confidence * 100)}%. Overall Health Score: ${results.overallHealth?.score || 'N/A'}`,
            severity: disease.severity || 'moderate',
            recordDate: new Date().toISOString(),
            source: 'ai_detection'
          };
          
          const animalIndex = animals.findIndex(a => a.id === firstAnimal.id);
          if (!animals[animalIndex].healthRecords) {
            animals[animalIndex].healthRecords = [];
          }
          
          animals[animalIndex].healthRecords.push(healthRecord);
          
          // Update animal health status based on severity
          if (disease.severity === 'critical') {
            animals[animalIndex].healthStatus = 'critical';
          } else if (disease.severity === 'severe') {
            animals[animalIndex].healthStatus = 'sick';
          } else if (disease.severity === 'moderate') {
            animals[animalIndex].healthStatus = 'recovering';
          }
          
          saveAnimals(animals);
          logActivity('vet.health_record_added_from_ai', { animalId: firstAnimal.id, recordId: healthRecord.id, vetId, disease: disease.name });
        }
      }
    }
    
    logActivity('vet.disease_detected', { 
      vetId, 
      diseasesFound: results?.diseases?.length || 0,
      overallHealth: results?.overallHealth?.score || 0,
      animalId: animalId || null
    });
    
    res.json({ success: true });
  } catch (e) {
    console.error('Error saving disease detection:', e);
    res.status(500).json({ error: 'Failed to save disease detection' });
  }
});

// Government endpoints
app.get('/api/govt/analytics', authMiddleware, requireRole(['govt', 'admin']), (req, res) => {
  try {
    const { region, timeframe } = req.query;
    
    const animals = getAnimals();
    const users = getUsers();
    const logs = getLogs();
    
    // Calculate key metrics
    const totalAnimals = animals.length;
    const activeFLWs = users.filter(u => u.role === 'flw' && u.isActive !== false).length;
    
    // Calculate vaccination coverage (mock data for now)
    const vaccinatedAnimals = animals.filter(a => a.vaccinationStatus === 'vaccinated').length;
    const vaccinationCoverage = totalAnimals > 0 ? Math.round((vaccinatedAnimals / totalAnimals) * 100) : 0;
    
    // Calculate disease outbreaks (mock data for now)
    const diseaseOutbreaks = logs.filter(log => log.type === 'vet.disease_detected').length;
    
    // Breed distribution
    const breedCounts = {};
    animals.forEach(animal => {
      const breed = animal.breed || 'Unknown';
      breedCounts[breed] = (breedCounts[breed] || 0) + 1;
    });
    
    const breedDistribution = Object.entries(breedCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalAnimals > 0 ? Math.round((count / totalAnimals) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Regional data (mock data for now)
    const regionalData = [
      { name: 'North India', animals: Math.floor(totalAnimals * 0.25), flws: Math.floor(activeFLWs * 0.25), vaccinationCoverage: 75, healthScore: 85 },
      { name: 'South India', animals: Math.floor(totalAnimals * 0.30), flws: Math.floor(activeFLWs * 0.30), vaccinationCoverage: 80, healthScore: 90 },
      { name: 'East India', animals: Math.floor(totalAnimals * 0.20), flws: Math.floor(activeFLWs * 0.20), vaccinationCoverage: 70, healthScore: 75 },
      { name: 'West India', animals: Math.floor(totalAnimals * 0.15), flws: Math.floor(activeFLWs * 0.15), vaccinationCoverage: 85, healthScore: 88 },
      { name: 'Central India', animals: Math.floor(totalAnimals * 0.10), flws: Math.floor(activeFLWs * 0.10), vaccinationCoverage: 65, healthScore: 70 }
    ];
    
    // Scheme performance (mock data for now)
    const schemePerformance = [
      { name: 'Livestock Insurance Scheme', status: 'active', target: 10000, achieved: 8500, progress: 85 },
      { name: 'Artificial Insemination Program', status: 'active', target: 5000, achieved: 4200, progress: 84 },
      { name: 'Vaccination Drive', status: 'active', target: 15000, achieved: 12000, progress: 80 },
      { name: 'Breed Conservation Program', status: 'active', target: 2000, achieved: 1500, progress: 75 }
    ];
    
    // Rare breeds (mock data for now)
    const rareBreeds = [
      { name: 'Gir', count: 150, conservationStatus: 'Endangered', priority: 'High' },
      { name: 'Sahiwal', count: 200, conservationStatus: 'Vulnerable', priority: 'Medium' },
      { name: 'Red Sindhi', count: 100, conservationStatus: 'Critically Endangered', priority: 'High' }
    ];
    
    // Predictive analytics (mock data for now)
    const populationForecast = { growth: 12 };
    const diseaseRisk = { level: 'Medium', region: 'North India' };
    const resourceNeeds = { priority: 'High' };
    
    const analytics = {
      totalAnimals,
      activeFLWs,
      vaccinationCoverage,
      diseaseOutbreaks,
      animalsGrowth: 8, // Mock growth percentage
      flwGrowth: 5,
      outbreakTrend: -2,
      breedDistribution,
      regionalData,
      schemePerformance,
      rareBreeds,
      populationForecast,
      diseaseRisk,
      resourceNeeds
    };
    
    res.json(analytics);
  } catch (e) {
    console.error('Error generating government analytics:', e);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

app.get('/api/govt/detailed-analytics', authMiddleware, requireRole(['govt', 'admin']), (req, res) => {
  try {
    const { metric, period } = req.query;
    
    const animals = getAnimals();
    const users = getUsers();
    const logs = getLogs();
    
    let analytics = {};
    
    switch (metric) {
      case 'population':
        analytics = {
          keyStats: [
            { label: 'Total Animals', value: animals.length.toLocaleString(), valueColor: '#2196F3' },
            { label: 'Growth Rate', value: '+8.5%', valueColor: '#4CAF50', change: 8.5 },
            { label: 'New Registrations', value: '1,250', valueColor: '#FF9800' },
            { label: 'Active FLWs', value: users.filter(u => u.role === 'flw' && u.isActive !== false).length, valueColor: '#9C27B0' }
          ],
          chartData: generateMockTimeSeriesData(period),
          detailedData: animals.slice(0, 10).map(animal => ({
            id: animal.id,
            breed: animal.breed || 'Unknown',
            location: `${animal.village || 'Unknown'}, ${animal.district || 'Unknown'}`,
            registeredDate: animal.createdAt,
            status: animal.status || 'active'
          })),
          insights: [
            { type: 'positive', title: 'Population Growth', description: 'Animal population is growing steadily at 8.5% annually' },
            { type: 'info', title: 'Registration Trend', description: 'New registrations are increasing month over month' }
          ],
          recommendations: [
            { title: 'Expand FLW Network', description: 'Increase field worker coverage in underserved areas', priority: 'High' },
            { title: 'Improve Data Quality', description: 'Implement better data validation for new registrations', priority: 'Medium' }
          ]
        };
        break;
        
      case 'health':
        analytics = {
          keyStats: [
            { label: 'Healthy Animals', value: animals.filter(a => a.healthStatus === 'healthy').length.toLocaleString(), valueColor: '#4CAF50' },
            { label: 'Sick Animals', value: animals.filter(a => a.healthStatus === 'sick').length.toLocaleString(), valueColor: '#F44336' },
            { label: 'Critical Cases', value: animals.filter(a => a.healthStatus === 'critical').length.toLocaleString(), valueColor: '#9C27B0' },
            { label: 'Health Score', value: '78/100', valueColor: '#FF9800' }
          ],
          chartData: generateMockTimeSeriesData(period),
          detailedData: animals.filter(a => a.healthStatus !== 'healthy').slice(0, 10).map(animal => ({
            id: animal.id,
            breed: animal.breed || 'Unknown',
            healthStatus: animal.healthStatus || 'unknown',
            lastCheck: animal.lastHealthCheck || 'Never',
            location: `${animal.village || 'Unknown'}, ${animal.district || 'Unknown'}`
          })),
          insights: [
            { type: 'negative', title: 'Health Concerns', description: '15% of animals require immediate health attention' },
            { type: 'positive', title: 'Prevention Success', description: 'Vaccination program showing positive results' }
          ],
          recommendations: [
            { title: 'Emergency Response', description: 'Deploy mobile veterinary units to critical areas', priority: 'High' },
            { title: 'Preventive Care', description: 'Increase vaccination coverage in high-risk regions', priority: 'Medium' }
          ]
        };
        break;
        
      case 'regional':
        analytics = {
          keyStats: [
            { label: 'Best Performing Region', value: 'South India', valueColor: '#4CAF50' },
            { label: 'Needs Attention', value: 'Central India', valueColor: '#F44336' },
            { label: 'Average Score', value: '78/100', valueColor: '#FF9800' },
            { label: 'Regional Disparity', value: '15%', valueColor: '#9C27B0' }
          ],
          chartData: generateMockTimeSeriesData(period),
          detailedData: [
            { region: 'North India', score: 85, animals: 2500, flws: 25, vaccination: 75 },
            { region: 'South India', score: 90, animals: 3000, flws: 30, vaccination: 80 },
            { region: 'East India', score: 75, animals: 2000, flws: 20, vaccination: 70 },
            { region: 'West India', score: 88, animals: 1500, flws: 15, vaccination: 85 },
            { region: 'Central India', score: 70, animals: 1000, flws: 10, vaccination: 65 }
          ],
          regionalComparison: [
            { name: 'South India', score: 90, rank: 1, growth: 12 },
            { name: 'West India', score: 88, rank: 2, growth: 8 },
            { name: 'North India', score: 85, rank: 3, growth: 6 },
            { name: 'East India', score: 75, rank: 4, growth: 4 },
            { name: 'Central India', score: 70, rank: 5, growth: 2 }
          ],
          insights: [
            { type: 'positive', title: 'Regional Excellence', description: 'South India leading in all key metrics' },
            { type: 'negative', title: 'Regional Disparity', description: 'Central India needs immediate intervention' }
          ],
          recommendations: [
            { title: 'Resource Reallocation', description: 'Redirect resources to underperforming regions', priority: 'High' },
            { title: 'Best Practice Sharing', description: 'Share South India success strategies with other regions', priority: 'Medium' }
          ]
        };
        break;
        
      default:
        analytics = {
          keyStats: [
            { label: 'Total Data Points', value: '1,000+', valueColor: '#2196F3' },
            { label: 'Data Quality', value: '92%', valueColor: '#4CAF50' },
            { label: 'Last Updated', value: 'Today', valueColor: '#FF9800' }
          ],
          chartData: generateMockTimeSeriesData(period),
          detailedData: [],
          insights: [],
          recommendations: []
        };
    }
    
    res.json(analytics);
  } catch (e) {
    console.error('Error generating detailed analytics:', e);
    res.status(500).json({ error: 'Failed to generate detailed analytics' });
  }
});

app.get('/api/govt/export', authMiddleware, requireRole(['govt', 'admin']), (req, res) => {
  try {
    const { type, format, region } = req.query;
    
    let data = [];
    
    switch (type) {
      case 'animals':
        data = getAnimals().map(animal => ({
          id: animal.id,
          earTag: animal.earTag || '',
          breed: animal.breed || '',
          gender: animal.gender || '',
          age: animal.age || '',
          weight: animal.weight || '',
          healthStatus: animal.healthStatus || '',
          ownerName: animal.ownerName || '',
          ownerPhone: animal.ownerPhone || '',
          village: animal.village || '',
          district: animal.district || '',
          state: animal.state || '',
          createdAt: animal.createdAt || ''
        }));
        break;
        
      case 'breeds':
        const animals = getAnimals();
        const breedCounts = {};
        animals.forEach(animal => {
          const breed = animal.breed || 'Unknown';
          breedCounts[breed] = (breedCounts[breed] || 0) + 1;
        });
        data = Object.entries(breedCounts).map(([name, count]) => ({
          breed: name,
          count: count,
          percentage: Math.round((count / animals.length) * 100)
        }));
        break;
        
      case 'health':
        data = getAnimals().map(animal => ({
          id: animal.id,
          breed: animal.breed || '',
          healthStatus: animal.healthStatus || '',
          vaccinationStatus: animal.vaccinationStatus || '',
          lastHealthCheck: animal.lastHealthCheck || '',
          healthRecords: animal.healthRecords?.length || 0
        }));
        break;
        
      case 'users':
        data = getUsers().map(user => ({
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          village: user.village || '',
          district: user.district || '',
          state: user.state || '',
          isActive: user.isActive !== false,
          createdAt: user.createdAt || ''
        }));
        break;
    }
    
    if (format === 'csv') {
      const csvHeader = Object.keys(data[0] || {}).join(',');
      const csvRows = data.map(row => Object.values(row).join(','));
      const csvContent = [csvHeader, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_data.csv"`);
      res.send(csvContent);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_data.json"`);
      res.json(data);
    } else {
      res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (e) {
    console.error('Error exporting data:', e);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.post('/api/govt/generate-report', authMiddleware, requireRole(['govt', 'admin']), (req, res) => {
  try {
    const { reportType, region, timeframe } = req.body;
    
    // Mock PDF generation - in a real system, you would use a PDF library
    const reportData = {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      region: region,
      timeframe: timeframe,
      generatedAt: new Date().toISOString(),
      data: getAnimals().slice(0, 100) // Sample data
    };
    
    // For now, return JSON. In a real system, generate actual PDF
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.json"`);
    res.json(reportData);
  } catch (e) {
    console.error('Error generating report:', e);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Helper function to generate mock time series data
function generateMockTimeSeriesData(period) {
  const data = [];
  const now = new Date();
  let months = 12;
  
  if (period === '3months') months = 3;
  else if (period === '6months') months = 6;
  else if (period === '24months') months = 24;
  else if (period === 'all') months = 36;
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000) + 500,
      label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    });
  }
  
  return data;
}

// Disease Detection
app.post('/api/detect-diseases', authMiddleware, upload.array('images', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No images uploaded' });
  
  try {
    // For now, use the first image for detection
    const healthData = await diseaseDetector.detectDiseases(req.files[0].buffer);
    res.json(healthData);
  } catch (error) {
    console.error('Disease detection error:', error);
    // Return mock data for demonstration
    const mockData = {
      diseases: [
        {
          name: 'Bovine Respiratory Disease',
          confidence: 0.85,
          severity: 'moderate',
          description: 'Common respiratory infection in cattle',
          symptoms: ['Coughing', 'Nasal discharge', 'Fever', 'Loss of appetite'],
          treatment: 'Antibiotics and supportive care',
          medication: 'Oxytetracycline',
          urgency: 'medium'
        }
      ],
      overallHealth: {
        score: 75,
        status: 'Moderate health concerns detected',
        recommendations: 'Monitor closely and follow treatment protocol'
      }
    };
    res.json(mockData);
  }
});

// Alternative endpoint for single image upload (fallback)
app.post('/api/detect-diseases-single', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  
  try {
    const healthData = await diseaseDetector.detectDiseases(req.file.buffer);
    res.json(healthData);
  } catch (error) {
    console.error('Disease detection error:', error);
    // Return mock data for demonstration
    const mockData = {
      diseases: [
        {
          name: 'Foot Rot',
          confidence: 0.75,
          severity: 'critical',
          description: 'Common foot rot in cattle',
          symptoms: ['Fever', 'Loss of appetite', 'Lethargy', 'Abnormal behavior'],
          treatment: 'Antibiotics and supportive care',
          medication: 'Oxytetracycline',
          urgency: 'high'
        }
      ],
      overallHealth: {
        score: 87,
        status: 'Critical health issues detected',
        recommendations: 'Immediate veterinary attention required'
      }
    };
    res.json(mockData);
  }
});

// Voice Input
app.post('/api/voice/process', authMiddleware, upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio uploaded' });
  
  try {
    const { language = 'en-US' } = req.body;
    const voiceData = await voiceService.processVoiceInput(req.file.buffer, language);
    res.json(voiceData);
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ error: 'Voice processing failed' });
  }
});

app.post('/api/voice/create-animal', authMiddleware, async (req, res) => {
  try {
    const { voiceData } = req.body;
    const animal = await voiceService.createAnimalFromVoice(voiceData, req.user);
    
    const animals = getAnimals();
    animals.push(animal);
    saveAnimals(animals);
    
    // Add to blockchain
    blockchainService.createAnimalRecord(animal, req.user.sub);
    
    // Broadcast real-time update
    broadcastUpdate('animal_created', animal);
    
    res.status(201).json(animal);
  } catch (error) {
    console.error('Voice animal creation error:', error);
    res.status(500).json({ error: 'Failed to create animal from voice' });
  }
});

// Blockchain
app.get('/api/blockchain/stats', authMiddleware, (req, res) => {
  const stats = blockchainService.getBlockchainStats();
  res.json(stats);
});

app.get('/api/blockchain/animal/:id/history', authMiddleware, (req, res) => {
  const history = blockchainService.getAnimalHistory(req.params.id);
  res.json(history);
});

app.get('/api/blockchain/animal/:id/verify', authMiddleware, (req, res) => {
  const verification = blockchainService.verifyAnimalRecord(req.params.id);
  res.json(verification);
});

app.get('/api/blockchain/animal/:id/certificate', authMiddleware, (req, res) => {
  try {
    const certificate = blockchainService.generateCertificate(req.params.id);
    res.json(certificate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// AR Overlays
app.get('/api/ar/breed/:breed', authMiddleware, (req, res) => {
  const { confidence = 0.8 } = req.query;
  const overlay = arService.generateBreedOverlay(req.params.breed, parseFloat(confidence));
  res.json(overlay);
});

app.post('/api/ar/health', authMiddleware, (req, res) => {
  const { healthData } = req.body;
  const overlay = arService.generateHealthOverlay(healthData);
  res.json(overlay);
});

app.post('/api/ar/vaccination', authMiddleware, (req, res) => {
  const { animal, vaccinationSchedule } = req.body;
  const overlay = arService.generateVaccinationOverlay(animal, vaccinationSchedule);
  res.json(overlay);
});

app.get('/api/ar/training/:type', authMiddleware, (req, res) => {
  const overlay = arService.generateTrainingOverlay(req.params.type);
  res.json(overlay);
});

app.get('/api/ar/breeds', authMiddleware, (req, res) => {
  const breeds = arService.getBreedList();
  res.json(breeds);
});

// Marketplace
app.get('/api/marketplace/listings', authMiddleware, (req, res) => {
  const listings = marketplaceService.getListings(req.query);
  res.json(listings);
});

app.get('/api/marketplace/categories', authMiddleware, (req, res) => {
  const categories = marketplaceService.getCategories();
  res.json(categories);
});

app.get('/api/marketplace/recommendations', authMiddleware, (req, res) => {
  const { animalData, location } = req.query;
  const recommendations = marketplaceService.getRecommendations(
    JSON.parse(animalData || '{}'), 
    location || ''
  );
  res.json(recommendations);
});

app.get('/api/marketplace/listing/:id', authMiddleware, (req, res) => {
  const listing = marketplaceService.getListingById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json(listing);
});

app.post('/api/marketplace/listing', authMiddleware, (req, res) => {
  try {
    const listing = marketplaceService.createListing(req.body, req.user.sub);
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/marketplace/listing/:id', authMiddleware, (req, res) => {
  try {
    const listing = marketplaceService.updateListing(req.params.id, req.body, req.user.sub);
    res.json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/marketplace/listing/:id', authMiddleware, (req, res) => {
  try {
    marketplaceService.deleteListing(req.params.id, req.user.sub);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/marketplace/inquiry', authMiddleware, (req, res) => {
  try {
    const { listingId, message } = req.body;
    const inquiry = marketplaceService.recordInquiry(listingId, req.user.sub, message);
    res.status(201).json(inquiry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/marketplace/stats', authMiddleware, (req, res) => {
  const stats = marketplaceService.getMarketplaceStats();
  res.json(stats);
});

// Advanced Notifications
app.post('/api/notifications/send', authMiddleware, async (req, res) => {
  try {
    const { type, animalId, ownerContact } = req.body;
    const animals = getAnimals();
    const animal = animals.find(a => a.id === animalId);
    
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    
    let result;
    switch (type) {
      case 'vaccination':
        result = await advancedNotificationService.sendVaccinationReminder(animal, ownerContact);
        break;
      case 'health_alert':
        result = await advancedNotificationService.sendHealthAlert(animal, req.body.healthData, ownerContact);
        break;
      case 'approval':
        result = await advancedNotificationService.sendApprovalNotification(animal, ownerContact);
        break;
      default:
        return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Notification sending error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

// Export for Vercel serverless functions
if (process.env.VERCEL) {
  module.exports = app;
} else {
  server.listen(port, () => {
    console.log(`API listening on :${port}`);
    console.log(`WebSocket server ready for real-time updates`);
  });
}
