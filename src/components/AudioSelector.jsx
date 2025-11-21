import React, { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Volume2, Star, StarOff, Headphones, Folder, FolderOpen } from "lucide-react";

export default function AudioSelector({
  audioList = [],
  playTrack,
  playAudio,
  favorites,
  toggleFavorite,
  openFolder,
  pathParts = [],
  goToBreadcrumb,
  goUpOne,
}) {
  const itemsPerPage = 6;
  const [page, setPage] = useState(0);

  // Separate folders and files (backend already sorted, but do explicit split)
  const folders = audioList.filter((e) => e.type === "folder");
  const files = audioList.filter((e) => e.type === "file");

  // Combine folders then files for display
  const combined = useMemo(() => [...folders, ...files], [folders, files]);

  const maxPage = Math.max(0, Math.ceil(combined.length / itemsPerPage) - 1);

  // clamp page when list changes to avoid out-of-range pages
  useEffect(() => {
    if (page > maxPage) setPage(maxPage);
    if (page < 0) setPage(0);
    // note: we intentionally don't add setPage in deps to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPage]);

  const pageItems = combined.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  // Page window (5 before and after)
  const windowSize = 3;
  const pageStart = Math.max(0, page - windowSize);
  const pageEnd = Math.min(maxPage, page + windowSize);
  const pageRange = [];
  for (let p = pageStart; p <= pageEnd; p++) pageRange.push(p);

  const isFavorite = (id) => favorites.includes(id);

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[380px]">
      <div className="w-full flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-2">
          <button onClick={goUpOne} className="text-sm text-purple-400 hover:text-purple-200">
            ⬆️
          </button>
          <div className="flex items-center gap-1 select-none">
            {pathParts.map((p, i) => (
              <button
                key={p + i}
                onClick={() => goToBreadcrumb(i)}
                className="text-xs hover:text-purple-300 truncate max-w-[120px]"
                title={p}
              >
                {i > 0 && " / "}
                {p.replace(/^\//, "") || "/"}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-white/50">{combined.length} éléments</div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {pageItems.map((entry) => {
          if (entry.type === "folder") {
            return (
              <div
                key={entry.path_lower}
                onClick={() => openFolder(entry.path_lower)}
                className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center text-xs cursor-pointer hover:ring-2 hover:ring-purple-500 transition group"
              >
                <div className="absolute top-1 right-1 text-yellow-400 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(entry.path_lower);
                    }}
                  >
                    {isFavorite(entry.path_lower) ? <Star size={14} /> : <StarOff size={14} />}
                  </button>
                </div>

                <div className="absolute bottom-1 right-1 text-purple-400 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFolder(entry.path_lower);
                    }}
                  >
                    <FolderOpen size={14} />
                  </button>
                </div>

                <Folder size={32} className="text-yellow-400 mb-2 group-hover:scale-110 transition" />
                <div className="truncate max-w-[90%]">{entry.name}</div>
              </div>
            );
          } else {
            // file
            return (
              <div
                key={entry.url || entry.path_lower}
                className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center text-xs cursor-pointer hover:ring-2 hover:ring-purple-500 transition group"
                onClick={() => playTrack(entry.url)}
              >
                <div className="absolute top-1 right-1 text-yellow-400 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(entry.url);
                    }}
                  >
                    {isFavorite(entry.url) ? <Star size={14} /> : <StarOff size={14} />}
                  </button>
                </div>

                <div className="absolute bottom-1 right-1 text-purple-400 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(entry.url);
                    }}
                  >
                    <Headphones size={14} />
                  </button>
                </div>

                <Volume2 size={32} className="text-purple-500 mb-2 group-hover:scale-110 transition" />
                <div className="truncate max-w-[90%]">{entry.name}</div>
              </div>
            );
          }
        })}
      </div>

      {combined.length > itemsPerPage && (
        <div className="flex flex-col gap-2 items-center w-full">
          {/* Pagination wrapper:
              - left arrow fixed width
              - center (page numbers) flex-1 and centered
              - right arrow fixed width
            This keeps arrows in the same place even if page numbers change width */}
          <div className="flex items-center w-full">
            <div className="w-10 flex justify-center">
              <button
                onClick={() => setPage((p) => (p === 0 ? maxPage : Math.max(0, p - 1)))}
                className="text-purple-400 hover:text-purple-200"
                aria-label="Page précédente"
              >
                <ChevronLeft />
              </button>
            </div>

            <div className="mx-2 flex-1 flex justify-center">
              <div className="flex gap-1 items-center flex-wrap justify-center">
                {pageRange.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`text-xs px-2 py-1 rounded ${p === page ? "bg-purple-600 text-white" : "text-white/60 hover:text-white"}`}
                  >
                    {p + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-10 flex justify-center">
              <button
                onClick={() => setPage((p) => (p === maxPage ? 0 : Math.min(maxPage, p + 1)))}
                className="text-purple-400 hover:text-purple-200"
                aria-label="Page suivante"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className="text-xs text-white/50">
            {page + 1} / {maxPage + 1}
          </div>
        </div>
      )}
    </div>
  );
}
