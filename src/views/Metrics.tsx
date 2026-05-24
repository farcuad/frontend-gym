import { useState, useEffect, useMemo } from "react";
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
import type { CategoriaGasto, Gastos } from "../services/services";
import { SelectField } from "../components/SelectField";
import { notify, useConfirm } from "../utils/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faSpinner } from "@fortawesome/free-solid-svg-icons";

type PaymentMetric = {
  month: string;
  total_usd: number;
};

type ClientMetric = {
  month: string;
  total_clients: number;
};

type CategoriaItem = {
  categoria: CategoriaGasto;
  total: number;
};

type FinanzasMetric = {
  filtros: { anio: number; mes: number };
  balance: {
    total_ingresos: number;
    total_gastos: number;
    balance_neto: number;
  };
  porCategoria: CategoriaItem[];
};

// Paleta de colores por categoría
const CATEGORIA_COLORS: Record<string, { label: string; hex: string; bg: string; text: string }> = {
  maquinaria: { label: "Maquinaria", hex: "#f59e0b", bg: "bg-amber-100", text: "text-amber-600" },
  mantenimiento: { label: "Mantenimiento", hex: "#0ea5e9", bg: "bg-sky-100", text: "text-sky-600" },
  servicios: { label: "Servicios", hex: "#8b5cf6", bg: "bg-violet-100", text: "text-violet-600" },
  insumos: { label: "Insumos", hex: "#a855f7", bg: "bg-purple-100", text: "text-purple-600" },
  nomina: { label: "Nómina", hex: "#10b981", bg: "bg-emerald-100", text: "text-emerald-600" },
  marketing: { label: "Marketing", hex: "#ec4899", bg: "bg-pink-100", text: "text-pink-600" },
  alquiler: { label: "Alquiler", hex: "#f43f5e", bg: "bg-rose-100", text: "text-rose-600" },
  otros: { label: "Otros", hex: "#94a3b8", bg: "bg-slate-100", text: "text-slate-500" },
};

const getCategoriaColor = (cat: string) =>
  CATEGORIA_COLORS[cat.toLowerCase()] ?? CATEGORIA_COLORS["otros"];

const formatMonth = (month: string) => {
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return date.toLocaleString("es-ES", { month: "short" }).replace(".", "");
};

const CATEGORIAS_OPTIONS = [
  { id: 1, name: "Maquinaria" },
  { id: 2, name: "Mantenimiento" },
  { id: 3, name: "Servicios" },
  { id: 4, name: "Insumos" },
  { id: 5, name: "Nómina" },
  { id: 6, name: "Marketing" },
  { id: 7, name: "Alquiler" },
  { id: 8, name: "Otros" },
];

const getCategoryStringFromId = (id: number): CategoriaGasto => {
  switch (id) {
    case 1: return "maquinaria";
    case 2: return "mantenimiento";
    case 3: return "servicios";
    case 4: return "insumos";
    case 5: return "nomina";
    case 6: return "marketing";
    case 7: return "alquiler";
    default: return "otros";
  }
};

