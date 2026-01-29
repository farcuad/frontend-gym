import { toast, type ToastOptions } from 'react-toastify';

const config: ToastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

export const notify = {
    success: (msg: string) => toast.success(msg, config),
    error: (msg: string) => toast.error(msg, config),
    info: (msg: string) => toast.info(msg, config),
    warning: (msg: string) => toast.warning(msg, config),
};