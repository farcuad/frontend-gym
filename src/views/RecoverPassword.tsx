import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faArrowLeft, faDumbbell, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import type { AxiosError } from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";

interface RecoverPassword {
  email: string;
}

function AuthRecoverPassword() {
  const [formData, setFormData] = useState<RecoverPassword>({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await Axios.post("https://u2.rsgve.com/gym-api/api/admin/forgot-password", formData);
      if (response.status === 200) {
        notify.success("Revisa tu correo para recuperar tu contraseña");
        navigate("/update-password");
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      notify.error(err.response?.data?.error ?? "Error al intentar enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* BARRA LATERAL IZQUIERDA (Banner Visual) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-900 items-center justify-center overflow-hidden">
        {/* <img 
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1375&auto=format&fit=crop" 
          alt="Gym locker room" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        /> */}
        <div className="relative z-10 text-center px-12">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/20 backdrop-blur-sm">
            <FontAwesomeIcon icon={faUnlockAlt} className="text-teal-400 text-3xl" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">RECUPERA TU ACCESO</h1>
          <p className="text-teal-100/80 text-lg font-light max-w-md">
            No dejes que nada detenga el entrenamiento. Ingresa tu correo y te ayudaremos a volver al panel de control de tu gimnasio.
          </p>
          <div className="mt-8">
             <FontAwesomeIcon icon={faDumbbell} className="text-white/20 text-6xl" />
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA (Formulario) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Botón Volver */}
          <NavLink 
            to="/login" 
            className="group inline-flex items-center text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver al Login
          </NavLink>

          <div className="text-left">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">¿Problemas para entrar?</h2>
            <p className="mt-3 text-gray-500">
              Escribe el correo electrónico asociado a tu cuenta de <span className="font-semibold text-teal-600">FitLog</span>.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                Correo Electrónico
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 pr-12 text-gray-900 transition-all focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none sm:text-sm"
                  placeholder="ejemplo@gym.com"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 group-focus-within:text-teal-500 transition-colors pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center items-center rounded-xl bg-gray-900 px-4 py-4 text-sm font-bold text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando enlace...
                </span>
              ) : "Enviar Código de Recuperación"}
            </button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya recordaste tu contraseña?{" "}
              <NavLink to="/login" className="font-bold text-teal-600 hover:underline">
                Haz clic aquí
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthRecoverPassword;