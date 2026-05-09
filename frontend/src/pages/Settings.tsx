import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-government-blue" />
        <h1 className="text-3xl font-bold text-government-blue">Account Settings</h1>
      </div>
      
      <Card className="shadow-md border-t-4 border-t-government-blue">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your e-Kavach account settings and configurations here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-government-muted">Settings panel is currently under development. Preferences will be available in a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
}
