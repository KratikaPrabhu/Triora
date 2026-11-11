import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { VitalsReading, GSRMode, GSRConnectionStatus, VitalsStatsData, PhysiologicalParam } from '../types/gsr';
import { DemoGSRService } from '../services/gsr/demoGSRService';
import { LiveGSRService } from '../services/gsr/liveGSRService';

export interface UseGSROptions {
  sessionId?: string | null;
  autoStart?: boolean;
  initialMode?: GSRMode;
  maxHistoryPoints?: number;
}

export interface UseGSRReturn {
  mode: GSRMode;
  setMode: (mode: GSRMode) => void;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  toggleMonitoring: () => void;
  readings: VitalsReading[];
  stats: VitalsStatsData;
  connectionStatus: GSRConnectionStatus;
  clearHistory: () => void;
  selectedParam: PhysiologicalParam;
  setSelectedParam: (param: PhysiologicalParam) => void;
}

export const useGSR = ({
  sessionId = '',
  autoStart = true,
  initialMode = 'demo',
  maxHistoryPoints = 180, // 3 minutes buffer
}: UseGSROptions = {}): UseGSRReturn => {
  const [mode, setModeState] = useState<GSRMode>(initialMode);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [readings, setReadings] = useState<VitalsReading[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<GSRConnectionStatus>('connected');
  const [selectedParam, setSelectedParam] = useState<PhysiologicalParam>('conductance');

  // Singletons
  const demoServiceRef = useRef<DemoGSRService | null>(null);
  const liveServiceRef = useRef<LiveGSRService | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState<number>(0);

  if (!demoServiceRef.current) {
    demoServiceRef.current = new DemoGSRService(sessionId || '');
  }
  if (!liveServiceRef.current) {
    liveServiceRef.current = new LiveGSRService(sessionId || '');
  }

  useEffect(() => {
    if (sessionId) {
      demoServiceRef.current?.setSessionId(sessionId);
      liveServiceRef.current?.setSessionId(sessionId);
    }
  }, [sessionId]);

  const handleIncomingReading = useCallback((reading: VitalsReading) => {
    setReadings((prev) => {
      const next = [...prev, reading];
      if (next.length > maxHistoryPoints) {
        return next.slice(next.length - maxHistoryPoints);
      }
      return next;
    });
  }, [maxHistoryPoints]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    if (mode === 'demo') {
      demoServiceRef.current?.start(sessionDurationSeconds);
      setConnectionStatus('connected');
    } else {
      liveServiceRef.current?.start();
    }
  }, [mode, sessionDurationSeconds]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    demoServiceRef.current?.stop();
    liveServiceRef.current?.stop();
    if (mode === 'demo') {
      setConnectionStatus('disconnected');
    }
  }, [mode]);

  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  }, [isMonitoring, startMonitoring, stopMonitoring]);

  const clearHistory = useCallback(() => {
    setReadings([]);
    setSessionDurationSeconds(0);
  }, []);

  const setMode = useCallback((newMode: GSRMode) => {
    if (newMode === mode) return;

    demoServiceRef.current?.stop();
    liveServiceRef.current?.stop();

    setModeState(newMode);

    if (newMode === 'demo') {
      setConnectionStatus('connected');
      if (isMonitoring) {
        demoServiceRef.current?.start(sessionDurationSeconds);
      }
    } else {
      setConnectionStatus(liveServiceRef.current?.getStatus() || 'connecting');
      if (isMonitoring) {
        liveServiceRef.current?.start();
      }
    }
  }, [mode, isMonitoring, sessionDurationSeconds]);

  // Demo subscription
  useEffect(() => {
    const demoService = demoServiceRef.current;
    if (!demoService) return;

    const unsubscribe = demoService.subscribe((reading) => {
      if (mode === 'demo' && isMonitoring) {
        handleIncomingReading(reading);
      }
    });

    return unsubscribe;
  }, [mode, isMonitoring, handleIncomingReading]);

  // Live subscription
  useEffect(() => {
    const liveService = liveServiceRef.current;
    if (!liveService) return;

    const unsubReadings = liveService.subscribeReadings((reading) => {
      if (mode === 'live' && isMonitoring) {
        handleIncomingReading(reading);
      }
    });

    const unsubStatus = liveService.subscribeStatus((status) => {
      if (mode === 'live') {
        setConnectionStatus(status);
      }
    });

    return () => {
      unsubReadings();
      unsubStatus();
    };
  }, [mode, isMonitoring, handleIncomingReading]);

  // Duration timer
  useEffect(() => {
    if (isMonitoring) {
      durationTimerRef.current = setInterval(() => {
        setSessionDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [isMonitoring]);

  // Auto start
  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }
    return () => {
      demoServiceRef.current?.stop();
      liveServiceRef.current?.stop();
    };
  }, [autoStart, startMonitoring]);

  // Derived current stats
  const stats: VitalsStatsData = useMemo(() => {
    if (readings.length === 0) {
      return {
        currentConductance: 5.2,
        currentResistance: 192,
        currentHeartRate: 72,
        currentHRV: 48,
        sessionDurationSeconds,
        dataPointsCount: 0,
      };
    }

    const latest = readings[readings.length - 1];
    return {
      currentConductance: latest.conductance,
      currentResistance: latest.resistance,
      currentHeartRate: latest.heartRate,
      currentHRV: latest.hrv,
      sessionDurationSeconds,
      dataPointsCount: readings.length,
    };
  }, [readings, sessionDurationSeconds]);

  return {
    mode,
    setMode,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    toggleMonitoring,
    readings,
    stats,
    connectionStatus,
    clearHistory,
    selectedParam,
    setSelectedParam,
  };
};
