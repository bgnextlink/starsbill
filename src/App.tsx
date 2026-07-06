/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_ODPS, 
  INITIAL_INVOICES, 
  INITIAL_TICKETS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_INVENTORY, 
  INITIAL_WA_DEVICES, 
  INITIAL_WA_MESSAGES, 
  INITIAL_AREAS, 
  INITIAL_PACKAGES 
} from './data/mockData';
import { 
  Customer, 
  Odp, 
  Invoice, 
  Ticket, 
  Transaction, 
  InventoryItem, 
  WaDevice, 
  WaMessage, 
  Area, 
  InternetPackage 
} from './types';

// Importing Custom Views
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import CustomerManagement from './components/CustomerManagement';
import PackageManagement from './components/PackageManagement';
import GisFiber from './components/GisFiber';
import MikrotikIntegration from './components/MikrotikIntegration';
import BillingGateway from './components/BillingGateway';
import WhatsappTicketing from './components/WhatsappTicketing';
import GenieAcsMonitoring from './components/GenieAcsMonitoring';
import CodeExplorer from './components/CodeExplorer';
import CustomerPortal from './components/CustomerPortal';
import PortalLogin from './components/PortalLogin';
import FinanceModule from './components/FinanceModule';
import Settings from './components/Settings';
import ExtraViews from './components/ExtraViews';
import SettingServerView from './components/SettingServerView';
import SettingWilayahView from './components/SettingWilayahView';
import DiagnosticCenter from './components/DiagnosticCenter';
import DirectBillingPay from './components/DirectBillingPay';

import { Activity, Code, User, Settings2, Globe } from 'lucide-react';

// Helper functions for dynamic WhatsApp / Customer Number normalization
export function normalizePhoneNumber(num: string): string {
  if (!num) return '';
  let clean = num.replace(/\s+/g, '').replace(/\+/g, '').replace(/\D/g, '');
  if (clean.startsWith('08')) {
    clean = '628' + clean.substring(2);
  }
  return clean;
}

export function normalizeInitialCustomers(initial: Customer[]): Customer[] {
  return initial.map((c, idx) => {
    const normPhone = normalizePhoneNumber(c.phone);
    const firstWord = c.name.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
    return {
      ...c,
      phone: normPhone,
      customer_number: normPhone, // customer_number = phone
      pppoe_username: c.pppoe_username || `${c.name.toLowerCase().replace(/\s+/g, '')}@starbilling`,
      portal_username: c.portal_username || firstWord || `user${idx}`,
      portal_password: c.portal_password || `${firstWord}123` || '12345678'
    };
  });
}

