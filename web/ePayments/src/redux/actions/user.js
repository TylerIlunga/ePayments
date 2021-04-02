import { CLEAR_USER, SET_USER, UPDATE_USER } from '../constants';

export const setUser = (userData) => {
  return {
    user: userData,
    type: SET_USER,
  };
};

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
