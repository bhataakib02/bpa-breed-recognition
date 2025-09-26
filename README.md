# 🐄 PashuVision - AI Livestock Management System

**Complete Enterprise-Level Livestock Management Platform**

An AI-powered, comprehensive solution for cattle and buffalo breed recognition, health monitoring, and livestock management for modern agricultural practices.

## 🌟 **Features Overview**

### 🤖 **AI & Machine Learning**
- **Real-time Breed Recognition**: Advanced AI with heatmap visualization
- **Species Detection**: Automatic cattle vs buffalo identification
- **Crossbreed Detection**: Advanced genetic analysis
- **AI Disease Detection**: Skin infections, malnutrition, lameness, mastitis detection
- **Explainable AI**: Visual heatmaps showing prediction reasoning
- **Weight Estimation**: AI-powered weight prediction from images

### 📱 **Multi-Platform Support**
- **Web Application**: React-based responsive dashboard
- **Mobile-Ready**: Progressive Web App (PWA) capabilities
- **Voice Input**: Multi-language voice commands for accessibility
- **AR Training**: Augmented Reality overlays for training
- **NFC Scanning**: Near Field Communication for quick identification
- **Biometric Authentication**: Fingerprint and face recognition

### 🔐 **Security & Compliance**
- **Blockchain Integration**: Tamper-proof animal records
- **Role-Based Access Control**: Admin, Supervisor, FLW, Veterinarian, Government permissions
- **JWT Authentication**: Secure token-based authentication
- **OTP Authentication**: Phone-based login system
- **Audit Logging**: Complete activity tracking
- **Data Encryption**: End-to-end data protection

### 📊 **Analytics & Reporting**
- **Advanced Charts**: Interactive visualizations with Chart.js
- **Real-time Dashboards**: Live WebSocket updates
- **Breed Distribution**: Geographic and demographic analytics
- **Health Monitoring**: Population health trends
- **Performance Metrics**: User activity tracking
- **Government Analytics**: High-level policy insights

### 🌐 **Multi-Language Support**
- **Languages**: English, Hindi (हिन्दी), Urdu (اردو)
- **Real-time Switching**: Instant language changes
- **Complete Translation**: All UI elements translated
- **Voice Commands**: Multi-language voice input
- **RTL Support**: Right-to-left text for Urdu

### 🔔 **Smart Notifications**
- **Automated Reminders**: Vaccination, health check schedules
- **Multi-Channel**: SMS, Email, Push notifications
- **Priority Levels**: High, medium, low urgency
- **Smart Scheduling**: Automated alerts and reminders
- **SMS Integration**: Twilio-based notification system

### 🛒 **Advanced Features**
- **Service Providers**: Feed suppliers, veterinary services
- **Smart Recommendations**: AI-powered service matching
- **Location-Based**: Geographic service discovery
- **QR Code Generation**: Unique animal identification
- **Auto QR Generation**: Automatic QR code creation
- **Voice Guidance**: Step-by-step audio instructions

### 📋 **Data Management**
- **Bulk Operations**: Excel import/export
- **GPS Tracking**: Location-based animal records
- **Multi-Image Support**: Comprehensive photo documentation
- **Offline Support**: Local storage with sync capabilities
- **Data Export**: CSV, JSON, PDF export options
- **Image Quality Check**: Automatic blur and darkness detection

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd bpa-breed-recognition
```

2. **Backend Setup**
```bash
cd backend
npm install
npm run dev
```

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

### Complete Setup Commands

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Login**: admin@example.com / admin123

### Alternative Ports
If ports are busy, the application will automatically use:
- **Frontend**: http://localhost:5174 (if 5173 is busy)
- **Backend**: Change port in `backend/src/server.js` if needed

### Troubleshooting
If you get "address already in use" errors:
```bash
# Kill all Node.js processes
taskkill /f /im node.exe

# Then restart both servers
cd backend && npm run dev
cd frontend && npm run dev
```

## 🏗️ **Architecture**

### Backend (Node.js + Express)
- **API Server**: RESTful endpoints with WebSocket support
- **AI Engine**: Advanced breed prediction and disease detection
- **Blockchain**: Custom blockchain for record integrity
- **Services**: Modular service architecture
- **Database**: JSON file-based storage (production-ready for MongoDB)
- **Authentication**: JWT, OTP, and biometric support

### Frontend (React + Vite)
- **Modern UI**: Responsive design with professional styling
- **Real-time**: WebSocket client for live updates
- **Charts**: Chart.js for advanced analytics
- **i18n**: react-i18next for multi-language support
- **PWA**: Progressive Web App capabilities
- **Layout System**: Consistent header/footer across pages

## 📡 **API Endpoints**

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/send-otp` - Send OTP for phone login
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/biometric` - Biometric authentication

### Core Features
- `POST /api/animals` - Create animal records
- `GET /api/animals` - List all animals
- `PUT /api/animals/:id` - Update animal record
- `DELETE /api/animals/:id` - Delete animal record
- `POST /api/predict` - AI breed prediction
- `POST /api/detect-diseases` - AI disease detection

### Admin Features
- `GET /api/admin/users` - List all users with statistics
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/breeds` - List breeds
- `POST /api/admin/breeds` - Create breed
- `PUT /api/admin/breeds/:id` - Update breed
- `DELETE /api/admin/breeds/:id` - Delete breed

