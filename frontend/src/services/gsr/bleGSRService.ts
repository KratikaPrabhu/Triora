import type { VitalsReading, GSRConnectionStatus } from '../../types/gsr';

export type BleReadingCallback = (reading: VitalsReading) => void;
export type BleStatusCallback = (status: GSRConnectionStatus, deviceName?: string, errorMsg?: string) => void;

/**
 * Common standard and custom BLE UUIDs for ESP32 physiological sensors:
 * - Triora Custom Service: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
 * - Standard Nordic UART Service (NUS): 6e400001-b5a3-f393-e0a9-e50e24dcca9e
 * - Standard Heart Rate Service: 0x180d
 */
export const TRIORA_BLE_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const TRIORA_BLE_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export const NORDIC_UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const NORDIC_UART_TX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

export class BleGSRService {
  private device: any = null;
  private characteristic: any = null;
  private sessionId: string = '';
  private readingListeners: Set<BleReadingCallback> = new Set();
  private statusListeners: Set<BleStatusCallback> = new Set();
  private connectionStatus: GSRConnectionStatus = 'disconnected';
  private deviceName: string = '';
  private sessionElapsedSeconds: number = 0;
  private elapsedTimer: ReturnType<typeof setInterval> | null = null;

  constructor(sessionId: string = '') {
    this.sessionId = sessionId;
  }

  public setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  public subscribeReadings(callback: BleReadingCallback): () => void {
    this.readingListeners.add(callback);
    return () => this.readingListeners.delete(callback);
  }

