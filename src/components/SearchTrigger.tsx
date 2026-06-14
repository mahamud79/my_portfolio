"use client";

import Magnetic from "./Magnetic"; // <-- NEW IMPORT

export default function SearchTrigger() {
  return (
    <Magnetic>
      <button 
        onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 glass-panel rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <span>Search</span>
        <span className="font-mono bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs ml-1">⌘K</span>
      </button>
    </Magnetic>
  );
}