import React from 'react';
import type { VitalsStatsData, PhysiologicalParam } from '../../types/gsr';

interface GSRStatsProps {
  stats: VitalsStatsData;
  selectedParam: PhysiologicalParam;
  onSelectParam: (param: PhysiologicalParam) => void;
}

export const GSRStats: React.FC<GSRStatsProps> = ({
  stats,
  selectedParam,
  onSelectParam,
}) => {
  return (
    <>
      {/* 2 Bottom Stat Cards side-by-side: Heart Rate & HRV */}
      <div className="physio-bottom-tiles-row">
        {/* Heart Rate Tile */}
        <div
          className={`physio-tile-card ${selectedParam === 'heartRate' ? 'active-param' : ''}`}
          onClick={() => onSelectParam('heartRate')}
          role="button"
          tabIndex={0}
          title="Click to view Heart Rate graph"
        >
          <div className="physio-tile-heading-group">
            <span className="physio-tile-label">Heart Rate</span>
            <div className="physio-tile-value-row">
              <span className="physio-tile-num">{stats.currentHeartRate || 72}</span>
              <span className="physio-tile-unit">BPM</span>
            </div>
          </div>
          {selectedParam === 'heartRate' && (
            <div className="physio-selected-checkbox">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        {/* HRV Tile */}
        <div
          className={`physio-tile-card ${selectedParam === 'hrv' ? 'active-param' : ''}`}
          onClick={() => onSelectParam('hrv')}
          role="button"
          tabIndex={0}
          title="Click to view Heart Rate Variability graph"
        >
          <div className="physio-tile-heading-group">
            <span className="physio-tile-label">HRV</span>
            <div className="physio-tile-value-row">
              <span className="physio-tile-num">{stats.currentHRV || 48}</span>
              <span className="physio-tile-unit">ms</span>
            </div>
          </div>
          {selectedParam === 'hrv' && (
            <div className="physio-selected-checkbox">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
