// FavoritesMenu.jsx
import { motion } from "framer-motion";
import { Star, Volume2, Headphones, Folder } from "lucide-react";
import React from "react";

/**
 * favorites: array of { id, name, type } where:
 *   - id = file.url OR folder.path_lower
 *   - type = "file" | "folder"
 *
 * This component shows global favorites and allows:
 *  - click file => playTrack(fav.id)
 *  - click folder => openFolder(fav.id)
 *  - headphones => playAudio(fav.id) (local)
 *  - star => toggleFavorite(fav.id) (remove)
 */
export default function FavoritesMenu({ isOpen, favorites = [], playTrack, playAudio, toggleFavorite, openFolder, toggleMenu }) {
  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ type: "tween", duration: 0.6 }}
      className="fixed top-0 left-0 h-full w-[250px] bg-black/40 backdrop-blur-sm border-r border-white/10 p-4 z-40 flex flex-col gap-4 overflow-y-auto"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-yellow-400 text-sm font-bold">⭐ Mes Favoris</h2>
        <button className="text-xs text-white/50" onClick={toggleMenu}>Fermer</button>
      </div>

      {favorites.length === 0 && (
        <span className="text-xs text-white/50">Aucun favori pour l'instant.</span>
      )}

      <div className="flex flex-col gap-2">
        {favorites.map((fav) => {
          const name = fav.name || fav.id;
          return (
            <div
              key={fav.id}
              className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex items-center gap-2 text-xs cursor-pointer hover:ring-2 hover:ring-purple-500 transition"
            >
              <div
                className="flex-1 text-left truncate"
                onClick={() => {
                  if (fav.type === "file") {
                    playTrack(fav.id);
                  } else {
                    openFolder(fav.id);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (fav.type === "file") playTrack(fav.id);
                    else openFolder(fav.id);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {fav.type === "folder" ? <Folder size={16} className="text-yellow-400" /> : <Volume2 size={16} className="text-purple-500" />}
                  <div className="truncate">{name}</div>
                </div>
                <div className="text-[10px] text-white/50 mt-1">{fav.type === "folder" ? "Dossier" : "Fichier"}</div>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fav.type === "file") playAudio(fav.id);
                  }}
                  title="Écouter localement"
                >
                  <Headphones size={14} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(fav.id); // retire le favori
                  }}
                  className="text-yellow-400"
                  title="Retirer des favoris"
                >
                  <Star size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
