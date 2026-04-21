'use client';
import { AnimatePresence } from 'framer-motion';

export function Providers({ children }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}