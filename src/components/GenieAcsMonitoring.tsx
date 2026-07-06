/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Settings, 
  RotateCw, 
  Wifi, 
  KeyRound, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Thermometer, 
  HardDrive, 
  Gauge,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Customer } from '../types';

interface GenieAcsMonitoringProps {
  customers: Customer[];
}

export default function GenieAcsMonitoring({ customers }: GenieAcsMonitoringProps) {
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [acsLogs, setAcsLogs] = useState<string[]>([
    'GenieACS: TR-069 Service listener running on port 7557.',
    'GenieACS: DB cache parsed. 4 active CPE profiles matched.'
  ]);

  const [ssidName, setSsidName] = useState('StarBilling_WiFi_Home');
  const [wifiPassword, setWifiPassword] = useState('password123');
  const [isAcsWorking, setIsAcsWorking] = useState<string | null>(null);

  // SNMP telemetry states (rebuilding/updating)
  const [snmpStats, setSnmpStats] = useState({
    cpu: 34,
    ram: 68,
    disk: 22,
    temp: 41.5,
    trafficIn: 452.4,
    trafficOut: 114.8
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSnmpStats(prev => ({
        ...prev,
        cpu: Math.max(25, Math.min(85, prev.cpu + (Math.random() > 0.5 ? 4 : -4))),
        ram: Math.max(60, Math.min(75, prev.ram + (Math.random() > 0.5 ? 1 : -1))),
        temp: Math.max(38, Math.min(45, prev.temp + (Math.random() > 0.5 ? 0.2 : -0.2))),
        trafficIn: Math.max(300, Math.min(990, prev.trafficIn + (Math.random() > 0.5 ? 15 : -15))),
        trafficOut: Math.max(80, Math.min(300, prev.trafficOut + (Math.random() > 0.5 ? 8 : -8)))
      }));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const addAcsLog = (msg: string) => {
    setAcsLogs(prev => [...prev, `[CPE Task] ${msg}`]);
  };

  const getActiveCustomer = () => {
    return customers.find(c => c.id === selectedCustId) || customers[0];
  };

  const currentCust = getActiveCustomer();

  // Reboot ONT simulation
  const handleReboot = () => {
    if (!currentCust) return;
    setIsAcsWorking('reboot');
    addAcsLog(`Sending reboot command to ONT serial '${currentCust.customer_number}'...`);
    
    setTimeout(() => {
      addAcsLog(`TR-069 command execution request sent. Device responded with HTTP 204.`);
      addAcsLog(`CPE successfully rebooted. Waiting for DHCP Lease connection...`);
      setIsAcsWorking(null);
    }, 2500);
  };

  // Change SSID simulation
  const handleSsidChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCust) return;
    setIsAcsWorking('ssid');
    addAcsLog(`Changing WLAN SSID to '${ssidName}' for CPE serial '${currentCust.customer_number}'...`);
    
    setTimeout(() => {
      addAcsLog(`Setting param 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID' to '${ssidName}'...`);
      addAcsLog(`Param set OK. CPE WLAN controller rebooted. New SSID live!`);
      setIsAcsWorking(null);
    }, 2500);
  };

  // Change password simulation
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCust) return;
    setIsAcsWorking('password');
    addAcsLog(`Updating WPA2 key on CPE serial '${currentCust.customer_number}'...`);
    
    setTimeout(() => {
      addAcsLog(`Setting param 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.PreSharedKey.1.KeyPassphrase' to '${wifiPassword}'...`);
      addAcsLog(`WPA2 Pre-Shared Key updated successfully. Devices will reconnect automatically.`);
      setIsAcsWorking(null);
    }, 2500);
  };

  // Firmware upgrade simulation
  const handleUpgradeFirmware = () => {
    if (!currentCust) return;
    setIsAcsWorking('firmware');
    addAcsLog(`Downloading firmware binary 'ZTE_F609_V8_Enterprise_Release_2026.bin' to ONT memory...`);
    
    setTimeout(() => {
      addAcsLog(`Transfer complete (14.2 MB). Verifying checksum MD5... OK.`);
      addAcsLog(`Flashing boot partition... CPE rebooting to apply upgrade.`);
      setIsAcsWorking(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* SNMP Core Node Status Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          SNMP NETWORK TELEMETRY (MAIN CHASSIS OLT-BDG-CORE)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
            <Cpu className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
            <span className="text-[9px] font-mono text-slate-500 block uppercase">CPU LOAD</span>
            <span className="text-sm font-bold font-mono text-white mt-0.5 block">{Math.round(snmpStats.cpu)}%</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
            <Gauge className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
            <span className="text-[9px] font-mono text-slate-500 block uppercase">RAM RATIO</span>
            <span className="text-sm font-bold font-mono text-white mt-0.5 block">{snmpStats.ram}%</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
            <HardDrive className="w-5 h-5 mx-auto text-purple-400 mb-1" />
            <span className="text-[9px] font-mono text-slate-500 block uppercase">SSD DISK</span>
            <span className="text-sm font-bold font-mono text-white mt-0.5 block">{snmpStats.disk}%</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
            <Thermometer className="w-5 h-5 mx-auto text-rose-400 mb-1" />
            <span className="text-[9px] font-mono text-slate-500 block uppercase">OLT TEMP</span>
            <span className="text-sm font-bold font-mono text-white mt-0.5 block">{snmpStats.temp.toFixed(1)}°C</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center col-span-2 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-slate-500 block uppercase">Core optical traffic</span>
            <div className="flex justify-around items-center mt-2">
              <div className="flex items-center gap-1">
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-xs font-semibold text-slate-200">{snmpStats.trafficIn.toFixed(1)}M</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-xs font-semibold text-slate-200">{snmpStats.trafficOut.toFixed(1)}M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GenieACS Terminal & ONT controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Remote control console panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                CPE ACS CONTROL CENTER (TR-069 CLIENT)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Kirimkan konfigurasi SSID/Sandi atau Reboot ONT secara remote.</p>
            </div>
            
            {/* Customer Picker */}
            <select 
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.customer_number} - {c.name}</option>
              ))}
            </select>
          </div>

          {currentCust ? (
            <div className="space-y-6">
              {/* Device Overview & Optical redaman */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="text-[9px] font-mono text-slate-500 block">ONT CPE SPEC</span>
                  <span className="text-xs font-bold text-white mt-1 block">ZTE F609 GPON V8</span>
                  <span className="text-[10px] text-slate-500 block font-mono">MAC: BC:A0:F4:32:00:14</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block">OPTICAL POWER</span>
                    <span className="text-xs font-bold text-cyan-400 mt-1 block font-mono">-19.45 dBm</span>
                    <span className="text-[9px] text-emerald-400 font-mono block">Range: Excellent</span>
                  </div>
                  <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block">ONT TEMP</span>
                    <span className="text-xs font-bold text-white mt-1 block font-mono">42.2°C</span>
                    <span className="text-[9px] text-slate-500 font-mono block">Status: Stable</span>
                  </div>
                  <Thermometer className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              {/* Action buttons list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SSID Form change */}
                <form onSubmit={handleSsidChange} className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" /> UBAH NAMA SSID WI-FI
                  </span>
                  <input 
                    type="text" 
                    required
                    value={ssidName}
                    onChange={(e) => setSsidName(e.target.value)}
                    placeholder="SSID Baru..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button 
                    type="submit"
                    disabled={isAcsWorking !== null}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-800 text-slate-300 hover:text-cyan-400 font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                  >
                    {isAcsWorking === 'ssid' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
                    Kirim Perubahan SSID
                  </button>
                </form>

                {/* Password Form change */}
                <form onSubmit={handlePasswordChange} className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> UBAH SANDI WI-FI WPA2
                  </span>
                  <input 
                    type="text" 
                    required
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Sandi Baru (Min 8 Karakter)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button 
                    type="submit"
                    disabled={isAcsWorking !== null}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-800 text-slate-300 hover:text-cyan-400 font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                  >
                    {isAcsWorking === 'password' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
                    Kirim Perubahan Sandi
                  </button>
                </form>

              </div>

              {/* Maintenance Tools (Reboot, Firmware) */}
              <div className="flex gap-3 border-t border-slate-850 pt-4 justify-end">
                <button 
                  onClick={handleUpgradeFirmware}
                  disabled={isAcsWorking !== null}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> Upgrade Firmware
                </button>
                <button 
                  onClick={handleReboot}
                  disabled={isAcsWorking !== null}
                  className="px-4 py-2 bg-rose-950/20 hover:bg-rose-950 border border-rose-900/60 text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                >
                  <RotateCw className={`w-4 h-4 ${isAcsWorking === 'reboot' ? 'animate-spin' : ''}`} /> Reboot ONT
                </button>
              </div>

            </div>
          ) : (
            <p className="text-slate-500 text-xs font-mono py-12 text-center">Belum ada pelanggan terdaftar.</p>
          )}

        </div>

        {/* GenieACS Task Queue terminal */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-[450px] font-mono text-xs shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-850 pb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">GENIEACS SERVER ENGINE</span>
            </div>
            
            <div className="space-y-2 max-h-80 overflow-y-auto text-slate-400 leading-relaxed text-[11px]">
              {acsLogs.map((log, i) => (
                <div key={i} className="leading-snug">{log}</div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-850 pt-3 text-[10px] text-slate-500">
            <span>Server Response Status: </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 inline" /> HTTP/2 200 OK (0 QUEUED TASKS)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
