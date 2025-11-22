import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Star, 
  StarOff, 
  Headphones, 
  FolderOpen, 
  ArrowLeft 
} from "lucide-react";

export default function AudioSelector({ 
  audioList, 
  playTrack, 
  playAudio, 
  favorites, 
  toggleFavorite, 
  currentPath, 
  changeFolder, 
  goBack, 
  folderFavorites, 
  toggleFolderFavorite 
}) {
  const itemsPerPage = 6;
  const [page, setPage] = useState(0);
  const totalItems = audioList.length;
  const maxPage = Math.ceil(totalItems / itemsPerPage) - 1;

  const goToPage = (newPage) => {
    let next = newPage;
    if (maxPage < 0) return;

    if (next < 0) {
      next = maxPage;
    } else if (next > maxPage) {
      next = 0;
    }
    setPage(next);
  };

  if (page > maxPage && totalItems > 0) {
    setPage(maxPage);
  } else if (totalItems === 0 && page !== 0) {
    setPage(0);
  }

  const pageItems = audioList.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const pageNumbers = [];
  const startPage = Math.max(0, page - 3);
  const endPage = Math.min(maxPage, page + 3);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const showPagination = totalItems > itemsPerPage;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[380px]">

      {/* Affichage du chemin et bouton "Retour" */}
      <div className="flex items-center justify-between w-full p-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg">
        {currentPath !== "/owlbear" ? (
          <button 
            onClick={goBack} 
            className="flex items-center gap-1 text-purple-400 hover:text-purple-200 transition text-xs"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        ) : (
          <span className="text-sm text-white/70 font-semibold">Répertoire Racine</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {pageItems.map((file) => (
          <div
            key={file.path} 
            onClick={() => file.isFolder ? changeFolder(file.path) : playTrack(file.url)}
            className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center text-xs cursor-pointer hover:ring-2 hover:ring-purple-500 transition group"
          >
            {/* Bouton Favoris (Dossier ou Son) */}
            <div className="absolute top-1 right-1 text-yellow-400 z-10">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  file.isFolder ? toggleFolderFavorite(file.path) : toggleFavorite(file.url); 
                }}
              >
                {file.isFolder 
                  ? (folderFavorites.includes(file.path) ? <Star size={14} /> : <StarOff size={14} />) 
                  : (favorites.includes(file.url) ? <Star size={14} /> : <StarOff size={14} />)}
              </button>
            </div>

            {/* Bouton Lecture (Seulement pour les sons) */}
            {!file.isFolder && (
              <div className="absolute bottom-1 right-1 text-purple-400 z-10">
                <button onClick={(e) => { e.stopPropagation(); playAudio(file.url); }}>
                  <Headphones size={14} />
                </button>
              </div>
            )}

            {/* Icône principale (Dossier ou Son) */}
            {file.isFolder 
              ? <FolderOpen size={32} className="text-yellow-400 mb-2 group-hover:scale-110 transition" />
              : <Volume2 size={32} className="text-purple-500 mb-2 group-hover:scale-110 transition" />
            }
            
            <div className="truncate max-w-[90%]">{file.name}</div>
          </div>
        ))}
      </div>

      {/* Contrôles de pagination avancés */}
      {showPagination && (
        <div className="flex gap-1 items-center justify-center">
          <button
            onClick={() => goToPage(page - 1)}
            className="text-purple-400 hover:text-purple-200"
          >
            <ChevronLeft />
          </button>

          {pageNumbers.map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`
                text-xs rounded px-2 py-1 transition
                ${p === page 
                  ? 'bg-purple-500 text-white font-bold' 
                  : 'text-white/50 hover:bg-white/10'}
              `}
            >
              {p + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            className="text-purple-400 hover:text-purple-200"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
