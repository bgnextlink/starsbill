/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';

// Robust Google Maps & Indonesian coordinate parser helper
function parseCoordinates(input: string) {
  let text = input.trim();
  if (!text) return null;

  // 1. URL pattern for Google Maps
  // e.g., https://www.google.com/maps/place/-2.9902251,104.6926826/
  // or https://www.google.com/maps/@-2.9902251,104.6926826,17z
  const urlRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const placeRegex = /place\/(-?\d+\.\d+),(-?\d+\.\d+)/;
  
  const urlMatch = text.match(urlRegex) || text.match(placeRegex);
  if (urlMatch) {
    return {
      lat: parseFloat(urlMatch[1]),
      lng: parseFloat(urlMatch[2])
    };
  }

  // 2. Comma separated Indonesian style or standard
  // Example Indonesian: -8,279, 113,655 or -2.9902251546213, 104.6926826389
  text = text.replace(/\s+/g, ' ');
  
  if (text.includes(', ')) {
    const parts = text.split(', ');
    if (parts.length === 2) {
      let latStr = parts[0].trim();
      let lngStr = parts[1].trim();
      if (latStr.includes(',') && !latStr.includes('.')) latStr = latStr.replace(',', '.');
      if (lngStr.includes(',') && !lngStr.includes('.')) lngStr = lngStr.replace(',', '.');
      
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }

  // Split by spaces or delimiters
  const parts = text.split(/[\s;|]+/);
  if (parts.length >= 2) {
    let latStr = parts[0].trim().replace(/,$/, '');
    let lngStr = parts[1].trim().replace(/,$/, '');
    
    if (latStr.includes(',') && !latStr.includes('.')) latStr = latStr.replace(',', '.');
    if (lngStr.includes(',') && !lngStr.includes('.')) lngStr = lngStr.replace(',', '.');
    
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // Fallback: match floating numbers
  const numberMatches = text.match(/-?\d+[\.,]\d+/g);
  if (numberMatches && numberMatches.length >= 2) {
    const lat = parseFloat(numberMatches[0].replace(',', '.'));
    const lng = parseFloat(numberMatches[1].replace(',', '.'));
    return { lat, lng };
  }

  // If there's a comma with no space: e.g. -8.279,113.655
  if (text.includes(',')) {
    const commaCount = (text.match(/,/g) || []).length;
    if (commaCount === 1) {
      const parts = text.split(',');
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }

  return null;
}

import { 
  MapPin, 
  Layers, 
  Plus, 
  Trash2, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  Zap,
  Edit2,
  Info
} from 'lucide-react';
import { Odp, Customer } from '../types';

interface GisFiberProps {
  odps: Odp[];
  customers: Customer[];
  onAddOdp: (odp: Odp) => void;
  onUpdateOdp?: (odp: Odp) => void;
  onDeleteOdp: (id: string) => void;
}

export default function GisFiber({ odps, customers, onAddOdp, onUpdateOdp, onDeleteOdp }: GisFiberProps) {
  const [selectedOdp, setSelectedOdp] = useState<Odp | null>(odps[0] || null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [mapMode, setMapMode] = useState<'fiber' | 'ports'>('fiber');

  // Search, filter, pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouter, setSelectedRouter] = useState('SEMUA ROUTER');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Edit states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOdp, setEditingOdp] = useState<Odp | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    latitude: -2.9902251546213,
    longitude: 104.6926826389,
    capacity: 8,
    used_port: 0,
    router_name: 'Router-Gambir-01',
    remarks: ''
  });

  // Form fields for new ODP
  const [formData, setFormData] = useState({
    name: '',
    latitude: -2.9902251546213,
    longitude: 104.6926826389,
    capacity: 8,
    used_port: 0,
    router_name: 'Router-Gambir-01',
    remarks: ''
  });

  // New states for interactive modal map and paste parsing
  const [modalZoom, setModalZoom] = useState(15);
  const [mapCenter, setMapCenter] = useState({ lat: -2.9902251546213, lng: 104.6926826389 });
  const [pasteInput, setPasteInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const modalMapRef = useRef<HTMLDivElement>(null);

  // Main map zoom, center, and pan drag states
  const [mainZoom, setMainZoom] = useState(15);
  const [mainCenter, setMainCenter] = useState(() => {
    if (odps.length > 0) {
      const palembangOdp = odps.find(o => o.latitude > -5 && o.latitude < -1);
      if (palembangOdp) return { lat: palembangOdp.latitude, lng: palembangOdp.longitude };
      return { lat: odps[0].latitude, lng: odps[0].longitude };
    }
    return { lat: -2.9923256234536, lng: 104.69665106864 };
  });
  const [isMainDragging, setIsMainDragging] = useState(false);
  const mainMapRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number, y: number, centerLat: number, centerLng: number } | null>(null);

  // Sync map center if coordinates change externally (e.g., manually editing fields)
  useEffect(() => {
    if (isAddOpen) {
      setMapCenter({ lat: formData.latitude, lng: formData.longitude });
    }
  }, [formData.latitude, formData.longitude, isAddOpen]);

  // Center the main map automatically when selectedOdp changes
  useEffect(() => {
    if (selectedOdp) {
      setMainCenter({ lat: selectedOdp.latitude, lng: selectedOdp.longitude });
    }
  }, [selectedOdp]);

  const updateCoordsFromPixel = (x: number, y: number, width: number, height: number) => {
    const spanLat = 0.005 / Math.pow(1.8, modalZoom - 15);
    const spanLng = 0.008 / Math.pow(1.8, modalZoom - 15);
    const latMin = mapCenter.lat - spanLat;
    const latMax = mapCenter.lat + spanLat;
    const lngMin = mapCenter.lng - spanLng;
    const lngMax = mapCenter.lng + spanLng;

    const pctX = x / width;
    const pctY = y / height;
    
    const newLng = lngMin + pctX * (lngMax - lngMin);
    const newLat = latMax - pctY * (latMax - latMin);

    setFormData(prev => ({
      ...prev,
      latitude: Number(newLat.toFixed(13)),
      longitude: Number(newLng.toFixed(13))
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Nama ODP wajib diisi!');
      return;
    }
    const cap = Number(formData.capacity);
    const used = Number(formData.used_port);
    onAddOdp({
      id: `odp-${Date.now()}`,
      name: formData.name,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      capacity: cap,
      used_port: used,
      available_port: cap - used,
      router_name: formData.router_name,
      remarks: formData.remarks || '-'
    });
    setIsAddOpen(false);
    setFormData({ 
      name: '', 
      latitude: -2.9902251546213, 
      longitude: 104.6926826389, 
      capacity: 8, 
      used_port: 0,
      router_name: 'Router-Gambir-01',
      remarks: ''
    });
    setPasteInput('');
  };

  // Edit handlers
  const handleOpenEdit = (odp: Odp) => {
    setEditingOdp(odp);
    setEditFormData({
      name: odp.name,
      latitude: odp.latitude,
      longitude: odp.longitude,
      capacity: odp.capacity,
      used_port: odp.used_port,
      router_name: odp.router_name || 'Router-Gambir-01',
      remarks: odp.remarks || ''
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOdp) return;
    const cap = Number(editFormData.capacity);
    const used = Number(editFormData.used_port);
    const updated: Odp = {
      ...editingOdp,
      name: editFormData.name,
      latitude: Number(editFormData.latitude),
      longitude: Number(editFormData.longitude),
      capacity: cap,
      used_port: used,
      available_port: cap - used,
      router_name: editFormData.router_name,
      remarks: editFormData.remarks || '-'
    };
    if (onUpdateOdp) {
      onUpdateOdp(updated);
    }
    if (selectedOdp?.id === editingOdp.id) {
      setSelectedOdp(updated);
    }
    setIsEditOpen(false);
    setEditingOdp(null);
  };

  // Filter and search logic
  const filteredOdps = odps.filter(odp => {
    const matchesSearch = odp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (odp.remarks && odp.remarks.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRouter = selectedRouter === 'SEMUA ROUTER' || 
                          odp.router_name === selectedRouter;
                          
    return matchesSearch && matchesRouter;
  });

  // Unique routers for dropdown list
  const uniqueRouters = Array.from(new Set(odps.map(o => o.router_name).filter(Boolean))) as string[];

  // Pagination
  const totalItems = filteredOdps.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOdps = filteredOdps.slice(startIndex, startIndex + pageSize);

  // Get subscribers connected to selected ODP
  const linkedSubscribers = selectedOdp 
    ? customers.filter(c => c.odp_id === selectedOdp.id)
    : [];

  // Coordinates helper for the relative SVG canvas box using mainCenter and mainZoom
  const getSvgCoordinates = (lat: number, lng: number) => {
    // Zoom factor based on zoom state. Zoom 15 is baseline.
    const zoomFactor = Math.pow(1.8, mainZoom - 15);
    // At zoom 15, let's span 0.015 degrees lat and 0.025 degrees lng
    const spanLat = 0.015 / zoomFactor;
    const spanLng = 0.025 / zoomFactor;

    const latMin = mainCenter.lat - spanLat / 2;
    const latMax = mainCenter.lat + spanLat / 2;
    const lngMin = mainCenter.lng - spanLng / 2;
    const lngMax = mainCenter.lng + spanLng / 2;

    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = (1 - (lat - latMin) / (latMax - latMin)) * 100; // inverted Y-axis for standard coordinates

    return { x, y };
  };

  // Central Hub (OLT Central Office) coordinates - placed close to the active center
  const oltCoords = React.useMemo(() => {
    return { lat: mainCenter.lat + 0.0035, lng: mainCenter.lng - 0.0045 };
  }, [mainCenter]);

  const oltSvg = getSvgCoordinates(oltCoords.lat, oltCoords.lng);

  const handleMainPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click only
    setIsMainDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      centerLat: mainCenter.lat,
      centerLng: mainCenter.lng
    };
  };

  const handleMainPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMainDragging || !dragStartRef.current || !mainMapRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    const rect = mainMapRef.current.getBoundingClientRect();
    const zoomFactor = Math.pow(1.8, mainZoom - 15);
    const spanLat = 0.015 / zoomFactor;
    const spanLng = 0.025 / zoomFactor;

    // Convert pixel delta to coordinate delta
    const dLng = -(dx / rect.width) * spanLng;
    const dLat = (dy / rect.height) * spanLat;

    setMainCenter({
      lat: dragStartRef.current.centerLat + dLat,
      lng: dragStartRef.current.centerLng + dLng
    });
  };

  const handleMainPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsMainDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragStartRef.current = null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Lihat MAP</h2>
          <p className="text-xs text-slate-400">Peta interaktif redaman serat optik, distribusi ODP, dan pemetaan rute pelanggan.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setMapMode(mapMode === 'fiber' ? 'ports' : 'fiber')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/85 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            Mode: {mapMode === 'fiber' ? 'Jalur Fiber Optik' : 'Kapasitas Port ODP'}
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/10"
          >
            <Plus className="w-4 h-4" />
            Tambah ODP Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive GIS Vector Map Panel */}
        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden relative flex flex-col h-[520px] shadow-2xl">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800/60 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">ODP Maps</span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
              <Activity className="w-3 h-3 animate-pulse" /> SINKRONISASI GEOGRAFIS AKTIF
            </div>
          </div>

          <div className="absolute top-14 right-4 z-10 bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col gap-1 shadow-lg backdrop-blur text-xs">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-800 pb-1 mb-1">Status Kapasitas</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-300 font-mono text-[10px]">Tersedia</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-300 font-mono text-[10px]">Hampir Penuh</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-300 font-mono text-[10px]">Penuh</span>
            </div>
          </div>

          {/* Map Area using relative SVG */}
          <div 
            ref={mainMapRef}
            onPointerDown={handleMainPointerDown}
            onPointerMove={handleMainPointerMove}
            onPointerUp={handleMainPointerUp}
            onPointerLeave={handleMainPointerUp}
            className="flex-1 w-full bg-slate-900 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] p-4 relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
          >
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              {/* Draw Fiber Lines from OLT Central Office to ODPs */}
              {odps.map((odp) => {
                const odpSvg = getSvgCoordinates(odp.latitude, odp.longitude);
                const isSelected = selectedOdp?.id === odp.id;
                
                return (
                  <g key={`lines-${odp.id}`}>
                    <line 
                      x1={`${oltSvg.x}%`} 
                      y1={`${oltSvg.y}%`} 
                      x2={`${odpSvg.x}%`} 
                      y2={`${odpSvg.y}%`} 
                      stroke={isSelected ? '#06b6d4' : '#4f46e5'} 
                      strokeWidth={isSelected ? 2.5 : 1.5} 
                      strokeOpacity={isSelected ? 0.9 : 0.4}
                      strokeDasharray={isSelected ? '0' : '4,4'}
                      className="transition duration-300"
                    />
                    {/* Pulsing optical signal along the line */}
                    <circle r="3" fill="#06b6d4" opacity="0.8">
                      <animateMotion 
                        path={`M ${oltSvg.x * 6} ${oltSvg.y * 5} L ${odpSvg.x * 6} ${odpSvg.y * 5}`} 
                        dur={`${2 + Math.random() * 3}s`} 
                        repeatCount="indefinite" 
                      />
                    </circle>
                  </g>
                );
              })}

              {/* Draw Dropcore paths from selected ODP to its customers */}
              {selectedOdp && linkedSubscribers.map((sub) => {
                const odpSvg = getSvgCoordinates(selectedOdp.latitude, selectedOdp.longitude);
                const subSvg = getSvgCoordinates(sub.latitude, sub.longitude);
                return (
                  <line 
                    key={`drop-${sub.id}`}
                    x1={`${odpSvg.x}%`} 
                    y1={`${odpSvg.y}%`} 
                    x2={`${subSvg.x}%`} 
                    y2={`${subSvg.y}%`} 
                    stroke="#fbbf24" 
                    strokeWidth={1} 
                    strokeOpacity={0.7}
                    strokeDasharray="2,3"
                  />
                );
              })}
            </svg>

            {/* Render OLT Central Office Hub */}
            <div 
              style={{ left: `${oltSvg.x}%`, top: `${oltSvg.y}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition duration-150">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full mt-1 shadow-md select-none">OLT-CO-HUB</span>
            </div>

            {/* Render ODP Markers */}
            {odps.map((odp) => {
              const odpSvg = getSvgCoordinates(odp.latitude, odp.longitude);
              const isSelected = selectedOdp?.id === odp.id;
              const isFull = odp.used_port >= odp.capacity;
              const isAlmostFull = !isFull && (odp.capacity - odp.used_port) <= 2;

              // Hide marker if outside map viewport box (coordinates should map roughly inside -10% to 110%)
              if (odpSvg.x < -10 || odpSvg.x > 110 || odpSvg.y < -10 || odpSvg.y > 110) {
                return null;
              }

              return (
                <div 
                  key={odp.id}
                  id={`odp-marker-${odp.id}`}
                  style={{ left: `${odpSvg.x}%`, top: `${odpSvg.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOdp(odp);
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-30"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition duration-150 ${
                    isSelected 
                      ? 'bg-cyan-400 border-2 border-white scale-125 ring-4 ring-cyan-500/20' 
                      : isFull 
                      ? 'bg-rose-500 border border-rose-450 hover:scale-110' 
                      : isAlmostFull
                      ? 'bg-amber-500 border border-amber-400 hover:scale-110'
                      : 'bg-emerald-500 border border-emerald-450 hover:scale-110'
                  }`}>
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-900' : 'text-white'}`} />
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md mt-1 shadow border select-none ${
                    isSelected 
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800' 
                      : 'bg-slate-900/90 text-slate-300 border-slate-800'
                  }`}>
                    {odp.name}
                  </span>
                </div>
              );
            })}

            {/* Render Subscribers connected to Selected ODP */}
            {selectedOdp && linkedSubscribers.map((sub) => {
              const subSvg = getSvgCoordinates(sub.latitude, sub.longitude);
              
              if (subSvg.x < -10 || subSvg.x > 110 || subSvg.y < -10 || subSvg.y > 110) {
                return null;
              }

              return (
                <div 
                  key={sub.id}
                  style={{ left: `${subSvg.x}%`, top: `${subSvg.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group"
                  title={sub.name}
                >
                  <div className="w-3.5 h-3.5 bg-amber-400 hover:bg-amber-500 border border-slate-900 rounded shadow transform hover:scale-125 transition" />
                  <span className="hidden group-hover:block bg-slate-950 text-white border border-slate-800 text-[8px] font-mono px-1 py-0.5 rounded absolute -bottom-5 whitespace-nowrap z-40">
                    {sub.name}
                  </span>
                </div>
              );
            })}

            {/* Zoom Controls like Leaflet */}
            <div className="absolute top-4 left-4 z-40 flex flex-col border border-slate-800 bg-slate-900/90 rounded-md overflow-hidden shadow">
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMainZoom(prev => Math.min(18, prev + 1));
                }} 
                className="w-7 h-7 text-xs font-bold border-b border-slate-800 text-slate-200 hover:bg-slate-800 transition flex items-center justify-center"
              >
                +
              </button>
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMainZoom(prev => Math.max(10, prev - 1));
                }} 
                className="w-7 h-7 text-xs font-bold text-slate-200 hover:bg-slate-800 transition flex items-center justify-center"
              >
                −
              </button>
            </div>
          </div>

          {/* Bottom Coordinates Status with Attribution */}
          <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-[10px] font-mono text-slate-400 flex justify-between items-center bg-slate-950/20 select-none">
            <span>Center Lat: {mainCenter.lat.toFixed(6)} | Lng: {mainCenter.lng.toFixed(6)}</span>
            <span>Leaflet | © OpenStreetMap STARBILLING.lokal</span>
          </div>
        </div>

        {/* Selected ODP Detail & Monitoring Portal */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              MONITORING PORT ODP
            </h3>

            {selectedOdp ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{selectedOdp.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      Lat: {selectedOdp.latitude} | Lng: {selectedOdp.longitude}
                    </span>
                  </div>
                  <button 
                    onClick={() => { if (confirm(`Hapus ODP ${selectedOdp.name}?`)) { onDeleteOdp(selectedOdp.id); setSelectedOdp(odps[0] || null); }}}
                    className="p-1.5 bg-slate-950 text-rose-500 hover:bg-rose-950/30 hover:text-rose-400 border border-slate-800 hover:border-rose-900 rounded-xl transition"
                    title="Hapus ODP"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Capacity Radial Indicator */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase mb-2">PENGGUNAAN PORT</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-white font-mono">{selectedOdp.used_port}</span>
                      <span className="text-sm text-slate-400 font-mono"> / {selectedOdp.capacity} Port</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedOdp.available_port === 0 
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/50' 
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    }`}>
                      {selectedOdp.available_port === 0 ? 'FULL CAPACITY' : `${selectedOdp.available_port} PORT FREE`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${selectedOdp.used_port >= selectedOdp.capacity ? 'bg-rose-500' : 'bg-cyan-400'}`}
                      style={{ width: `${(selectedOdp.used_port / selectedOdp.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Port Allocation Matrix */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase mb-2">GRID INDIKATOR FISIK PORT</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Array.from({ length: selectedOdp.capacity }).map((_, i) => {
                      const isActive = i < selectedOdp.used_port;
                      return (
                        <div 
                          key={`port-${i}`}
                          className={`p-1.5 rounded-lg border text-center font-mono text-[9px] font-bold ${
                            isActive 
                              ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-400 shadow shadow-cyan-400/5' 
                              : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}
                        >
                          P-{String(i + 1).padStart(2, '0')}
                          <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-800'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Connected Customers */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1.5">PELANGGAN TERSAMBUNG ({linkedSubscribers.length})</span>
                  {linkedSubscribers.length === 0 ? (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center text-slate-500 text-xs font-mono">
                      Belum ada pelanggan tersambung ke ODP ini.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {linkedSubscribers.map(sub => (
                        <div key={sub.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-slate-200 font-semibold block">{sub.name}</span>
                            <span className="text-slate-500 text-[10px] font-mono">{sub.customer_number}</span>
                          </div>
                          <span className="text-cyan-400 font-mono text-[10px]">Active Node</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs font-mono text-center py-12">Pilih salah satu ODP di peta untuk melihat telemetry port.</p>
            )}
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex gap-3 items-start">
            <Info className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Info Redaman Serat:</strong> Batas aman redaman GPON ONU adalah <strong>-15 dBm s/d -25 dBm</strong>. ODP yang penuh disarankan segera ditarik kabel feeder baru untuk penambahan ODC sekunder.
            </p>
          </div>
        </div>
      </div>

      {/* Pengolahan Data ODP Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Pengolahan data ODP</h3>
            <p className="text-xs text-slate-400 mt-1">Kelola rincian port, rute router, keterangan lokasi, dan koordinat perangkat ODP.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Limit Rows Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Lihat:</span>
              <select 
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value={5} className="bg-slate-950">5 baris</option>
                <option value={10} className="bg-slate-950">10 baris</option>
                <option value={20} className="bg-slate-950">20 baris</option>
                <option value={50} className="bg-slate-950">50 baris</option>
              </select>
            </div>

            {/* Router Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Router:</span>
              <select 
                value={selectedRouter}
                onChange={(e) => {
                  setSelectedRouter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="SEMUA ROUTER" className="bg-slate-950">SEMUA ROUTER</option>
                {uniqueRouters.map(router => (
                  <option key={router} value={router} className="bg-slate-950">{router}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 lg:flex-initial relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari Nama ODP..."
                className="w-full lg:w-64 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono italic">
          * Masukkan nama odp dan tekan enter untuk mencari / filter langsung dari daftar.
        </div>

        {/* The Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3">Router</th>
                <th className="px-4 py-3">Nama ODP</th>
                <th className="px-4 py-3 text-center">Jumlah Slot</th>
                <th className="px-4 py-3 text-center">Terpakai</th>
                <th className="px-4 py-3 text-center">Sisa</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-center">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {paginatedOdps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-mono">
                    Tidak ada data ODP ditemukan dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                paginatedOdps.map((odp, index) => {
                  const absoluteIndex = startIndex + index + 1;
                  const isSelected = selectedOdp?.id === odp.id;
                  return (
                    <tr 
                      key={odp.id} 
                      className={`hover:bg-slate-800/45 transition cursor-pointer ${isSelected ? 'bg-cyan-950/25 border-l-2 border-l-cyan-500' : ''}`}
                      onClick={() => {
                        setSelectedOdp(odp);
                      }}
                    >
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{absoluteIndex}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{odp.router_name || '-'}</td>
                      <td className="px-4 py-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{odp.name}</span>
                          {odp.used_port >= odp.capacity && (
                            <span className="bg-rose-950 text-rose-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-rose-800/30">FULL</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-300">{odp.capacity}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-cyan-400">{odp.used_port}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-400">{odp.available_port}</td>
                      <td className="px-4 py-3 text-slate-300 max-w-[180px] truncate" title={odp.remarks || ''}>
                        {odp.remarks || '-'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {odp.latitude.toFixed(6)},{odp.longitude.toFixed(6)}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => {
                              setSelectedOdp(odp);
                            }}
                            className="p-1 text-cyan-400 hover:bg-cyan-950/40 rounded transition"
                            title="Tampilkan di Peta"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(odp)}
                            className="p-1 text-amber-400 hover:bg-amber-950/40 rounded transition"
                            title="Edit rincian ODP"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus ODP ${odp.name}?`)) {
                                onDeleteOdp(odp.id);
                                if (selectedOdp?.id === odp.id) {
                                  setSelectedOdp(null);
                                }
                              }
                            }}
                            className="p-1 text-rose-400 hover:bg-rose-950/40 rounded transition"
                            title="Hapus ODP"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
            <span className="text-slate-400 font-mono text-[10px]">
              Menampilkan {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} dari {totalItems} ODP
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 rounded-lg text-xs font-semibold hover:bg-slate-850 disabled:hover:bg-slate-950 transition"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={`page-${i}`}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition ${currentPage === i + 1 ? 'bg-cyan-600 text-white shadow' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 rounded-lg text-xs font-semibold hover:bg-slate-850 disabled:hover:bg-slate-950 transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add ODP Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">TAMBAH ODP</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN - Information & Coordinates */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Informasi ODP
                    </h4>
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 space-y-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Nama ODP *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Contoh: ODP-JBR-01"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Router</label>
                        <select 
                          value={formData.router_name}
                          onChange={(e) => setFormData({...formData, router_name: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200 cursor-pointer"
                        >
                          <option value="SEMUA ROUTER">SEMUA ROUTER</option>
                          <option value="Router-Gambir-01">Router-Gambir-01</option>
                          <option value="Router-BDG-01">Router-BDG-01</option>
                          <option value="Router-Dedicated-Core">Router-Dedicated-Core</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Jumlah Slot *</label>
                          <input 
                            type="number" 
                            required
                            min={1}
                            value={formData.capacity}
                            onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                            placeholder="Contoh: 8"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Port Terpakai</label>
                          <input 
                            type="number" 
                            required
                            min={0}
                            max={formData.capacity}
                            value={formData.used_port}
                            onChange={(e) => setFormData({...formData, used_port: Number(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Keterangan ( optional )</label>
                        <input 
                          type="text"
                          value={formData.remarks}
                          onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                          placeholder="Contoh: Suryakbar"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Lokasi Koordinat
                    </h4>
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 space-y-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Paste dari Google Maps</label>
                        <input 
                          type="text" 
                          value={pasteInput}
                          onChange={(e) => {
                            setPasteInput(e.target.value);
                            const parsed = parseCoordinates(e.target.value);
                            if (parsed) {
                              setFormData(prev => ({
                                ...prev,
                                latitude: Number(parsed.lat.toFixed(13)),
                                longitude: Number(parsed.lng.toFixed(13))
                              }));
                            }
                          }}
                          placeholder="Paste koordinat atau URL Google Maps"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                        />
                        <span className="text-[9px] text-slate-500 font-mono block mt-1 leading-normal">
                          Support: -7.899,112.556 | -8,279, 113,655 | URL Google Maps
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Latitude</label>
                          <input 
                            type="number" 
                            step="0.0000000000001"
                            required
                            value={formData.latitude}
                            onChange={(e) => setFormData({...formData, latitude: Number(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Longitude</label>
                          <input 
                            type="number" 
                            step="0.0000000000001"
                            required
                            value={formData.longitude}
                            onChange={(e) => setFormData({...formData, longitude: Number(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - Interactive Map */}
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Peta Lokasi
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Geser marker atau klik peta untuk menentukan lokasi
                    </span>

                    {/* Interactive Leaflet Map Box Mock */}
                    <div 
                      ref={modalMapRef}
                      onClick={(e) => {
                        if (isDragging) return;
                        if (!modalMapRef.current) return;
                        const rect = modalMapRef.current.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        updateCoordsFromPixel(x, y, rect.width, rect.height);
                      }}
                      onPointerDown={(e) => {
                        setIsDragging(true);
                        e.currentTarget.setPointerCapture(e.pointerId);
                        if (modalMapRef.current) {
                          const rect = modalMapRef.current.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          updateCoordsFromPixel(x, y, rect.width, rect.height);
                        }
                      }}
                      onPointerMove={(e) => {
                        if (!isDragging) return;
                        if (modalMapRef.current) {
                          const rect = modalMapRef.current.getBoundingClientRect();
                          const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                          const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
                          updateCoordsFromPixel(x, y, rect.width, rect.height);
                        }
                      }}
                      onPointerUp={(e) => {
                        setIsDragging(false);
                        e.currentTarget.releasePointerCapture(e.pointerId);
                      }}
                      className="w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden select-none cursor-crosshair shadow-inner"
                    >
                      {/* Dark Grid Background representing mapping coordinates */}
                      <div className="absolute inset-0 bg-slate-900 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                      <svg className="w-full h-full absolute inset-0 pointer-events-none">
                        {/* Dynamic Streets & Rivers rendering */}
                        {(() => {
                          const spanLat = 0.005 / Math.pow(1.8, modalZoom - 15);
                          const spanLng = 0.008 / Math.pow(1.8, modalZoom - 15);
                          const latMin = mapCenter.lat - spanLat;
                          const latMax = mapCenter.lat + spanLat;
                          const lngMin = mapCenter.lng - spanLng;
                          const lngMax = mapCenter.lng + spanLng;
                          const latSpan = latMax - latMin;
                          const lngSpan = lngMax - lngMin;

                          const MOCK_STREETS = [
                            { name: "Jl. Jend. Sudirman", coords: [ {lat: -2.980, lng: 104.685}, {lat: -3.000, lng: 104.700} ] },
                            { name: "Jl. Kol. Atmo", coords: [ {lat: -2.985, lng: 104.690}, {lat: -2.995, lng: 104.690} ] },
                            { name: "Jl. Merdeka", coords: [ {lat: -2.992, lng: 104.680}, {lat: -2.992, lng: 104.705} ] },
                            { name: "Sungai Musi (River)", isRiver: true, coords: [ {lat: -3.001, lng: 104.670}, {lat: -3.001, lng: 104.720} ] },
                            { name: "Jl. R. Sukamto", coords: [ {lat: -2.975, lng: 104.695}, {lat: -2.975, lng: 104.715} ] }
                          ];

                          return MOCK_STREETS.map((street, idx) => {
                            const points = street.coords.map(pt => {
                              const x = ((pt.lng - lngMin) / lngSpan) * 100;
                              const y = (1 - (pt.lat - latMin) / latSpan) * 100;
                              return `${x},${y}`;
                            }).join(' ');

                            return (
                              <g key={`modstreet-${idx}`}>
                                <polyline
                                  points={points}
                                  fill="none"
                                  stroke={street.isRiver ? '#1e3a8a' : '#334155'}
                                  strokeWidth={street.isRiver ? 8 : 2}
                                  strokeOpacity={0.6}
                                />
                                <text
                                  x={`${((street.coords[0].lng - lngMin) / lngSpan) * 100}%`}
                                  y={`${(1 - (street.coords[0].lat - latMin) / latSpan) * 100}%`}
                                  fill="#475569"
                                  fontSize="8"
                                  fontFamily="monospace"
                                  className="select-none pointer-events-none opacity-40"
                                >
                                  {street.name}
                                </text>
                              </g>
                            );
                          });
                        })()}

                        {/* Render other active ODP points on the map */}
                        {(() => {
                          const spanLat = 0.005 / Math.pow(1.8, modalZoom - 15);
                          const spanLng = 0.008 / Math.pow(1.8, modalZoom - 15);
                          const latMin = mapCenter.lat - spanLat;
                          const latMax = mapCenter.lat + spanLat;
                          const lngMin = mapCenter.lng - spanLng;
                          const lngMax = mapCenter.lng + spanLng;
                          const latSpan = latMax - latMin;
                          const lngSpan = lngMax - lngMin;

                          return odps.map(o => {
                            const x = ((o.longitude - lngMin) / lngSpan) * 100;
                            const y = (1 - (o.latitude - latMin) / latSpan) * 100;
                            if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
                              return (
                                <g key={`modal-other-odp-${o.id}`}>
                                  <circle
                                    cx={`${x}%`}
                                    cy={`${y}%`}
                                    r="3.5"
                                    fill="#0891b2"
                                    opacity="0.5"
                                  />
                                  <text
                                    x={`${x}%`}
                                    y={`${y - 2}%`}
                                    fill="#64748b"
                                    fontSize="7"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    className="opacity-60"
                                  >
                                    {o.name}
                                  </text>
                                </g>
                              );
                            }
                            return null;
                          });
                        })()}
                      </svg>

                      {/* Standard Leaflet Zoom Control UI */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col border border-slate-800 bg-slate-900 rounded-md overflow-hidden shadow">
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setModalZoom(prev => Math.min(18, prev + 1));
                          }} 
                          className="w-7 h-7 text-xs font-bold border-b border-slate-800 text-slate-200 hover:bg-slate-800 transition"
                        >
                          +
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setModalZoom(prev => Math.max(12, prev - 1));
                          }} 
                          className="w-7 h-7 text-xs font-bold text-slate-200 hover:bg-slate-800 transition"
                        >
                          −
                        </button>
                      </div>

                      {/* Draggable Active Red Map Pin Icon (Center Marker) */}
                      {(() => {
                        const spanLat = 0.005 / Math.pow(1.8, modalZoom - 15);
                        const spanLng = 0.008 / Math.pow(1.8, modalZoom - 15);
                        const latMin = mapCenter.lat - spanLat;
                        const latMax = mapCenter.lat + spanLat;
                        const lngMin = mapCenter.lng - spanLng;
                        const lngMax = mapCenter.lng + spanLng;
                        const latSpan = latMax - latMin;
                        const lngSpan = lngMax - lngMin;

                        const x = ((formData.longitude - lngMin) / lngSpan) * 100;
                        const y = (1 - (formData.latitude - latMin) / latSpan) * 100;

                        return (
                          <div 
                            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)' }}
                            className="absolute pointer-events-none flex flex-col items-center select-none"
                          >
                            <MapPin className="w-7 h-7 text-rose-500 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] fill-rose-500/10 animate-bounce" />
                            <span className="bg-rose-950/90 border border-rose-800 text-[8px] font-mono text-rose-300 px-1 py-0.5 rounded whitespace-nowrap -mt-0.5 shadow">
                              ODP Baru
                            </span>
                          </div>
                        );
                      })()}

                      {/* Map Attribution and Labels */}
                      <div className="absolute bottom-1 right-1 z-10 text-[8px] font-mono text-slate-500 bg-slate-950/80 px-1.5 py-0.5 rounded">
                        Leaflet | © OpenStreetMap contributors
                      </div>

                      <div className="absolute bottom-1 left-1 z-10 text-[8px] font-mono text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded">
                        Drag marker atau klik peta untuk set lokasi
                      </div>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex flex-col gap-3 pt-6">
                    <div className="flex justify-end gap-2.5">
                      <button 
                        type="button" 
                        onClick={() => setIsAddOpen(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
                      >
                        Simpan ODP
                      </button>
                    </div>
                    <div className="text-center text-[10px] text-slate-600 font-mono pt-3 border-t border-slate-800/50">
                      Copyright 2024 ©
                    </div>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit ODP Dialog Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">EDIT DETAILS ODP</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-slate-200">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Nama ODP *</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Router Pengendali</label>
                  <select 
                    value={editFormData.router_name}
                    onChange={(e) => setEditFormData({...editFormData, router_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                  >
                    <option value="Router-Gambir-01">Router-Gambir-01</option>
                    <option value="Router-BDG-01">Router-BDG-01</option>
                    <option value="Router-Dedicated-Core">Router-Dedicated-Core</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Keterangan / PIC</label>
                  <input 
                    type="text"
                    value={editFormData.remarks}
                    onChange={(e) => setEditFormData({...editFormData, remarks: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="0.0000000000001"
                    required
                    value={editFormData.latitude}
                    onChange={(e) => setEditFormData({...editFormData, latitude: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="0.0000000000001"
                    required
                    value={editFormData.longitude}
                    onChange={(e) => setEditFormData({...editFormData, longitude: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Kapasitas Port</label>
                  <select 
                    value={editFormData.capacity}
                    onChange={(e) => setEditFormData({...editFormData, capacity: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                  >
                    <option value={8}>8 Port</option>
                    <option value={16}>16 Port</option>
                    <option value={24}>24 Port</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Port Terpakai</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    max={editFormData.capacity}
                    value={editFormData.used_port}
                    onChange={(e) => setEditFormData({...editFormData, used_port: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback for missing X icon if any
const X = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className={className}
    onClick={onClick}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
