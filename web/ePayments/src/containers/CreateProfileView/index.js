import React from 'react';
import { connect } from 'react-redux';
import config from '../../config';
import { setProfile } from '../../redux/actions/profile';
import ProfileService from '../../services/ProfileService';
import toastUtils from '../../utils/Toasts';
import './index.css';

class CreateProfileView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'customer',
      businessProfileForm: {
        publicEmail: '',
        phoneNumber: '',
        address: '',
      },
      customerProfileForm: {
        country: '',
        username: '',
      },
    };
    this.ProfileService = new ProfileService();
    this.displayToastMessage = toastUtils.displayToastMessage;
    this.profileTypeIsActive = this.profileTypeIsActive.bind(this);
    this.validInput = this.validInput.bind(this);
    this.updateProfileForm = this.updateProfileForm.bind(this);
    this.createNewProfile = this.createNewProfile.bind(this);
    this.renderBusinessProfileForm = this.renderBusinessProfileForm.bind(this);
    this.renderCustomerProfileForm = this.renderCustomerProfileForm.bind(this);
  }

  async updateProfileForm(evt, formType, field) {
    this.setState(
      {
        [formType]: {
          ...this.state[formType],
          [field]: evt.target.value,
        },
      },
      () => console.log(`new this.state[${formType}]:`, this.state[formType]),
    );
  }

  validInput(profileType) {
    profileType = profileType.toLowerCase();
    if (profileType === 'business') {
      const {
        address,
        phoneNumber,
        publicEmail,
      } = this.state.businessProfileForm;
      if (!(address && phoneNumber && publicEmail)) {
        return { error: 'Please provide values for every field.' };
      }
    }
    if (profileType === 'customer') {
      const { country, username } = this.state.customerProfileForm;
      if (!(country && username)) {
        return { error: 'Please provide values for every field.' };
      }
    }
    return { error: null };
  }

  createNewProfile(evt, profileType) {
    evt.preventDefault();

    const inputValidationResult = this.validInput(profileType);
    if (inputValidationResult.error) {
      return this.displayToastMessage('error', inputValidationResult.error);
    }

    const profileData = this.state[`${profileType.toLowerCase()}ProfileForm`];

    profileData.userID = this.props.user.id;

    this.displayToastMessage('info', 'Loading...');

    this.ProfileService[`createNew${profileType}Profile`](profileData)
      .then((res) => {
        console.log(
          `createNewProfile(), this.ProfileService[createNew${profileType}Profile]() res`,
          res,
        );
        if (res.error) {
          throw res.error;
        }

        // Update Redux store
        this.props.dispatchSetProfile(res.profile);

        // Segue to ConnectPaymentAccountView
        this.displayToastMessage('success', 'Success!');

        this.props.history.replace('/payments/connect');
      })
      .catch((error) => {
        console.log('create profile error:', error);
        if (typeof error !== 'string') {
          error = 'Failed to create profile: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  renderCustomerProfileForm() {
    return (
      <div className='CreateProfileViewFormContainer'>
        <form className='CreateProfileViewForm'>
          <label className='CreateProfileViewFormLabel'>Country:</label>
          <select
            className='CreateProfileViewFormSelectInput'
            value={this.state.customerProfileForm.country}
            onChange={(evt) =>
              this.updateProfileForm(evt, 'customerProfileForm', 'country')
            }
          >
            {config.countries.map((countryData, i) => (
              <option key={i} value={countryData.code}>
                {`${countryData.name} (${countryData.code})`}
              </option>
            ))}
          </select>
          <label className='CreateProfileViewFormLabel'>Public Username:</label>
          <input
            className='CreateProfileViewFormInput'
            type='text'
            value={this.state.customerProfileForm.username}
            onChange={(evt) =>
              this.updateProfileForm(evt, 'customerProfileForm', 'username')
            }
            placeholder={'coinperson123'}
          />
          <input
            className='CreateProfileViewFormButton'
            type='button'
            value='Create Profile'
            onClick={(evt) => this.createNewProfile(evt, 'Customer')}
          />
        </form>
      </div>
    );
  }

  renderBusinessProfileForm() {
    return (
      <div className='CreateProfileViewFormContainer'>
        <form className='CreateProfileViewForm'>
          <label className='CreateProfileViewFormLabel'>
            Public Email Address:
          </label>
          <input
            className='CreateProfileViewFormInput'
            type='text'
            value={this.state.businessProfileForm.publicEmail}
            onChange={(evt) =>
              this.updateProfileForm(evt, 'businessProfileForm', 'publicEmail')
            }
            placeholder={'w@xyz.com'}
          />
          <label className='CreateProfileViewFormLabel'>
            Public Phone Number:
          </label>
          <input
            className='CreateProfileViewFormInput'
            type='text'
            value={this.state.businessProfileForm.phoneNumber}
            onChange={(evt) =>
              this.updateProfileForm(evt, 'businessProfileForm', 'phoneNumber')
            }
            placeholder={'+1 123-456-7890'}
          />
          <label className='CreateProfileViewFormLabel'>Public Address:</label>
          <input
            className='CreateProfileViewFormInput'
            type='text'
            value={this.state.businessProfileForm.address}
            onChange={(evt) =>
              this.updateProfileForm(evt, 'businessProfileForm', 'address')
            }
            placeholder={'123 First Street Applewood, CA 90001'}
          />
          <input
            className='CreateProfileViewFormButton'
            type='button'
            value='Create Profile'
            onClick={(evt) => this.createNewProfile(evt, 'Business')}
          />
        </form>
      </div>
    );
  }

  renderFormOption() {
    switch (this.state.view) {
      case 'customer':
        return this.renderCustomerProfileForm();
      default:
        return this.renderBusinessProfileForm();
    }
  }

  renderCreateProfileHeader() {
    return (
      <div className='CreateProfileHeaderContainer row'>
        <p>Create your Profile</p>
      </div>
    );
  }

  profileTypeIsActive(profileType) {
    if (this.state.view === profileType) {
      return 'CreateProfileViewFormOptionActive';
    }
    return '';
  }

  renderUserTypeOptions() {
    return (
      <div className='CreateProfileViewFormOptionsContainer row'>
        <div
          className={`CreateProfileViewFormOption col-6 ${this.profileTypeIsActive(
            'customer',
          )}`}
          onClick={(evt) => this.setState({ view: 'customer' })}
        >
          <p>Customer</p>
        </div>
        <div
          className={`CreateProfileViewFormOption col-6 ${this.profileTypeIsActive(
            'business',
          )}`}
          onClick={(evt) => this.setState({ view: 'business' })}
        >
          <p>Business</p>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='MainCreateProfileViewContainer'>
        <div className='MainCreateProfileViewRow row'>
          {this.renderCreateProfileHeader()}
          {this.renderUserTypeOptions()}
          {this.renderFormOption()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  profile: state.profile,
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({
  dispatchSetProfile: (profileData) => dispatch(setProfile(profileData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfileView);
