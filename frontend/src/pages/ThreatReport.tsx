import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ShieldCheck, Activity, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ThreatReport() {
  const scans = [
    { id: 'SCN-8821', file: 'affidavit_signed.pdf', status: 'Clean', time: '10:42 AM', icon: ShieldCheck, color: 'text-green-500' },
    { id: 'SCN-8820', file: 'evidence_annexure.zip', status: 'Flagged', time: '09:15 AM', icon: ShieldAlert, color: 'text-red-500' },
    { id: 'SCN-8819', file: 'petition_draft.docx', status: 'Clean', time: 'Yesterday', icon: ShieldCheck, color: 'text-green-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-government-text">Threat Report</h2>
        <p className="text-government-muted">Automated security scanning and compliance reports of uploaded documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <Activity className="w-6 h-6 text-government-blue" />
              </div>
              <div>
                <p className="text-sm text-government-muted">Active Scanners</p>
                <p className="text-xl font-bold text-government-text">4/4 Online</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-government-muted">Malware Definitions</span>
                <span className="font-medium text-green-600">Up to date</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-government-muted">Files Scanned (Today)</span>
                <span className="font-medium">124</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-government-muted">Threats Blocked</span>
                <span className="font-medium text-red-600">2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Security Scans</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-government-muted" />
              <Input type="search" placeholder="Search Reports..." className="pl-8 h-9 bg-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-3">
              {scans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg border border-government-accent bg-white transition-colors">
                  <div className="flex items-center space-x-4">
                    <scan.icon className={`w-5 h-5 ${scan.color}`} />
                    <div>
                      <p className="font-medium text-sm text-government-text">{scan.file}</p>
                      <p className="text-xs text-government-muted">{scan.id} • {scan.time}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    scan.status === 'Clean' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
