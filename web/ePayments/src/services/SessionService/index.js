import config from '../config';

class SessionService {
  constructor(jwtSessionToken = '') {
    this.url = process.env.REACT_APP_EPAYMENTS_SESSION_SERVICE_URL;
    this.networkRequest = config.networkRequest;
    this.jwtSessionToken = jwtSessionToken;
  }

  signUp(userData) {
    const { email, password } = userData;
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('signUp() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('signUp() error:', error);
          reject(error);
        });
    });
  }

  logIn(userData) {
    const { email, password } = userData;
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('login() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('login() error:', error);
          reject(error);
        });
    });
  }

  fetchUserSessionData() {
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/fetch/user`)
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('fetchUserSessionData() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('fetchUserSessionData() error:', error);
          reject(error);
        });
    });
  }

  logOut() {
    return new Promise((resolve, reject) => {
      this.networkRequest(`${this.url}/logout`, {}, 'text')
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log('logout() res.data:', res.data);
          resolve(res.data);
        })
        .catch((error) => {
          console.log('logout() error:', error);
          reject(error);
        });
    });
  }
}

export default SessionService;
