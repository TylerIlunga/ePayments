import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
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

const persistedReducer = persistReducer(
  {
    storage,
    key: 'root',
    whitelist: ['paymentAccount', 'profile', 'user'],
  },
  createRootReducer(history),
);

export const store = createStore(
  persistedReducer,
  initialState,
  compose(middleware),
);

export const persistor = persistStore(store);
