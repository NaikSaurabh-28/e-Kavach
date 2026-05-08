import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DashboardOverview() {
  const stats = [
    { title: 'Pending Actions', value: '3', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Approved Filings', value: '12', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Rejected/Issues', value: '1', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Total Documents', value: '24', icon: FileText, color: 'text-government-blue', bg: 'bg-blue-50' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-government-text">Overview</h2>
        <p className="text-government-muted">Summary of your recent filings and system status.</p>
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
            <CardTitle>Recent Filings</CardTitle>
            <CardDescription>Latest documents submitted to the e-Courts system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 rounded-lg border border-government-accent bg-government-bg/50">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-5 h-5 text-government-blue" />
                    <div>
                      <p className="font-medium text-sm text-government-text">Writ Petition (Civil) No. 2023</p>
                      <p className="text-xs text-government-muted">Uploaded on Oct 12, 2023</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                    Scrutiny Pending
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Security</CardTitle>
            <CardDescription>Automated threat analysis status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-government-text">All Systems Secure</p>
              <p className="text-sm text-government-muted mt-1">Last scan completed 10 mins ago. No threats detected in recent uploads.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
