import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faTag,
  faDollarSign,
  faTimes,
  faLayerGroup,
  faSpinner,
  faPlus, faClock,
} from "@fortawesome/free-solid-svg-icons";
import { apiService, getExchangeRate } from "../services/services";
import type { Plans } from "../services/services";

const PlanTable: React.FC = () => {
  const [plans, setPlans] = useState<Plans[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const fetchPlans = async () => {
    try {
      const response = await apiService.getPlans();
      // La API devuelve { message: "...", plans: [...] }
      // response.data contiene el objeto completo de la API
      const apiResponse = response.data;

      // Extraer el array de planes
      if (
        apiResponse &&
        apiResponse.plans &&
        Array.isArray(apiResponse.plans)
      ) {
        setPlans(apiResponse.plans);
      } else if (Array.isArray(apiResponse)) {
        // Si la respuesta es directamente un array
        setPlans(apiResponse);
      } else {
        console.error("Formato de respuesta inesperado:", apiResponse);
        setPlans([]);
      }
    } catch (error) {
      console.error("Error al obtener planes:", error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    getExchangeRate().then(rate => setExchangeRate(rate)).catch(err => console.error("Error tasa:", err));
  }, []);

  const formatBs = (price: number) => {
    if (!exchangeRate) return '—';
    return `Bs. ${(price * exchangeRate).toFixed(2)}`;
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<Plans>({
    name: "",
    duration_day: 30,
    price: 0,
  });
  const [planUpdate, setPlanUpdate] = useState<Plans | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MySwal = withReactContent(Swal);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.createPlan(newPlan);
      MySwal.fire("¡Éxito!", "Plan creado correctamente.", "success");
      setIsCreateOpen(false);
      setNewPlan({
        name: "",
        duration_day: 30,
        price: 0,
      });
      fetchPlans();
    } catch (error) {
      console.error("Error al crear plan:", error);
      MySwal.fire("Error", "No se pudo crear el plan.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (plan: Plans) => {
    setPlanUpdate({ ...plan });
    setIsEditOpen(true);
  };

  const handleDelete = async (plans: Plans) => {
    MySwal.fire({
      title: "¿Eliminar plan?",
      text: `El plan "${plans.name}" ya no estará disponible para nuevos socios.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: { popup: "rounded-3xl" },
    }).then(async (result) => {
      if (result.isConfirmed && plans.id) {
        try {
          await apiService.deletePlan(plans.id);
          MySwal.fire(
            "¡Eliminado!",
            "El plan ha sido borrado con éxito.",
            "success",
          );
          fetchPlans();
        } catch (error) {
          console.error("Error al eliminar plan:", error);
          MySwal.fire("Error", "No se pudo eliminar el plan.", "error");
        }
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { name, duration_day, price } = planUpdate!;
      if (!planUpdate || !planUpdate.id) return;
      await apiService.updatePlan(planUpdate!.id, {
        name,
        duration_day,
        price,
      });
      MySwal.fire("¡Éxito!", "Plan actualizado correctamente.", "success");
      setIsEditOpen(false);
      fetchPlans();
    } catch (error) {
      console.error("Error al actualizar plan:", error);
      MySwal.fire("Error", "No se pudo actualizar el plan.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-center min-h-[200px]">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-teal-600 text-2xl animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 justify-start">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faLayerGroup} className="text-teal-600" />
          Planes de Suscripción
        </h2>
        
        {exchangeRate && (
        <div className="mt-2 md:mt-0 px-2">
          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold">
            Tasa BCV: {exchangeRate.toFixed(2)} Bs
          </span>
        </div>
      )}
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
        >
          <FontAwesomeIcon icon={faPlus} />
          Nuevo Plan
        </button>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                #
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Detalle del Plan
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Duración
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Precio USD
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Precio Bs
              </th>
              <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Acciones
              </th>
            </tr>
          </thead>
          {plans.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-5 whitespace-nowrap text-center text-gray-400 font-bold text-[15px]"
                >
                  No hay planes de suscripción disponibles.
                </td>
              </tr>
          )}
          {plans.length > 0 && (
            <tbody className="divide-y divide-gray-50">
            {plans.map((plan, index) => (
              <tr
                key={plan.id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-5 whitespace-nowrap text-gray-400 font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="font-bold text-gray-700">{plan.name}</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-xs">
                    {plan.duration_day} días
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs">
                    $ {plan.price}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-xs">
                    {formatBs(plan.price)}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-amber-500 hover:text-amber-600 transition-colors p-2"
                      title="Editar Plan"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="text-rose-500 hover:text-rose-600 transition-colors p-2"
                      title="Eliminar Plan"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          )}
          
        </table>
      </div>

      {/* VISTA MÓVIL (TARJETAS) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {plans.length === 0 && (
          <div className="text-center font-bold text-gray-400 uppercase tracking-wider text-[13px] py-10">
            No hay planes disponibles
          </div>
        )}
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{plan.name}</h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-xs mt-2 inline-block">
                  {plan.duration_day} días
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
                  $ {plan.price}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  {formatBs(plan.price)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-50 mt-2">
               <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-600 font-bold text-xs hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN DE PLAN */}
      {isEditOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-800">Editar Plan</h3>
              <p className="text-sm text-gray-400 font-medium italic">
                Ajusta los costos y beneficios.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    Nombre del Plan
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faTag} className="text-xs" />
                    </span>
                    <input
                      type="text"
                      value={planUpdate?.name || ""}
                      onChange={(e) =>
                        setPlanUpdate((prev) =>
                          prev ? { ...prev, name: e.target.value } : prev,
                        )
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    Precio Mensual ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon
                        icon={faDollarSign}
                        className="text-xs"
                      />
                    </span>
                    <input
                      type="text"
                      value={planUpdate?.price || ""}
                      onChange={(e) =>
                        setPlanUpdate((prev) =>
                          prev
                            ? { ...prev, price: Number(e.target.value) }
                            : prev,
                        )
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-white bg-teal-600 rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all"
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  ) : (
                    "Actualizar Plan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-800">Nuevo Plan</h3>
              <p className="text-sm text-gray-400 font-medium italic">
                Crea un nuevo plan de suscripción.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleCreatePlan}>
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    Nombre del Plan
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faTag} className="text-xs" />
                    </span>
                    <input
                      type="text"
                      value={newPlan.name}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, name: e.target.value })
                      }
                      placeholder="Ej: Mensualidad con entrenador"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    Duración (días)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faClock} className="text-xs" />
                    </span>
                    <input
                      type="number"
                      value={newPlan.duration_day || ""}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          duration_day: Number(e.target.value),
                        })
                      }
                      placeholder="30"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    Precio ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon
                        icon={faDollarSign}
                        className="text-xs"
                      />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={newPlan.price || ""}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          price: Number(e.target.value),
                        })
                      }
                      placeholder="25.00"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-white bg-teal-600 rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  ) : (
                    "Crear Plan"
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

export default PlanTable;
