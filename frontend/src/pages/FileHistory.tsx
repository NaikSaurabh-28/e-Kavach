import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, AlertTriangle, Search, Filter, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ScanRecord {
  id: string;
  filename: string;
  date: string;
  score: number;
  classification: string;
  status: string;
  issues: string[];
}

export default function FileHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'safe' | 'malicious'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('eKavach_scanHistory');
    if (stored) {
      try {
        setHistory(JSON.parse(stored).reverse());
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('eKavach_scanHistory');
    setHistory([]);
  };

  const filtered = history.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const viewReport = (item: ScanRecord) => {
    navigate('/dashboard/reports', {
      state: {
        scanResult: {
          status: item.status,
          score: item.score,
          classification: item.classification,
          issues: item.issues,
        },
        fileInfo: { name: item.filename, size: 0 },
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-government-text">Scan History</h2>
          <p className="text-government-muted">All documents previously scanned by e-Kavach.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-government-muted" />
            <Input
              type="search"
              placeholder="Search filename..."
              className="pl-8 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'safe' | 'malicious')}
            className="border border-government-accent rounded-md px-3 py-2 text-sm bg-white text-government-text focus:outline-none"
          >
            <option value="all">All</option>
            <option value="safe">Safe</option>
            <option value="malicious">Threats</option>
          </select>
          {history.length > 0 && (
            <Button variant="outline" className="bg-white text-red-500 border-red-200 hover:bg-red-50" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Scan Records ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <Filter className="w-8 h-8 text-government-blue" />
              </div>
              <p className="text-government-muted">
                {history.length === 0
                  ? 'No scan history found. Upload a document to get started.'
                  : 'No results match your search or filter.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-government-accent overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-government-accent bg-government-bg/50 font-medium text-sm text-government-muted">
                <div className="col-span-4">Filename</div>
                <div className="col-span-2">Date Scanned</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-2">Classification</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              <div className="divide-y divide-government-accent">
                {filtered.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-government-bg/30 transition-colors bg-white">
                    <div className="col-span-4 flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-government-blue flex-shrink-0" />
                      <div>
                        <p className="font-medium text-government-text truncate max-w-[160px]">{item.filename}</p>
                        <p className="text-xs text-government-muted">{item.issues.length} indicator(s)</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-government-text">{item.date}</div>
                    <div className="col-span-2">
                      <span className={`font-mono font-bold text-base ${
                        item.score === 0 ? 'text-green-600'
                        : item.score < 30 ? 'text-yellow-600'
                        : item.score < 55 ? 'text-amber-600'
                        : 'text-red-600'
                      }`}>
                        {item.score}/100
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                      {item.status === 'safe'
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <span className="font-medium text-government-text">{item.classification}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-government-blue hover:text-government-blue/80"
                        onClick={() => viewReport(item)}
                      >
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
