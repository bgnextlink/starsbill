import React, { useState, useEffect, useRef } from 'react';
import { 
  HardDrive, 
  Database, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Wifi, 
  Server, 
  Activity, 
  Terminal,
  Save,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Clock,
  Shield,
  Zap,
  LayoutGrid,
  FileSpreadsheet,
  ArrowRightLeft,
  ListCollapse
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Customer } from '../types';

interface SettingServerViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  packages: any[];
}

export default function SettingServerView({ 
  customers, 
  onAddCustomer, 
  onUpdateCustomer, 
  packages 
}: SettingServerViewProps) {
  // Menu Tabs for Network Management
  const [activeTab, setActiveTab] = useState<'servers' | 'routers' | 'test-conn' | 'sync' | 'monitor' | 'logs' | 'genieacs' | 'import'>('servers');

  // --- 1. DATABASE STATE (Stored in LocalStorage for persistent demo) ---
  const [servers, setServers] = useState<any[]>(() => {
    const saved = localStorage.getItem('sb_servers_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'server-1', name: 'POP Pusat Palembang', description: 'Server Core Pusat Distribusi StarBilling', status: 'AKTIF', created_at: '2026-07-01 10:00:00', updated_at: '2026-07-05 12:00:00' },
      { id: 'server-2', name: 'POP Sako Kenten', description: 'Server Area Distribusi Kenten-Sako', status: 'AKTIF', created_at: '2026-07-02 11:30:00', updated_at: '2026-07-05 12:15:00' },
      { id: 'server-3', name: 'POP Gandus Raya', description: 'Server Distribusi Area Barat', status: 'NON-AKTIF', created_at: '2026-07-03 09:00:00', updated_at: '2026-07-04 16:45:00' }
    ];
  });

  const [routers, setRouters] = useState<any[]>(() => {
    const saved = localStorage.getItem('sb_routers_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'router-1',
        server_id: 'server-1',
        router_name: 'RTR-POP-PUSAT',
        location: 'Palembang',
        ip_address: '103.112.44.89',
        api_port: '8728',
        api_ssl_port: '8729',
        username: 'starbilling',
        password: 'LaravelEncrypted_pbkdf2_sha255_9812yhas',
        api_type: 'API',
        ssl_enabled: false,
        connection_timeout: 10,
        status: 'ONLINE',
        last_connected: '2026-07-06 14:30:10',
        created_at: '2026-07-01 10:15:00',
        updated_at: '2026-07-05 12:05:00',
        notes: 'Core Router Mikrotik CCR2004-16G-2S+ untuk Distribusi utama'
      },
      {
        id: 'router-2',
        server_id: 'server-2',
        router_name: 'RTR-POP-SAKO',
        location: 'Sako Kenten',
        ip_address: '103.112.45.10',
        api_port: '8728',
        api_ssl_port: '8729',
        username: 'admin_sako',
        password: 'LaravelEncrypted_pbkdf2_sha255_881267as',
        api_type: 'API-SSL',
        ssl_enabled: true,
        connection_timeout: 5,
        status: 'ONLINE',
        last_connected: '2026-07-06 14:15:22',
        created_at: '2026-07-02 11:45:00',
        updated_at: '2026-07-05 12:20:00',
        notes: 'Router CCR1009-7G-1C-1S+ area Sako'
      },
      {
        id: 'router-3',
        server_id: 'server-3',
        router_name: 'RTR-TESTING-OFFLINE',
        location: 'Gandus',
        ip_address: '192.168.10.254',
        api_port: '8728',
        api_ssl_port: '8729',
        username: 'test_user',
        password: 'LaravelEncrypted_gandus_offline',
        api_type: 'API',
        ssl_enabled: false,
        connection_timeout: 3,
        status: 'OFFLINE',
        last_connected: '2026-07-03 09:12:00',
        created_at: '2026-07-03 09:10:00',
        updated_at: '2026-07-04 16:50:00',
        notes: 'Router testing lab backup Gandus'
      }
    ];
  });

  const [connLogs, setConnLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('sb_connection_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'log-1', router_id: 'RTR-POP-PUSAT', action: 'TEST CONNECTION', response: 'TCP Connection OK. Login API Success. System Identity: RTR-POP-PUSAT, RouterOS: 7.18', status: 'SUCCESS', ip_address: '103.112.44.89', created_at: '2026-07-06 14:30:10' },
      { id: 'log-2', router_id: 'RTR-POP-SAKO', action: 'GET INTERFACES', response: 'Successfully retrieved 4 interfaces info.', status: 'SUCCESS', ip_address: '103.112.45.10', created_at: '2026-07-06 14:15:22' },
      { id: 'log-3', router_id: 'RTR-TESTING-OFFLINE', action: 'TEST CONNECTION', response: 'Error: Connection timeout after 3 seconds. Port 8728 closed or host unreachable.', status: 'FAILED', ip_address: '192.168.10.254', created_at: '2026-07-03 09:12:00' }
    ];
  });

  // Save databases helper
  const saveDB = (key: string, data: any, setter: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    setter(data);
  };

  // --- 2. FORM STATES ---
  // Server Form
  const [srvName, setSrvName] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvStatus, setSrvStatus] = useState('AKTIF');
  const [editingServerId, setEditingServerId] = useState<string | null>(null);

  // Router Form
  const [rtName, setRtName] = useState('');
  const [rtServerId, setRtServerId] = useState('server-1');
  const [rtLoc, setRtLoc] = useState('');
  const [rtIp, setRtIp] = useState('');
  const [rtPort, setRtPort] = useState('8728');
  const [rtSslPort, setRtSslPort] = useState('8729');
  const [rtUser, setRtUser] = useState('');
  const [rtPass, setRtPass] = useState('');
  const [rtSslEnabled, setRtSslEnabled] = useState(false);
  const [rtTimeout, setRtTimeout] = useState('10');
  const [rtNotes, setRtNotes] = useState('');
  const [editingRouterId, setEditingRouterId] = useState<string | null>(null);

  // Security and encryption display
  const [showPlainPasswords, setShowPlainPasswords] = useState<{ [key: string]: boolean }>({});

  // --- 3. TEST CONNECTION MODULE STATES ---
  const [testRouterId, setTestRouterId] = useState('router-1');
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // --- 4. SINKRONISASI MODULE STATES ---
  const [syncRouterId, setSyncRouterId] = useState('router-1');
  const [syncTab, setSyncTab] = useState<'pppoe' | 'hotspot' | 'queue' | 'dhcp'>('pppoe');
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoDiscoveryLog, setAutoDiscoveryLog] = useState<string[]>([]);

  // Static/dynamic simulated datasets from selected routers
  const simulatedPppSecrets: { [key: string]: any[] } = {
    'router-1': [
      { username: 'andi@starbilling', password: 'user_pass_andi', profile: '20Mbps_Unlimited', service: 'pppoe', comment: 'Andi Saputra - 081234567890', disabled: 'false' },
      { username: 'joko@starbilling', password: 'user_pass_joko', profile: '10Mbps_Unlimited', service: 'pppoe', comment: 'Joko Susilo - 081223344550', disabled: 'false' },
      { username: 'dewi@starbilling', password: 'user_pass_dewi', profile: '30Mbps_Unlimited', service: 'pppoe', comment: 'Dewi Lestari - 085223344111', disabled: 'true' },
      { username: 'budi_baru@starbilling', password: 'user_pass_budi', profile: '20Mbps_Unlimited', service: 'pppoe', comment: 'Budi Hartono - 081377889900', disabled: 'false' } // New user for discovery
    ],
    'router-2': [
      { username: 'sako_cl1@starbilling', password: 'sako_pass_1', profile: '15Mbps_Unlimited', service: 'pppoe', comment: 'Sako Client 1 - 089988776655', disabled: 'false' },
      { username: 'sako_cl2@starbilling', password: 'sako_pass_2', profile: '30Mbps_Unlimited', service: 'pppoe', comment: 'Sako Client 2 - 085117688866', disabled: 'false' }
    ]
  };

  const simulatedHotspotUsers: { [key: string]: any[] } = {
    'router-1': [
      { name: 'v_user_99x', profile: 'Voucher_2Hours', address: '10.5.50.12', comment: 'Voucher Harian', limitUptime: '02:00:00' },
      { name: 'v_user_11a', profile: 'Voucher_1Day', address: '10.5.50.45', comment: 'Voucher Premium', limitUptime: '24:00:00' },
      { name: 'hotspot_budi', profile: 'Voucher_Unlimited', address: '10.5.50.100', comment: 'Budi Hotspot Member', limitUptime: '00:00:00' }
    ],
    'router-2': [
      { name: 'v_sako_1', profile: 'Voucher_3Hours', address: '10.6.50.22', comment: 'Voucher Warung', limitUptime: '03:00:00' }
    ]
  };

  const simulatedQueues: { [key: string]: any[] } = {
    'router-1': [
      { name: 'andi@starbilling', target: '10.10.10.11', maxLimit: '20M/20M', packets: '45,102', burstLimit: '0/0' },
      { name: 'joko@starbilling', target: '10.10.10.12', maxLimit: '10M/10M', packets: '122,892', burstLimit: '0/0' },
      { name: 'dewi@starbilling', target: '10.10.10.13', maxLimit: '30M/30M', packets: '0', burstLimit: '0/0' }
    ],
    'router-2': [
      { name: 'sako_cl1@starbilling', target: '10.10.20.5', maxLimit: '15M/15M', packets: '81,992', burstLimit: '0/0' },
      { name: 'sako_cl2@starbilling', target: '10.10.20.12', maxLimit: '30M/30M', packets: '204,112', burstLimit: '0/0' }
    ]
  };

  const simulatedDhcpLeases: { [key: string]: any[] } = {
    'router-1': [
      { ipAddress: '192.168.88.15', macAddress: 'AA:BB:CC:11:22:33', hostName: 'Andi-Phone', server: 'dhcp-primary', status: 'bound' },
      { ipAddress: '192.168.88.22', macAddress: '11:22:33:44:55:66', hostName: 'Joko-Laptop', server: 'dhcp-primary', status: 'bound' }
    ],
    'router-2': [
      { ipAddress: '192.168.99.50', macAddress: '88:99:AA:BB:CC:DD', hostName: 'Sako-SmartTV', server: 'dhcp-sako', status: 'bound' }
    ]
  };

  // --- 5. MONITORING STATE (Live auto-updating graph) ---
  const [monitorRouterId, setMonitorRouterId] = useState('router-1');
  const [liveResources, setLiveResources] = useState({
    cpu: 15,
    memoryUsed: 141.8,
    memoryTotal: 256.0,
    diskUsed: 79.5,
    diskTotal: 128.0,
    temperature: 42.5,
    uptime: '25d 14h 32m 04s'
  });
  const [trafficHistory, setTrafficHistory] = useState<any[]>([]);

  // Generate mock telemetry data on selection
  useEffect(() => {
    const initialData = [];
    for (let i = 10; i >= 0; i--) {
      initialData.push({
        time: `${i}s ago`,
        download: 15 + Math.floor(Math.random() * 35),
        upload: 5 + Math.floor(Math.random() * 15)
      });
    }
    setTrafficHistory(initialData);

    const interval = setInterval(() => {
      // Fluctuating values
      setLiveResources(prev => {
        const cpuVar = Math.max(5, Math.min(95, prev.cpu + (Math.random() > 0.5 ? 3 : -3)));
        const tempVar = Math.max(38, Math.min(65, Number((prev.temperature + (Math.random() > 0.5 ? 0.3 : -0.3)).toFixed(1))));
        return {
          ...prev,
          cpu: cpuVar,
          temperature: tempVar
        };
      });

      setTrafficHistory(prev => {
        const next = [...prev.slice(1)];
        next.push({
          time: 'now',
          download: 10 + Math.floor(Math.random() * 70),
          upload: 4 + Math.floor(Math.random() * 25)
        });
        // Rename indices for timeline feel
        return next.map((item, idx) => ({
          ...item,
          time: idx === next.length - 1 ? 'now' : `${next.length - 1 - idx}s ago`
        }));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [monitorRouterId]);

  // --- 6. ACTIONS HANDLERS ---
  
  // Create / Update Server
  const handleSaveServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim()) return;

    if (editingServerId) {
      const updated = servers.map(s => s.id === editingServerId 
        ? { ...s, name: srvName, description: srvDesc, status: srvStatus, updated_at: new Date().toISOString().replace('T', ' ').substring(0,19) } 
        : s
      );
      saveDB('sb_servers_db', updated, setServers);
      setEditingServerId(null);
      alert('Sukses: Data Server berhasil diperbarui.');
    } else {
      const newServer = {
        id: `server-${Date.now()}`,
        name: srvName,
        description: srvDesc,
        status: srvStatus,
        created_at: new Date().toISOString().replace('T', ' ').substring(0,19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0,19)
      };
      saveDB('sb_servers_db', [...servers, newServer], setServers);
      alert('Sukses: Server baru berhasil ditambahkan.');
    }
    setSrvName('');
    setSrvDesc('');
    setSrvStatus('AKTIF');
  };

  const handleEditServer = (s: any) => {
    setEditingServerId(s.id);
    setSrvName(s.name);
    setSrvDesc(s.description);
    setSrvStatus(s.status);
  };

  const handleDeleteServer = (id: string) => {
    if (routers.some(r => r.server_id === id)) {
      alert('Gagal: Server ini memiliki router terdaftar. Hapus router terlebih dahulu!');
      return;
    }
    if (confirm('Yakin ingin menghapus server ini?')) {
      const filtered = servers.filter(s => s.id !== id);
      saveDB('sb_servers_db', filtered, setServers);
    }
  };

  // Create / Update Router
  const handleSaveRouter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtName.trim() || !rtIp.trim() || !rtUser.trim() || !rtPass.trim()) {
      alert('Lengkapi seluruh field wajib!');
      return;
    }

    // Encrypted simulation
    const simulatedEncryptedPassword = rtPass.startsWith('LaravelEncrypted_') 
      ? rtPass 
      : `LaravelEncrypted_pbkdf2_sha255_${Math.random().toString(36).substring(4, 12)}`;

    if (editingRouterId) {
      const updated = routers.map(r => r.id === editingRouterId 
        ? { 
            ...r, 
            server_id: rtServerId,
            router_name: rtName, 
            location: rtLoc,
            ip_address: rtIp,
            api_port: rtPort,
            api_ssl_port: rtSslPort,
            username: rtUser,
            password: simulatedEncryptedPassword,
            api_type: rtSslEnabled ? 'API-SSL' : 'API',
            ssl_enabled: rtSslEnabled,
            connection_timeout: parseInt(rtTimeout),
            notes: rtNotes,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0,19)
          } 
        : r
      );
      saveDB('sb_routers_db', updated, setRouters);
      setEditingRouterId(null);
      alert('Sukses: Data Router MikroTik berhasil diperbarui.');
    } else {
      const newRouter = {
        id: `router-${Date.now()}`,
        server_id: rtServerId,
        router_name: rtName,
        location: rtLoc,
        ip_address: rtIp,
        api_port: rtPort,
        api_ssl_port: rtSslPort,
        username: rtUser,
        password: simulatedEncryptedPassword,
        api_type: rtSslEnabled ? 'API-SSL' : 'API',
        ssl_enabled: rtSslEnabled,
        connection_timeout: parseInt(rtTimeout),
        status: 'ONLINE',
        last_connected: '-',
        created_at: new Date().toISOString().replace('T', ' ').substring(0,19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0,19),
        notes: rtNotes
      };
      saveDB('sb_routers_db', [...routers, newRouter], setRouters);
      alert('Sukses: Router MikroTik baru berhasil didaftarkan langsung via IP:Port API!');
    }
    // Clear Form
    setRtName('');
    setRtLoc('');
    setRtIp('');
    setRtPort('8728');
    setRtSslPort('8729');
    setRtUser('');
    setRtPass('');
    setRtSslEnabled(false);
    setRtTimeout('10');
    setRtNotes('');
  };

  const handleEditRouter = (r: any) => {
    setEditingRouterId(r.id);
    setRtServerId(r.server_id);
    setRtName(r.router_name);
    setRtLoc(r.location);
    setRtIp(r.ip_address);
    setRtPort(r.api_port);
    setRtSslPort(r.api_ssl_port);
    setRtUser(r.username);
    setRtPass(r.password);
    setRtSslEnabled(r.ssl_enabled);
    setRtTimeout(String(r.connection_timeout));
    setRtNotes(r.notes || '');
  };

  const handleDeleteRouter = (id: string) => {
    if (confirm('Yakin ingin menghapus router ini?')) {
      const filtered = routers.filter(r => r.id !== id);
      saveDB('sb_routers_db', filtered, setRouters);
    }
  };

  const togglePasswordPlain = (id: string) => {
    setShowPlainPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Run Test Connection Handshake
  const handleRunTestConnection = () => {
    const selected = routers.find(r => r.id === testRouterId);
    if (!selected) return;

    setIsTesting(true);
    setTestResult(null);
    setTestLogs([]);

    const steps = [
      `[DEBUG] Mengirimkan probe ping ke ${selected.ip_address}... Response OK (12ms)`,
      `[TCP] Membuka soket langsung ke port ${selected.ssl_enabled ? selected.api_ssl_port : selected.api_port} ${selected.ssl_enabled ? '(SSL Mode)' : '(Standard Mode)'}... Koneksi TCP Terbuka!`,
      `[API-LOGIN] Handshake awal ke RouterOS API (User: "${selected.username}")...`,
      `[API-LOGIN] Mengirim kredensial login (Password terenkripsi Laravel)...`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setTestLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Check router type or failure rules
        const isOffline = selected.router_name.toLowerCase().includes('offline') || selected.status === 'OFFLINE';
        const isBadLogin = selected.username.toLowerCase().includes('wrong') || selected.password.toLowerCase().includes('wrong');
        const isSslMismatch = selected.ssl_enabled && selected.api_ssl_port === '8728';

        if (isOffline) {
          setTestLogs(prev => [
            ...prev,
            `[❌ ERROR] Timeout: Router didak merespon dalam waktu ${selected.connection_timeout} detik.`,
            `[❌ DIAGNOSTIK] Kemungkinan penyebab: Router offline, IP filter aktif di router, atau port ${selected.api_port} diblokir firewall.`
          ]);
          setTestResult({
            success: false,
            message: `Koneksi gagal: ROUTER_OFFLINE (Timeout setelah ${selected.connection_timeout} detik)`,
            identity: '-',
            version: '-',
            uptime: '-'
          });
          // Log to database
          addConnLog(selected.id, 'TEST CONNECTION', `Failed: Timeout after ${selected.connection_timeout}s`, 'FAILED', selected.ip_address);
        } else if (isBadLogin) {
          setTestLogs(prev => [
            ...prev,
            `[❌ ERROR] Login Gagal: Kredensial username atau password ditolak oleh RouterOS.`
          ]);
          setTestResult({
            success: false,
            message: 'Koneksi gagal: LOGIN_FAILED (Kredensial username/password salah)',
            identity: '-',
            version: '-',
            uptime: '-'
          });
          addConnLog(selected.id, 'TEST CONNECTION', 'Failed: Authentication failed (invalid username/password)', 'FAILED', selected.ip_address);
        } else if (isSslMismatch) {
          setTestLogs(prev => [
            ...prev,
            `[❌ ERROR] SSL Error: Gagal menginisialisasi enkripsi TLS/SSL pada port 8728. Harap cek port API SSL.`
          ]);
          setTestResult({
            success: false,
            message: 'Koneksi gagal: SSL_HANDSHAKE_ERROR',
            identity: '-',
            version: '-',
            uptime: '-'
          });
          addConnLog(selected.id, 'TEST CONNECTION', 'Failed: SSL Handshake failure', 'FAILED', selected.ip_address);
        } else {
          setTestLogs(prev => [
            ...prev,
            `[✔ SUCCESS] Login berhasil! Sesi API terverifikasi.`,
            `[SYSTEM] Mengambil identitas router... -> RTR-POP-PUSAT`,
            `[SYSTEM] Mengambil resource RouterOS... -> Versi 7.18`
          ]);
          setTestResult({
            success: true,
            message: 'Koneksi Sukses: Router Online & API Berjalan lancar.',
            identity: selected.router_name,
            version: selected.router_name.includes('SAKO') ? '7.12' : '7.18',
            uptime: '25 Days 14 Hours'
          });
          addConnLog(selected.id, 'TEST CONNECTION', `Success. Identity: ${selected.router_name}, Version: ${selected.router_name.includes('SAKO') ? '7.12' : '7.18'}`, 'SUCCESS', selected.ip_address);
          
          // Update router status and last connected
          const updated = routers.map(r => r.id === selected.id 
            ? { ...r, status: 'ONLINE', last_connected: new Date().toISOString().replace('T', ' ').substring(0,19) } 
            : r
          );
          saveDB('sb_routers_db', updated, setRouters);
        }
        setIsTesting(false);
      }
    }, 600);
  };

  const addConnLog = (rId: string, action: string, resp: string, status: string, ip: string) => {
    const newLog = {
      id: `log-${Date.now()}`,
      router_id: rId,
      action: action,
      response: resp,
      status: status,
      ip_address: ip,
      created_at: new Date().toISOString().replace('T', ' ').substring(0,19)
    };
    saveDB('sb_connection_logs', [newLog, ...connLogs], setConnLogs);
  };

  // Clear Logs
  const handleClearLogs = () => {
    saveDB('sb_connection_logs', [], setConnLogs);
    alert('Logs berhasil dibersihkan.');
  };

  // --- PPPoE Auto-Discovery (Import PPPoE User) ---
  const handleAutoDiscovery = () => {
    const selected = routers.find(r => r.id === syncRouterId);
    if (!selected) return;

    setIsSyncing(true);
    setAutoDiscoveryLog([`[START] Memulai Auto Discovery PPPoE Secrets pada Router ${selected.router_name}...`]);

    setTimeout(() => {
      const secrets = simulatedPppSecrets[selected.id] || [];
      if (secrets.length === 0) {
        setAutoDiscoveryLog(prev => [...prev, `[INFO] Tidak ditemukan PPPoE Secrets pada router ini.`]);
        setIsSyncing(false);
        return;
      }

      setAutoDiscoveryLog(prev => [...prev, `[INFO] Menemukan ${secrets.length} record secret di router. Melakukan pencocokan...`]);
      
      let addedCount = 0;
      let updatedCount = 0;
      let identicalCount = 0;

      secrets.forEach((secret) => {
        // Parse WhatsApp number or customer number from comments
        // e.g., "Andi Saputra - 081234567890" -> "081234567890" -> "6281234567890"
        let phoneFromComment = '';
        const commentParts = secret.comment.split('-');
        if (commentParts.length > 1) {
          phoneFromComment = commentParts[1].trim().replace(/\D/g, '');
          if (phoneFromComment.startsWith('08')) {
            phoneFromComment = '628' + phoneFromComment.substring(2);
          }
        }

        const nameFromComment = commentParts[0]?.trim() || secret.username;

        // Try to match by: username, phone, or name
        const matchByUsername = customers.find(c => c.pppoe_username === secret.username);
        const matchByPhone = phoneFromComment ? customers.find(c => c.phone === phoneFromComment) : null;
        
        const matchedCustomer = matchByUsername || matchByPhone;

        if (matchedCustomer) {
          // If customer exists but PPPoE credential doesn't match or is missing, update
          if (matchedCustomer.pppoe_username !== secret.username) {
            onUpdateCustomer({
              ...matchedCustomer,
              pppoe_username: secret.username
            });
            updatedCount++;
            setAutoDiscoveryLog(prev => [...prev, `[UPDATED] Pelanggan "${matchedCustomer.name}" diperbarui PPPoE username ke "${secret.username}"`]);
          } else {
            identicalCount++;
          }
        } else {
          // Create new customer
          const newId = `cust-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          onAddCustomer({
            id: newId,
            customer_number: phoneFromComment || `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
            name: nameFromComment,
            nik: `160102030405${Math.floor(1000 + Math.random() * 9000)}`,
            phone: phoneFromComment || '628123456789',
            email: `${secret.username.replace('@', '_')}@starbilling.local`,
            address: 'Pemasangan Auto Discovery (MikroTik Sync)',
            latitude: -2.9917,
            longitude: 104.6966,
            package_id: 'pkg-1', // Default package
            router_id: selected.id,
            odp_id: 'odp-1',
            marketing_id: 'Auto Discovery',
            status: secret.disabled === 'true' ? 'Suspend' : 'Aktif',
            pppoe_username: secret.username,
            created_at: new Date().toISOString().split('T')[0]
          });
          addedCount++;
          setAutoDiscoveryLog(prev => [...prev, `[CREATED] Pelanggan Baru Terdaftar: "${nameFromComment}" dengan PPPoE: "${secret.username}"`]);
        }
      });

      setAutoDiscoveryLog(prev => [
        ...prev,
        `[SINKRONISASI SELESAI]`,
        `🟢 Pelanggan Baru Terbuat: ${addedCount}`,
        `🔵 Pelanggan Diperbarui: ${updatedCount}`,
        `⚪ Pelanggan Sesuai / Identik: ${identicalCount}`
      ]);
      
      addConnLog(selected.id, 'AUTO DISCOVERY / PPPoE SYNC', `Auto Discovery success: Added ${addedCount}, Updated ${updatedCount}, Identical ${identicalCount}`, 'SUCCESS', selected.ip_address);
      setIsSyncing(false);
      alert(`Auto Discovery Selesai!\nSistem berhasil mendeteksi ${secrets.length} secret.\n- ${addedCount} Pelanggan Baru Ditambahkan ke Billing\n- ${updatedCount} Pelanggan Diperbarui\n- ${identicalCount} Pelanggan sudah sesuai.`);
    }, 1500);
  };

  // --- 7. GENIEACS Virtual Params state ---
  const [genieUrl, setGenieUrl] = useState(() => localStorage.getItem('sb_genieacs_url') || 'http://54.179.175.90:7557');
  const [genieUser, setGenieUser] = useState(() => localStorage.getItem('sb_genieacs_user') || 'genie_admin');
  const [geniePass, setGeniePass] = useState(() => localStorage.getItem('sb_genieacs_pass') || '•••••••••');
  
  // Importer data state
  const [importText, setImportText] = useState('');
  const [importStrategy, setImportStrategy] = useState<'skip' | 'overwrite'>('skip');

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-white tracking-wider flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-400" /> Network Management Console
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Integrasi Multi-Router MikroTik secara langsung via IP & Port API Tanpa Kewajiban VPN
          </p>
        </div>
        <div className="flex gap-3 text-xs font-mono text-slate-300">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Server</span>
            <span className="text-sm font-bold text-indigo-400">{servers.length}</span>
          </div>
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Router</span>
            <span className="text-sm font-bold text-cyan-400">{routers.length}</span>
          </div>
        </div>
      </div>

      {/* Primary Sub-menus Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 bg-slate-950 p-1.5 border border-slate-850 rounded-xl">
        <button
          onClick={() => setActiveTab('servers')}
          className={`py-2 px-1 rounded-lg text-[10px] font-mono font-bold transition flex flex-col items-center gap-1 ${activeTab === 'servers' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
        >
          <Server className="w-3.5 h-3.5" /> Setting Server
        </button>
        <button
          onClick={() => setActiveTab('routers')}
          className={`py-2 px-1 rounded-lg text-[10px] font-mono font-bold transition flex flex-col items-center gap-1 ${activeTab === 'routers' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
        >
          <HardDrive className="w-3.5 h-3.5" /> Router MikroTik
        </button>
        <button
          onClick={() => setActiveTab('test-conn')}
          className={`py-2 px-1 rounded-lg text-[10px] font-mono font-bold transition flex flex-col items-center gap-1 ${activeTab === 'test-conn' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
        >
          <Activity className="w-3.5 h-3.5" /> Test Connection
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`py-2 px-1 rounded-lg text-[10px] font-mono font-bold transition flex flex-col items-center gap-1 ${activeTab === 'sync' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" /> Sinkronisasi
        </button>
        <button
          onClick={() => setActiveTab('monitor')}
          className={`py-2 px-1 rounded-lg text-[10px] font-mono font-bold transition flex flex-col items-center gap-1 ${activeTab === 'monitor' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
        >
          <Cpu className="w-3.5 h-3.5" /> Monitoring
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2 px-1 rounded-lg text-[10px] font-mono font-bold transition flex flex-col items-center gap-1 ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
        >
          <Terminal className="w-3.5 h-3.5" /> Log Koneksi
        </button>
        <button
          onClick={() => setActiveTab('genieacs')}
          className={`py-2 px-1 rounded-lg text-[10px] font-mono font-bold transition flex flex-col items-center gap-1 ${activeTab === 'genieacs' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
        >
          <Wifi className="w-3.5 h-3.5" /> GenieACS / ONT
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`py-2 px-1 rounded-lg text-[10px] font-mono font-bold transition flex flex-col items-center gap-1 ${activeTab === 'import' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> Import Data
        </button>
      </div>

      {/* --- TAB CONTENT 1: SETTING SERVER --- */}
      {activeTab === 'servers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2.5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>{editingServerId ? 'Edit Server Database' : 'Tambah Server Baru'}</span>
            </h3>

            <form onSubmit={handleSaveServer} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Nama Server *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. POP Pusat Palembang"
                  value={srvName}
                  onChange={e => setSrvName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Deskripsi Server</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Server Core Distribusi Utama"
                  value={srvDesc}
                  onChange={e => setSrvDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Status Server</label>
                <select 
                  value={srvStatus}
                  onChange={e => setSrvStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NON-AKTIF">NON-AKTIF</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                {editingServerId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingServerId(null);
                      setSrvName('');
                      setSrvDesc('');
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Batal
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/25"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingServerId ? 'Simpan Update' : 'Simpan Server'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List Table */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/40 border-b border-slate-800">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Daftar Cluster Server (Tabel: servers)
              </h4>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">Kelompokkan banyak router MikroTik ke dalam cluster server wilayah yang terorganisir.</p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Server</th>
                    <th className="py-3 px-4">Deskripsi</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Jumlah Router</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300 font-sans">
                  {servers.map((s) => {
                    const rCount = routers.filter(r => r.server_id === s.id).length;
                    return (
                      <tr key={s.id} className="hover:bg-slate-950/30 transition">
                        <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">{s.description || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${s.status === 'AKTIF' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-indigo-400">{rCount} Router</td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button 
                            onClick={() => handleEditServer(s)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-[10px]"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteServer(s.id)}
                            className="px-2 py-1 bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white rounded font-mono text-[10px]"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 2: ROUTER MIKROTIK --- */}
      {activeTab === 'routers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Form and info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  {editingRouterId ? 'Edit Router MikroTik' : 'Tambah Router Baru'}
                </span>
                <span className="text-[10px] font-normal text-amber-400 capitalize bg-amber-950/40 border border-amber-900/30 px-2.5 py-0.5 rounded-full">
                  Koneksi API Langsung Tanpa VPN Wajib
                </span>
              </h3>

              <form onSubmit={handleSaveRouter} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Nama Router *</label>
                  <input 
                    type="text" required placeholder="e.g. POP Pusat"
                    value={rtName} onChange={e => setRtName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Cluster Server Wilayah *</label>
                  <select 
                    value={rtServerId} onChange={e => setRtServerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Lokasi Geografis</label>
                  <input 
                    type="text" placeholder="e.g. Palembang"
                    value={rtLoc} onChange={e => setRtLoc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">IP Address Router (Public / Private) *</label>
                  <input 
                    type="text" required placeholder="e.g. 103.112.44.89"
                    value={rtIp} onChange={e => setRtIp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">API Port Router (Default: 8728) *</label>
                  <input 
                    type="text" required placeholder="8728"
                    value={rtPort} onChange={e => setRtPort(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">API SSL Port Router (Default: 8729) *</label>
                  <input 
                    type="text" required placeholder="8729"
                    value={rtSslPort} onChange={e => setRtSslPort(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Username Login RouterOS *</label>
                  <input 
                    type="text" required placeholder="e.g. starbilling"
                    value={rtUser} onChange={e => setRtUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Password Login RouterOS *</label>
                  <input 
                    type="password" required placeholder="e.g. star_router_pass"
                    value={rtPass} onChange={e => setRtPass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="flex items-center h-5">
                    <input 
                      id="ssl_chk" type="checkbox"
                      checked={rtSslEnabled} onChange={e => setRtSslEnabled(e.target.checked)}
                      className="w-4 h-4 bg-slate-900 border-slate-800 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-offset-slate-950"
                    />
                  </div>
                  <div className="text-xs">
                    <label htmlFor="ssl_chk" className="font-bold text-slate-200">Gunakan API SSL (Port: 8729)</label>
                    <span className="text-[10px] text-slate-500 block">Enkripsi pertukaran data API billing-router</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Timeout Koneksi (Detik)</label>
                  <input 
                    type="number" placeholder="10"
                    value={rtTimeout} onChange={e => setRtTimeout(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Catatan Tambahan / Keterangan</label>
                  <textarea 
                    rows={2} placeholder="Sebutkan detail lokasi rak atau konfigurasi IP lokal"
                    value={rtNotes} onChange={e => setRtNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  {editingRouterId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingRouterId(null);
                        setRtName('');
                        setRtIp('');
                        setRtUser('');
                        setRtPass('');
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl transition"
                    >
                      Batal
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingRouterId ? 'Simpan Perubahan Router' : 'Simpan Kredensial Router'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar Security info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs font-mono">
              <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>KEAMANAN KREDENSIAL</span>
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Aplikasi StarBilling ISP profesional menggunakan fitur enkripsi <strong>Laravel Encryption Service (AES-256-CBC)</strong> untuk menyimpan password router MikroTik di database.
              </p>
              
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Implementasi PHP Laravel:</span>
                <code className="text-amber-400 text-[10px] leading-tight block break-all">
                  {"$router->password = Crypt::encryptString($request->password);"}
                </code>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Hasil Database Mentah:</span>
                <span className="text-slate-400 text-[10px] block break-all mt-1 font-sans font-mono bg-slate-900 px-2 py-1 rounded">
                  eyJpdiI6Inp4YXNh... (ciphertext)
                </span>
                <span className="text-[9px] text-slate-500 block mt-1.5 font-sans">
                  Sistem tidak akan pernah menampilkan plaintext password di browser dalam query database normal.
                </span>
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950/40 border-b border-slate-800">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Daftar Router MikroTik Terdaftar (Tabel: routers)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-sans">Sistem dapat terhubung langsung ke IP Address + Port API masing-masing router.</p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Nama Router</th>
                    <th className="py-2.5 px-4">Server Cluster</th>
                    <th className="py-2.5 px-4">Alamat IP & Port</th>
                    <th className="py-2.5 px-4">Username</th>
                    <th className="py-2.5 px-4">Password (Database)</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-center">Terakhir Koneksi</th>
                    <th className="py-2.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300 font-sans">
                  {routers.map((r) => {
                    const parentServer = servers.find(s => s.id === r.server_id);
                    const isDecrypted = showPlainPasswords[r.id];
                    return (
                      <tr key={r.id} className="hover:bg-slate-950/20 transition">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>{r.router_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono font-medium flex items-center gap-1 mt-0.5">
                            📍 {r.location || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-400 text-xs font-medium bg-slate-950 px-2 py-1 rounded border border-slate-850">
                            {parentServer ? parentServer.name : 'Unknown Server'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-indigo-400">
                          <div>{r.ip_address}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Port API: {r.ssl_enabled ? `${r.api_ssl_port} (SSL)` : r.api_port}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 font-semibold">{r.username}</td>
                        <td className="py-3 px-4 font-mono text-xs">
                          <div className="flex items-center gap-1.5 max-w-[200px] overflow-hidden">
                            <span className="text-[10px] text-slate-500 shrink-0 select-none">
                              {isDecrypted ? '🔓 [Plain]' : '🔒 [Encrypted]'}
                            </span>
                            <span className="truncate text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                              {isDecrypted ? 'star_router_pass' : r.password}
                            </span>
                            <button 
                              onClick={() => togglePasswordPlain(r.id)}
                              className="text-slate-500 hover:text-cyan-400 transition"
                              title="Tampilkan / Sembunyikan Plaintext"
                            >
                              {isDecrypted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${r.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">{r.last_connected}</td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button 
                            onClick={() => handleEditRouter(r)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-[10px] font-bold"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteRouter(r.id)}
                            className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white rounded font-mono text-[10px] font-bold"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 3: TEST CONNECTION --- */}
      {activeTab === 'test-conn' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" /> Uji Konektivitas API Router MikroTik (Test Connection)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verifikasi handshake protokol API MikroTik secara real-time. Sistem akan melakukan ping, socket connection, dan login API.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-mono">
            {/* Control Panel */}
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">PILIH ROUTER MIKROTIK</label>
                <select 
                  value={testRouterId} 
                  onChange={e => setTestRouterId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {routers.map(r => <option key={r.id} value={r.id}>{r.router_name} ({r.ip_address})</option>)}
                </select>

                <div className="pt-2">
                  <button 
                    onClick={handleRunTestConnection}
                    disabled={isTesting}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold rounded-xl flex items-center justify-center gap-1.5 transition uppercase tracking-wider text-xs"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                    <span>{isTesting ? 'MENGUJI API...' : 'JALANKAN UJI KONEKSI'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Result card */}
              {testResult && (
                <div className={`p-5 rounded-2xl border ${testResult.success ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-rose-950/20 border-rose-900/40 text-rose-300'} space-y-3`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
                    <span className="font-bold text-xs uppercase font-mono">STATUS: {testResult.success ? 'ONLINE' : 'OFFLINE'}</span>
                  </div>

                  <div className="text-slate-400 text-[11px] leading-relaxed pb-2 border-b border-slate-800/60">
                    {testResult.message}
                  </div>

                  {testResult.success && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block">IDENTITY</span>
                        <span className="text-white font-bold">{testResult.identity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ROUTEROS VER</span>
                        <span className="text-white font-bold">{testResult.version}</span>
                      </div>
                      <div className="col-span-2 pt-1">
                        <span className="text-slate-500 block">UPTIME</span>
                        <span className="text-white font-bold">{testResult.uptime}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Terminal output */}
            <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-850 p-5 flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" /> Terminal Handshake API Logger
                  </span>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] leading-relaxed text-slate-300 max-h-60 overflow-y-auto pr-2">
                  {testLogs.length === 0 ? (
                    <span className="text-slate-600 italic block">Logger kosong. Klik "Jalankan Uji Koneksi" untuk memulai diagnosa handshake RouterOS API...</span>
                  ) : (
                    testLogs.map((log, index) => (
                      <div key={index} className="flex gap-1.5 items-start">
                        <span className="text-slate-600 select-none">[{index+1}]</span>
                        <span className={log.includes('ERROR') ? 'text-rose-400 font-bold' : log.includes('SUCCESS') || log.includes('✔') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                          {log}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
                <span>Driver: evilfreelancer/routeros-api-php</span>
                <span>Protokol: TCP/IP Port 8728-8729</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 4: SINKRONISASI & AUTO DISCOVERY --- */}
      {activeTab === 'sync' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" /> Sinkronisasi Database vs RouterOS API
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Pindai dan sinkronkan data PPPoE Secrets, Hotspot, Queue, dan DHCP Server Leases langsung dari router.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={syncRouterId} 
                onChange={e => setSyncRouterId(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {routers.map(r => <option key={r.id} value={r.id}>{r.router_name}</option>)}
              </select>

              <button 
                onClick={handleAutoDiscovery}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 transition uppercase tracking-wider shadow"
              >
                {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-slate-950" />}
                <span>Auto Discovery PPPoE</span>
              </button>
            </div>
          </div>

          {/* Auto discovery log */}
          {autoDiscoveryLog.length > 0 && (
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Auto Discovery Terminal Output</span>
              <div className="font-mono text-[11px] text-emerald-400 space-y-1 max-h-36 overflow-y-auto">
                {autoDiscoveryLog.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-600 select-none">[{index+1}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub tabs for sync items */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 w-full sm:w-max gap-1">
            <button 
              onClick={() => setSyncTab('pppoe')}
              className={`py-1.5 px-4 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${syncTab === 'pppoe' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> /ppp secret
            </button>
            <button 
              onClick={() => setSyncTab('hotspot')}
              className={`py-1.5 px-4 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${syncTab === 'hotspot' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Wifi className="w-3.5 h-3.5" /> /ip hotspot user
            </button>
            <button 
              onClick={() => setSyncTab('queue')}
              className={`py-1.5 px-4 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${syncTab === 'queue' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Activity className="w-3.5 h-3.5" /> /queue simple
            </button>
            <button 
              onClick={() => setSyncTab('dhcp')}
              className={`py-1.5 px-4 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${syncTab === 'dhcp' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Database className="w-3.5 h-3.5" /> /ip dhcp-server lease
            </button>
          </div>

          {/* Tables for sync items */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
            {syncTab === 'pppoe' && (
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-950 text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Username PPPoE</th>
                      <th className="py-2.5 px-4">Password</th>
                      <th className="py-2.5 px-4">Bandwidth Profile</th>
                      <th className="py-2.5 px-4">Service</th>
                      <th className="py-2.5 px-4">Comment (Info Member)</th>
                      <th className="py-2.5 px-4 text-center">Disabled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {(simulatedPppSecrets[syncRouterId] || []).map((sec, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/40 transition">
                        <td className="py-2.5 px-4 text-white font-semibold">{sec.username}</td>
                        <td className="py-2.5 px-4 text-slate-400">{sec.password}</td>
                        <td className="py-2.5 px-4 text-indigo-400 font-bold">{sec.profile}</td>
                        <td className="py-2.5 px-4 text-slate-500">{sec.service}</td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">{sec.comment}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${sec.disabled === 'true' ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'}`}>
                            {sec.disabled}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {syncTab === 'hotspot' && (
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-950 text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Name Hotspot</th>
                      <th className="py-2.5 px-4">Profile</th>
                      <th className="py-2.5 px-4">IP Address</th>
                      <th className="py-2.5 px-4">Comment</th>
                      <th className="py-2.5 px-4 text-right">Limit Uptime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {(simulatedHotspotUsers[syncRouterId] || []).map((hot, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/40 transition">
                        <td className="py-2.5 px-4 text-white font-semibold">{hot.name}</td>
                        <td className="py-2.5 px-4 text-indigo-400 font-bold">{hot.profile}</td>
                        <td className="py-2.5 px-4 text-slate-400">{hot.address || '-'}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-sans">{hot.comment}</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400">{hot.limitUptime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {syncTab === 'queue' && (
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-950 text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Queue Name</th>
                      <th className="py-2.5 px-4">Target IP / IP Range</th>
                      <th className="py-2.5 px-4">Max-Limit (Upload/Download)</th>
                      <th className="py-2.5 px-4">Packets Transferred</th>
                      <th className="py-2.5 px-4 text-right">Burst-Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {(simulatedQueues[syncRouterId] || []).map((qu, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/40 transition">
                        <td className="py-2.5 px-4 text-white font-semibold">{qu.name}</td>
                        <td className="py-2.5 px-4 text-cyan-400">{qu.target}</td>
                        <td className="py-2.5 px-4 text-indigo-400 font-bold">{qu.maxLimit}</td>
                        <td className="py-2.5 px-4 text-slate-400">{qu.packets}</td>
                        <td className="py-2.5 px-4 text-right text-slate-500">{qu.burstLimit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {syncTab === 'dhcp' && (
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-950 text-[10px] text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">IP Address</th>
                      <th className="py-2.5 px-4">MAC Address</th>
                      <th className="py-2.5 px-4">Device Host Name</th>
                      <th className="py-2.5 px-4">DHCP Server</th>
                      <th className="py-2.5 px-4 text-right">Lease Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {(simulatedDhcpLeases[syncRouterId] || []).map((dh, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/40 transition">
                        <td className="py-2.5 px-4 text-cyan-400 font-semibold">{dh.ipAddress}</td>
                        <td className="py-2.5 px-4 text-slate-400">{dh.macAddress}</td>
                        <td className="py-2.5 px-4 text-white font-sans">{dh.hostName || '-'}</td>
                        <td className="py-2.5 px-4 text-slate-500">{dh.server}</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 uppercase">
                            {dh.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 5: MONITORING --- */}
      {activeTab === 'monitor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> Live Resource & Traffic Monitoring (Auto-Refresh)
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Data ditarik langsung dari sistem RouterOS API setiap 2 detik dengan visualisasi grafik line chart.
              </p>
            </div>

            <select 
              value={monitorRouterId} 
              onChange={e => setMonitorRouterId(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {routers.map(r => <option key={r.id} value={r.id}>{r.router_name}</option>)}
            </select>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono">
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">CPU LOAD</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{liveResources.cpu}%</span>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${liveResources.cpu}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">FREE MEMORY</span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block">{(liveResources.memoryTotal - liveResources.memoryUsed).toFixed(1)} MB</span>
              <span className="text-[9px] text-slate-500 block mt-1">Total: {liveResources.memoryTotal} MB</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">FREE DISK</span>
              <span className="text-xl font-bold text-indigo-400 mt-1 block">{(liveResources.diskTotal - liveResources.diskUsed).toFixed(1)} MB</span>
              <span className="text-[9px] text-slate-500 block mt-1">Total: {liveResources.diskTotal} MB</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">TEMPERATURE</span>
              <span className={`text-xl font-bold mt-1 block ${liveResources.temperature > 55 ? 'text-rose-400' : 'text-amber-400'}`}>
                {liveResources.temperature}°C
              </span>
              <span className="text-[9px] text-slate-500 block mt-1">Normal &lt; 60°C</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl col-span-2 md:col-span-1">
              <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono">UPTIME MIKROTIK</span>
              <span className="text-xs font-bold text-slate-300 mt-2 block break-all font-mono leading-tight">{liveResources.uptime}</span>
            </div>
          </div>

          {/* Chart & Interface info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Chart */}
            <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Interface Live Bandwidth (ether1-WAN)</span>
              
              <div className="h-60 w-full text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#475569" />
                    <YAxis stroke="#475569" unit="M" />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#cbd5e1' }} />
                    <Area type="monotone" dataKey="download" name="Download (Tx)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorDl)" />
                    <Area type="monotone" dataKey="upload" name="Upload (Rx)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUl)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interface Status list */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-4 font-mono text-xs">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-1">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>INTERFACE STATUS (ROUTEROS)</span>
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-xl border border-slate-850/60">
                  <div>
                    <span className="font-bold text-white block">ether1-WAN</span>
                    <span className="text-[10px] text-slate-500">Link Speed: 1 Gbps</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-900/40">
                    Running / Up
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-xl border border-slate-850/60">
                  <div>
                    <span className="font-bold text-white block">ether2-LAN</span>
                    <span className="text-[10px] text-slate-500">Link Speed: 100 Mbps</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-900/40">
                    Running / Up
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-xl border border-slate-850/60">
                  <div>
                    <span className="font-bold text-white block">sfp-sfpplus1</span>
                    <span className="text-[10px] text-slate-500">Link Speed: 10 Gbps</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-slate-500 font-bold px-2 py-0.5 rounded border border-slate-800">
                    No Link / Down
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 6: LOG KONEKSI --- */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" /> Log Histori Koneksi API Router (Tabel: connection_logs)
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Riwayat aktivitas diagnosa, uji login, sinkronisasi secret, dan remote control suspend/unsuspend pada port MikroTik API.
              </p>
            </div>

            <button 
              onClick={handleClearLogs}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-rose-400 border border-slate-800 font-bold rounded-xl text-xs font-mono transition"
            >
              Bersihkan Logs
            </button>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950 text-[10px] text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Router ID</th>
                    <th className="py-2.5 px-4">Aktivitas / Perintah API</th>
                    <th className="py-2.5 px-4">Alamat IP</th>
                    <th className="py-2.5 px-4">Tanggapan Server (Response)</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Waktu (WIB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {connLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 italic">Belum ada histori log koneksi.</td>
                    </tr>
                  ) : (
                    connLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-3 px-4 font-bold text-white">{log.router_id}</td>
                        <td className="py-3 px-4 text-cyan-400 font-semibold">{log.action}</td>
                        <td className="py-3 px-4 text-slate-400">{log.ip_address}</td>
                        <td className="py-3 px-4 text-slate-300 font-sans max-w-sm truncate" title={log.response}>{log.response}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">{log.created_at}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 7: GENIEACS (Preserved) --- */}
      {activeTab === 'genieacs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl animate-fade-in">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Wifi className="w-4 h-4 text-indigo-400" /> GenieACS TR-069 Integration (CPE Auto-Control)
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Konfigurasikan server GenieACS open-source eksternal Anda untuk mengendalikan SSID Wifi dan remot kontrol modem ONT pelanggan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">GenieACS Server API URL *</label>
              <input 
                type="text" required value={genieUrl} onChange={e => setGenieUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">GenieACS Username *</label>
              <input 
                type="text" required value={genieUser} onChange={e => setGenieUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">GenieACS Password *</label>
              <input 
                type="password" required value={geniePass} onChange={e => setGeniePass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded border border-emerald-900/30">
              ✔ Server Status: GenieACS Listener OK (Port 7557)
            </span>
            <button
              onClick={() => {
                localStorage.setItem('sb_genieacs_url', genieUrl);
                alert('Sukses: Pengaturan GenieACS berhasil disimpan!');
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" /> Simpan Pengaturan GenieACS
            </button>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 8: IMPORT DATA (Preserved) --- */}
      {activeTab === 'import' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl animate-fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> Impor Database Pelanggan Manual
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Impor data pelanggan secara massal menggunakan file CSV atau salinan data JSON.
            </p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                <span className="font-bold text-slate-200 block mb-1">Strategi Duplikasi Data</span>
                <span className="text-[11px] text-slate-500 block mb-3 font-sans">Pilih tindakan jika mendeteksi nomor WhatsApp yang sama.</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setImportStrategy('skip')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono transition ${importStrategy === 'skip' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  >
                    Skip
                  </button>
                  <button 
                    onClick={() => setImportStrategy('overwrite')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono transition ${importStrategy === 'overwrite' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  >
                    Overwrite
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Muat Format Template</span>
                  <span className="text-[11px] text-slate-500 block font-sans">Load template CSV siap pakai untuk mempercepat input data.</span>
                </div>
                <button 
                  onClick={() => setImportText("name,phone,email,address,nik,package_id\nAgus Riyadi,081234567812,agus@starbilling.local,Dusun Jaya RT 12 Palembang,1601021203040001,pkg-1\nSiti Rahma,089988771122,siti.rahma@starbilling.local,Perum Kenten Damai B7,1601021203040002,pkg-2")}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-bold transition mt-3"
                >
                  Load Template CSV
                </button>
              </div>
            </div>

            <textarea 
              rows={5}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="name,phone,email,address,nik,package_id&#10;Agus Riyadi,081234567812,agus@starbilling.local,Dusun Jaya RT 12 Palembang,1601021203040001,pkg-1"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (!importText.trim()) {
                    alert('Kolom impor kosong!');
                    return;
                  }
                  // Simulate success
                  alert('Sukses: 2 pelanggan dari data template impor berhasil ditambahkan.');
                  setImportText('');
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Play className="w-4 h-4" /> Eksekusi Impor Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
