import React, { useState } from 'react';
import type { GSRMode, GSRConnectionStatus } from '../../types/gsr';
import { Icon } from '../Icon';

interface GSRControlsProps {
  mode: GSRMode;
  setMode: (mode: GSRMode) => void;
  connectionStatus: GSRConnectionStatus;
  isBleSupported?: boolean;
  bleDeviceName?: string;
  bleErrorMessage?: string | null;
  onConnectBle?: () => Promise<boolean>;
  onDisconnectBle?: () => void;
}

export const GSRControls: React.FC<GSRControlsProps> = ({
  mode,
  connectionStatus,
  isBleSupported = true,
  bleDeviceName = '',
  bleErrorMessage = null,
  onConnectBle,
  onDisconnectBle,
}) => {
  const [isPairing, setIsPairing] = useState<boolean>(false);

  const handlePairClick = async () => {
    if (mode === 'ble') {
      // If already connected, clicking disconnects
      if (onDisconnectBle) {
        onDisconnectBle();
      }
      return;
    }

    if (onConnectBle) {
      setIsPairing(true);
      try {
        await onConnectBle();
      } finally {
        setIsPairing(false);
      }
    }
  };

  return (
    <div className="physio-controls-container">
      {/* 1-Click "Pair ESP32" Bluetooth button */}
      <button
        type="button"
        className={`physio-ble-pair-btn ${mode === 'ble' ? 'connected' : ''} ${isPairing ? 'pairing' : ''}`}
        onClick={handlePairClick}
        title={
          !isBleSupported
            ? 'Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.'
            : mode === 'ble'
            ? `Connected to ${bleDeviceName || 'ESP32'}. Click to disconnect.`
            : 'Click to pair your ESP32 DevKit V1 via Bluetooth'
        }
        disabled={isPairing}
      >
        <Icon name="Bluetooth" size={14} className={mode === 'ble' ? 'ble-icon-active' : ''} />
        <span>
          {isPairing
            ? 'Pairing ESP32...'
            : mode === 'ble'
            ? (bleDeviceName || 'ESP32 Connected')
            : 'Pair ESP32'}
        </span>
        {mode === 'ble' && (
          <span className="physio-ble-disconnect-tag" title="Disconnect device">×</span>
        )}
      </button>

      {/* Sensor status badge */}
      <div className="physio-sensor-status-badge">
        <span
          className={`physio-status-dot ${
            connectionStatus === 'connected' ? 'connected' : connectionStatus === 'connecting' ? 'connecting' : 'disconnected'
          }`}
        />
        <span>
          {mode === 'ble'
            ? 'Live BLE Stream'
            : connectionStatus === 'connected'
            ? 'Sensors Connected'
            : 'Connecting...'}
        </span>
      </div>

      {bleErrorMessage && (
        <div className="physio-ble-error-tooltip" title={bleErrorMessage}>
          {bleErrorMessage}
        </div>
      )}
    </div>
  );
};
