import { motion } from "framer-motion";
import {  Headphones } from "lucide-react";
export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 text-purple-400 font-bold text-xl tracking-widest select-none"
    >
        <Headphones />

      Owl Soundboard
    </motion.div>
  );
}
