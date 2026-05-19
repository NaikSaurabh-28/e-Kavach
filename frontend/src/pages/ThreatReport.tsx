import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert, ShieldCheck, Activity, FileKey, Cpu,
  AlertTriangle, Fingerprint, Eye, Clock, Crosshair, Loader2, ArrowLeft,
  Check, Download
} from 'lucide-react';

interface ScanResult {
  status: string;
  score: number;
  classification: string;
  issues: string[];
}

interface FileInfo {
  name: string;
  size: number;
}

export default function ThreatReport() {
  const location = useLocation();
  const navigate = useNavigate();

  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(true);

  const state = location.state as {
    scanResult?: ScanResult;
    fileInfo?: FileInfo;
    file?: File;
  } | null;

  const [sanitizing, setSanitizing] = useState(false);
  const [sanitizeResult, setSanitizeResult] = useState<any>(null);
  const [sanitizeError, setSanitizeError] = useState('');

  const handleSanitize = async () => {
    if (!state?.file) return;
    setSanitizing(true);
    setSanitizeError('');
    try {
      const formData = new FormData();
      formData.append('file', state.file);
      
      const response = await fetch('http://localhost:8000/sanitize', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Sanitization failed');
      const data = await response.json();
      if (data.success) {
        setSanitizeResult(data);
      } else {
        setSanitizeError(data.message || 'Sanitization failed');
      }
    } catch (err: any) {
      setSanitizeError(err.message || 'Network error');
    } finally {
      setSanitizing(false);
    }
  };

  const handleDownload = () => {
    if (!sanitizeResult?.filename) return;
    const url = `http://localhost:8000/download/${sanitizeResult.filename}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', sanitizeResult.filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    if (!state?.scanResult) return;

    const fetchExplanation = async () => {
      try {
        const response = await fetch('http://localhost:8000/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classification: state.scanResult!.classification,
            issues: state.scanResult!.issues,
            score: state.scanResult!.score,
          }),
        });
        if (!response.ok) throw new Error('Explain API failed');
        const data = await response.json();
        setAiExplanation(data.explanation || 'No explanation generated.');
      } catch {
        setAiExplanation(
          state.scanResult!.score === 0
            ? '✅ This document passed all security checks. No malicious content was found.'
            : '⚠️ Threats were detected. This file has been quarantined. Do not open or forward it.'
        );
      } finally {
        setLoadingAi(false);
      }
    };

    fetchExplanation();
  }, [state]);

  if (!state?.scanResult || !state?.fileInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-2xl mx-auto mt-10">
        <div className="bg-blue-50 p-6 rounded-full">
          <ShieldAlert className="w-16 h-16 text-government-blue" />
        </div>
        <h2 className="text-2xl font-bold text-government-text">No Active Threat Report</h2>
        <p className="text-government-muted max-w-md text-base">
          This page displays the real-time analysis of your most recently uploaded file. You haven't uploaded a file in this session yet.
        </p>
        <div className="flex space-x-4 pt-2">
          <Button onClick={() => navigate('/dashboard/upload')} className="bg-government-blue hover:bg-blue-800">
            Upload a Document
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/history')}>
            View Past History
          </Button>
        </div>
      </div>
    );
  }

  const { scanResult, fileInfo } = state;
  const score = scanResult.score;
  const isSafe = scanResult.status === 'safe' && score === 0;

  // Colour helpers
  const getScoreColor = () => {
    if (score === 0) return 'text-green-500';
    if (score < 25) return 'text-yellow-500';
    if (score < 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRingColor = () => {
    if (score === 0) return 'text-green-500';
    if (score < 25) return 'text-yellow-500';
    if (score < 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getBorderColor = () => {
    if (score === 0) return 'border-t-green-500';
    if (score < 25) return 'border-t-yellow-500';
    if (score < 50) return 'border-t-amber-500';
    return 'border-t-red-600';
  };

  const getBadgeStyle = () => {
    if (score === 0) return 'bg-green-600';
    if (score < 25) return 'bg-yellow-500';
    if (score < 50) return 'bg-amber-600';
    return 'bg-red-600';
  };

  const getBadgeLabel = () => {
    if (score === 0) return 'SAFE';
    if (score < 25) return 'SUSPICIOUS';
    if (score < 50) return 'MODERATE RISK';
    if (score < 75) return 'HIGH RISK';
    return 'CRITICAL THREAT';
  };

  const getSeverity = () => {
    if (score === 0) return 'low';
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    return 'high';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':   return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default:       return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const circumference = 2 * Math.PI * 60; // r=60 → ~377

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto pb-10"
    >
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/upload')}
              className="text-government-muted hover:text-government-text -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Upload
            </Button>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-government-text flex items-center">
            <Crosshair className="w-8 h-8 mr-3 text-red-600" />
            Threat Analysis Report
          </h2>
          <p className="text-government-muted mt-1">
            Deep inspection result for: <span className="font-semibold text-government-text">{fileInfo.name}</span>
          </p>
        </div>

        {/* Status badge */}
        {isSafe ? (
          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wide">SAFE FILE — CLEARED</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200 shadow-sm">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-sm tracking-wide">THREAT DETECTED — QUARANTINED</span>
          </div>
        )}
      </div>

      {/* Top cards: score + metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Score ring */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className={`h-full border-t-4 ${getBorderColor()} shadow-md relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Activity className="w-32 h-32 text-red-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overall Threat Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-8 border-gray-100 mb-4">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64" cy="64" r="60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className={getRingColor()}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * score) / 100}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                  />
                </svg>
                <div className="text-center">
                  <span className={`text-5xl font-black ${getScoreColor()}`}>{score}</span>
                  <span className="text-sm text-gray-400 block font-bold">/100</span>
                </div>
              </div>
              <div className="text-center space-y-1">
                <span className={`inline-block px-3 py-1 text-white text-xs font-bold uppercase tracking-wider rounded ${getBadgeStyle()}`}>
                  {getBadgeLabel()}
                </span>
                <p className="text-sm font-semibold text-government-text mt-2">{scanResult.classification}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* File Metadata */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="md:col-span-2">
          <Card className="h-full shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileKey className="w-5 h-5 mr-2 text-government-blue" />
                Forensic File Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-government-muted font-medium uppercase tracking-wider">File Name</p>
                    <p className="font-mono text-sm font-semibold text-government-text break-all">{fileInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-government-muted font-medium uppercase tracking-wider">Detection Status</p>
                    <p className={`font-semibold text-sm mt-0.5 ${isSafe ? 'text-green-600' : 'text-red-600'}`}>
                      {isSafe ? '✅ No threats detected' : `❌ ${scanResult.issues.length} indicator(s) found`}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-government-muted font-medium uppercase tracking-wider flex items-center">
                      <Fingerprint className="w-3 h-3 mr-1" /> File Size
                    </p>
                    <p className="font-mono text-sm text-government-text">
                      {fileInfo.size > 0 ? `${(fileInfo.size / 1024).toFixed(2)} KB` : 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-government-muted font-medium uppercase tracking-wider">Checks Run</p>
                      <p className="font-mono text-sm text-government-text font-bold">8 modules</p>
                    </div>
                    <div>
                      <p className="text-xs text-government-muted font-medium uppercase tracking-wider flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Scanned
                      </p>
                      <p className="font-mono text-sm text-government-text">
                        {new Date().toLocaleTimeString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom: indicators + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Suspicious Indicators */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full shadow-md">
            <CardHeader className="border-b border-government-accent bg-gray-50/50">
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                Suspicious Indicators ({scanResult.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {scanResult.issues.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                  <p className="text-sm text-government-muted">No suspicious indicators found.</p>
                  <p className="text-xs text-green-600 font-medium">File passed all 8 security checks.</p>
                </div>
              ) : (
                <div className="divide-y divide-government-accent max-h-64 overflow-y-auto">
                  {scanResult.issues.map((issue, idx) => (
                    <div key={idx} className="p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors">
                      <div className={`mt-0.5 p-1.5 rounded-full border flex-shrink-0 ${getSeverityColor(getSeverity())}`}>
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-government-text">{issue}</p>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          getSeverity() === 'high' ? 'text-red-600' :
                          getSeverity() === 'medium' ? 'text-amber-600' : 'text-yellow-600'
                        }`}>
                          {getSeverity()} risk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Explanation */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`h-full shadow-md border-none text-white ${
            isSafe
              ? 'bg-gradient-to-br from-green-700 to-green-900'
              : 'bg-gradient-to-br from-government-blue to-blue-900'
          }`}>
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
                {loadingAi ? (
                  <div className="flex flex-col items-center justify-center py-6 text-blue-200">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm animate-pulse">Neural engine generating explanation...</p>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed font-light whitespace-pre-wrap">{aiExplanation}</p>
                )}
              </div>

              {!isSafe && (
                <div className="flex items-start p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                  <ShieldAlert className="w-5 h-5 text-red-300 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-100">
                    <strong>Action Required:</strong> Do NOT open or forward this file. Report it to your system administrator immediately. The file has been quarantined.
                  </p>
                </div>
              )}

              {isSafe && (
                <div className="flex items-start p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <ShieldCheck className="w-5 h-5 text-green-300 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-green-100">
                    This document is safe to submit through the e-Kavach filing system.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sanitization Section */}
      {!isSafe && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          {fileInfo.name.toLowerCase().endsWith('.pdf') ? (
            <Card className="shadow-md border-t-4 border-t-government-blue">
              <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-government-blue flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Document Sanitization Available
                </CardTitle>
                <CardDescription className="text-government-muted">
                  We can remove all malicious elements from this PDF while keeping your original content intact.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!sanitizeResult ? (
                  <div className="space-y-4">
                    {sanitizeError && <p className="text-red-500 text-sm font-medium">{sanitizeError}</p>}
                    <Button 
                      className="w-full bg-government-blue hover:bg-blue-800 text-white font-bold py-6 text-lg"
                      onClick={handleSanitize}
                      disabled={sanitizing || !state?.file}
                    >
                      {sanitizing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sanitizing Document...
                        </>
                      ) : (
                        "Remove Threats and Get Clean PDF"
                      )}
                    </Button>
                    {!state?.file && <p className="text-xs text-center text-amber-600">File not available in session. Please re-upload to sanitize.</p>}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="text-green-800 font-bold flex items-center mb-3">
                        <Check className="w-5 h-5 mr-2" /> Document Sanitized Successfully
                      </h3>
                      <p className="text-green-700 text-sm mb-4">{sanitizeResult.message}</p>
                      
                      <div className="space-y-2 mb-6">
                        <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Removed Items:</p>
                        <ul className="space-y-1">
                          {sanitizeResult.removed_items.map((item: string, idx: number) => (
                            <li key={idx} className="text-sm text-green-700 flex items-center">
                              <Check className="w-3 h-3 mr-2 text-green-500" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                          onClick={handleDownload}
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download Clean PDF
                        </Button>
                        <div className="shrink-0">
                          {sanitizeResult.verified_clean ? (
                            <div className="bg-green-100 text-green-700 px-3 py-2 rounded-md flex items-center font-bold text-sm border border-green-200 shadow-sm">
                              <Check className="w-4 h-4 mr-1.5" /> Verified Clean ✓
                            </div>
                          ) : (
                            <div className="bg-amber-100 text-amber-700 px-3 py-2 rounded-md flex items-center font-bold text-sm border border-amber-200 shadow-sm">
                              <AlertTriangle className="w-4 h-4 mr-1.5" /> Review Required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-600 font-medium">
                Sanitization is available for PDF files only. Please request the sender to resubmit a clean document without macros.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
