import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope, faUser, faBuilding, faDumbbell } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import type { AxiosError } from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";
import { checkPasswordStrength } from "../utils/validatePassword";

interface AuthRegister {
  name: string;
  gym_name: string;
  email: string;
  password: string;
}

function AuthRegister() {
  const [formData, setFormData] = useState<AuthRegister>({
    name: "",
    gym_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const passwordInfo = checkPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordInfo?.level === "very-weak") {
      notify.warning("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);

    try {
      const response = await Axios.post("https://u2.rsgve.com/gym-api/api/register", formData);
      if (response.status === 200) {
        notify.success("¡Tu Gimnasio ha sido registrado correctamente!");
        navigate("/login");
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      notify.error(err.response?.data?.error ?? "Error inesperado, intenta nuevamente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SECCIÓN IZQUIERDA: Banner (Consistente con Login) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-800 items-center justify-center overflow-hidden">
        {/* <img 
          src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop" 
          alt="Gym training" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        /> */}
        <div className="relative z-10 text-center px-10">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
            <FontAwesomeIcon icon={faDumbbell} className="text-teal-400 text-5xl mb-4" />
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Únete a FitLog</h1>
            <p className="text-teal-100 text-lg font-light max-w-xs mx-auto">
              Comienza a digitalizar tu gimnasio hoy mismo. Gestión de clientes, pagos y planes en un solo lugar.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario de Registro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Crear Cuenta</h2>
            <p className="mt-2 text-gray-500 text-sm">Regístrate para empezar a usar el panel administrativo.</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              {/* Nombre del Gimnasio */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre del Gimnasio</label>
                <div className="relative group">
                  <input
                    type="text"
                    name="gym_name"
                    value={formData.gym_name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm"
                    placeholder="Titan Gym Center"
                  />
                  <FontAwesomeIcon icon={faBuilding} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
              </div>

              {/* Nombre Administrador */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre del Administrador</label>
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm"
                    placeholder="Juan Pérez"
                  />
                  <FontAwesomeIcon icon={faUser} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Correo Corporativo</label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm"
                    placeholder="admin@tu-gym.com"
                  />
                  <FontAwesomeIcon icon={faEnvelope} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contraseña</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                
                {/* Indicador de Fuerza de Contraseña */}
                {formData.password && passwordInfo && (
                  <div className="mt-3 px-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase text-gray-500">Seguridad:</span>
                      <span className={`text-xs font-bold ${passwordInfo.color}`}>{passwordInfo.label}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${passwordInfo.bar}`}
                        style={{ width: passwordInfo.level === 'very-weak' ? '25%' : passwordInfo.level === 'weak' ? '50%' : passwordInfo.level === 'medium' ? '75%' : '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={loading || passwordInfo?.level === "very-weak"}
              type="submit"
              className="w-full flex justify-center items-center rounded-xl bg-teal-600 px-4 py-4 text-sm font-bold text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creando cuenta..." : "Comenzar ahora"}
            </button>

            <p className="text-center text-sm text-gray-600 pt-2">
              ¿Ya tienes una cuenta?{" "}
              <NavLink to="/login" className="font-bold text-teal-600 hover:text-teal-700 transition-colors">
                Inicia Sesión
              </NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthRegister;