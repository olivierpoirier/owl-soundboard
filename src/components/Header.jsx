import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.h1
      className="text-3xl font-extrabold tracking-wide"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      🎧 Owl Soundboard
    </motion.h1>
  );
}
