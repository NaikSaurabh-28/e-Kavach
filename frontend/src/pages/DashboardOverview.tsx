import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, AlertTriangle, ShieldCheck, ShieldAlert, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ScanRecord {
  id: string;
  filename: string;
  date: string;
  score: number;
  classification: string;
  status: string;
  issues: string[];
}

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ScanRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('eKavach_scanHistory');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const totalDocs = history.length;
  const safeFiles = history.filter(h => h.status === 'safe').length;
  const maliciousFiles = history.filter(h => h.status === 'malicious').length;
  const pendingFiles = 0; // future feature

  const stats = [
    { title: 'Total Scanned', value: String(totalDocs), icon: FileText, color: 'text-government-blue', bg: 'bg-blue-50' },
    { title: 'Safe Files', value: String(safeFiles), icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Threats Found', value: String(maliciousFiles), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Pending Review', value: String(pendingFiles), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const recent = history.slice(-5).reverse();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-government-text">Dashboard Overview</h2>
        <p className="text-government-muted">Real-time scan statistics and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-government-muted">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-government-text">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Latest documents scanned by e-Kavach</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-full">
                  <Upload className="w-8 h-8 text-government-blue" />
                </div>
                <p className="text-government-muted text-sm">No documents scanned yet.</p>
                <Button className="bg-government-blue" onClick={() => navigate('/dashboard/upload')}>
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-government-accent bg-government-bg/50">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-5 h-5 text-government-blue flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-government-text truncate max-w-[200px]">{item.filename}</p>
                        <p className="text-xs text-government-muted">{item.date} · Score: {item.score}/100</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      item.status === 'safe' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'safe' ? 'Safe' : item.classification}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Security</CardTitle>
            <CardDescription>e-Kavach scan engine status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            {maliciousFiles > 0 ? (
              <>
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold text-government-text">{maliciousFiles} Threat(s) Detected</p>
                  <p className="text-sm text-government-muted mt-1">Malicious files found in recent scans. Review Reports page.</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-government-text">All Systems Secure</p>
                  <p className="text-sm text-government-muted mt-1">
                    {totalDocs > 0 ? `${totalDocs} document(s) scanned. No threats detected.` : 'Scanner is active and ready.'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
