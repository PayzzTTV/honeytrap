"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [key, setKey] = useState('');
  const [accessKey, setAccessKey] = useState('HONEYTRAP_2024');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(config => {
        if (config.accessKey) setAccessKey(config.accessKey);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (key === accessKey) {
      document.cookie = `soc_access_key=granted; path=/; max-age=3600`;
      router.push('/');
    } else {
      alert("INVALID CLEARANCE LEVEL");
    }
  };

  return (
    <div className="bg-[#0a0f1e] min-h-screen flex items-center justify-center font-mono">
      <div className="bg-[#0f172a] border border-red-500/50 p-8 rounded-lg shadow-2xl shadow-red-500/10 w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-red-500 mb-2">RESTRICTED ACCESS</h1>
          <p className="text-gray-500 text-xs">HONEYTRAP SOC TERMINAL v2.0</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xs mb-2">OPERATOR ACCESS KEY</label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 p-3 rounded text-cyan-500 focus:border-cyan-500 outline-none transition-colors"
              placeholder="••••••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-red-500/10 border border-red-500 text-red-500 py-3 rounded hover:bg-red-500 hover:text-white transition-all font-bold tracking-widest text-sm"
          >
            AUTHORIZE SESSION
          </button>
        </form>
        <p className="text-[10px] text-gray-600 mt-8 text-center">
          WARNING: UNAUTHORIZED ACCESS IS LOGGED AND PROSECUTED.
        </p>
      </div>
    </div>
  );
}
