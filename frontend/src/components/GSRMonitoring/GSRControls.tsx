import React from 'react';
import type { GSRMode, GSRConnectionStatus } from '../../types/gsr';

interface GSRControlsProps {
  mode: GSRMode;
  setMode: (mode: GSRMode) => void;
  connectionStatus: GSRConnectionStatus;
}

export const GSRControls: React.FC<GSRControlsProps> = ({
  connectionStatus,
}) => {
  return (
    <div className="physio-sensor-status-badge">
      <span className={`physio-status-dot ${connectionStatus === 'connected' ? 'connected' : 'connecting'}`} />
      <span>{connectionStatus === 'connected' ? 'Sensors Connected' : 'Connecting Sensors...'}</span>
    </div>
  );
};
