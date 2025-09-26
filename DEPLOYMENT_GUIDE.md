# 🚀 PashuVision Deployment Guide

This guide provides multiple deployment options for the PashuVision AI Livestock Management System.

## 📋 **Prerequisites**

- Node.js 18+
- Docker (for containerized deployment)
- Git
- Cloud platform account (AWS, Vercel, Netlify, Heroku, etc.)

## 🐳 **Option 1: Docker Deployment (Recommended)**

### Local Docker Deployment

1. **Build and run with Docker Compose:**
```bash
# Clone the repository
git clone https://github.com/bhataakib02/bpa-breed-recognition.git
cd bpa-breed-recognition

# Build and start services
docker-compose up -d

# Check status
docker-compose ps
```

2. **Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:4000
- Admin Login: admin@example.com / admin123

### Production Docker Deployment

1. **Update environment variables:**
```bash
# Edit docker-compose.yml
# Set production JWT_SECRET and other environment variables
```

2. **Deploy to cloud:**
```bash
# AWS ECS, Google Cloud Run, or Azure Container Instances
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ **Option 2: Vercel Deployment**

### Frontend + Backend on Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts
```

3. **Environment Variables:**
Set in Vercel dashboard:
- `JWT_SECRET`
- `NODE_ENV=production`

## 🌐 **Option 3: Netlify + Heroku**

### Frontend on Netlify

1. **Connect GitHub repository to Netlify**
2. **Build settings:**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`

### Backend on Heroku

1. **Install Heroku CLI:**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli
```

2. **Deploy backend:**
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create pashuvision-backend

# Set environment variables
heroku config:set JWT_SECRET=your-production-secret
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix backend heroku main
```

3. **Update Netlify redirects:**
Update `netlify.toml` with your Heroku backend URL.

## 🏗️ **Option 4: AWS Deployment**

### Using AWS Elastic Beanstalk

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize EB:**
```bash
cd backend
eb init
eb create production
eb deploy
```

3. **Deploy frontend to S3 + CloudFront:**
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

## 🔧 **Option 5: Manual VPS Deployment**

### Ubuntu/Debian Server

1. **Server setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

2. **Deploy application:**
```bash
# Clone repository
git clone https://github.com/bhataakib02/bpa-breed-recognition.git
cd bpa-breed-recognition

# Install dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build

# Start backend with PM2
cd ../backend
pm2 start src/server.js --name "pashuvision-backend"
pm2 save
pm2 startup
```

3. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/bpa-breed-recognition/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 **Environment Variables**

### Required Environment Variables

```bash
# Backend
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=4000

# Optional
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

## 📊 **Monitoring & Maintenance**

### Health Checks

1. **Backend health endpoint:**
```bash
curl http://your-domain.com/api/health
```

2. **Frontend status:**
```bash
curl http://your-domain.com
```

### Logs

1. **Docker logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

2. **PM2 logs:**
```bash
pm2 logs pashuvision-backend
```

## 🚨 **Troubleshooting**

### Common Issues

1. **Port conflicts:**
```bash
# Check port usage
netstat -tulpn | grep :4000
# Kill process if needed
sudo kill -9 PID
```

2. **Permission issues:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/project
```

3. **Memory issues:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 🔄 **Updates & Scaling**

### Application Updates

1. **Pull latest changes:**
```bash
git pull origin main
npm install
npm run build
pm2 restart pashuvision-backend
```

2. **Database migrations:**
```bash
# Backup data
cp -r backend/data backend/data.backup
# Update and restart
```

### Scaling

1. **Horizontal scaling:**
- Use load balancer (Nginx, HAProxy)
- Multiple backend instances
- Database clustering

2. **Vertical scaling:**
- Increase server resources
- Optimize Node.js performance
- Use CDN for static assets

## 📞 **Support**

For deployment issues:
- Check logs for errors
- Verify environment variables
- Test API endpoints
- Contact: support@pashuvision.com

---

**Choose the deployment option that best fits your needs and infrastructure!**
