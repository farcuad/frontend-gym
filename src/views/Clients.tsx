import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt, faUser, faIdCard, faPhone, faSpinner, faPlus, faSearch, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import type { Clients } from "../services/services";
import { notify, useConfirm } from "../utils/toast";
import axios from "axios";
import { ClientForm } from "../components/ClientForm";

const EmployeeTable: React.FC = () => {
  const [employees, setEmployees] = useState<Clients[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const confirm = useConfirm();

  const fetchClients = async () => {
    try {
      const response = await apiService.getClients();
      const apiResponse = response.data.clients;
      setEmployees(apiResponse);
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

  const handleEdit = (client: Clients) => {
    setEditClient({ ...client });
    setIsEditOpen(true);
  };

  const handleDelete = async (client: Clients) => {
    const result = await confirm(
      "¿Estás seguro?",
      `Vas a eliminar a ${client.name}. ¡No podrás revertir esto!`,
      "warning"
    );

    if (result.isConfirmed && client.id) {
      try {
        await apiService.deleteClient(client.id);
        notify.success("El cliente ha sido borrado.");
        fetchClients();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "No se pudo eliminar el cliente.";
          notify.error(message);
        } else {
          notify.error("No se pudo eliminar el cliente.");
        }
      }
    }
  };

  const filteredEmployees = employees.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center min-h-50">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-teal-600 text-2xl animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-teal-600" />
          Clientes
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FontAwesomeIcon icon={faSearch} className="text-sm" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 shrink-0 cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Nuevo Cliente</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* VISTA ESCRITORIO (TABLA) */}
      <div className="hidden md:block overflow-x-auto">
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

          {currentEmployees.length === 0 && (
            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider text-[13px]"
                >
                  No hay clientes disponibles
                </td>
              </tr>
            </tbody>
          )}

          {currentEmployees.length > 0 && (
            <tbody className="divide-y divide-gray-50">
              {currentEmployees.map((person, index) => (
                <tr
                  key={person.id}
                  className="hover:bg-teal-50/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold overflow-hidden shadow-inner shrink-0">
                        {person.image ? (
                          <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          <FontAwesomeIcon icon={faUser} className="text-teal-500 text-sm" />
                        )}
                      </div>
                      <div className="font-bold text-gray-800">{person.name}</div>
                    </div>
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
                        className="cursor-pointer size-9 flex items-center justify-center rounded-xl border border-amber-200 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDelete(person)}
                        className="cursor-pointer size-9 flex items-center justify-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          className="text-xs"
                        />
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
        {currentEmployees.length === 0 && (
          <div className="text-center font-bold text-gray-400 uppercase tracking-wider text-[13px] py-10">
            No hay clientes disponibles
          </div>
        )}
        {currentEmployees.map((person) => (
          <div
            key={person.id}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold overflow-hidden shadow-inner shrink-0">
                  {person.image ? (
                    <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="text-teal-500 text-lg" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {person.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="text-xs text-teal-500"
                    />
                    {person.cedula}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(person)}
                  className="size-9 flex items-center justify-center rounded-xl border border-amber-200 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-xs" />
                </button>
                <button
                  onClick={() => handleDelete(person)}
                  className="size-9 flex items-center justify-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Teléfono
                </span>
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-xs text-teal-500"
                  />
                  {person.phone}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COMPONENTE DE PAGINACIÓN */}
      {filteredEmployees.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6 px-2 py-4 border-t border-gray-50">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded-xl disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded-xl disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>

          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Mostrando <span className="text-gray-800 font-bold">{indexOfFirstItem + 1}</span> a{" "}
              <span className="text-gray-800 font-bold">
                {Math.min(indexOfLastItem, filteredEmployees.length)}
              </span>{" "}
              de <span className="text-gray-800 font-bold">{filteredEmployees.length}</span> clientes
            </p>
            
            <nav className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="size-9 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-teal-600 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`size-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-100"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="size-9 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-teal-600 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* MODALES REUTILIZABLES CON CLIENTFORM */}
      <ClientForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchClients}
        clientToEdit={null}
      />

      <ClientForm
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditClient(null);
        }}
        onSuccess={fetchClients}
        clientToEdit={editClient}
      />
    </div>
  );
};

export default EmployeeTable;
