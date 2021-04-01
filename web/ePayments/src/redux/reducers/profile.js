import { CLEAR_PROFILE, UPDATE_PROFILE } from '../constants';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PROFILE:
      return {
        ...state,
        [action.key]: action.value,
      };
    case CLEAR_PROFILE:
      return {};
    default:
      return state;
  }
};

export default reducer;
