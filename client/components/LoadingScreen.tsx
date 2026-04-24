"use client";

import { motion, AnimatePresence } from "framer-motion";
import GifLoader from "./ui/GifLoader";

export default function LoadingScreen() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#050505]"
      >
        <GifLoader />
      </motion.div>
    </AnimatePresence>
  );
}