export default function App() {
  // Global Session States
  const [currentRole, setCurrentRole] = useState<'admin' | 'customer' | 'developer'>('admin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverSubTab, setServerSubTab] = useState<'mikrotik' | 'acs'>('mikrotik');

  // Core Master Data State Engine
  const [customers, setCustomers] = useState<Customer[]>(() => normalizeInitialCustomers(INITIAL_CUSTOMERS));
  const [odps, setOdps] = useState<Odp[]>(INITIAL_ODPS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [waDevices, setWaDevices] = useState<WaDevice[]>(INITIAL_WA_DEVICES);
  const [waMessages, setWaMessages] = useState<WaMessage[]>(INITIAL_WA_MESSAGES);
  const [areas, setAreas] = useState<Area[]>(() => {
    const saved = localStorage.getItem('sb_areas');
    return saved ? JSON.parse(saved) : INITIAL_AREAS;
  });
  const [packages, setPackages] = useState<InternetPackage[]>(INITIAL_PACKAGES);

  // Online Registrants State Engine (Stored in LocalStorage to persist refreshes)
  const [onlineRegistrations, setOnlineRegistrations] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('sb_online_registrations');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddOnlineRegistration = (newReg: Customer) => {
    setOnlineRegistrations(prev => {
      const updated = [...prev, newReg];
      localStorage.setItem('sb_online_registrations', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveOnlineRegistration = (id: string) => {
    setOnlineRegistrations(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('sb_online_registrations', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddArea = (newArea: Area) => {
    setAreas(prev => {
      const updated = [...prev, newArea];
      localStorage.setItem('sb_areas', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateArea = (updatedArea: Area) => {
    setAreas(prev => {
      const updated = prev.map(a => a.id === updatedArea.id ? updatedArea : a);
      localStorage.setItem('sb_areas', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteArea = (id: string) => {
    setAreas(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem('sb_areas', JSON.stringify(updated));
      return updated;
    });
  };

  // Customer portal login session state
  const [loggedPortalCustomer, setLoggedPortalCustomer] = useState<Customer | null>(null);

  // ==================== STATE HANDLERS ====================

  // Internet Package handlers
  const handleAddPackage = (newPkg: InternetPackage) => {
    setPackages(prev => [...prev, newPkg]);
  };

  const handleUpdatePackage = (updatedPkg: InternetPackage) => {
    setPackages(prev => prev.map(p => p.id === updatedPkg.id ? updatedPkg : p));
  };

  const handleDeletePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  // Customer handlers
  const handleAddCustomer = (newCust: Customer) => {
    setCustomers(prev => [...prev, newCust]);
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // ODP Handlers
  const handleAddOdp = (newOdp: Odp) => {
    setOdps(prev => [...prev, newOdp]);
  };

  const handleUpdateOdp = (updatedOdp: Odp) => {
    setOdps(prev => prev.map(o => o.id === updatedOdp.id ? updatedOdp : o));
  };

  const handleDeleteOdp = (id: string) => {
    setOdps(prev => prev.filter(o => o.id !== id));
  };

  // Billing Mass Generator
  const handleGenerateMassal = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Create new monthly invoices for unpaid customers
    const newInvoices: Invoice[] = customers.map((cust, idx) => {
      const pkg = packages.find(p => p.id === cust.package_id) || packages[0];
      return {
        id: `inv-mass-${Date.now()}-${idx}`,
        invoice_number: `INV/${currentYear}/${currentMonth}/${Math.floor(Math.random() * 8999) + 1000}`,
        customer_id: cust.id,
        amount: pkg.price + 5000, // include admin service fee
        due_date: `${currentYear}-${currentMonth}-10`,
        status: 'Belum Bayar'
      };
    });

    setInvoices(prev => [...newInvoices, ...prev]);
  };

  // Pay invoice callback simulation
  const handlePayInvoice = (invoiceId: string, method: string, reference: string) => {
    let invoiceAmount = 0;
    let customerId = '';

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        invoiceAmount = inv.amount;
        customerId = inv.customer_id;
        return {
          ...inv,
          status: 'Lunas',
          paid_date: new Date().toISOString(),
          payment_method: method
        };
      }
      return inv;
    }));

    // Update customer status to Aktif if suspended
    if (customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === customerId && c.status === 'Suspend') {
          return { ...c, status: 'Aktif' };
        }
        return c;
      }));
    }

    // Log financial transaction ledger
    if (invoiceAmount > 0) {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'Pemasukan',
        category: 'Iuran Bulanan',
        amount: invoiceAmount,
        description: `Pembayaran Lunas Tagihan via ${method} (Ref: ${reference})`,
        date: new Date().toISOString().split('T')[0],
        payment_method: method,
        reference_no: reference
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  // Ticket Handlers
  const handleAddTicket = (newTic: Ticket) => {
    setTickets(prev => [newTic, ...prev]);
  };

  const handleUpdateTicket = (updatedTic: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTic.id ? updatedTic : t));
  };

  // WA Message Log Handler
  const handleAddWaMessage = (newMsg: WaMessage) => {
    setWaMessages(prev => [newMsg, ...prev]);
  };

  // Custom function to send quick WA notification
  const handleSendWhatsappNotification = (recipient: string, message: string, type: string) => {
    const connectedDevice = waDevices.find(d => d.status === 'Connected') || waDevices[0];
    const newMsg: WaMessage = {
      id: `msg-direct-${Date.now()}`,
      device_id: connectedDevice.id,
      recipient,
      message,
      type: type as any,
      status: 'Sent',
      created_at: new Date().toISOString()
    };
    setWaMessages(prev => [newMsg, ...prev]);
  };

  const handleAddTransaction = (newTrx: Transaction) => {
    setTransactions(prev => [newTrx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Dynamic Header Workspace Controller */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-5 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-xl shadow-lg shadow-indigo-500/10">
            <Globe className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-serif font-bold text-white tracking-wide uppercase">STARBILLING <span className="text-indigo-400">ISP</span></h1>
              <span className="text-[9px] font-mono bg-indigo-950/80 text-indigo-400 border border-indigo-800/30 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Enterprise v12</span>
            </div>
            <p className="text-[10px] text-slate-400">FTTH & Wireless Billing, MikroTik Routing Queue & TR-069 ACS System</p>
          </div>
        </div>

        {/* Live system health line */}
        <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-slate-400 border-x border-slate-800 px-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MIKROTIK: ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACS TR-069: LIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>WA API: CONNECTED</span>
          </div>
        </div>

        {/* Role Switching Sandbox Console in Header */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end md:self-auto">
          <button 
            onClick={() => {
              setCurrentRole('admin');
              setActiveTab('dashboard');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              currentRole === 'admin' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Admin NOC
          </button>
          
          <button 
            onClick={() => {
              setCurrentRole('customer');
              setActiveTab('portal-dash');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              currentRole === 'customer' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Portal Pelanggan
          </button>

          <button 
            onClick={() => {
              setCurrentRole('developer');
              setActiveTab('code-explorer');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              currentRole === 'developer' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Arsitek Code
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Dynamic Sidebar depending on Session Role */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeRole={currentRole}
          setActiveRole={(role) => {
            setCurrentRole(role);
            if (role === 'admin') setActiveTab('dashboard');
            else if (role === 'customer') setActiveTab('portal-dash');
            else if (role === 'developer') setActiveTab('code-explorer');
          }}
        />

        {/* Main interactive panel canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-950">
          
          {/* RENDER ADMIN NOC SUITE */}
          {currentRole === 'admin' && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard 
                  customers={customers}
                  invoices={invoices}
                  tickets={tickets}
                />
              )}

              {activeTab === 'setting-server' && (
                <SettingServerView 
                  customers={customers}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  packages={packages}
                />
              )}

              {activeTab === 'members-billing' && (
                <BillingGateway 
                  invoices={invoices}
                  customers={customers}
                  packages={packages}
                  onGenerateMassal={handleGenerateMassal}
                  onPayInvoice={handlePayInvoice}
                  onSendWhatsapp={handleSendWhatsappNotification}
                />
              )}

              {activeTab === 'setting-wilayah' && (
                <SettingWilayahView 
                  areas={areas}
                  onAddArea={handleAddArea}
                  onUpdateArea={handleUpdateArea}
                  onDeleteArea={handleDeleteArea}
                />
              )}

              {activeTab === 'setting-odp' && (
                <GisFiber 
                  odps={odps}
                  customers={customers}
                  onAddOdp={handleAddOdp}
                  onUpdateOdp={handleUpdateOdp}
                  onDeleteOdp={handleDeleteOdp}
                />
              )}

              {activeTab === 'setting-paket' && (
                <PackageManagement 
                  packages={packages}
                  onAddPackage={handleAddPackage}
                  onUpdatePackage={handleUpdatePackage}
                  onDeletePackage={handleDeletePackage}
                  customersCountMap={customers.reduce((map, cust) => {
                    map[cust.package_id] = (map[cust.package_id] || 0) + 1;
                    return map;
                  }, {} as Record<string, number>)}
                  areas={areas}
                />
              )}

              {activeTab === 'data-pelanggan' && (
                <CustomerManagement 
                  customers={customers}
                  packages={packages}
                  odps={odps}
                  areas={areas}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  onlineRegistrations={onlineRegistrations}
                  onVerifyRegistration={(approvedCust) => {
                    handleAddCustomer(approvedCust);
                    handleRemoveOnlineRegistration(approvedCust.id);
                  }}
                  onRejectRegistration={handleRemoveOnlineRegistration}
                />
              )}

              {(activeTab === 'ticket-komplain' || activeTab === 'pesan-otomatis') && (
                <WhatsappTicketing 
                  tickets={tickets}
                  waDevices={waDevices}
                  waMessages={waMessages}
                  customers={customers}
                  onAddTicket={handleAddTicket}
                  onUpdateTicket={handleUpdateTicket}
                  onAddWaMessage={handleAddWaMessage}
                />
              )}

              {activeTab === 'transaksi-lain-lain' && (
                <FinanceModule 
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                />
              )}

              {activeTab === 'pembayaran-tagihan' && (
                <BillingGateway 
                  invoices={invoices}
                  customers={customers}
                  packages={packages}
                  onGenerateMassal={handleGenerateMassal}
                  onPayInvoice={handlePayInvoice}
                  onSendWhatsapp={handleSendWhatsappNotification}
                />
              )}

              {activeTab === 'diagnostic-center' && (
                <DiagnosticCenter customers={customers} />
              )}

              {activeTab === 'quick-pay' && (
                <DirectBillingPay 
                  customers={customers}
                  invoices={invoices}
                  packages={packages}
                  areas={areas}
                  onPayInvoice={handlePayInvoice}
                  onSendWhatsapp={handleSendWhatsappNotification}
                  onBackToAdmin={() => setActiveTab('dashboard')}
                />
              )}

              {activeTab === 'identitas-lisensi' && (
                <Settings 
                  customers={customers}
                  onUpdateCustomer={handleUpdateCustomer}
                />
              )}

              {[
                'pendaftaran-online',
                'kolektor',
                'transaksi-lainya',
                'biaya-diskon',
                'laporan',
                'master-bank',
                'payment-gateway',
                'addon',
                'karyawan',
                'sistem-setting',
                'billing-system'
              ].includes(activeTab) && (
                <ExtraViews 
                  tab={activeTab}
                  customers={customers}
                  onAddCustomer={handleAddCustomer}
                />
              )}
            </>
          )}

          {/* RENDER CUSTOMER PORTAL */}
          {currentRole === 'customer' && (
            loggedPortalCustomer ? (
              <CustomerPortal 
                customer={loggedPortalCustomer}
                invoices={invoices}
                tickets={tickets}
                packages={packages}
                onAddTicket={handleAddTicket}
                onPayInvoice={handlePayInvoice}
                onSendWhatsapp={handleSendWhatsappNotification}
                onLogout={() => setLoggedPortalCustomer(null)}
                onUpdateCustomer={handleUpdateCustomer}
              />
            ) : (
              <PortalLogin 
                customers={customers} 
                packages={packages}
                onSendWhatsapp={handleSendWhatsappNotification}
                onAddOnlineRegistration={handleAddOnlineRegistration}
                onLoginSuccess={(c) => {
                  setLoggedPortalCustomer(c);
                  setActiveTab('portal-dash');
                }} 
              />
            )
          )}

          {/* RENDER DEVELOPER CODE EXPLORER */}
          {currentRole === 'developer' && (
            <>
              {activeTab === 'code-explorer' && (
                <CodeExplorer />
              )}
            </>
          )}

        </main>
      </div>

      {/* Sandbox controller status footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 px-6 py-3.5 text-center text-xs text-slate-500 font-mono">
        <span>Developed by StarBilling DevOps. Built with Laravel 12 & React 19. All systems operational.</span>
      </footer>

    </div>
  );
}
