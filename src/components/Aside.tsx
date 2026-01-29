import { NavLink } from "react-router-dom";
import { 
  faUsers, 
  faLayerGroup, 
  faIdCard, 
  faRobot, 
  faDumbbell 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface AsideProps {
  isOpen: boolean;
  onClose: () => void;
}

function Aside({ isOpen, onClose }: AsideProps) {
  // Clase para los links (activos vs inactivos)
  const navLinkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200
    ${isActive 
      ? "bg-teal-600 text-white shadow-md shadow-teal-200" 
      : "text-gray-500 hover:bg-teal-50 hover:text-teal-600"}
  `;

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
        <nav className="px-4 space-y-1 text-[15px] font-medium">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 px-4 mb-2">Menú Principal</p>
          
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

          <div className="pt-4">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 px-4 mb-2">Inteligencia Artificial</p>
            <NavLink to="/home/chat" className={navLinkClass}>
              <FontAwesomeIcon icon={faRobot} className="w-5" />
              <span>Asitente AI</span>
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Aside;