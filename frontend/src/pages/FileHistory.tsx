import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
ShieldAlert,
ShieldCheck,
Search,
ArrowUpDown,
FileText,
Trash2
} from 'lucide-react';

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
const [filterStatus, setFilterStatus] = useState<'All' | 'Safe' | 'Blocked'>('All');

const [sortConfig, setSortConfig] = useState<{
key: keyof ScanRecord;
direction: 'asc' | 'desc';
} | null>({
key: 'date',
direction: 'desc'
});

useEffect(() => {
const stored = localStorage.getItem('eKavach_scanHistory');

```
if (stored) {
  try {
    setHistory(JSON.parse(stored).reverse());
  } catch {
    setHistory([]);
  }
}
```

}, []);

const clearHistory = () => {
localStorage.removeItem('eKavach_scanHistory');
setHistory([]);
};

const handleSort = (key: keyof ScanRecord) => {
let direction: 'asc' | 'desc' = 'asc';

```
if (
  sortConfig &&
  sortConfig.key === key &&
  sortConfig.direction === 'asc'
) {
  direction = 'desc';
}

setSortConfig({ key, direction });
```

};

const filteredAndSortedData = useMemo(() => {
let result = [...history];

```
if (searchQuery) {
  result = result.filter(
    item =>
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.classification.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

if (filterStatus !== 'All') {
  result = result.filter(item =>
    filterStatus === 'Safe'
      ? item.status === 'safe'
      : item.status === 'malicious'
  );
}

if (sortConfig) {
  result.sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue)
      return sortConfig.direction === 'asc' ? -1 : 1;

    if (aValue > bValue)
      return sortConfig.direction === 'asc' ? 1 : -1;

    return 0;
  });
}

return result;
```

}, [history, searchQuery, filterStatus, sortConfig]);

const viewReport = (item: ScanRecord) => {
navigate('/dashboard/reports', {
state: {
scanResult: {
status: item.status,
score: item.score,
classification: item.classification,
issues: item.issues,
},
fileInfo: {
name: item.filename,
size: 0,
},
},
});
};

return (
<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
className="space-y-6 max-w-6xl mx-auto"
> <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"> <div> <h2 className="text-2xl font-semibold text-government-text">
Upload History & Logs </h2>

```
      <p className="text-government-muted">
        Audit trail of all scanned documents and their security verdicts.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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

      <select
        className="h-10 px-3 py-2 border border-input rounded-md bg-white text-sm"
        value={filterStatus}
        onChange={(e) =>
          setFilterStatus(e.target.value as 'All' | 'Safe' | 'Blocked')
        }
      >
        <option value="All">All Statuses</option>
        <option value="Safe">Safe Only</option>
        <option value="Blocked">Blocked Only</option>
      </select>

      {history.length > 0 && (
        <Button
          variant="outline"
          className="bg-white text-red-500 border-red-200 hover:bg-red-50"
          onClick={clearHistory}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  </div>

  <Card className="shadow-md">
    <CardHeader className="pb-4">
      <CardTitle>
        File Security Records ({filteredAndSortedData.length})
      </CardTitle>
    </CardHeader>

    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-government-muted uppercase bg-gray-50 border-y border-government-accent">
            <tr>
              <th
                className="px-6 py-4 font-semibold cursor-pointer"
                onClick={() => handleSort('filename')}
              >
                <div className="flex items-center space-x-1">
                  <span>File Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th
                className="px-6 py-4 font-semibold cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="px-6 py-4 font-semibold">
                Status
              </th>

              <th
                className="px-6 py-4 font-semibold cursor-pointer"
                onClick={() => handleSort('classification')}
              >
                <div className="flex items-center space-x-1">
                  <span>Classification</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th
                className="px-6 py-4 font-semibold cursor-pointer"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center space-x-1">
                  <span>Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="px-6 py-4 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-government-accent bg-white">
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-government-muted"
                >
                  No scan history found.
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-government-text flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-government-blue" />
                    <span>{item.filename}</span>
                  </td>

                  <td className="px-6 py-4 text-government-muted">
                    {item.date}
                  </td>

                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'safe'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status === 'safe' ? (
                        <ShieldCheck className="w-3 h-3 mr-1" />
                      ) : (
                        <ShieldAlert className="w-3 h-3 mr-1" />
                      )}

                      {item.status}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-government-text">
                    {item.classification}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`font-bold ${
                        item.score > 70
                          ? 'text-red-600'
                          : item.score > 20
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}
                    >
                      {item.score}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-government-blue"
                      onClick={() => viewReport(item)}
                    >
                      View Report
                    </Button>
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
```

);
}
