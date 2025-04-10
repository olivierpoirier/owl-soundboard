import { motion, AnimatePresence } from "framer-motion";
import imageImporter from "../assets/Importer.png";
import imagePartager from "../assets/Partager.png";
import imagePartager2 from "../assets/Partager2.png";
import imageSons from "../assets/Liste_sons.png";
import imageZoneLien from "../assets/Zone_Lien.png";

export default function HelpSection({ helpOpen, setHelpOpen }) {
  return (
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
            <h4 className="font-bold text-purple-600">Fonctionnalités du soundboard :</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Les fichiers audio sont récupérés automatiquement depuis une base de données Dropbox.</li>
              <li>Vous pouvez choisir un son depuis la liste déroulante, ou coller un lien Dropbox directement.</li>
              <li>Seuls les fichiers audio au format <code>.mp3</code> et <code>.wav</code> sont compatibles.</li>
              <li>Quand vous cliquez sur "Jouer le son", <strong>tous les utilisateurs de la room Owlbear Rodeo l’entendront</strong>.</li>
            </ul>

            <h4 className="font-bold text-purple-600">Comment ajouter un son dans la liste Dropbox ?</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Va sur Dropbox et connecte-toi</li>
              <li>Upload ton fichier .mp3 ou .wav <img src={imageImporter} alt="Importer sur Dropbox"/></li>
              <li>Si le fichier est bien un fichier .mp3 ou .wav, il sera ajouté à la liste</li>
              <img src={imageSons} alt="Liste sons Dropbox"/>
              <li>Colle le lien ici dans l’application</li>
            </ol>

            <h4 className="font-bold text-purple-600">Comment jouer un son à partir d'un lien Dropbox ?</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Va sur Dropbox et connecte-toi</li>
              <li>Upload ton fichier .mp3 ou .wav <img src={imageImporter} alt="Importer sur Dropbox"/></li>
              <li>Clique sur l'icône 🔗 pour copier le lien d'accès<img src={imagePartager} alt="Partager Dropbox"/></li>
              <img src={imagePartager2} alt="Partager 2 Dropbox"/>
              <li>Colle le lien ici dans l’application</li>
              <img src={imageZoneLien} alt="Zone Lien"/>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
