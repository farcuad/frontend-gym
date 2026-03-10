import { toast, type ToastOptions } from "react-toastify";

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
  success: (msg: string, opts?: ToastOptions) =>
    toast.success(msg, { ...config, ...opts }),
  error: (msg: string, opts?: ToastOptions) =>
    toast.error(msg, { ...config, ...opts }),
  info: (msg: string, opts?: ToastOptions) =>
    toast.info(msg, { ...config, ...opts }),
  warning: (msg: string, opts?: ToastOptions) =>
    toast.warning(msg, { ...config, ...opts }),
};
