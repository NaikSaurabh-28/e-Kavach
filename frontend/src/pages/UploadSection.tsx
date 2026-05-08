import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, ShieldAlert, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UploadSection() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'scanning' | 'success' | 'blocked'>('idle');
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
        setUploadStatus('idle');
        setScanLogs([]);
      } else {
        alert('Invalid file format. Please upload PDF or DOCX.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setScanLogs([]);
    }
  };

  const addLog = (msg: string, delay: number) => {
    setTimeout(() => {
      setScanLogs((prev) => [...prev, msg]);
    }, delay);
  };

  const submitFiling = async () => {
    if (!file) return;
    
    setUploadStatus('scanning');
    setScanLogs(['[SYS] Initiating advanced threat protection scan...']);
    
    addLog(`[TARGET] Analyzing file footprint: ${file.name}`, 800);
    addLog('[MODULE] Executing heuristic analysis engine...', 1600);
    addLog('[NET] Checking signature against known threat databases...', 2400);

    try {
      // Mock backend API call
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate API call and scanning delay
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      // Since we don't have a real backend, we mock the fetch call failure and fallback to a random result
      // Let's pretend files ending in 'virus.pdf' fail, otherwise succeed.
      if (file.name.toLowerCase().includes('virus')) {
        throw new Error('Malware signature detected');
      }

      addLog('[SECURE] No malicious payloads found. File integrity verified.', 3600);
      setTimeout(() => setUploadStatus('success'), 4200);

    } catch (error) {
      addLog(`[ALERT] FATAL: Threat signature matched. Quarantine protocol activated.`, 3600);
      setTimeout(() => setUploadStatus('blocked'), 4200);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="border-t-4 border-t-government-blue shadow-lg">
        <CardHeader>
          <CardTitle>e-File Document Upload</CardTitle>
          <CardDescription>Upload your legal documents. All files are subjected to military-grade cybersecurity scanning.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Upload Zone */}
            <div 
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive ? "border-government-blue bg-blue-50 scale-[1.02]" : "border-government-muted/40 hover:border-government-blue/60"
              } ${uploadStatus !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center space-y-4 h-full justify-center">
                  <div className="p-4 bg-green-50 rounded-full border border-green-200">
                    <File className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-government-text">{file.name}</span>
                    {uploadStatus === 'idle' && (
                      <button onClick={() => setFile(null)} className="text-government-muted hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-medium text-government-muted">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown Type'}</p>
                  
                  {uploadStatus === 'idle' && (
                    <div className="pt-6 flex space-x-3 w-full">
                      <Button variant="outline" className="flex-1" onClick={() => setFile(null)}>Cancel</Button>
                      <Button className="flex-1 bg-government-blue hover:bg-government-blue/90" onClick={submitFiling}>
                        Upload & Scan
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-5 py-6">
                  <div className="p-5 bg-government-blue/5 rounded-full ring-8 ring-government-blue/5">
                    <UploadCloud className="w-12 h-12 text-government-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-government-text text-lg">Drag & Drop your files here</p>
                    <p className="text-sm text-government-muted mt-1">or click to browse from your computer</p>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <span className="px-2 py-1 bg-gray-100 text-xs font-semibold rounded text-gray-600">PDF</span>
                    <span className="px-2 py-1 bg-gray-100 text-xs font-semibold rounded text-gray-600">DOCX</span>
                  </div>
                  <Button className="mt-6 shadow-sm" onClick={() => document.getElementById('file-upload')?.click()}>
                    Browse Files
                  </Button>
                  <input id="file-upload" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleFileSelect} />
                </div>
              )}
            </div>

            {/* Cyber Scan Dashboard */}
            <div className="flex flex-col h-[400px] rounded-xl overflow-hidden bg-[#0a0a0a] border border-gray-800 shadow-inner relative">
              <div className="h-10 bg-[#1a1a1a] border-b border-gray-800 flex items-center px-4 justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-mono text-gray-400">THREAT_ANALYSIS_TERMINAL</span>
                </div>
                {uploadStatus === 'scanning' && (
                  <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                )}
              </div>
              
              <div className="flex-1 p-4 font-mono text-xs md:text-sm overflow-y-auto space-y-2 relative">
                {!file && uploadStatus === 'idle' && (
                  <p className="text-gray-600">Awaiting file input for analysis...</p>
                )}

                <AnimatePresence>
                  {scanLogs.map((log, idx) => (
                    <motion.p 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${log.includes('FATAL') || log.includes('ALERT') ? 'text-red-500' : 'text-green-500'}`}
                    >
                      {log}
                    </motion.p>
                  ))}
                </AnimatePresence>

                {uploadStatus === 'scanning' && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-green-500/30 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
                  </div>
                )}
              </div>

              {/* Status Footer */}
              {uploadStatus === 'success' && (
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  className="h-16 bg-green-900/50 border-t border-green-800 flex items-center justify-center space-x-3 absolute bottom-0 w-full"
                >
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                  <span className="font-mono text-green-400 font-bold tracking-wider">FILE CLEARED FOR UPLOAD</span>
                </motion.div>
              )}

              {uploadStatus === 'blocked' && (
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  className="h-16 bg-red-900/50 border-t border-red-800 flex items-center justify-center space-x-3 absolute bottom-0 w-full"
                >
                  <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                  <span className="font-mono text-red-500 font-bold tracking-wider">UPLOAD BLOCKED: QUARANTINED</span>
                </motion.div>
              )}
            </div>

          </div>
        </CardContent>
      </Card>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-10px); }
          50% { transform: translateY(350px); }
          100% { transform: translateY(-10px); }
        }
      `}} />
    </motion.div>
  );
}
