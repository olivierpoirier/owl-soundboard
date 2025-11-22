import React, { useEffect, useRef, useState, useCallback } from "react";
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

  // --- ETATS RESTAURÉS (Manquants dans ton dernier snippet) ---
  const [currentPath, setCurrentPath] = useState("/owlbear");
  const [folderFavorites, setFolderFavorites] = useState([]);
  // -----------------------------------------------------------

  const [audioUrl, setAudioUrl] = useState("");
  const [audioList, setAudioList] = useState([]); // Initialisé à tableau vide []
  const [favorites, setFavorites] = useState([]); // Initialisé à tableau vide []
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSoundsCount, setActiveSoundsCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const apiUrl = "https://owl-reaction-backend-server.vercel.app/api/dropbox-files";

  useEffect(() => {
    try {
      const savedVolume = localStorage.getItem("owlbear_volume");
      const savedMute = localStorage.getItem("owlbear_isMuted");
      const savedFavs = localStorage.getItem("owlbear_favorites");
      const savedFolderFavs = localStorage.getItem("owlbear_folder_favorites");

      if (savedVolume !== null) setVolume(parseFloat(savedVolume));
      if (savedMute !== null) setIsMuted(savedMute === "true");
      if (savedFavs !== null) setFavorites(JSON.parse(savedFavs) || []); // Fallback []
      if (savedFolderFavs !== null) setFolderFavorites(JSON.parse(savedFolderFavs) || []); // Fallback []
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

  // --- FONCTION FETCH MISE A JOUR AVEC LOGIQUE DE DOSSIER ---
  const fetchAudioList = useCallback(async (path) => {
    setLoading(true);
    setDbError(false);

    const url = path && path !== "/owlbear" ? `${apiUrl}?path=${encodeURIComponent(path)}` : apiUrl;
    setCurrentPath(path || "/owlbear");

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      // Séparation dossiers/fichiers
      const folders = data?.filter(item => item.isFolder) || [];
      const files = data?.filter(item => !item.isFolder) || [];

      const fixedFiles = files.map(file => ({
        name: file.name,
        url: file.url.replace(/([?&])dl=0(&|$)/, "$1raw=1$2"),
        isFolder: false,
        path: file.path,
      }));

      const combinedList = [...folders, ...fixedFiles];

      setFavorites((prevFavs) =>
        (prevFavs || []).filter(favUrl =>
          fixedFiles.some(file => file.url === favUrl)
        )
      );

      setAudioList(combinedList);
      if (fixedFiles.length > 0) setAudioUrl(fixedFiles[0].url);
    } catch (error) {
      console.error("❌ Erreur chargement des sons :", error);
      setDbError(true);
      setAudioList([]); // Évite que ce soit undefined en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudioList("/owlbear");
  }, [fetchAudioList]);

  // --- FONCTIONS DE NAVIGATION (Restaurées) ---
  const changeFolder = (path) => {
    fetchAudioList(path);
  };
  
  const goBack = () => {
    if (currentPath === "/owlbear") return;
    const pathParts = currentPath.split("/").filter(p => p.length > 0);
    pathParts.pop();
    const newPath = "/" + pathParts.join("/");
    fetchAudioList(newPath === "/" ? "/owlbear" : newPath);
  };
  // --------------------------------------------

  const toggleFavorite = (url) => {
    try {
      let newFavorites;
      // Sécurité sur favorites
      const currentFavorites = favorites || [];
      if (currentFavorites.includes(url)) {
        newFavorites = currentFavorites.filter(fav => fav !== url);
      } else {
        newFavorites = [...currentFavorites, url];
      }
      setFavorites(newFavorites);
      localStorage.setItem("owlbear_favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Erreur toggleFavorite :", error);
    }
  };

  // --- FONCTION FAVORIS DOSSIER (Restaurée) ---
  const toggleFolderFavorite = (path) => {
    try {
      let newFavorites;
      const currentFavorites = folderFavorites || [];
      if (currentFavorites.includes(path)) {
        newFavorites = currentFavorites.filter(favPath => favPath !== path);
      } else {
        newFavorites = [...currentFavorites, path];
      }
      setFolderFavorites(newFavorites);
      localStorage.setItem("owlbear_folder_favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Erreur toggleFolderFavorite :", error);
    }
  };
  // -------------------------------------------

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

  return (
    <div className="min-h-screen relative text-white">
  
      {/* GLOBAL FIXED ELEMENTS */}
      <Notification notification={notification} />
      <StarToggle menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
      <FavoritesMenu
        isOpen={menuOpen}
        favorites={favorites}
        folderFavorites={folderFavorites} // Passé correctement
        audioList={audioList}
        playTrack={playTrack}
        playAudio={playAudio}
        toggleFavorite={toggleFavorite}
        toggleFolderFavorite={toggleFolderFavorite} // Passé correctement
        toggleMenu={() => setMenuOpen(!menuOpen)}
        changeFolder={changeFolder} // Passé correctement
      />
  
      {/* MAIN CONTENT */}
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
              audioUrl={audioUrl}
              setAudioUrl={setAudioUrl}
              audioList={audioList}
              playTrack={playTrack}
              playAudio={playAudio}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              
              // Props ajoutées pour la navigation
              currentPath={currentPath}
              changeFolder={changeFolder}
              goBack={goBack}
              folderFavorites={folderFavorites}
              toggleFolderFavorite={toggleFolderFavorite}
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