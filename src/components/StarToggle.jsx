import { motion, useAnimation } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect } from "react";

export default function StarToggle({ menuOpen, toggleMenu }) {
  const controls = useAnimation();

  useEffect(() => {
    if (menuOpen) {
      controls.start({
        x: 240,
        rotate: 360,
        transition: { duration: 0.8, ease: "easeInOut" },
      }).then(() =>
        controls.start({
          x: 240,
          rotate: 360,
          transition: { repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" },
        })
      );
    } else {
      controls.start({
        x: 0,
        rotate: -360,
        transition: { duration: 0.8, ease: "easeInOut" },
      }).then(() =>
        controls.start({
          x: 0,
          rotate: 0,
          transition: { repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" },
        })
      );
    }
  }, [controls, menuOpen]);

  return (
    <motion.button
      onClick={toggleMenu}
      animate={controls}
      className="fixed top-4 left-4 z-50 text-yellow-400 hover:text-yellow-300 cursor-pointer"
    >
      <Star size={32} />
    </motion.button>
  );
}
