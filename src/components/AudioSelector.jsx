export default function AudioSelector({ audioUrl, setAudioUrl, audioList, playTrack, playAudio, favorites, toggleFavorite }) {
    return (
      <>
        {audioList.length > 0 && favorites.length > 0 && (
          <>
            <h3 className="text-white/70 text-sm">⭐ Mes Favoris</h3>
            <select
                className="w-full bg-zinc-900 text-white py-2 px-3 rounded shadow hover:bg-zinc-800 transition"
                onChange={(e) => setAudioUrl(e.target.value)}
                >
                <option disabled selected>-- Choisis un favori --</option>
                {favorites.map((favUrl) => {
                    const favName = audioList.find(f => f.url === favUrl)?.name || favUrl;
                    return (
                    <option key={favUrl} value={favUrl}>
                        {favName}
                    </option>
                    );
                })}
            </select>
          </>
        )}
  
        <div className="flex items-center justify-between">
          <select
            className="w-full bg-zinc-900 text-white py-2 px-3 rounded shadow hover:bg-zinc-800 transition"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
          >
            {audioList.map((file) => (
              <option key={file.name} value={file.url}>
                {file.name}
              </option>
            ))}
          </select>
  
          <button
            onClick={() => toggleFavorite(audioUrl)}
            className="ml-2 text-yellow-400 hover:text-yellow-300"
            title="Ajouter ou retirer des favoris"
          >
            {favorites.includes(audioUrl) ? "⭐" : "☆"}
          </button>
        </div>
  
        <input
          className="w-full border border-white/30 rounded px-3 py-2 bg-zinc-800 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          type="text"
          value={audioUrl}
          onChange={(e) =>
            setAudioUrl(e.target.value.replace(/([?&])dl=0(&|$)/, "$1raw=1$2"))
          }
          placeholder="Colle un lien .mp3 ou .wav Dropbox"
        />
  
        <button
          className="w-full bg-zinc-900 text-white font-semibold py-3 rounded-lg hover:bg-zinc-800 transition shadow"
          onClick={playTrack}
        >
          ▶️ Jouer le son
        </button>


        <button
            className="w-full bg-zinc-700 text-white font-semibold py-3 rounded-lg hover:bg-zinc-600 transition shadow"
            onClick={() => playAudio(audioUrl)}
            >
            🎧 Écouter en solo (juste pour toi)
        </button>
      </>
    );
  }
  