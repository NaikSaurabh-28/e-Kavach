import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-fill credentials if saved
    const savedUser = localStorage.getItem('ekavach_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.username) setUsername(parsed.username);
        // Pre-fill password as requested for saved credentials feature
        if (parsed.password) setPassword(parsed.password);
      } catch (e) {}
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      
      if (isSignup) {
        // Handle Signup logic
        localStorage.setItem('ekavach_user', JSON.stringify({ username, password }));
        localStorage.setItem('current_user', username);
        navigate('/dashboard');
      } else {
        // Handle Login logic
        const savedUser = localStorage.getItem('ekavach_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed.username === username && parsed.password === password) {
              localStorage.setItem('current_user', username);
              navigate('/dashboard');
            } else {
              setError('Invalid credentials. Please try again.');
            }
          } catch(e) {
            setError('Error reading saved credentials.');
          }
        } else {
          setError('User not found. Please sign up first.');
        }
      }
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
              <CardTitle className="text-2xl font-bold text-government-text">
                {isSignup ? 'Create Account' : 'e-Filing Portal'}
              </CardTitle>
              <CardDescription>Government of India • Central e-Courts System</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-government-text">
                  Advocate / Party Name (Username)
                </label>
                <Input 
                  placeholder="Enter your registered ID" 
                  required 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-government-text">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm text-center font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Authenticating...' : (isSignup ? 'Secure Sign Up' : 'Secure Login')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-center space-y-3 text-sm text-government-muted pt-2 border-t border-gray-100 mt-2">
            <button 
              type="button" 
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="text-government-blue hover:underline font-semibold"
            >
              {isSignup ? 'Already have an account? Log in' : 'New User? Sign up here'}
            </button>
            <p className="text-xs">By continuing, you agree to the Terms of Service and Privacy Policy of the e-Filing system.</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