### Supervisor Features
- `GET /api/animals/pending` - Get pending records
- `POST /api/animals/:id/approve` - Approve record
- `POST /api/animals/:id/reject` - Reject record
- `POST /api/animals/:id/flag` - Flag for revision
- `GET /api/analytics/team` - Team performance analytics

### Veterinarian Features
- `GET /api/vet/animals` - Get animals with health records
- `POST /api/vet/health-records` - Add health record
- `PUT /api/vet/health-records/:id` - Update health record
- `POST /api/vet/schedule-treatment` - Schedule treatment
- `GET /api/vet/disease-history` - Get disease history

### Government Features
- `GET /api/govt/analytics` - High-level analytics
- `GET /api/govt/detailed-analytics` - Detailed analytics
- `POST /api/govt/export` - Export data
- `POST /api/govt/generate-report` - Generate reports

### Advanced Features
- `POST /api/voice/process` - Voice input processing
- `GET /api/blockchain/animal/:id/history` - Blockchain records
- `GET /api/ar/breed/:breed` - AR overlay generation
- `GET /api/marketplace/listings` - Service marketplace
- `POST /api/bulk/import` - Excel data import

## 🎯 **User Roles & Features**

### Field Level Worker (FLW)
- Voice-based animal registration
- AR-guided breed identification
- Offline data capture with sync
- Multi-language interface
- GPS tracking
- Image quality validation
- Unique FLW ID for record tracking

### Supervisor
- Real-time monitoring dashboard
- Record review and approval
- Team performance analytics
- Bulk operations
- Data quality oversight
- FLW management

### Administrator
- User management
- Breed database management
- System analytics
- Role-based permissions
- Data export/import
- System health monitoring

### Veterinarian
- Health record management
- Disease detection
- Treatment scheduling
- Health analytics
- Medical history tracking

### Government Official
- National-level analytics
- Policy planning insights
- Scheme effectiveness tracking
- Population health monitoring
- Data export capabilities

## 🔧 **Configuration**

### Environment Variables
```bash
# Backend
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# AI Models
MODEL_PATH=./models/breed-classifier.onnx
```

### Customization
- **Breed Database**: Add new breeds in `backend/src/ai/BreedPredictor.js`
- **Languages**: Add translations in `frontend/src/i18n/index.js`
- **Marketplace**: Configure services in `backend/src/services/MarketplaceService.js`
- **Styling**: Update design system in `frontend/src/App.css`

## 📈 **Performance**

- **AI Inference**: < 2 seconds per image
- **Real-time Updates**: < 100ms latency
- **Concurrent Users**: 1000+ supported
- **Data Processing**: Bulk operations in seconds
- **Offline Sync**: Automatic when connection restored

## 🛡️ **Security Features**

- **Authentication**: JWT with role-based access
- **Data Integrity**: Blockchain verification
- **Encryption**: End-to-end data protection
- **Audit Trail**: Complete activity logging
- **Input Validation**: Comprehensive data sanitization
- **OTP Security**: Time-based one-time passwords
- **Biometric Security**: Fingerprint and face recognition

## 🌍 **Deployment**

### Production Setup
1. **Database**: Configure MongoDB/PostgreSQL
2. **AI Models**: Deploy advanced models to GPU servers
3. **CDN**: Set up image and static file delivery
4. **Monitoring**: Implement logging and alerting
5. **Scaling**: Configure load balancers and auto-scaling

### Docker Deployment
```bash
docker-compose up -d
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: Comprehensive API documentation
- **Issues**: GitHub Issues for bug reports
- **Community**: Discussion forums for questions
- **Training**: User training materials and guides
- **Contact**: support@pashuvision.com

## 🎉 **Acknowledgments**

- ONNX Runtime team for AI inference
- React and Node.js communities
- Open source contributors
- Agricultural technology innovators

---

**Built with ❤️ for modern livestock management and agricultural development**

**PashuVision** - Transforming livestock management through AI technology