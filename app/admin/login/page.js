"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        router.push('/admin');
        router.refresh(); 
      } else {
        const data = await res.json();
        setError(data.message || 'ERR: Authentication Failed');
      }
    } catch (err) {
      setError('ERR: Network Connection Lost');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans selection:bg-yellow-500/30 relative overflow-hidden">
      
      {/* Background grid effect for terminal vibe */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#eab308 1px, transparent 1px), linear-gradient(90deg, #eab308 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-sm bg-[#0a0a0a] border border-zinc-800 p-8 md:p-10 rounded-sm shadow-[0_0_40px_rgba(234,179,8,0.02)] relative z-10"
      >
        {/* Top security accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>

        {/* Status Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-yellow-500 text-[10px] font-mono tracking-[0.2em] uppercase">Restricted Area</span>
        </div>

        <h1 className="text-xl font-light tracking-[0.2em] text-white mb-8 text-center uppercase">
          System Login
        </h1>
        
        {error && (
          <div className="mb-6 text-red-500 text-[10px] font-mono tracking-widest border border-red-900/50 bg-red-950/20 p-3 rounded-sm text-center uppercase">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Username Input */}
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2 font-mono">
              Admin ID
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-yellow-500 transition-colors font-mono text-sm placeholder-zinc-800"
              placeholder="Enter ID..."
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2 font-mono">
              Passcode
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-yellow-500 transition-colors font-mono text-sm placeholder-zinc-800"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-8 bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-sm text-[11px] font-bold font-mono uppercase tracking-[0.2em] transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? 'Authenticating...' : 'Initialize Connection'}
        </button>

        {/* Footer Warning */}
        <div className="mt-8 text-center border-t border-zinc-800/50 pt-6">
          <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
            Unauthorized access strictly prohibited
            <br />
            IP logged upon attempt
          </p>
        </div>
      </form>
    </div>
  );
}