import { NavLink } from "react-router-dom";
import { 
  faUsers, 
  faLayerGroup, 
  faIdCard, 
  faRobot, 
  faDumbbell,
  faMoneyCheckDollar,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface AsideProps {
  isOpen: boolean;
  onClose: () => void;
}

function Aside({ isOpen, onClose }: AsideProps) {
  const role = localStorage.getItem("role") || "admin"; // Fallback a admin si no hay rol

  // Clase para los links (activos vs inactivos)
  const navLinkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200
    ${isActive 
      ? "bg-teal-600 text-white shadow-md shadow-teal-200" 
      : "text-gray-500 hover:bg-teal-50 hover:text-teal-600"}
  `;

  const isAdmin = role === "admin" || role === "super_admin";
  const isTrainer = role === "trainer" || isAdmin;
  const isCashier = role === "cashier" || isAdmin;
  const isClient = role === "client";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`
          w-72 bg-white border-r h-screen
          fixed lg:static z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="h-20 flex items-center px-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg text-white shadow-lg">
              <FontAwesomeIcon icon={faDumbbell} className="size-5" />
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight italic">
              FIT<span className="text-teal-600">LOG</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1 text-[15px] font-medium overflow-y-auto max-h-[calc(100vh-100px)] pb-10">
          {!isClient ? (
            <>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 px-4 mb-2">Menú Principal</p>
              
              {isCashier && (
                <>
                  <NavLink to="/home/metrics" className={navLinkClass}>
                    <FontAwesomeIcon icon={faChartLine} className="w-5" />
                    <span>Métricas</span>
                  </NavLink>

                  <NavLink to="/home/clients" className={navLinkClass}>
                    <FontAwesomeIcon icon={faUsers} className="w-5" />
                    <span>Gestión de Clientes</span>
                  </NavLink>

                  <NavLink to="/home/plans" className={navLinkClass}>
                    <FontAwesomeIcon icon={faLayerGroup} className="w-5" />
                    <span>Planes</span>
                  </NavLink>

                  <NavLink to="/home/memberships" className={navLinkClass}>
                    <FontAwesomeIcon icon={faIdCard} className="w-5" />
                    <span>Membresías</span>
                  </NavLink>

                  <NavLink to="/home/history-pagos" className={navLinkClass}>
                    <FontAwesomeIcon icon={faMoneyCheckDollar} className="w-5" />
                    <span>Historial de Pagos</span>
                  </NavLink>
                </>
              )}

              {isAdmin && (
                <NavLink to="/home/bots" className={navLinkClass}>
                  <FontAwesomeIcon icon={faRobot} className="w-5" />
                  <span>Configuración Bot</span>
                </NavLink>
              )}

              {/* SECCIÓN ENTRENADOR */}
              {isTrainer && (
                <div className="pt-4">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 px-4 mb-2">Entrenamiento</p>
                  <NavLink to="/home/exercises" className={navLinkClass}>
                    <FontAwesomeIcon icon={faDumbbell} className="w-5" />
                    <span>Ejercicios</span>
                  </NavLink>
                  <NavLink to="/home/routines" className={navLinkClass}>
                    <FontAwesomeIcon icon={faLayerGroup} className="w-5" />
                    <span>Rutinas</span>
                  </NavLink>
                  <NavLink to="/home/assign-routines" className={navLinkClass}>
                    <FontAwesomeIcon icon={faIdCard} className="w-5" />
                    <span>Asignar Rutinas</span>
                  </NavLink>
                </div>
              )}

              <div className="pt-4">
                <p className="text-[11px] uppercase tracking-wider text-gray-400 px-4 mb-2">Inteligencia Artificial</p>
                <NavLink to="/home/chat" className={navLinkClass}>
                  <FontAwesomeIcon icon={faRobot} className="w-5" />
                  <span>Asistente AI</span>
                </NavLink>
              </div>

              {isAdmin && (
                <div className="pt-4">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 px-4 mb-2">Administración</p>
                  <NavLink to="/home/users" className={navLinkClass}>
                    <FontAwesomeIcon icon={faUsers} className="w-5" />
                    <span>Gestión de Personal</span>
                  </NavLink>
                  <NavLink to="/home/plans-gym" className={navLinkClass}>
                    <FontAwesomeIcon icon={faMoneyCheckDollar} className="w-5" />
                    <span>Planes para Gym</span>
                  </NavLink>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 px-4 mb-2">Mi Portal</p>
              <NavLink to="/home/my-routines" className={navLinkClass}>
                <FontAwesomeIcon icon={faDumbbell} className="w-5" />
                <span>Mis Rutinas</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

export default Aside;