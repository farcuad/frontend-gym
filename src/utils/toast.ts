import { useGlassAlert } from 'glass-alert-animation';
import { useEffect } from 'react';

let alertFire: any = null;

export const GlassAlertBridge = () => {
  const { fire } = useGlassAlert();

  useEffect(() => {
    alertFire = fire;
  }, [fire]);

  return null;
};

export const notify = {
  success: (msg: string) => {
    if (alertFire) {
      alertFire({
        title: msg,
        toast: true,
        position: 'bottom-end',
        timer: 3000,
        timerProgressBar: true,
        icon: 'success',
        glassColor: '#1ced50',
        animation: 'liquid'
      });
    }
  },
  error: (msg: string) => {
    if (alertFire) {
      alertFire({
        title: msg,
        toast: true,
        position: 'top-end',
        timer: 3000,
        timerProgressBar: true,
        icon: 'error',
        glassColor: '#ff0000',
        animation: 'liquid'
      });
    }
  },
  info: (msg: string) => {
    if (alertFire) {
      alertFire({
        title: msg,
        toast: true,
        position: 'top-end',
        timer: 3000,
        timerProgressBar: true,
        icon: 'info',
        glassColor: '#ffe900',
        animation: 'liquid'
      });
    }
  },
  warning: (msg: string) => {
    if (alertFire) {
      alertFire({
        title: msg,
        toast: true,
        position: 'top-end',
        timer: 3000,
        timerProgressBar: true,
        icon: 'warning',
        glassColor: '#ff0000',
        animation: 'liquid'
      });
    }
  },
};

// Hook para diálogos que requieren confirmación (async)
export const useConfirm = () => {
  const { fire } = useGlassAlert();
  
  const confirm = async (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'warning') => {
    return await fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      glassColor: '#6366f1',
      animation: 'liquid'
    });
  };

  return confirm;
};

export const useAlert = () => {
  const { fire } = useGlassAlert();
  return { fire };
};
