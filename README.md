# Saathi TV - Random Video Chat Application

🎥 **Connect with new people worldwide through free random video chat**

Saathi TV is a modern, mobile-responsive video chat application that allows users to connect with strangers from around the world. Built with cutting-edge web technologies including WebRTC, Socket.io, and Progressive Web App (PWA) capabilities.

## ✨ Features

- **Free Random Video Chat** - Connect with people worldwide instantly
- **Mobile Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **Country & Gender Filters** - Find people based on your preferences
- **Real-time Text Chat** - Send messages during video calls
- **PWA Support** - Install as a mobile app with offline capabilities
- **High-Quality Video** - WebRTC technology for smooth video streaming
- **Safe & Anonymous** - No registration required, chat anonymously
- **Modern UI/UX** - Beautiful, intuitive interface with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amitkumar262002/saathitest_2.git
   cd saathitest_2
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd ../backend
   npm run dev
   ```

5. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:8080`
   - Allow camera and microphone permissions
   - Start chatting!

## 📁 Project Structure

```
saathitest_2/
├── frontend/                 # Frontend application
│   ├── css/
│   │   └── styles.css       # Main stylesheet
│   ├── js/
│   │   ├── main.js          # Main application logic
│   │   ├── webrtc.js        # WebRTC functionality
│   │   └── chat.js          # Chat functionality
│   ├── assets/              # Images, icons, etc.
│   ├── index.html           # Main HTML file
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker
│   └── package.json        # Frontend dependencies
├── backend/                 # Backend server
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
└── README.md               # This file
```

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox/Grid
- **JavaScript (ES6+)** - Client-side functionality
- **WebRTC** - Peer-to-peer video/audio communication
- **Socket.io Client** - Real-time communication
- **Service Worker** - PWA functionality and caching

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **WebRTC Signaling** - Peer connection coordination
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
MAX_USERS_PER_ROOM=2
ROOM_TIMEOUT=1800000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Frontend Configuration

Update the server URL in `frontend/js/main.js`:

```javascript
const serverUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://your-production-domain.com';
```

## 📱 PWA Features

Saathi TV is a Progressive Web App with the following features:

- **Installable** - Add to home screen on mobile devices
- **Offline Support** - Basic functionality works offline
- **Push Notifications** - Get notified of new messages (when implemented)
- **App-like Experience** - Full-screen mode and native app feel

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevents abuse
- **CORS Protection** - Controlled cross-origin access
- **Input Validation** - Sanitized user inputs
- **Anonymous Chat** - No personal data required

## 📊 Performance Optimizations

- **Compression** - Gzip compression for smaller payloads
- **Caching** - Service worker caching for faster loading
- **Minification** - Compressed CSS and JavaScript
- **Image Optimization** - Optimized assets
- **Lazy Loading** - Efficient resource loading

## 🌐 Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 11+
- **Edge** 79+
- **Mobile browsers** with WebRTC support

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. Set environment variables on your hosting platform
2. Deploy the backend folder
3. Update frontend configuration with production URL

### Docker Deployment

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Or build individually:**
   ```bash
   # Backend
   cd backend
   docker build -t saathi-tv-backend .
   docker run -p 3000:3000 saathi-tv-backend

   # Frontend
   cd frontend
   docker build -t saathi-tv-frontend .
   docker run -p 8080:8080 saathi-tv-frontend
   ```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 📈 Monitoring & Analytics

- **User Statistics** - Real-time user count and room statistics
- **Performance Monitoring** - Connection quality and latency tracking
- **Error Logging** - Comprehensive error tracking
- **Usage Analytics** - User behavior and feature usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation** - Check this README and code comments
- **Issues** - Report bugs on GitHub Issues
- **Discussions** - Join GitHub Discussions for questions
- **Email** - support@saathi-tv.com

## 🎯 Roadmap

- [ ] User accounts and profiles
- [ ] Friend system
- [ ] Group video chat
- [ ] Screen sharing
- [ ] File sharing
- [ ] Mobile apps (React Native)
- [ ] Advanced moderation tools
- [ ] Language translation
- [ ] Virtual backgrounds
- [ ] Recording functionality

## 🙏 Acknowledgments

- **WebRTC** - For enabling peer-to-peer communication
- **Socket.io** - For real-time bidirectional communication
- **Express.js** - For the robust web framework
- **Contributors** - Thanks to all contributors who help improve Saathi TV

---

**Made with ❤️ by the Saathi TV Team**

*Connecting people, one conversation at a time.*
## 🔧 Recent Updates

### Login System Fixes
- ✅ Fixed missing JavaScript functions (togglePassword, showTerms, etc.)
- ✅ Enhanced Firebase authentication with better error handling
- ✅ Added comprehensive debug tool (`login-debug.html`)
- ✅ Improved user feedback with loading states

### WebRTC Improvements
- ✅ Created unified WebRTC client system
- ✅ Added signaling server for proper peer connections
- ✅ Resolved conflicts between multiple WebRTC implementations
- ✅ Enhanced connection stability and error handling

### Debug Tools
- 🔧 **login-debug.html** - Test Firebase authentication
- 🔧 **simple-test.html** - Test WebRTC connections
- 🔧 **firebase-test.html** - Firebase integration testing
