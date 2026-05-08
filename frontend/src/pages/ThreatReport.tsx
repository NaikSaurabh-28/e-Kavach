import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Activity, FileKey, Cpu, Zap, AlertTriangle, Fingerprint, Eye, Clock, Crosshair } from 'lucide-react';

export default function ThreatReport() {
  const threatScore = 89; // Out of 100
  const classification = 'Ransomware / CryptoLocker Variant';
  
  const indicators = [
    { label: 'Obfuscated PowerShell script detected in payload', severity: 'high' },
    { label: 'Attempts to modify Windows Registry (AutoRun)', severity: 'high' },
    { label: 'Contains highly entropic encrypted blocks', severity: 'medium' },
    { label: 'Connects to known malicious Tor node IP', severity: 'high' },
    { label: 'Suspiciously small file size for alleged document type', severity: 'low' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-government-text flex items-center">
            <Crosshair className="w-8 h-8 mr-3 text-red-600" />
            Threat Analysis Engine
          </h2>
          <p className="text-government-muted mt-1">Deep inspection report for flagged document upload.</p>
        </div>
        <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200 shadow-sm">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm tracking-wide">QUARANTINE ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Threat Score Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-t-4 border-t-red-600 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Activity className="w-32 h-32 text-red-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overall Threat Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-8 border-red-100 mb-4">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-red-500"
                    strokeDasharray="377"
                    strokeDashoffset={377 - (377 * threatScore) / 100}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out', transformOrigin: 'center' }}
                  />
                </svg>
                <div className="text-center">
                  <span className="text-5xl font-black text-red-600">{threatScore}</span>
                  <span className="text-sm text-red-400 block font-bold">/100</span>
                </div>
              </div>
              <div className="text-center space-y-1">
                <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded">
                  Critical Danger
                </span>
                <p className="text-sm font-semibold text-government-text mt-2">{classification}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* File Metadata */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="h-full shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileKey className="w-5 h-5 mr-2 text-government-blue" />
                Forensic File Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-government-muted font-medium uppercase tracking-wider">File Name</p>
                    <p className="font-mono text-sm font-semibold text-government-text break-all">evidence_annexure_v2.docx.exe</p>
                  </div>
                  <div>
                    <p className="text-xs text-government-muted font-medium uppercase tracking-wider">SHA-256 Hash</p>
                    <p className="font-mono text-xs text-government-text bg-gray-100 p-1.5 rounded break-all">
                      e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-government-muted font-medium uppercase tracking-wider flex items-center">
                      <Fingerprint className="w-3 h-3 mr-1" /> Magic Bytes Signature
                    </p>
                    <p className="font-mono text-sm text-government-text">MZ (Executable), Spoofing DOCX</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-government-muted font-medium uppercase tracking-wider">Size</p>
                      <p className="font-mono text-sm text-government-text">2.4 MB</p>
                    </div>
                    <div>
                      <p className="text-xs text-government-muted font-medium uppercase tracking-wider flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Analysis Time
                      </p>
                      <p className="font-mono text-sm text-government-text">1.2s ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suspicious Indicators */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full shadow-md">
            <CardHeader className="border-b border-government-accent bg-gray-50/50">
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                Suspicious Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-government-accent">
                {indicators.map((indicator, idx) => (
                  <div key={idx} className="p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors">
                    <div className={`mt-0.5 p-1.5 rounded-full border ${getSeverityColor(indicator.severity)}`}>
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-government-text">{indicator.label}</p>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${
                        indicator.severity === 'high' ? 'text-red-600' : 
                        indicator.severity === 'medium' ? 'text-amber-600' : 'text-yellow-600'
                      }`}>
                        {indicator.severity} Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Explanation Box */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full shadow-md bg-gradient-to-br from-government-blue to-blue-900 text-white border-none">
            <CardHeader>
              <CardTitle className="flex items-center text-white text-xl">
                <Cpu className="w-6 h-6 mr-2 text-blue-300" />
                AI Contextual Analysis
              </CardTitle>
              <CardDescription className="text-blue-200">
                Generated by e-Kavach Neural Threat Engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 p-5 rounded-lg border border-white/20 backdrop-blur-sm">
                <p className="text-lg leading-relaxed font-light">
                  This file is highly deceptive. While labeled as a DOCX file, the magic byte signature indicates it is a compiled Windows Executable (<span className="font-mono bg-black/20 px-1 rounded">.exe</span>). 
                </p>
                <p className="text-lg leading-relaxed font-light mt-4">
                  Upon sandbox detonation, the AI observed the payload extracting an encrypted payload into memory and attempting to modify the host's AutoRun registry keys. Network traffic analysis confirmed a beacon sent to a known malicious Tor exit node associated with the <strong>LockBit</strong> ransomware syndicate.
                </p>
              </div>
              <div className="flex items-center p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <Zap className="w-5 h-5 text-red-300 mr-3 flex-shrink-0" />
                <p className="text-sm font-medium text-red-100">
                  Recommendation: Immediately purge from system memory. Do not execute under any circumstances. Target IP has been added to the national firewall blocklist.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
