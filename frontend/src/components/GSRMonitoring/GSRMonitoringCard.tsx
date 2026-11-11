import React from 'react';
import { GSRGraph } from './GSRGraph';
import { GSRStats } from './GSRStats';
import { GSRControls } from './GSRControls';
import { useGSR } from '../../hooks/useGSR';
import './GSRMonitoring.css';

interface GSRMonitoringCardProps {
  sessionId?: string | null;
}

export const GSRMonitoringCard: React.FC<GSRMonitoringCardProps> = ({ sessionId }) => {
  const {
    mode,
    setMode,
    readings,
    stats,
    connectionStatus,
    selectedParam,
    setSelectedParam,
  } = useGSR({
    sessionId,
    autoStart: true,
    initialMode: 'demo',
  });

  return (
    <div className="physio-monitoring-card" role="region" aria-label="Physiological Monitoring">
      {/* 1. Header Row */}
      <div className="physio-card-header">
        <div className="physio-header-left">
          <h3 className="physio-card-title">Physiological Monitoring</h3>
          <p className="physio-card-subtitle">
            Real-time GSR and vitals during the conversation
          </p>
        </div>

        <div className="physio-header-right">
          <GSRControls
            mode={mode}
            setMode={setMode}
            connectionStatus={connectionStatus}
          />
        </div>
      </div>

      {/* 2. Middle Section: Graph + Right Side Param Metrics (Conductance & Resistance) */}
      <div className="physio-middle-grid">
        {/* Left: Dynamic Area Graph for selected parameter */}
        <div className="physio-graph-pane">
          <GSRGraph
            readings={readings}
            selectedParam={selectedParam}
          />
        </div>

        {/* Right: Selectable Side Metrics (Conductance & Resistance) */}
        <div className="physio-side-metrics-col">
          {/* Conductance Tile */}
          <div
            className={`physio-side-metric-item ${selectedParam === 'conductance' ? 'active-param' : ''}`}
            onClick={() => setSelectedParam('conductance')}
            role="button"
            tabIndex={0}
            title="Click to view Conductance graph"
          >
            <span className="physio-metric-label">Conductance</span>
            <div className="physio-metric-value-row">
              <span className="physio-metric-num">{stats.currentConductance || '5.2'}</span>
              <span className="physio-metric-unit">µS</span>
            </div>
          </div>

          <div className="physio-side-divider" />

          {/* Resistance Tile */}
          <div
            className={`physio-side-metric-item ${selectedParam === 'resistance' ? 'active-param' : ''}`}
            onClick={() => setSelectedParam('resistance')}
            role="button"
            tabIndex={0}
            title="Click to view Resistance graph"
          >
            <span className="physio-metric-label">Resistance</span>
            <div className="physio-metric-value-row">
              <span className="physio-metric-num">{stats.currentResistance || '192'}</span>
              <span className="physio-metric-unit">kΩ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: 2 Big Tiles (Heart Rate & HRV) */}
      <div className="physio-bottom-tiles-wrapper">
        <GSRStats
          stats={stats}
          selectedParam={selectedParam}
          onSelectParam={setSelectedParam}
        />
      </div>

      {/* 4. Disclaimer Note Pill */}
      <div className="physio-disclaimer-pill">
        <span>These are physiological measurements for session monitoring and are not a medical diagnosis.</span>
      </div>
    </div>
  );
};
