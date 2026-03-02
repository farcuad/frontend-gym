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

  //Estado para calcular valor del mes
  const [stats, setStats] = useState({ totalMonth: 0, newClientsThisMonth: 0, payDiff: 0, cliDiff: 0 });

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
        const now = new Date();
      const currentMonthStr = now.toISOString().slice(0, 7); // "2026-03"
      
      const lastMonthDate = new Date(now.getFullYear(), now.getUTCMonth() - 1, 1);
      const lastMonthStr = lastMonthDate.toISOString().slice(0, 7); // "2026-02"

      // Buscamos los datos de ambos meses
      const currPay = paymentsArray.find((m: any) => m.month === currentMonthStr);
      const prevPay = paymentsArray.find((m: any) => m.month === lastMonthStr);
      
      const currCli = clientsArray.find((m: any) => m.month === currentMonthStr);
      const prevCli = clientsArray.find((m: any) => m.month === lastMonthStr);

      // Calculamos la diferencia de ingresos
      const payDiff = (currPay?.total_usd || 0) - (prevPay?.total_usd || 0);
      
      // Calculamos la diferencia de clientes
      const cliDiff = (currCli?.total_clients || 0) - (prevCli?.total_clients || 0);

      setStats({
        totalMonth: currPay ? parseFloat(currPay.total_usd) : 0,
        newClientsThisMonth: currCli ? currCli.total_clients : 0,
        payDiff,
        cliDiff
      });
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
      {/* --- NUEVAS CARDS DE RESUMEN --- */}
      <div className="grid grid-cols-2 gap-4 lg:gap-6">
        {/* Card Recaudación */}
        <div className="bg-blue-600 p-5 rounded-3xl shadow-sm shadow-blue-100 flex flex-col justify-between text-white min-h-[140px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-100 text-xs font-black uppercase tracking-widest">Recaudación</span>
            <div className="bg-blue-500/30 p-2 rounded-xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-2xl lg:text-3xl font-black">${stats.totalMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${stats.payDiff >= 0 ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                  {stats.payDiff >= 0 ? '↑' : '↓'} ${Math.abs(stats.payDiff).toFixed(0)}
                </span>
                <span className="text-blue-100 text-[11px] font-medium">vs. mes pasado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Clientes */}
        <div className="bg-emerald-500 p-5 rounded-3xl shadow-sm shadow-emerald-100 flex flex-col justify-between text-white min-h-[140px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-emerald-50 text-xs font-black uppercase tracking-widest">Clientes</span>
            <div className="bg-emerald-400/30 p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.732 4c-.76-1.01-1.93-2-3.732-2s-2.972.99-3.732 2m9.464 0a4.354 4.354 0 010 5.292" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-2xl lg:text-3xl font-black">{stats.newClientsThisMonth}</h3>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${stats.cliDiff >= 0 ? 'bg-emerald-300/40 text-emerald-50' : 'bg-red-400/40 text-red-50'}`}>
                  {stats.cliDiff >= 0 ? '+' : ''}{stats.cliDiff}
                </span>
                <span className="text-emerald-50 text-[11px] font-medium">vs. mes pasado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ------------------------------- */}

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
