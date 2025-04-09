import React, { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [audioUrl, setAudioUrl] = useState("");
  const [audioList, setAudioList] = useState([]);
  const [notification, setNotification] = useState(null);

  const apiUrl = "https://owl-reaction-backend-server.vercel.app/api/dropbox-files";

  useEffect(() => {
    OBR.onReady(() => {
      OBR.broadcast.onMessage("mini-tracks-play", (event) => {
        const { url } = event.data;
        const from = event.connectionId;

        setNotification(`🔊 Son déclenché par ${from?.slice(0, 6) ?? "❓ inconnu"}`);
        setTimeout(() => setNotification(null), 2500);

        const audio = new Audio(url);
        audio.play().catch((e) => console.warn("🔇 Échec de lecture audio :", e));
      });
    });
  }, []);

  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        const fixed = data.map(file => ({
          name: file.name,
          url: file.url.replace(/([?&])dl=0(&|$)/, "$1raw=1$2")
        }));
        setAudioList(fixed);
        if (fixed.length > 0) {
          setAudioUrl(fixed[0].url);
        }
      })
      .catch(err => console.error("❌ Erreur chargement des sons :", err));
  }, []);

  function playTrack() {
    const message = { url: audioUrl };
    OBR.broadcast.sendMessage("mini-tracks-play", message);

    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.warn("🔇 Audio bloqué localement :", e));
  }

  return (
    <div className="max-w-xs mx-auto p-4 text-center">
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded shadow"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h1
        className="text-xl font-bold mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        🎧 Owl Soundboard 🎧
      </motion.h1>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {audioList.length > 0 && (
          <select
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
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

        <input
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
          type="text"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value.replace(/([?&])dl=0(&|$)/, "$1raw=1$2"))}
          placeholder="Lien audio ici"
        />

        <button
          className="w-full bg-gray-800 text-white py-1 rounded hover:bg-gray-700 transition"
          onClick={playTrack}
        >
          ▶️ Jouer le son pour tout le monde
        </button>
      </motion.div>
    </div>
  );
}
