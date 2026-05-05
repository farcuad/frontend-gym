import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faLayerGroup, faSearch, faSpinner, faCalendarAlt, faTimes, faCheckCircle, faCalendarDay, faPlus, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import { notify } from "../utils/toast";
import { SelectField } from "../components/SelectField";

export default function AssignRoutines() {
  const [clients, setClients] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [assignmentData, setAssignmentData] = useState({
    routine_id: 0,
    day_of_week: 1,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    is_active: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, routinesRes] = await Promise.all([
        apiService.getClients(),
        apiService.getRoutines()
      ]);
      
      const clientsData = clientsRes.data.clients || [];
      
      const clientsWithRoutines = await Promise.all(
        clientsData.map(async (client: any) => {
          try {
            const routinesRes = await apiService.getClientRoutines(client.id);
            const assignments = routinesRes.data.assignments || [];
            const activeExercises = routinesRes.data.activeExercises || [];
            
            const activeAssignments = assignments
              .filter((item: any) => {
                const a = item.assignment || item;
                return a.is_active === true || a.is_active === 1;
              })
              .map((item: any) => {
                const a = item.assignment || item;
                const exercises = activeExercises.filter((ex: any) => 
                  ex.routine_id === a.routine_id && ex.day_of_week === a.day_of_week
                );
                return { 
                  ...a, 
                  routine_name: a.routine_name || item.routine?.name,
                  exercises 
                };
              })
              .sort((a: any, b: any) => (a.day_of_week || 0) - (b.day_of_week || 0));

            return { 
              ...client, 
              active_assignments: activeAssignments,
              active_routine: activeAssignments.length > 0 ? activeAssignments[0] : null
            };
          } catch (error) {
            console.error(`Error cargando rutinas para cliente ${client.id}:`, error);
            return { ...client, active_assignments: [], active_routine: null };
          }
        })
      );

      setClients(clientsWithRoutines);
      setRoutines(routinesRes.data.routines || []);
    } catch (error) {
      notify.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentData.routine_id) return notify.error("Selecciona una rutina");

    setIsSubmitting(true);
    try {
      await apiService.addRoutineCliente({
        client_id: selectedClient.id,
        routine_id: Number(assignmentData.routine_id),
        day_of_week: assignmentData.day_of_week,
        start_date: assignmentData.start_date,
        end_date: assignmentData.end_date,
        is_active: true
      });
      notify.success("Rutina asignada correctamente");
      setShowModal(false);
      setAssignmentData({
        routine_id: 0,
        day_of_week: 1,
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        is_active: true
      });
      fetchData(); 
    } catch (error) {
      notify.error("Error al asignar rutina");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (assignmentId: number) => {
    if (!window.confirm("¿Estás seguro de desactivar esta rutina?")) return;
    
    try {
      await apiService.deactivateRoutineCliente(assignmentId);
      notify.success("Rutina desactivada correctamente");
      fetchData();
    } catch (error) {
      notify.error("Error al desactivar rutina");
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cedula.includes(searchTerm)
  );

  const routineOptions = [
    { id: 0, name: "Seleccionar rutina..." },
    ...routines.map(r => ({ id: r.id, name: r.name }))
  ];

  const dayOptions = [
    { id: 1, name: "Lunes" },
    { id: 2, name: "Martes" },
    { id: 3, name: "Miércoles" },
    { id: 4, name: "Jueves" },
    { id: 5, name: "Viernes" },
    { id: 6, name: "Sábado" },
    { id: 7, name: "Domingo" }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 md:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <h1 className="text-xl font-black text-gray-800 tracking-tight shrink-0 text-center sm:text-left">Asignación de Rutinas</h1>
        </div>
        <div className="relative group flex-1 max-w-md w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <FontAwesomeIcon icon={faSearch} className="text-xs" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-gray-700 text-sm placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FontAwesomeIcon icon={faSpinner} className="text-teal-600 text-4xl animate-spin" />
          <p className="text-gray-400 font-bold animate-pulse">Obteniendo listas de clientes...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* VISTA DESKTOP (TABLA) */}
          <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black border-b border-gray-100">
                  <th className="px-8 py-5">Cliente</th>
                  <th className="px-8 py-5">Identificación</th>
                  <th className="px-8 py-5">Estado</th>
                  <th className="px-8 py-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-teal-50/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 size-12 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-inner shrink-0">
                          <FontAwesomeIcon icon={faUsers} className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-gray-800 text-base block truncate">{client.name}</span>
                          <span className="text-xs text-gray-400 font-medium">
                            {client.active_routine ? "Con Entrenamiento" : "Sin Entrenamiento"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg text-sm border border-gray-100">
                         {client.cedula}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {client.active_assignments && client.active_assignments.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          {client.active_assignments.map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between group/item bg-gray-50/50 p-2 rounded-xl border border-gray-100/50 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-[9px] bg-white text-teal-700 px-2 py-0.5 rounded-md font-black border border-teal-100 uppercase tracking-tighter shrink-0 shadow-xs">
                                  {["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][a.day_of_week] || "Gral"}
                                </span>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs text-gray-700 font-bold truncate leading-tight">{a.routine_name}</span>
                                  <span className="text-[8px] text-gray-400 font-medium uppercase tracking-widest">
                                    {a.exercises?.length || 0} Ejercicios
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-4 shrink-0">
                                <button
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setAssignmentData({
                                      routine_id: a.routine_id || 0,
                                      day_of_week: a.day_of_week || 1,
                                      start_date: a.start_date?.split("T")[0] || new Date().toISOString().split("T")[0],
                                      end_date: a.end_date?.split("T")[0] || "",
                                      is_active: true
                                    });
                                    setShowModal(true);
                                  }}
                                  className="text-blue-500 hover:bg-blue-100 size-7 rounded-lg flex items-center justify-center transition-colors"
                                  title="Editar esta asignación"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="text-[10px]" />
                                </button>
                                <button
                                  onClick={() => handleDeactivate(a.id)}
                                  className="text-red-400 hover:bg-red-100 size-7 rounded-lg flex items-center justify-center transition-colors"
                                  title="Desactivar esta asignación"
                                >
                                  <FontAwesomeIcon icon={faTrashAlt} className="text-[10px]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                           <div className="size-2 rounded-full bg-orange-400" />
                           <span className="text-xs text-gray-500 font-bold italic tracking-tight">Sin rutinas asignadas</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setAssignmentData({
                            routine_id: 0,
                            day_of_week: 1,
                            start_date: new Date().toISOString().split("T")[0],
                            end_date: "",
                            is_active: true
                          });
                          setShowModal(true);
                        }}
                        className="bg-teal-50 text-teal-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all shadow-sm active:scale-95 border border-teal-100 flex items-center gap-2 ml-auto"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        Asignar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL (TARJETAS) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-12 rounded-2xl bg-teal-50 shrink-0 flex items-center justify-center text-teal-600 shadow-inner">
                      <FontAwesomeIcon icon={faUsers} className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-gray-800 truncate text-base">{client.name}</h3>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{client.cedula}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Días</span>
                     {client.active_assignments && client.active_assignments.length > 0 ? (
                        <div className="flex flex-wrap justify-end gap-1 max-w-[120px]">
                          {client.active_assignments.map((a: any) => (
                            <span key={a.id} className="text-[8px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-md font-black border border-teal-100">
                              {["", "L", "M", "X", "J", "V", "S", "D"][a.day_of_week] || "?"}
                            </span>
                          ))}
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-orange-400" />
                          <span className="text-[10px] text-orange-600 font-black italic">Sin rutina</span>
                        </div>
                     )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Rutinas Activas</h4>
                  {client.active_assignments && client.active_assignments.length > 0 ? (
                    <div className="space-y-2">
                      {client.active_assignments.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-[9px] bg-white text-teal-700 px-2 py-1 rounded-lg font-black border border-teal-100 uppercase tracking-tighter shrink-0 shadow-xs">
                              {["", "L", "M", "X", "J", "V", "S", "D"][a.day_of_week] || "?"}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm text-gray-800 font-bold truncate leading-tight">{a.routine_name}</span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{a.exercises?.length || 0} Ejercicios</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                               onClick={() => {
                                 setSelectedClient(client);
                                 setAssignmentData({
                                   routine_id: a.routine_id || 0,
                                   day_of_week: a.day_of_week || 1,
                                   start_date: a.start_date?.split("T")[0] || new Date().toISOString().split("T")[0],
                                   end_date: a.end_date?.split("T")[0] || "",
                                   is_active: true
                                 });
                                 setShowModal(true);
                               }}
                               className="bg-blue-100 text-blue-600 size-9 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                             >
                               <FontAwesomeIcon icon={faEdit} className="text-xs" />
                             </button>
                             <button
                               onClick={() => handleDeactivate(a.id)}
                               className="bg-red-100 text-red-500 size-9 rounded-xl flex items-center justify-center transition-colors active:scale-95"
                             >
                               <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center bg-orange-50/30 rounded-2xl border border-dashed border-orange-100">
                       <p className="text-[10px] text-orange-600 font-black italic">Sin rutinas asignadas</p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setSelectedClient(client);
                    setAssignmentData({
                      routine_id: 0,
                      day_of_week: 1,
                      start_date: new Date().toISOString().split("T")[0],
                      end_date: "",
                      is_active: true
                    });
                    setShowModal(true);
                  }}
                  className="w-full bg-teal-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Asignar Nueva Rutina
                </button>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 py-24 text-center">
              <div className="flex flex-col items-center gap-4 text-gray-300">
                 <FontAwesomeIcon icon={faSearch} size="3x" />
                 <p className="font-bold text-lg text-gray-400">No se encontraron clientes para mostrar.</p>
                 <button onClick={() => setSearchTerm("")} className="text-teal-600 hover:underline font-bold">Ver todos los clientes</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Asignación */}
      {showModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative">
             <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="p-6 md:p-8 border-b border-gray-50 bg-linear-to-r from-teal-700 to-teal-600 text-white">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                   <FontAwesomeIcon icon={faLayerGroup} />
                </div>
                <span>Asignar Rutina</span>
              </h2>
              <p className="text-teal-100 font-medium text-sm mt-1">Configurando entrenamiento para <span className="font-black text-white">{selectedClient.name}</span></p>
            </div>

            <form onSubmit={handleAssign} className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField 
                    label="Rutina"
                    icon={faLayerGroup}
                    placeholder="Seleccionar..."
                    options={routineOptions}
                    value={assignmentData.routine_id}
                    onChange={(val) => setAssignmentData({ ...assignmentData, routine_id: val })}
                  />
                  <SelectField 
                    label="Día Preferido"
                    icon={faCalendarDay}
                    placeholder="Seleccionar..."
                    options={dayOptions}
                    value={assignmentData.day_of_week}
                    onChange={(val) => setAssignmentData({ ...assignmentData, day_of_week: val })}
                  />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-4">Fecha Inicio</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                    </span>
                    <input
                      type="date"
                      required
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                      value={assignmentData.start_date}
                      onChange={(e) => setAssignmentData({ ...assignmentData, start_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-4">Fecha Fin (Opcional)</label>
                   <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                    </span>
                    <input
                      type="date"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 shadow-xs"
                      value={assignmentData.end_date}
                      onChange={(e) => setAssignmentData({ ...assignmentData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 md:gap-4 pt-4">
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
                  className="flex-1 px-4 py-4 rounded-2xl bg-teal-600 text-white text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
