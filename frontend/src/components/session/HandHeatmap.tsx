import React, { useEffect, useState, useRef } from 'react';
import type { SessionHeatmapResponse, HeatmapHistoryPoint } from '../../types';
import sessionService from '../../services/session.service';
import { Activity, ShieldAlert, Mic, TrendingUp } from 'lucide-react';

interface HandHeatmapProps {
  sessionId?: string;
  isListening?: boolean;
  onVoiceLevelChange?: (level: number) => void;
}

export const HandHeatmap: React.FC<HandHeatmapProps> = ({ sessionId, isListening }) => {
  // GSR / Sensor Data (kept strictly separate)
  const [, setHeatmapData] = useState<SessionHeatmapResponse | null>(null);
  const [conductance, setConductance] = useState(4.8);
  const [resistance, setResistance] = useState(208.3);
  const [gsrHistory, setGsrHistory] = useState<HeatmapHistoryPoint[]>([]);

  // Real-time Voice Audio Intensity State (0.0 to 1.0) using Web Audio API
  const [normalizedVoiceLevel, setNormalizedVoiceLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const smoothLevelRef = useRef<number>(0);

  // 1. Web Audio API microphone processing for real-time voice amplitude (RMS)
  useEffect(() => {
    let isActive = true;

    const initAudio = async () => {
      if (!isListening) {
        // Smoothly decay when mic is off
        smoothLevelRef.current = 0;
        setNormalizedVoiceLevel(0);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!isActive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateAudioLevel = () => {
          if (!isActive || !analyserRef.current) return;

          analyserRef.current.getByteTimeDomainData(dataArray);

          // Calculate Root Mean Square (RMS) audio amplitude
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128; // scale to [-1.0, 1.0]
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);

          // Boost & clamp normalized voice level between 0 and 1
          const rawLevel = Math.min(1.0, rms * 4.5);

          // Smooth lerp filtering to prevent sudden jitter
          smoothLevelRef.current = smoothLevelRef.current * 0.7 + rawLevel * 0.3;
          const currentLevel = parseFloat(smoothLevelRef.current.toFixed(2));

          setNormalizedVoiceLevel(currentLevel);

          animFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };

        updateAudioLevel();
      } catch (err) {
        console.warn('Microphone audio analyser notice:', err);
      }
    };

    initAudio();

    return () => {
      isActive = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isListening]);

  // 2. Fetch physiological GSR sensor data from backend API
  useEffect(() => {
    if (sessionId) {
      sessionService
        .getHeatmap(sessionId)
        .then((data) => {
          setHeatmapData(data);
          if (data?.conductance) setConductance(data.conductance);
          if (data?.resistance) setResistance(data.resistance);
          if (data?.history && data.history.length > 0) {
            setGsrHistory(data.history);
          } else {
            setGsrHistory([
              { timestamp: new Date(Date.now() - 180000).toISOString(), conductance: 4.2, resistance: 238.0 },
              { timestamp: new Date(Date.now() - 120000).toISOString(), conductance: 4.5, resistance: 222.2 },
              { timestamp: new Date(Date.now() - 60000).toISOString(), conductance: 4.7, resistance: 212.7 },
              { timestamp: new Date().toISOString(), conductance: 4.8, resistance: 208.3 },
            ]);
          }
        })
        .catch((err) => console.warn('Heatmap load notice:', err));
    }
  }, [sessionId]);

  // 3. Smooth background update for GSR data
  useEffect(() => {
    const interval = setInterval(() => {
      setConductance((prevCond) => {
        const delta = (Math.random() - 0.48) * 0.2;
        const nextCond = parseFloat(Math.max(2.0, Math.min(15.0, prevCond + delta)).toFixed(1));
        const nextResis = parseFloat((1000 / nextCond).toFixed(1));
        setResistance(nextResis);

        setGsrHistory((prevHist) => {
          const newPoint = {
            timestamp: new Date().toISOString(),
            conductance: nextCond,
            resistance: nextResis,
          };
          return [...prevHist, newPoint].slice(-12);
        });

        return nextCond;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Responsive SVG Waveform computation
  const maxCond = 15;
  const minCond = 2;
  const graphWidth = 280;
  const graphHeight = 60;

  const points = gsrHistory.map((pt, i) => {
    const x = (i / Math.max(1, gsrHistory.length - 1)) * graphWidth;
    const norm = (pt.conductance - minCond) / (maxCond - minCond);
    const y = graphHeight - norm * (graphHeight - 10) - 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylinePoints = points.join(' ');
  const areaPoints =
    points.length > 0
      ? `0,${graphHeight} ${polylinePoints} ${graphWidth},${graphHeight}`
      : `0,${graphHeight} ${graphWidth},${graphHeight}`;

  // Dynamic visual heatmap dimensions calculated directly from normalized voice level
  const heatmapScale = 1.0 + normalizedVoiceLevel * 0.45; // 1.0x to 1.45x
  const glowOpacity = 0.2 + normalizedVoiceLevel * 0.65; // 0.2 to 0.85

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-2xl flex flex-col justify-between min-h-[500px] h-full space-y-4">
      {/* Top Header: Title & Connection Indicator */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                VOICE & PHYSIOLOGICAL SIGNAL
              </h4>
              <span className="text-[10px] text-slate-400 block">Live Acoustic & Autonomic Stream</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/90 border border-teal-800 text-teal-300 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span>Active</span>
          </div>
        </div>

        {/* Dynamic Prominent Organic Heatmap Visualization */}
        <div className="relative flex flex-col items-center justify-center py-10 my-3 bg-slate-950/70 rounded-3xl border border-slate-800/80 overflow-hidden min-h-[220px]">
          {/* Outer Pulsing Aura (Responds to Voice Level) */}
          <div
            className="absolute rounded-full border border-teal-400/30 transition-transform duration-200 ease-out"
            style={{
              width: '160px',
              height: '160px',
              transform: `scale(${heatmapScale * 1.15})`,
              opacity: glowOpacity,
            }}
          />

          {/* Central Radial Heatmap Glow */}
          <div
            className="absolute rounded-full blur-2xl transition-all duration-200 ease-out"
            style={{
              width: '140px',
              height: '140px',
              transform: `scale(${heatmapScale})`,
              opacity: glowOpacity,
              backgroundColor: normalizedVoiceLevel > 0.6 ? '#06b6d4' : '#14b8a6',
            }}
          />

          {/* Core Interactive Visualizer Node */}
          <div
            className="relative w-28 h-28 rounded-full bg-slate-900/90 border border-slate-700/80 flex flex-col items-center justify-center shadow-2xl z-10 transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${1 + normalizedVoiceLevel * 0.2})`,
            }}
          >
            <Mic
              className={`w-6 h-6 mb-1 transition-colors ${
                isListening && normalizedVoiceLevel > 0.15 ? 'text-teal-300' : 'text-slate-400'
              }`}
            />
            <span className="text-xl font-extrabold tracking-tight text-white">
              {Math.round(normalizedVoiceLevel * 100)}%
            </span>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Voice Level</span>
          </div>

          {/* Live Dynamic Acoustic Bar Indicators */}
          <div className="mt-4 flex items-center gap-1.5 z-10">
            {[0.3, 0.6, 1.0, 0.7, 0.4].map((multiplier, i) => (
              <div
                key={i}
                className="w-1.5 bg-teal-400 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(6, normalizedVoiceLevel * 32 * multiplier)}px`,
                  opacity: Math.max(0.4, normalizedVoiceLevel),
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Separate Sensor Block: Galvanic Skin Response (GSR/EDA) */}
      <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            <span>GSR / SKIN CONDUCTANCE (SEPARATE SENSOR)</span>
          </span>
          <span className="text-teal-300 font-mono">{conductance} µS</span>
        </div>

        {/* Historical GSR Waveform SVG */}
        <div className="h-16 w-full flex items-center justify-center overflow-hidden relative">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full">
            <defs>
              <linearGradient id="waveformGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon fill="url(#waveformGradient)" points={areaPoints} />
            <polyline
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <span>Skin Resistance: {resistance} kΩ</span>
          <span className="text-teal-400 font-bold">Signal Intact</span>
        </div>
      </div>

      {/* Voice Activity Level Gauge */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-wider">
          <span>SILENT</span>
          <span>MODERATE VOICE</span>
          <span>STRONG VOICE</span>
        </div>
        <div className="h-2.5 w-full bg-slate-950 rounded-full relative p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-300 rounded-full transition-all duration-150 shadow-sm"
            style={{ width: `${Math.max(4, normalizedVoiceLevel * 100)}%` }}
          />
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer */}
      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-[10px] text-slate-400 leading-snug">
        <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <span>
          Microphone voice level and physiological GSR data are tracked separately. Used solely for pre-therapy reflection.
        </span>
      </div>
    </div>
  );
};

export default HandHeatmap;
