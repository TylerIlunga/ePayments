import React from 'react';
import { connect } from 'react-redux';
import { persistor, history } from '../../redux/store';
import { withCookies } from 'react-cookie';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// AuthView
import AuthView from '../../containers/AuthView';

// CreateProfileView
import CreateProfileView from '../../containers/CreateProfileView';

// ConnectPaymentAccopersistoruntView
import ConnectPaymentAccountView from '../../containers/ConnectPaymentAccountView';

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

const handleProtectedRoutes = (history, props, cookies, Component) => {
  console.log('cookies:', cookies, props.router.location, history);
  const sessionExists =
    props.router.location &&
    props.router.location.state &&
    props.router.location.state.session;

  if (
    !sessionExists &&
    !(cookies && cookies.ut !== undefined && cookies.ut !== null)
  ) {
    persistor.purge();
    return <AuthView {...history} {...props} />;
  }
  if (props.router.location.pathname === '/profile/create' && !props.user.id) {
    return <AuthView {...history} {...props} />;
  }
  if (
    props.router.location.pathname === '/payments/connect' &&
    (!props.user.id || !props.profile.id)
  ) {
    return <AuthView {...history} {...props} />;
  }
  if (props.router.location.pathname === '/') {
    return <TransactionsView {...history} {...props} />;
  }
  return <Component {...history} {...props} />;
};

const Router = (props) => {
  return (
    <ConnectedRouter history={history}>
      <div className='main'>
        <Switch>
          <Route
            path='/'
            component={(h) =>
              handleProtectedRoutes(h, props, props.allCookies, AuthView)
            }
            exact
          />
          <Route
            path='/profile/create'
            component={(h) =>
              handleProtectedRoutes(
                h,
                props,
                props.allCookies,
                CreateProfileView,
              )
            }
            exact
          />
          <Route
            path='/payments/connect'
            component={(h) =>
              handleProtectedRoutes(
                h,
                props,
                props.allCookies,
                ConnectPaymentAccountView,
              )
            }
            exact
          />
          <Route
            path='/h/transactions'
            component={(h) =>
              handleProtectedRoutes(
                h,
                props,
                props.allCookies,
                TransactionsView,
              )
            }
            exact
          />
          <Route
            path='/h/products*'
            component={(h) =>
              handleProtectedRoutes(h, props, props.allCookies, ProductsView)
            }
            exact
          />
          <Route
            path='/h/checkout*'
            component={(h) =>
              handleProtectedRoutes(h, props, props.allCookies, CheckoutView)
            }
          />
          <Route
            path='/h/analytics*'
            component={(h) =>
              handleProtectedRoutes(h, props, props.allCookies, AnalyticsView)
            }
          />
          <Route
            path='/h/settings*'
            component={(h) =>
              handleProtectedRoutes(h, props, props.allCookies, SettingsView)
            }
          />
          <Route component={PageNotFoundView} />
        </Switch>
        <ToastContainer />
      </div>
    </ConnectedRouter>
  );
};

const mapStateToProps = (state) => ({
  router: state.router,
  profile: state.profile,
  user: state.user,
});

export default withCookies(connect(mapStateToProps, null)(Router));
