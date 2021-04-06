import config from '../config';

class BusinessProductService {
  constructor() {
    this.url = process.env.REACT_APP_EPAYMENTS_BUSINESS_PRODUCT_SERVICE_URL;
    this.networkRequest = config.networkRequest;
  }

  listProducts(queryData) {
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
          console.log('listProducts() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('listProducts() error:', error);
          reject(error);
        });
    });
  }

  updateProduct(newProductData) {
    return new Promise((resolve, reject) => {
      const { businessID, businessProductID, sku, updates } = newProductData;
      this.networkRequest(`${this.url}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessID, businessProductID, sku, updates }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('listProducts() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('listProducts() error:', error);
          reject(error);
        });
    });
  }
}

export default BusinessProductService;
