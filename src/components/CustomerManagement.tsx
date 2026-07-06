/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  Eye, 
  X, 
  Check, 
  MapPin,
  AlertTriangle,
  FileUp,
  Image as ImageIcon,
  Printer,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Customer, InternetPackage, Odp, Area } from '../types';

// Client-side phone number normalization helper matching backend logic
function normalizePhoneNumber(num: string): string {
  if (!num) return '';
  // Hapus spasi, tanda +, dan semua karakter selain angka
  let clean = num.replace(/\s+/g, '').replace(/\+/g, '').replace(/\D/g, '');
  if (clean.startsWith('08')) {
    clean = '628' + clean.substring(2);
  }
  return clean;
}

interface CustomerManagementProps {
  customers: Customer[];
  packages: InternetPackage[];
  odps: Odp[];
  areas?: Area[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onlineRegistrations?: Customer[];
  onVerifyRegistration?: (approvedCustomer: Customer) => void;
  onRejectRegistration?: (id: string) => void;
}

export default function CustomerManagement({ 
  customers, 
  packages, 
  odps, 
  areas = [],
  onAddCustomer, 
  onUpdateCustomer, 
  onDeleteCustomer,
  onlineRegistrations = [],
  onVerifyRegistration,
  onRejectRegistration
}: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('SEMUA AREA');
  const [statusFilter, setStatusFilter] = useState('SEMUA STATUS');
  const [isolirFilter, setIsolirFilter] = useState('SEMUA');
  const [skemaFilter, setSkemaFilter] = useState('SEMUA SKEMA');
  const [fotoRumahFilter, setFotoRumahFilter] = useState('SEMUA');
  const [routerFilter, setRouterFilter] = useState('SEMUA ROUTER');
  const [packageFilter, setPackageFilter] = useState('SEMUA PAKET');
  const [odpFilter, setOdpFilter] = useState('SEMUA ODP');
  const [marketingFilter, setMarketingFilter] = useState('SEMUA MARKETING / AGEN');
  const [dateFilter, setDateFilter] = useState('TANPA FILTER');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [kotaFilter, setKotaFilter] = useState('SEMUA KOTA');
  const [kecamatanFilter, setKecamatanFilter] = useState('SEMUA KECAMATAN');
  const [desaFilter, setDesaFilter] = useState('SEMUA DESA');

  // Online registration modal & verification tracker states
  const [isOnlineRegistrantsOpen, setIsOnlineRegistrantsOpen] = useState(false);
  const [verifyingRegistrationId, setVerifyingRegistrationId] = useState<string | null>(null);

  const handleVerifyOnlineRegistrant = (reg: Customer) => {
    setEditingCustomer(null);
    setRawPhoneInput(reg.phone);
    setFormData({
      name: reg.name,
      nik: reg.nik === '-' ? '' : reg.nik,
      phone: reg.phone,
      email: reg.email === '-' ? '' : reg.email,
      address: reg.address,
      latitude: reg.latitude || -2.9917,
      longitude: reg.longitude || 104.6966,
      package_id: reg.package_id,
      router_id: 'Router-Gambir-01',
      odp_id: odps[0]?.id || 'odp-1',
      marketing_id: reg.agent_name || reg.marketing_id || 'Portal Online',
      status: 'Aktif',
      area_id: areas[0]?.id || '',
      portal_username: reg.portal_username || '',
      portal_password: reg.portal_password || ''
    });
    setKtpPreview(reg.ktp_url || '');
    setHomePreview(reg.home_photo_url || '');
    setVerifyingRegistrationId(reg.id);
    setIsFormOpen(true);
    setIsOnlineRegistrantsOpen(false);
  };

  const handleRejectOnlineRegistrant = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menolak & menghapus pendaftaran online ini?')) {
      if (onRejectRegistration) {
        onRejectRegistration(id);
      }
    }
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column visibility states
  const [visibleColumns, setVisibleColumns] = useState({
    no: true,
    act: true,
    noPelanggan: true,
    nama: true,
    telp: true,
    area: true,
    paket: true,
    total: true,
    jatuhTempo: true,
    tagihan: true,
    status: true,
    marketing: true,
    portalCreds: true
  });
  const [showColumnPopover, setShowColumnPopover] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    phone: '',
    email: '',
    address: '',
    latitude: -2.9917,
    longitude: 104.6966, // Default main office coordinates
    package_id: 'pkg-1',
    router_id: 'Router-Gambir-01',
    odp_id: 'odp-1',
    marketing_id: 'Asep Marketing',
    status: 'Aktif' as 'Aktif' | 'Suspend' | 'Nonaktif',
    area_id: '',
    portal_username: '',
    portal_password: ''
  });

  // Previews for file uploads
  const [ktpPreview, setKtpPreview] = useState<string>('');
  const [homePreview, setHomePreview] = useState<string>('');

  const fileInputKtp = useRef<HTMLInputElement>(null);
  const fileInputHome = useRef<HTMLInputElement>(null);

  // Excel/CSV Import state
  const [importStrategy, setImportStrategy] = useState<'skip' | 'overwrite'>('skip');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);

  // Advanced filtering system matching the 15 input fields in the user design
  const filteredCustomers = customers.filter(cust => {
    // 1. Pencarian (Cari Nopel / Nama / Telp / Alamat / Screets)
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const pppoeUser = cust.pppoe_username || `${cust.name.toLowerCase().replace(/\s+/g, '')}@starbilling`;
      const matchesSearch = 
        cust.name.toLowerCase().includes(q) || 
        cust.customer_number.toLowerCase().includes(q) ||
        cust.phone.includes(q) ||
        cust.nik.includes(q) ||
        cust.address.toLowerCase().includes(q) ||
        pppoeUser.toLowerCase().includes(q) ||
        cust.email.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // 2. Area / Wilayah Filter
    if (areaFilter !== 'SEMUA AREA') {
      const areaObj = areas.find(a => a.id === areaFilter);
      const matchesArea = cust.area_id === areaFilter || 
        (areaObj && areaObj.name.toUpperCase() === areaFilter.toUpperCase()) ||
        cust.address.toUpperCase().includes(areaFilter.toUpperCase());
      if (!matchesArea) return false;
    }

    // 3. Status Pelanggan Filter
    if (statusFilter !== 'SEMUA STATUS') {
      const matchesStatus = cust.status.toUpperCase() === statusFilter.toUpperCase();
      if (!matchesStatus) return false;
    }

    // 4. Isolir Filter
    if (isolirFilter !== 'SEMUA') {
      const isIsolated = cust.status === 'Suspend';
      if (isolirFilter === 'YA' && !isIsolated) return false;
      if (isolirFilter === 'TIDAK' && isIsolated) return false;
    }

    // 5. Skema Filter
    if (skemaFilter !== 'SEMUA SKEMA') {
      const isPostpaid = !cust.id.includes('prepaid');
      if (skemaFilter === 'PRABAYAR' && isPostpaid) return false;
      if (skemaFilter === 'PASCABAYAR' && !isPostpaid) return false;
    }

    // 6. Foto Rumah Filter
    if (fotoRumahFilter !== 'SEMUA') {
      const hasPhoto = !!cust.home_photo_url && !cust.home_photo_url.includes('placeholder') && cust.home_photo_url !== '';
      if (fotoRumahFilter === 'ADA FOTO' && !hasPhoto) return false;
      if (fotoRumahFilter === 'TIDAK ADA FOTO' && hasPhoto) return false;
    }

    // 7. Routers Filter
    if (routerFilter !== 'SEMUA ROUTER') {
      if (cust.router_id !== routerFilter) return false;
    }

    // 8. Paket Filter
    if (packageFilter !== 'SEMUA PAKET') {
      const matchesPkg = cust.package_id === packageFilter || getPackageName(cust.package_id).toUpperCase() === packageFilter.toUpperCase();
      if (!matchesPkg) return false;
    }

    // 9. ODP Filter
    if (odpFilter !== 'SEMUA ODP') {
      const matchesOdp = cust.odp_id === odpFilter || getOdpName(cust.odp_id).toUpperCase() === odpFilter.toUpperCase();
      if (!matchesOdp) return false;
    }

    // 10. Marketing Filter
    if (marketingFilter !== 'SEMUA MARKETING / AGEN') {
      if (cust.marketing_id !== marketingFilter) return false;
    }

    // 11 & 12. Date Filter
    if (dateFilter === 'TANGGAL REGISTRASI' && (startDate || endDate)) {
      const regDateStr = cust.created_at;
      if (regDateStr) {
        const regTime = new Date(regDateStr).getTime();
        if (startDate) {
          const startTime = new Date(startDate).getTime();
          if (regTime < startTime) return false;
        }
        if (endDate) {
          const endTime = new Date(endDate).getTime() + 86400000;
          if (regTime > endTime) return false;
        }
      } else {
        return false;
      }
    }

    // 13. Kota / Kabupaten Filter
    if (kotaFilter !== 'SEMUA KOTA') {
      const keyword = kotaFilter.replace('SEMUA ', '').trim().toLowerCase();
      const matchesKota = cust.address.toLowerCase().includes(keyword) ||
        (cust.area_id && areas.find(a => a.id === cust.area_id)?.name.toLowerCase().includes(keyword));
      if (!matchesKota) return false;
    }

    // 14. Kecamatan Filter
    if (kecamatanFilter !== 'SEMUA KECAMATAN') {
      const keyword = kecamatanFilter.toLowerCase();
      const matchesKec = cust.address.toLowerCase().includes(keyword) ||
        (cust.area_id && areas.find(a => a.id === cust.area_id)?.name.toLowerCase().includes(keyword));
      if (!matchesKec) return false;
    }

    // 15. Desa / Kelurahan Filter
    if (desaFilter !== 'SEMUA DESA') {
      const keyword = desaFilter.toLowerCase();
      const matchesDesa = cust.address.toLowerCase().includes(keyword) ||
        (cust.area_id && areas.find(a => a.id === cust.area_id)?.name.toLowerCase().includes(keyword));
      if (!matchesDesa) return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setAreaFilter('SEMUA AREA');
    setStatusFilter('SEMUA STATUS');
    setIsolirFilter('SEMUA');
    setSkemaFilter('SEMUA SKEMA');
    setFotoRumahFilter('SEMUA');
    setRouterFilter('SEMUA ROUTER');
    setPackageFilter('SEMUA PAKET');
    setOdpFilter('SEMUA ODP');
    setMarketingFilter('SEMUA MARKETING / AGEN');
    setDateFilter('TANPA FILTER');
    setStartDate('');
    setEndDate('');
    setKotaFilter('SEMUA KOTA');
    setKecamatanFilter('SEMUA KECAMATAN');
    setDesaFilter('SEMUA DESA');
    setCurrentPage(1);
  };

  // Phone input formatting in real-time
  const [rawPhoneInput, setRawPhoneInput] = useState('');

  const liveNormalizedPhone = React.useMemo(() => {
    return normalizePhoneNumber(rawPhoneInput);
  }, [rawPhoneInput]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setRawPhoneInput('');
    setFormData({
      name: '',
      nik: '',
      phone: '',
      email: '',
      address: '',
      latitude: -2.9917,
      longitude: 104.6966,
      package_id: packages[0]?.id || 'pkg-1',
      router_id: 'Router-Gambir-01',
      odp_id: odps[0]?.id || 'odp-1',
      marketing_id: 'Asep Marketing',
      status: 'Aktif',
      area_id: areas[0]?.id || '',
      portal_username: '',
      portal_password: ''
    });
    setKtpPreview('');
    setHomePreview('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setRawPhoneInput(customer.phone);
    const firstWord = customer.name.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
    setFormData({
      name: customer.name,
      nik: customer.nik,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      latitude: customer.latitude || -2.9917,
      longitude: customer.longitude || 104.6966,
      package_id: customer.package_id,
      router_id: customer.router_id || 'Router-Gambir-01',
      odp_id: customer.odp_id,
      marketing_id: customer.marketing_id || 'Asep Marketing',
      status: customer.status,
      area_id: (customer as any).area_id || '',
      portal_username: customer.portal_username || firstWord,
      portal_password: customer.portal_password || `${firstWord}123`
    });
    setKtpPreview(customer.ktp_url || '');
    setHomePreview(customer.home_photo_url || '');
    setIsFormOpen(true);
  };

  const handleOpenView = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsViewOpen(true);
  };

  // Perform form submission with strict criteria
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.nik || !rawPhoneInput || !formData.email || !formData.address) {
      alert('Mohon lengkapi semua field utama yang diwajibkan!');
      return;
    }

    if (formData.nik.length !== 16) {
      alert('Validasi Gagal: Nomor NIK KTP harus berukuran tepat 16 digit angka!');
      return;
    }

    // Normalisasikan nomor WhatsApp
    const normalizedPhone = normalizePhoneNumber(rawPhoneInput);

    // Validasi panjang nomor WA
    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      alert('Validasi Gagal: Nomor WhatsApp hasil normalisasi harus berukuran antara 10 s/d 15 digit angka!');
      return;
    }

    // Validasi Unik: nomor tidak boleh duplikat di sistem
    const hasDuplicate = customers.some(c => 
      c.phone === normalizedPhone && (!editingCustomer || c.id !== editingCustomer.id)
    );

    if (hasDuplicate) {
      alert(`Validasi Gagal: Nomor WhatsApp (${normalizedPhone}) sudah terdaftar sebagai pelanggan aktif lain di StarBilling!`);
      return;
    }

    // Generate PPPoE Username
    const generatedPppoe = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@starbilling`;
    const firstWord = formData.name.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        ...formData,
        phone: normalizedPhone,
        customer_number: normalizedPhone, // customer_number = phone
        pppoe_username: editingCustomer.pppoe_username || generatedPppoe,
        portal_username: formData.portal_username || editingCustomer.portal_username || firstWord || 'budi',
        portal_password: formData.portal_password || editingCustomer.portal_password || `${firstWord}123` || '12345678',
        ktp_url: ktpPreview,
        home_photo_url: homePreview
      });
      alert('Sukses: Informasi pelanggan berhasil diperbarui!');
    } else {
      const onlineReg = onlineRegistrations.find(r => r.id === verifyingRegistrationId);
      onAddCustomer({
        id: `cust-${Date.now()}`,
        customer_number: normalizedPhone, // customer_number = phone
        name: formData.name,
        nik: formData.nik,
        phone: normalizedPhone,
        email: formData.email,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        package_id: formData.package_id,
        router_id: formData.router_id,
        odp_id: formData.odp_id,
        marketing_id: formData.marketing_id,
        status: formData.status,
        pppoe_username: generatedPppoe,
        portal_username: formData.portal_username || firstWord || 'budi',
        portal_password: formData.portal_password || `${firstWord}123` || '12345678',
        ktp_url: ktpPreview || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        home_photo_url: homePreview || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=300',
        agent_name: onlineReg?.agent_name || formData.marketing_id || undefined,
        maps_link: onlineReg?.maps_link || undefined,
        created_at: new Date().toISOString().split('T')[0]
      });
      alert('Sukses: Pelanggan baru berhasil didaftarkan di server StarBilling!');
    }

    if (verifyingRegistrationId && onRejectRegistration) {
      onRejectRegistration(verifyingRegistrationId);
      setVerifyingRegistrationId(null);
    }

    setIsFormOpen(false);
  };

  // Upload handlers using dynamic browser file picking
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'home') => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      if (type === 'ktp') {
        setKtpPreview(objectUrl);
      } else {
        setHomePreview(objectUrl);
      }
    }
  };

  // Helper to parse CSV complying with standard quoting rules
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentLine.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentLine.push(currentCell.trim());
        if (currentLine.some(cell => cell !== '')) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    if (currentCell !== '' || currentLine.length > 0) {
      currentLine.push(currentCell.trim());
      lines.push(currentLine);
    }
    return lines;
  };

  // Helper to process parsed data rows
  const processImportData = (dataRows: Array<{
    name: string;
    nik: string;
    phone: string;
    email: string;
    address: string;
    package_id: string;
    odp_id: string;
    pppoe_username?: string;
    status?: string;
  }>) => {
    let newCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    dataRows.forEach(row => {
      const normalized = normalizePhoneNumber(row.phone);
      const exists = customers.find(c => normalizePhoneNumber(c.phone) === normalized || normalizePhoneNumber(c.customer_number) === normalized);

      if (exists) {
        if (importStrategy === 'skip') {
          skippedCount++;
        } else {
          // Overwrite existing
          onUpdateCustomer({
            ...exists,
            name: row.name,
            nik: row.nik,
            email: row.email,
            address: row.address,
            package_id: row.package_id,
            odp_id: row.odp_id,
            status: (row.status as any) || exists.status
          });
          updatedCount++;
        }
      } else {
        // Add as new
        const firstWord = row.name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        onAddCustomer({
          id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          customer_number: normalized,
          name: row.name,
          nik: row.nik,
          phone: normalized,
          email: row.email,
          address: row.address,
          latitude: -2.9917 + (Math.random() - 0.5) * 0.01,
          longitude: 104.6966 + (Math.random() - 0.5) * 0.01,
          package_id: row.package_id,
          router_id: 'Router-Gambir-01',
          odp_id: row.odp_id,
          marketing_id: 'CSV Importer',
          status: (row.status as any) || 'Aktif',
          pppoe_username: row.pppoe_username || `${firstWord}@starbilling`,
          portal_username: firstWord || 'budi',
          portal_password: `${firstWord}123`,
          ktp_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
          home_photo_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=300',
          created_at: new Date().toISOString().split('T')[0]
        });
        newCount++;
      }
    });

    setImportFeedback(`Import Berhasil Selesai! Summary:
      - ${newCount} Pelanggan Baru Berhasil Ditambahkan
      - ${updatedCount} Pelanggan Existing Diperbarui (Overwrite)
      - ${skippedCount} Baris Dilewati (Skip Duplikasi WhatsApp)`);
    
    // Clear selected file after success
    setSelectedImportFile(null);
  };

  // Interactive Excel CSV Importer actual file parser
  const handleImportCSVSimulation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedImportFile) {
      setImportFeedback('Memproses data sampel (karena belum ada file CSV yang diunggah)...');
      setTimeout(() => {
        const mockImportData = [
          { name: 'Joko Susilo', nik: '3273012345670010', phone: '081223344550', email: 'joko@gmail.com', address: 'Dusun Sukamaju RT 03/05', package_id: 'pkg-1', odp_id: 'odp-2' },
          { name: 'Siti Rahmawati', nik: '3273012345670002', phone: '081398765432', email: 'siti.rahma_updated@yahoo.com', address: 'Alamat Update Via Excel No. 20', package_id: 'pkg-3', odp_id: 'odp-1' }
        ];
        processImportData(mockImportData);
      }, 1000);
      return;
    }

    setImportFeedback(`Membaca berkas ${selectedImportFile.name}...`);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setImportFeedback('Error: Berkas kosong.');
          return;
        }

        const lines = parseCSV(text);
        if (lines.length < 2) {
          setImportFeedback('Error: Berkas CSV harus memiliki minimal satu baris header dan satu baris data.');
          return;
        }

        const headers = lines[0].map(h => h.toLowerCase().trim());
        
        // Dynamic Column Mapper
        const colPhone = headers.findIndex(h => h.includes('nomor') || h.includes('whatsapp') || h.includes('phone') || h.includes('telp') || h.includes('no'));
        const colName = headers.findIndex(h => h.includes('nama') || h.includes('name'));
        const colNik = headers.findIndex(h => h.includes('nik') || h.includes('ktp'));
        const colAddress = headers.findIndex(h => h.includes('alamat') || h.includes('address'));
        const colEmail = headers.findIndex(h => h.includes('email'));
        const colPackage = headers.findIndex(h => h.includes('paket') || h.includes('package'));
        const colOdp = headers.findIndex(h => h.includes('odp'));
        const colPppoe = headers.findIndex(h => h.includes('pppoe') || h.includes('username'));
        const colStatus = headers.findIndex(h => h.includes('status'));

        const parsedRows = lines.slice(1).map((cells) => {
          const rawPhone = colPhone !== -1 && cells[colPhone] ? cells[colPhone] : '';
          const name = colName !== -1 && cells[colName] ? cells[colName] : '';
          const rawNik = colNik !== -1 && cells[colNik] ? cells[colNik] : '';
          const address = colAddress !== -1 && cells[colAddress] ? cells[colAddress] : '';
          const email = colEmail !== -1 && cells[colEmail] ? cells[colEmail] : '';
          const rawPackage = colPackage !== -1 && cells[colPackage] ? cells[colPackage] : '';
          const rawOdp = colOdp !== -1 && cells[colOdp] ? cells[colOdp] : '';
          const pppoe_username = colPppoe !== -1 && cells[colPppoe] ? cells[colPppoe] : '';
          const status = colStatus !== -1 && cells[colStatus] ? cells[colStatus] : 'Aktif';

          // Clean NIK format
          const nik = rawNik ? rawNik.replace(/^'/, '').replace(/[^0-9]/g, '') : '0000000000000000';

          // Package translation
          let package_id = 'pkg-1';
          if (rawPackage) {
            const pMatch = packages.find(p => p.name.toLowerCase() === rawPackage.toLowerCase() || p.id === rawPackage);
            if (pMatch) {
              package_id = pMatch.id;
            } else {
              const fuzzy = packages.find(p => p.name.toLowerCase().includes(rawPackage.toLowerCase()));
              if (fuzzy) package_id = fuzzy.id;
            }
          }

          // ODP translation
          let odp_id = 'odp-1';
          if (rawOdp) {
            const oMatch = odps.find(o => o.name.toLowerCase() === rawOdp.toLowerCase() || o.id === rawOdp);
            if (oMatch) {
              odp_id = oMatch.id;
            } else {
              const fuzzy = odps.find(o => o.name.toLowerCase().includes(rawOdp.toLowerCase()));
              if (fuzzy) odp_id = fuzzy.id;
            }
          }

          return {
            name: name || 'Pelanggan Tanpa Nama',
            nik: nik || '0000000000000000',
            phone: rawPhone || `08${Math.floor(10000000 + Math.random() * 90000000)}`,
            email: email || `${(name || 'cust').toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
            address: address || 'Alamat Belum Diisi',
            package_id,
            odp_id,
            pppoe_username,
            status: status || 'Aktif'
          };
        });

        if (parsedRows.length === 0) {
          setImportFeedback('Error: Tidak ada baris data yang valid.');
          return;
        }

        processImportData(parsedRows);
      } catch (err) {
        setImportFeedback(`Error saat parsing: ${(err as Error).message}`);
      }
    };
    reader.readAsText(selectedImportFile);
  };

  // Download template helper
  const handleDownloadTemplate = () => {
    const headers = 'Nomor Pelanggan (WhatsApp),Nama Pelanggan,NIK KTP,Alamat,Email,Paket Internet,Status\n';
    const sampleRow = '"081234567890","Budi Utomo","3273012345670001","Desa Sumber Rejeki RT 05 RW 02","budi.utomo@gmail.com","Paket Internet 20 Mbps","Aktif"\n';
    const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Import_Pelanggan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock export Excel / CSV download matching production schema
  const handleExportCSV = () => {
    const headers = 'Nomor Pelanggan (WhatsApp),Nama Pelanggan,NIK KTP,Alamat,Email,Paket Internet,PPPoE Username,Status,Tanggal Registrasi\n';
    const rows = filteredCustomers.map(c => {
      const pppoeUser = c.pppoe_username || `${c.name.toLowerCase().replace(/\s+/g, '')}@starbilling`;
      const pkgName = getPackageName(c.package_id);
      return `"${c.customer_number}","${c.name}","'${c.nik}","${c.address.replace(/"/g, '""')}","${c.email}","${pkgName}","${pppoeUser}","${c.status}","${c.created_at}"`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'StarBilling_Database_Pelanggan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPackageName = (id: string) => {
    return packages.find(p => p.id === id)?.name || 'Paket Kustom';
  };

  const getOdpName = (id: string) => {
    return odps.find(o => o.id === id)?.name || 'ODP-NONE';
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Right Settings/TOS buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Pelanggan</h2>
          <p className="text-xs text-slate-400">Pengolahan data pelanggan</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-800"
          >
            <span>⚙ Setting</span>
          </button>
          <button 
            type="button" 
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-800"
          >
            <span>ℹ TOS</span>
          </button>
        </div>
      </div>

      {/* Add Button & Rows Selection bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/20 w-fit"
          >
            <span className="text-sm font-bold">+</span> Tambah Pelanggan
          </button>

          <button
            onClick={() => setIsOnlineRegistrantsOpen(true)}
            className="relative px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 w-fit"
          >
            <span className="text-sm font-bold">✓</span> Pendaftar Online
            {onlineRegistrations.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white font-bold font-mono text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-lg border border-slate-900 animate-bounce">
                {onlineRegistrations.length}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value={10}>Lihat 10 baris</option>
            <option value={25}>Lihat 25 baris</option>
            <option value={50}>Lihat 50 baris</option>
            <option value={100}>Lihat 100 baris</option>
          </select>
        </div>
      </div>

      {/* Grid Filters Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Row 1 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Pencarian</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari Nopel / Nama / Telp / Alamat / Screets / (" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Area / Wilayah</label>
            <select
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA AREA">SEMUA AREA</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.name.toUpperCase()} ({a.type.toUpperCase()})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Status Pelanggan</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA STATUS">SEMUA STATUS</option>
              <option value="AKTIF">AKTIF</option>
              <option value="SUSPEND">SUSPEND</option>
              <option value="NONAKTIF">NONAKTIF</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Isolir</label>
            <select
              value={isolirFilter}
              onChange={(e) => {
                setIsolirFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA">SEMUA</option>
              <option value="YA">YA (SUSPENDED)</option>
              <option value="TIDAK">TIDAK</option>
            </select>
          </div>

          {/* Row 2 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Skema</label>
            <select
              value={skemaFilter}
              onChange={(e) => {
                setSkemaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA SKEMA">SEMUA SKEMA</option>
              <option value="PRABAYAR">PRABAYAR</option>
              <option value="PASCABAYAR">PASCABAYAR</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Foto Rumah</label>
            <select
              value={fotoRumahFilter}
              onChange={(e) => {
                setFotoRumahFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA">SEMUA</option>
              <option value="ADA FOTO">ADA FOTO</option>
              <option value="TIDAK ADA FOTO">TIDAK ADA FOTO</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Routers</label>
            <select
              value={routerFilter}
              onChange={(e) => {
                setRouterFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA ROUTER">SEMUA ROUTER</option>
              <option value="Router-Gambir-01">Router-Gambir-01</option>
              <option value="Router-Dedicated-Core">Router-Dedicated-Core</option>
              <option value="Router-BDG-01">Router-BDG-01</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Paket</label>
            <select
              value={packageFilter}
              onChange={(e) => {
                setPackageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA PAKET">SEMUA PAKET</option>
              {packages.map(p => (
                <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Row 3 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">ODP</label>
            <select
              value={odpFilter}
              onChange={(e) => {
                setOdpFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA ODP">SEMUA ODP</option>
              {odps.map(o => (
                <option key={o.id} value={o.id}>{o.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Marketing / Agen</label>
            <select
              value={marketingFilter}
              onChange={(e) => {
                setMarketingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA MARKETING / AGEN">SEMUA MARKETING / AGEN</option>
              <option value="Asep Marketing">Asep Marketing</option>
              <option value="nextlink">nextlink</option>
              <option value="Excel Importer">Excel Importer</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Filter Tanggal</label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="TANPA FILTER">TANPA FILTER</option>
              <option value="TANGGAL REGISTRASI">TANGGAL REGISTRASI</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Range Tanggal</label>
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }} 
                className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full p-0"
              />
              <span className="text-slate-500 text-xs">-</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }} 
                className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full p-0"
              />
            </div>
          </div>

          {/* Row 4 */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Kota / Kabupaten</label>
            <select
              value={kotaFilter}
              onChange={(e) => {
                setKotaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA KOTA">SEMUA KOTA</option>
              <option value="DKI JAKARTA">DKI JAKARTA</option>
              <option value="BANDUNG">BANDUNG</option>
              <option value="SURABAYA">SURABAYA</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Kecamatan</label>
            <select
              value={kecamatanFilter}
              onChange={(e) => {
                setKecamatanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA KECAMATAN">SEMUA KECAMATAN</option>
              <option value="GAMBIR">GAMBIR</option>
              <option value="MENTENG">MENTENG</option>
              <option value="CIBEUNYING KIDUL">CIBEUNYING KIDUL</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 font-sans">Desa / Kelurahan</label>
            <select
              value={desaFilter}
              onChange={(e) => {
                setDesaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="SEMUA DESA">SEMUA DESA</option>
              <option value="PETOJO SELATAN">PETOJO SELATAN</option>
              <option value="KEBON SIRIH">KEBON SIRIH</option>
              <option value="CICADAS">CICADAS</option>
            </select>
          </div>

          {/* Blank column to balance design */}
          <div className="hidden sm:block"></div>
        </div>

        {/* Row 5: Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                // Flash alert simulating search execution or simply filtering dynamically
                alert(`Mencari data dengan ${filteredCustomers.length} hasil kecocokan!`);
              }}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition uppercase tracking-wider"
            >
              <span>🔍 Cari Data</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition uppercase tracking-wider"
            >
              <span>✖ Reset Filter</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition uppercase tracking-wider"
            >
              <span>📥 Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition uppercase tracking-wider"
            >
              <span>📤 Import CSV</span>
            </button>
          </div>

          {/* Column Toggle Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPopover(!showColumnPopover)}
              className="px-4 py-2 border-2 border-rose-500/80 text-rose-500 hover:bg-rose-500/10 font-bold rounded-xl text-xs flex items-center gap-1.5 transition uppercase tracking-wider"
            >
              <span>📊 Kolom</span>
            </button>
            
            {showColumnPopover && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-950 border border-slate-800 p-3.5 shadow-2xl z-30 space-y-2.5">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider pb-1.5 border-b border-slate-850 flex justify-between items-center">
                  <span>Pilih Kolom Tabel</span>
                  <button onClick={() => setShowColumnPopover(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1">
                  {Object.keys(visibleColumns).map((col) => {
                    const label = col === 'no' ? 'No' :
                                  col === 'act' ? 'Act (Actions)' :
                                  col === 'noPelanggan' ? 'No Pelanggan' :
                                  col === 'nama' ? 'Nama' :
                                  col === 'telp' ? 'Telp' :
                                  col === 'area' ? 'Area' :
                                  col === 'paket' ? 'Paket' :
                                  col === 'total' ? 'Total' :
                                  col === 'jatuhTempo' ? 'Jatuh Tempo' :
                                  col === 'tagihan' ? 'Tagihan' :
                                  col === 'status' ? 'Status' :
                                  col === 'marketing' ? 'Marketing' :
                                  col === 'portalCreds' ? 'Kredensial Portal (User/Pass)' : col;
                    return (
                      <label key={col} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns[col as keyof typeof visibleColumns]}
                          onChange={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col as keyof typeof visibleColumns] }))}
                          className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-950/40 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                {visibleColumns.no && <th className="py-3 px-3 text-center w-12">No</th>}
                {visibleColumns.act && <th className="py-3 px-3 text-center w-28">Act</th>}
                {visibleColumns.noPelanggan && <th className="py-3 px-3">No Pelanggan</th>}
                {visibleColumns.nama && <th className="py-3 px-3">Nama</th>}
                {visibleColumns.telp && <th className="py-3 px-3">Telp</th>}
                {visibleColumns.portalCreds && <th className="py-3 px-3">Kredensial Portal</th>}
                {visibleColumns.area && <th className="py-3 px-3">Area</th>}
                {visibleColumns.paket && <th className="py-3 px-3">Paket</th>}
                {visibleColumns.total && <th className="py-3 px-3">Total</th>}
                {visibleColumns.jatuhTempo && <th className="py-3 px-3">Jatuh Tempo</th>}
                {visibleColumns.tagihan && <th className="py-3 px-3">Tagihan</th>}
                {visibleColumns.status && <th className="py-3 px-3 text-center">Status</th>}
                {visibleColumns.marketing && <th className="py-3 px-3">Marketing</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-16 text-center text-slate-500 font-mono">
                    <AlertTriangle className="w-7 h-7 mx-auto text-amber-500/80 mb-2.5" />
                    <span>Tidak ada data pelanggan yang cocok dengan filter pencarian Anda.</span>
                  </td>
                </tr>
              ) : (
                filteredCustomers
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((cust, index) => {
                    const globalIndex = (currentPage - 1) * pageSize + index + 1;
                    const pkg = packages.find(p => p.id === cust.package_id);
                    const packageName = pkg ? pkg.name : 'Nextlink Home Up to 15 Mbps';
                    const tariffPrice = pkg ? pkg.price : 175000;
                    
                    // Dynamic but stable billing/due date calculations based on WhatsApp/customer number
                    const lastTwoDigits = cust.phone ? (parseInt(cust.phone.slice(-2)) || 10) : 10;
                    const dayVal = (lastTwoDigits % 25) + 1;
                    const dueDateStr = `${dayVal < 10 ? '0' + dayVal : dayVal} Aug 2026`;
                    
                    // Unpaid bills helper
                    const hasUnpaid = cust.status === 'Suspend' || (lastTwoDigits % 3 === 0);
                    const outstandingBill = hasUnpaid ? tariffPrice : 0;
                    
                    // Area lookup fallback
                    const areaObj = areas.find(a => a.id === cust.area_id);
                    const areaName = areaObj ? areaObj.name : 'Gandus';

                    return (
                      <tr key={cust.id} className="hover:bg-slate-950/30 transition text-slate-300">
                        {visibleColumns.no && (
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-500">
                            {globalIndex}
                          </td>
                        )}
                        {visibleColumns.act && (
                          <td className="py-3.5 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => handleOpenView(cust)}
                                className="p-1 bg-sky-600 hover:bg-sky-500 text-white rounded transition flex items-center justify-center"
                                title="Lihat Detail"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleOpenEdit(cust)}
                                className="p-1 bg-amber-500 hover:bg-amber-450 text-slate-950 rounded transition flex items-center justify-center"
                                title="Ubah Data"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => { if(confirm('Apakah Anda yakin ingin menghapus pelanggan: ' + cust.name + '?')) onDeleteCustomer(cust.id); }}
                                className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded transition flex items-center justify-center"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                        {visibleColumns.noPelanggan && (
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-200">
                            <span className="bg-indigo-950/40 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/30 text-[10px]">
                              {cust.customer_number}
                            </span>
                          </td>
                        )}
                        {visibleColumns.nama && (
                          <td className="py-3.5 px-3 font-semibold text-slate-200">
                            {cust.name}
                          </td>
                        )}
                        {visibleColumns.telp && (
                          <td className="py-3.5 px-3">
                            <a 
                              href={`https://wa.me/${cust.phone}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-cyan-400 hover:underline hover:text-cyan-300 font-mono font-semibold"
                            >
                              {cust.phone}
                            </a>
                          </td>
                        )}
                        {visibleColumns.portalCreds && (
                          <td className="py-3.5 px-3 font-mono text-xs">
                            <div className="flex flex-col gap-0.5 leading-normal">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 font-bold">U:</span>
                                <span className="text-slate-200 font-semibold select-all bg-slate-950 px-1 rounded border border-slate-850">{cust.portal_username || cust.name.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 font-bold">P:</span>
                                <span className="text-indigo-400 font-medium select-all bg-slate-950 px-1 rounded border border-slate-850">{cust.portal_password || `${cust.name.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '')}123`}</span>
                              </div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.area && (
                          <td className="py-3.5 px-3 font-medium text-slate-400">
                            {areaName}
                          </td>
                        )}
                        {visibleColumns.paket && (
                          <td className="py-3.5 px-3 font-medium text-indigo-300">
                            {packageName}
                          </td>
                        )}
                        {visibleColumns.total && (
                          <td className="py-3.5 px-3 font-mono font-semibold text-emerald-400">
                            Rp {tariffPrice.toLocaleString('id-ID')}
                          </td>
                        )}
                        {visibleColumns.jatuhTempo && (
                          <td className="py-3.5 px-3 font-mono text-slate-400">
                            {dueDateStr}
                          </td>
                        )}
                        {visibleColumns.tagihan && (
                          <td className={`py-3.5 px-3 font-mono font-bold ${outstandingBill > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                            Rp {outstandingBill.toLocaleString('id-ID')}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="py-3.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-block border ${
                              cust.status === 'Aktif' 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' 
                                : cust.status === 'Suspend'
                                ? 'bg-amber-950/40 text-amber-400 border-amber-900/40'
                                : 'bg-slate-950 text-slate-500 border-slate-800'
                            }`}>
                              {cust.status === 'Aktif' ? 'AKTIF' : cust.status === 'Suspend' ? 'SUSPEND' : 'NONAKTIF'}
                            </span>
                          </td>
                        )}
                        {visibleColumns.marketing && (
                          <td className="py-3.5 px-3 font-sans text-slate-400">
                            {cust.marketing_id || 'nextlink'}
                          </td>
                        )}
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        {filteredCustomers.length > 0 && (
          <div className="bg-slate-950/40 border-t border-slate-850 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400 font-medium">
              Menampilkan <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> s/d{' '}
              <strong className="text-slate-200">{Math.min(currentPage * pageSize, filteredCustomers.length)}</strong> dari{' '}
              <strong className="text-slate-200">{filteredCustomers.length}</strong> data
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 font-medium transition"
              >
                Sebelumnya
              </button>
              
              {Array.from({ length: Math.ceil(filteredCustomers.length / pageSize) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border transition ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= Math.ceil(filteredCustomers.length / pageSize)}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCustomers.length / pageSize)))}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 font-medium transition"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{editingCustomer ? 'Ubah Data Pelanggan' : 'Pendaftaran Pelanggan Baru'}</span>
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-200">
              {/* Row 1: Nama & NIK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Nama Lengkap *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nama sesuai KTP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 text-slate-200 focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Nomor NIK KTP (16 Digit) *</label>
                  <input 
                    type="text" 
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})}
                    placeholder="Contoh: 1601020304050001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200 focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              {/* Row 2: WhatsApp Input with Realtime normalisation badge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">No. WhatsApp Pelanggan *</label>
                  <input 
                    type="text" 
                    required
                    value={rawPhoneInput}
                    onChange={(e) => setRawPhoneInput(e.target.value)}
                    placeholder="Masukkan No WA (contoh: 081112345678)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200 focus:ring-1 focus:ring-cyan-500/20"
                  />
                  {rawPhoneInput && (
                    <div className="mt-1.5 flex flex-col gap-0.5">
                      <span className="text-[10px] font-mono text-cyan-400 block">
                        Auto Normalisasi: <strong className="underline">{liveNormalizedPhone || '...'}</strong>
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        Disimpan sebagai No. Pelanggan &amp; Phone secara identik.
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Alamat Email *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="alamat@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  />
                </div>
              </div>

              {/* Row 3: Alamat */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Alamat Pemasangan Lengkap *</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Isi nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-500 text-slate-200 focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>

              {/* Row 4: Paket, ODP, Status, Wilayah */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Wilayah / Area *</label>
                  <select 
                    value={formData.area_id}
                    onChange={(e) => {
                      const selArea = areas.find(a => a.id === e.target.value);
                      const prefixAddress = selArea ? `${selArea.name}, ` : '';
                      // Append or prepend region selection
                      setFormData({
                        ...formData,
                        area_id: e.target.value,
                        address: prefixAddress + formData.address.replace(/^[A-Za-z\s➔]+,\s*/, '')
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  >
                    <option value="">-- Pilih Wilayah --</option>
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Paket Layanan *</label>
                  <select 
                    value={formData.package_id}
                    onChange={(e) => setFormData({...formData, package_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Assign ODP Port *</label>
                  <select 
                    value={formData.odp_id}
                    onChange={(e) => setFormData({...formData, odp_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  >
                    {odps.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Status Pelanggan</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Suspend">Suspend</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Portal Login Credentials Section */}
              <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl space-y-4">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                  Kredensial Akses Portal Pelanggan
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Portal Username</label>
                    <input 
                      type="text" 
                      value={formData.portal_username}
                      onChange={(e) => setFormData({...formData, portal_username: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                      placeholder="Contoh: budis"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Portal Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
                          let generated = '';
                          for (let i = 0; i < 8; i++) {
                            generated += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          setFormData({ ...formData, portal_password: generated });
                        }}
                        className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold bg-slate-950 hover:bg-slate-900 border border-slate-800 px-2 py-0.5 rounded transition"
                      >
                        <RefreshCw className="w-2.5 h-2.5 text-cyan-400" /> GENERATE (8 Karakter)
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={formData.portal_password}
                      onChange={(e) => setFormData({...formData, portal_password: e.target.value})}
                      placeholder="Contoh: budis123"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Real Browser Image Picker / Document Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2.5">Upload KTP Pelanggan (Max 2MB)</span>
                  <input 
                    type="file" 
                    ref={fileInputKtp}
                    onChange={(e) => handleFileChange(e, 'ktp')}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => fileInputKtp.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" /> Pilih File KTP
                    </button>
                    {ktpPreview && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Terpilih
                      </span>
                    )}
                  </div>
                  {ktpPreview && (
                    <div className="mt-3 relative border border-slate-800 rounded-xl overflow-hidden h-24 bg-black">
                      <img src={ktpPreview} alt="KTP Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setKtpPreview('')}
                        className="absolute right-1 top-1 p-1 bg-slate-950/80 rounded-lg text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2.5">Upload Foto Rumah Pelanggan (Max 2MB)</span>
                  <input 
                    type="file" 
                    ref={fileInputHome}
                    onChange={(e) => handleFileChange(e, 'home')}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => fileInputHome.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" /> Pilih File Rumah
                    </button>
                    {homePreview && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Terpilih
                      </span>
                    )}
                  </div>
                  {homePreview && (
                    <div className="mt-3 relative border border-slate-800 rounded-xl overflow-hidden h-24 bg-black">
                      <img src={homePreview} alt="House Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setHomePreview('')}
                        className="absolute right-1 top-1 p-1 bg-slate-950/80 rounded-lg text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/10"
                >
                  {editingCustomer ? 'Perbarui Pelanggan' : 'Daftarkan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {isViewOpen && viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>DETAIL PELANGGAN:</span>
                <span className="text-cyan-400 font-semibold">{viewingCustomer.customer_number}</span>
              </h3>
              <button onClick={() => setIsViewOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 text-slate-200 overflow-y-auto max-h-[80vh]">
              {/* Profile Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/30 p-4 rounded-xl border border-slate-850">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">NAMA LENGKAP</span>
                  <span className="text-sm font-bold text-white mt-1 block">{viewingCustomer.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">N0. NIK KTP</span>
                  <span className="text-xs font-semibold text-slate-300 mt-1 block font-mono">{viewingCustomer.nik}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">TELEPON / WA</span>
                  <span className="text-xs text-slate-300 mt-1 block font-mono">{viewingCustomer.phone}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">EMAIL</span>
                  <span className="text-xs text-slate-300 mt-1 block font-mono">{viewingCustomer.email}</span>
                </div>
              </div>

              {/* Address Map & ODP Routing */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1.5">ALAMAT PEMASANGAN & KOORDINAT GIS</span>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-slate-300 font-medium">{viewingCustomer.address}</p>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                      Latitude: {viewingCustomer.latitude} | Longitude: {viewingCustomer.longitude}
                    </span>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 rounded border border-slate-700 flex items-center gap-1 transition">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Trace GIS
                  </button>
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">PAKET LAYANAN</span>
                  <span className="text-xs font-semibold text-cyan-400 mt-1 block">{getPackageName(viewingCustomer.package_id)}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">PORT ODP ASSIGNED</span>
                  <span className="text-xs font-semibold text-slate-300 mt-1 block">{getOdpName(viewingCustomer.odp_id)}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">MITRA MARKETING</span>
                  <span className="text-xs font-semibold text-slate-300 mt-1 block">{viewingCustomer.marketing_id}</span>
                </div>
              </div>

              {/* Kredensial PPPoE block */}
              <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">KREDENSIAL PPPoE (AUTO-SYNC MIKROTIK)</span>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <span className="text-xs text-indigo-400 block font-mono font-bold">
                      {viewingCustomer.pppoe_username || `${viewingCustomer.name.toLowerCase().replace(/\s+/g, '')}@starbilling`}
                    </span>
                    <span className="text-[9px] text-slate-500 block">Password: [Tersinkronisasi otomatis]</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-800/60 px-2 py-1 rounded">
                    MIKROTIK SYNCED
                  </span>
                </div>
              </div>

              {/* Kredensial Portal Pelanggan */}
              <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/30 space-y-2">
                <span className="text-[10px] font-mono text-indigo-400 block uppercase font-bold">Kredensial Portal Pelanggan (Untuk Tagihan &amp; Laporan)</span>
                <div className="grid grid-cols-2 gap-4 font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block">USERNAME PORTAL</span>
                    <span className="text-xs text-slate-200 font-bold underline">{viewingCustomer.portal_username || viewingCustomer.name.toLowerCase().split(' ')[0]}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">PASSWORD PORTAL</span>
                    <span className="text-xs text-slate-200 font-bold underline">{viewingCustomer.portal_password || `${viewingCustomer.name.toLowerCase().split(' ')[0]}123`}</span>
                  </div>
                </div>
              </div>

              {/* Foto Uploaded View */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1.5">FOTO KTP PELANGGAN</span>
                  {viewingCustomer.ktp_url ? (
                    <img 
                      src={viewingCustomer.ktp_url} 
                      alt="KTP" 
                      className="w-full h-32 object-cover rounded-lg border border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-32 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-center text-[10px] text-slate-500">Belum terunggah</div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1.5">FOTO RUMAH PELANGGAN</span>
                  {viewingCustomer.home_photo_url ? (
                    <img 
                      src={viewingCustomer.home_photo_url} 
                      alt="Rumah" 
                      className="w-full h-32 object-cover rounded-lg border border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-32 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-center text-[10px] text-slate-500">Belum terunggah</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button 
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel / CSV Import Modal Dialog */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileUp className="w-4 h-4 text-emerald-400" />
                <span>Wizard Import Excel</span>
              </h3>
              <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportCSVSimulation} className="p-6 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    1. Pilih Berkas Database (.csv)
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 uppercase"
                  >
                    📥 Unduh Template CSV
                  </button>
                </div>
                <div 
                  onClick={() => document.getElementById('csv-file-uploader')?.click()}
                  className="border border-dashed border-slate-750 bg-slate-950/40 rounded-2xl p-6 text-center hover:bg-slate-950/80 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                  <span className="text-xs text-slate-300 block font-semibold">
                    {selectedImportFile ? selectedImportFile.name : 'Tarik Berkas ke Sini'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {selectedImportFile 
                      ? `${(selectedImportFile.size / 1024).toFixed(1)} KB - Klik untuk mengganti` 
                      : 'Atau klik untuk memilih secara manual'}
                  </span>
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    id="csv-file-uploader" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedImportFile(file);
                        setImportFeedback(`Berkas dipilih: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Klik "Import Sekarang" untuk memproses.`);
                      }
                    }} 
                  />
                  {!selectedImportFile && (
                    <button type="button" className="mt-3 px-3 py-1 bg-slate-800 text-slate-400 text-[10px] rounded hover:text-slate-200">
                      Pilih File
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  2. Jika No. WhatsApp Sudah Ada (Duplikat) *
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="importStrategy"
                      checked={importStrategy === 'skip'} 
                      onChange={() => setImportStrategy('skip')}
                      className="mt-0.5 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-950 border-slate-800" 
                    />
                    <div>
                      <strong className="block text-slate-200 font-bold">Skip Data</strong>
                      <span className="text-[10px] text-slate-500">Lewati baris Excel jika nomor WA/Phone sudah terdaftar.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="importStrategy"
                      checked={importStrategy === 'overwrite'} 
                      onChange={() => setImportStrategy('overwrite')}
                      className="mt-0.5 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-950 border-slate-800" 
                    />
                    <div>
                      <strong className="block text-slate-200 font-bold">Overwrite Data</strong>
                      <span className="text-[10px] text-slate-500">Perbarui (Update) data pelanggan existing dengan data Excel baru.</span>
                    </div>
                  </label>
                </div>
              </div>

              {importFeedback && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-400 whitespace-pre-line">
                  {importFeedback}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsImportOpen(false)} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Import Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic PDF Report Viewer Modal */}
      {isPdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-rose-400" />
                <span>PDF Laporan Registrasi Pelanggan Aktif</span>
              </h3>
              <button onClick={() => setIsPdfOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-white text-slate-900 flex-1" id="pdf-report-print">
              {/* PDF Header */}
              <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center space-y-1">
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">PT STARBILLING MEDIA NUSANTARA</h1>
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Gedung Cyber 1 Lt. 3, Jl. Kuningan Barat No. 8, Jakarta Selatan</p>
                <p className="text-xs font-semibold text-slate-800">Daftar Registrasi Pelanggan Aktif ISP - StarBilling NOC</p>
                <span className="text-[9px] font-mono text-slate-500 block">Dibuat: {new Date().toLocaleString('id-ID')} | Operator: Administrator Suite</span>
              </div>

              {/* PDF Table */}
              <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 uppercase font-mono text-[9px] font-bold">
                    <th className="py-2.5 px-3 border border-slate-300">No. Pelanggan (WA)</th>
                    <th className="py-2.5 px-3 border border-slate-300">Nama Pelanggan</th>
                    <th className="py-2.5 px-3 border border-slate-300">NIK KTP</th>
                    <th className="py-2.5 px-3 border border-slate-300">Alamat Lengkap</th>
                    <th className="py-2.5 px-3 border border-slate-300">Paket Internet</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCustomers.map(c => (
                    <tr key={c.id}>
                      <td className="py-2 px-3 font-mono border border-slate-300 font-bold">{c.customer_number}</td>
                      <td className="py-2 px-3 border border-slate-300 font-semibold">{c.name}</td>
                      <td className="py-2 px-3 font-mono border border-slate-300">{c.nik}</td>
                      <td className="py-2 px-3 border border-slate-300 text-slate-700">{c.address}</td>
                      <td className="py-2 px-3 border border-slate-300 font-medium text-indigo-900">{getPackageName(c.package_id)}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center uppercase font-mono font-bold text-[9px] text-emerald-700">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PDF Footer signatures */}
              <div className="flex justify-between mt-12 pt-6">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block">Diverifikasi Oleh,</span>
                  <div className="h-16" />
                  <span className="text-[11px] font-bold text-slate-900 block border-t border-slate-400 pt-1 w-40 mx-auto">Finance Controller</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block">Disetujui Oleh,</span>
                  <div className="h-16" />
                  <span className="text-[11px] font-bold text-slate-900 block border-t border-slate-400 pt-1 w-40 mx-auto">NOC Team Lead</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-2">
              <button 
                onClick={() => setIsPdfOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs"
              >
                Tutup
              </button>
              <button 
                onClick={() => window.print()}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                Cetak PDF Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Registrations Review & Verification Modal */}
      {isOnlineRegistrantsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Daftar Pelanggan Pendaftar Online</span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {onlineRegistrations.length} Pendaftar
                </span>
              </h3>
              <button onClick={() => setIsOnlineRegistrantsOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {onlineRegistrations.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="inline-flex p-4 bg-slate-950 rounded-2xl border border-slate-800 text-slate-500">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-300">Tidak ada pendaftar online baru</h4>
                    <p className="text-xs text-slate-500 mt-1">Semua pendaftar dari portal pelanggan sudah selesai diverifikasi atau ditolak.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onlineRegistrations.map((reg) => (
                    <div key={reg.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-emerald-800/40 transition gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500">NAMA LENGKAP</span>
                            <h4 className="text-sm font-bold text-slate-200">{reg.name}</h4>
                          </div>
                          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                            Menunggu Verifikasi
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 block">NO. WHATSAPP</span>
                            <span className="font-mono font-semibold text-slate-300">{reg.phone}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 block">NIK KTP</span>
                            <span className="font-mono text-slate-300">{reg.nik || '-'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[9px] font-mono text-slate-500 block">PAKET PILIHAN</span>
                            <span className="font-medium text-emerald-400">{getPackageName(reg.package_id)}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[9px] font-mono text-slate-500 block">ALAMAT PEMASANGAN</span>
                            <span className="text-slate-400 font-medium">{reg.address}</span>
                            {reg.latitude && reg.longitude && (
                              <div className="text-[9px] font-mono text-slate-500 mt-1">
                                Coordinates: <span className="text-cyan-400">{reg.latitude}, {reg.longitude}</span>
                              </div>
                            )}
                            {reg.maps_link && (
                              <a 
                                href={reg.maps_link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[9px] font-mono text-indigo-400 hover:underline block mt-0.5 truncate"
                              >
                                Link Google Maps: {reg.maps_link}
                              </a>
                            )}
                          </div>
                          
                          {/* Sales / Agent */}
                          <div className="col-span-2">
                            <span className="text-[9px] font-mono text-slate-500 block">SALES / AGEN REFERENSI</span>
                            <span className="font-semibold text-slate-300 text-xs">
                              {reg.agent_name || reg.marketing_id || 'Portal Online'}
                            </span>
                          </div>

                          {/* Previews of KTP & House Photo */}
                          <div className="col-span-2 grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <span className="text-[8px] font-mono text-slate-500 block mb-0.5">FOTO KTP</span>
                              {reg.ktp_url ? (
                                <img 
                                  src={reg.ktp_url} 
                                  alt="KTP" 
                                  className="w-full h-16 object-cover rounded border border-slate-800"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="h-16 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-[8px] text-slate-600">Tidak ada foto KTP</div>
                              )}
                            </div>
                            <div>
                              <span className="text-[8px] font-mono text-slate-500 block mb-0.5">FOTO RUMAH</span>
                              {reg.home_photo_url ? (
                                <img 
                                  src={reg.home_photo_url} 
                                  alt="Rumah" 
                                  className="w-full h-16 object-cover rounded border border-slate-800"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="h-16 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-[8px] text-slate-600">Tidak ada foto rumah</div>
                              )}
                            </div>
                          </div>

                          <div className="col-span-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800 grid grid-cols-2 gap-1.5 mt-1">
                            <div>
                              <span className="text-[8px] font-mono text-slate-500 block">PORTAL USERNAME</span>
                              <span className="font-mono text-[10px] font-bold text-slate-300 underline">{reg.portal_username || '-'}</span>
                            </div>
                            <div>
                              <span className="text-[8px] font-mono text-slate-500 block">PORTAL PASSWORD</span>
                              <span className="font-mono text-[10px] font-bold text-slate-300 underline">{reg.portal_password || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleRejectOnlineRegistrant(reg.id)}
                          className="flex-1 py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 text-xs font-bold rounded-xl border border-rose-900/30 transition flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Tolak
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyOnlineRegistrant(reg)}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
                        >
                          <Check className="w-3.5 h-3.5 font-bold" /> Verifikasi & Aktifkan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button 
                onClick={() => setIsOnlineRegistrantsOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
