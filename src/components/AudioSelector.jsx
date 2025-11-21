import React, { useMemo, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Star,
  StarOff,
  Headphones,
  Folder,
  FolderOpen,
} from "lucide-react";

export default function AudioSelector({
  audioList = [],           // entries for current folder (mixed {type: 'folder'|'file', name, path_lower, url?, count?})
  playTrack,                // broadcast + play for everyone (uses url)
  playAudio,                // local preview (uses url)
  favorites = [],           // array of ids (file.url or folder.path_lower)
  toggleFavorite,           // fn(id)
  openFolder,               // fn(path_lower)
  pathParts = [],           // breadcrumb array, e.g. ['/owlbear', '/owlbear/sub']
  goToBreadcrumb,           // fn(index)
  goUpOne,                  // fn()
}) {
  const itemsPerPage = 6;
  const [page, setPage] = useState(0);

  // split folders/files (backend already sorts but we keep explicit)
  const folders = useMemo(() => audioList.filter((e) => e.type === "folder"), [audioList]);
  const files = useMemo(() => audioList.filter((e) => e.type === "file"), [audioList]);

  const combined = useMemo(() => [...folders, ...files], [folders, files]);

  const maxPage = Math.max(0, Math.ceil(combined.length / itemsPerPage) - 1);

  // Clamp page when list or maxPage change to avoid out-of-range pages
  useEffect(() => {
    if (page > maxPage) setPage(maxPage);
    if (page < 0) setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPage]);

  const pageItems = useMemo(
    () => combined.slice(page * itemsPerPage, (page + 1) * itemsPerPage),
    [combined, page]
  );

  // Page window (5 before and after)
  const windowSize = 5;
  const pageStart = Math.max(0, page - windowSize);
  const pageEnd = Math.min(maxPage, page + windowSize);
  const pageRange = [];
  for (let p = pageStart; p <= pageEnd; p++) pageRange.push(p);

  const isFavorite = (id) => favorites.includes(id);

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[380px]">
      {/* Header : breadcrumb + count */}
      <div className="w-full flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-2">
          <button
            onClick={goUpOne}
            className="text-sm text-purple-400 hover:text-purple-200"
            title="Remonter d'un niveau"
            aria-label="Remonter d'un niveau"
          >
            ⬆️
          </button>

          <div className="flex items-center gap-1 select-none truncate">
            {pathParts.map((p, i) => (
              <button
                key={p + i}
                onClick={() => goToBreadcrumb(i)}
                className="text-xs hover:text-purple-300 truncate max-w-[120px]"
                title={p}
              >
                {i > 0 && <span className="text-white/30">/</span>}{" "}
                <span className="ml-1 truncate">{p.replace(/^\//, "") || "/"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-white/50">{combined.length} éléments</div>
      </div>

      {/* Grid : folders + files */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {pageItems.map((entry) => {
          if (entry.type === "folder") {
            return (
              <div
                key={entry.path_lower}
                onClick={() => openFolder(entry.path_lower)}
                className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center text-xs cursor-pointer hover:ring-2 hover:ring-purple-500 transition group"
              >
                {/* favorite toggle */}
                <div className="absolute top-1 right-1 text-yellow-400 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(entry.path_lower);
                    }}
                    aria-label={isFavorite(entry.path_lower) ? "Retirer favori dossier" : "Ajouter favori dossier"}
                  >
                    {isFavorite(entry.path_lower) ? <Star size={14} /> : <StarOff size={14} />}
                  </button>
                </div>

                {/* open folder btn */}
                <div className="absolute bottom-1 right-1 text-purple-400 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFolder(entry.path_lower);
                    }}
                    aria-label="Ouvrir dossier"
                  >
                    <FolderOpen size={14} />
                  </button>
                </div>

                <Folder size={32} className="text-yellow-400 mb-2 group-hover:scale-110 transition" />
                <div className="truncate max-w-[90%] font-medium">{entry.name}</div>

                {/* count badge bottom-left */}
                <div className="absolute bottom-2 left-2 text-xs text-white/60">
                  {typeof entry.count === "number" ? `${entry.count} son${entry.count > 1 ? "s" : ""}` : "—"}
                </div>
              </div>
            );
          }

          // file card
          return (
            <div
              key={entry.url || entry.path_lower}
              className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center text-xs cursor-pointer hover:ring-2 hover:ring-purple-500 transition group"
              onClick={() => entry.url && playTrack(entry.url)}
            >
              <div className="absolute top-1 right-1 text-yellow-400 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(entry.url);
                  }}
                  aria-label={isFavorite(entry.url) ? "Retirer favori fichier" : "Ajouter favori fichier"}
                >
                  {isFavorite(entry.url) ? <Star size={14} /> : <StarOff size={14} />}
                </button>
              </div>

              <div className="absolute bottom-1 right-1 text-purple-400 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    entry.url && playAudio(entry.url);
                  }}
                  aria-label="Écouter localement"
                >
                  <Headphones size={14} />
                </button>
              </div>

              <Volume2 size={32} className="text-purple-500 mb-2 group-hover:scale-110 transition" />
              <div className="truncate max-w-[90%]">{entry.name}</div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {combined.length > itemsPerPage && (
        <div className="flex flex-col gap-2 items-center w-full">
          <div className="flex items-center w-full">
            {/* Left arrow fixed box */}
            <div className="w-10 flex justify-center">
              <button
                onClick={() => setPage((p) => (p === 0 ? maxPage : Math.max(0, p - 1)))}
                className="text-purple-400 hover:text-purple-200"
                aria-label="Page précédente"
                title="Page précédente (wrap to last)"
              >
                <ChevronLeft />
              </button>
            </div>

            {/* Page numbers centered and flexible */}
            <div className="mx-2 flex-1 flex justify-center">
              <div className="flex gap-1 items-center flex-wrap justify-center">
                {pageRange.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`text-xs px-2 py-1 rounded ${p === page ? "bg-purple-600 text-white" : "text-white/60 hover:text-white"}`}
                    aria-current={p === page ? "page" : undefined}
                    aria-label={`Aller à la page ${p + 1}`}
                  >
                    {p + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Right arrow fixed box */}
            <div className="w-10 flex justify-center">
              <button
                onClick={() => setPage((p) => (p === maxPage ? 0 : Math.min(maxPage, p + 1)))}
                className="text-purple-400 hover:text-purple-200"
                aria-label="Page suivante"
                title="Page suivante (wrap to first)"
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
