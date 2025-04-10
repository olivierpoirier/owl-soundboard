import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Header({ toggleMenu }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 text-purple-400 font-bold text-xl tracking-widest select-none"
    >

        <button onClick={toggleMenu} className="text-yellow-400 hover:text-yellow-300 transition">
        <Star size={20} />
      </button>
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="#a855f7" strokeWidth="2" />
        <path d="M10 16L14 12V20L10 16Z" fill="#a855f7" />
        <path d="M18 12L22 16L18 20V12Z" fill="#a855f7" />
      </svg>
      EchoGrid
    </motion.div>
  );
}
