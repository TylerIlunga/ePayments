import React from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import SessionService from '../../services/SessionService';
import UserService from '../../services/UserService';
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
    };

    this.SessionService = new SessionService();
    this.UserService = new UserService();

    this.renderSignUpView = this.renderSignUpView.bind(this);
    this.updateSignUpLogInForm = this.updateSignUpLogInForm.bind(this);
    this.signNewUserUp = this.signNewUserUp.bind(this);
  }

  displayToastMessage(type, message) {
    // Types: (https://github.com/fkhadra/react-toastify#toast)
    console.log('displayToastMessage', type, message);
    toast[type](message, {
      autoClose: 4000,
      position: toast.POSITION.BOTTOM_LEFT,
    });
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

  validInput(inputFieldInState) {
    if (inputFieldInState === 'signUpLogInForm') {
      const { email, password, confirmPassword, passwordPattern } = this.state[
        inputFieldInState
      ];
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

    return { error: null };
  }

  signNewUserUp(evt) {
    evt.preventDefault();
    const inputValidationResult = this.validInput('signUpLogInForm');
    if (inputValidationResult.error) {
      return this.displayToastMessage('error', inputValidationResult.error);
    }
    this.SessionService.signUp(this.state.signUpLogInForm)
      .then((res) => {
        console.log('signNewUserUp(), this.SessionService.signUp() res', res);
        if (res.error) {
          throw res.error;
        }
        // Segue to Activate Account View
      })
      .catch((error) => {
        // Toast with notification
        console.log('sign up error:', error);
        if (typeof error !== 'string') {
          error = 'Sign Up Failed: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  renderSignUpView() {
    return (
      <div className='MainAuthViewContainer'>
        <div className='SignUpViewHeader'>
          <h1>Sign Up</h1>
        </div>
        <div className='SignUpViewFormContainer'>
          <form className='SignUpViewForm'>
            <label className='SignUpViewFormEmailLabel'>Email Address:</label>
            <input
              className='SignUpViewFormEmailInput'
              type='text'
              value={this.state.signUpLogInForm.email}
              onChange={(evt) => this.updateSignUpLogInForm(evt, 'email')}
              placeholder={'w@xyz.com'}
            />
            <label className='SignUpViewFormPasswodLabel'>Password:</label>
            <input
              className='SignUpViewFormPasswordInput'
              type='password'
              value={this.state.signUpLogInForm.password}
              onChange={(evt) => this.updateSignUpLogInForm(evt, 'password')}
              placeholder={'************'}
            />
            <label className='SignUpViewFormPasswodLabel'>
              Confirm Password:
            </label>
            <input
              className='SignUpViewFormPasswordInput'
              type='password'
              value={this.state.signUpLogInForm.confirmPassword}
              onChange={(evt) =>
                this.updateSignUpLogInForm(evt, 'confirmPassword')
              }
              placeholder={'************'}
            />
            <input
              className='SignUpViewFormCreateButton'
              type='button'
              value='Create Account'
              onClick={this.signNewUserUp}
            />
          </form>
        </div>
      </div>
    );
  }

  renderLogInView() {
    return (
      <div className='MainAuthViewContainer'>
        <div>LogIn</div>
      </div>
    );
  }

  renderActivateAccountView() {
    return (
      <div className='MainAuthViewContainer'>
        <div>ActivateAccount</div>
      </div>
    );
  }

  renderResetPasswordView() {
    return (
      <div className='MainAuthViewContainer'>
        <div>ResetPassword</div>
      </div>
    );
  }

  renderForgotPasswordView() {
    return (
      <div className='MainAuthViewContainer'>
        <div>ForgotPassword</div>
      </div>
    );
  }

  render() {
    switch (this.state.view) {
      case 'logIn':
        return this.renderLogInView();
      case 'activateAccount':
        return this.renderActivateAccountView();
      case 'resetPassword':
        return this.renderResetPasswordView();
      case 'forgotPassword':
        return this.renderForgotPasswordView();
      default:
        return this.renderSignUpView();
    }
  }
}

const mapStateToProps = (state) => ({
  toast: state.toast,
});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AuthView);
