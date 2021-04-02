import React from 'react';
import { connect } from 'react-redux';
import { history } from '../../redux/store';
import { withCookies, useCookies } from 'react-cookie';
import { ConnectedRouter } from 'connected-react-router';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// AuthView
import AuthView from '../../containers/AuthView';

// CreateProfileView
import CreateProfileView from '../../containers/CreateProfileView';

// ConnectCoinbaseAccountView
import ConnectCoinbaseAccountView from '../../containers/ConnectCoinbaseAccountView';

// TransactionsView
import TransactionsView from '../../containers/TransactionsView';

// ProductsView
import ProductsView from '../../containers/ProductsView';

// CheckoutView
import CheckoutView from '../../containers/CheckoutView';

// AnalyticsView
import AnalyticsView from '../../containers/AnalyticsView';

// SettingsView
import SettingsView from '../../containers/SettingsView';

// 404 PageNotFound View
import PageNotFoundView from '../PageNotFoundView';

const handleProtectedRoutes = (history, props, cookieOpts, Component) => {
  const [cookies] = cookieOpts;
  if (!(cookies && cookies.ut !== undefined && cookies.ut !== null)) {
    return <AuthView {...history} {...props} />;
  }
  return <Component {...history} {...props} />;
};

const Router = (props) => {
  const cookieOpts = useCookies([]);
  return (
    <ConnectedRouter history={history}>
      <div className='main'>
        <Switch>
          <Route
            path='/'
            component={(h) =>
              handleProtectedRoutes(h, props, cookieOpts, AuthView)
            }
            exact
          />
          <Route
            path='/create/profile*'
            component={(h) =>
              handleProtectedRoutes(h, props, cookieOpts, CreateProfileView)
            }
            exact
          />
          <Route
            path='/connect/coinbase*'
            component={(h) =>
              handleProtectedRoutes(
                h,
                props,
                cookieOpts,
                ConnectCoinbaseAccountView,
              )
            }
            exact
          />
          <Route
            path='/h/transactions*'
            component={(h) =>
              handleProtectedRoutes(h, props, cookieOpts, TransactionsView)
            }
            exact
          />
          <Route
            path='/h/products*'
            component={(h) =>
              handleProtectedRoutes(h, props, cookieOpts, ProductsView)
            }
            exact
          />
          <Route
            path='/h/checkout*'
            component={(h) =>
              handleProtectedRoutes(h, props, cookieOpts, CheckoutView)
            }
          />
          <Route
            path='/h/analytics*'
            component={(h) =>
              handleProtectedRoutes(h, props, cookieOpts, AnalyticsView)
            }
          />
          <Route
            path='/h/settings*'
            component={(h) =>
              handleProtectedRoutes(h, props, cookieOpts, SettingsView)
            }
          />
          <Route component={PageNotFoundView} />
        </Switch>
        <ToastContainer />
      </div>
    </ConnectedRouter>
  );
};

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default withCookies(
  connect(mapStateToProps, mapDispatchToProps)(Router),
);
