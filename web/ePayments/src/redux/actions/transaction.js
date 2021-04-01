import { CLEAR_TRANSACTION, UPDATE_TRANSACTION } from '../constants';

export const updateTransaction = ({ key, value }) => {
  return {
    key,
    value,
    type: UPDATE_TRANSACTION,
  };
};

export const clearTransaction = () => {
  return { type: CLEAR_TRANSACTION };
};
