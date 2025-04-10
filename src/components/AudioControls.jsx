import { Volume2, VolumeX } from "lucide-react";

export default function AudioControls({ isMuted, toggleMute, volume, handleVolumeChange, stopAllSounds, audiosCount }) {
  return (
    <div className="w-full max-w-[380px] flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={toggleMute}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition border border-white/10 ${isMuted ? "bg-red-700 hover:bg-red-600" : "bg-black/30 hover:bg-black/50"}`}
        >
          {isMuted ? <VolumeX className="inline-block mr-1" size={16} /> : <Volume2 className="inline-block mr-1" size={16} />}
          {isMuted ? "Muet" : "Son Activé"}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="accent-purple-500"
          />
        </div>
      </div>

      <button
        onClick={stopAllSounds}
        className="w-full py-2 rounded-lg bg-red-700 hover:bg-red-600 transition text-sm font-medium border border-white/10"
      >
        ⏹️ Stop Tous les Sons
      </button>

      <div className="text-xs text-center text-white/50">
        Sons actifs : {audiosCount}
      </div>
    </div>
  );
}
