import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faClock, faRedo, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { apiService} from "../services/services";

export default function MyRoutines() {
  const [activeRoutine, setActiveRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchMyRoutine = async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const response = await apiService.getRoutineCliente(user.id);
      setActiveRoutine(response.data);
    } catch (error) {
      // Si no tiene rutina activa, no mostramos error crítico
      setActiveRoutine(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRoutine();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  const getDayName = () => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[new Date().getDay()];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-teal-500/30 text-teal-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block border border-teal-400/20">
            {activeRoutine ? "Rutina Activa" : "Sin Rutina"}
          </span>
          <h1 className="text-3xl font-black mb-2">¡Hola, {user.name}!</h1>
          <p className="text-teal-100 opacity-90">
            {activeRoutine 
              ? `Hoy es ${getDayName()}. Toca darle duro a la rutina: ${activeRoutine.routine.name}` 
              : "Aún no tienes una rutina asignada. ¡Consulta con tu entrenador!"}
          </p>
        </div>
        <FontAwesomeIcon icon={faDumbbell} className="absolute -right-8 -bottom-8 text-white/10 text-[180px] rotate-12" />
      </div>

      {activeRoutine ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-800">Ejercicios para {getDayName()}</h2>
            <div className="flex gap-2 text-xs font-bold text-gray-400 uppercase">
              <span>{activeRoutine.routine.exercises.length} Ejercicios</span>
            </div>
          </div>

          <div className="grid gap-4">
            {activeRoutine.routine.exercises.map((item: any) => (
              <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-5 hover:border-teal-500/30 transition-all group">
                <div className="bg-gray-50 p-4 rounded-xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                  <FontAwesomeIcon icon={faDumbbell} className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{item.exercise_name} - {item.muscle_group}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faRedo} className="text-teal-500/50" />
                      <span className="font-bold text-gray-700">{item.sets}</span> series
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-teal-500/50" />
                      <span className="font-bold text-gray-700">{item.reps}</span> reps
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faClock} className="text-teal-500/50" />
                      <span className="font-bold text-gray-700">{item.rest_time_seconds}s</span> desc
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faDumbbell} className="text-gray-300 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No hay rutinas asignadas</h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            Cuando tu entrenador te asigne una rutina, aparecerá aquí con todos los detalles.
          </p>
        </div>
      )}
    </div>
  );
}
