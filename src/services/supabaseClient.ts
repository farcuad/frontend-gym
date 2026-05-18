import { createClient } from '@supabase/supabase-js';

// Obtenemos las credenciales de Supabase desde las variables de entorno de Vite.
// Se proporcionan valores de respaldo explicativos para evitar fallos de inicialización en desarrollo.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sube la foto de un socio al bucket 'clients' de Supabase Storage.
 * @param file Archivo de imagen seleccionado.
 * @param cedula Cédula del cliente para generar un nombre de archivo único.
 * @returns Promesa con la URL pública directa de la imagen en Supabase.
 */
export const uploadClientPhoto = async (file: File, cedula: string): Promise<string> => {
  if (!file) {
    throw new Error('No se proporcionó ningún archivo para subir.');
  }
  if (!cedula) {
    throw new Error('Se requiere la cédula del cliente para identificar la imagen.');
  }

  try {
    // Generar un nombre de archivo único combinando la cédula y un timestamp
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${cedula}-${Date.now()}.${fileExtension}`;

    // Subir el archivo al bucket 'clients'
    const { error } = await supabase.storage
      .from('clients')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Error de Supabase al subir la imagen:', error);
      throw new Error(error.message);
    }

    // Obtener y retornar la publicUrl de Supabase
    const { data } = supabase.storage
      .from('clients')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error: any) {
    console.error('Error en uploadClientPhoto:', error);
    throw new Error(error.message || 'Error al subir la foto del cliente a Supabase.');
  }
};