const getCategoryIdFromString = (cat: CategoriaGasto): number => {
  switch (cat) {
    case "maquinaria": return 1;
    case "mantenimiento": return 2;
    case "servicios": return 3;
    case "insumos": return 4;
    case "nomina": return 5;
    case "marketing": return 6;
    case "alquiler": return 7;
    case "otros": return 8;
    default: return 8;
  }
};

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatFecha = (dateString: string) => {
  if (!dateString) return "----";
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

const Metrics = () => {
  const [payments, setPayments] = useState<PaymentMetric[]>([]);
  const [newClients, setNewClients] = useState<ClientMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [finanzas, setFinanzas] = useState<FinanzasMetric | null>(null);
  const [activeTab, setActiveTab] = useState<'graficos' | 'tabla'>('graficos');
  const [modalOpen, setModalOpen] = useState(false);

  // Gastos list
  const [gastos, setGastos] = useState<Gastos[]>([]);
  const [editingGasto, setEditingGasto] = useState<Gastos | null>(null);

  // Form states
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [categoriaId, setCategoriaId] = useState(0);
  const [fechaGasto, setFechaGasto] = useState(getTodayString());

  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirm = useConfirm();

  // Estado para calcular valor del mes
  const [stats, setStats] = useState({
    totalMonth: 0,
    newClientsThisMonth: 0,
    payPercent: 0,
    cliPercent: 0,
  });

  const fetchData = async () => {
    try {
      const [payRes, clientRes, finRes, gastosRes] = await Promise.all([
        apiService.getMetricsPayments(),
        apiService.getMetricsClients(),
        apiService.getMetricsFinanzas(),
        apiService.getGastos(),
      ]);

      const paymentsArray = payRes.data.metrics ?? [];
      const clientsArray = clientRes.data.metrics ?? [];

      setPayments(paymentsArray);
      setNewClients(clientsArray);

      // Finanzas
      const finData: FinanzasMetric = finRes.data.data;
      setFinanzas(finData);

      // Gastos list
      const resData = gastosRes.data.result;
      setGastos(resData);

      const now = new Date();
      const currentMonthStr = now.toISOString().slice(0, 7);
      const lastMonthDate = new Date(now.getFullYear(), now.getUTCMonth() - 1, 1);
      const lastMonthStr = lastMonthDate.toISOString().slice(0, 7);

      const currPay = paymentsArray.find((m: any) => m.month === currentMonthStr);
      const prevPay = paymentsArray.find((m: any) => m.month === lastMonthStr);
      const currCli = clientsArray.find((m: any) => m.month === currentMonthStr);
      const prevCli = clientsArray.find((m: any) => m.month === lastMonthStr);

      const calculatePercentage = (current: number, previous: number) => {
        if (!previous || previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      setStats({
        totalMonth: currPay ? parseFloat(currPay.total_usd) : 0,
        newClientsThisMonth: currCli ? currCli.total_clients : 0,
        payPercent: calculatePercentage(
          currPay ? parseFloat(currPay.total_usd) : 0,
          prevPay ? parseFloat(prevPay.total_usd) : 0
        ),
        cliPercent: calculatePercentage(
          currCli ? currCli.total_clients : 0,
          prevCli ? prevCli.total_clients : 0
        ),
      });
    } catch (error) {
      console.error("Error al cargar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewModal = () => {
    setEditingGasto(null);
    setTitulo("");
    setDescripcion("");
    setMonto("");
    setCategoriaId(8); // Default to ID 8 ("Otros")
    setFechaGasto(getTodayString());
    setModalOpen(true);
  };

  const openEditModal = (gasto: Gastos) => {
    setEditingGasto(gasto);
    setTitulo(gasto.titulo);
    setDescripcion(gasto.descripcion || "");
    setMonto(gasto.monto.toString());
    setCategoriaId(getCategoryIdFromString(gasto.categoria));
    setFechaGasto(getTodayString()); // always place today's date automatically
    setModalOpen(true);
  };

  const handleDeleteGasto = async (id: number) => {
    const result = await confirm(
      "¿Eliminar Gasto?",
      "Se eliminará permanentemente éste registro de gasto.",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await apiService.deleteGastos(id);
        notify.success("Gasto eliminado correctamente.");
        fetchData();
      } catch (error) {
        console.error("Error al eliminar gasto:", error);
        notify.error("No se pudo eliminar el gasto.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      notify.warning("Por favor ingresa un concepto/título.");
      return;
    }
    if (!monto || parseFloat(monto) <= 0) {
      notify.warning("Por favor ingresa un monto válido.");
      return;
    }
    if (categoriaId === 0) {
      notify.warning("Por favor selecciona una categoría.");
      return;
    }

    const gastoData: Gastos = {
      id: editingGasto?.id || 0,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      monto: parseFloat(monto),
      categoria: getCategoryStringFromId(categoriaId),
      fecha_gasto: fechaGasto,
    };

    setIsSubmitting(true);
    try {
      if (editingGasto && editingGasto.id) {
        await apiService.updateGastos(editingGasto.id, gastoData);
        notify.success("Gastos actualizado correctamente.");
      } else {
        await apiService.createFastos(gastoData);
        notify.success("Gastos registrado correctamente.");
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al guardar gasto:", error);
      notify.error("No se pudo guardar el gasto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculos para el gráfico de dona
  const donutSegments = useMemo(() => {
    if (!finanzas?.porCategoria?.length) return [];
    const total = finanzas.porCategoria.reduce((acc, c) => acc + c.total, 0) || 1;
    let accumulated = 0;
    return finanzas.porCategoria.map((c) => {
      const pct = (c.total / total) * 100;
      const offset = -accumulated;
      accumulated += pct;
      const meta = getCategoriaColor(c.categoria);
      return { ...c, pct, offset, ...meta };
    });
  }, [finanzas]);

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
      {/* Título */}
      <div className="pl-1">
        <h1 className="text-2xl font-black text-gray-800">Métricas del Gimnasio</h1>
        <p className="text-sm text-gray-500">Visualiza el crecimiento y rendimiento de tu negocio.</p>
      </div>

      {/* ============================= */}
      {/* FILA DE 4 CARDS KPI           */}
      {/* ============================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Recaudación */}
        <div className="bg-blue-600 p-5 rounded-3xl shadow-md shadow-blue-200 flex flex-col justify-between text-white min-h-[140px] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-28 h-28">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-100 text-[10px] font-black tracking-widest uppercase">Recaudación</span>
            <div className="bg-white/15 p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-3xl font-black tracking-tight mt-2">
              ${stats.totalMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${stats.payPercent >= 0 ? 'bg-white/20' : 'bg-red-400/40'}`}>
                {stats.payPercent >= 0 ? '↑' : '↓'} {Math.abs(stats.payPercent).toFixed(1)}%
              </span>
              <p className="text-blue-100/70 text-[10px] font-bold uppercase tracking-wider">
                {stats.payPercent >= 0 ? 'en ganancias' : 'de caída'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Gastos Registrados */}
        <div className="bg-linear-to-br from-rose-500 to-rose-600 p-5 rounded-3xl shadow-md shadow-rose-200 flex flex-col justify-between text-white min-h-[140px] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-28 h-28">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-rose-100 text-[10px] font-black tracking-widest uppercase">Gastos Registrados</span>
            <div className="bg-white/15 p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.761 2.87M21 21H3" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-3xl font-black tracking-tight mt-2">
              ${finanzas?.balance.total_gastos.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="bg-white/20 text-[11px] px-2 py-0.5 rounded-md font-bold">
                {finanzas?.porCategoria.length ?? 0} Rubros
              </span>
              <p className="text-rose-100/70 text-[10px] font-bold uppercase tracking-wider">En este período</p>
            </div>
          </div>
        </div>

        {/* Card 3: Balance Neto */}
        <div className={`p-5 rounded-3xl shadow-md flex flex-col justify-between text-white min-h-[140px] relative overflow-hidden group transition-colors duration-300 ${finanzas && finanzas.balance.balance_neto >= 0
          ? 'bg-linear-to-br from-emerald-500 to-emerald-600 shadow-emerald-200'
          : 'bg-linear-to-br from-red-500 to-red-600 shadow-red-200'
          }`}>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-28 h-28">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-[10px] font-black tracking-widest uppercase">Balance Neto</span>
            <div className="bg-white/15 p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-3xl font-black tracking-tight mt-2">
              ${finanzas?.balance.balance_neto.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="bg-white/20 text-[11px] px-2 py-0.5 rounded-md font-bold">
                {finanzas && finanzas.balance.balance_neto >= 0 ? 'Rentabilidad verde' : 'Déficit temporal'}
              </span>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                {finanzas && finanzas.balance.balance_neto >= 0 ? 'Negocio estable' : 'Requiere revisión'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Nuevos Clientes */}
        <div className="bg-emerald-500 p-5 rounded-3xl shadow-md shadow-emerald-200 flex flex-col justify-between text-white min-h-[140px] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-28 h-28">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 18a11.374 11.374 0 0 1-9.333-2.978c-.112-.207-.156-.452-.156-.692V14.5a4.125 4.125 0 0 1 7.533-2.493M15 19.128v-.003c1.11 0 2.158-.285 3.07-.786M14.214 11.25a3.91 3.91 0 0 0 1.536-3.05 3.91 3.91 0 0 0-1.536-3.05M6.75 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
            </svg>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-50 text-[10px] font-black tracking-widest uppercase">Nuevos Clientes</span>
            <div className="bg-white/15 p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-3xl font-black tracking-tight mt-2">
              {stats.newClientsThisMonth}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${stats.cliPercent >= 0 ? 'bg-white/20' : 'bg-red-400/40'}`}>
                {stats.cliPercent >= 0 ? '↑' : '↓'} {Math.abs(stats.cliPercent).toFixed(1)}%
              </span>
              <p className="text-emerald-100/70 text-[10px] font-bold uppercase tracking-wider">En clientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* ÁREA CENTRAL: TABS + GRÁFICOS */}
      {/* ============================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">

        {/* Columna Izquierda — Tabs, Gráficas o Tabla */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          {/* Header: Tabs + Botón Registrar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('graficos')}
                className={`pb-2 text-sm font-bold tracking-tight border-b-2 transition-all ${activeTab === 'graficos'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                Gráficas de Tendencia
              </button>
              <button
                onClick={() => setActiveTab('tabla')}
                className={`pb-2 text-sm font-bold tracking-tight border-b-2 transition-all flex items-center gap-2 ${activeTab === 'tabla'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                Administrar Gastos
                <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {gastos.length}
                </span>
              </button>
            </div>
            <button
              onClick={openNewModal}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg> Registrar Gasto
            </button>
          </div>

          {/* Pestaña: Gráficas */}
          {activeTab === 'graficos' && (
            <div className="space-y-8">
              {/* AreaChart — Pagos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full bg-sky-500" />
                    Historial de Pagos en USD (Ingresos)
                  </h2>
                  <span className="text-xs font-bold text-sky-500">Año 2026</span>
                </div>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={paymentsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} interval={0} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                      <Area type="monotone" dataKey="total" name="Cifra (USD)" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* BarChart — Clientes */}
              <div className="pt-6 border-t border-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full bg-emerald-500" />
                    Historial de Nuevos Clientes
                  </h2>
                  <span className="text-xs font-bold text-emerald-500">Año 2026</span>
                </div>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} interval={0} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                      <Bar dataKey="total" name="Nuevos Clientes" fill="#10b981" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 640 ? 25 : 40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña: Administrar Gastos */}
          {activeTab === 'tabla' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
                <h4 className="font-black text-gray-800 text-base">Registro Detallado de Gastos</h4>
                <span className="text-xs text-gray-400">
                  Mostrando {gastos.length} transacciones registradas
                </span>
              </div>

              {gastos.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-300 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <p className="font-semibold">No hay gastos registrados en este período.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-gray-400">
                        <th className="py-3 px-4">Concepto / Gasto</th>
                        <th className="py-3 px-4">Categoría</th>
                        <th className="py-3 px-4">Monto</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {gastos.map((item) => {
                        const meta = getCategoriaColor(item.categoria);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-gray-800">
                              <div className="flex flex-col">
                                <span>{item.titulo}</span>
                                {item.descripcion && (
                                  <span className="text-xs text-gray-400 font-normal">{item.descripcion}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.text}`}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-black text-gray-900">
                              ${item.monto}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-bold text-gray-500">
                              {formatFecha(item.fecha_gasto)}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Editar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => item.id && handleDeleteGasto(Number(item.id))}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Eliminar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha — Dona */}
        <div className="lg:col-span-4 space-y-6">

          {/* Distribución de Gastos */}
          {finanzas && donutSegments.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-black text-gray-800 mb-1">Distribución de Gastos</h3>
              <p className="text-xs text-gray-400 mb-6">Porcentaje asignado por cada rubro</p>

              {/* SVG Donut */}
              <div className="relative w-52 h-52 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.categoria}
                      cx="50" cy="50" r="40"
                      fill="transparent"
                      stroke={seg.hex}
                      strokeWidth="12"
                      strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                      strokeDashoffset={seg.offset}
                      pathLength="100"
                      className="transition-all duration-500 cursor-pointer"
                    />
                  ))}
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[9px] font-black tracking-widest uppercase text-gray-400">Gastos</span>
                  <span className="text-xl font-black text-gray-800 mt-0.5">
                    ${finanzas.balance.total_gastos.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Lista */}
              <div className="space-y-2.5">
                {donutSegments.map((seg) => (
                  <div key={seg.categoria} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.hex }} />
                      <span className="font-semibold text-gray-700">{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-medium">{seg.pct.toFixed(1)}%</span>
                      <span className="font-black text-gray-800">${seg.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Registrar/Editar Gasto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800">
                {editingGasto ? "Actualizar Gasto" : "Registrar Nuevo Gasto"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Concepto / Título */}
              <div className="relative group">
                <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">Concepto / Título</label>
                <div className="relative">
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Pago de alquiler del local"
                    required
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="relative group">
                <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">Descripción</label>
                <div className="relative">
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Detalles adicionales del gasto..."
                    rows={3}
                    className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs resize-none"
                  />
                </div>
              </div>

              {/* Monto */}
              <div className="relative group">
                <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">Monto (USD)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-5 flex items-center text-gray-400 font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full pl-9 pr-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                  />
                </div>
              </div>

              {/* Categoría (utilizando SelectField) */}
              <SelectField
                label="Categoría"
                options={CATEGORIAS_OPTIONS}
                value={categoriaId}
                onChange={(val) => setCategoriaId(val)}
                icon={faFolder}
                placeholder="Selecciona una categoría"
              />

              {/* Fecha de Gasto */}
              <div className="relative group">
                <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">Fecha de Gasto</label>
                <div className="relative">
                  <input
                    type="date"
                    value={fechaGasto}
                    onChange={(e) => setFechaGasto(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                  />
                </div>
              </div>

              {/* Acciones del formulario */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Metrics;

