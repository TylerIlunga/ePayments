import { CLEAR_PAYMENT_ACCOUNT, UPDATE_PAYMENT_ACCOUNT } from '../constants';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PAYMENT_ACCOUNT:
      return {
        ...state,
        [action.key]: action.value,
      };
    case CLEAR_PAYMENT_ACCOUNT:
      return {};
    default:
      return state;
  }
};

export default reducer;
