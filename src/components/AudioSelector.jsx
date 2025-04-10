export default function AudioSelector({ audioUrl, setAudioUrl, audioList, playTrack }) {
    return (
      <>
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
      </>
    );
}
  