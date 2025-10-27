# How to Deploy Backend Server for Real User Connections

## The Problem
Currently, your app runs in "Demo Mode" on GitHub Pages because there's no backend server. This means users see a simulated video chat experience, not real connections with other users.

## Solution: Deploy a Backend Server

To connect with actual users, you need to deploy the backend server to a platform that supports Node.js and WebSockets.

---

## Option 1: Deploy to Railway (Recommended - Easy & Free)

### Steps:

1. **Sign up for Railway**: https://railway.app/
   - Sign up with your GitHub account (free tier available)

2. **Deploy the backend**:
   ```bash
   cd backend
   # Railway CLI (optional but easier)
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

3. **Or use Railway Dashboard**:
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder
   - Railway will auto-detect Node.js

4. **Get your backend URL**:
   - After deployment, Railway will give you a URL like: `https://your-app-name.railway.app`
   - Copy this URL

5. **Update frontend to use it**:
   - Edit `frontend/js/unified-webrtc-system.js`
   - Find line 61: `const deployedBackendURL = 'https://your-backend-server.com';`
   - Replace with: `const deployedBackendURL = 'https://your-app-name.railway.app';`

6. **Deploy frontend**:
   - Your frontend is already on GitHub Pages, just push the changes

---

## Option 2: Deploy to Heroku

### Steps:

1. **Install Heroku CLI**:
   ```bash
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   
   # Or use npm
   npm install -g heroku
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create the app**:
   ```bash
   cd backend
   heroku create your-app-name
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **Get your backend URL**:
   - Heroku gives you: `https://your-app-name.herokuapp.com`
   - Update the frontend with this URL

---

## Option 3: Deploy to Render (Free Tier)

### Steps:

1. **Sign up**: https://render.com/

2. **Create a new Web Service**:
   - Connect your GitHub repo
   - Select the `backend` folder
   - Build command: `npm install`
   - Start command: `node server.js`

3. **Get your backend URL**: `https://your-app.onrender.com`
   - Update the frontend with this URL

---

## Option 4: Self-Host with a VPS

If you have a VPS or server:

```bash
cd backend
npm install
node server.js
```

Then update the frontend URL to point to your server.

---

## Testing Locally First

Before deploying, test locally:

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3001

# In another terminal
# Open two browser windows to http://localhost:3001
# Both should see "Looking for someone..."
# They should match with each other!
```

---

## Important Notes

### CORS Configuration
The backend's `server.js` has CORS settings that only allow specific origins. Update line 18 in `backend/server.js`:

```javascript
const io = socketIo(server, {
    cors: {
        origin: [
            "http://localhost:3000", 
            "http://localhost:8080", 
            "https://amitkumar262002.github.io",  // Add your GitHub Pages URL
            "https://your-deployed-backend.com"     // Add your deployed backend URL
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});
```

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://amitkumar262002.github.io
```

---

## Quick Commands

### Railway
```bash
railway login
railway init
railway up
railway domain  # Get your URL
```

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku open  # Open your app
```

### Render
- Use the dashboard to deploy
- It's mostly automated

---

## After Deployment

1. ✅ Backend is running and accessible
2. ✅ Frontend is updated with backend URL
3. ✅ CORS is configured correctly
4. ✅ Push changes to GitHub
5. ✅ Test with two browser windows - should connect real users!

---

## Troubleshooting

### "Demo Mode" still showing:
- Check browser console for errors
- Verify backend URL is correct
- Check CORS settings
- Make sure backend is actually running

### Can't connect to backend:
- Check firewall settings
- Verify backend is running: `curl https://your-backend-url.com/api/health`
- Check logs on your hosting platform

### Two users not matching:
- Make sure both users are on the same backend
- Check backend logs for connection attempts
- Try refreshing both pages

---

## Next Steps

Once your backend is deployed:
1. Update the frontend with the new backend URL
2. Push to GitHub
3. Test with two browser windows
4. Share your app - now real users can connect!

Good luck! 🚀

