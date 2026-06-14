"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  yOffset?: number;
}

export default function ScrollReveal({ children, delay = 0, yOffset = 40 }: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }} // Triggers slightly before it hits the center of the screen
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1], // Apple's signature smooth deceleration curve
        delay: delay 
      }}
    >
      {children}
    </motion.div>
  );
}