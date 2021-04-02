import React from 'react';
import { connect } from 'react-redux';
import './index.css';

class AuthView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'signUp',
    };
  }

  renderSignUpView() {
    return (
      <div className='MainAuthViewContainer'>
        <div>SignUp</div>
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

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AuthView);
