"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProjectSlider({ projects }: { projects: any[] }) {
  // 1. Initialize Carousel with Autoplay (changes every 4 seconds)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' }, 
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  // 2. State for our Dot Navigation
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // 3. Dot Click Function
  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // 4. Sync Dots with the active slide
  const onInit = useCallback((emblaApi: any) => setScrollSnaps(emblaApi.scrollSnapList()), []);
  const onSelect = useCallback((emblaApi: any) => setSelectedIndex(emblaApi.selectedScrollSnap()), []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  if (!projects || projects.length === 0) return null;

  return (
    // THE FIX: Added flex-col so the slider and dots stack naturally
    <div className="w-full relative flex flex-col">
      {/* Carousel Container */}
      <div className="overflow-hidden w-full relative rounded-3xl cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex">
          {projects.map((project, index) => (
            <div className="flex-[0_0_100%] min-w-0 md:flex-[0_0_85%] relative px-2 py-4" key={project.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative h-[450px] w-full rounded-[2rem] overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl flex items-end p-8 md:p-12 border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all group"
              >
                
                {/* Invisible link covering the entire card to make it clickable */}
                <Link href={`/project/${project.id}`} className="absolute inset-0 z-40" aria-label={`View ${project.title}`} />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent dark:from-[#020617]/95 dark:via-[#020617]/60 dark:to-transparent z-10 transition-colors duration-500"></div>
                
                {/* Cover Image */}
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="absolute inset-0 w-full h-full object-cover z-0 opacity-90 dark:opacity-70 transition-opacity duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center z-0 text-gray-400 dark:text-gray-700 font-mono text-2xl opacity-30">Image Needed</div>
                )}

                {/* Text Content */}
                {/* THE FIX: Removed mb-6 from here so the text sits closer to the bottom */}
                <div className="relative z-20 w-full mb-2"> 
                  {project.is_featured && (
                    <span className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-md mb-4 inline-block shadow-lg">
                      FEATURED
                    </span>
                  )}
                  <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight drop-shadow-sm transition-colors group-hover:text-blue-500">{project.title}</h2>
                  <p className="text-gray-700 dark:text-gray-300 max-w-2xl text-lg md:text-xl line-clamp-2 mb-6 drop-shadow-sm transition-colors">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack?.map((tech: string) => (
                        <span key={tech} className="px-4 py-1 text-sm bg-white/50 dark:bg-black/50 backdrop-blur-md text-gray-900 dark:text-white border border-white/60 dark:border-white/20 rounded-full transition-colors shadow-sm">
                          {tech}
                        </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Dot Navigation */}
      {/* THE FIX: Removed 'absolute bottom-8 left-0 right-0'. It now sits naturally below the cards. */}
      <div className="flex justify-center items-center gap-3 mt-4 z-50">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex 
                ? 'w-8 h-2.5 bg-blue-600 dark:bg-blue-500 shadow-md' 
                : 'w-2.5 h-2.5 bg-gray-400/50 dark:bg-gray-600/50 hover:bg-gray-600 dark:hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}