"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { tinykeys } from 'tinykeys';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useTheme } from 'next-themes';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  
  // Theme and Clipboard states
  const { theme, setTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Keyboard Listeners (Cmd+K / Ctrl+K and ESC)
  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      "$mod+KeyK": (event) => {
        event.preventDefault();
        setIsOpen((open) => !open);
      },
      "Escape": () => {
        setIsOpen(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Click Listener (Listens for the Navbar Search button)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  // 3. Fetch Database Data when Opened
  useEffect(() => {
    if (isOpen && projects.length === 0) {
      const fetchData = async () => {
        setIsLoading(true);
        const [projectsRes, postsRes] = await Promise.all([
          supabase.from('projects').select('id, title, tech_stack').eq('is_archived', false),
          supabase.from('posts').select('id, title, slug').eq('is_archived', false)
        ]);
        
        if (projectsRes.data) setProjects(projectsRes.data);
        if (postsRes.data) setPosts(postsRes.data);
        setIsLoading(false);
      };
      fetchData();
    }
    
    // Prevent background scrolling
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearch('');
      setCopied(false); // Reset copy state when closed
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsOpen(false);
  };

  const navigateTo = (path: string) => {
    setIsOpen(false);
    setSearch('');
    router.push(path);
  };

  // Quick Action Functions
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('mahamudh48@gmail.com');
    setCopied(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setIsOpen(false);
  };

  // Filter Engine
  const filteredProjects = useMemo(() => {
    if (!search) return projects;
    const lowerSearch = search.toLowerCase();
    return projects.filter(p => 
      p.title.toLowerCase().includes(lowerSearch) || 
      (p.tech_stack && p.tech_stack.some((tech: string) => tech.toLowerCase().includes(lowerSearch)))
    );
  }, [search, projects]);

  const filteredPosts = useMemo(() => {
    if (!search) return posts;
    return posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  }, [search, posts]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className="w-full max-w-2xl glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-gray-200 dark:border-white/10">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                autoFocus
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by name or tech stack, read posts..." 
                className="flex-1 bg-transparent border-none outline-none px-4 py-5 text-lg text-gray-900 dark:text-white placeholder-gray-500"
              />
              <span className="text-xs font-mono px-2 py-1 bg-gray-200/50 dark:bg-white/10 text-gray-500 rounded border border-gray-300 dark:border-white/20">
                ESC
              </span>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
                
                {isLoading ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm animate-pulse">Loading database...</div>
                ) : (
                  <>
                    {filteredProjects.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Projects
                        </div>
                        {filteredProjects.map((project) => (
                          <button 
                            key={project.id} 
                            onClick={() => navigateTo(`/project/${project.id}`)} 
                            className="w-full text-left flex items-center justify-between px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                              <span className="font-medium group-hover:text-blue-500 transition-colors">{project.title}</span>
                            </div>
                            <div className="hidden sm:flex gap-2">
                               {project.tech_stack?.slice(0, 3).map((tech: string) => (
                                 <span key={tech} className="text-[10px] px-2 py-1 bg-gray-200/50 dark:bg-black/40 text-gray-600 dark:text-gray-400 rounded-md border border-gray-300 dark:border-white/10">{tech}</span>
                               ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredPosts.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Articles & Posts
                        </div>
                        {filteredPosts.map((post) => (
                          <button 
                            key={post.id} 
                            onClick={() => navigateTo(`/post/${post.slug}`)} 
                            className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors group"
                          >
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                            <span className="font-medium group-hover:text-purple-500 transition-colors">{post.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                      <div className="px-3 py-2 mt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Quick Actions
                      </div>
                      
                      <button onClick={() => navigateTo('/')} className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Home Portfolio
                      </button>

                      <button onClick={handleCopyEmail} className="w-full text-left flex items-center justify-between px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <svg className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {copied ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            )}
                          </svg>
                          <span className={copied ? 'text-green-500 font-medium' : ''}>{copied ? 'Copied to clipboard!' : 'Copy Email Address'}</span>
                        </div>
                      </button>

                      <button onClick={handleToggleTheme} className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
                      </button>

                    </div>

                    {/* Empty State */}
                    {filteredProjects.length === 0 && filteredPosts.length === 0 && (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        No results found for "{search}"
                      </div>
                    )}
                  </>
                )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}