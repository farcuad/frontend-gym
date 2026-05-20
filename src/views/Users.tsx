import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrashAlt,
  faEdit,
  faEnvelope,
  faUser,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/services";
import type { createUsers } from "../services/services";
import { notify, useConfirm } from "../utils/toast";

interface User extends createUsers {
  id: number;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const confirm = useConfirm();

  const [formData, setFormData] = useState<createUsers>({
    name: "",
    email: "",
    password: "",
    role: "trainer",
  });

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      notify.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || (!editingUser && !formData.password.trim())) {
      notify.warning("Por favor completa todos los campos obligatorios.");
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await apiService.updateUsers(editingUser.id, formData);
        notify.success("Usuario actualizado correctamente");
      } else {
        await apiService.createUsers(formData);
        notify.success("Usuario creado exitosamente");
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "trainer" });
      fetchUsers();
    } catch (error) {
      notify.error("Error al guardar usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    const result = await confirm(
      "¿Estás seguro?",
      `Vas a eliminar a ${user.name}. ¡No podrás revertir esto!`,
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await apiService.deleteUsers(user.id);
        notify.success("Usuario eliminado correctamente");
        fetchUsers();
      } catch (error) {
        notify.error("Error al eliminar usuario");
      }
    }
  };

  // Helper to extract initials for placeholder avatars
  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
      {/* Header section with Search and Add User button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-teal-600" />
          Gestión de Personal
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FontAwesomeIcon icon={faSearch} className="text-sm" />
            </span>
            <input
              type="text"
              placeholder="Buscar personal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ name: "", email: "", password: "", role: "trainer" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 shrink-0 cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Agregar Personal</span>
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
                Correo
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                Rol
              </th>
              <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                Acciones
              </th>
            </tr>
          </thead>

          {currentUsers.length === 0 && (
            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center font-bold text-gray-400 uppercase tracking-wider text-[13px]"
                >
                  No hay personal registrado aún.
                </td>
              </tr>
            </tbody>
          )}

          {currentUsers.length > 0 && (
            <tbody className="divide-y divide-gray-50">
              {currentUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-teal-50/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold overflow-hidden shadow-inner shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div className="font-bold text-gray-800">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-gray-300" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${user.role === "trainer"
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                    >
                      {user.role === "trainer" ? "Entrenador" : "Cajero"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({ ...user, password: "" });
                          setShowModal(true);
                        }}
                        className="cursor-pointer size-9 flex items-center justify-center rounded-xl border border-amber-200 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="cursor-pointer size-9 flex items-center justify-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
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
        {currentUsers.length === 0 && (
          <div className="text-center font-bold text-gray-400 uppercase tracking-wider text-[13px] py-10">
            No hay personal registrado aún.
          </div>
        )}
        {currentUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold overflow-hidden shadow-inner shrink-0">
                  {getInitials(user.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{user.name}</h3>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.role === "trainer"
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                  >
                    {user.role === "trainer" ? "Entrenador" : "Cajero"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingUser(user);
                    setFormData({ ...user, password: "" });
                    setShowModal(true);
                  }}
                  className="size-9 flex items-center justify-center rounded-xl border border-amber-200 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-xs" />
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="size-9 flex items-center justify-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Correo Electrónico
                </span>
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} className="text-xs text-teal-500" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COMPONENTE DE PAGINACIÓN */}
      {filteredUsers.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6 px-2 py-4 border-t border-gray-50">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded-xl disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
                {Math.min(indexOfLastItem, filteredUsers.length)}
              </span>{" "}
              de <span className="text-gray-800 font-bold">{filteredUsers.length}</span> miembros
            </p>

            <nav className="flex gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="size-9 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-teal-600 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`size-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === page
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-100"
                    : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="size-9 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-teal-600 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Modal de Creación / Edición */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header con gradiente premium */}
            <div className="bg-linear-to-r from-teal-600 to-teal-500 px-8 py-6 text-white flex justify-between items-center shadow-md">
              <div>
                <h3 className="text-2xl font-black tracking-wide flex items-center gap-3">
                  <FontAwesomeIcon icon={faUser} className="text-teal-200" />
                  {editingUser ? "Editar Personal" : "Nuevo Personal"}
                </h3>
                <p className="text-teal-100 text-xs mt-1 font-medium">
                  {editingUser
                    ? "Modifica los datos del miembro del personal"
                    : "Registra un nuevo entrenador o cajero"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="cursor-pointer size-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
                title="Cerrar"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Cuerpo del Formulario */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                  </span>
                  <input
                    required
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    disabled={saving}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium disabled:opacity-60"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="ejemplo@gimnasio.com"
                    disabled={saving}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium disabled:opacity-60"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {editingUser ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña *"}
                </label>
                <input
                  required={!editingUser}
                  type="password"
                  placeholder={editingUser ? "••••••••" : "Ingresa la contraseña"}
                  disabled={saving}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium disabled:opacity-60"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Rol en el Gimnasio *
                </label>
                <select
                  disabled={saving}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium disabled:opacity-60"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="trainer">Entrenador</option>
                  <option value="cashier">Cajero</option>
                </select>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-4 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="cursor-pointer flex-1 px-6 py-4 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer flex-1 px-6 py-4 text-sm font-bold text-white bg-teal-600 rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingUser ? "Actualizar" : "Registrar"}</span>
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
