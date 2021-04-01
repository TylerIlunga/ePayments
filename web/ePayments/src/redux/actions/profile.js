import { CLEAR_PROFILE, UPDATE_PROFILE } from '../constants';

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
