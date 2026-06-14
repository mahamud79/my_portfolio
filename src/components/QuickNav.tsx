"use client";

import { useEffect, useState, useRef } from "react";

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
  
  const [isDragging, setIsDragging] = useState(false);
  const [scrubbedSection, setScrubbedSection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
    
    // When initially clicking down, we also want to calculate the closest dash immediately
    // This ensures a normal "click" works flawlessly even within the drag logic
    calculateAndScroll(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setScrubbedSection(null);
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    calculateAndScroll(e);
  };

  // Abstracted the calculation logic so it can be used on both Down and Move
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
      className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col gap-6 items-end py-4 px-2 select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {validSections.map((section) => {
        const isCurrent = isDragging ? scrubbedSection === section.id : activeSection === section.id;
        
        return (
          <button
            key={section.id}
            data-target-id={section.id}
            // Removed onClick. We handle the click action via onPointerDown now to prevent conflicts.
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
  );
}