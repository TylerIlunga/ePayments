import { UPDATE_USER, CLEAR_USER, SET_USER } from '../constants';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return action.user;
    case UPDATE_USER:
      return {
        ...state,
        [action.key]: action.value,
      };
    case CLEAR_USER:
      return {};
    default:
      return state;
  }
};

export default reducer;
