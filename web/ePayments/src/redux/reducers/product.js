import { CLEAR_PRODUCT, UPDATE_PRODUCT } from '../constants';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PRODUCT:
      return {
        ...state,
        [action.key]: action.value,
      };
    case CLEAR_PRODUCT:
      return {};
    default:
      return state;
  }
};

export default reducer;
