import { useEffect, useState } from "react";
import { apiService } from "../services/services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faMobileAlt, faCheckCircle, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { notify } from "../utils/toast";

interface AppConfig {
  download_url: string;
  version_label: string;
  platform: string;
}

const DownloadApp = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await apiService.getAppConfig();
        if (response.data && response.data.config) {
          setConfig(response.data.config);
        }
      } catch (error) {
        console.error("Error fetching app config:", error);
        notify.error("No se pudo obtener la configuración de la app");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="md:flex">
          {/* Left Side: Visual/Mockup */}
          <div className="md:w-1/2 bg-teal-600 p-12 text-white flex flex-col justify-center items-center text-center">
            <div className="relative mb-8">
               <div className="bg-white/10 backdrop-blur-md p-6 rounded-full">
                  <FontAwesomeIcon icon={faMobileAlt} className="text-7xl" />
               </div>
               <div className="absolute -top-2 -right-2 bg-yellow-400 text-teal-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                 NUEVO
               </div>
            </div>
            <h2 className="text-3xl font-black mb-4">FitLog Mobile</h2>
            <p className="text-teal-50 opacity-90 leading-relaxed">
              Lleva tu progreso a todos lados. Entrena, visualiza tus rutinas y chatea con nuestra IA desde la palma de tu mano.
            </p>
          </div>

          {/* Right Side: Instructions and Action */}
          <div className="md:w-1/2 p-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Android App
              </span>
              <span className="text-gray-400 text-xs">v{config?.version_label || "1.0.0"}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Instrucciones de Instalación</h1>
            
            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold">1</div>
                <p className="text-gray-600 text-sm">
                  Haz clic en el botón <span className="font-semibold">Descargar APK</span> para bajar el instalador a tu dispositivo.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold">2</div>
                <p className="text-gray-600 text-sm">
                  Si tu teléfono bloquea la instalación, ve a <span className="font-semibold">Ajustes</span> y habilita <span className="font-semibold">"Fuentes desconocidas"</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold">3</div>
                <p className="text-gray-600 text-sm">
                  Abre el archivo descargado y sigue los pasos para completar la instalación.
                </p>
              </div>
            </div>

            {config?.download_url ? (
              <a 
                href={config.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-teal-200 hover:shadow-teal-300 hover:-translate-y-1"
              >
                <FontAwesomeIcon icon={faDownload} className="group-hover:animate-bounce" />
                <span>Descargar APK</span>
              </a>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-700">
                <FontAwesomeIcon icon={faInfoCircle} className="mt-1" />
                <p className="text-sm">El enlace de descarga no está disponible en este momento. Por favor, contacta al administrador.</p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                <span>Seguro y verificado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
