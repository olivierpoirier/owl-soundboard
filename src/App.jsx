import React, { useEffect, useRef, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

export default function App() {
  const audiosRef = useRef([]); // Je stocke uniquement MES sons locaux
  const [audioUrl, setAudioUrl] = useState("");
  const [audioList, setAudioList] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const apiUrl = "https://owl-reaction-backend-server.vercel.app/api/dropbox-files";

  useEffect(() => {
    const savedVolume = localStorage.getItem("owlbear_volume");
    const savedMute = localStorage.getItem("owlbear_isMuted");
    if (savedVolume !== null) setVolume(parseFloat(savedVolume));
    if (savedMute !== null) setIsMuted(savedMute === "true");
  }, []);

  useEffect(() => {
    OBR.onReady(() => {
      OBR.broadcast.onMessage("mini-tracks-play", (event) => {
        const { url, senderName } = event.data;
        setNotification(`🔊 Son déclenché par ${senderName}`);
        setTimeout(() => setNotification(null), 2500);

        const audio = new Audio(url);
        audio.play().catch((e) => console.warn("🔇 Échec lecture audio:", e));
      });
    });
  }, []);

  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        const fixed = data.map((file) => ({
          name: file.name,
          url: file.url.replace(/([?&])dl=0(&|$)/, "$1raw=1$2"),
        }));
        setAudioList(fixed);
        if (fixed.length > 0) setAudioUrl(fixed[0].url);
      })
      .catch((err) => {
        console.error("❌ Erreur chargement des sons :", err);
        setDbError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const playTrack = () => {
    OBR.player.getName().then((playerName) => {
      const message = {
        url: audioUrl,
        senderName: playerName || "Inconnu",
      };
      OBR.broadcast.sendMessage("mini-tracks-play", message);
    });

    const audio = new Audio(audioUrl);
    audio.volume = isMuted ? 0 : volume;
    audio.play().catch((e) => console.warn("🔇 Audio bloqué localement:", e));

    audiosRef.current.push(audio);
    audio.addEventListener("ended", () => {
      audiosRef.current = audiosRef.current.filter((a) => a !== audio);
    });
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    localStorage.setItem("owlbear_volume", newVolume.toString());
    audiosRef.current.forEach((audio) => {
      audio.volume = isMuted ? 0 : newVolume;
    });
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem("owlbear_isMuted", newMuted.toString());
    audiosRef.current.forEach((audio) => {
      audio.volume = newMuted ? 0 : volume;
    });
  };

  const stopAllSounds = () => {
    audiosRef.current.forEach((audio) => audio.pause());
    audiosRef.current = [];
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 text-white">
      <AnimatePresence>
        {notification && (
          <motion.div
            className="bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow text-center max-w-[80%] break-words"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h1
        className="text-3xl font-extrabold tracking-wide"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        🎧 Owl Soundboard
      </motion.h1>

      {loading ? (
        <div className="flex flex-col items-center animate-pulse space-y-2">
          <div className="w-56 h-4 bg-white/30 rounded"></div>
          <p className="text-sm text-white/70">
            Chargement des sons depuis la base de données...
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md space-y-6"
        >
          {dbError && (
            <p className="text-sm text-red-300 italic">
              ⚠️ Impossible de charger les sons de la base de données. Tu peux quand même coller un lien manuellement.
            </p>
          )}

          {audioList.length > 0 && (
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
          )}

          <div className="text-sm text-white">
            <p>🔗 Lien audio Dropbox :</p>
            <input
              className="w-full border border-white/30 rounded px-3 py-2 bg-zinc-800 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              type="text"
              value={audioUrl}
              onChange={(e) =>
                setAudioUrl(
                  e.target.value.replace(/([?&])dl=0(&|$)/, "$1raw=1$2")
                )
              }
              placeholder="Colle ici un lien .mp3 ou .wav Dropbox"
            />
          </div>

          <button
            className="w-full bg-zinc-900 text-white font-semibold py-3 rounded-lg hover:bg-zinc-800 transition shadow"
            onClick={playTrack}
          >
            ▶️ Jouer le son pour tout le monde
          </button>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={toggleMute}
                className={`flex items-center gap-2 px-3 py-2 rounded transition ${
                  isMuted
                    ? "bg-red-700 hover:bg-red-600"
                    : "bg-zinc-900 hover:bg-zinc-800"
                }`}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                {isMuted ? "Muet" : "Son activé"}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) =>
                    handleVolumeChange(parseFloat(e.target.value))
                  }
                  className="w-32 accent-purple-500"
                />
              </div>
            </div>

            <button
              onClick={stopAllSounds}
              className="w-full bg-red-700 text-white font-semibold py-2 rounded-lg hover:bg-red-600 transition shadow"
            >
              ⏹️ Stop Tous les Sons
            </button>

            <div className="text-xs text-white/60 text-center">
              Sons actifs : {audiosRef.current.length}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
