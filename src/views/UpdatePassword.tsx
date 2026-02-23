import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope, faShieldAlt, faArrowLeft, faDumbbell } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";

interface UpdatePassword {
  email: string;
  password: string;
  code: string;
}

function AuthUpdatePassword() {
  const [formData, setFormData] = useState<UpdatePassword>({
    email: "",
    password: "",
    code: "",
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
      const response = await Axios.post("https://u2.rsgve.com/gym-api/api/admin/password", formData);
      if (response.status === 200) {
        notify.success("Tu contraseña ha sido cambiada correctamente");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      notify.error("Error al actualizar la contraseña. Verifica el código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SECCIÓN IZQUIERDA: Banner Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-900 items-center justify-center overflow-hidden">
        {/* <img 
          src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1469&auto=format&fit=crop" 
          alt="Gym equipment" 
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        /> */}
        <div className="relative z-10 text-center px-12">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <FontAwesomeIcon icon={faShieldAlt} className="text-teal-400 text-3xl" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">ASEGURA TU CUENTA</h1>
          <p className="text-teal-100 text-lg font-light max-w-md mx-auto">
            Estás a un paso de recuperar el control total. Crea una contraseña fuerte para mantener tu información protegida.
          </p>
          <div className="mt-10 opacity-20">
             <FontAwesomeIcon icon={faDumbbell} className="text-white text-8xl" />
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-md space-y-8">
          <NavLink 
            to="/login" 
            className="group inline-flex items-center text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Cancelar y volver
          </NavLink>

          <div className="text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-balance">Establecer nueva contraseña</h2>
            <p className="mt-2 text-gray-500 text-sm">
              Ingresa el código que enviamos a tu email y tu nueva clave de acceso.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Confirmar Email</label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm"
                    placeholder="ejemplo@correo.com"
                  />
                  <FontAwesomeIcon icon={faEnvelope} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
              </div>

              {/* Código de Verificación */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Código de Seguridad</label>
                <div className="relative group">
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm tracking-[0.25em] font-mono"
                    placeholder="••••••••"
                  />
                  <FontAwesomeIcon icon={faShieldAlt} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nueva Contraseña</label>
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center items-center rounded-xl bg-gray-900 px-4 py-4 text-sm font-bold text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Actualizando..." : "Restablecer Contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthUpdatePassword;