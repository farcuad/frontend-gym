import axios from "axios";

const API_URL = "https://u2.rsgve.com/gym-api/api";

export interface Clients {
  id?: number;
  name: string;
  cedula: string;
  phone: string;
  fecha_ingreso: string;
  activo: boolean;
}

export interface Plans {
  id?: number;
  name: string;
  duration_day: number;
  price: number;
}

export interface Memberships {
  id: number;
  plan_id: number
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



// 1. Crear instancia de Axios con la URL base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// 2. Interceptor para inyectar el Token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Usamos el estándar Bearer Token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Definición de las rutas del sistema
export const apiService = {
  // Clientes
  getClients: () => api.get("/clients"),
  createClient: (data: Clients) => api.post("/clients", data),
  updateClient: (id: string | number, data: Clients) => api.put(`/clients/${id}`, data),
  deleteClient: (id: string | number) => api.delete(`/clients/${id}`),

  // Planes
  getPlans: () => api.get("/plans"),
  createPlan: (data: Plans) => api.post("/plans", data),
  updatePlan: (id: string | number, data: Plans) => api.put(`/plans/${id}`, data),
  deletePlan: (id: string | number) => api.delete(`/plans/${id}`),

  // Membresias
  getMemberships: () => api.get("/memberships"),
  createMembership: (data: newMembership) => api.post("/memberships", data),
  renewMembership: (id: number) => api.post(`/memberships/${id}/renew`),
  deleteMembership: (id: string | number) => api.delete(`/memberships/${id}`),

  getHistoryPagos: () => api.get("/payments"),
  // Asistente Ia
  sendMessageIA: (preguntaUsuario: string) => api.post("/analizar", { preguntaUsuario }),

  getAlertClient: () => api.get("/clients/alert"),
};

// API de tasa de cambio
const EXCHANGE_API_URL = "https://v6.exchangerate-api.com/v6/4c57d800c11ecff8f364f3e1/latest/USD";

export const getExchangeRate = async (): Promise<number> => {
  const response = await axios.get(EXCHANGE_API_URL);
  return response.data.conversion_rates.VES;
};

export default api;
