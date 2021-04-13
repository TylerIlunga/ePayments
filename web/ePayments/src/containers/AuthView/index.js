import React from 'react';
import { connect } from 'react-redux';
import { setUser } from '../../redux/actions/user';
import ProfileService from '../../services/ProfileService';
import SessionService from '../../services/SessionService';
import UserService from '../../services/UserService';
import toastUtils from '../../utils/Toasts';
import './index.css';

class AuthView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'signUp',
      signUpLogInForm: {
        email: '',
        password: '',
        confirmPassword: '',
        passwordPattern: /^[a-zA-Z0-9]{10,30}$/,
      },
      activateAccountForm: {
        email: '',
        activationToken: '',
      },
      forgotPasswordForm: { email: '' },
      resetPasswordForm: {
        email: '',
        resetPasswordToken: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        passwordPattern: /^[a-zA-Z0-9]{10,30}$/,
      },
    };

    this.SessionService = new SessionService();
    this.ProfileService = new ProfileService();
    this.UserService = new UserService();
    this.displayToastMessage = toastUtils.displayToastMessage;

    this.renderAuthFormContent = this.renderAuthFormContent.bind(this);
    this.renderSignUpView = this.renderSignUpView.bind(this);
    this.updateSignUpLogInForm = this.updateSignUpLogInForm.bind(this);
    this.updateActivateAccountForm = this.updateActivateAccountForm.bind(this);
    this.updateForgotPasswordForm = this.updateForgotPasswordForm.bind(this);
    this.updateResetPasswordForm = this.updateResetPasswordForm.bind(this);
    this.signNewUserUp = this.signNewUserUp.bind(this);
    this.logUserIn = this.logUserIn.bind(this);
    this.activateUsersAccount = this.activateUsersAccount.bind(this);
    this.sendResetPasswordToken = this.sendResetPasswordToken.bind(this);
    this.resetUsersPassword = this.resetUsersPassword.bind(this);
  }

  updateSignUpLogInForm(evt, field) {
    this.setState(
      {
        signUpLogInForm: {
          ...this.state.signUpLogInForm,
          [field]: evt.target.value,
        },
      },
      () => console.log('new signUpLogInForm:', this.state.signUpLogInForm),
    );
  }

  updateActivateAccountForm(evt, field) {
    this.setState(
      {
        activateAccountForm: {
          ...this.state.activateAccountForm,
          [field]: evt.target.value,
        },
      },
      () =>
        console.log('new activateAccountForm:', this.state.activateAccountForm),
    );
  }

  updateForgotPasswordForm(evt, field) {
    this.setState(
      {
        forgotPasswordForm: {
          ...this.state.forgotPasswordForm,
          [field]: evt.target.value,
        },
      },
      () =>
        console.log('new forgotPasswordForm:', this.state.forgotPasswordForm),
    );
  }

  updateResetPasswordForm(evt, field) {
    this.setState(
      {
        resetPasswordForm: {
          ...this.state.resetPasswordForm,
          [field]: evt.target.value,
        },
      },
      () => console.log('new resetPasswordForm:', this.state.resetPasswordForm),
    );
  }

  validInput(inputType) {
    if (inputType === 'signUp') {
      const {
        email,
        password,
        confirmPassword,
        passwordPattern,
      } = this.state.signUpLogInForm;
      if (!(email && password && confirmPassword)) {
        return { error: 'Please enter a value for each field.' };
      }
      if (password !== confirmPassword) {
        return { error: 'Password do not match.' };
      }
      if (!password.match(passwordPattern)) {
        return {
          error:
            'Password must 10-30 characters long containing letters or digits.',
        };
      }
    }

    if (inputType === 'logIn') {
      const { email, password } = this.state.signUpLogInForm;
      if (!(email && password)) {
        return { error: 'Please enter a value for each field.' };
      }
    }

    if (inputType === 'activateAccount') {
      const { email, activationToken } = this.state.activateAccountForm;
      if (!(email && activationToken)) {
        return { error: 'Please enter a value for each field.' };
      }
    }

    if (inputType === 'forgotPassword') {
      if (!this.state.forgotPasswordForm.email) {
        return { error: 'Please enter a value for the email field.' };
      }
    }

    if (inputType === 'resetPassword') {
      const {
        email,
        resetPasswordToken,
        oldPassword,
        newPassword,
        confirmPassword,
        passwordPattern,
      } = this.state.resetPasswordForm;
      if (
        !(
          email &&
          resetPasswordToken &&
          oldPassword &&
          newPassword &&
          confirmPassword
        )
      ) {
        return { error: 'Please enter a value for each field.' };
      }
      if (newPassword !== confirmPassword) {
        return { error: 'Password do not match.' };
      }
      if (!newPassword.match(passwordPattern)) {
        return {
          error:
            'Password must 10-30 characters long containing letters or digits.',
        };
      }
    }

    return { error: null };
  }

  signNewUserUp(evt) {
    evt.preventDefault();

    const inputValidationResult = this.validInput('signUp');
    if (inputValidationResult.error) {
      return this.displayToastMessage('error', inputValidationResult.error);
    }

    this.displayToastMessage('info', 'Loading...');

    this.SessionService.signUp(this.state.signUpLogInForm)
      .then((res) => {
        console.log('signNewUserUp(), this.SessionService.signUp() res', res);
        if (res.error) {
          throw res.error;
        }
        // Segue to Activate Account View
        this.displayToastMessage(
          'success',
          'Success: Check your email and activate your account.',
        );
        this.setState({ view: 'activateAccount' });
      })
      .catch((error) => {
        console.log('sign up error:', error);
        if (typeof error !== 'string') {
          error = 'Sign Up Failed: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  logUserIn(evt) {
    evt.preventDefault();

    const inputValidationResult = this.validInput('logIn');
    if (inputValidationResult.error) {
      return this.displayToastMessage('error', inputValidationResult.error);
    }

    this.displayToastMessage('info', 'Loading...');

    this.SessionService.logIn(this.state.signUpLogInForm)
      .then(async (res) => {
        console.log('logUserIn(), this.SessionService.logUserIn() res', res);
        if (res.error) {
          throw res.error;
        }
        if (res.user === null || res.user === undefined) {
          throw 'Invalid request';
        }

        // Update Redux State with User Data
        this.props.dispatchSetUser(res.user);

        if (!res.user.active) {
          // Segue to Activate Account View
          this.displayToastMessage(
            'success',
            'Success: Check your email for your activation token.',
          );
          return this.setState({ view: 'activateAccount' });
        }

        const pRes = await this.ProfileService.fetchProfile(res.user.id);
        console.log('this.ProfileService.fetchProfile() pRes:', pRes);
        if (pRes.error) {
          throw pRes.error;
        }

        this.displayToastMessage('success', 'Success: Redirecting...');

        if (pRes.profile === null) {
          // Segue to CreateProfileView
          return this.props.history.replace('/profile/create');
        }

        // Segue to TransactionView (Home)
        this.props.history.replace('/h/transactions', {
          session: true,
        });
      })
      .catch((error) => {
        console.log('log In error:', error);
        if (typeof error !== 'string') {
          error = 'Log In Failed: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  activateUsersAccount(evt) {
    evt.preventDefault();

    const inputValidationResult = this.validInput('activateAccount');
    if (inputValidationResult.error) {
      return this.displayToastMessage('error', inputValidationResult.error);
    }

    this.displayToastMessage('info', 'Loading...');

    this.UserService.activateAccount(this.state.activateAccountForm)
      .then((res) => {
        console.log(
          'activateUsersAccount(), this.UserService.activateAccount() res',
          res,
        );
        if (res.error) {
          throw res.error;
        }

        this.displayToastMessage('success', 'Success: Please log in');

        this.setState({ view: 'logIn' });
      })
      .catch((error) => {
        console.log('activate account error:', error);
        if (typeof error !== 'string') {
          error = 'Activation Failed: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  sendResetPasswordToken(evt) {
    evt.preventDefault();

    const inputValidationResult = this.validInput('forgotPassword');
    if (inputValidationResult.error) {
      return this.displayToastMessage('error', inputValidationResult.error);
    }

    this.displayToastMessage('info', 'Loading...');

    this.UserService.forgotPassword(this.state.forgotPasswordForm)
      .then((res) => {
        console.log(
          'sendResetPasswordToken(), this.UserService.forgotPassword() res',
          res,
        );
        if (res.error) {
          throw res.error;
        }

        this.displayToastMessage(
          'success',
          'Success: Please check your email for your reset token.',
        );

        this.setState({ view: 'resetPassword' });
      })
      .catch((error) => {
        console.log('forgot password error:', error);
        if (typeof error !== 'string') {
          error = 'Failed: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  resetUsersPassword(evt) {
    evt.preventDefault();

    const inputValidationResult = this.validInput('resetPassword');
    if (inputValidationResult.error) {
      return this.displayToastMessage('error', inputValidationResult.error);
    }

    this.displayToastMessage('info', 'Loading...');

    this.UserService.resetPassword(this.state.resetPasswordForm)
      .then((res) => {
        console.log(
          'resetUsersPassword(), this.UserService.resetPassword() res',
          res,
        );
        if (res.error) {
          throw res.error;
        }

        this.displayToastMessage('success', 'Success: Please log in.');

        this.setState({ view: 'logIn' });
      })
      .catch((error) => {
        console.log('reset password error:', error);
        if (typeof error !== 'string') {
          error = 'Failed resetting password: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  renderLogInView() {
    return (
      <div className='AuthViewFormContainer col-sm-4 col-12'>
        <div className='AuthViewFormRow row'>
          <div className='AuthViewFormHeader'>
            <p>Log In</p>
          </div>
          <form className='AuthViewForm'>
            <input
              className='AuthViewFormInput'
              type='text'
              value={this.state.signUpLogInForm.email}
              onChange={(evt) => this.updateSignUpLogInForm(evt, 'email')}
              placeholder='Email Address'
            />
            <input
              className='AuthViewFormInput'
              type='password'
              value={this.state.signUpLogInForm.password}
              onChange={(evt) => this.updateSignUpLogInForm(evt, 'password')}
              placeholder='Password'
            />
            <input
              className='AuthViewFormButton'
              type='button'
              value='Log In'
              onClick={this.logUserIn}
            />
            <div className='AuthViewOptionsLinkContainer'>
              <a
                className='AuthViewOptionsLink'
                href='#signUp'
                onClick={(evt) => this.setState({ view: 'signUp' })}
              >
                Sign Up
              </a>
            </div>
            <div className='AuthViewOptionsLinkContainer'>
              <a
                className='AuthViewOptionsLink'
                href='#forgotPassword'
                onClick={(evt) => this.setState({ view: 'forgotPassword' })}
              >
                Forgot Password
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  renderActivateAccountView() {
    return (
      <div className='AuthViewFormContainer col-sm-4 col-12'>
        <div className='AuthViewFormRow row'>
          <div className='AuthViewFormHeader'>
            <p>Activate Account</p>
          </div>
          <form className='AuthViewForm'>
            <input
              className='AuthViewFormInput'
              type='text'
              value={this.state.activateAccountForm.email}
              onChange={(evt) => this.updateActivateAccountForm(evt, 'email')}
              placeholder='Email Address'
            />
            <input
              className='AuthViewFormInput'
              type='text'
              value={this.state.activateAccountForm.activationToken}
              onChange={(evt) =>
                this.updateActivateAccountForm(evt, 'activationToken')
              }
              placeholder='Activation Token'
            />
            <input
              className='AuthViewFormButton'
              type='button'
              value='Activate'
              onClick={this.activateUsersAccount}
            />
          </form>
        </div>
      </div>
    );
  }

  renderForgotPasswordView() {
    return (
      <div className='AuthViewFormContainer col-sm-4 col-12'>
        <div className='AuthViewFormRow row'>
          <div className='AuthViewFormHeader'>
            <p>Forgot Password</p>
          </div>
          <form className='AuthViewForm'>
            <input
              className='AuthViewFormInput'
              type='text'
              value={this.state.forgotPasswordForm.email}
              onChange={(evt) => this.updateForgotPasswordForm(evt, 'email')}
              placeholder='Email Address'
            />
            <input
              className='AuthViewFormButton'
              type='button'
              value='Submit'
              onClick={this.sendResetPasswordToken}
            />
            <div className='AuthViewOptionsLinkContainer'>
              <a
                className='ForgotPasswordViewOptionsLink'
                href='#signUp'
                onClick={(evt) => this.setState({ view: 'signUp' })}
              >
                Sign Up
              </a>
            </div>
            <div className='AuthViewOptionsLinkContainer'>
              <a
                className='ForgotPasswordViewOptionsLink'
                href='#logIn'
                onClick={(evt) => this.setState({ view: 'logIn' })}
              >
                Log In
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  renderResetPasswordView() {
    return (
      <div className='AuthViewFormContainer col-sm-4 col-12'>
        <div className='AuthViewFormRow row'>
          <div className='AuthViewFormHeader'>
            <p>Reset Password</p>
          </div>
          <form className='AuthViewForm'>
            <input
              className='AuthViewFormInput'
              type='text'
              value={this.state.resetPasswordForm.email}
              onChange={(evt) => this.updateResetPasswordForm(evt, 'email')}
              placeholder='Email Address'
            />
            <input
              className='AuthViewFormInput'
              type='text'
              value={this.state.resetPasswordForm.resetPasswordToken}
              onChange={(evt) =>
                this.updateResetPasswordForm(evt, 'resetPasswordToken')
              }
              placeholder='Reset Token'
            />
            <input
              className='AuthViewFormInput'
              type='password'
              value={this.state.resetPasswordForm.oldPassword}
              onChange={(evt) =>
                this.updateResetPasswordForm(evt, 'oldPassword')
              }
              placeholder='Old Password'
            />
            <input
              className='AuthViewFormInput'
              type='password'
              value={this.state.resetPasswordForm.newPassword}
              onChange={(evt) =>
                this.updateResetPasswordForm(evt, 'newPassword')
              }
              placeholder='New Password'
            />
            <input
              className='AuthViewFormInput'
              type='password'
              value={this.state.resetPasswordForm.confirmPassword}
              onChange={(evt) =>
                this.updateResetPasswordForm(evt, 'confirmPassword')
              }
              placeholder='Confirm Password'
            />
            <input
              className='AuthViewFormButton'
              type='button'
              value='Submit'
              onClick={this.resetUsersPassword}
            />
            <div className='AuthViewOptionsLinkContainer'>
              <a
                className='ResetPasswordViewOptionsLink'
                href='#signUp'
                onClick={(evt) => this.setState({ view: 'signUp' })}
              >
                Sign Up
              </a>
            </div>
            <div className='AuthViewOptionsLinkContainer'>
              <a
                className='ResetPasswordViewOptionsLink'
                href='#logIn'
                onClick={(evt) => this.setState({ view: 'logIn' })}
              >
                Log In
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  renderSignUpView() {
    return (
      <div className='AuthViewFormContainer col-sm-4 col-12'>
        <div className='AuthViewFormRow row'>
          <div className='AuthViewFormHeader'>
            <p>Sign Up</p>
          </div>
          <form className='AuthViewForm'>
            <input
              className='AuthViewFormInput'
              type='text'
              value={this.state.signUpLogInForm.email}
              onChange={(evt) => this.updateSignUpLogInForm(evt, 'email')}
              placeholder='Email Address'
            />
            <input
              className='AuthViewFormInput'
              type='password'
              value={this.state.signUpLogInForm.password}
              onChange={(evt) => this.updateSignUpLogInForm(evt, 'password')}
              placeholder='Password'
            />
            <input
              className='AuthViewFormInput'
              type='password'
              value={this.state.signUpLogInForm.confirmPassword}
              onChange={(evt) =>
                this.updateSignUpLogInForm(evt, 'confirmPassword')
              }
              placeholder='Confirm Password'
            />
            <input
              className='AuthViewFormButton'
              type='button'
              value='Create Account'
              onClick={this.signNewUserUp}
            />
            <div className='AuthViewOptionsLinkContainer'>
              <a
                className='SignUpViewOptionsLink'
                href='#logIn'
                onClick={(evt) => this.setState({ view: 'logIn' })}
              >
                Log In
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  renderAuthInfoContent() {
    return (
      <div className='AuthInfoContentContainer col-sm-8 col-12'>
        <div className='AuthInfoContentLabelContainer row'>
          <p className='AuthInfoContentBrandLabel'>ePayments</p>
          <p className='AuthInfoContentDescriptionLabel'>
            Accept cryptocurrency. Spend cryptocurrency
          </p>
        </div>
      </div>
    );
  }

  renderAuthFormContent() {
    switch (this.state.view) {
      case 'logIn':
        return this.renderLogInView();
      case 'activateAccount':
        return this.renderActivateAccountView();
      case 'forgotPassword':
        return this.renderForgotPasswordView();
      case 'resetPassword':
        return this.renderResetPasswordView();
      default:
        return this.renderSignUpView();
    }
  }

  renderAuthView() {
    return (
      <div className='MainAuthViewContainer row'>
        {this.renderAuthInfoContent()}
        {this.renderAuthFormContent()}
      </div>
    );
  }

  render() {
    return this.renderAuthView();
  }
}

const mapStateToProps = (state) => ({
  toast: state.toast,
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({
  dispatchSetUser: (userData) => dispatch(setUser(userData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthView);
