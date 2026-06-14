"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      /* Apple's signature smooth decelerating curve */
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
    >
      {children}
    </motion.div>
  );
}