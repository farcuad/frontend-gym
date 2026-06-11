import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrashAlt,
  faRobot,
  faKey,
  faIdBadge,
  faTimes,
  faSpinner,
  faCheckCircle,
  faPlug,
} from "@fortawesome/free-solid-svg-icons";
import { notify, useConfirm } from "../utils/toast";
import { apiService } from "../services/services";
import type { BotConfig } from "../services/services";
import axios from 'axios';
import { useQuery, useQueryClient } from "@tanstack/react-query";

const BotsView: React.FC = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBot, setNewBot] = useState<BotConfig>({
    whaibot_id: "",
    whaibot_key: "",
  });
  const [botUpdate, setBotUpdate] = useState<BotConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { data: bots = [], isLoading: loading } = useQuery<BotConfig[]>({
    queryKey: ['bots'],
    queryFn: async () => {
      try {
        const response = await apiService.getConfigBots();
        const data = response.data.bots;
        if (data && !Array.isArray(data)) {
          return [data];
        }
        return data || [];
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    retry: false,
  });

  const activeBot = bots.length > 0 ? bots[0] : null;

  const refetchBots = () => queryClient.invalidateQueries({ queryKey: ['bots'] });

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.createConfigBots(newBot);
      notify.success("Whaibot configurado correctamente.");
      setIsCreateOpen(false);
      setNewBot({
        whaibot_id: "",
        whaibot_key: "",
      });
      refetchBots();
    } catch (error) {
      console.error("Error al crear bot:", error);
      notify.error("No se pudo configurar Whaibot.");
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
      "¿Desconectar Whaibot?",
      `La configuración de "${bot.whaibot_id}" será eliminada y dejarán de enviarse mensajes por WhatsApp.`,
      "warning"
    );

    if (result.isConfirmed && bot.id) {
      try {
        await apiService.deleteConfigBots(bot.id);
        notify.success("Whaibot desconectado correctamente.");
        refetchBots();
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
    if (!botUpdate || !botUpdate.id) return;
    setIsSubmitting(true);
    try {
      const { whaibot_id, whaibot_key } = botUpdate!;
      await apiService.updateConfigBots(botUpdate!.id, {
        whaibot_id,
        whaibot_key,
      });
      notify.success("Configuración de Whaibot actualizada.");
      setIsEditOpen(false);
      refetchBots();
    } catch (error) {
      console.error("Error al actualizar bot:", error);
      notify.error("No se pudo actualizar la configuración.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-800 rounded-[2.5rem] border border-gray-800 shadow-sm flex items-center justify-center min-h-[200px]">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-teal-600 text-2xl animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-[2.5rem] border border-gray-800 shadow-sm">
      <div className="flex items-center gap-2 mb-8">
        <FontAwesomeIcon icon={faRobot} className="text-teal-600 text-xl" />
        <h2 className="text-xl font-black text-gray-200">Configuraciones</h2>
      </div>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Whaibot Card */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-5 flex flex-col">
          <div className="flex items-start gap-4">
            <div className="size-12 min-w-[48px] rounded-2xl bg-gradient-to-br from-teal-600/20 to-teal-600/10 flex items-center justify-center border border-teal-600/20">
              <FontAwesomeIcon icon={faRobot} className="text-teal-600 text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-gray-200">Whaibot</h3>
                {activeBot && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-900/30 border border-teal-600/30 text-teal-600 text-[9px] font-bold uppercase tracking-wider">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-[7px]" />
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Notificaciones y recordatorios por WhatsApp para clientes.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Estado:{" "}
              {activeBot ? (
                <span className="text-teal-600">Conectado</span>
              ) : (
                <span className="text-gray-400">Inactivo</span>
              )}
            </span>
          </div>

          {activeBot && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => handleEdit(activeBot)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-xs transition-all"
              >
                <FontAwesomeIcon icon={faEdit} className="text-[10px]" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(activeBot)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-xs transition-all"
              >
                <FontAwesomeIcon icon={faTrashAlt} className="text-[10px]" />
                Desconectar
              </button>
            </div>
          )}

          {!activeBot && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg"
            >
              <FontAwesomeIcon icon={faPlug} />
              Configurar
            </button>
          )}
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {isEditOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gray-800 rounded-4xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditOpen(false)}
              className="cursor-pointer absolute top-6 right-6 text-gray-400 hover:text-gray-400 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-200">Editar Whaibot</h3>
              <p className="text-sm text-gray-400 font-medium italic">
                Actualiza las credenciales de tu instancia de Whaibot.
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
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
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
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="cursor-pointer flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-900 rounded-2xl hover:bg-gray-700 transition-all"
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
                    "Guardar Cambios"
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
          <div className="bg-gray-800 rounded-4xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="cursor-pointer absolute top-6 right-6 text-gray-400 hover:text-gray-400 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-200">Configurar Whaibot</h3>
              <p className="text-sm text-gray-400 font-medium italic">
                Ingresa las credenciales de tu instancia de Whaibot para activar
                los mensajes automáticos por WhatsApp.
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
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
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
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="cursor-pointer flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-900 rounded-2xl hover:bg-gray-700 transition-all"
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
                    "Activar Whaibot"
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
