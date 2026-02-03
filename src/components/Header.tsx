import { useState, useEffect, useRef } from "react";
import { faBars, faUser, faBell, faExclamationTriangle, faSignOutAlt, faSpinner, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/services";

interface AlertClient {
  name: string;
  phone: string;
  cedula: string;
  fecha_vencimiento: string;
  plan_name: string;
}

interface AlertResponse {
  message: string;
  count: number;
  clients: AlertClient[];
}

interface HeaderProps {
  onToggleAside: () => void;
}

function Header({ onToggleAside }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertResponse | null>(null);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);
  const navigate = useNavigate();

  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const response = await apiService.getAlertClient();
      setAlertData(response.data);
    } catch (error) {
      console.error("Error al obtener alertas:", error);
      setAlertData(null);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Refrescar cada 5 minutos
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="text-gray-600 hover:text-teal-600 lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
          onClick={onToggleAside}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <span className="text-xl font-bold ">
          FitLog
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 relative">
        {/* Botón Campana */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              if (!isNotificationOpen) fetchAlerts();
            }} 
            className={`cursor-pointer relative p-2 rounded-full transition-all ${isNotificationOpen ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <FontAwesomeIcon icon={faBell} className="size-5" />
            {alertData && alertData.count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                {alertData.count}
              </span>
            )}
          </button>

          {/* Cuadro de notificaciones */}
          {isNotificationOpen && (
  <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-20 sm:top-auto mt-0 sm:mt-3 w-auto sm:w-96 rounded-xl bg-white shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
    <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
      <h3 className="font-bold text-gray-800 text-sm sm:text-base">Membresías Vencidas</h3>
      {alertData && (
        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">
          {alertData.count} {alertData.count === 1 ? 'Vencida' : 'Vencidas'}
        </span>
      )}
    </div>
    
    <div className="max-h-80 overflow-y-auto">
      {loadingAlerts ? (
        <div className="p-8 flex items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="text-teal-600 text-xl animate-spin" />
        </div>
      ) : alertData && alertData.clients && alertData.clients.length > 0 ? (
        alertData.clients.map((client, index) => (
          <div key={index} className="w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
            <div className="mt-1 text-amber-500 flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
              <p className="text-xs text-gray-500 truncate">{client.plan_name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="text-[10px] text-rose-500 font-medium whitespace-nowrap">
                  Vencido: {formatDate(client.fecha_vencimiento)}
                </span>
                <a 
                  href={`tel:${client.phone}`}
                  className="text-[10px] text-teal-600 font-medium flex items-center gap-1 hover:underline whitespace-nowrap"
                >
                  <FontAwesomeIcon icon={faPhone} className="text-[8px]" />
                  {client.phone}
                </a>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center text-gray-400">
          <p className="text-sm">No hay membresías vencidas</p>
        </div>
      )}
    </div>
  </div>
)}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            className="cursor-pointer flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium hover:shadow-md transition-shadow bg-white"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-[10px]">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <span className="hidden sm:block text-gray-700 ">Administrador</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 z-50">
              <button 
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600 text-left font-medium"
              >
                <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
