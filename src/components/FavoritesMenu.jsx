import { motion } from "framer-motion";
import { Star, StarOff, Volume2, Headphones, FolderOpen } from "lucide-react";

export default function FavoritesMenu({ 
  isOpen, 
  favorites, 
  folderFavorites, 
  audioList, 
  playTrack, 
  playAudio, 
  toggleFavorite, 
  toggleFolderFavorite, 
  toggleMenu,
  changeFolder
}) {
  // SÉCURITÉ : On utilise ?. et || [] pour garantir que ça ne plante pas si les props sont undefined
  const favoriteFiles = favorites?.map((favUrl) => 
      audioList?.find((f) => f.url === favUrl)
    ).filter(Boolean) || [];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ type: "tween", duration: 0.6 }}
      className="fixed top-0 left-0 h-full w-[250px] bg-black/40 backdrop-blur-sm border-r border-white/10 p-4 z-40 flex flex-col gap-4 overflow-y-auto"
    >
      <h2 className="text-yellow-400 text-sm font-bold" onClick={toggleMenu}>⭐ Mes Favoris</h2>

      {/* --- Dossiers Favoris --- */}
      <h3 className="text-white/80 text-xs font-semibold mt-2">Dossiers Favoris</h3>
      <div className="flex flex-col gap-2">
        {/* SÉCURITÉ : ?.length */}
        {folderFavorites?.length === 0 && (
          <span className="text-xs text-white/50">Aucun dossier favori.</span>
        )}
        
        {/* SÉCURITÉ : ?.map */}
        {folderFavorites?.map((favPath) => {
          const pathParts = favPath?.split("/").filter(p => p.length > 0) || [];
          const folderName = pathParts.length > 0 ? pathParts.pop() : "Racine";

          return (
            <div
              key={favPath}
              onClick={() => changeFolder(favPath)}
              className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center text-xs cursor-pointer hover:ring-2 hover:ring-yellow-500 transition group"
            >
              <div className="absolute top-1 right-1 text-yellow-400 z-10">
                <button onClick={(e) => { e.stopPropagation(); toggleFolderFavorite(favPath); }}>
                  <Star size={14} /> 
                </button>
              </div>

              <FolderOpen size={28} className="text-yellow-400 mb-1 group-hover:scale-110 transition" />
              <div className="truncate max-w-[90%]">{folderName}</div>
            </div>
          );
        })}
      </div>

      {/* --- Sons Favoris --- */}
      <h3 className="text-white/80 text-xs font-semibold mt-4">Sons Favoris</h3>
      
      {favoriteFiles?.length === 0 && folderFavorites?.length > 0 && (
        <span className="text-xs text-white/50">Aucun son favori pour l'instant.</span>
      )}
      {favoriteFiles?.length === 0 && folderFavorites?.length === 0 && (
        <span className="text-xs text-white/50">Aucun favori pour l'instant.</span>
      )}

      <div className="flex flex-col gap-2">
        {favoriteFiles?.map((file) => {
          return (
            <div
              key={file.name}
              onClick={() => playTrack(file.url)}
              className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center text-xs cursor-pointer hover:ring-2 hover:ring-purple-500 transition group"
            >
              <div className="absolute top-1 right-1 text-yellow-400 z-10">
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(file.url); }}>
                  <Star size={14} />
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