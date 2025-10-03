# 🚀 Quick Start Guide - FBIV VPN

## 🎯 How to Run Your VPN Application

### 🔥 Method 1: Easy Batch Files (Recommended!)

We've created simple batch files to start your servers:

1. **Start Backend Server:**
   - Double-click `start-backend.bat` in the project root
   - Wait for: "🚀 FBIV VPN Server running on port 5000"

2. **Start Frontend Server:**
   - Double-click `start-frontend.bat` in the project root  
   - Your browser will automatically open to `http://localhost:3000`

### 🛠️ Method 2: Manual Command Line

If you prefer manual control:

#### Backend:
```cmd
cd "C:\Users\HP\Desktop\fbiv vpn mern\backend"
node index.js
```

#### Frontend:
```cmd
cd "C:\Users\HP\Desktop\fbiv vpn mern\frontend"
npx webpack serve --mode development --open
```

### 🔧 Troubleshooting PowerShell Issues

If you get execution policy errors:
1. **Open PowerShell as Administrator**
2. **Run:** `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. **Type:** `Y` and press Enter

### ✅ What to Expect

**Backend (Port 5000):**
- API server for authentication, servers, speed tests
- Look for startup message with green checkmarks ✅

**Frontend (Port 3000):**
- React application with beautiful VPN interface
- Should automatically open in your browser 🌐

### 🎊 You're All Set!

Once both servers are running:
- Visit `http://localhost:3000` for the VPN app
- The Account page error has been fixed! 🎉
- Try registering/logging in to test the full experience

### 📱 Features Ready to Test:
- ✅ Home page with live stats
- ✅ Server selection and connection
- ✅ Speed testing with real-time results  
- ✅ Security settings and preferences
- ✅ Account management (now error-free!)
- ✅ Pricing plans and subscriptions
- ✅ Dashboard with analytics

**Happy VPN developing!** 🛡️✨