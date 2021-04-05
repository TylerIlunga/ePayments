import React from 'react';
import { connect } from 'react-redux';
import DashboardMenu from '../../components/DashboardMenu';
import BusinessProductService from '../../services/BusinessProductService';
import BusinessTransactionService from '../../services/BusinessTransactionService';
import toastUtils from '../../utils/Toasts';
import './index.css';

class ProductsView extends React.Component {
  constructor(props) {
    super(props);

    let selectedProduct = null;
    if (
      props.location !== undefined &&
      props.location.state !== undefined &&
      props.location.state !== null &&
      props.location.state.selectedProduct !== undefined &&
      props.location.state.selectedProduct !== null
    ) {
      selectedProduct = props.location.state.selectedProduct;
    }

    this.state = {
      selectedProduct,
      loadingProducts: true,
      products: null,
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.BusinessProductService = new BusinessProductService();
    this.BusinessTransactionService = new BusinessTransactionService();

    this.renderTableHeader = this.renderTableHeader.bind(this);
  }

  componentDidMount() {
    // const queryData = {
    //   businessID: this.props.user.id,
    //   queryAttributes: {
    //     "limit": 5,
    //     "order": "DESC"
    //   }
    // }
    const queryData = {
      businessID: 7,
      queryAttributes: {
        limit: 5,
        order: 'DESC',
      },
    };
    this.BusinessProductService.listProducts(queryData)
      .then((res) => {
        console.log('this.BusinessProductService.listProducts() res:', res);
        if (res.error) {
          throw res.error;
        }

        this.setState({ loadingProducts: false, products: res.products });
      })
      .catch((error) => {
        console.log('this.BusinessProductService.listProducts error:', error);
        if (typeof error !== 'string') {
          error = 'Loading failure: Please refresh and try again';
        }
        this.displayToastMessage('error', error);
        this.setState({ loadingTableData: false });
      });
  }

  renderMenuColumn() {
    return <DashboardMenu colSize='col-2' user={this.props.user} />;
  }

  renderTableHeader() {
    if (this.state.products !== null) {
      return;
    }
    return <p className='ProductsHeaderLabel'>Loading...</p>;
  }

  renderProductsTable() {
    return <div>DataTable</div>;
  }

  renderProducts() {
    return (
      <div className='MainProductViewTransactionsContainer col-10'>
        <div className='MainProductViewTransactionsHeaderContainer'>
          {this.renderTableHeader()}
        </div>
        <div className='MainProductViewTransactionsTableContainer'>
          {this.renderProductsTable()}
        </div>
      </div>
    );
  }

  renderListOfProducts() {
    return (
      <div className='MainProductViewContainer row'>
        {this.renderMenuColumn()}
        {this.renderProducts()}
      </div>
    );
  }

  render() {
    if (this.state.selectedProduct !== null) {
      return this.renderSelectedProductDetails();
    }
    return this.renderListOfProducts();
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ProductsView);
