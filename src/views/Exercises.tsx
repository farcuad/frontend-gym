import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faDumbbell, faTrash, faEdit, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import type { ExerciseBody } from "../services/services";
import { notify, useConfirm } from "../utils/toast";

interface Exercise extends ExerciseBody {
  id: number;
}

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<ExerciseBody>({
    name: "",
    muscle_group: "",
  });
  const confirm = useConfirm();

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await apiService.getExercises();
      setExercises(response.data.exercises || []);
    } catch (error) {
      notify.error("Error al cargar ejercicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingExercise) {
        await apiService.updateExercises(editingExercise.id, formData);
        notify.success("Ejercicio actualizado");
      } else {
        await apiService.createExercises(formData);
        notify.success("Ejercicio creado");
      }
      setShowModal(false);
      setEditingExercise(null);
      setFormData({ name: "", muscle_group: "" });
      fetchExercises();
    } catch (error) {
      notify.error("Error al guardar ejercicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await confirm(
      "¿Eliminar ejercicio?",
      "¿Estás seguro de que deseas eliminar este ejercicio de la biblioteca?",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await apiService.deleteExercises(id);
        notify.success("Ejercicio eliminado");
        fetchExercises();
      } catch (error) {
        notify.error("Error al eliminar ejercicio");
      }
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ex.muscle_group?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <h1 className="text-xl font-black text-gray-800 tracking-tight shrink-0">Biblioteca de Ejercicios</h1>          
        </div>
        <div className="relative group flex-1 max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <FontAwesomeIcon icon={faSearch} className="text-xs" />
            </div>
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-gray-700 text-sm placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        <button
          onClick={() => {
            setEditingExercise(null);
            setFormData({ name: "", muscle_group: "" });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-95 group shrink-0"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Nuevo Ejercicio</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <FontAwesomeIcon icon={faSpinner} className="text-teal-600 text-4xl animate-spin" />
          <p className="text-gray-400 font-bold animate-pulse">Cargando datos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExercises.map((ex) => (
            <div key={ex.id} className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-teal-50 size-11 rounded-xl flex items-center justify-center text-teal-600 shadow-inner">
                    <FontAwesomeIcon icon={faDumbbell} className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-gray-800 line-clamp-1">{ex.name}</h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {ex.muscle_group || "General"}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      setEditingExercise(ex);
                      setFormData({ name: ex.name, muscle_group: ex.muscle_group });
                      setShowModal(true);
                    }}
                    className="size-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                  </button>
                  <button 
                    onClick={() => handleDelete(ex.id)}
                    className="size-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredExercises.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center space-y-4">
              <div className="bg-white p-4 rounded-full shadow-sm text-gray-300">
                 <FontAwesomeIcon icon={faDumbbell} size="2x" />
              </div>
              <p className="text-gray-400 font-bold">No se encontraron ejercicios.</p>
              <button onClick={() => setSearchTerm("")} className="text-teal-600 font-black text-sm hover:underline">Limpiar búsqueda</button>
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
                {editingExercise ? "Editar Ejercicio" : "Nuevo Ejercicio"}
              </h2>
              <p className="text-gray-400 font-medium text-sm">Completa la información del ejercicio.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-4">Nombre del Ejercicio</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faDumbbell} className="text-xs" />
                  </span>
                  <input
                    required
                    type="text"
                    className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700"
                    placeholder="Ej: Press de Banca"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-4">Grupo Muscular</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  </span>
                  <input
                    type="text"
                    className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700"
                    placeholder="Ej: Pecho, Espalda, Piernas"
                    value={formData.muscle_group || ""}
                    onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-4 rounded-2xl bg-teal-600 text-white text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : (editingExercise ? "Actualizar" : "Crear Ejercicio")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
