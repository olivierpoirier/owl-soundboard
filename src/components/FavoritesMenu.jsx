import { motion } from "framer-motion";
import { Star, StarOff, Volume2, Headphones } from "lucide-react";

export default function FavoritesMenu({ isOpen, favorites, audioList, playTrack, playAudio, toggleFavorite, toggleMenu }) {
  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ type: "tween", duration: 0.6 }}
      className="fixed top-0 left-0 h-full w-[250px] bg-black/40 backdrop-blur-sm border-r border-white/10 p-4 z-40 flex flex-col gap-4 overflow-y-auto"
    >
      <h2 className="text-yellow-400 text-sm font-bold" onClick={toggleMenu}>⭐ Mes Favoris</h2>

      {favorites.length === 0 && (
        <span className="text-xs text-white/50">Aucun favori pour l'instant.</span>
      )}

      <div className="flex flex-col gap-2">
        {favorites.map((favUrl) => {
          const file = audioList.find((f) => f.url === favUrl);
          if (!file) return null;

          return (
            <div
              key={file.name}
              onClick={() => playTrack(file.url)}
              className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center text-xs cursor-pointer hover:ring-2 hover:ring-purple-500 transition group"
            >
              <div className="absolute top-1 right-1 text-yellow-400 z-10">
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(file.url); }}>
                  {favorites.includes(file.url) ? <Star size={14} /> : <StarOff size={14} />}
                </button>
              </div>

              <div className="absolute bottom-1 right-1 text-purple-400 z-10">
                <button onClick={(e) => { e.stopPropagation(); playAudio(file.url); }}>
                  <Headphones size={14} />
                </button>
              </div>

              <Volume2 size={28} className="text-purple-500 mb-1 group-hover:scale-110 transition" />
              <div className="truncate max-w-[90%]">{file.name}</div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
