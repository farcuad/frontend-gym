import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faRobot,
  faKey,
  faIdBadge,
  faTimes,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { notify, useConfirm } from "../utils/toast";
import { apiService } from "../services/services";
import type { BotConfig } from "../services/services";
import axios from 'axios';

const BotsView: React.FC = () => {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBot, setNewBot] = useState<BotConfig>({
    whaibot_id: "",
    whaibot_key: "",
  });
  const [botUpdate, setBotUpdate] = useState<BotConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirm = useConfirm();

  const fetchBots = async () => {
    try {
      const response = await apiService.getConfigBots();
      const data = response.data.bots;
      
      if (data && !Array.isArray(data)) {
        // Si viene un solo objeto, lo convertimos en array
        setBots([data]);
      } else {
        setBots(data || []);
      }
    } catch (error) {
      console.error("Error al obtener bots", error);
      setBots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.createConfigBots(newBot);
      notify.success("Bot configurado correctamente.");
      setIsCreateOpen(false);
      setNewBot({
        whaibot_id: "",
        whaibot_key: "",
      });
      fetchBots();
    } catch (error) {
      console.error("Error al crear bot:", error);
      notify.error("No se pudo configurar el bot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (bot: BotConfig) => {
    setBotUpdate({ ...bot });
    setIsEditOpen(true);
  };

  const handleDelete = async (bot: BotConfig) => {
    const result = await confirm(
      "¿Eliminar configuración?",
      `El bot "${bot.whaibot_id}" será eliminado de este gimnasio.`,
      "warning"
    );

    if (result.isConfirmed && bot.id) {
      try {
        await apiService.deleteConfigBots(bot.id);
        notify.success("La configuración ha sido borrada con éxito.");
        fetchBots();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Error inesperado, intenta nuevamente";
          notify.error(message);
        } else {
          notify.error("Error inesperado, intenta nuevamente");
        }
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!botUpdate || !botUpdate.id) return;
    setIsSubmitting(true);
    try {
      const { whaibot_id, whaibot_key } = botUpdate!;
      await apiService.updateConfigBots(botUpdate!.id, {
        whaibot_id,
        whaibot_key,
      });
      notify.success("Bot actualizado correctamente.");
      setIsEditOpen(false);
      fetchBots();
    } catch (error) {
      console.error("Error al actualizar bot:", error);
      notify.error("No se pudo actualizar el bot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-center min-h-[200px]">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-teal-600 text-2xl animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 justify-start">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faRobot} className="text-teal-600" />
            Configuración de Bots
          </h2>
        </div>
        {bots.length === 0 && (
            <button
            onClick={() => setIsCreateOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Configurar Bot</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                #
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                ID del Bot
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                API Key
              </th>
              <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Creado el
              </th>
              <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                Acciones
              </th>
            </tr>
          </thead>
          {bots.length === 0 && (
              <tbody>
                <tr>
                    <td
                    colSpan={5}
                    className="px-6 py-10 whitespace-nowrap text-center text-gray-400 font-bold text-[15px]"
                    >
                    No hay bots configurados para este gimnasio.
                    </td>
                </tr>
              </tbody>
          )}
          {bots.length > 0 && (
            <tbody className="divide-y divide-gray-50">
            {bots.map((bot, index) => (
              <tr
                key={bot.id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-5 whitespace-nowrap text-gray-400 font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="font-bold text-gray-700">{bot.whaibot_id}</span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-bold text-xs">
                    ••••••••{bot.whaibot_key.slice(-4)}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-gray-500">
                    {bot.created_at ? new Date(bot.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(bot)}
                      className="cursor-pointer size-9 flex items-center justify-center rounded-xl border border-amber-200 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                      title="Editar Bot"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(bot)}
                      className="cursor-pointer size-9 flex items-center justify-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      title="Eliminar Bot"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
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
        {bots.length === 0 && (
          <div className="text-center font-bold text-gray-400 uppercase tracking-wider text-[13px] py-10">
            No hay bots configurados
          </div>
        )}
        {bots.map((bot) => (
          <div key={bot.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{bot.whaibot_id}</h3>
                <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-bold text-xs mt-2 inline-block">
                  Key: ••••••••{bot.whaibot_key.slice(-4)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-50 mt-2">
               <button
                  onClick={() => handleEdit(bot)}
                  className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-600 font-bold text-xs hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(bot)}
                  className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN */}
      {isEditOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditOpen(false)}
              className="cursor-pointer absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-800">Editar Bot</h3>
              <p className="text-sm text-gray-400 font-medium italic">
                Actualiza las credenciales de Whaibot.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    ID del Bot
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faIdBadge} className="text-xs" />
                    </span>
                    <input
                      type="text"
                      value={botUpdate?.whaibot_id || ""}
                      onChange={(e) =>
                        setBotUpdate((prev) =>
                          prev ? { ...prev, whaibot_id: e.target.value } : prev,
                        )
                      }
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    API Key del Bot
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faKey} className="text-xs" />
                    </span>
                    <input
                      type="text"
                      value={botUpdate?.whaibot_key || ""}
                      onChange={(e) =>
                        setBotUpdate((prev) =>
                          prev ? { ...prev, whaibot_key: e.target.value } : prev,
                        )
                      }
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="cursor-pointer flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cursor-pointer flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-white bg-teal-600 rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all"
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  ) : (
                    "Actualizar Bot"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="cursor-pointer absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-800">Configurar Bot</h3>
              <p className="text-sm text-gray-400 font-medium italic">
                Ingresa las credenciales de tu instancia de Whaibot.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleCreateBot}>
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    ID del Bot
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faIdBadge} className="text-xs" />
                    </span>
                    <input
                      type="text"
                      value={newBot.whaibot_id}
                      onChange={(e) =>
                        setNewBot({ ...newBot, whaibot_id: e.target.value })
                      }
                      placeholder="Ej: mi_bot_123"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    API Key del Bot
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <FontAwesomeIcon icon={faKey} className="text-xs" />
                    </span>
                    <input
                      type="text"
                      value={newBot.whaibot_key}
                      onChange={(e) =>
                        setNewBot({ ...newBot, whaibot_key: e.target.value })
                      }
                      placeholder="Ej: abc-123-key"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="cursor-pointer flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-white bg-teal-600 rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  ) : (
                    "Guardar Configuración"
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

export default BotsView;
