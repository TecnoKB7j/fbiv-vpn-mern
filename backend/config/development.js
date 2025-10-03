// Development environment configuration
// Author: Emmanuel Rodriguez
// Created: October 2, 2025
// 
// This file contains development-specific settings
// DO NOT use these values in production!

module.exports = {
  // Database settings
  database: {
    host: 'localhost',
    port: 27017,
    name: 'fbivvpn_dev',
    // TODO: Add connection pooling settings
  },
  
  // JWT settings
  jwt: {
    secret: 'dev_secret_key_change_in_production', // Obviously not secure
    expiresIn: '7d', // Longer expiry for development convenience
  },
  
  // Server settings
  server: {
    port: process.env.PORT || 5000,
    host: 'localhost',
    // Enable detailed error messages in development
    showDetailedErrors: true,
  },
  
  // Logging settings
  logging: {
    level: 'debug', // Very verbose for development
    enableAPILogging: true,
    enableQueryLogging: false, // Can be noisy
  },
  
  // Feature flags (for testing new features)
  features: {
    enableSpeedTest: true,
    enableRealTimeUpdates: false, // Not implemented yet
    enableAdvancedMetrics: true,
    enableBetaFeatures: true, // Show beta features to dev team
  },
  
  // External services (using test/sandbox versions)
  services: {
    paypal: {
      clientId: 'test_paypal_client_id',
      sandbox: true,
    },
    stripe: {
      publishableKey: 'pk_test_...',
      sandbox: true,
    },
  },
  
  // Development tools
  devTools: {
    enableHotReload: true,
    enableSourceMaps: true,
    enableProfiling: false, // Enable when debugging performance
  },
};