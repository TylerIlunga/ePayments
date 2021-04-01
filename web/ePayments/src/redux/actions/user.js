import { CLEAR_USER, UPDATE_USER } from '../constants';

export const updateUser = ({ key, value }) => {
  return {
    key,
    value,
    type: UPDATE_USER,
  };
};

export const clearUser = () => {
  return { type: CLEAR_USER };
};
