import { CLEAR_TRANSACTION, UPDATE_TRANSACTION } from '../constants';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_TRANSACTION:
      return {
        ...state,
        [action.key]: action.value,
      };
    case CLEAR_TRANSACTION:
      return {};
    default:
      return state;
  }
};

export default reducer;
