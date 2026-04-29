import axios, { AxiosError } from "axios";
import { notify } from "../utils/toast";

const API_URL = "https://u2.rsgve.com/gym-api/api";

export interface Clients {
  id?: number;
  name: string;
  cedula: string;
  phone: string;
  fecha_ingreso: string;
  activo: boolean;
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

// 1. Crear instancia de Axios con la URL base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 2. Interceptor para inyectar el Token automáticamente y validar Plan
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Restricción para Plan Básico en Chat AI -> ELIMINADO (Se maneja por Contexto)

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem("token");
      localStorage.removeItem("plan_type");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    const currentPath = window.location.pathname;
    if (error.response?.status === 403) {
      const data = error.response?.data;
      const code = data?.code;
      if (
        code === "SUBSCRIPTION_EXPIRED" ||
        data?.error === "Acceso denegado"
      ) {
        notify.warning(data.message || "Suscripción vencida");
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
  sendMessageIA: (preguntaUsuario: string) =>
    api.post("/analizar", { preguntaUsuario }),

  getAlertClient: () => api.get("/clients/alert"),

  getSubscription: () => api.get("/subscriptions"),

  getMetricsPayments: () => api.get("/metrics/payments"),
  getMetricsClients: () => api.get("/metrics/new-clients"),

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
};

// API de tasa de cambio
const EXCHANGE_API_URL = "https://u2.rsgve.com/gym-api/api/bcv-rate";

export const getExchangeRate = async (): Promise<number> => {
  const response = await axios.get(EXCHANGE_API_URL);
  return response.data.rate;
};

export default api;
// Api que me trae la tasa del banco central tambien..
// "https://v6.exchangerate-api.com/v6/50ea4ffb185fccdeffa942a0/latest/USD";
