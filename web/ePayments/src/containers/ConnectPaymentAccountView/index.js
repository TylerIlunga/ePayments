import React from 'react';
import { connect } from 'react-redux';
import { setPaymentAccount } from '../../redux/actions/paymentAccount';
import PaymentAccountService from '../../services/PaymentAccountService';
import toastUtils from '../../utils/Toasts';
import './index.css';

class ConnectPaymentAccountView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.PaymentAccountService = new PaymentAccountService();
    this.displayToastMessage = toastUtils.displayToastMessage;
    this.windowOAuthCBMessageHandler = this.windowOAuthCBMessageHandler.bind(
      this,
    );
    this.startCoinbaseOAuth = this.startCoinbaseOAuth.bind(this);
  }

  componentDidMount() {
    window.addEventListener('message', this.windowOAuthCBMessageHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.windowOAuthCBMessageHandler);
  }

  isJSON(object) {
    try {
      JSON.parse(object);
    } catch (e) {
      return false;
    }
    return true;
  }

  windowOAuthCBMessageHandler(message) {
    console.log('windowOAuthCBMessageHandler() message', message);
    if (!this.isJSON(message.data)) {
      return;
    }
    try {
      const messageJson = JSON.parse(message.data);
      console.log('messageJson:', messageJson);
      if (!messageJson.success) {
        throw '!messageJSON.success';
      }
      if (messageJson.paymentAccount) {
        this.displayToastMessage('success', 'Success');
        this.props.dispatchSetPaymentAccount(messageJson.paymentAccount);
        this.props.history.replace('/h/transactions');
      }
    } catch (error) {
      console.log('windowOAuthCBMessageHandler() error:', error);
      this.displayToastMessage('error', 'Failed to connect: Please try again');
    }
  }

  startCoinbaseOAuth(evt) {
    evt.preventDefault();
    this.PaymentAccountService.fetchCoinbaseOauthLink({
      userID: this.props.user.id,
      email: this.props.user.email,
      profileID: this.props.profile.id,
      replaceAccount: false,
    })
      .then((res) => {
        console.log(
          'startCoinbaseOAuth(), this.PaymentAccountService.fetchCoinbaseOauthLink res',
          res,
        );
        if (res.error) {
          throw res.error;
        }
        // NOTE: popup window to handle OAUTH
        window.open(
          res.authURL,
          'coinbase oauth',
          'height=777,width=777,modal=yes,alwaysRaised=ye',
        );
      })
      .catch((error) => {
        console.log('startCoinbaseOAuth error:', error);
        if (typeof error !== 'string') {
          error = 'Failed to connect: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  render() {
    return (
      <div className='MainConnectPAViewContainer'>
        <div className='MainConnectPAViewRow row'>
          <div className='MainConnectPAViewHeader row'>
            <p>Select a payment service:</p>
          </div>
          <div className='MainConnectPAViewOptionsContainer row'>
            <div
              className='MainConnectPAViewOptionButton'
              onClick={this.startCoinbaseOAuth}
            >
              <p>Coinbase</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  profile: state.profile,
  paymentAccount: state.paymentAccount,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetPaymentAccount: (paymentAccount) =>
    dispatch(setPaymentAccount(paymentAccount)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConnectPaymentAccountView);
