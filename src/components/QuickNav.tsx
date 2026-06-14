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
  const [isVisible, setIsVisible] = useState(true);
  const [scrubbedSection, setScrubbedSection] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. The Wake Up Engine: Shows the nav, and schedules it to fade out after 2s of inactivity
  const wakeUpNav = useCallback(() => {
    setIsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // If we are actively hovering or dragging, DO NOT fade away
    if (!isHovered && !isDragging) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }
  }, [isHovered, isDragging]);

  // 2. Keep the nav fully awake while interacting with it
  useEffect(() => {
    wakeUpNav();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isHovered, isDragging, wakeUpNav]);

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

    // 3. Global Scroll Listener: Any scroll triggers the wake up
    const handleScroll = () => wakeUpNav();
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    wakeUpNav(); // Wake up instantly on first page load

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [wakeUpNav]);

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
    <>
      {/* THE HITBOX: An invisible boundary on the right edge. If the nav is hidden and your mouse hits this wall, it wakes up the nav! */}
      <div 
        className="fixed right-0 top-1/4 bottom-1/4 w-24 z-[99] hidden md:block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* THE NAV WRAPPER: Now features smooth translate and opacity transitions */}
      <div 
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col gap-6 items-end py-4 px-2 select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none"
        }`}
        style={{ touchAction: "none" }}
      >
        {validSections.map((section) => {
          const isCurrent = isDragging ? scrubbedSection === section.id : activeSection === section.id;
          
          return (
            <button
              key={section.id}
              data-target-id={section.id}
              className="group relative flex items-center justify-end w-16 h-6 outline-none cursor-pointer"
              aria-label={`Scroll to ${section.label}`}
            >
              <span className={`absolute right-10 px-3 py-1.5 rounded-lg bg-black/80 dark:bg-white/10 text-white dark:text-gray-200 text-xs font-bold tracking-wider uppercase transition-all duration-300 backdrop-blur-md border border-white/10 shadow-lg whitespace-nowrap pointer-events-none ${
                isCurrent ? "opacity-100 -translate-x-2" : "opacity-0 group-hover:opacity-100 group-hover:-translate-x-2"
              }`}>
                {section.label}
              </span>
              
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
    </>
  );
}