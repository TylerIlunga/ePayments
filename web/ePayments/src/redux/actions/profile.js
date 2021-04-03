import { CLEAR_PROFILE, UPDATE_PROFILE, SET_PROFILE } from '../constants';

export const setProfile = (profile) => {
  return {
    profile,
    type: SET_PROFILE,
  };
};

export const updateProfile = ({ key, value }) => {
  return {
    key,
    value,
    type: UPDATE_PROFILE,
  };
};

export const clearProfile = () => {
  return { type: CLEAR_PROFILE };
};
