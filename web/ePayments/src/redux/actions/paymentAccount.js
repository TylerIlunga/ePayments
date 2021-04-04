import {
  CLEAR_PAYMENT_ACCOUNT,
  UPDATE_PAYMENT_ACCOUNT,
  SET_PAYMENT_ACCOUNT,
} from '../constants';

export const setPaymentAccount = (paymentAccountData) => {
  return {
    paymentAccount: paymentAccountData,
    type: SET_PAYMENT_ACCOUNT,
  };
};

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
