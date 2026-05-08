import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-government-bg">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588713009545-c261e411b51e?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-5" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-t-4 border-t-government-blue shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-government-blue/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <Scale className="w-8 h-8 text-government-blue" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-government-text">e-Filing Portal</CardTitle>
              <CardDescription>Government of India • Central e-Courts System</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-government-text">Advocate / Party Name</label>
                <Input placeholder="Enter your registered ID" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-government-text">Password</label>
                <Input type="password" placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Authenticating...' : 'Secure Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-center space-y-2 text-xs text-government-muted">
            <p>By logging in, you agree to the Terms of Service and Privacy Policy of the e-Filing system.</p>
            <a href="#" className="text-government-blue hover:underline">Forgot Password?</a>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
