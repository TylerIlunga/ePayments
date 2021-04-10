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
    this.validInput = this.validInput.bind(this);
    this.updateProfileForm = this.updateProfileForm.bind(this);
    this.createNewProfile = this.createNewProfile.bind(this);
    this.renderBusinessProfileForm = this.renderBusinessProfileForm.bind(this);
    this.renderCustomerProfileForm = this.renderCustomerProfileForm.bind(this);
  }

  imageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
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

  renderBusinessProfileForm() {
    return (
      <div className='CreateProfileViewBusinessFormContainer'>
        <form className='CreateProfileViewForm'>
          <label>Public Email Address:</label>
          <input
            className='CreateProfileViewBusinessFormEmailInput'
            type='text'
            value={this.state.businessProfileForm.publicEmail}
            onChange={(evt) =>
              this.updateProfileForm(evt, 'businessProfileForm', 'publicEmail')
            }
            placeholder={'w@xyz.com'}
          />
          <label>Public Phone Number:</label>
          <input
            className='CreateProfileViewBusinessFormPhoneInput'
            type='text'
            value={this.state.businessProfileForm.phoneNumber}
            onChange={(evt) =>
              this.updateProfileForm(evt, 'businessProfileForm', 'phoneNumber')
            }
            placeholder={'+1 123-456-7890'}
          />
          <label>Public Address:</label>
          <input
            className='CreateProfileViewBusinessFormAddressInput'
            type='text'
            value={this.state.businessProfileForm.address}
            onChange={(evt) =>
              this.updateProfileForm(evt, 'businessProfileForm', 'address')
            }
            placeholder={'123 First Street Applewood, CA 90001'}
          />
          <input
            className='SignUpViewFormCreateButton'
            type='button'
            value='Create Profile'
            onClick={(evt) => this.createNewProfile(evt, 'Business')}
          />
        </form>
      </div>
    );
  }

  renderCustomerProfileForm() {
    return (
      <div className='CreateProfileViewCustomerFormContainer'>
        <form className='CreateProfileViewForm'>
          <label>Country:</label>
          <select
            className='CreateProfileViewCustomerFormPhoneInput'
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
          <label>Public Username:</label>
          <input
            className='CreateProfileViewCustomerFormAddressInput'
            type='text'
            value={this.state.customerProfileForm.username}
            onChange={(evt) =>
              this.updateProfileForm(evt, 'customerProfileForm', 'username')
            }
            placeholder={'coinperson123'}
          />
          <input
            className='SignUpViewFormCreateButton'
            type='button'
            value='Create Profile'
            onClick={(evt) => this.createNewProfile(evt, 'Customer')}
          />
        </form>
      </div>
    );
  }

  renderFormOption() {
    switch (this.state.view) {
      case 'business':
        return this.renderBusinessProfileForm();
      default:
        return this.renderCustomerProfileForm();
    }
  }

  render() {
    return (
      <div className='MainCreateProfileViewContainer'>
        <div className='CreateProfileViewFormOptions'>
          <div
            className='CreateProfileViewFormOption'
            onClick={(evt) => this.setState({ view: 'customer' })}
          >
            Customer
          </div>
          <div
            className='CreateProfileViewFormOption'
            onClick={(evt) => this.setState({ view: 'business' })}
          >
            Business
          </div>
        </div>
        {this.renderFormOption()}
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
