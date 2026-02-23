import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { apiService } from "../services/services";

type PaymentMetric = {
  month: string;
  total_usd: number;
};

type ClientMetric = {
  month: string;
  total_clients: number;
};

const formatMonth = (month: string) => {
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return date.toLocaleString("es-ES", { month: "short" }).replace(".", "");
};

const Metrics = () => {
  const [payments, setPayments] = useState<PaymentMetric[]>([]);
  const [newClients, setNewClients] = useState<ClientMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, clientRes] = await Promise.all([
          apiService.getMetricsPayments(),
          apiService.getMetricsClients(),
        ]);
        
        // Extraer arrays de forma robusta
        const paymentsArray = payRes.data.metrics ?? [];
          
        const clientsArray = clientRes.data.metrics ?? [];

        setPayments(paymentsArray);
        setNewClients(clientsArray);
      } catch (error) {
        console.error("Error al cargar métricas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 font-medium">
        Cargando estadísticas...
      </div>
    );
  }

  const paymentsData = payments.map((item) => ({
    month: formatMonth(item.month),
    total: item.total_usd,
  }));

  const clientsData = newClients.map((item) => ({
    month: formatMonth(item.month),
    total: item.total_clients,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="pl-3">
          <h1 className="text-2xl font-black text-gray-800">Métricas del Gimnasio</h1>
          <p className="text-sm text-gray-500">Visualiza el crecimiento y rendimiento de tu negocio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* 📈 Tendencia de Ventas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-sky-500" />
              Historial de Pagos en USD
            </h2>
          </div>
          <div className="p-3 md:p-6">
            <div className="h-[300px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paymentsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    interval={0}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Cifra (USD)"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 📊 Nuevos Clientes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-emerald-500" />
              Historial de nuevos Clientes Agregados
            </h2>
          </div>
          <div className="p-3 md:p-6">
            <div className="h-[300px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    interval={0}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Bar
                    dataKey="total"
                    name="Nuevos Clientes"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    barSize={window.innerWidth < 640 ? 25 : 40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
