import React from 'react';
import { useVPN } from '../../contexts/VPNContext';

const ConnectionStatus = () => {
  const { connectionStatus, connectedServer, connectionTime, getConnectionStatusClass } = useVPN();

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return `🔒 Connected to ${connectedServer?.location || 'VPN'} • ${connectionTime}`;
      case 'connecting':
        return '🔄 Connecting...';
      default:
        return '🔓 Disconnected';
    }
  };

  return (
    <div className={`connection-status ${getConnectionStatusClass()}`}>
      <span className={connectionStatus === 'connecting' ? 'pulse' : ''}>
        {getStatusText()}
      </span>
    </div>
  );
};

export default ConnectionStatus;