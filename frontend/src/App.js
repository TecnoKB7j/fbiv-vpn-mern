// FBIV VPN React App
// Main app component - handles routing and global state
// Created: OCTOBER 2025 - Team effort (mostly Emmanuel's work)
// TODO: Clean this up before production lol
// BUG: Loading spinner sometimes shows too long on fast connections
// FIXME: Modal state management could be cleaner

import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
// import { BrowserRouter } from 'react-router-dom'; // not needed anymore

// Layout components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LoadingOverlay from './components/Layout/LoadingOverlay';
import ConnectionStatus from './components/Layout/ConnectionStatus';
import ThemeToggle from './components/Layout/ThemeToggle';

// Main pages (7 total - all working! finally...)
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Servers from './pages/Servers';
import SpeedTest from './pages/SpeedTest';
import Security from './pages/Security';
import Pricing from './pages/Pricing';
import Account from './pages/Account'; // this one gave us headaches for days

// Context providers - using React Context instead of Redux (simpler for this project)
import { AuthProvider } from './contexts/AuthContext';
import { VPNProvider } from './contexts/VPNContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Authentication modals - Bootstrap modals work great (better than custom ones we tried)
import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';

// Debug flag - remove before deploying to prod
const DEBUG_MODE = process.env.NODE_ENV === 'development';

function App() {
  // Modal state management (could use a hook for this but meh, it works)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Loading state - shows spinner during initial load
  // NOTE: Increased from 1000ms to 1500ms because users complained it was too fast
  const [isLoading, setIsLoading] = useState(true);
  
  // Keep track of app initialization for debugging
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    // Debug logging - helps with troubleshooting
    if (DEBUG_MODE) {
      console.log('🚀 FBIV VPN App initializing...');
      console.log('Environment:', process.env.NODE_ENV);
    }
    
    // Hide loading after initial load
    // TODO: Make this dynamic based on actual data loading
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setAppInitialized(true);
      if (DEBUG_MODE) console.log('✅ App initialization complete');
    }, 1500); // sweet spot between too fast and too slow

    // Cleanup
    return () => clearTimeout(loadingTimer);
  }, []);

  // Debug function (remove in production)
  const handleDebugInfo = () => {
    if (DEBUG_MODE) {
      console.log('=== DEBUG INFO ===');
      console.log('App initialized:', appInitialized);
      console.log('Loading state:', isLoading);
      console.log('Login modal:', showLoginModal);
      console.log('Register modal:', showRegisterModal);
    }
  };

  // Call debug info on dev builds
  useEffect(() => {
    if (DEBUG_MODE && appInitialized) {
      handleDebugInfo();
    }
  }, [appInitialized, showLoginModal, showRegisterModal]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <VPNProvider>
          <div className="App">
            {/* Loading overlay - users actually like this */}
            {isLoading && <LoadingOverlay />}
            
            {/* Global UI components - always visible */}
            <ThemeToggle />
            <ConnectionStatus />
            
            {/* Main navigation */}
            <Navbar 
              onLogin={() => {
                setShowLoginModal(true);
                if (DEBUG_MODE) console.log('👤 Login modal opened');
              }}
              onRegister={() => {
                setShowRegisterModal(true);
                if (DEBUG_MODE) console.log('📝 Register modal opened');
              }}
            />
            
            {/* Main content area */}
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/servers" element={<Servers />} />
                <Route path="/speedtest" element={<SpeedTest />} />
                <Route path="/security" element={<Security />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/account" element={<Account />} />
                {/* TODO: Add 404 page */}
              </Routes>
            </main>
            
            {/* Footer - kept simple */}
            <Footer />
            
            {/* Authentication Modals */}
            {/* NOTE: Using separate modals instead of one modal with tabs (better UX) */}
            <LoginModal 
              show={showLoginModal} 
              onHide={() => {
                setShowLoginModal(false);
                if (DEBUG_MODE) console.log('👤 Login modal closed');
              }}
              onSwitchToRegister={() => {
                setShowLoginModal(false);
                setShowRegisterModal(true);
                if (DEBUG_MODE) console.log('🔄 Switched to register modal');
              }}
            />
            <RegisterModal 
              show={showRegisterModal} 
              onHide={() => {
                setShowRegisterModal(false);
                if (DEBUG_MODE) console.log('📝 Register modal closed');
              }}
              onSwitchToLogin={() => {
                setShowRegisterModal(false);
                setShowLoginModal(true);
                if (DEBUG_MODE) console.log('🔄 Switched to login modal');
              }}
            />
          </div>
        </VPNProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
