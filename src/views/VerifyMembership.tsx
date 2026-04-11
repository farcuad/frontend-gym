import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faDumbbell,
  faUser,
  faIdCard,
  faBuilding,
  faCrown,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";

interface VerifyData {
  socio: string;
  cedula: string;
  gimnasio: string;
  plan: string;
  vencimiento: string;
  mensaje: string;
}

interface VerifyResponse {
  valid: boolean;
  data: VerifyData;
}

type PageState = "loading" | "valid" | "invalid" | "error";

function VerifyMembership() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<PageState>("loading");
  const [data, setData] = useState<VerifyData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) {
      setState("error");
      setErrorMsg("No se proporcionó un código de verificación.");
      return;
    }

    const verify = async () => {
      try {
        const response = await Axios.get<VerifyResponse>(
          `https://u2.rsgve.com/gym-api/api/memberships/${id}/verify`
        );

        if (response.data.valid) {
          setState("valid");
          setData(response.data.data);
        } else {
          setState("invalid");
          setData(response.data.data);
        }
      } catch (error: unknown) {
        setState("error");
        if (Axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setErrorMsg("El código de membresía no es válido o no existe.");
          } else if (error.response && error.response.status >= 500) {
            setErrorMsg("Error en el servidor. Intente nuevamente más tarde.");
          } else {
            setErrorMsg("Error de conexión. Verifique su conexión a internet.");
          }
        } else {
          setErrorMsg("Ocurrió un error inesperado.");
        }
      }
    };

    verify();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ─── Loading Skeleton ─────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl p-8 animate-pulse space-y-6">
            {/* Icon skeleton */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full" />
            </div>
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded-lg mx-auto w-3/4" />
              <div className="h-4 bg-gray-100 rounded-lg mx-auto w-1/2" />
            </div>
            {/* Rows skeleton */}
            <div className="space-y-4 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
            {/* Spinner */}
            <div className="flex justify-center pt-2">
              <svg
                className="animate-spin h-7 w-7 text-teal-500"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="text-center text-sm text-gray-400 font-medium">
              Verificando membresía…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header band */}
            <div className="bg-linear-to-r from-amber-400 to-orange-400 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="text-white text-4xl"
                />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Error de Verificación
              </h1>
            </div>
            {/* Body */}
            <div className="p-6 text-center space-y-5">
              <p className="text-gray-600 text-sm leading-relaxed">
                {errorMsg}
              </p>
              <button
                onClick={() => window.close()}
                className="w-full py-3.5 px-4 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Branding */}
          <div className="flex items-center justify-center gap-2 mt-6 opacity-40">
            <FontAwesomeIcon icon={faDumbbell} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 tracking-wide">
              FITLOG PRO
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Valid / Invalid States ────────────────────────────────────
  const isValid = state === "valid";

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
        isValid
          ? "bg-linear-to-br from-emerald-50 via-green-50 to-teal-50"
          : "bg-linear-to-br from-red-50 via-rose-50 to-pink-50"
      }`}
    >
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* ── Status Header ── */}
          <div
            className={`px-6 py-8 text-center transition-colors ${
              isValid
                ? "bg-linear-to-r from-emerald-500 to-teal-500"
                : "bg-linear-to-r from-red-500 to-rose-500"
            }`}
          >
            {/* Animated icon ring */}
            <div
              className={`inline-flex items-center justify-center w-22 h-22 rounded-full mb-4 ${
                isValid ? "bg-white/20" : "bg-white/20"
              } backdrop-blur-sm animate-[bounceIn_0.6s_ease-out]`}
            >
              <FontAwesomeIcon
                icon={isValid ? faCircleCheck : faCircleXmark}
                className="text-white text-5xl drop-shadow-md"
              />
            </div>

            <h1 className="text-2xl font-bold text-white">
              {isValid ? "Membresía Activa" : "Membresía No Válida"}
            </h1>
            {data?.mensaje && (
              <p className="mt-1.5 text-white/80 text-sm font-medium">
                {data.mensaje}
              </p>
            )}
          </div>

          {/* ── Data Body ── */}
          {data && (
            <div className="p-6 space-y-1">
              <DataRow
                icon={faUser}
                label="Socio"
                value={data.socio}
                accent={isValid ? "teal" : "red"}
              />
              <DataRow
                icon={faIdCard}
                label="Cédula"
                value={data.cedula}
                accent={isValid ? "teal" : "red"}
              />
              <DataRow
                icon={faBuilding}
                label="Gimnasio"
                value={data.gimnasio}
                accent={isValid ? "teal" : "red"}
              />
              <DataRow
                icon={faCrown}
                label="Plan"
                value={data.plan}
                accent={isValid ? "teal" : "red"}
              />
              <DataRow
                icon={faCalendarCheck}
                label="Vencimiento"
                value={formatDate(data.vencimiento)}
                accent={isValid ? "teal" : "red"}
              />
            </div>
          )}

          {/* ── Footer Button ── */}
          <div className="px-6 pb-6">
            <button
              onClick={() => window.close()}
              className={`w-full py-3.5 px-4 rounded-xl text-white text-sm font-bold active:scale-[0.98] transition-all shadow-lg ${
                isValid
                  ? "bg-gray-900 hover:bg-teal-700"
                  : "bg-gray-900 hover:bg-rose-700"
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* ── Branding ── */}
        <div className="flex items-center justify-center gap-2 mt-6 opacity-40">
          <FontAwesomeIcon icon={faDumbbell} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
            Fitlog Pro
          </span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Data Row Sub-component                                       */
/* ────────────────────────────────────────────────────────────── */

interface DataRowProps {
  icon: typeof faUser;
  label: string;
  value: string;
  accent: "teal" | "red";
}

function DataRow({ icon, label, value, accent }: DataRowProps) {
  const iconBg =
    accent === "teal"
      ? "bg-teal-50 text-teal-600"
      : "bg-red-50 text-red-500";

  return (
    <div className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <FontAwesomeIcon icon={icon} className="text-sm" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export default VerifyMembership;
