import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { apiService } from "../services/services";
import { CheckCircle, XCircle, Camera, User, Calendar, Clock, AlertTriangle } from "lucide-react";

interface VerificationData {
  socio: string;
  cedula: string;
  plan: string;
  image?: string;
  check_in_time?: string;
}

interface VerificationResult {
  valid: boolean;
  message: string;
  is_reentry?: boolean;
  data?: VerificationData;
}

const AdminQrScanner: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerId = "qr-reader";

  const initScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.error("Error clearing scanner:", e);
      }
      scannerRef.current = null;
    }

    setResult(null);

    const scanner = new Html5QrcodeScanner(
      scannerContainerId,
      {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        // Stop scanning and turn off camera when a QR code is detected
        if (scannerRef.current) {
          try {
            await scannerRef.current.clear();
          } catch (e) {
            console.error("Error clearing scanner on detection:", e);
          }
          scannerRef.current = null;
        }
        await handleVerify(decodedText);
      },
      (error) => {
        // Log errors as warnings to avoid cluttering the console
        console.warn("Scanner error:", error);
      }
    );
  };

  useEffect(() => {
    initScanner();

    // Función para traducir el selector de cámaras y sus opciones
    const translateCameraSelect = () => {
      const container = document.getElementById(scannerContainerId);
      if (!container) return;

      // 1. Traducir el label/span
      const spans = container.querySelectorAll("span, label, p, div");
      spans.forEach((el) => {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
          const text = el.textContent || "";
          if (text.includes("Select Camera")) {
            el.textContent = text.replace("Select Camera", "Seleccionar cámara");
          }
        }
      });

      // 2. Traducir las opciones del select
      const selects = container.querySelectorAll("select");
      selects.forEach((select) => {
        let cameraIndex = 1;
        Array.from(select.options).forEach((option) => {
          const text = option.text;
          
          if (text.startsWith("Opción ")) {
            return;
          }
          
          if (!option.value || text.toLowerCase().includes("select camera") || text.toLowerCase().includes("seleccionar")) {
            if (text.startsWith("Seleccionar cámara")) {
              return;
            }
            const match = text.match(/\((\d+)\)/);
            const count = match ? ` (${match[1]})` : "";
            option.text = `Seleccionar cámara${count}`;
            return;
          }
          
          const isFront = text.toLowerCase().includes("facing front") || text.toLowerCase().includes("front");
          const isBack = text.toLowerCase().includes("facing back") || text.toLowerCase().includes("back");
          
          let cameraName = "";
          if (isFront) {
            cameraName = "Cámara frontal";
          } else if (isBack) {
            cameraName = "Cámara trasera";
          } else {
            cameraName = text;
          }
          
          option.text = `Opción ${cameraIndex}: ${cameraName}`;
          cameraIndex++;
        });
      });
    };

    // Traductor en tiempo real para html5-qrcode
    const observer = new MutationObserver((mutations) => {
      translateCameraSelect();
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "characterData") {
          const container = document.getElementById(scannerContainerId);
          if (!container) return;

          // Función recursiva para reemplazar texto en nodos de texto
          const replaceText = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              let text = node.textContent || "";
              let changed = false;

              if (text.includes("Request Camera Permissions")) {
                text = text.replace("Request Camera Permissions", "Permitir cámara");
                changed = true;
              }
              if (text.includes("Start Scanning")) {
                text = text.replace("Start Scanning", "Iniciar escáner");
                changed = true;
              }
              if (text.includes("Stop Scanning")) {
                text = text.replace("Stop Scanning", "Detener");
                changed = true;
              }
              if (text.includes("No camera found")) {
                text = text.replace("No camera found", "No se encontró cámara");
                changed = true;
              }
              if (text.includes("Camera access is only supported")) {
                text = "La cámara requiere conexión segura (HTTPS o localhost).";
                changed = true;
              }
              if (text.includes("NotFoundError") || text.includes("Requested device not found")) {
                text = "📷 No se detectó ninguna cámara en este dispositivo";
                changed = true;
              }
              if (text.includes("NotAllowedError") || text.includes("Permission denied") || text.includes("Permission dismissed")) {
                text = "🔒 Permiso de cámara denegado. Habilítalo en la configuración del navegador.";
                changed = true;
              }
              if (text.includes("NotReadableError") || text.includes("Could not start video source")) {
                text = "⚠️ La cámara está siendo usada por otra aplicación. Ciérrala e intenta de nuevo.";
                changed = true;
              }
              if (text.includes("OverconstrainedError")) {
                text = "⚠️ La cámara seleccionada no está disponible.";
                changed = true;
              }

              if (changed) {
                node.textContent = text;
              }
            } else {
              node.childNodes.forEach(replaceText);
            }
          };

          replaceText(container);
        }
      });
    });

    const target = document.getElementById(scannerContainerId);
    if (target) {
      observer.observe(target, { childList: true, subtree: true, characterData: true });
    }

    return () => {
      observer.disconnect();
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const handleVerify = async (token: string) => {
    setLoading(true);
    try {
      const response = await apiService.verifyQrTicket(token);
      setResult({
        valid: response.data.valid,
        message: response.data.message,
        is_reentry: response.data.is_reentry,
        data: response.data.data,
      });
    } catch (err: any) {
      setResult({
        valid: false,
        message: err.response?.data?.message || "Error al verificar el código QR o comunicarse con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextScan = () => {
    setResult(null);
    initScanner();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-linear-to-r from-teal-700 to-teal-500 p-6 text-center shadow-md">
          <div className="flex justify-center mb-2">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Control de Acceso</h1>
          <p className="text-teal-50 text-sm mt-1">
            Enfoca el código QR del cliente en el recuadro
          </p>
        </div>

        {/* Scanner Area */}
        <div className="p-6 flex flex-col items-center justify-center relative min-h-[400px] bg-gray-50 dark:bg-gray-900/50">
          
          <div 
            className={`w-full transition-all duration-300 ${result || loading ? 'opacity-0 absolute pointer-events-none' : 'opacity-100'}`}
          >
            {/* Contenedor del escáner */}
            <div id={scannerContainerId} className="mx-auto rounded-xl overflow-hidden border-2 border-teal-100 dark:border-teal-900/30 shadow-inner"></div>
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
              <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg"></div>
              <p className="text-teal-600 dark:text-teal-400 font-semibold text-lg animate-pulse">Verificando acceso...</p>
            </div>
          )}

          {/* Resultado: Éxito o Error */}
          {result && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 z-20 animate-in fade-in zoom-in duration-300">
              
              {result.valid ? (
                // ✅ Modal de Éxito
                <div className="w-full max-w-sm flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full"></div>
                    <div className="relative w-32 h-32 rounded-full border-4 border-teal-500 shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                      {result.data?.image ? (
                        <img src={result.data.image} alt="Foto del cliente" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white rounded-full p-2 border-4 border-white dark:border-gray-900 shadow-lg">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    {result.data?.socio || "Cliente Valido"}
                  </h2>
                  <p className="text-teal-700 dark:text-teal-400 font-medium mb-6 bg-teal-50 dark:bg-teal-900/30 px-4 py-2 rounded-lg border border-teal-100 dark:border-teal-800 shadow-sm">
                    {result.message}
                  </p>

                  <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <Calendar className="w-5 h-5 mr-3 text-teal-500" />
                      <span className="font-semibold text-gray-900 dark:text-white mr-2">Plan:</span>
                      {result.data?.plan || "N/A"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <User className="w-5 h-5 mr-3 text-teal-500" />
                      <span className="font-semibold text-gray-900 dark:text-white mr-2">Cédula:</span>
                      {result.data?.cedula || "N/A"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-5 h-5 mr-3 text-teal-500" />
                      <span className="font-semibold text-gray-900 dark:text-white mr-2">Ingreso:</span>
                      {result.data?.check_in_time ? new Date(result.data.check_in_time).toLocaleTimeString() : new Date().toLocaleTimeString()}
                    </div>
                  </div>

                  <button
                    onClick={handleNextScan}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:shadow-md"
                  >
                    Escanear Siguiente
                  </button>
                </div>
              ) : (
                // ❌ Modal de Error
                <div className="w-full max-w-sm flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
                    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full border-4 border-red-500 shadow-2xl">
                      <AlertTriangle className="w-20 h-20 text-red-500" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Acceso Denegado
                  </h2>
                  
                  <div className="w-full bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-500/30 mb-8 shadow-inner text-left relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                     <p className="text-red-700 dark:text-red-400 font-medium pl-2 text-lg leading-relaxed">
                      {result.message}
                    </p>
                  </div>

                  <button
                    onClick={handleNextScan}
                    className="w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:shadow-md flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Cerrar y Reintentar
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        /* Overrides for html5-qrcode UI to match our clean design */
        #qr-reader {
          border: none !important;
          border-radius: 1rem;
        }
        #qr-reader img[alt="Info icon"] {
          display: none !important;
        }
        #qr-reader img {
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }
        #qr-reader__dashboard_section_csr span {
          color: #0d9488 !important; /* teal-600 */
          font-weight: 600;
        }
        #qr-reader__dashboard_section_csr span.text-red-500,
        #qr-reader span[style*="color: red"],
        #qr-reader__dashboard_section_csr span[style*="color"] {
          color: #f59e0b !important; /* amber-500 — amigable */
          font-weight: 600 !important;
          display: block !important;
          margin: 16px auto !important;
          padding: 14px 20px !important;
          background: rgba(245, 158, 11, 0.08) !important;
          border: 1px solid rgba(245, 158, 11, 0.25) !important;
          border-radius: 14px !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          text-align: center !important;
          max-width: 360px !important;
        }
        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }
        #qr-reader button {
          background: #0d9488 !important; /* teal-600 */
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          margin: 4px !important;
        }
        #qr-reader button:hover {
          background: #0f766e !important; /* teal-700 */
          transform: translateY(-1px);
        }
        #qr-reader select {
          padding: 8px !important;
          border-radius: 8px !important;
          border: 1px solid #e5e7eb !important;
          margin: 8px 0 !important;
          outline: none !important;
        }
      `}</style>
    </div>
  );
};

export default AdminQrScanner;
