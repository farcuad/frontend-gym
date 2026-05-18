import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { apiService } from "../services/services";
import { RefreshCcw, ShieldCheck, AlertCircle, QrCode, X } from "lucide-react";

const ClientQrView: React.FC = () => {
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = async () => {
    setIsGenerated(true);
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.generateAccessTicket();
      setToken(response.data.token);
      setTimeLeft(120); // 2 minutes in seconds
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al generar el ticket de acceso. Por favor intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeft <= 0 && !loading && isGenerated;

  const handleClose = () => {
    setIsGenerated(false);
    setToken(null);
  };

  if (!isGenerated) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 duration-500">
        <button
          onClick={fetchTicket}
          className="flex items-center gap-3 px-6 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-bold transition-all shadow-[0_8px_30px_rgb(13,148,136,0.4)] hover:shadow-[0_8px_30px_rgb(13,148,136,0.6)] active:scale-95 border border-teal-500/50"
        >
          <QrCode className="w-6 h-6" />
          <span>Generar mi QR</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-linear-to-b from-teal-900 to-teal-950 rounded-4xl p-8 shadow-2xl border border-teal-800 w-full max-w-sm relative overflow-hidden group animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-teal-200/50 hover:text-white z-30 transition-colors p-2 bg-teal-800/30 rounded-full hover:bg-teal-700/50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-500/20 blur-[80px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10 flex flex-col items-center text-center mt-2">
          <div className="bg-teal-800/80 p-3 rounded-full mb-4 shadow-inner border border-teal-700/50">
            <ShieldCheck className="w-8 h-8 text-teal-400" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Pase de Acceso</h2>
          <p className="text-teal-100/70 text-sm mb-6 leading-tight">
            Acerca este código al escáner de la entrada para registrar tu asistencia.
          </p>

          {loading ? (
            <div className="w-56 h-56 flex items-center justify-center bg-teal-900/50 rounded-3xl border border-teal-800/50 animate-pulse shadow-inner">
              <RefreshCcw className="w-10 h-10 text-teal-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="w-56 h-56 flex flex-col items-center justify-center bg-red-900/20 rounded-3xl border border-red-500/30 p-6 shadow-inner">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          ) : (
            <div className="relative group">
              <div 
                className={`bg-white p-4 rounded-3xl shadow-xl transition-all duration-500 border-4 border-teal-500/20 ${
                  isExpired ? "opacity-20 blur-md scale-95 grayscale" : "opacity-100 scale-100"
                }`}
              >
                {token && (
                  <QRCodeSVG 
                    value={token} 
                    size={200} 
                    level="H"
                    includeMargin={false}
                    className="rounded-xl"
                  />
                )}
              </div>

              {/* Overlay when expired */}
              {isExpired && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-950/90 backdrop-blur-sm rounded-3xl border border-teal-800 z-20 transition-all duration-300">
                  <span className="text-red-400 font-bold mb-4 text-lg">Código Expirado</span>
                  <button
                    onClick={fetchTicket}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-teal-500/40 active:scale-95"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Generar Nuevo
                  </button>
                </div>
              )}
            </div>
          )}

          {!error && !loading && !isExpired && (
            <div className="mt-6 flex flex-col items-center w-full px-2">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-teal-200/70 text-xs font-bold uppercase tracking-wider">Válido por</span>
                <span className={`text-xl font-black tabular-nums tracking-tight ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-teal-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-full bg-teal-900/80 h-2 rounded-full overflow-hidden border border-teal-800/50">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                    timeLeft < 30 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-linear-to-r from-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                  }`}
                  style={{ width: `${(timeLeft / 120) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientQrView;
