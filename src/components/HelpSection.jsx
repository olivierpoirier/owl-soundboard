import { motion, AnimatePresence } from "framer-motion";

export default function HelpSection({ helpOpen, setHelpOpen }) {
  return (
    <div className="w-full max-w-[380px] text-sm text-white/70">
      <button
        onClick={() => setHelpOpen(!helpOpen)}
        className="hover:text-purple-400 transition text-xs"
      >
        {helpOpen ? "🔽 Fermer l'aide" : "📘 Aide & Infos"}
      </button>

      <AnimatePresence>
        {helpOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-2 p-3 bg-black/20 border border-white/10 rounded-lg space-y-2"
          >
            <p>→ Clique sur un carré pour jouer un son pour tout le monde.</p>
            <p>→ Clique sur 🎧 pour l'écouter juste pour toi.</p>
            <p>→ Clique sur ⭐ pour ajouter en favori.</p>
            <p>→ Le volume et mute sont locaux (juste pour toi).</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
