import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope, faDumbbell, faIdCard } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import type { AxiosError } from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";

interface LoginBody {
  email?: string;
  password?: string;
  cedula?: string;
}

function AuthLogin() {
  const [loginMode, setLoginMode] = useState<"admin" | "client">("admin");
  const [formData, setFormData] = useState<LoginBody>({
    email: "",
    password: "",
    cedula: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = loginMode === "admin" 
        ? "https://u2.rsgve.com/gym-api/api/login" 
        : "https://u2.rsgve.com/gym-api/api/client/login";
      
      const payload = loginMode === "admin" 
        ? { email: formData.email, password: formData.password }
        : { cedula: formData.cedula };

      const response = await Axios.post(endpoint, payload);
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        
        // Manejar datos de usuario/cliente
        const userData = response.data.user || response.data.client;
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
          // Guardar el rol explícitamente para el Aside
          const role = loginMode === "client" ? "client" : userData.role;
          localStorage.setItem("role", role);
          
          if (userData.plan_type) {
            localStorage.setItem("plan_type", userData.plan_type);
          }
        }
        
        notify.success("¡Bienvenido de nuevo!");
        setLoading(false);
        
        // Redirección basada en rol
        if (loginMode === "client") {
          navigate("/home/my-routines");
        } else {
          navigate("/home/metrics");
        }
      }
    } catch (error) {
      setLoading(false);
      const err = error as AxiosError<{ error: string }>;
      notify.error(err.response?.data?.error ?? "Error inesperado, intenta nuevamente");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SECCIÓN IZQUIERDA: Banner Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-700 items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-10">
          <FontAwesomeIcon icon={faDumbbell} className="text-white text-6xl mb-6" />
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">FITLOG PRO</h1>
          <p className="text-teal-50 text-xl font-light max-w-md">
            La plataforma definitiva para gestionar el rendimiento y crecimiento de tu comunidad fitness.
          </p>
        </div>
        {/* Decoración abstracta */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* SECCIÓN DERECHA: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-left">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">
              {loginMode === "admin" ? "Iniciar Sesión" : "Acceso Clientes"}
            </h2>
            <p className="mt-2 text-gray-500">
              {loginMode === "admin" 
                ? "Bienvenido de nuevo. Por favor, ingresa tus datos de acceso administrativo."
                : "Ingresa tu número de cédula para ver tus rutinas y progreso."}
            </p>
          </div>

          {/* TABS DE LOGIN */}
          <div className="flex p-1 bg-gray-200 rounded-xl">
            <button
              onClick={() => setLoginMode("admin")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === "admin" ? "bg-white text-teal-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Personal
            </button>
            <button
              onClick={() => setLoginMode("client")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === "client" ? "bg-white text-teal-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Clientes
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {loginMode === "admin" ? (
                <>
                  {/* Input Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm"
                        placeholder="nombre@gimnasio.com"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </div>
                    </div>
                  </div>

                  {/* Input Contraseña */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-teal-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* MODO CLIENTE: Input Cédula */
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cédula de Identidad
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm"
                      placeholder="V-12345678"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                      <FontAwesomeIcon icon={faIdCard} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {loginMode === "admin" && (
              <div className="flex items-center justify-between">
                <NavLink 
                  to="/recover-password" 
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </NavLink>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center items-center rounded-xl bg-gray-900 px-4 py-4 text-sm font-bold text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : loginMode === "admin" ? "Entrar al Panel" : "Ver mis Rutinas"}
            </button>

            {loginMode === "admin" && (
              <p className="text-center text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <NavLink to="/register" className="font-bold text-teal-600 hover:underline">
                  Regístrate ahora
                </NavLink>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthLogin;