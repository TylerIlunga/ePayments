import React from 'react';
import { connect } from 'react-redux';
import { setProfile } from '../../redux/actions/profile';
import ProfileService from '../../services/ProfileService';
import toastUtils from '../../utils/Toasts';
import './index.css';

class CreateProfileView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'customer',
    };
    this.ProfileService = new ProfileService();
    this.displayToastMessage = toastUtils.displayToastMessage;
  }

  render() {
    return (
      <div>
        <p>CreateProfileView</p>
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
