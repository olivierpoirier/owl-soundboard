import React, { useEffect, useRef, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import Notification from "./components/Notification";
import Header from "./components/Header";
import AudioControls from "./components/AudioControls";
import AudioSelector from "./components/AudioSelector";
import HelpSection from "./components/HelpSection";
import FavoritesMenu from "./components/FavoritesMenu";
import StarToggle from "./components/StarToggle";

export default function App() {
  const audiosRef = useRef([]);
  const volumeRef = useRef(1);
  const mutedRef = useRef(false);

  const [audioList, setAudioList] = useState([]); // entries for current folder (mixed files+folders)
  const [favorites, setFavorites] = useState([]); // store strings that can be either file-url or folder-path_lower
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSoundsCount, setActiveSoundsCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigation state: pathParts is array like ["owlbear", "subfolder"]
  const [pathParts, setPathParts] = useState(["/owlbear"]); // keep root as '/owlbear'
  const apiBase = "https://owl-reaction-backend-server.vercel.app/api/dropbox-files";

  // load settings from localStorage once
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

  // OBR ready and broadcast
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

  // fetch folder content whenever pathParts changes
  useEffect(() => {
    const fetchFolder = async () => {
      setLoading(true);
      setDbError(false);
      try {
        const currentPath = pathParts[pathParts.length - 1] || "/owlbear";
        const encoded = encodeURIComponent(currentPath);
        const res = await fetch(`${apiBase}?path=${encoded}`);
        const json = await res.json();
        if (json.error) {
          console.error("Dropbox list error:", json);
          setDbError(true);
          setAudioList([]);
          return;
        }
        // json.entries already sorted by backend
        setAudioList(json.entries || []);
      } catch (e) {
        console.error("❌ Erreur chargement des sons :", e);
        setDbError(true);
        setAudioList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFolder();
  }, [pathParts]);

  const toggleFavorite = (id) => {
    // id can be file.url or folder.path_lower
    try {
      let newFavorites;
      if (favorites.includes(id)) {
        newFavorites = favorites.filter((f) => f !== id);
      } else {
        newFavorites = [...favorites, id];
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

  const playTrack = (url) => {
    if (!isReady) return;
    OBR.player.getName().then((playerName) => {
      const message = { url, senderName: playerName || "Inconnu" };
      OBR.broadcast.sendMessage("mini-tracks-play", message);
    });
    playAudio(url);
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

  // navigation helpers
  const openFolder = (folderPath) => {
    setPathParts((prev) => [...prev, folderPath]);
  };
  const goToBreadcrumb = (index) => {
    setPathParts((prev) => prev.slice(0, index + 1));
  };
  const goUpOne = () => {
    setPathParts((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  };

  return (
    <div className="min-h-screen relative text-white">
      <Notification notification={notification} />
      <StarToggle menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
      <FavoritesMenu
        isOpen={menuOpen}
        favorites={favorites}
        audioList={audioList}
        playTrack={playTrack}
        playAudio={playAudio}
        toggleFavorite={toggleFavorite}
      />

      <div className="flex flex-col items-center justify-center text-center p-6 space-y-6">
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
              audioList={audioList}
              playTrack={playTrack}
              playAudio={playAudio}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              openFolder={openFolder}
              pathParts={pathParts}
              goToBreadcrumb={goToBreadcrumb}
              goUpOne={goUpOne}
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
    </div>
  );
}
