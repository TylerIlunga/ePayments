import React from 'react';
import { connect } from 'react-redux';
import DashboardMenu from '../../components/DashboardMenu';
import { setProfile, updateProfile } from '../../redux/actions/profile';
import { setUser, updateUser } from '../../redux/actions/user';
import ProfileService from '../../services/ProfileService';
import SessionService from '../../services/SessionService';
import UserService from '../../services/UserService';
import stringUtils from '../../utils/Strings';
import toastUtils from '../../utils/Toasts';
import './index.css';

class SettingsView extends React.Component {
  constructor(props) {
    super(props);

    // Test Customer User
    this.user = {
      type: 'business',
      email: 'w@xyz.com',
    };
    this.profile = {
      id: 1,
      user_id: 9,
      address: '123 First Street',
      phone_number: '2012109600',
      public_email: 'w@xyz.com',
      created_at: '1617549020305',
    };

    // // Test Customer User
    // this.user = {
    //   email: 'x@y.com',
    // };
    // this.profile = {
    //   "id": 1,
    //   "user_id": 10,
    //   "country": "USA",
    //   "username": "cguy",
    //   "created_at": "1617549020309"
    // };

    // NOTE: For Testing...
    this.props.dispatchSetUser(this.user);
    this.props.dispatchSetProfile(this.profile);

    this.state = {
      activeOption: 'Profile',
      options: ['Profile', 'Payments', 'Reset Password', 'Log Out'],
      updatingProfile: false,
      // updatedUserProfile: { ...this.props.profile },
      updatedUserProfile: { ...this.profile },
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.ProfileService = new ProfileService();
    this.SessionService = new SessionService();
    this.UserService = new UserService();
    this.renderSettingsView = this.renderSettingsView.bind(this);
    this.renderActiveOptionContent = this.renderActiveOptionContent.bind(this);
    this.renderCustomerProfileView = this.renderCustomerProfileView.bind(this);
    this.renderBusinessProfileView = this.renderBusinessProfileView.bind(this);
    this.handleUpdatingUserProfileField = this.handleUpdatingUserProfileField.bind(
      this,
    );
    this.toggleUpdatingProfileState = this.toggleUpdatingProfileState.bind(
      this,
    );
    this.updateUserProfile = this.updateUserProfile.bind(this);
    this.renderPaymentsView = this.renderPaymentsView.bind(this);
    this.renderResetPasswordView = this.renderResetPasswordView.bind(this);
    this.renderLogOutView = this.renderLogOutView.bind(this);
  }

  componentDidMount() {
    this.toggleProfileInputEnableStatus(true);
  }

  renderMenuColumn() {
    return (
      <DashboardMenu
        colSize='col-2'
        user={this.props.user}
        history={this.props.history}
        displayToastMessage={this.displayToastMessage}
      />
    );
  }

  toggleProfileInputEnableStatus(isDisabled) {
    document.querySelectorAll('.SettingsViewProfileViewInput').forEach((el) => {
      if (isDisabled) {
        el.setAttribute('disabled', isDisabled);
      } else {
        el.removeAttribute('disabled');
      }
    });
  }

  renderActiveOptionContentHeader() {
    return (
      <div className='SettingsViewActiveOptionHeader'>
        <h1>{this.state.activeOption}</h1>
      </div>
    );
  }

  handleUpdatingUserProfileField(evt, field) {
    this.setState(
      {
        updatedUserProfile: {
          ...this.state.updatedUserProfile,
          [field]: evt.target.value,
        },
      },
      () =>
        console.log(
          'new this.state.updatedUserProfile:',
          this.state.updatedUserProfile,
        ),
    );
  }

  convertSnakeKeysToCamelCase(oldObject) {
    const newObject = {};
    Object.keys(oldObject).forEach((snakeKey) => {
      newObject[stringUtils.snakeToCamel(snakeKey)] = oldObject[snakeKey];
    });
    return newObject;
  }

  updateUserProfile(evt) {
    evt.preventDefault();

    this.displayToastMessage('info', 'Updating...');

    this.toggleProfileInputEnableStatus(true);
    // Update User Profile
    const updates = this.convertSnakeKeysToCamelCase(
      this.state.updatedUserProfile,
    );
    console.log('updateUserProfile() updates:', updates);
    // this.ProfileService.updateProfile({
    //   updates,
    //   type: this.props.user.type,
    //   userID: this.props.profile.user_id,
    //   profileID: this.props.profile.id,
    // })
    updates.id = null;
    updates.userId = null;
    updates.createdAt = null;
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;

    this.ProfileService.updateProfile({
      updates,
      type: this.user.type,
      userID: this.profile.user_id,
      profileID: this.profile.id,
    })
      .then((res) => {
        console.log('this.ProfileService.updateProfile res:', res);
        if (res.error) {
          throw res.error;
        }
        this.displayToastMessage(
          'success',
          'Success: Your profile has been updated.',
        );
        this.toggleProfileInputEnableStatus(false);
        this.toggleUpdatingProfileState(evt, false);
      })
      .catch((error) => {
        console.log('this.ProfileService.updateProfile error:', error);
        if (typeof error !== 'string') {
          error = 'Update failure: Please try again';
        }
        this.displayToastMessage('error', error);
        this.toggleProfileInputEnableStatus(false);
      });
  }

  toggleUpdatingProfileState(evt, updatingProfile) {
    evt.preventDefault();

    this.toggleProfileInputEnableStatus(!updatingProfile);

    this.setState({ updatingProfile });
  }

  renderUpdateProfileButtons() {
    if (this.state.updatingProfile) {
      return (
        <div className='SettingsViewProfileViewInputButtonsContainer'>
          <button
            className='SettingsViewProfileViewInputButton'
            onClick={(e) => this.toggleUpdatingProfileState(e, false)}
          >
            Cancel
          </button>
          <button
            className='SettingsViewProfileViewInputButton'
            onClick={this.updateUserProfile}
          >
            Submit
          </button>
        </div>
      );
    }
    return (
      <div className='SettingsViewProfileViewInputButtonsContainer'>
        <button
          className='SettingsViewProfileViewInputButton'
          onClick={(e) => this.toggleUpdatingProfileState(e, true)}
        >
          Update
        </button>
      </div>
    );
  }

  renderBusinessProfileView() {
    return (
      <div className='SettingsViewProfileViewContainer'>
        {this.renderActiveOptionContentHeader()}
        <form className='SettingsViewProfileViewInfoForm'>
          <label>Type: {this.props.user.type}</label>
          <label>Email Address: </label>
          <input
            className='SettingsViewProfileViewInput'
            type='text'
            value={this.state.updatedUserProfile.public_email}
            onChange={(evt) =>
              this.handleUpdatingUserProfileField(evt, 'public_email')
            }
          />
          <label>Phone Number: </label>
          <input
            className='SettingsViewProfileViewInput'
            type='text'
            value={this.state.updatedUserProfile.phone_number}
            onChange={(evt) =>
              this.handleUpdatingUserProfileField(evt, 'phone_number')
            }
          />
          <label>Street Address: </label>
          <input
            className='SettingsViewProfileViewInput'
            type='text'
            value={this.state.updatedUserProfile.address}
            onChange={(evt) =>
              this.handleUpdatingUserProfileField(evt, 'address')
            }
          />
          {this.renderUpdateProfileButtons()}
        </form>
      </div>
    );
  }

  renderCustomerProfileView() {
    return (
      <div className='SettingsViewProfileViewContainer'>
        Customer Profile View!!!!
      </div>
    );
  }

  renderProfileView() {
    if (this.props.user.type === 'customer') {
      return this.renderCustomerProfileView();
    }
    return this.renderBusinessProfileView();
  }

  renderPaymentsView() {
    return (
      <div className='SettingsViewPaymentsViewContainer'>Payments View!!!!</div>
    );
  }

  renderResetPasswordView() {
    return (
      <div className='SettingsViewResetPasswordContainer'>
        Reset Password View!!!!
      </div>
    );
  }

  renderLogOutView() {
    return (
      <div className='SettingsViewLogOutViewContainer'>Log Out View!!!!</div>
    );
  }

  renderActiveOptionContent() {
    switch (this.state.activeOption) {
      case 'Profile':
        return this.renderProfileView();
      case 'Payments':
        return this.renderPaymentsView();
      case 'Reset Password':
        return this.renderResetPasswordView();
      case 'Log Out':
        return this.renderLogOutView();
      default:
        return this.renderProfileView();
    }
  }

  renderSettingsView() {
    return (
      <div className='SettingsViewContainer col-10 row'>
        <div className='SettingsViewOptionsContainer col-2'>
          {this.state.options.map((option, i) => (
            <div
              key={i}
              className='SettingsViewOption'
              onClick={(evt) => this.setState({ activeOption: option })}
            >
              <p>{option}</p>
            </div>
          ))}
        </div>
        <div className='SettingsViewActiveOptionContainer col-10'>
          {this.renderActiveOptionContent()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='MainSettingsViewContainer row'>
        {this.renderMenuColumn()}
        {this.renderSettingsView()}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  profile: state.profile,
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({
  dispatchSetProfile: (profile) => dispatch(setProfile(profile)),
  dispatchSetUser: (user) => dispatch(setUser(user)),
  dispatchUpdateProfile: (keyValueUpdate) =>
    dispatch(updateProfile(keyValueUpdate)),
  dispatchUpdateUser: (keyValueUpdate) => dispatch(updateUser(keyValueUpdate)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView);
