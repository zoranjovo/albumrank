import { toast, Slide } from 'react-toastify';

export const notify = (type: string, msg: string) => {
  if(type == 'warn'){
    toast.warn(msg, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Slide,
    });
  } else if(type == 'success'){
    toast.success(msg, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Slide,
    });
  } else if(type == 'error'){
    toast.error(msg, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Slide,
    });
  } else {
    console.error('invalid notification type provided')
  }
}