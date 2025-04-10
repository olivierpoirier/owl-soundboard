import { motion, AnimatePresence } from "framer-motion";

export default function Notification({ notification }) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className="bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow text-center max-w-[80%] break-words"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {notification}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
