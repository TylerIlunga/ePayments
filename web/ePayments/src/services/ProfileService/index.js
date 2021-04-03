import config from '../config';

class ProfileService {
  constructor() {
    this.url = process.env.REACT_APP_EPAYMENTS_API_URL;
    this.businessURL =
      process.env.REACT_APP_EPAYMENTS_BUSINESS_PROFILE_SERVICE_URL;
    this.customerURL =
      process.env.REACT_APP_EPAYMENTS_CUSTOMER_PROFILE_SERVICE_URL;
    this.networkRequest = config.networkRequest;
  }

  fetchProfile(userID) {
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/api/v1/profile/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID }),
      })
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

  createNewCustomerProfile(profileData) {
    const { profileImage, country, username, userID } = profileData;
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.customerURL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage, country, username, userID }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('createNewCustomerProfile() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('createNewCustomerProfile() error:', error);
          reject(error);
        });
    });
  }

  createNewBusinessProfile(profileData) {
    const {
      profileImage,
      address,
      phoneNumber,
      publicEmail,
      userID,
    } = profileData;
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.businessURL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileImage,
          address,
          phoneNumber,
          publicEmail,
          userID,
        }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('createNewBusinessProfile() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('createNewBusinessProfile() error:', error);
          reject(error);
        });
    });
  }

  updateCustomerProfile(profileData) {
    const { userID, profileID, updates } = profileData;
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.customerURL}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, profileID, updates }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('updateCustomerProfile() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('updateCustomerProfile() error:', error);
          reject(error);
        });
    });
  }

  updateBusinessProfile(profileData) {
    const { userID, profileID, updates } = profileData;
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.businessURL}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, profileID, updates }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('updateBusinessProfile() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('updateBusinessProfile() error:', error);
          reject(error);
        });
    });
  }
}

export default ProfileService;
