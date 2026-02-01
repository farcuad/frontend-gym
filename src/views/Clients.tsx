import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faUser,
  faIdCard,
  faPhone,
  faTimes,
  faSpinner,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import type { Clients } from "../services/services";

const EmployeeTable: React.FC = () => {
  const [employees, setEmployees] = useState<Clients[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClients = async () => {
    try {
      const response = await apiService.getClients();
      // La API devuelve { message: "...", clients: [...] }
      // response.data contiene el objeto completo de la API
      const apiResponse = response.data;

      // Extraer el array de clientes
      if (
        apiResponse &&
        apiResponse.clients &&
        Array.isArray(apiResponse.clients)
      ) {
        setEmployees(apiResponse.clients);
      } else if (Array.isArray(apiResponse)) {
        // Si la respuesta es directamente un array
        setEmployees(apiResponse);
      } else {
        console.error("Formato de respuesta inesperado:", apiResponse);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<Clients | null>(null);
  const [newClient, setNewClient] = useState<Clients>({
    name: "",
    cedula: "",
    phone: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    activo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MySwal = withReactContent(Swal);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.createClient(newClient);
      MySwal.fire("¡Éxito!", "Cliente creado correctamente.", "success");
      setIsCreateOpen(false);
      setNewClient({
        name: "",
        cedula: "",
        phone: "",
        fecha_ingreso: new Date().toISOString().split("T")[0],
        activo: true,
      });
      fetchClients();
    } catch (error) {
      console.error("Error al crear cliente:", error);
      MySwal.fire("Error", "No se pudo crear el cliente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (client: Clients) => {
    setEditClient({ ...client });
    setIsEditOpen(true);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!editClient || !editClient.id) return;

  setIsSubmitting(true);
  try {
    const { name, cedula, phone, fecha_ingreso, activo } = editClient;
    await apiService.updateClient(editClient.id, { name, cedula, phone, fecha_ingreso, activo });
    MySwal.fire("¡Actualizado!", "Cliente actualizado correctamente.", "success");
    setIsEditOpen(false);
    fetchClients();
  } catch (error) {
    MySwal.fire("Error", "No se pudo actualizar el cliente.");
    console.log(error);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleDelete = async (client: Clients) => {
    MySwal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar a ${client.name}. ¡No podrás revertir esto!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed && client.id) {
        try {
          await apiService.deleteClient(client.id);
          MySwal.fire("¡Eliminado!", "El cliente ha sido borrado.", "success");
          fetchClients();
        } catch (error) {
          MySwal.fire("Error", "No se pudo eliminar el cliente." + error);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center min-h-[200px]">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-teal-600 text-2xl animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-teal-600" />
          Clientes
        </h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
        >
          <FontAwesomeIcon icon={faPlus} />
          Nuevo Cliente
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                #
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                Nombre
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                Cédula
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                Teléfono
              </th>
              <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {employees.map((person, index) => (
              <tr
                key={person.id}
                className="hover:bg-teal-50/30 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-gray-800">{person.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                  {person.cedula}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                  {person.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(person)}
                      className="size-9 flex items-center justify-center rounded-xl border border-amber-200 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDelete(person)}
                      className="size-9 flex items-center justify-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDICIÓN MEJORADO */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-6 right-6 size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-800 leading-tight">
                Editar Cliente
              </h3>
              <p className="text-sm text-gray-400 font-medium">
                Actualiza la información del miembro.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleUpdateClient}>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                  </span>
                  <input
                    type="text"
                    value={editClient?.name || ""}
                    onChange={(e) =>
                      setEditClient({ ...editClient!, name: e.target.value })
                    }
                    placeholder="Nombre completo"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faIdCard} className="text-xs" />
                  </span>
                  <input
                    type="text"
                    value={editClient?.cedula || ""}
                    onChange={(e) =>
                      setEditClient({ ...editClient!, cedula: e.target.value })
                    }
                    placeholder="Cédula"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faPhone} className="text-xs" />
                  </span>
                  <input
                    type="text"
                    value={editClient?.phone || ""}
                    onChange={(e) =>
                      setEditClient({ ...editClient!, phone: e.target.value })
                    }
                    placeholder="Teléfono"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 px-4 py-3.5 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 text-sm font-bold text-white bg-teal-600 rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all"
                >{isSubmitting ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  ) : (
                    "Actualizar Cliente"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-6 right-6 size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-800 leading-tight">
                Nuevo Cliente
              </h3>
              <p className="text-sm text-gray-400 font-medium">
                Ingresa los datos del nuevo miembro.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleCreateClient}>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                  </span>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) =>
                      setNewClient({ ...newClient, name: e.target.value })
                    }
                    placeholder="Nombre completo"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faIdCard} className="text-xs" />
                  </span>
                  <input
                    type="text"
                    value={newClient.cedula || ""}
                    onChange={(e) =>
                      setNewClient({ ...newClient, cedula: e.target.value })
                    }
                    placeholder="Cédula"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faPhone} className="text-xs" />
                  </span>
                  <input
                    type="text"
                    value={newClient.phone || ""}
                    onChange={(e) =>
                      setNewClient({ ...newClient, phone: e.target.value })
                    }
                    placeholder="Teléfono"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 px-4 py-3.5 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3.5 text-sm font-bold text-white bg-teal-600 rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  ) : (
                    "Crear Cliente"
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

export default EmployeeTable;