  public subscribeStatus(callback: BleStatusCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.connectionStatus, this.deviceName);
    return () => this.statusListeners.delete(callback);
  }

  public getStatus(): GSRConnectionStatus {
    return this.connectionStatus;
  }

  public getDeviceName(): string {
    return this.deviceName;
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  private setStatus(status: GSRConnectionStatus, errorMsg?: string): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((listener) => {
      try {
        listener(status, this.deviceName, errorMsg);
      } catch (err) {
        console.error('Error in BLE status listener:', err);
      }
    });
  }

  /**
   * Request user permission and connect to ESP32 DevKit V1 BLE GATT Server
   */
  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      const msg = 'Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.';
      this.setStatus('error', msg);
      throw new Error(msg);
    }

    try {
      this.setStatus('connecting');

      const navBluetooth = (navigator as any).bluetooth;

      // Request device with flexible filters: match prefix 'ESP32', 'Triora', or accept all devices
      const device = await navBluetooth.requestDevice({
        filters: [
          { namePrefix: 'ESP32' },
          { namePrefix: 'Triora' },
          { namePrefix: 'GSR' },
        ],
        optionalServices: [
          TRIORA_BLE_SERVICE_UUID,
          NORDIC_UART_SERVICE_UUID,
          'heart_rate',
        ],
      });

      this.device = device;
      this.deviceName = device.name || 'ESP32 DevKit V1';

      device.addEventListener('gattserverdisconnected', this.handleDisconnection.bind(this));

      // Connect to GATT Server
      const server = await device.gatt.connect();

      // Discover supported service & characteristic
      let charFound: any = null;

      try {
        const trioraService = await server.getPrimaryService(TRIORA_BLE_SERVICE_UUID);
        charFound = await trioraService.getCharacteristic(TRIORA_BLE_CHAR_UUID);
      } catch {
        // Fallback to Nordic UART or standard services
        try {
          const uartService = await server.getPrimaryService(NORDIC_UART_SERVICE_UUID);
          charFound = await uartService.getCharacteristic(NORDIC_UART_TX_CHAR_UUID);
        } catch {
          // Fallback: check any available services
          console.warn('Triora/Nordic services not directly found, scanning discovered services...');
        }
      }

      if (!charFound) {
        throw new Error('No compatible GSR/Vitals GATT notification characteristic found on this device.');
      }

      this.characteristic = charFound;

      // Start notifications
      await charFound.startNotifications();
      charFound.addEventListener('characteristicvaluechanged', this.handleCharacteristicValue.bind(this));

      this.setStatus('connected');

      // Start internal elapsed timer for timestamping incoming BLE samples
      this.sessionElapsedSeconds = 0;
      if (this.elapsedTimer) clearInterval(this.elapsedTimer);
      this.elapsedTimer = setInterval(() => {
        this.sessionElapsedSeconds += 1;
      }, 1000);

      return true;
    } catch (err: any) {
      console.error('BLE connection error:', err);
      // User cancelled picker dialog
      if (err.name === 'NotFoundError') {
        this.setStatus('disconnected', 'Device pairing cancelled.');
        return false;
      }
      this.setStatus('error', err.message || 'Failed to connect to ESP32 via Bluetooth.');
      return false;
    }
  }

  public disconnect(): void {
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }

    if (this.characteristic) {
      try {
        this.characteristic.removeEventListener('characteristicvaluechanged', this.handleCharacteristicValue.bind(this));
        this.characteristic.stopNotifications().catch(() => {});
      } catch (e) {
        // ignore
      }
      this.characteristic = null;
    }

    if (this.device && this.device.gatt && this.device.gatt.connected) {
      try {
        this.device.gatt.disconnect();
      } catch (e) {
        // ignore
      }
    }

    this.device = null;
    this.setStatus('disconnected');
  }

  private handleDisconnection(): void {
    console.warn(`[BLE] Device ${this.deviceName} disconnected.`);
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
    this.setStatus('disconnected', 'ESP32 device disconnected.');
  }

  /**
   * Parse incoming BLE packet.
   * Supports:
   * 1. CSV string: "conductance,resistance,heartRate,hrv" (e.g. "5.4,185,72,48")
   * 2. JSON string: {"c": 5.4, "r": 185, "hr": 72, "hrv": 48} or {"conductance": 5.4, ...}
   * 3. Binary buffer: 4 x Float32 (16 bytes) or 4 x Int16 (8 bytes)
   */
  private handleCharacteristicValue(event: any): void {
    const value: DataView = event.target.value;
    if (!value || value.byteLength === 0) return;

    let conductance = 5.2;
    let resistance = 192;
    let heartRate = 72;
    let hrv = 48;

    try {
      // Decode as text first
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(value).trim();

      if (text.startsWith('{') && text.endsWith('}')) {
        // JSON payload format
        const json = JSON.parse(text);
        conductance = Number(json.conductance ?? json.c ?? json.gsr ?? 5.2);
        resistance = Number(json.resistance ?? json.r ?? Math.round(1000 / (conductance || 1)));
        heartRate = Number(json.heartRate ?? json.hr ?? 72);
        hrv = Number(json.hrv ?? 48);
      } else if (text.includes(',')) {
        // CSV format: "c,r,hr,hrv" or "c,r"
        const parts = text.split(',').map((p) => parseFloat(p.trim()));
        if (parts.length >= 1 && !isNaN(parts[0])) conductance = parts[0];
        if (parts.length >= 2 && !isNaN(parts[1])) resistance = Math.round(parts[1]);
        else resistance = Math.round(1000 / (conductance || 1));
        if (parts.length >= 3 && !isNaN(parts[2])) heartRate = Math.round(parts[2]);
        if (parts.length >= 4 && !isNaN(parts[3])) hrv = Math.round(parts[3]);
      } else if (!isNaN(parseFloat(text))) {
        // Single ADC or Conductance reading
        const rawNum = parseFloat(text);
        if (rawNum > 100) {
          // ADC value (e.g. 1000 - 4095)
          conductance = parseFloat((rawNum / 200).toFixed(1));
          resistance = Math.round(1000 / (conductance || 1));
        } else {
          conductance = parseFloat(rawNum.toFixed(1));
          resistance = Math.round(1000 / (conductance || 1));
        }
      } else if (value.byteLength >= 16) {
        // Binary Float32Array (4 floats = 16 bytes: conductance, resistance, heartRate, hrv)
        conductance = parseFloat(value.getFloat32(0, true).toFixed(1));
        resistance = Math.round(value.getFloat32(4, true));
        heartRate = Math.round(value.getFloat32(8, true));
        hrv = Math.round(value.getFloat32(12, true));
      } else if (value.byteLength >= 8) {
        // Binary Int16Array (4 int16 = 8 bytes: conductance * 10, resistance, heartRate, hrv)
        conductance = parseFloat((value.getInt16(0, true) / 10).toFixed(1));
        resistance = value.getInt16(2, true);
        heartRate = value.getInt16(4, true);
        hrv = value.getInt16(6, true);
      }

      const reading: VitalsReading = {
        timestamp: Date.now(),
        sessionElapsedSeconds: this.sessionElapsedSeconds,
        sessionId: this.sessionId,
        conductance: Math.max(0.1, conductance),
        resistance: Math.max(1, resistance),
        heartRate: Math.max(30, Math.min(220, heartRate)),
        hrv: Math.max(5, Math.min(200, hrv)),
        value: Math.round(conductance * 200),
      };

      this.readingListeners.forEach((listener) => {
        try {
          listener(reading);
        } catch (err) {
          console.error('Error in BLE reading listener:', err);
        }
      });
    } catch (err) {
      console.error('Failed to parse BLE packet:', err);
    }
  }
}
