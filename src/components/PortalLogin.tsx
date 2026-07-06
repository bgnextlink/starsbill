/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Customer, InternetPackage } from '../types';
import { normalizePhoneNumber } from '../App';
import { 
  Phone, 
  ArrowRight, 
  UserCheck, 
  ShieldAlert, 
  Wifi, 
  Lock, 
  User, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Shield, 
  Terminal,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  FileText,
  Mail,
  MapPin,
  FileCheck,
  Camera,
  Upload,
  X,
  Map,
  Image
} from 'lucide-react';

interface PortalLoginProps {
  customers: Customer[];
  packages?: InternetPackage[];
  onSendWhatsapp?: (recipient: string, message: string, type: string) => void;
  onAddOnlineRegistration?: (newReg: Customer) => void;
  onLoginSuccess: (customer: Customer) => void;
}

// Generate random math challenge to prevent bot spam
function generateMathCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 2;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return {
    q: `${num1} + ${num2}`,
    answer: num1 + num2
  };
}

export default function PortalLogin({ customers, packages, onSendWhatsapp, onAddOnlineRegistration, onLoginSuccess }: PortalLoginProps) {
  // Input fields
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot password flow
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPhoneInput, setForgotPhoneInput] = useState('');
  const [captchaChallenge, setCaptchaChallenge] = useState(generateMathCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');

  // Online Registration fields
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPackageId, setRegPackageId] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMapsLink, setRegMapsLink] = useState('');
  const [regAgentName, setRegAgentName] = useState('');
  const [regKtpPhoto, setRegKtpPhoto] = useState('');
  const [regHomePhoto, setRegHomePhoto] = useState('');
  const [regLat, setRegLat] = useState(-2.9917);
  const [regLng, setRegLng] = useState(104.6966);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [activeCameraType, setActiveCameraType] = useState<'ktp' | 'home' | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Parse coordinates from Google Maps Link
  const handleMapsLinkChange = (link: string) => {
    setRegMapsLink(link);
    const coordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = link.match(coordRegex);
    if (match) {
      setRegLat(parseFloat(match[1]));
      setRegLng(parseFloat(match[2]));
    } else {
      const altRegex = /place\/(-?\d+\.\d+),(-?\d+\.\d+)/;
      const altMatch = link.match(altRegex);
      if (altMatch) {
        setRegLat(parseFloat(altMatch[1]));
        setRegLng(parseFloat(altMatch[2]));
      }
    }
  };

  // Start live camera
  const startCamera = async (type: 'ktp' | 'home') => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setActiveCameraType(type);
      setErrorMsg(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMsg("Gagal mengakses kamera. Silakan pilih dari file atau izinkan akses kamera browser Anda.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setActiveCameraType(null);
  };

  // Capture frame from stream
  const capturePhoto = () => {
    const video = document.getElementById('webcam-feed') as HTMLVideoElement | null;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        if (activeCameraType === 'ktp') {
          setRegKtpPhoto(dataUrl);
        } else if (activeCameraType === 'home') {
          setRegHomePhoto(dataUrl);
        }
      }
    }
    stopCamera();
  };

  // File Upload to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'home') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Ukuran file foto tidak boleh melebihi 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'ktp') {
            setRegKtpPhoto(reader.result);
          } else {
            setRegHomePhoto(reader.result);
          }
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Set default package when package list is available
  useEffect(() => {
    if (packages && packages.length > 0 && !regPackageId) {
      setRegPackageId(packages[0].id);
    }
  }, [packages]);

  // Handler for name change to auto-fill username & password draft
  const handleRegNameChange = (val: string) => {
    setRegName(val);
    const firstWord = val.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
    if (firstWord) {
      setRegUsername(firstWord);
      setRegPassword(`${firstWord}123`);
    } else {
      setRegUsername('');
      setRegPassword('');
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRegPassword(pass);
  };

  // Status messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Security & Brute-force state (Stored in LocalStorage to persist refreshes)
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('sb_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lockoutExpiry, setLockoutExpiry] = useState<number>(() => {
    const saved = localStorage.getItem('sb_lockout_expiry');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastRecoveryTime, setLastRecoveryTime] = useState<number>(() => {
    const saved = localStorage.getItem('sb_last_recovery_time');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Timers
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [recoveryCooldown, setRecoveryCooldown] = useState(0);

  // Cool down calculations
  useEffect(() => {
    const checkTimers = () => {
      const now = Date.now();
      
      // Calculate lockout time remaining
      if (lockoutExpiry > now) {
        setLockoutTimer(Math.ceil((lockoutExpiry - now) / 1000));
      } else {
        setLockoutTimer(0);
        if (lockoutExpiry > 0) {
          // Clear lockout once expired
          localStorage.removeItem('sb_lockout_expiry');
          localStorage.removeItem('sb_failed_attempts');
          setFailedAttempts(0);
          setLockoutExpiry(0);
        }
      }

      // Calculate recovery cooldown remaining
      const timeSinceLastRec = now - lastRecoveryTime;
      const cooldownPeriod = 60000; // 60 seconds rate limit
      if (timeSinceLastRec < cooldownPeriod) {
        setRecoveryCooldown(Math.ceil((cooldownPeriod - timeSinceLastRec) / 1000));
      } else {
        setRecoveryCooldown(0);
      }
    };

    checkTimers();
    const interval = setInterval(checkTimers, 1000);
    return () => clearInterval(interval);
  }, [lockoutExpiry, lastRecoveryTime]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regPhone.trim() || !regAddress.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMsg('Harap lengkapi seluruh kolom wajib pendaftaran (Nama, No. WA, Alamat, Username, Password).');
      return;
    }

    // Check if username already exists in real customers
    const usernameTaken = customers.some(c => c.portal_username?.toLowerCase() === regUsername.toLowerCase().trim());
    if (usernameTaken) {
      setErrorMsg('Portal Username sudah digunakan oleh pelanggan lain. Silakan pilih username lain.');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(regPhone);
    if (!normalizedPhone) {
      setErrorMsg('Format nomor WhatsApp tidak valid.');
      return;
    }

    // Generate online registration customer object
    const newRegCustomer: Customer = {
      id: `reg-${Date.now()}`,
      customer_number: normalizedPhone, // No. Pelanggan temp = phone
      name: regName.trim(),
      nik: regNik.trim() || '-',
      phone: normalizedPhone,
      email: regEmail.trim() || '-',
      address: regAddress.trim(),
      latitude: regLat,
      longitude: regLng,
      package_id: regPackageId || (packages && packages[0]?.id) || 'pkg-1',
      router_id: 'Router-Gambir-01', // Default
      odp_id: 'odp-1', // Default
      marketing_id: regAgentName.trim() || 'Portal Online',
      status: 'Nonaktif', // Start as nonaktif until approved
      pppoe_username: `${regName.toLowerCase().replace(/[^a-z0-9]/g, '')}@starbilling`,
      portal_username: regUsername.toLowerCase().trim(),
      portal_password: regPassword.trim(),
      ktp_url: regKtpPhoto || undefined,
      home_photo_url: regHomePhoto || undefined,
      agent_name: regAgentName.trim() || undefined,
      maps_link: regMapsLink.trim() || undefined,
      created_at: new Date().toISOString().split('T')[0]
    };

    if (onAddOnlineRegistration) {
      onAddOnlineRegistration(newRegCustomer);
    }

    // Send optional WhatsApp notification
    if (onSendWhatsapp) {
      const msg = `*[STARBILLING.lokal - PENDAFTARAN ONLINE]*\n\nHalo Kak *${regName.trim()}*,\n\nTerima kasih telah mendaftar layanan internet StarBilling secara online!\n\nBerikut data akun portal Anda:\n• *Username*: ${regUsername.toLowerCase().trim()}\n• *Password*: ${regPassword.trim()}\n• *Status*: *Menunggu Verifikasi Admin*\n\nTim admin kami akan segera melakukan survei wilayah dan pemasangan perangkat.`;
      onSendWhatsapp(normalizedPhone, msg, 'OTP');
    }

    setSuccessMsg('Pendaftaran Online Sukses! Data Anda telah masuk ke sistem dan sedang diverifikasi oleh tim Admin. Silakan tunggu konfirmasi kami.');
    
    // Clear inputs
    setRegName('');
    setRegPhone('');
    setRegEmail('');
    setRegNik('');
    setRegAddress('');
    setRegUsername('');
    setRegPassword('');
    setRegMapsLink('');
    setRegAgentName('');
    setRegKtpPhoto('');
    setRegHomePhoto('');
    setRegLat(-2.9917);
    setRegLng(104.6966);
    setIsRegisterMode(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Check if currently locked out
    if (lockoutTimer > 0) {
      setErrorMsg(`Sistem Dikunci Sementara: Silakan tunggu ${lockoutTimer} detik untuk meredakan resiko brute force.`);
      return;
    }

    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Silakan masukkan Username dan Password Anda.');
      return;
    }

    // 2. Search for customer
    const matched = customers.find(c => {
      const userLower = c.portal_username?.toLowerCase() || '';
      const phoneClean = normalizePhoneNumber(c.phone);
      const custNumLower = c.customer_number?.toLowerCase() || '';
      
      return (
        userLower === cleanUsername || 
        phoneClean === cleanUsername || 
        custNumLower === cleanUsername
      );
    });

    if (matched) {
      const actualPassword = matched.portal_password || '12345678';
      
      if (actualPassword === cleanPassword) {
        if (matched.status === 'Nonaktif') {
          setErrorMsg('Akses Ditolak: Status keanggotaan Anda Nonaktif. Hubungi tim admin StarBilling.');
          return;
        }

        // Reset security counters on success
        localStorage.removeItem('sb_failed_attempts');
        localStorage.removeItem('sb_lockout_expiry');
        setFailedAttempts(0);
        setLockoutExpiry(0);

        onLoginSuccess(matched);
      } else {
        handleFailedAttempt();
      }
    } else {
      handleFailedAttempt();
    }
  };

  const handleFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    localStorage.setItem('sb_failed_attempts', nextAttempts.toString());

    if (nextAttempts >= 3) {
      // Lockout for 60 seconds
      const expiry = Date.now() + 60000;
      setLockoutExpiry(expiry);
      localStorage.setItem('sb_lockout_expiry', expiry.toString());
      setErrorMsg(`Kata sandi salah! Akun Anda dikunci sementara selama 60 detik untuk mendeteksi brute-force.`);
    } else {
      setErrorMsg(`Gagal Masuk: Username atau Password salah! Sisa percobaan sebelum diblokir: ${3 - nextAttempts}.`);
    }
  };

  // Handle retrieval of password (Forgot password flow)
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Check recovery cooldown
    if (recoveryCooldown > 0) {
      setErrorMsg(`Batasi Frekuensi: Anda harus menunggu ${recoveryCooldown} detik sebelum meminta pemulihan baru.`);
      return;
    }

    // 1. Verify CAPTCHA Challenge
    if (parseInt(captchaInput, 10) !== captchaChallenge.answer) {
      setErrorMsg('Kode Keamanan (CAPTCHA) salah! Silakan hitung kembali.');
      setCaptchaChallenge(generateMathCaptcha());
      setCaptchaInput('');
      return;
    }

    const targetPhone = normalizePhoneNumber(forgotPhoneInput);
    if (!targetPhone) {
      setErrorMsg('Silakan masukkan nomor WhatsApp Anda yang terdaftar.');
      return;
    }

    // 2. Find customer matching phone
    const matched = customers.find(c => normalizePhoneNumber(c.phone) === targetPhone);

    if (matched) {
      const username = matched.portal_username || 'budi';
      const password = matched.portal_password || '12345678';

      // 3. Dispatch WhatsApp Notification
      if (onSendWhatsapp) {
        const waMsg = `*[STARBILLING.lokal - PEMULIHAN AKUN PORTAL]*\n\nHalo Kak *${matched.name}*,\n\nBerikut adalah data kredensial masuk Portal Pelanggan Anda yang aman:\n\n• *Username*: ${username}\n• *Kata Sandi*: ${password}\n\nHarap simpan kredensial ini baik-baik dan ganti segera jika Anda merasa sandi Anda tidak aman.\n\nSistem Keamanan StarBilling.`;
        onSendWhatsapp(matched.phone, waMsg, 'OTP');
      }

      // Record successful recovery to prevent spamming
      const now = Date.now();
      setLastRecoveryTime(now);
      localStorage.setItem('sb_last_recovery_time', now.toString());

      setSuccessMsg(`Sukses! Informasi Username & Password telah dikirimkan secara otomatis via WhatsApp API ke nomor ${targetPhone}.`);
      setForgotPhoneInput('');
      setCaptchaInput('');
      setCaptchaChallenge(generateMathCaptcha());
    } else {
      // Still enforce cooldown to prevent scanning registered numbers!
      const now = Date.now();
      setLastRecoveryTime(now);
      localStorage.setItem('sb_last_recovery_time', now.toString());
      
      setErrorMsg(`Nomor WhatsApp tersebut tidak terdaftar di database pelanggan kami.`);
      setCaptchaChallenge(generateMathCaptcha());
      setCaptchaInput('');
    }
  };

  return (
    <div id="portal-login-card" className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
      
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
          <Wifi className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">StarBilling Portal Pelanggan</h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegisterMode
              ? 'Form pendaftaran mandiri pelanggan online baru'
              : isForgotPasswordMode 
              ? 'Form pemulihan kredensial via integrasi gateway WhatsApp'
              : 'Silakan masuk menggunakan Username & Sandi terdaftar Anda'}
          </p>
        </div>
      </div>

      {/* RENDER REGISTER MODE */}
      {isRegisterMode ? (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
              Nama Lengkap *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input 
                type="text"
                required
                value={regName}
                onChange={(e) => handleRegNameChange(e.target.value)}
                placeholder="Contoh: Budi Susanto"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
                No. WhatsApp *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => {
                    setRegPhone(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
                NIK (KTP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text"
                  value={regNik}
                  onChange={(e) => {
                    setRegNik(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="3201..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email"
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Contoh: budi@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
              Pilih Paket Internet *
            </label>
            <select
              required
              value={regPackageId}
              onChange={(e) => setRegPackageId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            >
              {packages?.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.download_speed}) - Rp {pkg.price.toLocaleString('id-ID')}/bln
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
              Alamat Pemasangan Lengkap *
            </label>
            <div className="relative mb-3">
              <span className="absolute left-4 top-3 text-slate-500">
                <MapPin className="w-4 h-4" />
              </span>
              <textarea 
                required
                rows={2}
                value={regAddress}
                onChange={(e) => {
                  setRegAddress(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Jl. Merdeka No. 12, RT 02/RW 03, Kel. Sukamaju..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                    showMapPicker 
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  {showMapPicker ? 'Sembunyikan Peta' : 'Pilih dari Peta'}
                </button>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-850 flex flex-col justify-center text-center">
                  <span>Lat: {regLat.toFixed(4)}</span>
                  <span>Lng: {regLng.toFixed(4)}</span>
                </div>
              </div>

              {/* Simulated Map Picker Widget */}
              {showMapPicker && (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">INTERACTIVE COVERAGE MAP PICKER</span>
                    <button 
                      type="button" 
                      onClick={() => setShowMapPicker(false)}
                      className="text-slate-500 hover:text-slate-300 text-[10px] font-bold"
                    >
                      TUTUP
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Klik di mana saja pada peta simulasi wilayah coverage StarBilling Palembang ini untuk melacak dan memasang koordinat Anda secara tepat.
                  </p>
                  
                  <div 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const relativeLat = -2.9917 - ((y / rect.height) - 0.5) * 0.05;
                      const relativeLng = 104.6966 + ((x / rect.width) - 0.5) * 0.05;
                      setRegLat(Number(relativeLat.toFixed(6)));
                      setRegLng(Number(relativeLng.toFixed(6)));
                    }}
                    className="relative h-44 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-crosshair select-none bg-cover bg-center"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')`, backgroundBlendMode: 'overlay', backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
                  >
                    <div className="absolute inset-0 bg-grid-slate-900/10 pointer-events-none opacity-20" />
                    <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none text-[8px] font-mono text-slate-500">
                      <div className="flex justify-between">
                        <span>SEKTOR BARAT</span>
                        <span>SEKTOR TIMUR</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LAT: -2.9667</span>
                        <span>LNG: 104.7216</span>
                      </div>
                    </div>

                    {/* Palembang Office Center Indicator */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full animate-ping absolute" />
                      <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full border border-slate-950 z-10" />
                      <span className="text-[7px] font-mono text-cyan-400 bg-slate-950/80 px-1 py-0.5 rounded border border-cyan-500/20 mt-1 font-bold">PUSAT NOC</span>
                    </div>

                    {/* Selected Pin */}
                    <div 
                      className="absolute pointer-events-none flex flex-col items-center -translate-x-1/2 -translate-y-full"
                      style={{
                        left: `${((regLng - 104.6966) / 0.05 + 0.5) * 100}%`,
                        top: `${(0.5 - (regLat - (-2.9917)) / 0.05) * 100}%`,
                      }}
                    >
                      <div className="w-3.5 h-3.5 bg-rose-500 rounded-full animate-pulse absolute" />
                      <MapPin className="w-5 h-5 text-rose-500 drop-shadow-md z-10" />
                      <span className="text-[7px] font-mono text-rose-400 bg-slate-950 px-1 py-0.5 rounded border border-rose-500/30 font-bold whitespace-nowrap mt-0.5">TITIK RUMAH</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                  Atau Paste Link Google Maps dari Handphone
                </label>
                <input 
                  type="text"
                  value={regMapsLink}
                  onChange={(e) => handleMapsLinkChange(e.target.value)}
                  placeholder="Contoh: https://maps.app.goo.gl/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                />
                {regMapsLink && regLat !== -2.9917 && (
                  <span className="text-[9px] text-emerald-400 font-mono mt-1 block">
                    ✓ Koordinat terdeteksi dari link Google Maps!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Live Document Capture & Photo Section */}
          <div className="grid grid-cols-2 gap-3.5 pt-1.5">
            {/* KTP Section */}
            <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2 text-left">
              <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">FOTO KTP PELANGGAN</span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => startCamera('ktp')}
                  className="w-full py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
                >
                  <Camera className="w-3.5 h-3.5" /> Kamera Live
                </button>
                <label className="w-full py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" /> Upload File
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'ktp')} 
                    className="hidden" 
                  />
                </label>
              </div>
              {regKtpPhoto ? (
                <div className="relative h-16 rounded-lg overflow-hidden border border-slate-800 bg-black">
                  <img src={regKtpPhoto} alt="KTP Captured" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setRegKtpPhoto('')}
                    className="absolute right-1 top-1 p-0.5 bg-slate-950/80 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="h-16 rounded-lg border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-[8px] text-slate-500">
                  <Image className="w-4 h-4 text-slate-600 mb-1" />
                  Belum Ada Foto
                </div>
              )}
            </div>

            {/* Rumah Section */}
            <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2 text-left">
              <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">FOTO LOKASI RUMAH</span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => startCamera('home')}
                  className="w-full py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
                >
                  <Camera className="w-3.5 h-3.5" /> Kamera Live
                </button>
                <label className="w-full py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" /> Upload File
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'home')} 
                    className="hidden" 
                  />
                </label>
              </div>
              {regHomePhoto ? (
                <div className="relative h-16 rounded-lg overflow-hidden border border-slate-800 bg-black">
                  <img src={regHomePhoto} alt="Home Captured" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setRegHomePhoto('')}
                    className="absolute right-1 top-1 p-0.5 bg-slate-950/80 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="h-16 rounded-lg border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-[8px] text-slate-500">
                  <Image className="w-4 h-4 text-slate-600 mb-1" />
                  Belum Ada Foto
                </div>
              )}
            </div>
          </div>

          {/* Camera Overlay Modal */}
          {activeCameraType && (
            <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Live Kamera: {activeCameraType === 'ktp' ? 'KTP Pelanggan' : 'Lokasi Rumah'}
                  </span>
                  <button type="button" onClick={stopCamera} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 bg-black relative aspect-video flex items-center justify-center overflow-hidden">
                  <video 
                    id="webcam-feed" 
                    autoPlay 
                    playsInline 
                    ref={(ref) => {
                      if (ref && cameraStream) {
                        ref.srcObject = cameraStream;
                      }
                    }}
                    className="w-full h-full object-cover" 
                  />
                  {activeCameraType === 'ktp' && (
                    <div className="absolute inset-x-6 inset-y-8 border-2 border-dashed border-emerald-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                      <span className="text-[8px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Framing KTP Anda</span>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-slate-800 flex gap-3 bg-slate-950/40">
                  <button 
                    type="button" 
                    onClick={stopCamera}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    onClick={capturePhoto}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" /> Ambil Foto
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sales or Agency Representative Field */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">
              Nama Sales atau Agen Referensi (Opsional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500">
                <UserCheck className="w-4 h-4" />
              </span>
              <input 
                type="text"
                value={regAgentName}
                onChange={(e) => setRegAgentName(e.target.value)}
                placeholder="Contoh: Asep Sales, Agen Sriwijaya..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl space-y-3.5">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              Tentukan Kredensial Akses Portal Pelanggan
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">Portal Username *</label>
                <input 
                  type="text" 
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="Username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-200"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Password *</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[8px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 font-bold"
                  >
                    <RefreshCw className="w-2 h-2" /> GEN (8 Karakter)
                  </button>
                </div>
                <input 
                  type="text" 
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Sandi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-200"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/30 text-rose-300 text-xs rounded-xl flex gap-2 items-start animate-fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-xs rounded-xl flex gap-2.5 items-start animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs border border-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              Kirim Daftar Online
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : isForgotPasswordMode ? (
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
          <div className="bg-slate-950/60 border border-amber-900/20 p-3.5 rounded-2xl text-[11px] text-amber-300 leading-relaxed flex gap-2.5">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Keamanan Anti-Spam Aktif:</strong>
              <p className="mt-0.5">Sistem membatasi permintaan pemulihan kata sandi (maks 1x per 60 detik) untuk mencegah spamming iseng orang lain.</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Nomor WhatsApp Terdaftar
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500">
                <Phone className="w-4 h-4" />
              </span>
              <input 
                type="text"
                required
                value={forgotPhoneInput}
                onChange={(e) => {
                  setForgotPhoneInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Contoh: 081234567890"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Verification Challenge */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Tantangan Kemanusiaan (Anti-Bot)
              </span>
              <button
                type="button"
                onClick={() => setCaptchaChallenge(generateMathCaptcha())}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Ganti Soal
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-center text-sm font-bold font-mono text-white">
                {captchaChallenge.q} = ?
              </div>
              <input
                type="number"
                required
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Jawaban"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-center text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-900/30 text-rose-300 text-xs rounded-xl flex gap-2.5 items-start animate-fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-xs rounded-xl flex gap-2.5 items-start animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setIsForgotPasswordMode(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs border border-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <button
              type="submit"
              disabled={recoveryCooldown > 0}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              {recoveryCooldown > 0 ? `Tunggu ${recoveryCooldown}s` : 'Kirim Sandi'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        /* RENDER STANDARD LOGIN MODE */
        <form onSubmit={handleLogin} className="space-y-5">
          {lockoutTimer > 0 && (
            <div className="p-3.5 bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs rounded-2xl flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <strong className="font-bold">Keamanan Sistem Aktif:</strong>
                <p className="mt-0.5">Terlalu banyak kegagalan masuk. Login ditangguhkan sementara demi keamanan. Coba lagi dalam <span className="font-bold font-mono text-white underline">{lockoutTimer}</span> detik.</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Username, No. WA, atau No. Pelanggan
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input 
                type="text"
                required
                disabled={lockoutTimer > 0}
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Contoh: budi atau 081234567890"
                className="w-full bg-slate-950 border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 pl-11 pr-4 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Sandi Portal
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordMode(true);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setCaptchaChallenge(generateMathCaptcha());
                }}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                Lupa Sandi?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type={showPassword ? "text" : "password"}
                required
                disabled={lockoutTimer > 0}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Masukkan kata sandi"
                className="w-full bg-slate-950 border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 pl-11 pr-11 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-900/30 text-rose-300 text-xs rounded-xl flex gap-2.5 items-start">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={lockoutTimer > 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 disabled:shadow-none"
          >
            {lockoutTimer > 0 ? `Sistem Terkunci (${lockoutTimer}s)` : 'Masuk Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-3 text-center border-t border-slate-800/60 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center justify-center gap-1.5 mx-auto transition"
            >
              <FileCheck className="w-4 h-4" />
              Belum punya akun? Daftar Pelanggan Baru →
            </button>
          </div>
        </form>
      )}

      {/* Quick Demo Credentials Panel */}
      <div className="mt-8 border-t border-slate-800/80 pt-6 space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block text-center">
            Informasi Akun Demo (Uji Portal Kredensial)
          </span>
          <p className="text-[10px] text-slate-500 text-center mt-1">
            Klik akun di bawah ini untuk mengisi kredensial & mensimulasikan login secara otomatis.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {customers.slice(0, 3).map((cust) => {
            const firstWord = cust.name.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
            const username = cust.portal_username || firstWord;
            const password = cust.portal_password || `${firstWord}123`;
            
            return (
              <button
                key={cust.id}
                onClick={() => {
                  if (lockoutTimer > 0) return;
                  setIsForgotPasswordMode(false);
                  setUsernameInput(username);
                  setPasswordInput(password);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                disabled={lockoutTimer > 0}
                className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-emerald-800/60 hover:bg-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition text-left group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white block">
                    {cust.name}
                  </span>
                  <div className="flex gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                    <span>User: <strong className="text-slate-400 font-bold underline">{username}</strong></span>
                    <span>•</span>
                    <span>Pass: <strong className="text-slate-400 font-bold underline">{password}</strong></span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 transition" />
                  <span>Isi</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
