import config from '../config';

class UserService {
  constructor(jwtSessionToken = '') {
    this.url = process.env.REACT_APP_EPAYMENTS_USER_SERVICE_URL;
    this.networkRequest = config.networkRequest;
    this.jwtSessionToken = jwtSessionToken;
  }

  activateAccount(activationData) {
    const { email, activationToken } = activationData;
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/activateAccount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, activationToken }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('activateAccount() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('activateAccount() error:', error);
          reject(error);
        });
    });
  }

  forgotPassword(userData) {
    const { email } = userData;
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/forgotPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('forgotPassword() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('forgotPassword() error:', error);
          reject(error);
        });
    });
  }

  resetPassword(resetData) {
    const { email, resetPasswordToken, newPassword } = resetData;
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/resetPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetPasswordToken,
          newPassword,
        }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('resetPassword() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('resetPassword() error:', error);
          reject(error);
        });
    });
  }
}

export default UserService;
