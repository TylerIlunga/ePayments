import React from 'react';
import { connect } from 'react-redux';
import './index.css';

class ConnectPaymentAccountView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <p>ConnectPaymentAccountView</p>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConnectPaymentAccountView);
