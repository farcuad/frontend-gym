import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faIdBadge,
  faCheckCircle,
  faTimes,
  faUser,
  faCalendarAlt,
  faSpinner,
  faPlus,
  faLayerGroup
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import type { Memberships, Clients, Plans } from "../services/services";

interface NewMembership {
  client_id: number;
  plan_id: number;
}

const MembershipTable: React.FC = () => {
  const [memberships, setMemberships] = useState<Memberships[]>([]);
  const [clients, setClients] = useState<Clients[]>([]);
  const [plans, setPlans] = useState<Plans[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMemberships = async () => {
    try {
      const response = await apiService.getMemberships();
      // La API devuelve { message: "...", membership: [...] } (singular)
      // response.data contiene el objeto completo de la API
      const apiResponse = response.data;

      // Extraer el array de membresías (la API usa 'membership' en singular)
      if (apiResponse && apiResponse.membership && Array.isArray(apiResponse.membership)) {
        setMemberships(apiResponse.membership);
      } else if (Array.isArray(apiResponse)) {
        // Si la respuesta es directamente un array
        setMemberships(apiResponse);
      } else {
        console.error("Formato de respuesta inesperado:", apiResponse);
        setMemberships([]);
      }
    } catch (error) {
      console.error("Error al obtener membresías:", error);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsAndPlans = async () => {
    try {
      const [clientsRes, plansRes] = await Promise.all([
        apiService.getClients(),
        apiService.getPlans()
      ]);

      const clientsData = clientsRes.data;
      const plansData = plansRes.data;

      if (clientsData && clientsData.clients) {
        setClients(clientsData.clients);
      } else if (Array.isArray(clientsData)) {
        setClients(clientsData);
      }

      if (plansData && plansData.plans) {
        setPlans(plansData.plans);
      } else if (Array.isArray(plansData)) {
        setPlans(plansData);
      }
    } catch (error) {
      console.error("Error al obtener clientes/planes:", error);
    }
  };

  useEffect(() => {
    fetchMemberships();
    fetchClientsAndPlans();
  }, []);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Memberships | null>(null);
  const [newMembership, setNewMembership] = useState<NewMembership>({
    client_id: 0,
    plan_id: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MySwal = withReactContent(Swal);

  const handleCreateMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMembership.client_id || !newMembership.plan_id) {
      MySwal.fire('Error', 'Por favor selecciona un cliente y un plan.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiService.createMembership(newMembership as unknown as Memberships);
      MySwal.fire('¡Éxito!', 'Membresía creada correctamente.', 'success');
      setIsCreateOpen(false);
      setNewMembership({ client_id: 0, plan_id: 0 });
      fetchMemberships();
    } catch (error) {
      console.error("Error al crear membresía:", error);
      MySwal.fire('Error', 'No se pudo crear la membresía.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: Memberships) => {
    setSelectedMember(member);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    MySwal.fire({
      title: '¿Revocar Membresía?',
      text: `Se eliminará el registro #${id}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'rounded-[2rem]' }
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire('Eliminado', 'Registro actualizado.', 'success');
      }
    });
  };

  const getStatusColor = (estado: Memberships['estado']) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-600';
      case 'vencido':
        return 'bg-rose-100 text-rose-600';
      case 'suspendido':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-center min-h-[200px]">
        <FontAwesomeIcon icon={faSpinner} className="text-teal-600 text-2xl animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
          <div className="bg-teal-600 text-white p-2 rounded-xl shadow-lg shadow-teal-100">
            <FontAwesomeIcon icon={faIdBadge} className="size-5" />
          </div>
          Control de Membresías
        </h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
        >
          <FontAwesomeIcon icon={faPlus} />
          Nueva Membresía
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 text-gray-400">
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">#</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Cliente</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Plan</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Precio</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Fecha Inicio</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Fecha Vencimiento</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Estado</th>
              <th className="px-6 py-4 text-center font-bold uppercase tracking-widest text-[10px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {memberships.map((member, index) => (
              <tr key={member.id} className="hover:bg-gray-50/50 transition-all group">
                <td className="px-6 py-5 text-gray-400 font-medium">{index + 1}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                      <FontAwesomeIcon icon={faUser} className="text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700">{member.client_name}</span>
                      <span className="text-xs text-gray-400">{member.client_phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-medium text-gray-600">{member.plan_name}</td>
                <td className="px-6 py-5">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs">
                    $ {member.plan_price}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-xs text-gray-400" />
                    <span className="font-medium">{new Date(member.fecha_inicio).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-xs text-gray-400" />
                    <span className="font-medium">{new Date(member.fecha_vencimiento).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(member.estado)}`}>
                    <FontAwesomeIcon icon={member.estado === "activo" ? faCheckCircle : faTimes} className="text-[12px]" />
                    {member.estado}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEdit(member)} className="size-8 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(member.id)} className="size-8 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDICIÓN */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-teal-600"></div>
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-800">Actualizar Membresía</h3>
              <p className="text-sm text-gray-400 font-medium">Modifica los detalles de la membresía.</p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="relative group">
                <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">Cliente</label>
                <input
                  type="text"
                  defaultValue={selectedMember?.client_name}
                  disabled
                  className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-700 cursor-not-allowed"
                />
              </div>

              <div className="relative group">
                <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">Plan</label>
                <input
                  type="text"
                  defaultValue={selectedMember?.plan_name}
                  disabled
                  className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-700 cursor-not-allowed"
                />
              </div>

              <div className="relative group">
                <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">Estado</label>
                <select
                  defaultValue={selectedMember?.estado}
                  className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700"
                >
                  <option value="activo">Activo</option>
                  <option value="vencido">Vencido</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">
                  Cerrar
                </button>
                <button type="submit" className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-100 rounded-2xl transition-all">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-teal-600"></div>
            
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="mb-8 mt-4">
              <h3 className="text-2xl font-black text-gray-800">Nueva Membersía</h3>
              <p className="text-sm text-gray-400 font-medium">Asigna un plan a un cliente.</p>
            </div>

            <form className="space-y-5" onSubmit={handleCreateMembership}>
              <div className="relative group">
                <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">Cliente</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                  </span>
                  <select
                    value={newMembership.client_id}
                    onChange={(e) => setNewMembership({...newMembership, client_id: Number(e.target.value)})}
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700"
                  >
                    <option value="0">Selecciona un cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} - {client.cedula}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">Plan</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                  </span>
                  <select
                    value={newMembership.plan_id}
                    onChange={(e) => setNewMembership({...newMembership, plan_id: Number(e.target.value)})}
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700"
                  >
                    <option value="0">Selecciona un plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price} ({plan.duration_day} días)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)} 
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-100 rounded-2xl transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  ) : (
                    "Crear Membersía"
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

export default MembershipTable;