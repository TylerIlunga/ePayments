import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import createRootReducer from '../reducers';

export const history = createBrowserHistory();

const initialState = {};
const loggerMiddleware = createLogger();

let middleware = applyMiddleware(
  routerMiddleware(history),
  thunk,
  loggerMiddleware,
);

if (process.env.NODE_ENV !== 'development') {
  middleware = applyMiddleware(routerMiddleware(history), thunk);
}

const store = createStore(
  createRootReducer(history),
  initialState,
  compose(middleware),
);

export default store;
