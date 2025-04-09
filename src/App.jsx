import React, { useEffect, useState } from "react"
import OBR from "@owlbear-rodeo/sdk"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"

export default function App() {
  const [audioUrl, setAudioUrl] = useState("")
  const [audioList, setAudioList] = useState([])
  const [notification, setNotification] = useState(null)

  const apiUrl = "https://owl-reaction-backend-server.vercel.app/api/dropbox-files"

  useEffect(() => {
    OBR.onReady(() => {
      console.log("🟢 OBR prêt, écoute de mini-tracks-play...")
      OBR.broadcast.onMessage("mini-tracks-play", (event) => {
        const { url, playAt } = event.data
        const from = event.connectionId

        console.log("📥 Reçu mini-tracks-play depuis", from ?? "❓ inconnu", url)
        setNotification(`🔊 Son déclenché par ${from?.slice(0, 6) ?? "❓ inconnu"}`)
        setTimeout(() => setNotification(null), 3000)

        const wait = Math.max(playAt - Date.now(), 0)

        setTimeout(() => {
          const audio = new Audio(url)
          audio.play()
            .then(() => console.log("🔊 Audio joué avec succès"))
            .catch((e) => console.warn("🔇 Échec de lecture audio :", e))
        }, wait)
      })
    })
  }, [])

  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        console.log("🎧 Fichiers Dropbox récupérés :", data)

        const fixed = data.map(file => {
          let fixedUrl = file.url.replace(/([?&])dl=0(&|$)/, "$1raw=1$2")
          return { name: file.name, url: fixedUrl }
        })

        setAudioList(fixed)
        if (fixed.length > 0) {
          setAudioUrl(fixed[0].url)
        }
      })
      .catch(err => console.error("❌ Erreur chargement des sons :", err))
  }, [])

  function playTrack() {
    const delay = 600
    const playAt = Date.now() + delay

    const message = { url: audioUrl, playAt }

    console.log("📤 Envoi du message mini-tracks-play :", message)
    OBR.broadcast.sendMessage("mini-tracks-play", message)

    setTimeout(() => {
      const audio = new Audio(audioUrl)
      audio.play().catch(e => console.warn("🔇 Audio bloqué localement :", e))
    }, delay)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded shadow-lg z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h1
        className="text-3xl font-extrabold text-center mb-6 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🎧 Owl Soundboard 🎧
      </motion.h1>

      <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <p className="text-xs text-blue-500 mb-1">
          🎷 Fichiers trouvés : {audioList.length}
        </p>

        {audioList.length > 0 && (
          <select
            className="w-full border border-gray-300 rounded px-4 py-2 text-sm mb-2 bg-white"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
          >
            {audioList.map((file) => (
              <option key={file.name} value={file.url}>{file.name}</option>
            ))}
          </select>
        )}

        <input
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
          type="text"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value.replace(/([?&])dl=0(&|$)/, "$1raw=1$2"))}
          placeholder="Colle ici ton lien audio (Dropbox, etc.)"
        />

        <button
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded mt-3"
          onClick={playTrack}
        >
          ▶️ Jouer le son pour tout le monde
        </button>
      </motion.div>
    </div>
  )
}
