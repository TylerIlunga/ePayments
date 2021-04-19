import React from 'react';
import { connect } from 'react-redux';
import QrReader from 'modern-react-qr-reader';
import BrandHeader from '../../components/BrandHeader';
import DashboardMenu from '../../components/DashboardMenu';
import BusinessProductService from '../../services/BusinessProductService';
import BusinessTransactionService from '../../services/BusinessTransactionService';
import toastUtils from '../../utils/Toasts';
import './index.css';

class CheckoutView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMobileMenuModal: false,
      loading: false,
      view: 'checkoutDetails',
      QrReaderStyle: {
        width: '300px',
        padding: '0',
        margin: '0',
      },
      scannedProduct: null,
      checkoutQuantity: 1,
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.BusinessProductService = new BusinessProductService();
    this.BusinessTransactionService = new BusinessTransactionService();
    this.renderBrandRow = this.renderBrandRow.bind(this);
    this.handleToggleMobileMenuModal = this.handleToggleMobileMenuModal.bind(
      this,
    );
    this.renderMenuColumn = this.renderMenuColumn.bind(this);
    this.renderCheckoutHeader = this.renderCheckoutHeader.bind(this);
    this.renderCheckoutView = this.renderCheckoutView.bind(this);
    this.renderScanView = this.renderScanView.bind(this);
    this.renderQRScanner = this.renderQRScanner.bind(this);
    this.handleScanSuccess = this.handleScanSuccess.bind(this);
    this.handleScanError = this.handleScanError.bind(this);
    this.renderCheckoutDetailsView = this.renderCheckoutDetailsView.bind(this);
    this.computeTotalPrice = this.computeTotalPrice.bind(this);
    this.fetchUsersLocation = this.fetchUsersLocation.bind(this);
    this.handleTransaction = this.handleTransaction.bind(this);
    this.handleUpdateCheckoutQuantity = this.handleUpdateCheckoutQuantity.bind(
      this,
    );
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
        activeOption='Checkout'
        user={this.props.user}
        history={this.props.history}
        displayToastMessage={this.displayToastMessage}
      />
    );
  }

  renderCheckoutHeader() {
    if (this.state.scannedProduct && this.state.view === 'checkoutDetails') {
      return (
        <p className='StdContentHeaderLabel CheckoutViewHeaderLabel'>
          Product: {this.state.scannedProduct.label}
        </p>
      );
    }
    return <p className='StdContentHeaderLabel'>Scan QR Code</p>;
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
      function error(error) {
        console.log('getCurrentPosition error:', error);
        return resolve(null);
      }

      if (!window.navigator.geolocation) {
        return resolve(null);
      }
      const options = {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 0,
      };

      window.navigator.geolocation.getCurrentPosition(success, error, options);
    });
  }

  getActiveTokenSymbolForUser(paymentAccount) {
    if (paymentAccount['coinbase_ethereum_address'] !== null) {
      return 'ETH';
    }
    if (paymentAccount['coinbase_litecoin_address'] !== null) {
      return 'LTC';
    }
    return 'BTC';
  }

  handleTransaction(evt, status) {
    if (status === 'decline') {
      this.displayToastMessage('error', 'Transaction Denied');
      return this.setState({ scannedProduct: null, view: 'scan' });
    }

    this.setState({ loading: true }, () => {
      this.fetchUsersLocation().then((locationData) => {
        const createNewTransactionData = {
          businessID: this.state.scannedProduct.user_id,
          customerID: this.props.user.id,
          productID: this.state.scannedProduct.id,
          sku: this.state.scannedProduct.sku,
          productCategory: this.state.scannedProduct.category,
          productLabel: this.state.scannedProduct.label,
          quantity: this.state.checkoutQuantity,
          currency: this.getActiveTokenSymbolForUser(this.props.paymentAccount),
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

            this.displayToastMessage('success', 'Success');
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
          Description: {this.state.scannedProduct.description}
        </p>
        <p className='MainCheckoutViewProductDetailsLabel'>
          Category: {this.state.scannedProduct.category}
        </p>
        <p className='MainCheckoutViewProductDetailsLabel'>
          Price: ${this.state.scannedProduct.price}
        </p>
        <label className='MainCheckoutViewProductDetailsLabel'>
          Enter Quantity:
        </label>
        <input
          className='MainCheckoutViewProductInventoryInput'
          type='number'
          min='1'
          max={this.state.scannedProduct.inventory_count}
          value={this.state.checkoutQuantity}
          onChange={this.handleUpdateCheckoutQuantity}
        />
        <p className='CheckoutViewTotalPriceLabel'>
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
      <div className='StdViewContentContainer col-sm-11 col-12'>
        <div className='StdViewContentHeaderContainer'>
          {this.renderCheckoutHeader()}
        </div>
        <div className='CheckoutViewContentContainer'>
          {this.renderProductDetails()}
          {this.renderConfirmationButtons()}
        </div>
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

  renderQRScanner() {
    if (this.state.scannedProduct && this.state.view === 'checkoutDetails') {
      return null;
    }
    return (
      <div className='CheckoutViewQRScannerContainer'>
        {/* NOTE: Due to browser implementations the camera can only be accessed over https or localhost. */}
        <QrReader
          delay={300}
          onError={this.handleScanError}
          onScan={this.handleScanSuccess}
          style={this.state.QrReaderStyle}
          facingMode={'environment'}
        />
      </div>
    );
  }

  renderScanView() {
    return (
      <div className='StdViewContentContainer col-sm-11 col-12'>
        <div className='StdViewContentHeaderContainer row'>
          {this.renderCheckoutHeader()}
        </div>
        <div className='CheckoutViewContentContainer row'>
          {this.renderQRScanner()}
        </div>
      </div>
    );
  }

  renderCheckoutView() {
    if (this.state.scannedProduct && this.state.view === 'checkoutDetails') {
      return this.renderCheckoutDetailsView();
    }
    return this.renderScanView();
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
          {this.renderCheckoutView()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  paymentAccount: state.paymentAccount,
  user: state.user,
});

export default connect(mapStateToProps, null)(CheckoutView);
