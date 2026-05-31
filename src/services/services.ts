import axios, { AxiosError } from "axios";
import { notify } from "../utils/toast";

const API_URL = import.meta.env.VITE_API_URL;
const INTERNAL_KEY = import.meta.env.VITE_INTERNAL_SERVICE_API_KEY;

export interface Clients {
  id?: number;
  name: string;
  cedula: string;
  phone: string;
  fecha_ingreso: string;
  activo: boolean;
  image?: string;
  active_routine?: {
    id: number;
    name: string;
  } | null;
}

export interface Plans {
  id?: number;
  name: string;
  duration_day: number;
  price: number;
}

export interface Memberships {
  id: number;
  plan_id: number;
  client_name: string;
  client_phone: string;
  plan_name: string;
  plan_price: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: "activo" | "vencido" | "suspendido";
}

export interface PaymentInfo {
  chosen_rate_type: string;
  exchange_rate: number;
  amount_paid_bs: number;
  payment_method: "Divisas" | "Pago Móvil";
  reference?: string;
}

export interface PaymentHistory {
  id: number;
  amount_paid_bs: string;
  exchange_rate: string;
  payment_method: string;
  reference: string;
  created_at: string;
  status: string;
  client_name: string;
  client_phone: string;
  plan_name: string;
  plan_price_usd: string;
}

export interface newMembership {
  client_id: number;
  plan_id: number;
  fecha_inicio: string;
  payment_info?: PaymentInfo;
}

export interface RenewMembershipRequest {
  plan_id?: number;
  payment_info: PaymentInfo;
}

