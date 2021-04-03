import { toast } from 'react-toastify';

const utils = {
  displayToastMessage(type, message) {
    // Types: (https://github.com/fkhadra/react-toastify#toast)
    console.log('displayToastMessage()', type, message);
    toast[type](message, {
      autoClose: 4000,
      position: toast.POSITION.BOTTOM_LEFT,
    });
  },
};

export default utils;
