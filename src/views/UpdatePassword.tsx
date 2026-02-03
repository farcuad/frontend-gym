import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";

interface updatePassword {
  email: string;
  password: string;
  code: string;
}
function AuthLogin() {
  const [formData, setFormData] = useState<updatePassword>({
    email: "",
    password: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await Axios.post("https://u2.rsgve.com/gym-api/api/admin/password", formData);
      if(response.status == 200){
        notify.success("Tu contraseña a sido cambiada correctamente");
        setLoading(false);
        navigate("/login");
      }
    }catch (error) {
      console.error(error);
      setLoading(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        {/* Encabezado */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Bienvenido a <span className="text-teal-600">FitLog</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Coloca los datos para recuperar la contraseña
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm transition-all"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Verificación
              </label>
              <div className="flex justify-center">
              <input
                type={"text"}
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm transition-all"
                placeholder="••••••••"
              />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="flex justify-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm transition-all"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-teal-600 transition-colors" style={{ marginLeft: -30}}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="size-4" />
              </button>
              </div>
            </div>
          </div>

          <div>
            <button disabled={loading}
              type="submit" className="group relative flex w-full justify-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors shadow-md">
              {loading ? "Actualizando..." : "Recuperar Contraseña"}
            </button>
          </div>

          <div className="text-center text-sm">
            <NavLink to="/login"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Iniciar Sesion
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthLogin;
