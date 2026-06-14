"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const allSections = [
  { id: "hero", label: "Intro" },
  { id: "about", label: "About Me" },
  { id: "featured", label: "Featured" },
  { id: "projects", label: "Projects" },
  { id: "posts", label: "Writings" },
  { id: "contact", label: "Contact" },
];

export default function QuickNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [validSections, setValidSections] = useState<{id: string, label: string}[]>([]);
  
  // Advanced Cinematic States
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLabels, setShowLabels] = useState(true); // NEW: Only controls the text labels now!
  const [scrubbedSection, setScrubbedSection] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. The Wake Up Engine: Shows the text labels, and schedules them to fade out after 2s
  const wakeUpLabels = useCallback(() => {
    setShowLabels(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // If we are actively hovering or dragging, keep the labels awake
    if (!isHovered && !isDragging) {
      timeoutRef.current = setTimeout(() => {
        setShowLabels(false);
      }, 2000);
    }
  }, [isHovered, isDragging]);

  // 2. Keep the labels fully awake while interacting with the menu
  useEffect(() => {
    wakeUpLabels();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isHovered, isDragging, wakeUpLabels]);

  useEffect(() => {
    const existingSections = allSections.filter(s => document.getElementById(s.id));
    setValidSections(existingSections);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" } 
    );

    existingSections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // 3. Global Scroll Listener: Any scroll triggers the labels to wake up
    const handleScroll = () => wakeUpLabels();
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    wakeUpLabels(); // Wake up instantly on first page load

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [wakeUpLabels]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
    calculateAndScroll(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setScrubbedSection(null);
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    calculateAndScroll(e);
  };

  const calculateAndScroll = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const buttons = Array.from(containerRef.current.querySelectorAll('button'));
    let closestId = "";
    let minDistance = Infinity;

    buttons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(e.clientY - centerY);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestId = btn.getAttribute('data-target-id') || "";
      }
    });

    if (closestId && closestId !== scrubbedSection) {
      setScrubbedSection(closestId);
      scrollTo(closestId);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // THE FIX: The main wrapper is now permanently visible and interactive!
      className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col gap-6 items-end py-4 px-2 select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {validSections.map((section) => {
        const isCurrent = isDragging ? scrubbedSection === section.id : activeSection === section.id;
        
        // THE FIX: The label only shows if it's the active section AND the timeout hasn't finished
        const isLabelVisible = isCurrent && showLabels;
        
        return (
          <button
            key={section.id}
            data-target-id={section.id}
            className="group relative flex items-center justify-end w-16 h-6 outline-none cursor-pointer"
            aria-label={`Scroll to ${section.label}`}
          >
            {/* The Text Label (Fades in/out on timeout) */}
            <span className={`absolute right-10 px-3 py-1.5 rounded-lg bg-black/80 dark:bg-white/10 text-white dark:text-gray-200 text-xs font-bold tracking-wider uppercase transition-all duration-300 backdrop-blur-md border border-white/10 shadow-lg whitespace-nowrap pointer-events-none ${
              isLabelVisible ? "opacity-100 -translate-x-2" : "opacity-0 group-hover:opacity-100 group-hover:-translate-x-2"
            }`}>
              {section.label}
            </span>
            
            {/* The Dash Indicator (Always visible!) */}
            <div 
              className={`h-[3px] rounded-full transition-all duration-300 ease-out ${
                isCurrent 
                  ? "w-8 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" 
                  : "w-3 bg-gray-400/50 group-hover:bg-gray-400 group-hover:w-5"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}