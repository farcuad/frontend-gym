import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faClock, faRedo, faCheckCircle, faCalendarAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { apiService} from "../services/services";

export default function MyRoutines() {
  const [activeRoutine, setActiveRoutine] = useState<any>(null);
  const [weeklyAssignments, setWeeklyAssignments] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() === 0 ? 7 : new Date().getDay());
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      // 1. Get all assignments for the client
      const weekRes = await apiService.getClientRoutines(user.id);
      const allAssignments = weekRes.data.assignments || [];
      
      
      // Filter only active assignments
      const activeAssignments = allAssignments.filter((a: any) => a.is_active === true || a.is_active === 1);

      // 2. Get unique routine IDs to avoid redundant calls
      const uniqueRoutineIds = [...new Set(activeAssignments.map((a: any) => a.routine_id))];

      // 3. Fetch full details for each unique routine (including exercises)
      const routinesDetails = await Promise.all(
        uniqueRoutineIds.map(async (id) => {
          try {
            const res = await apiService.getRoutineById(id as number);
            return res.data.routine || res.data;
          } catch (e) {
            console.error(`Error fetching routine ${id}:`, e);
            return null;
          }
        })
      );

      // Create a map for quick access: { routineId: routineData }
      const routinesMap = routinesDetails.reduce((acc: any, r: any) => {
        if (r) acc[r.id] = r;
        return acc;
      }, {});

      // 4. Build the weekly schedule with full data
      const todayDay = new Date().getDay() === 0 ? 7 : new Date().getDay();
      
      const activeWeekly = activeAssignments.map((a: any) => {
        const routineInfo = routinesMap[a.routine_id] || {};
        
        // Match exercises that belong to this routine AND this specific day
        // Some routines might have exercises for different days
        const exercises = (routineInfo.exercises || []).filter((ex: any) => 
          !ex.day_of_week || ex.day_of_week === a.day_of_week
        );

        return {
          ...a,
          routine: {
            ...routineInfo,
            name: a.routine_name || routineInfo.name,
            description: a.routine_description || routineInfo.description,
          },
          exercises: exercises
        };
      }).sort((a: any, b: any) => (a.day_of_week || 0) - (b.day_of_week || 0));

      setWeeklyAssignments(activeWeekly);

      // Set today's active routine if it exists
      const todayAssignment = activeWeekly.find((a:any) => a.day_of_week === todayDay);
      if (todayAssignment) {
        setActiveRoutine(todayAssignment);
      }

    } catch (error) {
      console.error("Error al cargar rutinas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDayName = (dayNum: number) => {
    const days = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return days[dayNum];
  };

  const daysOfWeek = [
    { id: 1, label: "L", name: "Lunes" },
    { id: 2, label: "M", name: "Martes" },
    { id: 3, label: "X", name: "Miércoles" },
    { id: 4, label: "J", name: "Jueves" },
    { id: 5, label: "V", name: "Viernes" },
    { id: 6, label: "S", name: "Sábado" },
    { id: 7, label: "D", name: "Domingo" }
  ];

  // Buscamos si hay una rutina para el día seleccionado en el listado semanal
  const selectedAssignment = weeklyAssignments.find(a => a.day_of_week === selectedDay);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600/20 border-b-teal-600"></div>
      <p className="text-gray-400 font-bold animate-pulse">Cargando tu entrenamiento...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 px-2 sm:px-0">
      {/* Header Premium */}
      <div className="bg-linear-to-br from-teal-800 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">
              {activeRoutine ? "Plan de Hoy Activo" : "Sin Entrenamiento Hoy"}
            </span>
            <span className="bg-teal-400/20 text-teal-100 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-teal-400/20">
               {getDayName(new Date().getDay() === 0 ? 7 : new Date().getDay())}
            </span>
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">¡Hola, {user.name}!</h1>
          <p className="text-teal-50 opacity-90 font-medium max-w-md">
            {activeRoutine 
              ? `Hoy toca darle duro a la rutina: ${activeRoutine.routine.name}. ¡Tú puedes!` 
              : "Hoy es tu día de descanso o aún no tienes rutina para hoy. ¡Recupera energías!"}
          </p>
        </div>
        <FontAwesomeIcon icon={faDumbbell} className="absolute -right-12 -bottom-12 text-white/5 text-[240px] rotate-12" />
      </div>

      {/* Selector Semanal */}
      <div className="bg-white rounded-4xl p-4 shadow-xl shadow-gray-200/50 border border-gray-50">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-teal-600" />
            Horario Semanal
          </h2>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Selecciona un día</span>
        </div>
        <div className="flex justify-between gap-2">
          {daysOfWeek.map((day) => {
            const hasRoutine = weeklyAssignments.some(a => a.day_of_week === day.id);
            const isSelected = selectedDay === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`
                  flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-300
                  ${isSelected ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}
                  ${hasRoutine && !isSelected ? 'border-b-4 border-teal-500/30' : 'border-b-4 border-transparent'}
                `}
              >
                <span className="text-[10px] font-black uppercase">{day.label}</span>
                {hasRoutine && <div className={`size-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-50'}`}></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del Día Seleccionado */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Rutina del {getDayName(selectedDay)}</h2>
            {selectedAssignment && (
              <span className="text-teal-600 font-bold text-sm">{selectedAssignment.routine?.name || selectedAssignment.routine_name}</span>
            )}
          </div>
        </div>

        {selectedAssignment ? (
          <div className="grid gap-4">
            {(selectedAssignment.routine?.exercises || selectedAssignment.exercises)?.length > 0 ? (
              (selectedAssignment.routine?.exercises || selectedAssignment.exercises).map((item: any, idx: number) => (
                <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-5 hover:border-teal-500/30 transition-all group relative overflow-hidden">
                  <div className="bg-gray-50 size-14 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faDumbbell} className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-800 text-lg mb-1 truncate">
                      {item.exercise_name || item.name || `Ejercicio #${item.exercise_id || item.id}`}
                    </h3>
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      {item.muscle_group || item.muscle_name || 'General'}
                    </span>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center">
                           <FontAwesomeIcon icon={faRedo} className="text-teal-500 text-xs" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Series</span>
                           <span className="font-black text-gray-700 text-sm">{item.sets}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center">
                           <FontAwesomeIcon icon={faCheckCircle} className="text-teal-500 text-xs" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Reps</span>
                           <span className="font-black text-gray-700 text-sm">{item.reps}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center">
                           <FontAwesomeIcon icon={faClock} className="text-teal-500 text-xs" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Descanso</span>
                           <span className="font-black text-gray-700 text-sm">{item.rest_time_seconds}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faChevronRight} className="text-gray-100 group-hover:text-teal-100 transition-colors" />
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                 <p className="text-gray-400 font-bold">Esta rutina no tiene ejercicios registrados.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm mx-4 sm:mx-0">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-200 text-4xl" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Día sin rutina</h3>
            <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm px-6">
              No tienes actividades programadas para el <span className="text-teal-600 font-black">{getDayName(selectedDay)}</span>. ¡Aprovecha para descansar!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
