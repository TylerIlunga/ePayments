import config from '../config';

class BusinessTransactionService {
  constructor(jwtSessionToken = '') {
    this.url = process.env.REACT_APP_EPAYMENTS_BUSINESS_TRANSACTION_SERVICE_URL;
    this.networkRequest = config.networkRequest;
    this.jwtSessionToken = jwtSessionToken;
  }

  listTransactions(queryData) {
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryData),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('fetchTransactions() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('fetchTransactions() error:', error);
          reject(error);
        });
    });
  }

  createNewTransaction(transactionData) {
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('createNewTransaction() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('createNewTransaction() error:', error);
          reject(error);
        });
    });
  }
}

export default BusinessTransactionService;
