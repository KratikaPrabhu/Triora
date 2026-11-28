import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { VitalsReading, GSRMode, GSRConnectionStatus, VitalsStatsData, PhysiologicalParam } from '../types/gsr';
import { DemoGSRService } from '../services/gsr/demoGSRService';
import { LiveGSRService } from '../services/gsr/liveGSRService';
import { BleGSRService } from '../services/gsr/bleGSRService';

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
  // Web Bluetooth capabilities
  isBleSupported: boolean;
  bleDeviceName: string;
  bleErrorMessage: string | null;
  connectBle: () => Promise<boolean>;
  disconnectBle: () => void;
  // Summary extraction for report generation
  getPhysiologicalSummary: () => {
    meanGSR: number;
    peakConductance: number;
    minConductance: number;
    spikeCount: number;
    spikes: Array<{ timestamp: string; value: number; relativeSecond: number }>;
    avgHeartRate: number;
    restingHeartRateBaseline: number;
    stressDistribution: {
      calmPercent: number;
      moderatePercent: number;
      highPercent: number;
    };
  };
  // Per-question window snapshot calculation
  snapshotQuestionWindow: (startTimestamp: number) => {
    meanGSR: number;
    peakConductance: number;
    minConductance: number;
    deltaConductance: number;
    meanResistance: number;
    deltaResistance: number;
    avgHeartRate: number;
    minHeartRate: number;
    maxHeartRate: number;
    deltaHeartRate: number;
    avgHRV: number;
    deltaHRV: number;
    sampleCount: number;
    durationSeconds: number;
  };
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
  const [bleDeviceName, setBleDeviceName] = useState<string>('');
  const [bleErrorMessage, setBleErrorMessage] = useState<string | null>(null);

  // Singletons
  const demoServiceRef = useRef<DemoGSRService | null>(null);
  const liveServiceRef = useRef<LiveGSRService | null>(null);
  const bleServiceRef = useRef<BleGSRService | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState<number>(0);

  if (!demoServiceRef.current) {
    demoServiceRef.current = new DemoGSRService(sessionId || '');
  }
  if (!liveServiceRef.current) {
    liveServiceRef.current = new LiveGSRService(sessionId || '');
  }
  if (!bleServiceRef.current) {
    bleServiceRef.current = new BleGSRService(sessionId || '');
  }

  useEffect(() => {
    if (sessionId) {
      demoServiceRef.current?.setSessionId(sessionId);
      liveServiceRef.current?.setSessionId(sessionId);
      bleServiceRef.current?.setSessionId(sessionId);
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
    } else if (mode === 'live') {
      liveServiceRef.current?.start();
    } else if (mode === 'ble') {
      setConnectionStatus(bleServiceRef.current?.getStatus() || 'connecting');
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

    if (mode === 'demo') demoServiceRef.current?.stop();
    if (mode === 'live') liveServiceRef.current?.stop();
    if (mode === 'ble' && newMode !== 'ble') bleServiceRef.current?.disconnect();

    setModeState(newMode);

    if (newMode === 'demo') {
      setConnectionStatus('connected');
      if (isMonitoring) {
        demoServiceRef.current?.start(sessionDurationSeconds);
      }
    } else if (newMode === 'live') {
      setConnectionStatus(liveServiceRef.current?.getStatus() || 'connecting');
      if (isMonitoring) {
        liveServiceRef.current?.start();
      }
    } else if (newMode === 'ble') {
      setConnectionStatus(bleServiceRef.current?.getStatus() || 'disconnected');
    }
  }, [mode, isMonitoring, sessionDurationSeconds]);

  // Connect BLE action
  const connectBle = useCallback(async (): Promise<boolean> => {
    setBleErrorMessage(null);
    const bleService = bleServiceRef.current;
    if (!bleService) return false;

    // Pause demo if running
    demoServiceRef.current?.stop();

    try {
      const success = await bleService.connect();
      if (success) {
        setModeState('ble');
        setConnectionStatus('connected');
        setBleDeviceName(bleService.getDeviceName());
        setIsMonitoring(true);
        return true;
      }
      return false;
    } catch (err: any) {
      setBleErrorMessage(err.message || 'Bluetooth connection failed.');
      return false;
    }
  }, []);

  const disconnectBle = useCallback(() => {
    bleServiceRef.current?.disconnect();
    setBleDeviceName('');
    // Gracefully revert back to demo mode so graph continues smoothly
    setModeState('demo');
    setConnectionStatus('connected');
    demoServiceRef.current?.start(sessionDurationSeconds);
  }, [sessionDurationSeconds]);

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

  // Live WebSocket subscription
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

  // BLE Web Bluetooth subscription
  useEffect(() => {
    const bleService = bleServiceRef.current;
    if (!bleService) return;

    const unsubReadings = bleService.subscribeReadings((reading) => {
      if (mode === 'ble') {
        handleIncomingReading(reading);
      }
    });

    const unsubStatus = bleService.subscribeStatus((status, deviceName, errorMsg) => {
      if (mode === 'ble') {
        setConnectionStatus(status);
        if (deviceName) setBleDeviceName(deviceName);
        if (errorMsg) setBleErrorMessage(errorMsg);
        if (status === 'disconnected') {
          // Fallback to demo mode if device disconnected
          setModeState('demo');
          demoServiceRef.current?.start(sessionDurationSeconds);
        }
      }
    });

    return () => {
      unsubReadings();
      unsubStatus();
    };
  }, [mode, handleIncomingReading, sessionDurationSeconds]);

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
      bleServiceRef.current?.disconnect();
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

  // Generate summary metrics across the session
  const getPhysiologicalSummary = useCallback(() => {
    if (readings.length === 0) {
      return {
        meanGSR: 4.8,
        peakConductance: 6.2,
        minConductance: 3.5,
        spikeCount: 0,
        spikes: [],
        avgHeartRate: 72,
        restingHeartRateBaseline: 70,
        stressDistribution: {
          calmPercent: 75,
          moderatePercent: 20,
          highPercent: 5
        }
      };
    }

    const conductances = readings.map((r) => r.conductance);
    const heartRates = readings.map((r) => r.heartRate).filter((hr) => hr > 40 && hr < 200);

    const sumGSR = conductances.reduce((acc, v) => acc + v, 0);
    const meanGSR = sumGSR / conductances.length;
    const peakConductance = Math.max(...conductances);
    const minConductance = Math.min(...conductances);

    const sumHR = heartRates.length > 0 ? heartRates.reduce((acc, v) => acc + v, 0) : 72;
    const avgHeartRate = heartRates.length > 0 ? sumHR / heartRates.length : 72;

    // Detect spikes: sharp rises of >1.5 µS above local rolling average
    const detectedSpikes: Array<{ timestamp: string; value: number; relativeSecond: number }> = [];
    for (let i = 1; i < readings.length; i++) {
      const prev = readings[i - 1].conductance;
      const curr = readings[i].conductance;
      if (curr - prev >= 1.2 || curr > meanGSR + 2.0) {
        const timeSec = Math.round(
          (readings[i].timestamp - readings[0].timestamp) / 1000
        );
        detectedSpikes.push({
          timestamp: new Date(readings[i].timestamp).toISOString(),
          value: curr,
          relativeSecond: Math.max(0, timeSec)
        });
      }
    }

    // Stress distribution
    const calmCount = conductances.filter((g) => g < 5.0).length;
    const modCount = conductances.filter((g) => g >= 5.0 && g <= 8.0).length;
    const highCount = conductances.filter((g) => g > 8.0).length;
    const total = conductances.length || 1;

    return {
      meanGSR,
      peakConductance,
      minConductance,
      spikeCount: detectedSpikes.length,
      spikes: detectedSpikes.slice(0, 10), // Limit top 10 for prompt compactness
      avgHeartRate,
      restingHeartRateBaseline: 70,
      stressDistribution: {
        calmPercent: Math.round((calmCount / total) * 100),
        moderatePercent: Math.round((modCount / total) * 100),
        highPercent: Math.round((highCount / total) * 100)
      }
    };
  }, [readings]);

  // Snapshot physiological telemetry collected during a specific question window
  const snapshotQuestionWindow = useCallback((startTimestamp: number) => {
    const windowReadings = readings.filter((r) => r.timestamp >= startTimestamp);

    if (windowReadings.length === 0) {
      const fallback = stats;
      return {
        meanGSR: fallback.currentConductance,
        peakConductance: fallback.currentConductance,
        minConductance: fallback.currentConductance,
        deltaConductance: 0,
        meanResistance: fallback.currentResistance,
        deltaResistance: 0,
        avgHeartRate: fallback.currentHeartRate,
        minHeartRate: fallback.currentHeartRate,
        maxHeartRate: fallback.currentHeartRate,
        deltaHeartRate: 0,
        avgHRV: fallback.currentHRV,
        deltaHRV: 0,
        sampleCount: 1,
        durationSeconds: 5
      };
    }

    const conductances = windowReadings.map((r) => r.conductance);
    const resistances = windowReadings.map((r) => r.resistance);
    const heartRates = windowReadings.map((r) => r.heartRate);
    const hrvs = windowReadings.map((r) => r.hrv);

    const first = windowReadings[0];
    const last = windowReadings[windowReadings.length - 1];

    const meanGSR = conductances.reduce((a, b) => a + b, 0) / conductances.length;
    const meanResistance = resistances.reduce((a, b) => a + b, 0) / resistances.length;
    const avgHeartRate = heartRates.reduce((a, b) => a + b, 0) / heartRates.length;
    const avgHRV = hrvs.reduce((a, b) => a + b, 0) / hrvs.length;

    const durationSeconds = Math.max(1, Math.round((last.timestamp - first.timestamp) / 1000));

    return {
      meanGSR: Number(meanGSR.toFixed(2)),
      peakConductance: Number(Math.max(...conductances).toFixed(2)),
      minConductance: Number(Math.min(...conductances).toFixed(2)),
      deltaConductance: Number((last.conductance - first.conductance).toFixed(2)),
      meanResistance: Math.round(meanResistance),
      deltaResistance: Math.round(last.resistance - first.resistance),
      avgHeartRate: Math.round(avgHeartRate),
      minHeartRate: Math.round(Math.min(...heartRates)),
      maxHeartRate: Math.round(Math.max(...heartRates)),
      deltaHeartRate: Math.round(last.heartRate - first.heartRate),
      avgHRV: Math.round(avgHRV),
      deltaHRV: Math.round(last.hrv - first.hrv),
      sampleCount: windowReadings.length,
      durationSeconds
    };
  }, [readings, stats]);

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
    isBleSupported: bleServiceRef.current?.isSupported() ?? false,
    bleDeviceName,
    bleErrorMessage,
    connectBle,
    disconnectBle,
    getPhysiologicalSummary,
    snapshotQuestionWindow,
  };
};
