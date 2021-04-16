import React from 'react';
import { connect } from 'react-redux';
import QrReader from 'react-qr-reader';
import toastUtils from '../../utils/Toasts';
import './index.css';
import BusinessProductService from '../../services/BusinessProductService';
import BusinessTransactionService from '../../services/BusinessTransactionService';

class CheckoutView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      view: 'scan',
      scannedProduct: null,
      checkoutQuantity: 1,
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.BusinessProductService = new BusinessProductService();
    this.BusinessTransactionService = new BusinessTransactionService();

    this.renderCheckoutDetailsView = this.renderCheckoutDetailsView.bind(this);
    this.computeTotalPrice = this.computeTotalPrice.bind(this);
    this.fetchUsersLocation = this.fetchUsersLocation.bind(this);
    this.handleTransaction = this.handleTransaction.bind(this);
    this.handleUpdateCheckoutQuantity = this.handleUpdateCheckoutQuantity.bind(
      this,
    );
    this.renderScanView = this.renderScanView.bind(this);
    this.handleScanSuccess = this.handleScanSuccess.bind(this);
    this.handleScanError = this.handleScanError.bind(this);
    this.segueToHome = this.segueToHome.bind(this);
  }

  computeTotalPrice() {
    return this.state.scannedProduct.price * this.state.checkoutQuantity;
  }

  handleUpdateCheckoutQuantity(evt) {
    this.setState({ checkoutQuantity: evt.target.value });
  }

  fetchUsersLocation() {
    return new Promise((resolve, reject) => {
      function success(position) {
        return resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }
      function error() {
        return resolve(null);
      }

      if (!window.navigator.geolocation) {
        return resolve(null);
      }

      window.navigator.geolocation.getCurrentPosition(success, error);
    });
  }

  handleTransaction(evt, status) {
    if (status === 'decline') {
      return this.setState({ scannedProduct: null, view: 'scan' });
    }

    this.setState({ loading: true }, () => {
      this.fetchUsersLocation().then((locationData) => {
        const createNewTransactionData = {
          businessID: this.state.scannedProduct.user_id,
          // TODO: (UNCOMMENT) customerID: this.props.user.id,
          customerID: 10,
          productID: this.state.scannedProduct.id,
          sku: this.state.scannedProduct.sku,
          productCategory: this.state.scannedProduct.category,
          quantity: this.state.checkoutQuantity,
          // NOTE: If we have time, handle BTC, ETH, LTC...
          currency: 'BTC',
        };
        if (locationData !== null) {
          createNewTransactionData.latitude = locationData.latitude;
          createNewTransactionData.longitude = locationData.longitude;
        }
        this.BusinessTransactionService.createNewTransaction(
          createNewTransactionData,
        )
          .then((res) => {
            console.log(
              'this.BusinessTransactionService.createNewTransaction() res:',
              res,
            );
            if (res.error) {
              throw res.error;
            }

            this.displayToastMessage(
              'success',
              "Success: Click/Tap 'Exit' to review your recent transaction.",
            );
            this.setState({
              loading: false,
              view: 'scan',
              scannedProduct: null,
              checkoutQuantity: 1,
            });
          })
          .catch((error) => {
            console.log(
              'this.BusinessTransactionService.createNewTransaction error:',
              error,
            );
            if (typeof error !== 'string') {
              error = 'Transaction Failed: Please try again.';
            }
            this.displayToastMessage('error', error);
            this.setState({ loading: false });
          });
      });
    });
  }

  renderProductDetails() {
    return (
      <div className='MainCheckoutViewProductDetailsContainer'>
        <p className='MainCheckoutViewProductDetailsLabel'>
          SKU: {this.state.scannedProduct.sku}
        </p>
        <p className='MainCheckoutViewProductDetailsLabel'>
          Product: {this.state.scannedProduct.label}
        </p>
        <p className='MainCheckoutViewProductDetailsLabel'>
          Description: {this.state.scannedProduct.description}
        </p>
        <p className='MainCheckoutViewProductDetailsLabel'>
          Category: {this.state.scannedProduct.category}
        </p>
        <p className='MainCheckoutViewProductDetailsLabel'>
          Price: ${this.state.scannedProduct.price}
        </p>
        <label className='MainCheckoutViewProductDetailsLabel'>
          <strong>Enter Quantity:</strong>
        </label>
        <input
          type='number'
          min='1'
          max={this.state.scannedProduct.inventory_count}
          value={this.state.checkoutQuantity}
          onChange={this.handleUpdateCheckoutQuantity}
        />
        <p className='MainCheckoutViewProductDetailsLabel'>
          Total Price: ${this.computeTotalPrice()}
        </p>
      </div>
    );
  }

  renderConfirmationButtons() {
    if (this.state.loading) {
      return (
        <div className='MainCheckoutViewConfirmationButtonsContainer'>
          <button disabled className='MainCheckoutViewButton LoadingButton'>
            Loading...
          </button>
        </div>
      );
    }
    return (
      <div className='MainCheckoutViewConfirmationButtonsContainer'>
        <button
          className='MainCheckoutViewButton DeclineButton'
          onClick={(evt) => this.handleTransaction(evt, 'decline')}
        >
          Decline
        </button>
        <button
          className='MainCheckoutViewButton ConfirmButton'
          onClick={(evt) => this.handleTransaction(evt, 'confirm')}
        >
          Confirm
        </button>
      </div>
    );
  }

  renderCheckoutDetailsView() {
    return (
      <div className='MainCheckoutViewContainer'>
        {this.renderProductDetails()}
        {this.renderConfirmationButtons()}
      </div>
    );
  }
  handleScanSuccess(dataFromScan) {
    if (dataFromScan === null) {
      return;
    }
    this.setState({ loading: true }, () => {
      // Format: ${businessID}:${productID}:${sku}
      const requiredQRData = dataFromScan.split(':');
      if (requiredQRData.length !== 3) {
        return this.displayToastMessage(
          'error',
          'Scan Error: Invalid Data Format',
        );
      }

      this.BusinessProductService.fetchProduct({
        businessID: requiredQRData[0],
        businessProductID: requiredQRData[1],
        sku: requiredQRData[2],
        withTransactions: false,
      })
        .then((res) => {
          console.log('this.BusinessProductService.fetchProduct() res:', res);
          if (res.error) {
            throw res.error;
          }

          this.setState({
            loading: false,
            scannedProduct: res.product,
            view: 'checkoutDetails',
          });
        })
        .catch((error) => {
          console.log('this.BusinessProductService.fetchProduct error:', error);
          if (typeof error !== 'string') {
            error = 'Scan Error: Failed to fetch product data';
          }
          this.displayToastMessage('error', error);
          this.setState({ loading: false });
        });
    });
  }

  handleScanError(error) {
    this.displayToastMessage('error', error);
  }

  segueToHome() {
    this.props.history.replace('/h/transactions');
  }

  renderScanView() {
    // TODO: Add BrandHeader to CheckoutView
    return (
      <div className='MainCheckoutViewContainer'>
        <div className='CheckoutViewHeaderContainer'>
          <p>Scan QR Code</p>
        </div>
        <div className='CheckoutViewQRScannerContainer'>
          <QrReader
            delay={300}
            onError={this.handleScanError}
            onScan={this.handleScanSuccess}
            style={{ width: '100%' }}
          />
        </div>
        <div className='CheckoutViewHomeButtonContainer'>
          <button onClick={this.segueToHome}>Exit</button>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.scannedProduct && this.state.view === 'checkoutDetails') {
      return this.renderCheckoutDetailsView();
    }
    return this.renderScanView();
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutView);
