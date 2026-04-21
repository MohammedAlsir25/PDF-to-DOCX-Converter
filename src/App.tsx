/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  X, 
  CheckCircle2, 
  Loader2, 
  Download, 
  Files,
  Languages,
  ArrowRight,
  ShieldCheck,
  Zap,
  BrainCircuit,
  MessageSquareQuote,
  Target,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// --- Constants & Types ---

interface ConversionFile {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  resultUrl?: string;
  error?: string;
  insights?: {
    primaryLanguage: string;
    secondaryLanguages: string[];
    summary: string;
    tone: string;
    complexity: string;
  };
}

// --- Components ---

export default function App() {
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const newFiles: ConversionFile[] = selectedFiles.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        status: 'idle',
        progress: 0,
      }));
      setFiles(prev => [...prev, ...newFiles]);
      
      // Instant processing for each new file
      newFiles.forEach(item => {
        processFile(item);
      });
    }
  }, [files]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processFile = async (item: ConversionFile) => {
    try {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', progress: 10 } : f));

      // 1. Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(item.file);
      });

      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: 30 } : f));

      // 2. Call Secure Backend processing
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64 })
      });

      if (!response.ok) throw new Error("AI processing failed on server");
      const { result } = await response.json();

      let rawPayload;
      try {
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        rawPayload = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Parse error:", e, result);
        throw new Error("Linguistic analysis and structure failed. Please try again.");
      }

      const structuredContent = rawPayload.structure || [];
      const linguistInsights = rawPayload.insights;

      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: 70 } : f));

      // 3. Call Backend to generate DOCX
      const backendResponse = await fetch('/api/generate-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: item.file.name.replace('.pdf', ''),
          content: structuredContent
        })
      });

      if (!backendResponse.ok) throw new Error("Backend generation failed");

      const blob = await backendResponse.blob();
      const url = URL.createObjectURL(blob);

      setFiles(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: 'completed', 
        progress: 100,
        resultUrl: url,
        insights: linguistInsights
      } : f));

      // Instant Download
      const link = document.createElement('a');
      link.href = url;
      link.download = item.file.name.replace('.pdf', '.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err) {
      console.error(err);
      setFiles(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: 'error', 
        error: err instanceof Error ? err.message : "Conversion failed" 
      } : f));
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] font-sans selection:bg-blue-500/30 antialiased">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-serif text-2xl md:text-3xl italic tracking-tight leading-none text-white">PDF to DOCX <span className="text-blue-400">Converter</span></h1>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-[#888] mt-1 text-left">High-Fidelity Document Synthesis</p>
          </div>
          <nav className="flex items-center gap-3 md:gap-12 text-[10px] md:text-[11px] uppercase tracking-[0.1em] md:tracking-[0.2em] font-medium">
            <div className="flex items-center gap-1.5 md:gap-2 text-blue-400">
              <Languages className="w-3 md:w-3.5 h-3 md:h-3.5" />
              <span className="hidden sm:inline">Arabic Optimized</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-purple-400">
              <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" />
              <span className="hidden sm:inline">Linguist Engine Enabled</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-default">
              <ShieldCheck className="w-3 md:w-3.5 h-3 md:h-3.5" />
              <span className="hidden sm:inline">Secure</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
          
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#888]">Batch Queue ({files.length})</h2>
            </div>

            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {files.length === 0 ? (
                  <div className="glass p-8 rounded-2xl text-center border-dashed border-2 border-white/5">
                    <p className="text-xs text-[#888] uppercase tracking-widest leading-loose">Queue is vacant.<br/>Initiate synchronization.</p>
                  </div>
                ) : (
                  files.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={item.status === 'processing' ? { 
                        opacity: 1, 
                        x: 0,
                        backgroundColor: "rgba(59, 130, 246, 0.05)",
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.1)"
                      } : { 
                        opacity: 1, 
                        x: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        boxShadow: "none"
                      }}
                      transition={item.status === 'processing' ? {
                        backgroundColor: { duration: 1.5, repeat: Infinity, repeatType: "mirror" },
                        boxShadow: { duration: 1.5, repeat: Infinity, repeatType: "mirror" }
                      } : { duration: 0.2 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`glass p-5 rounded-xl flex flex-col gap-3 group transition-all ${item.status === 'processing' ? 'border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1 min-w-0 pr-4 text-left">
                          <span className={`block text-sm font-medium truncate mb-1 ${item.status === 'error' ? 'text-red-400' : 'text-white'}`}>
                            {item.file.name}
                          </span>
                          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                            <span className="text-[9px] text-[#888] uppercase tracking-wider font-bold">
                              {(item.file.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                            <span className="text-[8px] opacity-20">•</span>
                            <span className="text-[9px] text-[#888] uppercase tracking-wider font-bold truncate">
                              {item.status === 'completed' ? 'Synthesis Complete' : item.status === 'processing' ? `Analysing Neural Layers` : item.status === 'error' ? 'Failure' : 'Ready'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {item.status === 'completed' && item.resultUrl && (
                            <a 
                              href={item.resultUrl} 
                              download={item.file.name.replace('.pdf', '.docx')}
                              className="p-2 text-white hover:text-blue-400 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          {item.status === 'idle' && (
                            <button 
                              onClick={() => processFile(item)}
                              className="p-2 text-white hover:text-blue-400 transition-colors"
                            >
                              <Zap className="w-4 h-4 fill-current" />
                            </button>
                          )}
                          <button 
                            onClick={() => removeFile(item.id)}
                            className="p-2 text-[#888] hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {(item.status === 'processing' || item.status === 'completed') && (
                        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className={`h-full rounded-full relative ${item.status === 'completed' ? 'bg-green-500/50' : 'bg-blue-500'}`}
                          >
                            {item.status === 'processing' && (
                              <motion.div 
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
                              />
                            )}
                          </motion.div>
                        </div>
                      )}

                      {/* Linguist Feature Section */}
                      {item.status === 'completed' && item.insights && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-4 overflow-hidden"
                        >
                          <div className="flex items-center gap-2">
                            <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888]">Linguist Insights</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/3 rounded-lg p-3 border border-white/5">
                              <div className="flex items-center gap-1.5 mb-1 opacity-50">
                                <Languages className="w-3 h-3" />
                                <span className="text-[8px] uppercase tracking-wider font-semibold">Languages</span>
                              </div>
                              <p className="text-[11px] font-medium text-white/90">
                                {item.insights.primaryLanguage}
                                {item.insights.secondaryLanguages?.length > 0 && 
                                  <span className="text-blue-400 font-bold ml-1">
                                    (+{item.insights.secondaryLanguages.join(', ')})
                                  </span>
                                }
                              </p>
                            </div>
                            <div className="bg-white/3 rounded-lg p-3 border border-white/5">
                              <div className="flex items-center gap-1.5 mb-1 opacity-50">
                                <Target className="w-3 h-3" />
                                <span className="text-[8px] uppercase tracking-wider font-semibold">Profile</span>
                              </div>
                              <p className="text-[11px] font-medium text-white/90 capitalize">
                                {item.insights.tone} • {item.insights.complexity}
                              </p>
                            </div>
                          </div>

                          <div className="bg-white/3 rounded-lg p-3 border border-white/5">
                            <div className="flex items-center gap-1.5 mb-1 opacity-50">
                              <MessageSquareQuote className="w-3 h-3" />
                              <span className="text-[8px] uppercase tracking-wider font-semibold">Synthesis Summary</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-[#BBB] italic italic-font">
                              "{item.insights.summary}"
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 order-1 lg:order-2">
            <motion.div 
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 glass rounded-2xl md:rounded-3xl border-dashed border-2 border-white/5 flex flex-col items-center justify-center p-8 md:p-16 gap-6 relative overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all min-h-[300px] md:min-h-[400px]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/10 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-500">
                <Upload className="w-6 h-6 md:w-8 md:h-8 text-white/50 group-hover:text-blue-400 transition-colors" />
              </div>

              <div className="text-center z-10 space-y-2">
                <h3 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-2 underline decoration-white/10 underline-offset-8">Synchronize Documents</h3>
                <p className="text-xs md:text-sm text-[#888] uppercase tracking-[0.2em] font-medium">Drag & drop PDF structures</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 z-10 mt-4">
                <button className="px-8 md:px-10 py-3 bg-white text-black text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-full btn-glow hover:scale-105 transition-transform active:scale-95 w-full sm:w-auto">
                  Upload Sequence
                </button>
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={onFileChange}
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 flex flex-col gap-4">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#888] font-bold">Neural Engine</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs opacity-70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Layout Reconstruction</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs opacity-70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hierarchy Detection</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 flex flex-col gap-4">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#888] font-bold">Linguistics</h4>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-white/10 text-[9px] font-black tracking-widest px-2.5 py-1.5 rounded-lg border border-white/5">ENGLISH</span>
                  <span className="bg-white/10 text-[9px] font-black tracking-widest px-2.5 py-1.5 rounded-lg border border-white/5 text-blue-400">ARABIC (RTL)</span>
                  <span className="bg-white/5 text-[9px] font-black tracking-widest px-2.5 py-1.5 rounded-lg border border-white/5 text-[#666]">MULTI</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#888] font-bold mb-4">Output Artifact</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-light">MS Word</span>
                    <span className="text-[10px] text-[#666] font-bold">DOCX</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "33%" }}
                      className="h-full bg-blue-400"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] uppercase tracking-widest text-[#555] font-black">
                    <span>Precise</span>
                    <span>Adaptive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center gap-8 text-[9px] uppercase tracking-[0.3em] text-[#555] font-black">
            <span>Neural Core v4.2.0</span>
            <span className="text-blue-500/50">End-to-End Encrypted</span>
            <span>Standard: IEEE 2026</span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <div className="text-[11px] font-black uppercase tracking-widest text-white">L. Synthesis</div>
              <div className="text-[10px] text-[#555] uppercase tracking-tighter">Instance Active</div>
            </div>
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center font-serif italic text-xl border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              L
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
