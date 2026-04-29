import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faLayerGroup, faTrash, faEdit, faArrowRight, faSpinner, faTimes, faDumbbell } from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import type { RoutinesBody } from "../services/services";
import { notify, useConfirm } from "../utils/toast";
import { useNavigate } from "react-router-dom";

interface Routine extends RoutinesBody {
  id: number;
}

export default function Routines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [formData, setFormData] = useState<RoutinesBody>({
    name: "",
    description: "",
  });
  const navigate = useNavigate();
  const confirm = useConfirm();

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const response = await apiService.getRoutines();
      setRoutines(response.data.routines || []);
    } catch (error) {
      notify.error("Error al cargar rutinas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingRoutine) {
        await apiService.updateRoutines(editingRoutine.id, formData);
        notify.success("Rutina actualizada");
      } else {
        await apiService.createRoutines(formData);
        notify.success("Rutina creada");
      }
      setShowModal(false);
      setEditingRoutine(null);
      setFormData({ name: "", description: "" });
      fetchRoutines();
    } catch (error) {
      notify.error("Error al guardar rutina");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await confirm(
      "¿Eliminar rutina?",
      "¿Estás seguro de que deseas eliminar esta rutina? Esto no borrará los ejercicios de la biblioteca.",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await apiService.deleteRoutines(id);
        notify.success("Rutina eliminada");
        fetchRoutines();
      } catch (error) {
        notify.error("Error al eliminar rutina");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Gestión de Rutinas</h1>
        </div>
        <button
          onClick={() => {
            setEditingRoutine(null);
            setFormData({ name: "", description: "" });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-95 group shrink-0"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Nueva Rutina</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FontAwesomeIcon icon={faSpinner} className="text-teal-600 text-4xl animate-spin" />
          <p className="text-gray-400 font-bold animate-pulse">Cargando rutinas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {routines.map((routine) => (
            <div key={routine.id} className="bg-white rounded-3xl border border-gray-50 shadow-sm transition-all overflow-hidden flex flex-col group relative">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-orange-50 size-11 rounded-xl flex items-center justify-center text-orange-600 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-gray-800 group-hover:text-teal-600 transition-colors">
                      {routine.name}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed font-medium line-clamp-2 bg-gray-50/50 p-3 rounded-xl italic">
                  {routine.description || "Sin descripción proporcionada."}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-50 flex items-center justify-between">
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      setEditingRoutine(routine);
                      setFormData({ name: routine.name, description: routine.description });
                      setShowModal(true);
                    }}
                    className="size-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                  </button>
                  <button 
                    onClick={() => handleDelete(routine.id)}
                    className="size-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                </div>
                <button 
                  onClick={() => navigate(`/home/routines/${routine.id}`)}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-teal-600 font-black text-[10px] uppercase tracking-wider hover:bg-teal-600 hover:text-white transition-all shadow-sm group/btn"
                >
                  Gestionar
                  <FontAwesomeIcon icon={faArrowRight} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
          {routines.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center space-y-4">
               <div className="bg-white p-5 rounded-full shadow-sm text-gray-300">
                 <FontAwesomeIcon icon={faLayerGroup} size="3x" />
              </div>
              <p className="text-gray-400 font-bold text-lg">No hay rutinas creadas todavía.</p>
              <button 
                onClick={() => setShowModal(true)} 
                className="bg-teal-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
              >
                Crear Mi Primera Rutina
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="p-8 border-b border-gray-50">
              <h2 className="text-2xl font-black text-gray-800">
                {editingRoutine ? "Editar Rutina" : "Nueva Rutina"}
              </h2>
              <p className="text-gray-400 font-medium text-sm">Define el nombre y propósito de la rutina.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-4">Nombre de la Rutina</label>
                <div className="relative">
                   <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                  </span>
                  <input
                    required
                    type="text"
                    className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                    placeholder="Ej: Full Body - Lunes"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-4">Descripción</label>
                <div className="relative">
                   <span className="absolute top-4 left-4 text-gray-300">
                    <FontAwesomeIcon icon={faDumbbell} className="text-xs" />
                  </span>
                  <textarea
                    className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                    placeholder="Describe el enfoque de esta rutina..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all border border-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-4 rounded-2xl bg-teal-600 text-white text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : (editingRoutine ? "Actualizar" : "Crear Rutina")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
