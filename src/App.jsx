import React, { useEffect, useRef, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import imageImporter from "../src/assets/Importer.png";
import imagePartager from "../src/assets/Partager.png";
import imagePartager2 from "../src/assets/Partager2.png";
import imageSons from "../src/assets/Liste_sons.png";
import imageZoneLien from "../src/assets/Zone_Lien.png";


export default function App() {
  const audiosRef = useRef([]);
  const volumeRef = useRef(1);
  const mutedRef = useRef(false);

  const [audioUrl, setAudioUrl] = useState("");
  const [audioList, setAudioList] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
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
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    mutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    OBR.onReady(() => {
      OBR.broadcast.onMessage("mini-tracks-play", (event) => {
        const { url, senderName } = event.data;

        setNotification(`🔊 Son déclenché par ${senderName}`);
        setTimeout(() => setNotification(null), 2500);

        playAudio(url);
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
        if (fixed.length > 0) setAudioUrl(fixed[0].url);
      })
      .catch(err => {
        console.error("❌ Erreur chargement des sons :", err);
        setDbError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const playAudio = (url) => {
    const audio = new Audio(url);
    audio.volume = mutedRef.current ? 0 : volumeRef.current;
    audio.play().catch((e) => console.warn("🔇 Échec lecture audio:", e));

    audiosRef.current.push(audio);

    audio.addEventListener("ended", () => {
      audiosRef.current = audiosRef.current.filter((a) => a !== audio);
    });
  };

  const playTrack = () => {
    OBR.player.getName().then((playerName) => {
      const message = {
        url: audioUrl,
        senderName: playerName || "Inconnu",
      };
      OBR.broadcast.sendMessage("mini-tracks-play", message);
    });

    playAudio(audioUrl);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    localStorage.setItem("owlbear_volume", newVolume.toString());

    audiosRef.current.forEach((audio) => {
      audio.volume = mutedRef.current ? 0 : newVolume;
    });
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem("owlbear_isMuted", newMuted.toString());

    audiosRef.current.forEach((audio) => {
      audio.volume = newMuted ? 0 : volumeRef.current;
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
          <p className="text-sm text-white/70">Chargement des sons...</p>
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
              ⚠️ Erreur chargement des sons. Tu peux coller un lien manuellement.
            </p>
          )}

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


          {/* Section Aide */}
          <div className="text-sm text-white mt-4 text-left">
            <button
              onClick={() => setHelpOpen(!helpOpen)}
              className=" hover:text-purple-300 transition"
            >
              {helpOpen ? "🔽 Masquer la documentation" : "📘 Comment fonctionne l'application ?"}
            </button>

            <AnimatePresence>
              {helpOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 bg-white/10 border border-white/20 rounded p-4 space-y-2 text-left"
                >

                  <h4 className="font-bold text-purple-600">Fonctionnalitées du soundboard :</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Les fichiers audio sont récupérés automatiquement depuis une base de données Dropbox.</li>
                    <li>Vous pouvez choisir un son depuis la liste déroulante, ou coller un lien Dropbox directement.</li>
                    <li>Seuls les fichiers audio au format <code>.mp3</code> et <code>.wav</code> sont compatibles.</li>
                    <li>Quand vous cliquez sur "Jouer le son", <strong>tous les utilisateurs de la room Owlbear Rodeo l’entendront</strong>.</li>
                  </ul>

                  <h4 className="font-bold text-purple-600">Comment ajouter un son dans la liste dropbox?</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Va sur Dropbox et connecte-toi</li>
                      <li>Upload ton fichier .mp3 ou .wav <img src={imageImporter}></img></li>
                      <li>Si le fichier est bien un fichier .mp3 ou .wav, il sera ajouté à la liste</li>
                      <img src={imageSons}></img>
                      <li>Colle le lien ici dans l’application</li>
                    </ol>


                    <h4 className="font-bold text-purple-600">Comment faire jouer un son à partir d'un lien dropbox?</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Va sur Dropbox et connecte-toi</li>
                      <li>Upload ton fichier .mp3 ou .wav <img src={imageImporter}></img></li>
                      <li>Clique sur l'icone 🔗 pour copier le lien d'accès<img src={imagePartager}></img></li><img src={imagePartager2}></img>
                      <li>Colle le lien ici dans l’application</li>
                      <img src={imageZoneLien}></img>
                    </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
