import { useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, Star, StarOff, Headphones } from "lucide-react";

export default function AudioSelector({ audioList, playTrack, playAudio, favorites, toggleFavorite }) {
  const itemsPerPage = 6;
  const [page, setPage] = useState(0);
  const maxPage = Math.ceil(audioList.length / itemsPerPage) - 1;

  const pageItems = audioList.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[380px]">

      <div className="grid grid-cols-2 gap-3">
        {pageItems.map((file) => (
          <div
            key={file.name}
            className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center text-xs cursor-pointer hover:ring-2 hover:ring-purple-500 transition group"
            onClick={() => playTrack(file.url)}
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

            <Volume2 size={32} className="text-purple-500 mb-2 group-hover:scale-110 transition" />
            <div className="truncate max-w-[90%]">{file.name}</div>
          </div>
        ))}
      </div>

      {audioList.length > itemsPerPage && (
        <div className="flex gap-4 items-center justify-center">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="text-purple-400 hover:text-purple-200 disabled:opacity-30"
          >
            <ChevronLeft />
          </button>

          <span className="text-xs text-white/50">{page + 1} / {maxPage + 1}</span>

          <button
            onClick={() => setPage(Math.min(maxPage, page + 1))}
            disabled={page === maxPage}
            className="text-purple-400 hover:text-purple-200 disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
