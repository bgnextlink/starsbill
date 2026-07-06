/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Customer {
  id: string;
  customer_number: string;
  name: string;
  nik: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  package_id: string;
  router_id: string;
  odp_id: string;
  marketing_id: string;
  status: 'Aktif' | 'Suspend' | 'Nonaktif';
  area_id?: string;
  ktp_url?: string;
  home_photo_url?: string;
  pppoe_username?: string;
  portal_username?: string;
  portal_password?: string;
  agent_name?: string;
  maps_link?: string;
  created_at: string;
  tanggal_pemasangan?: string;
  tanggal_aktif?: string;
  tanggal_aktif_mengikuti_pemasangan?: boolean;
}

export interface Area {
  id: string;
  name: string;
  type: 'City' | 'District' | 'Village';
  parent_id?: string;
  allow_upgrade_downgrade?: boolean;
  payment_gateway?: string;
}

export interface Odp {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  used_port: number;
  available_port: number;
  router_name?: string;
  remarks?: string;
}

export interface InternetPackage {
  id: string;
  name: string;
  download_speed: string;
  upload_speed: string;
  price: number;
  description: string;
  fup_limit?: string;
  status?: 'Aktif' | 'Nonaktif';
  speed_mbps?: number;
  allow_upgrade?: boolean;
  allow_register?: boolean;
  base_price?: number;
  ppn_percent?: number;
  commission?: number;
  router_id?: string;
  mikrotik_profile?: string;
  allowed_areas?: string[];
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  amount: number;
  due_date: string;
  status: 'Lunas' | 'Belum Bayar' | 'Overdue' | 'Suspend';
  paid_date?: string;
  payment_method?: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  customer_id: string;
  title: string;
  category: 'Internet Lambat' | 'LOS / Kabel Putus' | 'RTRW Net Redaman Tinggi' | 'Ganti Password Wi-Fi' | 'Registrasi / Aktivasi';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Assigned' | 'Progress' | 'Solved' | 'Closed';
  assignee?: string;
  description: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'Pemasukan' | 'Pengeluaran';
  category: 'Iuran Bulanan' | 'Biaya Instalasi' | 'Gaji Karyawan' | 'Beli Alat / Fiber Optic' | 'Sewa Bandwidth' | 'Operasional';
  amount: number;
  payment_method: string;
  reference_no?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  supplier: string;
  category: 'ONT' | 'OLT' | 'SFP' | 'Kabel Dropcore' | 'Patchcord' | 'Spliter' | 'HTB';
  price: number;
  created_at: string;
}

export interface WaDevice {
  id: string;
  name: string;
  number: string;
  status: 'Connected' | 'Disconnected' | 'Authenticating';
  session_name: string;
  platform: 'Evolution API' | 'WAHA' | 'Go WhatsApp' | 'Fonte';
}

export interface WaMessage {
  id: string;
  device_id: string;
  recipient: string;
  message: string;
  type: 'Billing Reminder' | 'Broadcast' | 'Notification' | 'OTP';
  status: 'Sent' | 'Failed' | 'Pending';
  created_at: string;
}

export interface CodeFile {
  name: string;
  path: string;
  language: string;
  code: string;
  description: string;
}

export interface CodeGroup {
  id: string;
  title: string;
  files: CodeFile[];
}
