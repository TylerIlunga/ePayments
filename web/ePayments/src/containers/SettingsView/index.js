import React from 'react';
import { connect } from 'react-redux';
import { persistor } from '../../redux/store';
import config from '../../config';
import BrandHeader from '../../components/BrandHeader';
import DashboardMenu from '../../components/DashboardMenu';
import { updatePaymentAccount } from '../../redux/actions/paymentAccount';
import { setProfile } from '../../redux/actions/profile';
import PaymentAccountService from '../../services/PaymentAccountService';
import ProfileService from '../../services/ProfileService';
import SessionService from '../../services/SessionService';
import UserService from '../../services/UserService';
import stringUtils from '../../utils/Strings';
import toastUtils from '../../utils/Toasts';
import './index.css';

class SettingsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      displayMobileMenuModal: false,
      activeOption: 'Profile',
      options: ['Profile', 'Payments', 'Log Out'],
      updatingProfile: false,
      updatedUserProfile: { ...this.props.profile },
      updatedPaymentAccount: {
        autoConvertToFiat: this.props.paymentAccount.auto_convert_to_fiat,
      },
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.ProfileService = new ProfileService();
    this.SessionService = new SessionService();
    this.UserService = new UserService();
    this.PaymentAccountService = new PaymentAccountService();
    this.handleToggleMobileMenuModal = this.handleToggleMobileMenuModal.bind(
      this,
    );
    this.renderSettingsView = this.renderSettingsView.bind(this);
    this.renderActiveOptionContent = this.renderActiveOptionContent.bind(this);
    this.settingsOptionIsActive = this.settingsOptionIsActive.bind(this);
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
    this.toggleAutoConvertToFiat = this.toggleAutoConvertToFiat.bind(this);
    this.windowOAuthCBMessageHandler = this.windowOAuthCBMessageHandler.bind(
      this,
    );
    this.startCoinbaseOAuth = this.startCoinbaseOAuth.bind(this);
    this.renderLogOutView = this.renderLogOutView.bind(this);
    this.logUserOut = this.logUserOut.bind(this);
  }

  componentDidMount() {
    this.toggleProfileInputEnableStatus(true);
    window.addEventListener('message', this.windowOAuthCBMessageHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.windowOAuthCBMessageHandler);
  }

  handleToggleMobileMenuModal(e) {
    e.preventDefault();
    this.setState({
      displayMobileMenuModal: !this.state.displayMobileMenuModal,
    });
  }

  renderBrandRow() {
    return (
      <BrandHeader
        history={this.props.history}
        displayMobileMenuModal={this.state.displayMobileMenuModal}
        onToggleMobileMenuModal={this.handleToggleMobileMenuModal}
      />
    );
  }

  renderMenuColumn(isMobile) {
    return (
      <DashboardMenu
        isMobile={isMobile}
        colSize='col-sm-1'
        activeOption='Settings'
        user={this.props.user}
        history={this.props.history}
        displayToastMessage={this.displayToastMessage}
      />
    );
  }

  toggleProfileInputEnableStatus(isDisabled) {
    document.querySelectorAll('.SettingsViewInput').forEach((el) => {
      if (isDisabled) {
        el.setAttribute('disabled', isDisabled);
      } else {
        el.removeAttribute('disabled');
      }
    });
  }

  renderActiveOptionContentHeader() {
    return (
      <div className='StdViewContentHeaderContainer'>
        <p className='StdContentHeaderLabel'>{this.state.activeOption}</p>
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

  toggleAutoConvertToFiat(evt) {
    evt.preventDefault();

    this.displayToastMessage('info', 'Updating...');

    const autoConvertToFiatStatus = evt.target.value;
    this.PaymentAccountService.toggleAutoConvertToFiatFeature({
      autoConvertToFiatStatus,
      id: this.props.paymentAccount.id,
      userID: this.props.paymentAccount.user_id,
      profileID: this.props.paymentAccount.profile_id,
    })
      .then((res) => {
        console.log(
          'this.PaymentAccountService.toggleAutoConvertToFiatFeature res:',
          res,
        );
        if (res.error) {
          throw res.error;
        }
        this.displayToastMessage('success', 'Success: Updated Payment Account');
        this.props.dispatchUpdatePaymentAccount({
          key: 'auto_convert_to_fiat',
          value: autoConvertToFiatStatus,
        });
      })
      .catch((error) => {
        console.log(
          'this.PaymentAccountService.toggleAutoConvertToFiatFeature error:',
          error,
        );
        if (typeof error !== 'string') {
          error = 'Update failure: Please try again';
        }
        this.displayToastMessage('error', error);
      });
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
      type: this.props.user.type,
      userID: this.props.profile.user_id,
      profileID: this.props.profile.id,
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

        this.props.dispatchSetProfile(this.state.updatedUserProfile);

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
        <div className='SettingsViewActionButtonContainer'>
          <button
            className='SettingsViewActionButton'
            onClick={(e) => this.toggleUpdatingProfileState(e, false)}
          >
            Cancel
          </button>
          <button
            className='SettingsViewActionButton'
            onClick={this.updateUserProfile}
          >
            Submit
          </button>
        </div>
      );
    }
    return (
      <div className='SettingsViewActionButtonContainer'>
        <button
          className='SettingsViewActionButton'
          onClick={(e) => this.toggleUpdatingProfileState(e, true)}
        >
          Update
        </button>
      </div>
    );
  }

  renderBusinessProfileView() {
    return (
      <div className='SettingsViewContentContainer col-11'>
        {this.renderActiveOptionContentHeader()}
        <form className='SettingsViewProfileViewInfoForm'>
          <label>Type: {this.props.user.type}</label>
          <label>Email Address: </label>
          <input
            className='SettingsViewInput'
            type='text'
            value={this.state.updatedUserProfile.public_email}
            onChange={(evt) =>
              this.handleUpdatingUserProfileField(evt, 'public_email')
            }
          />
          <label>Phone Number: </label>
          <input
            className='SettingsViewInput'
            type='text'
            value={this.state.updatedUserProfile.phone_number}
            onChange={(evt) =>
              this.handleUpdatingUserProfileField(evt, 'phone_number')
            }
          />
          <label>Street Address: </label>
          <input
            className='SettingsViewInput'
            type='text'
            value={this.state.updatedUserProfile.address}
            onChange={(evt) =>
              this.handleUpdatingUserProfileField(evt, 'address')
            }
          />
        </form>
        {this.renderUpdateProfileButtons()}
      </div>
    );
  }

  renderCustomerProfileView() {
    return (
      <div className='SettingsViewContentContainer col-12'>
        {this.renderActiveOptionContentHeader()}
        <form className='SettingsViewProfileViewInfoForm'>
          <label>Type: {this.props.user.type}</label>
          <label>Username: </label>
          <input
            className='SettingsViewInput'
            type='text'
            value={this.state.updatedUserProfile.username}
            onChange={(evt) =>
              this.handleUpdatingUserProfileField(evt, 'username')
            }
          />
          <label>Country: </label>
          <select
            className='SettingsViewInput'
            value={this.state.updatedUserProfile.country}
            onChange={(evt) =>
              this.handleUpdatingUserProfileField(evt, 'country')
            }
          >
            {config.countries.map((countryData, i) => (
              <option key={i} value={countryData.code}>
                {`${countryData.name} (${countryData.code})`}
              </option>
            ))}
          </select>
        </form>
        {this.renderUpdateProfileButtons()}
      </div>
    );
  }

  renderProfileView() {
    if (this.props.user.type === 'customer') {
      return this.renderCustomerProfileView();
    }
    return this.renderBusinessProfileView();
  }

  isJSON(object) {
    try {
      JSON.parse(object);
    } catch (e) {
      return false;
    }
    return true;
  }

  windowOAuthCBMessageHandler(message) {
    console.log('windowOAuthCBMessageHandler() message', message);
    if (!this.isJSON(message.data)) {
      return;
    }
    try {
      const messageJson = JSON.parse(message.data);
      console.log('messageJson:', messageJson);
      if (!messageJson.success) {
        throw '!messageJSON.success';
      }
      if (messageJson.paymentAccount) {
        this.props.dispatchUpdatePaymentAccount(messageJson.paymentAccount);
        this.displayToastMessage('success', 'Success');
      }
    } catch (error) {
      console.log('windowOAuthCBMessageHandler() error:', error);
      this.displayToastMessage('error', 'Failed to connect: Please try again');
    }
  }

  startCoinbaseOAuth(evt) {
    evt.preventDefault();
    this.PaymentAccountService.fetchCoinbaseOauthLink({
      userID: this.props.user.id,
      email: this.props.user.email,
      profileID: this.props.profile.id,
      replaceAccount: true,
    })
      .then((res) => {
        console.log(
          'startCoinbaseOAuth(), this.PaymentAccountService.fetchCoinbaseOauthLink res',
          res,
        );
        if (res.error) {
          throw res.error;
        }
        // NOTE: popup window to handle OAUTH
        window.open(
          res.authURL,
          'coinbase oauth',
          'height=777,width=777,modal=yes,alwaysRaised=ye',
        );
      })
      .catch((error) => {
        console.log('startCoinbaseOAuth error:', error);
        if (typeof error !== 'string') {
          error = 'Failed to connect: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  renderPaymentsView() {
    const paymentAccount = this.props.paymentAccount;
    return (
      <div className='SettingsViewContentContainer col-11'>
        {this.renderActiveOptionContentHeader()}
        <div className='SettingsViewPaymentsViewInfoContainer'>
          <form className='SettingsViewPaymentsViewInfoConvertForm'>
            <label>
              <strong>Coinbase Account ID:</strong>
              {` ${paymentAccount.coinbase_account_id}`}
            </label>
            <br />
            <label>
              <strong>Coinbase Bitcoin Address:</strong>
              {` ${paymentAccount.coinbase_bitcoin_address}`}
            </label>
            <br />
            <label>
              <strong>Coinbase Ethereum Address:</strong>
              {` ${paymentAccount.coinbase_ethereum_address}`}
            </label>
            <br />
            <label>
              <strong>Coinbase LiteCoin Address:</strong>
              {` ${paymentAccount.coinbase_litecoin_address}`}
            </label>
            <br />
            <label>
              <strong>Auto-Convert Payments To Fiat:</strong>
            </label>
            <select
              className='SettingsViewInput'
              value={String(this.props.paymentAccount.auto_convert_to_fiat)}
              onChange={(evt) => this.toggleAutoConvertToFiat(evt)}
            >
              <option value='true'>Enabled</option>
              <option value='false'>Disabled</option>
            </select>
          </form>
          <div className='SettingsViewActionButtonContainer'>
            <button
              className='SettingsViewActionButton'
              onClick={this.startCoinbaseOAuth}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    );
  }

  logUserOut(evt) {
    evt.preventDefault();

    this.displayToastMessage('info', 'Logging out...');

    this.SessionService.logOut()
      .then(async (res) => {
        console.log('this.SessionService.logOut() res:', res);
        if (res !== 'OK') {
          throw 'Log Out Failure: Please try again';
        }

        this.displayToastMessage('success', 'Success');

        await persistor.purge();

        console.log('purged()');

        this.props.history.replace('/', { session: false });
      })
      .catch((error) => {
        console.log(
          'this.PaymentAccountService.toggleAutoConvertToFiatFeature error:',
          error,
        );
        if (typeof error !== 'string') {
          error = 'Log Out Failure: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  renderLogOutView() {
    return (
      <div className='SettingsViewContentContainer col-11'>
        {this.renderActiveOptionContentHeader()}
        <div className='SettingsViewLogOutViewAYSContainer'>
          <p>Are you sure you want to log out? We don't want you to go :(</p>
        </div>
        <div className='SettingsViewActionButtonContainer'>
          <button
            className='SettingsViewActionButton'
            onClick={this.logUserOut}
          >
            I'm Sure
          </button>
        </div>
      </div>
    );
  }

  renderActiveOptionContent() {
    switch (this.state.activeOption) {
      case 'Profile':
        return this.renderProfileView();
      case 'Payments':
        return this.renderPaymentsView();
      case 'Log Out':
        return this.renderLogOutView();
      default:
        return this.renderProfileView();
    }
  }

  settingsOptionIsActive(option) {
    if (option === this.state.activeOption) {
      return 'SettingsViewOption-Active';
    }
  }

  renderSettingsView() {
    return (
      <div className='StdViewContentContainer col-sm-11 col-12 row'>
        <div className='SettingsViewOptionsContainer col-12'>
          {this.state.options.map((option, i) => (
            <div
              key={i}
              className={`SettingsViewOption ${this.settingsOptionIsActive(
                option,
              )}`}
              onClick={(evt) => this.setState({ activeOption: option })}
            >
              <p>{option}</p>
            </div>
          ))}
        </div>
        {this.renderActiveOptionContent()}
      </div>
    );
  }

  render() {
    if (this.state.displayMobileMenuModal) {
      return (
        <div className='MainStdViewContainer row'>
          {this.renderBrandRow()}
          <div className='StdViewMenuContentContainer row'>
            {this.renderMenuColumn(true)}
          </div>
        </div>
      );
    }
    return (
      <div className='MainStdViewContainer row'>
        {this.renderBrandRow()}
        <div className='StdViewMenuContentContainer row'>
          {this.renderMenuColumn(false)}
          {this.renderSettingsView()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  paymentAccount: state.paymentAccount,
  profile: state.profile,
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({
  dispatchSetProfile: (profile) => dispatch(setProfile(profile)),
  dispatchUpdatePaymentAccount: (keyValueUpdate) =>
    dispatch(updatePaymentAccount(keyValueUpdate)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView);
