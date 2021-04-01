import { CLEAR_TOAST, UPDATE_TOAST } from '../constants';

export const updateToast = (toast) => {
  return {
    type: UPDATE_TOAST,
    title: toast.title,
    data: toast.data,
  };
};

export const clearToast = () => {
  return { type: CLEAR_TOAST };
};
