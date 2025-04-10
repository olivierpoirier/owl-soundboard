import { motion, AnimatePresence } from "framer-motion";

export default function Notification({ notification }) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 max-w-xs text-center"
        >
          {notification}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
