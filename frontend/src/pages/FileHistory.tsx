import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function FileHistory() {
  const cases = [
    { id: 'W.P.(C) 102/2023', type: 'Writ Petition', status: 'Approved', date: 'Oct 14, 2023', icon: CheckCircle, color: 'text-green-500' },
    { id: 'C.A. 405/2023', type: 'Civil Appeal', status: 'Scrutiny Pending', date: 'Oct 12, 2023', icon: Clock, color: 'text-amber-500' },
    { id: 'S.L.P. 881/2023', type: 'Special Leave Petition', status: 'Defective', date: 'Oct 10, 2023', icon: AlertTriangle, color: 'text-red-500' },
    { id: 'W.P.(C) 095/2023', type: 'Writ Petition', status: 'Approved', date: 'Sep 28, 2023', icon: CheckCircle, color: 'text-green-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-government-text">File History</h2>
          <p className="text-government-muted">Track the historical progress of your submitted documents.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-government-muted" />
            <Input type="search" placeholder="Search Case No..." className="pl-8 bg-white" />
          </div>
          <Button variant="outline" className="flex items-center bg-white">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Filings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-government-accent">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-government-accent bg-government-bg/50 font-medium text-sm text-government-muted">
              <div className="col-span-4">Case Number & Type</div>
              <div className="col-span-3">Filing Date</div>
              <div className="col-span-3">Current Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-government-accent">
              {cases.map((c) => (
                <div key={c.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-government-bg/30 transition-colors bg-white">
                  <div className="col-span-4 flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-government-blue flex-shrink-0" />
                    <div>
                      <p className="font-medium text-government-text">{c.id}</p>
                      <p className="text-xs text-government-muted">{c.type}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-government-text">
                    {c.date}
                  </div>
                  <div className="col-span-3 flex items-center space-x-2">
                    <c.icon className={`w-4 h-4 ${c.color}`} />
                    <span className="font-medium text-government-text">{c.status}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <Button variant="ghost" size="sm" className="text-government-blue hover:text-government-blue/80">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
