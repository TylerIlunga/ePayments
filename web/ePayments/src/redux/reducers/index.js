import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import productReducer from './product';
import profileReducer from './profile';
import paymentAccountReducer from './paymentAccount';
import toastReducer from './toast';
import transactionReducer from './transaction';
import userReducer from './user';

const rootReducer = (history) =>
  combineReducers({
    product: productReducer,
    profile: profileReducer,
    paymentAccount: paymentAccountReducer,
    router: connectRouter(history),
    toast: toastReducer,
    transaction: transactionReducer,
    user: userReducer,
  });

export default rootReducer;
