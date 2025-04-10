import { Volume2, VolumeX } from "lucide-react";

export default function AudioControls({ isMuted, toggleMute, volume, handleVolumeChange, stopAllSounds, audiosCount }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={toggleMute}
          className={`flex items-center gap-2 px-3 py-2 rounded transition ${
            isMuted ? "bg-red-700 hover:bg-red-600" : "bg-zinc-900 hover:bg-zinc-800"
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
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
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
        Sons actifs : {audiosCount}
      </div>
    </>
  );
}
