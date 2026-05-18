import { createClient } from '@supabase/supabase-js';

// Obtenemos las credenciales de Supabase desde las variables de entorno de Vite.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Comprime una imagen en el navegador antes de subirla usando HTML5 Canvas (Sin librerías externas).
 * Reduce imágenes de 5MB+ a unos ~100KB en milisegundos.
 */
const compressImageHelper = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Si falla la compresión, devolvemos el archivo original
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

/**
 * Sube la foto de un socio al bucket 'clients' de Supabase Storage de forma ultra optimizada.
 * @param file Archivo de imagen seleccionado.
 * @param cedula Cédula del cliente para generar un nombre de archivo único.
 * @returns Promesa con la URL pública directa (optimizada) de la imagen en Supabase.
 */
export const uploadClientPhoto = async (file: File, cedula: string): Promise<string> => {
  if (!file) {
    throw new Error('No se proporcionó ningún archivo para subir.');
  }
  if (!cedula) {
    throw new Error('Se requiere la cédula del cliente para identificar la imagen.');
  }

  try {
    // 1. Comprimir la imagen localmente antes de subirla (Súper rápido)
    const compressedFile = await compressImageHelper(file, 800, 800, 0.8);

    // 2. Generar un nombre de archivo único combinando la cédula y un timestamp
    const fileName = `${cedula}-${Date.now()}.jpg`; // Forzamos .jpg por la compresión

    // 3. Subir el archivo comprimido al bucket 'clients'
    const { error } = await supabase.storage
      .from('clients')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Error de Supabase al subir la imagen:', error);
      throw new Error(error.message);
    }

    // 4. Obtener la URL pública con Image Transformations de Supabase (CDN optimizado)
    const { data } = supabase.storage
      .from('clients')
      .getPublicUrl(fileName, {
        transform: {
          width: 400,
          height: 400,
          resize: 'cover',
          quality: 80,
        },
      });

    return data.publicUrl;
  } catch (error: any) {
    console.error('Error en uploadClientPhoto:', error);
    throw new Error(error.message || 'Error al subir la foto del cliente a Supabase.');
  }
};

