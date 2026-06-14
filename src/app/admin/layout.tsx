"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 1. Loading State
  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Secure Area...</div>;
  }

  // 2. Login Screen (If not authenticated)
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-900/40 border border-gray-800 p-8 rounded-2xl backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Access</h1>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white mb-4 focus:border-gray-500 outline-none"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white mb-6 focus:border-gray-500 outline-none"
          />
          <button type="submit" className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition">
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  // 3. The Admin Dashboard Layout (If authenticated)
  return (
    <div className="h-screen w-full flex bg-black text-white font-sans overflow-hidden">
      
      {/* Sidebar Navigation - Now fixed to screen height */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900/20 p-6 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <h2 className="text-xl font-bold mb-8 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <nav className="flex flex-col gap-2">
            <Link href="/admin" className={`p-3 rounded-lg transition ${pathname === '/admin' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
              Add Project
            </Link>
            <Link href="/admin/manage" className={`p-3 rounded-lg transition ${pathname === '/admin/manage' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
              Manage Projects
            </Link>
            
            <Link href="/admin/posts" className={`p-3 rounded-lg transition ${pathname === '/admin/posts' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
              Write Post
            </Link>
            
            {/* NEW: Manage Posts Link */}
            <Link href="/admin/manage-posts" className={`p-3 rounded-lg transition ${pathname === '/admin/manage-posts' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
              Manage Posts
            </Link>

            <Link href="/admin/profile" className={`p-3 rounded-lg transition ${pathname === '/admin/profile' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
              Edit Profile
            </Link>

            <Link href="/" target="_blank" className="p-3 rounded-lg text-gray-400 hover:bg-gray-900 transition mt-4 border-t border-gray-800 pt-4">
              View Live Site ↗
            </Link>
          </nav>
        </div>
        
        {/* Bottom Actions Area */}
        <div className="flex flex-col gap-1 border-t border-gray-800 pt-4">
          <button disabled className="text-left p-3 text-sm text-gray-600 rounded-lg cursor-not-allowed">
            Change Password (Soon)
          </button>
          <button onClick={handleLogout} className="text-left p-3 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area - Now scrolls independently */}
      <main data-lenis-prevent className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}