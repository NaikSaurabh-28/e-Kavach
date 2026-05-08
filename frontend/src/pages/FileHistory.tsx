import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ShieldCheck, Search, ArrowUpDown, Filter, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FileRecord {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'Safe' | 'Blocked';
  threatType: string;
  score: number;
}

const mockData: FileRecord[] = [
  { id: '1', fileName: 'affidavit_final.pdf', uploadDate: '2023-10-15T09:30:00Z', status: 'Safe', threatType: 'None', score: 2 },
  { id: '2', fileName: 'evidence_annexure.docx', uploadDate: '2023-10-14T14:15:00Z', status: 'Blocked', threatType: 'Macro Malware', score: 95 },
  { id: '3', fileName: 'petition_draft_v2.pdf', uploadDate: '2023-10-13T11:45:00Z', status: 'Safe', threatType: 'None', score: 0 },
  { id: '4', fileName: 'financial_records.xlsx.exe', uploadDate: '2023-10-12T08:20:00Z', status: 'Blocked', threatType: 'Trojan/Dropper', score: 99 },
  { id: '5', fileName: 'witness_statement.pdf', uploadDate: '2023-10-11T16:05:00Z', status: 'Safe', threatType: 'None', score: 5 },
  { id: '6', fileName: 'court_order_fake.pdf', uploadDate: '2023-10-10T10:10:00Z', status: 'Blocked', threatType: 'Phishing Link', score: 82 },
];

export default function FileHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Safe' | 'Blocked'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof FileRecord; direction: 'asc' | 'desc' } | null>({
    key: 'uploadDate',
    direction: 'desc'
  });

  const handleSort = (key: keyof FileRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...mockData];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(item => 
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.threatType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'All') {
      result = result.filter(item => item.status === filterStatus);
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchQuery, filterStatus, sortConfig]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-government-text">Upload History & Logs</h2>
          <p className="text-government-muted">Audit trail of all submitted documents and their security verdicts.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-government-muted" />
            <Input 
              type="search" 
              placeholder="Search files or threats..." 
              className="pl-8 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <select 
              className="h-10 px-3 py-2 border border-input rounded-md bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="All">All Statuses</option>
              <option value="Safe">Safe Only</option>
              <option value="Blocked">Blocked Only</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle>File Security Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-government-muted uppercase bg-gray-50 border-y border-government-accent">
                <tr>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('fileName')}>
                    <div className="flex items-center space-x-1">
                      <span>File Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('uploadDate')}>
                    <div className="flex items-center space-x-1">
                      <span>Upload Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('threatType')}>
                    <div className="flex items-center space-x-1">
                      <span>Threat Type</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('score')}>
                    <div className="flex items-center space-x-1">
                      <span>Score (0-100)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-government-accent bg-white">
                {filteredAndSortedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-government-muted">
                      No files match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData.map((file) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={file.id} 
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-government-text flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-government-blue" />
                        <span>{file.fileName}</span>
                      </td>
                      <td className="px-6 py-4 text-government-muted">
                        {formatDate(file.uploadDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          file.status === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {file.status === 'Safe' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                          {file.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-government-text">
                        {file.threatType}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${
                            file.score > 70 ? 'text-red-600' : file.score > 20 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {file.score}
                          </span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${file.score > 70 ? 'bg-red-500' : file.score > 20 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.max(5, file.score)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
