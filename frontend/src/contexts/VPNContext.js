import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const VPNContext = createContext();

export const useVPN = () => {
  const context = useContext(VPNContext);
  if (!context) {
    throw new Error('useVPN must be used within a VPNProvider');
  }
  return context;
};

export const VPNProvider = ({ children }) => {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // connected, connecting, disconnected
  const [connectedServer, setConnectedServer] = useState(null);
  const [connectionTime, setConnectionTime] = useState(0);

  // Servers
  const [servers, setServers] = useState([]);
  const [favoriteServers, setFavoriteServers] = useState([]);
  const [isLoadingServers, setIsLoadingServers] = useState(false);

  // Speed test
  const [speedTestResults, setSpeedTestResults] = useState(null);
  const [speedTestHistory, setSpeedTestHistory] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  // Analytics
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalServers: 0,
    activeConnections: 0,
    totalCountries: 0,
    networkStats: {
      avgSpeed: 0,
      globalLoad: 0,
      activeConnections: 0,
      dataProtected: 0
    },
    topServers: []
  });

  // Load servers on mount
  useEffect(() => {
    loadServers();
    loadGlobalStats();
  }, []);

  // Connection timer
  useEffect(() => {
    let interval;
    if (connectionStatus === 'connected') {
      interval = setInterval(() => {
        setConnectionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus]);

  const loadServers = async (filters = {}) => {
    setIsLoadingServers(true);
    try {
      const response = await axios.get('/api/servers', { params: filters });
      setServers(response.data);
    } catch (error) {
      console.error('Failed to load servers:', error);
    } finally {
      setIsLoadingServers(false);
    }
  };

  const loadGlobalStats = async () => {
    try {
      const response = await axios.get('/api/analytics/global');
      setGlobalStats(response.data);
    } catch (error) {
      console.error('Failed to load global stats:', error);
    }
  };

  const connectToServer = async (server) => {
    if (connectionStatus === 'connecting') return;
    
    setConnectionStatus('connecting');
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // API call to connect
      const response = await axios.post('/api/connect', { serverId: server._id });
      
      setConnectedServer(server);
      setConnectionStatus('connected');
      setConnectionTime(0);
      
      // Show success message
      return { success: true, message: `Connected to ${server.location}` };
    } catch (error) {
      setConnectionStatus('disconnected');
      return { 
        success: false, 
        message: error.response?.data?.error || 'Connection failed' 
      };
    }
  };

  const disconnect = async () => {
    try {
      await axios.post('/api/disconnect');
      
      setConnectionStatus('disconnected');
      setConnectedServer(null);
      setConnectionTime(0);
      
      return { success: true, message: 'Disconnected successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Disconnect failed' 
      };
    }
  };

  const toggleFavoriteServer = async (serverId) => {
    try {
      const response = await axios.post(`/api/servers/${serverId}/favorite`);
      
      // Update local state
      setServers(prev => 
        prev.map(server => 
          server._id === serverId 
            ? { ...server, isFavorite: response.data.isFavorite }
            : server
        )
      );
      
      return { success: true, isFavorite: response.data.isFavorite };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to update favorite' 
      };
    }
  };

  const runSpeedTest = async (testConfig = {}) => {
    setIsTesting(true);
    
    try {
      // Simulate speed test phases
      const phases = [
        { name: 'Testing Ping...', duration: 1000 },
        { name: 'Testing Download Speed...', duration: 3000 },
        { name: 'Testing Upload Speed...', duration: 2000 },
        { name: 'Analyzing Results...', duration: 1000 }
      ];

      for (const phase of phases) {
        await new Promise(resolve => setTimeout(resolve, phase.duration));
      }

      // Generate realistic results
      const results = {
        download: (Math.random() * 80 + 20).toFixed(1), // 20-100 Mbps
        upload: (Math.random() * 30 + 10).toFixed(1),   // 10-40 Mbps
        ping: Math.floor(Math.random() * 50 + 10),       // 10-60ms
        jitter: (Math.random() * 10 + 1).toFixed(1),    // 1-11ms
        timestamp: new Date().toISOString()
      };

      // Save to backend if user is logged in
      try {
        await axios.post('/api/speedtest', {
          serverId: connectedServer?._id,
          ...results,
          testDuration: testConfig.duration || 30
        });
      } catch (error) {
        console.log('Not logged in, speed test not saved');
      }

      setSpeedTestResults(results);
      setSpeedTestHistory(prev => [results, ...prev.slice(0, 9)]); // Keep last 10
      
      return { success: true, results };
    } catch (error) {
      return { 
        success: false, 
        message: 'Speed test failed' 
      };
    } finally {
      setIsTesting(false);
    }
  };

  const getConnectionStatusClass = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'status-connected';
      case 'connecting':
        return 'status-connecting';
      default:
        return 'status-disconnected';
    }
  };

  const formatConnectionTime = () => {
    const hours = Math.floor(connectionTime / 3600);
    const minutes = Math.floor((connectionTime % 3600) / 60);
    const seconds = connectionTime % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const value = {
    // Connection state
    connectionStatus,
    connectedServer,
    connectionTime: formatConnectionTime(),
    
    // Servers
    servers,
    favoriteServers,
    isLoadingServers,
    
    // Speed test
    speedTestResults,
    speedTestHistory,
    isTesting,
    
    // Analytics
    globalStats,
    
    // Actions
    connectToServer,
    disconnect,
    loadServers,
    toggleFavoriteServer,
    runSpeedTest,
    loadGlobalStats,
    getConnectionStatusClass
  };

  return (
    <VPNContext.Provider value={value}>
      {children}
    </VPNContext.Provider>
  );
};