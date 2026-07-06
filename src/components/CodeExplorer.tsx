/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  BookOpen, 
  Layers, 
  Cpu, 
  Settings,
  Info
} from 'lucide-react';
import { CODEBASE_DATA } from '../data/laravelCodebase';
import { CodeFile } from '../types';

export default function CodeExplorer() {
  const [selectedGroup, setSelectedGroup] = useState(CODEBASE_DATA[0]);
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODEBASE_DATA[0].files[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZipSim = () => {
    alert('Simulasi Unduh Codebase: Seluruh repositori "StarBilling-ISP-Enterprise.zip" sedang dipersiapkan untuk diunduh.');
  };

  return (
    <div className="space-y-6">
      {/* Upper Info Box */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-950/40 to-slate-950 p-6 rounded-2xl border border-indigo-900/40 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-950 rounded-xl border border-indigo-800">
            <Terminal className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Arsitektur & Source Code Explorer</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
              Tinjau, salin, dan pelajari struktur database MariaDB 11, Model Eloquent, REST API Controllers, integrasi MikroTik (PHP), TR-069 GenieACS, dan konfigurasi Docker Compose yang telah dirancang untuk StarBilling ISP Enterprise.
            </p>
          </div>
        </div>
        <div>
          <button 
            onClick={handleDownloadZipSim}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Unduh StarBilling.zip
          </button>
        </div>
      </div>

      {/* Editor Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left Side File Tree Explorer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
          <div>
            <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider mb-2 font-bold px-2">FOLDER PROYEK</span>
            
            <div className="space-y-4">
              {CODEBASE_DATA.map((group) => (
                <div key={group.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-300">
                    <Folder className="w-4 h-4 text-cyan-400" />
                    <span>{group.title}</span>
                  </div>
                  
                  <div className="pl-6 space-y-0.5">
                    {group.files.map((file) => {
                      const isSelected = selectedFile.path === file.path;
                      return (
                        <button
                          key={file.path}
                          onClick={() => {
                            setSelectedGroup(group);
                            setSelectedFile(file);
                          }}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
                            isSelected 
                              ? 'bg-indigo-500/10 text-indigo-400 font-bold border-l-2 border-indigo-500' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-500 space-y-1 mt-auto">
            <span className="text-[9px] font-mono block uppercase text-slate-400 font-bold">TEKNOLOGI BACKEND:</span>
            <p>• Laravel 12 Stable (PHP 8.4)</p>
            <p>• MariaDB 11 Database Engine</p>
            <p>• Redis Caching & Websocket</p>
          </div>
        </div>

        {/* Right Side Visual VS-Code Editor */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl h-[560px]">
          {/* Editor Header Bar */}
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-400 ml-4 font-semibold">{selectedFile.path}</span>
            </div>

            <button 
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Code details banner */}
          <div className="bg-indigo-950/15 border-b border-slate-850 p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-mono text-indigo-400 block font-bold uppercase">DESKRIPSI ARSITEKTURAL</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedFile.description}</p>
            </div>
          </div>

          {/* Main Code Box */}
          <div className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed selection:bg-indigo-500/30 selection:text-white">
            <pre className="whitespace-pre">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
