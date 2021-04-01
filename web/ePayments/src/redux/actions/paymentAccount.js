import { CLEAR_PAYMENT_ACCOUNT, UPDATE_PAYMENT_ACCOUNT } from '../constants';

export const updatePaymentAccount = ({ key, value }) => {
  return {
    key,
    value,
    type: UPDATE_PAYMENT_ACCOUNT,
  };
};

export const clearPaymentAccount = () => {
  return { type: CLEAR_PAYMENT_ACCOUNT };
};
