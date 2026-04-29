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
      
      // Obtenemos las rutinas de cada cliente usando el nuevo endpoint
      const clientsWithRoutines = await Promise.all(
        clientsData.map(async (client: any) => {
          try {
            const routinesRes = await apiService.getClientRoutines(client.id);
            const assignments = routinesRes.data.assignments || [];
            
            // Buscamos la asignación que esté activa
            const activeAssignment = assignments.find((a: any) => 
              a.is_active === true || a.is_active === 1
            );

            if (activeAssignment) {
              return { 
                ...client, 
                active_routine: {
                  ...activeAssignment,
                  name: activeAssignment.routine_name // Usamos el nombre que ya viene en la API
                } 
              };
            }
            return { ...client, active_routine: null };
          } catch (error) {
            console.error(`Error cargando rutinas para cliente ${client.id}:`, error);
            return { ...client, active_routine: null };
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
                      {client.active_routine ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <div className="size-2 rounded-full bg-teal-500 animate-pulse" />
                             <span className="text-sm text-teal-700 font-black tracking-tight">{client.active_routine.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold ml-4 uppercase tracking-tighter">Rutina Activa</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                           <div className="size-2 rounded-full bg-orange-400" />
                           <span className="text-xs text-gray-500 font-bold italic tracking-tight">Sin rutina asignada</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {client.active_routine ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setAssignmentData({
                                  routine_id: client.active_routine.routine_id || 0,
                                  day_of_week: client.active_routine.day_of_week || 1,
                                  start_date: client.active_routine.start_date || new Date().toISOString().split("T")[0],
                                  end_date: client.active_routine.end_date || "",
                                  is_active: true
                                });
                                setShowModal(true);
                              }}
                              className="bg-blue-50 text-blue-600 size-10 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                              title="Actualizar Rutina"
                            >
                              <FontAwesomeIcon icon={faEdit} className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDeactivate(client.active_routine.id)}
                              className="bg-red-50 text-red-600 size-10 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                              title="Desactivar Rutina"
                            >
                              <FontAwesomeIcon icon={faTrashAlt} className="text-sm" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowModal(true);
                            }}
                            className="bg-teal-50 text-teal-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            Asignar Rutina
                          </button>
                        )}
                      </div>
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
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</span>
                     {client.active_routine ? (
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
                          <span className="text-[10px] text-teal-600 font-black">{client.active_routine.name}</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-orange-400" />
                          <span className="text-[10px] text-orange-600 font-black italic">Sin rutina</span>
                        </div>
                     )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {client.active_routine ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setAssignmentData({
                            routine_id: client.active_routine.routine_id || 0,
                            day_of_week: client.active_routine.day_of_week || 1,
                            start_date: client.active_routine.start_date || new Date().toISOString().split("T")[0],
                            end_date: client.active_routine.end_date || "",
                            is_active: true
                          });
                          setShowModal(true);
                        }}
                        className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeactivate(client.active_routine.id)}
                        className="flex-1 bg-red-600 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setShowModal(true);
                      }}
                      className="w-full bg-teal-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Asignar Rutina
                    </button>
                  )}
                </div>
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
