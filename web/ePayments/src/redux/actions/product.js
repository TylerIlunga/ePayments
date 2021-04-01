import { CLEAR_PRODUCT, UPDATE_PRODUCT } from '../constants';

export const updateProduct = ({ key, value }) => {
  return {
    key,
    value,
    type: UPDATE_PRODUCT,
  };
};

export const clearProduct = () => {
  return { type: CLEAR_PRODUCT };
};
