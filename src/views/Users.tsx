import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {apiService} from "../services/services";
import type { createUsers } from "../services/services";
import { notify } from "../utils/toast";

interface User extends createUsers {
  id: number;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<createUsers>({
    name: "",
    email: "",
    password: "",
    role: "trainer"
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers();
      setUsers(response.data.users);
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
    try {
      if (editingUser) {
        await apiService.updateUsers(editingUser.id, formData);
        notify.success("Usuario actualizado");
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
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar a este miembro del personal?")) {
      try {
        await apiService.deleteUsers(id);
        notify.success("Usuario eliminado");
        fetchUsers();
      } catch (error) {
        notify.error("Error al eliminar usuario");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Personal</h1>
          <p className="text-gray-500">Administra las cuentas de entrenadores y cajeros de tu gimnasio.</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: "", email: "", password: "", role: "trainer" });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Agregar Personal</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400 font-black">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-gray-300" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      user.role === "trainer" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({ ...user, password: "" });
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    No hay personal registrado aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingUser ? "Editar Personal" : "Registrar Nuevo Personal"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {editingUser ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
                </label>
                <input
                  required={!editingUser}
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rol en el Gimnasio</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="trainer">Entrenador (Trainer)</option>
                  <option value="cashier">Cajero (Cashier)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all"
                >
                  {editingUser ? "Actualizar" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