export interface BotConfig {
  id?: string;
  gym_id?: number;
  whaibot_id: string;
  whaibot_key: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseBody {
  name: string;
  muscle_group: string | null;
}

export interface RoutinesBody {
  name: string;
  description: string;
}

export interface addExercisesToRoutine {
  exercise_id: number;
  sets: number;
  reps: string;
  day_of_week: number;
  rest_time_seconds: number;
  sort_order: number;
}

export interface addRoutineCliente {
  client_id: number;
  routine_id: number;
  day_of_week?: number;
  start_date?: string;
  end_date: string;
  is_active: boolean;
}

export interface createUsers {
  name: string;
  email: string;
  password: string;
  role: "trainer" | "cashier";
}

export type CategoriaGasto =
  | 'maquinaria'
  | 'mantenimiento'
  | 'servicios'
  | 'insumos'
  | 'nomina'
  | 'marketing'
  | 'otros'
  | 'alquiler';


export interface Gastos {
  id: number;
  titulo: string;
  descripcion: string;
  monto: number;
  categoria: CategoriaGasto;
  fecha_gasto: string;
}

// 1. Crear instancia de Axios con la URL base
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_URL}/refresh`, {}, { withCredentials: true });
        const newToken = data.token;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        localStorage.removeItem("plan_type");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      const data = error.response?.data;
      const code = data?.code;
      if (
        code === "SUBSCRIPTION_EXPIRED" ||
        data?.error === "Acceso denegado"
      ) {
        notify.warning(data.message || "Suscripción vencida");
        const currentPath = window.location.pathname;
        if (currentPath !== "/home/plans-gym") {
          window.location.href = "/home/plans-gym";
        }
      }
    }

    return Promise.reject(error);
  },
);

// 3. Definición de las rutas del sistema
export const apiService = {
  // Clientes
  getClients: () => api.get("/clients"),
  createClient: (data: Clients) => api.post("/clients", data),
  updateClient: (id: string | number, data: Clients) =>
    api.put(`/clients/${id}`, data),
  deleteClient: (id: string | number) => api.delete(`/clients/${id}`),

  // Planes
  getPlans: () => api.get("/plans"),
  createPlan: (data: Plans) => api.post("/plans", data),
  updatePlan: (id: string | number, data: Plans) =>
    api.put(`/plans/${id}`, data),
  deletePlan: (id: string | number) => api.delete(`/plans/${id}`),

  // Membresias
  getMemberships: () => api.get("/memberships"),
  createMembership: (data: newMembership) => api.post("/memberships", data),
  renewMembership: (id: number, data: RenewMembershipRequest) =>
    api.post(`/memberships/${id}/renew`, data),
  deleteMembership: (id: string | number) => api.delete(`/memberships/${id}`),

  getHistoryPagos: () => api.get("/payments"),
  // Asistente Ia
  sendMessageIA: (preguntaUsuario: string) => api.post("/analizar", { preguntaUsuario }),

  createFastos: (data: Gastos) => api.post("/gastos", data),
  getGastos: () => api.get("/gastos"),
  updateGastos: (id: string | number, data: Gastos) => api.put(`/gastos/${id}`, data),
  deleteGastos: (id: string | number) => api.delete(`/gastos/${id}`),

  getAlertClient: () => api.get("/clients/alert"),

  getSubscription: () => api.get("/subscriptions"),

  getMetricsPayments: () => api.get("/metrics/payments"),
  getMetricsClients: () => api.get("/metrics/new-clients"),
  getMetricsFinanzas: (startDate?: string, endDate?: string) =>
    api.get("/metrics/finanzas", { params: { startDate, endDate } }),

  getConfigBots: () => api.get<{ bots: BotConfig[] }>("/bot-config"),
  createConfigBots: (data: BotConfig) => api.post(`/bot-config`, data),
  updateConfigBots: (id: string, data: BotConfig) =>
    api.put(`/bot-config/${id}`, data),
  deleteConfigBots: (id: string) => api.delete(`/bot-config/${id}`),

  createExercises: (data: ExerciseBody) => api.post(`/exercises`, data),
  getExercises: () => api.get(`/exercises`),
  updateExercises: (id: string | number, data: ExerciseBody) => api.put(`/exercises/${id}`, data),
  deleteExercises: (id: string | number) => api.delete(`/exercises/${id}`),

  createRoutines: (data: RoutinesBody) => api.post(`/routines`, data),
  getRoutines: () => api.get(`/routines`),
  getRoutineById: (id: string | number) => api.get(`/routines/${id}`),
  updateRoutines: (id: string | number, data: RoutinesBody) => api.put(`/routines/${id}`, data),
  deleteRoutines: (id: string | number) => api.delete(`/routines/${id}`),

  addExercisesToRoutine: (data: addExercisesToRoutine, id: number | string) => api.post(`/routines/${id}/exercises`, data),
  deleteExercisesToRoutine: (id: string | number) => api.delete(`/routines/exercises/${id}`),

  addRoutineCliente: (data: addRoutineCliente) => api.post(`/client-routines`, data),
  getRoutineCliente: (id: string | number) => api.get(`/client-routines/active/${id}`),
  getClientRoutines: (id: string | number) => api.get(`/client-routines/${id}`),
  deactivateRoutineCliente: (id: string | number) => api.put(`/client-routines/${id}/deactivate`),
  deleteRoutineCliente: (id: string | number) => api.delete(`/client-routines/${id}`),

  createUsers: (data: createUsers) => api.post(`/users`, data),
  getUsers: () => api.get(`/users`),
  updateUsers: (id: string | number, data: createUsers) => api.put(`/users/${id}`, data),
  deleteUsers: (id: string | number) => api.delete(`/users/${id}`),

  // Accesos por QR
  generateAccessTicket: () => api.get<{ token: string }>("/access/generate-ticket"),
  verifyQrTicket: (token: string, membershipId: string | number = 0) =>
    api.post(`/memberships/${membershipId}/verify-qr`, { token }),

  logout: () => api.post("/logout"),

  // Configuración de la App
  getAppConfig: () => api.get("/app-config", {
    headers: {
      "x-client-key": INTERNAL_KEY
    }
  }),
};

// API de tasa de cambio
const EXCHANGE_API_URL = `${API_URL}/bcv-rate`;

export const getExchangeRate = async (): Promise<number> => {
  const response = await axios.get(EXCHANGE_API_URL);
  return response.data.rate;
};

export default api;
// Api que me trae la tasa del banco central tambien..
// "https://v6.exchangerate-api.com/v6/50ea4ffb185fccdeffa942a0/latest/USD";
