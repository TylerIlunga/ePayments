import config from '../config';

class PaymentAccountService {
  constructor(jwtSessionToken = '') {
    this.url = process.env.REACT_APP_EPAYMENTS_PAYMENT_ACCOUNT_SERVICE_URL;
    this.networkRequest = config.networkRequest;
    this.jwtSessionToken = jwtSessionToken;
  }

  fetchPaymentAccount(userData) {
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('fetchPaymentAccount() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('fetchPaymentAccount() error:', error);
          reject(error);
        });
    });
  }

  fetchCoinbaseOauthLink(userData) {
    return new Promise((resolve, reject) => {
      const { userID, email, profileID, replaceAccount } = userData;
      this.networkRequest(
        `${this.url}/create/start?userID=${userID}&email=${email}&profileID=${profileID}&replaceAccount=${replaceAccount}`,
      )
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('fetchProfile() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('fetchProfile() error:', error);
          reject(error);
        });
    });
  }

  toggleAutoConvertToFiatFeature(paymentAccountData) {
    return new Promise((resolve, reject) => {
      console.log('paymentAccountData:', paymentAccountData);
      this.networkRequest(`${this.url}/conversion/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentAccountData),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('toggleAutoConvertToFiatFeature() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('toggleAutoConvertToFiatFeature() error:', error);
          reject(error);
        });
    });
  }
}

export default PaymentAccountService;
