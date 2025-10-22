# 🚀 Saathi TV - Quick Setup Guide

## Windows Quick Start

### Option 1: One-Click Start (Recommended)
1. Double-click `start.bat` in the project root
2. Wait for both servers to start
3. Your browser will automatically open to `http://localhost:8080`
4. Allow camera and microphone permissions
5. Start chatting!

### Option 2: Manual Setup

#### Prerequisites
- Node.js 16+ installed from [nodejs.org](https://nodejs.org/)
- Modern web browser (Chrome, Firefox, Safari, Edge)

#### Step-by-Step Installation

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install all project dependencies:**
   ```bash
   npm run install:all
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

## 🔧 Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend in development mode
npm run dev

# Start production mode
npm start

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Clean all node_modules
npm run clean

# Build for production
npm run build
```

## 🐳 Docker Setup

```bash
# Build and start with Docker Compose
docker-compose up --build

# Stop containers
docker-compose down
```

## 📱 Mobile Testing

1. Find your computer's IP address
2. Update `frontend/js/main.js` with your IP
3. Access from mobile browser: `http://YOUR_IP:8080`

## 🔒 HTTPS Setup (Required for Mobile)

For mobile devices, you need HTTPS:

1. Install `mkcert` for local SSL certificates
2. Generate certificates for your local domain
3. Update server configuration to use HTTPS

## 🚨 Troubleshooting

### Common Issues

**"Cannot access camera/microphone"**
- Allow permissions in browser
- Use HTTPS for mobile devices
- Check if camera/mic is being used by other apps

**"Connection failed"**
- Check if backend server is running on port 3000
- Verify firewall settings
- Try refreshing the page

**"Node.js not found"**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart command prompt/terminal
- Verify installation: `node --version`

### Port Conflicts

If ports 3000 or 8080 are in use:

1. **Backend (port 3000):**
   - Edit `backend/server.js`
   - Change `PORT` variable
   - Update frontend connection URL

2. **Frontend (port 8080):**
   - Edit `frontend/package.json`
   - Change port in start script
   - Update CORS settings in backend

## 🌐 Production Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy 'dist' folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Deploy backend folder
# Set environment variables
```

## 📊 Features Overview

✅ **Working Features:**
- Random video chat matching
- Real-time text messaging
- Country and gender filters
- Mobile responsive design
- PWA capabilities
- WebRTC peer-to-peer connections

🔄 **In Development:**
- User accounts
- Friend system
- Group chat
- Screen sharing

## 🆘 Need Help?

1. Check this setup guide
2. Read the main README.md
3. Check browser console for errors
4. Verify network connectivity
5. Contact support: support@saathi-tv.com

---

**Happy chatting with Saathi TV! 🎥💬**
