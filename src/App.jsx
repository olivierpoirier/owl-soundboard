import React, { useEffect, useRef, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import Notification from "./components/Notification";
import Header from "./components/Header";
import AudioControls from "./components/AudioControls";
import AudioSelector from "./components/AudioSelector";
import HelpSection from "./components/HelpSection";

export default function App() {
  const audiosRef = useRef([]);
  const volumeRef = useRef(1);
  const mutedRef = useRef(false);

  const [audioUrl, setAudioUrl] = useState("");
  const [audioList, setAudioList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSoundsCount, setActiveSoundsCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const apiUrl = "https://owl-reaction-backend-server.vercel.app/api/dropbox-files";

  useEffect(() => {
    try {
      const savedVolume = localStorage.getItem("owlbear_volume");
      const savedMute = localStorage.getItem("owlbear_isMuted");
      const savedFavs = localStorage.getItem("owlbear_favorites");

      if (savedVolume !== null) setVolume(parseFloat(savedVolume));
      if (savedMute !== null) setIsMuted(savedMute === "true");
      if (savedFavs !== null) setFavorites(JSON.parse(savedFavs));
    } catch (error) {
      console.error("Erreur récupération localStorage :", error);
    }
  }, []);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    mutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    try {
      OBR.onReady(() => {
        setIsReady(true);
        OBR.broadcast.onMessage("mini-tracks-play", (event) => {
          const { url, senderName } = event.data;
          setNotification(`🔊 Son déclenché par ${senderName}`);
          setTimeout(() => setNotification(null), 2500);
          playAudio(url);
        });
      });
    } catch (error) {
      console.error("Erreur OBR Ready :", error);
    }
  }, []);

  useEffect(() => {
    const fetchAudioList = async () => {
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        const fixed = data.map(file => ({
          name: file.name,
          url: file.url.replace(/([?&])dl=0(&|$)/, "$1raw=1$2")
        }));

        // Supprimer les favoris qui n'existent plus
        setFavorites((prevFavs) =>
          prevFavs.filter(favUrl =>
            fixed.some(file => file.url === favUrl)
          )
        );

        setAudioList(fixed);
        if (fixed.length > 0) setAudioUrl(fixed[0].url);
      } catch (error) {
        console.error("❌ Erreur chargement des sons :", error);
        setDbError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAudioList();
  }, []);

  const toggleFavorite = (url) => {
    try {
      let newFavorites;
      if (favorites.includes(url)) {
        newFavorites = favorites.filter(fav => fav !== url);
      } else {
        newFavorites = [...favorites, url];
      }
      setFavorites(newFavorites);
      localStorage.setItem("owlbear_favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Erreur toggleFavorite :", error);
    }
  };

  const playAudio = (url) => {
    try {
      const audio = new Audio(url);
      audio.volume = mutedRef.current ? 0 : volumeRef.current;
      audio.play().catch((e) => console.warn("🔇 Échec lecture audio:", e));

      audiosRef.current.push(audio);
      setActiveSoundsCount(audiosRef.current.length);

      audio.addEventListener("ended", () => {
        audiosRef.current = audiosRef.current.filter((a) => a !== audio);
        setActiveSoundsCount(audiosRef.current.length);
      });
    } catch (error) {
      console.error("Erreur playAudio :", error);
    }
  };

  const playTrack = () => {
    if (!isReady) {
      console.warn("OBR pas prêt encore...");
      return;
    }

    try {
      OBR.player.getName().then((playerName) => {
        const message = { url: audioUrl, senderName: playerName || "Inconnu" };
        OBR.broadcast.sendMessage("mini-tracks-play", message);
      });
      playAudio(audioUrl);
    } catch (error) {
      console.error("Erreur playTrack :", error);
    }
  };

  const handleVolumeChange = (newVolume) => {
    try {
      setVolume(newVolume);
      localStorage.setItem("owlbear_volume", newVolume.toString());
      audiosRef.current.forEach((audio) => {
        audio.volume = mutedRef.current ? 0 : newVolume;
      });
    } catch (error) {
      console.error("Erreur handleVolumeChange :", error);
    }
  };

  const toggleMute = () => {
    try {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      localStorage.setItem("owlbear_isMuted", newMuted.toString());
      audiosRef.current.forEach((audio) => {
        audio.volume = newMuted ? 0 : volumeRef.current;
      });
    } catch (error) {
      console.error("Erreur toggleMute :", error);
    }
  };

  const stopAllSounds = () => {
    try {
      audiosRef.current.forEach((audio) => audio.pause());
      audiosRef.current = [];
      setActiveSoundsCount(0);
    } catch (error) {
      console.error("Erreur stopAllSounds :", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 text-white bg-black">
      <Notification notification={notification} />
      <Header />

      {loading ? (
        <div className="flex flex-col items-center animate-pulse space-y-2">
          <div className="w-56 h-4 bg-white/30 rounded"></div>
          <p className="text-sm text-white/70">Chargement des sons...</p>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
          {dbError && (
            <p className="text-sm text-red-300 italic">
              ⚠️ Erreur chargement des sons. Tu peux coller un lien manuellement.
            </p>
          )}

          <AudioSelector
            audioUrl={audioUrl}
            setAudioUrl={setAudioUrl}
            audioList={audioList}
            playTrack={playTrack}
            playAudio={playAudio}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />

          <AudioControls
            isMuted={isMuted}
            toggleMute={toggleMute}
            volume={volume}
            handleVolumeChange={handleVolumeChange}
            stopAllSounds={stopAllSounds}
            audiosCount={activeSoundsCount}
          />

          <HelpSection helpOpen={helpOpen} setHelpOpen={setHelpOpen} />
        </div>
      )}
    </div>
  );
}
