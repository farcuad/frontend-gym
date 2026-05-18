import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faIdCard,
  faPhone,
  faTimes,
  faSpinner,
  faCloudUploadAlt,
  faTrashAlt,
  faCamera
} from "@fortawesome/free-solid-svg-icons";
import { apiService, type Clients } from "../services/services";
import { uploadClientPhoto } from "../services/supabaseClient";
import { notify } from "../utils/toast";

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientToEdit?: Clients | null;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientToEdit,
}) => {
  const [formData, setFormData] = useState<Clients>({
    name: "",
    cedula: "",
    phone: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    activo: true,
    image: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        id: clientToEdit.id,
        name: clientToEdit.name || "",
        cedula: clientToEdit.cedula || "",
        phone: clientToEdit.phone || "",
        fecha_ingreso: clientToEdit.fecha_ingreso || new Date().toISOString().split("T")[0],
        activo: clientToEdit.activo ?? true,
        image: clientToEdit.image || "",
      });
      setPreviewUrl(clientToEdit.image || null);
      setSelectedFile(null);
    } else {
      setFormData({
        name: "",
        cedula: "",
        phone: "",
        fecha_ingreso: new Date().toISOString().split("T")[0],
        activo: true,
        image: "",
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.error("Por favor selecciona un archivo de imagen válido (JPG, PNG, etc.).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify.error("La imagen es demasiado grande. El tamaño máximo permitido es 5MB.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.cedula.trim() || !formData.phone.trim()) {
      notify.warning("Por favor completa todos los campos obligatorios.");
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl = formData.image;

      // Si el usuario seleccionó un nuevo archivo, lo subimos a Supabase
      if (selectedFile) {
        try {
          finalImageUrl = await uploadClientPhoto(selectedFile, formData.cedula);
        } catch (uploadErr: any) {
          notify.error(`Error al subir la foto: ${uploadErr.message}`);
          setIsLoading(false);
          return;
        }
      }

      const payload: Clients = {
        ...formData,
        image: finalImageUrl,
      };

      if (clientToEdit && clientToEdit.id) {
        await apiService.updateClient(clientToEdit.id, payload);
        notify.success("Cliente actualizado correctamente.");
      } else {
        await apiService.createClient(payload);
        notify.success("Cliente creado correctamente.");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al guardar cliente:", error);
      const errorMessage = error.response?.data?.message || "No se pudo guardar la información del cliente.";
      notify.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/50 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Encabezado con gradiente premium */}
        <div className="bg-linear-to-r from-teal-600 to-teal-500 px-8 py-6 text-white flex justify-between items-center shadow-md">
          <div>
            <h3 className="text-2xl font-black tracking-wide flex items-center gap-3">
              <FontAwesomeIcon icon={faUser} className="text-teal-200" />
              {clientToEdit ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>
            <p className="text-teal-100 text-xs mt-1 font-medium">
              {clientToEdit ? "Modifica los datos y la fotografía del cliente" : "Registra un nuevo cliente con su fotografía"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer size-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
            title="Cerrar"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Cuerpo del formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[80vh]">
          {/* Zona de Subida de Foto (Drag & Drop) */}
          <div className="flex flex-col items-center justify-center">
            <label className="block text-sm font-bold text-gray-700 mb-3 self-start">
              Fotografía del Client
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
              accept="image/*"
              className="hidden"
              id="client-photo-upload"
            />

            {previewUrl ? (
              <div className="relative size-40 rounded-full ring-4 ring-teal-500/20 shadow-xl overflow-hidden group transition-all hover:ring-teal-500/40 mx-auto">
                <img
                  src={previewUrl}
                  alt="Previsualización"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faCamera} /> Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="cursor-pointer px-3 py-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-teal-500 bg-teal-50/60 scale-102"
                    : "border-gray-200 bg-gray-50/50 hover:border-teal-500 hover:bg-teal-50/20"
                }`}
              >
                <div className="size-16 rounded-2xl bg-teal-100/50 flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="text-3xl" />
                </div>
                <p className="text-sm font-bold text-gray-700 text-center mb-1">
                  Arrastra y suelta la foto aquí
                </p>
                <p className="text-xs text-gray-400 text-center mb-3">
                  o haz clic para explorar en tu dispositivo
                </p>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                  PNG, JPG hasta 5MB
                </span>
              </div>
            )}
          </div>

          {/* Campos de texto */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                  <FontAwesomeIcon icon={faUser} className="text-xs" />
                </span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Juan Pérez"
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Cédula *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faIdCard} className="text-xs" />
                  </span>
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    placeholder="Ej. 12345678"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Teléfono *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                    <FontAwesomeIcon icon={faPhone} className="text-xs" />
                  </span>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej. 04141234567"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer flex-1 px-6 py-4 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer flex-1 px-6 py-4 text-sm font-bold text-white bg-teal-600 rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg" />
                  <span>Guardando cliente...</span>
                </>
              ) : (
                <span>{clientToEdit ? "Actualizar Cliente" : "Guardar Cliente"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
