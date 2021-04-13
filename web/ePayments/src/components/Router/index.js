import React from 'react';
import { connect } from 'react-redux';
import { history } from '../../redux/store';
import { withCookies, useCookies } from 'react-cookie';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// AuthView
import AuthView from '../../containers/AuthView';

// CreateProfileView
import CreateProfileView from '../../containers/CreateProfileView';

// ConnectPaymentAccountView
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

const handleProtectedRoutes = (history, props, cookieOpts, Component) => {
  // TODO: Use props.allCookies instead of cookieOpts?
  const [cookies] = cookieOpts;
  // const sessionExists =
  //   props.router.location !== undefined ||
  //   props.router.location.state !== undefined ||
  //   props.router.location.state.session !== undefined ||
  //   !props.router.location.state.session;
  const sessionExists =
    props.router.location &&
    props.router.location.state &&
    props.router.location.state.session &&
    !props.router.location.state.session;
  // TODO: Make sure to set state.session to false for logging out...
  //   if (
  //     !(
  //       sessionExists ||
  //       (cookies && cookies.ut !== undefined && cookies.ut !== null)
  //     )
  //   ) {
  //     return <AuthView {...history} {...props} />;
  //   }
  //   if (history.location.pathname === '/') {
  //     // TODO: Make sure to check in "ComponentDidMount" that valid user data exists in our global (user) redux store
  //     return <TransactionsView />;
  //   }
  return <Component {...history} {...props} />;
};

const Router = (props) => {
  const cookieOpts = useCookies(['ut']);
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
            path='/profile/create*'
            component={(h) =>
              handleProtectedRoutes(h, props, cookieOpts, CreateProfileView)
            }
            exact
          />
          <Route
            path='/payments/connect*'
            component={(h) =>
              handleProtectedRoutes(
                h,
                props,
                cookieOpts,
                ConnectPaymentAccountView,
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

const mapStateToProps = (state) => ({
  router: state.router,
});
const mapDispatchToProps = (dispatch) => ({});

export default withCookies(
  connect(mapStateToProps, mapDispatchToProps)(Router),
);
