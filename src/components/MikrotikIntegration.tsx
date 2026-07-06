/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Network, 
  RefreshCw, 
  Terminal, 
  Cpu, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Activity, 
  Radio, 
  KeyRound,
  Play,
  CheckCircle,
  XCircle,
  Database
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Customer } from '../types';

interface MikrotikIntegrationProps {
  customers: Customer[];
  onSuspendCustomer: (id: string) => void;
  onUnsuspendCustomer: (id: string) => void;
}

export default function MikrotikIntegration({ 
  customers, 
  onSuspendCustomer, 
  onUnsuspendCustomer 
}: MikrotikIntegrationProps) {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'System: StarBilling MikrotikService v1.4 initialized.',
    'System: Connecting to Router-Gambir-01 [192.168.88.1] via API port 8728...',
    'Router-Gambir-01: API Connection established successfully.',
    'Router-Gambir-01: Resource loaded. CPU-Load: 12%, Free-Memory: 114.2 MB',
    'System: Ready to handle secret profiles / interface queues.'
  ]);
  
  const [activeTab, setActiveTab] = useState<'users' | 'queues' | 'wireguard' | 'terminal'>('users');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [routerResources, setRouterResources] = useState({
    cpu: 12,
    ram: '114.2 MB',
    uptime: '14d 03h 22m',
    connections: 54
  });

  // Generate mock real-time traffic for Queue Tree
  const [trafficData, setTrafficData] = useState<any[]>([]);

  useEffect(() => {
    // Generate initial traffic
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        time: `${i}:00`,
        download: 15 + Math.floor(Math.random() * 35),
        upload: 5 + Math.floor(Math.random() * 15)
      });
    }
    setTrafficData(data);

    // Live fluctuate traffic & resources
    const interval = setInterval(() => {
      setTrafficData(prev => {
        const next = [...prev.slice(1)];
        next.push({
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          download: 20 + Math.floor(Math.random() * 60),
          upload: 8 + Math.floor(Math.random() * 20)
        });
        return next;
      });

      setRouterResources(prev => ({
        ...prev,
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() > 0.5 ? 2 : -2)))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addLog = (log: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  // Simulate sync operations
  const handleSync = (type: 'pppoe' | 'hotspot' | 'queues') => {
    setIsSyncing(type);
    addLog(`System: Initiating Sync for ${type.toUpperCase()}...`);
    
    setTimeout(() => {
      if (type === 'pppoe') {
        addLog(`RouterosAPI: /interface/pppoe-server/secret/print -> Found ${customers.length} subscribers in DB.`);
        addLog(`RouterosAPI: Sync completed. Unified profiles to speed rules.`);
      } else if (type === 'hotspot') {
        addLog('RouterosAPI: /ip/hotspot/user/print -> Found 12 temporary voucher profiles.');
        addLog('RouterosAPI: Hotspot active session leases verified.');
      } else {
        addLog('RouterosAPI: /queue/simple/print -> Syncing rate limits with package prices...');
        addLog('RouterosAPI: Rebuilt 5 simple queue trees for Parent_Global.');
      }
      addLog(`System: ${type.toUpperCase()} Sync SUCCESSFUL.`);
      setIsSyncing(null);
    }, 2000);
  };

  // Suspend action in mikrotik
  const handleTriggerSuspend = (cust: Customer) => {
    addLog(`Action: Request Suspend user secret '${cust.customer_number}'`);
    onSuspendCustomer(cust.id);
    
    setTimeout(() => {
      addLog(`RouterosAPI: Set secret ID for '${cust.customer_number}' profile='PROFILE_ISOLIR'`);
      addLog(`RouterosAPI: Terminated active session for '${cust.customer_number}' -> user forced to login isolir`);
      addLog(`System: Suspend applied on Router-Gambir-01 for '${cust.customer_number}'`);
    }, 1000);
  };

  // Unsuspend action
  const handleTriggerUnsuspend = (cust: Customer) => {
    addLog(`Action: Request Unsuspend user secret '${cust.customer_number}'`);
    onUnsuspendCustomer(cust.id);
    
    setTimeout(() => {
      addLog(`RouterosAPI: Restored secret ID for '${cust.customer_number}' to package bandwidth.`);
      addLog(`System: Unsuspend applied on Router-Gambir-01 for '${cust.customer_number}'`);
    }, 1000);
  };

  const wireguardPeers = [
    { name: 'NOC-Admin-Rem', endpoint: '182.1.20.14:51820', allowedIp: '10.8.0.2/32', rx: '14.2 MB', tx: '112.5 MB', handshake: '22s ago' },
    { name: 'Teknisi-Andri-Ph', endpoint: '114.5.10.43:41203', allowedIp: '10.8.0.3/32', rx: '4.1 MB', tx: '23.4 MB', handshake: '1m 12s ago' },
    { name: 'Kolektor-Bayu-Ph', endpoint: '114.5.10.92:30192', allowedIp: '10.8.0.4/32', rx: '0.9 MB', tx: '5.2 MB', handshake: '4m 45s ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Router Resources telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">ROUTER CPU</span>
            <span className="text-sm font-bold text-white font-mono">{routerResources.cpu}%</span>
            <div className="w-16 bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: `${routerResources.cpu}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">RAM UTANG</span>
            <span className="text-sm font-bold text-white font-mono">{routerResources.ram}</span>
            <span className="text-[9px] text-emerald-400 font-mono block">Status: Healthy</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">ACTIVE LEASES</span>
            <span className="text-sm font-bold text-white font-mono">{routerResources.connections} Users</span>
            <span className="text-[9px] text-slate-400 font-mono block">PPPoE & Hotspot</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <Radio className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">ROUTER UPTIME</span>
            <span className="text-sm font-bold text-white font-mono">{routerResources.uptime}</span>
            <span className="text-[9px] text-cyan-400 font-mono block">ROS v7.14 Stable</span>
          </div>
        </div>
      </div>

      {/* Sync Automation Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">SINKRONISASI & OTOMATISASI GATEWAY</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleSync('pppoe')}
            disabled={isSyncing !== null}
            className="p-4 bg-slate-950 hover:bg-slate-950/80 rounded-xl border border-slate-800/85 text-left transition flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-white block">Sinkronisasi PPPoE Secrets</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Samakan database lokal dengan RouterOS</span>
            </div>
            <RefreshCw className={`w-5 h-5 text-cyan-400 ${isSyncing === 'pppoe' ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => handleSync('hotspot')}
            disabled={isSyncing !== null}
            className="p-4 bg-slate-950 hover:bg-slate-950/80 rounded-xl border border-slate-800/85 text-left transition flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-white block">Sinkronisasi Hotspot</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Audit sewa voucher & bypass bindings</span>
            </div>
            <RefreshCw className={`w-5 h-5 text-indigo-400 ${isSyncing === 'hotspot' ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => handleSync('queues')}
            disabled={isSyncing !== null}
            className="p-4 bg-slate-950 hover:bg-slate-950/80 rounded-xl border border-slate-800/85 text-left transition flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-white block">Sinkronisasi Simple Queue</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Terapkan limitasi bandwidth terbaru</span>
            </div>
            <RefreshCw className={`w-5 h-5 text-cyan-400 ${isSyncing === 'queues' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Console Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Console Tabs & Tables */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[400px]">
          <div className="flex border-b border-slate-800 mb-4 pb-2 text-xs">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
            >
              PPPoE Users ({customers.length})
            </button>
            <button 
              onClick={() => setActiveTab('queues')}
              className={`px-4 py-2 font-medium ${activeTab === 'queues' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
            >
              Queue Tree Traffic
            </button>
            <button 
              onClick={() => setActiveTab('wireguard')}
              className={`px-4 py-2 font-medium ${activeTab === 'wireguard' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
            >
              WireGuard Peers
            </button>
            <button 
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-2 font-medium ${activeTab === 'terminal' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
            >
              Live API Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 font-mono text-[10px] text-slate-500 uppercase">
                      <th className="pb-2">ID Secret / Username</th>
                      <th className="pb-2">IP Static Address</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right">Mikrotik Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-950/20">
                        <td className="py-2.5 font-mono text-slate-200">
                          <span className="font-semibold block">{cust.customer_number}</span>
                          <span className="text-[10px] text-slate-500">{cust.name}</span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-400">
                          10.10.20.{Math.floor(Math.random() * 200) + 2}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                            cust.status === 'Aktif' 
                              ? 'bg-emerald-950/80 text-emerald-400' 
                              : 'bg-amber-950/80 text-amber-400'
                          }`}>
                            {cust.status === 'Aktif' ? 'ONLINE' : 'ISOLIR'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          {cust.status === 'Aktif' ? (
                            <button 
                              onClick={() => handleTriggerSuspend(cust)}
                              className="px-2.5 py-1 bg-slate-950 hover:bg-amber-950/40 text-amber-500 hover:text-amber-400 border border-slate-850 hover:border-amber-900 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 ml-auto"
                            >
                              <Lock className="w-3 h-3" /> Suspend
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleTriggerUnsuspend(cust)}
                              className="px-2.5 py-1 bg-slate-950 hover:bg-emerald-950/40 text-emerald-500 hover:text-emerald-400 border border-slate-850 hover:border-emerald-900 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 ml-auto"
                            >
                              <Unlock className="w-3 h-3" /> Unsuspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'queues' && (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">TRAFFIC CONSUMPTION (QUEUE TREE / SLA)</h4>
                  <p className="text-[11px] text-slate-500">Memonitoring total bandwidth transit upstream Indosat & Telkom Wholesale.</p>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                      <YAxis stroke="#64748b" fontSize={9} />
                      <Area type="monotone" dataKey="download" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} name="Total Download (Mbps)" />
                      <Area type="monotone" dataKey="upload" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} name="Total Upload (Mbps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'wireguard' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 font-mono text-[10px] text-slate-500 uppercase">
                      <th className="pb-2">Peer Name</th>
                      <th className="pb-2">Allowed IPs</th>
                      <th className="pb-2">Endpoint Address</th>
                      <th className="pb-2 text-right">Rx / Tx Telemetry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {wireguardPeers.map(peer => (
                      <tr key={peer.name} className="hover:bg-slate-950/20">
                        <td className="py-2.5 font-mono font-semibold text-slate-200">{peer.name}</td>
                        <td className="py-2.5 font-mono text-slate-400">{peer.allowedIp}</td>
                        <td className="py-2.5 font-mono text-slate-500 text-[11px]">{peer.endpoint}</td>
                        <td className="py-2.5 text-right font-mono text-slate-300">
                          <span>{peer.rx} / {peer.tx}</span>
                          <span className="text-[9px] text-slate-500 block">handshake: {peer.handshake}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'terminal' && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-full font-mono text-xs text-cyan-400 overflow-y-auto space-y-1">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed whitespace-pre-wrap">{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MikroTik Terminal Simulator */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-[400px] font-mono text-xs shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-850 pb-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MIKROTIK INTERACTIVE SHELL</span>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto text-slate-400">
              <p className="text-slate-500">[MikroTik RouterOS Terminal v7.14]</p>
              <p className="text-slate-500">Ketik command untuk simulasi shell API.</p>
              <div className="text-slate-300">
                <span className="text-cyan-400 font-bold">[admin@StarBilling-CO] &gt; </span>
                <span>/ip dhcp-server lease print</span>
              </div>
              <div className="text-[11px] text-slate-500 leading-none">
                #   ADDRESS         MAC-ADDRESS       HOST-NAME     STATUS<br />
                0   10.10.20.52     BC:A0:F4:32:00:21 ZTE-ONT       bound<br />
                1   10.10.20.94     AC:45:92:02:12:11 FH-ONT        bound
              </div>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <input 
                type="text" 
                placeholder="Type router command..." 
                className="bg-transparent border-none outline-none text-xs text-white flex-1 font-mono focus:ring-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    addLog(`Shell Manual: Executed '${e.currentTarget.value}'`);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
