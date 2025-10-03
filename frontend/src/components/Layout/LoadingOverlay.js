import React, { useState, useEffect } from 'react';

const LoadingOverlay = () => {
  const [loadingText, setLoadingText] = useState('Loading FBIV VPN...');
  const [isVisible, setIsVisible] = useState(true);

  const loadingTexts = [
    'Loading FBIV VPN...',
    'Initializing Security Protocols...',
    'Connecting to Global Network...',
    'Optimizing Performance...',
    'Almost Ready...'
  ];

  useEffect(() => {
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[textIndex]);
    }, 800);

    // Hide loading after 2 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="loading-overlay active">
      <div>
        <div className="color-wheel-spinner"></div>
        <div className="loading-text">{loadingText}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;