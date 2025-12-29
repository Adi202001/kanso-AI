
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { authRateLimiter, sanitizeInput } from '../services/security';
import { ArrowRight, Wind, AlertCircle, Lock, Mail } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    
    // 1. Rate Check
    if (!authRateLimiter.check()) {
      const resetTime = authRateLimiter.getTimeToReset();
      setError(`Too many attempts. Please try again in ${resetTime} seconds.`);
      return;
    }

    setLoading(true);
    try {
      // 2. Input Sanitization
      const safeEmail = sanitizeInput(email);
      // We don't sanitize password characters for hashing, but you might enforce length rules here.
      if (!safeEmail.includes('@')) throw new Error("Please enter a valid email address.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");

      if (isSignUp) {
        await api.signup(safeEmail, password);
      } else {
        await api.login(safeEmail, password);
      }
      
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isSignUp ? "Registration failed." : "Login failed. Check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFCF8] animate-fade-in relative overflow-hidden">
      {/* Background Decor - Minimalist Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-stone-100 rounded-full -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-stone-100 rounded-full -z-10" />

      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-stone-900 text-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
             <Wind size={24} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-5xl text-stone-900 mb-2 tracking-tight">Kanso</h1>
          <p className="text-stone-400 text-xs uppercase tracking-[0.2em]">Travel Simply</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1 group">
             <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 group-focus-within:text-stone-900 transition-colors flex items-center gap-2">
                <Mail size={12} /> Email
             </label>
             <input
               id="email"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="name@example.com"
               className="w-full bg-transparent border-b border-stone-200 py-3 text-lg font-serif text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
               autoFocus
             />
          </div>

          <div className="space-y-1 group">
             <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 group-focus-within:text-stone-900 transition-colors flex items-center gap-2">
                <Lock size={12} /> Password
             </label>
             <input
               id="password"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="••••••••"
               className="w-full bg-transparent border-b border-stone-200 py-3 text-lg font-serif text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
             />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-sm flex items-start gap-2 text-xs text-red-600 animate-slide-up">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full justify-between group h-14" 
              isLoading={loading}
              disabled={!email || !password || loading}
            >
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="text-center">
            <button 
               type="button" 
               onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
               className="text-xs text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-widest"
            >
               {isSignUp ? "Already have an account? Sign In" : "New to Kanso? Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
