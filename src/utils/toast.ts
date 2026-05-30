import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const SwalDark = Swal.mixin({
  background: '#1f2937',
  color: '#f3f4f6',
  confirmButtonColor: '#00a884',
  cancelButtonColor: '#374151',
  iconColor: '#00a884',
  customClass: {
    popup: 'swal2-dark-popup',
  },
});

export const notify = {
  success: (msg: string) => {
    toast.success(msg, {
      position: 'bottom-right',
      autoClose: 3000,
    });
  },
  error: (msg: string) => {
    toast.error(msg, {
      position: 'top-right',
      autoClose: 3000,
    });
  },
  info: (msg: string) => {
    toast.info(msg, {
      position: 'top-right',
      autoClose: 3000,
    });
  },
  warning: (msg: string) => {
    toast.warning(msg, {
      position: 'top-right',
      autoClose: 3000,
    });
  },
};

export const useConfirm = () => {
  const confirm = async (
    title: string,
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'warning'
  ) => {
    return await SwalDark.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });
  };

  return confirm;
};

export const useAlert = () => {
  const fire = async (options: Record<string, unknown>) => {
    return await SwalDark.fire(options);
  };

  return { fire };
};
