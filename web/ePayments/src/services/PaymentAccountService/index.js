import config from '../config';

class PaymentAccountService {
  constructor() {
    this.url = process.env.REACT_APP_EPAYMENTS_PAYMENT_ACCOUNT_SERVICE_URL;
    this.networkRequest = config.networkRequest;
  }

  fetchCoinbaseOauthLink(userData) {
    return new Promise((resolve, reject) => {
      const { userID, email, profileID } = userData;
      this.networkRequest(
        `${this.url}/create/start?userID=${userID}&email=${email}&profileID=${profileID}`,
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
}

export default PaymentAccountService;
