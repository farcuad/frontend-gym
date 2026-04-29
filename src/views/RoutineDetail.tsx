import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faTrash, faDumbbell, faCalendarDay, faClock, faSortAmountUp, faLayerGroup, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import { notify, useConfirm } from "../utils/toast";
import { SelectField } from "../components/SelectField";

interface RoutineDetailData {
  id: number;
  name: string;
  description: string;
  exercises: any[];
}

export default function RoutineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [routine, setRoutine] = useState<RoutineDetailData | null>(null);
  const [exercisesLibrary, setExercisesLibrary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newExerciseData, setNewExerciseData] = useState({
    exercise_id: 0,
    sets: 3,
    reps: "12",
    day_of_week: 1,
    rest_time_seconds: 60,
    sort_order: 1
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routineRes, exercisesRes] = await Promise.all([
        apiService.getRoutineById(id!),
        apiService.getExercises()
      ]);

      const routineData = routineRes.data.routine || routineRes.data;
      const exercisesList = exercisesRes.data.exercises || [];

      setRoutine(routineData);
      setExercisesLibrary(exercisesList);
    } catch (error) {
      console.error("Error fetching routine detail:", error);
      notify.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseData.exercise_id) return notify.error("Selecciona un ejercicio");
    
    setIsSubmitting(true);
    try {
      await apiService.addExercisesToRoutine(newExerciseData as any, id!);
      notify.success("Ejercicio añadido a la rutina");
      setShowAddModal(false);
      setNewExerciseData({
        exercise_id: 0,
        sets: 3,
        reps: "12",
        day_of_week: 1,
        rest_time_seconds: 60,
        sort_order: 1
      });
      fetchData();
    } catch (error) {
      notify.error("Error al añadir ejercicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayName = (day: number) => {
    const days = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return days[day] || "N/A";
  };

  const handleRemoveExercise = async (assignmentId: number) => {
    const result = await confirm(
      "¿Quitar este ejercicio?",
      "¿Estás seguro de que deseas eliminar este ejercicio de la rutina?",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await apiService.deleteExercisesToRoutine(assignmentId);
        notify.success("Ejercicio removido");
        fetchData();
      } catch (error) {
        notify.error("Error al remover ejercicio");
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="text-teal-600 text-4xl animate-spin" />
      </div>
      <p className="text-gray-400 font-bold animate-pulse">Cargando detalles de rutina...</p>
    </div>
  );

  if (!routine) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
       <div className="bg-rose-50 text-rose-500 p-6 rounded-full mb-4">
          <FontAwesomeIcon icon={faTimes} size="2x" />
       </div>
       <h2 className="text-2xl font-black text-gray-800">Rutina no encontrada</h2>
       <button onClick={() => navigate("/home/routines")} className="mt-4 text-teal-600 font-bold hover:underline">Volver a rutinas</button>
    </div>
  );

  const dayOptions = [
    { id: 1, name: "Lunes" },
    { id: 2, name: "Martes" },
    { id: 3, name: "Miércoles" },
    { id: 4, name: "Jueves" },
    { id: 5, name: "Viernes" },
    { id: 6, name: "Sábado" },
    { id: 7, name: "Domingo" }
  ];

  const exerciseOptions = [
    { id: 0, name: "Selecciona un ejercicio" },
    ...exercisesLibrary.map(ex => ({ id: ex.id, name: ex.name }))
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={() => navigate("/home/routines")}
          className="size-10 md:size-12 flex items-center justify-center rounded-xl md:rounded-2xl border border-gray-100 text-gray-400 shadow-sm shrink-0"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-black text-gray-800 tracking-tight truncate">{routine.name}</h1>
          <p className="text-xs md:text-gray-500 font-medium truncate">{routine.description || "Sin descripción"}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
        <div className="p-4 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-teal-600 text-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-lg shadow-teal-100">
                <FontAwesomeIcon icon={faLayerGroup} className="size-4 md:size-5" />
             </div>
             <h2 className="font-black text-lg md:text-xl text-gray-800">Ejercicios Programados</h2>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-black hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            Añadir Ejercicio
          </button>
        </div>

        <div className="space-y-4">
          {/* VISTA DESKTOP (TABLA) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black border-b border-gray-100">
                  <th className="px-8 py-5">Día</th>
                  <th className="px-8 py-5">Orden</th>
                  <th className="px-8 py-5">Ejercicio</th>
                  <th className="px-8 py-5">Series</th>
                  <th className="px-8 py-5">Reps</th>
                  <th className="px-8 py-5 text-center">Descanso</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {routine.exercises?.map((item: any) => (
                  <tr key={item.id} className="transition-all group">
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        <FontAwesomeIcon icon={faCalendarDay} className="text-teal-500" />
                        {getDayName(item.day_of_week)}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-teal-600 text-lg">#{item.sort_order}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-teal-50 size-10 rounded-xl flex items-center justify-center text-teal-600">
                          <FontAwesomeIcon icon={faDumbbell} className="text-sm" />
                        </div>
                        <span className="font-bold text-gray-800 text-base">{item.exercise_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-gray-600">{item.sets} <span className="text-[10px] text-gray-400 font-black uppercase">Sets</span></td>
                    <td className="px-8 py-6">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black font-mono text-sm">
                        {item.reps}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-gray-600 font-bold">
                         <FontAwesomeIcon icon={faClock} className="text-orange-400 text-xs" />
                         <span>{item.rest_time_seconds}s</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleRemoveExercise(item.id)}
                        className="size-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl transition-all"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL (TARJETAS) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {routine.exercises?.map((item: any) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-50 size-10 rounded-xl flex items-center justify-center text-teal-600">
                      <FontAwesomeIcon icon={faDumbbell} className="text-sm" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800 text-sm">{item.exercise_name}</h3>
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">
                        {getDayName(item.day_of_week)} • Orden #{item.sort_order}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveExercise(item.id)}
                    className="size-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50">
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Sets</span>
                    <span className="font-black text-gray-800 text-base">{item.sets}</span>
                  </div>
                  <div className="text-center border-x border-gray-50">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Reps</span>
                    <span className="font-black text-blue-600 text-base">{item.reps}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Descanso</span>
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                       <FontAwesomeIcon icon={faClock} className="text-orange-400 text-[10px]" />
                       <span className="text-sm">{item.rest_time_seconds}s</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!routine.exercises || routine.exercises.length === 0) && (
            <div className="px-8 py-20 text-center">
              <div className="flex flex-col items-center gap-4 text-gray-300">
                 <FontAwesomeIcon icon={faDumbbell} size="3x" />
                 <p className="font-bold text-lg">No hay ejercicios asignados todavía.</p>
                 <button onClick={() => setShowAddModal(true)} className="text-teal-600 hover:underline">Añadir ejercicios</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para añadir ejercicio */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="p-8 border-b border-gray-50 bg-linear-to-r from-teal-600 to-teal-500 text-white">
              <h2 className="text-2xl font-black">Añadir Ejercicio</h2>
              <p className="text-teal-100 font-medium text-sm">Configura los detalles del ejercicio para esta rutina.</p>
            </div>
            
            <form onSubmit={handleAddExercise} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField 
                  label="Ejercicio"
                  icon={faDumbbell}
                  placeholder="Seleccionar..."
                  options={exerciseOptions}
                  value={newExerciseData.exercise_id}
                  onChange={(val) => setNewExerciseData({ ...newExerciseData, exercise_id: val })}
                />
                <SelectField 
                  label="Día de la Semana"
                  icon={faCalendarDay}
                  placeholder="Seleccionar..."
                  options={dayOptions}
                  value={newExerciseData.day_of_week}
                  onChange={(val) => setNewExerciseData({ ...newExerciseData, day_of_week: val })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-2 block tracking-widest">Series (Sets)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                      value={newExerciseData.sets}
                      onChange={(e) => setNewExerciseData({ ...newExerciseData, sets: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-2 block tracking-widest">Repeticiones</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    </span>
                    <input
                      type="text"
                      required
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                      placeholder="Ej: 12 o 10-12"
                      value={newExerciseData.reps}
                      onChange={(e) => setNewExerciseData({ ...newExerciseData, reps: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-2 block tracking-widest">Descanso (seg)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faClock} className="text-xs" />
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                      value={newExerciseData.rest_time_seconds}
                      onChange={(e) => setNewExerciseData({ ...newExerciseData, rest_time_seconds: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-2 block tracking-widest">Orden</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faSortAmountUp} className="text-xs" />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                      value={newExerciseData.sort_order}
                      onChange={(e) => setNewExerciseData({ ...newExerciseData, sort_order: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all border border-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-4 rounded-2xl bg-teal-600 text-white text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Añadir a Rutina"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
