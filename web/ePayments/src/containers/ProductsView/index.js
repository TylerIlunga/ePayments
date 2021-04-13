import React from 'react';
import { connect } from 'react-redux';
import DashboardMenu from '../../components/DashboardMenu';
import DataTable from '../../components/DataTable';
import BusinessProductService from '../../services/BusinessProductService';
import BusinessTransactionService from '../../services/BusinessTransactionService';
import toastUtils from '../../utils/Toasts';
import stringUtils from '../../utils/Strings';
import './index.css';

// TODO: Add CreateProduct feature
class ProductsView extends React.Component {
  constructor(props) {
    super(props);

    let selectedProduct = null;
    let view = 'list';
    if (
      props.location !== undefined &&
      props.location.state !== undefined &&
      props.location.state !== null &&
      props.location.state.selectedProduct !== undefined &&
      props.location.state.selectedProduct !== null
    ) {
      selectedProduct = props.location.state.selectedProduct;
      view = 'selected';
    }

    this.state = {
      selectedProduct,
      view,
      newProductData: {
        sku: '',
        label: '',
        description: '',
        price: '',
        category: '',
        inventoryCount: 0,
      },
      selectedProductUpdates: {},
      loadingProducts: true,
      products: [],
      productsTableOffset: 0,
      productsTablePage: 1,
      productsTableColumns: [
        { title: 'ID', field: 'id' },
        { title: 'SKU', field: 'sku' },
        { title: 'Date', field: 'created_at' },
        { title: 'Category', field: 'category' },
        { title: 'Label', field: 'label' },
        { title: 'Price', field: 'price' },
        { title: 'Inventory', field: 'inventory_count' },
        { title: 'Sales', field: 'purchased_count' },
      ],
      productsTableOptions: {
        search: true,
        paging: true,
        filtering: false,
        exportButton: true,
        exportFileName: 'ePayment-products',
      },
      loadingProductTransactions: false,
      transactionsTableOffset: 0,
      transactionsTablePage: 1,
      transactionsTableColumns: [
        { title: 'ID', field: 'id' },
        { title: 'Date', field: 'created_at' },
        { title: 'Product', field: 'product_id' },
        { title: 'Category', field: 'product_category' },
        { title: 'Quantity', field: 'quantity' },
        { title: 'Currency', field: 'currency' },
        { title: 'Token Amount', field: 'token_amount' },
        { title: 'Fiat Price', field: 'amount' },
        { title: 'Latitude', field: 'latitude' },
        { title: 'Longitude', field: 'longitude' },
      ],
      transactionsTableOptions: {
        search: true,
        paging: true,
        filtering: false,
        exportButton: true,
        exportFileName: 'ePayment-transactions',
      },
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.BusinessProductService = new BusinessProductService();
    this.BusinessTransactionService = new BusinessTransactionService();
    this.fetchProducts = this.fetchProducts.bind(this);
    this.fetchProductTransactions = this.fetchProductTransactions.bind(this);
    this.renderViewHeader = this.renderViewHeader.bind(this);
    this.renderProductsTable = this.renderProductsTable.bind(this);
    this.handleOnChangeRowsPerPage = this.handleOnChangeRowsPerPage.bind(this);
    this.handleOnChangeProductsTablePage = this.handleOnChangeProductsTablePage.bind(
      this,
    );
    this.handleOnChangeTransactionsTablePage = this.handleOnChangeTransactionsTablePage.bind(
      this,
    );
    this.handleOnRowClick = this.handleOnRowClick.bind(this);
    this.renderProductView = this.renderProductView.bind(this);
    this.exitProductDetailsView = this.exitProductDetailsView.bind(this);
    this.renderSelectedProductDetails = this.renderSelectedProductDetails.bind(
      this,
    );
    this.renderSelectedProduct = this.renderSelectedProduct.bind(this);
    this.updateSelectedProductField = this.updateSelectedProductField.bind(
      this,
    );
    this.persistSelectedProductUpdate = this.persistSelectedProductUpdate.bind(
      this,
    );
    this.renderCreateProductForm = this.renderCreateProductForm.bind(this);
    this.toggleCreateProductView = this.toggleCreateProductView.bind(this);
    this.updateNewProductData = this.updateNewProductData.bind(this);
    this.createNewProduct = this.createNewProduct.bind(this);
  }

  componentDidMount() {
    this.fetchProducts({
      // TODO: (UNCOMMENT) businessID: this.props.user.id,
      businessID: 9,
      queryAttributes: {
        limit: 5,
        order: 'DESC',
      },
    });
  }

  fetchProducts(queryData) {
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
        this.setState({ loadingProducts: false });
      });
  }

  fetchProductTransactions(queryData) {
    this.BusinessTransactionService.listTransactions(queryData)
      .then((res) => {
        console.log(
          'this.BusinessTransactionService.listTransactions res:',
          res,
        );
        if (res.error) {
          throw res.error;
        }
        this.setState({
          loadingProductTransactions: false,
          showProductTransactions: true,
          selectedProduct: {
            ...this.state.selectedProduct,
            transactions: res.businessTransactions,
          },
        });
      })
      .catch((error) => {
        console.log(
          'this.BusinessTransactionService.listTransactions error:',
          error,
        );
        if (typeof error !== 'string') {
          error = 'Loading failure: Please refresh and try again';
        }
        this.displayToastMessage('error', error);
        this.setState({ loadingProductTransactions: false });
      });
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

  renderViewHeader() {
    if (this.state.selectedProduct !== null) {
      return (
        <p className='ProductsHeaderLabel'>
          {`Product #${this.state.selectedProduct.id}: ${this.state.selectedProduct.label}`}
        </p>
      );
    }
    if (this.state.view === 'create') {
      return <p className='ProductsHeaderLabel'>Create</p>;
    }
    if (this.state.products !== null) {
      return <p className='ProductsHeaderLabel'>Products</p>;
    }
    return <p className='ProductsHeaderLabel'>Loading...</p>;
  }

  handleOnChangeRowsPerPage(table, pageSize) {
    let newState = null;
    let cb = null;
    if (table === 'products') {
      newState = { loadingProducts: true };
      cb = () => {
        this.fetchProducts({
          // TODO: (UNCOMMENT) businessID: this.props.user.id,
          businessID: 9,
          queryAttributes: {
            offset: this.state.productsTableOffset,
            limit: pageSize,
            order: 'DESC',
          },
        });
      };
    } else {
      newState = { loadingProductTransactions: true };
      cb = () => {
        this.fetchProductTransactions({
          // TODO: (UNCOMMENT) businessID: this.props.user.id,
          businessID: 9,
          queryAttributes: {
            // TODO: (UNCOMMENT) businessID: this.props.user.id,
            businessID: 9,
            productID: this.state.selectedProduct.id,
            offset: this.state.transactionsTableOffset,
            limit: pageSize,
            order: 'DESC',
          },
        });
      };
    }

    this.setState(newState, cb);
  }

  handleOnChangeProductsTablePage(tablePage, pageSize) {
    let productsTableOffset = this.state.productsTableOffset;
    if (
      tablePage !== productsTableOffset &&
      tablePage > this.state.productsTablePage
    ) {
      productsTableOffset += pageSize;
    }
    if (
      tablePage !== productsTableOffset &&
      tablePage < this.state.productsTablePage
    ) {
      productsTableOffset -= pageSize;
    }
    return this.setState(
      {
        productsTableOffset,
        productsTablePage: tablePage,
      },
      () => {
        if (this.state.products.length < productsTableOffset + pageSize) {
          this.fetchProducts({
            // TODO: (UNCOMMENT) businessID: this.props.user.id,
            businessID: 9,
            queryAttributes: {
              offset: productsTableOffset,
              limit: pageSize,
              order: 'DESC',
            },
          });
        }
      },
    );
  }

  handleOnChangeTransactionsTablePage(tablePage, pageSize) {
    let transactionsTableOffset = this.state.transactionsTableOffset;
    if (
      tablePage !== transactionsTableOffset &&
      tablePage > this.state.transactionsTablePage
    ) {
      transactionsTableOffset += pageSize;
    }
    if (
      tablePage !== transactionsTableOffset &&
      tablePage < this.state.transactionsTablePage
    ) {
      transactionsTableOffset -= pageSize;
    }
    this.setState(
      {
        transactionsTableOffset,
        transactionsTablePage: tablePage,
      },
      () => {
        if (
          this.state.transactions.length <
          transactionsTableOffset + pageSize
        ) {
          this.fetchProductTransactions({
            // TODO: (UNCOMMENT) businessID: this.props.user.id,
            businessID: 9,
            queryAttributes: {
              // TODO: (UNCOMMENT) businessID: this.props.user.id,
              businessID: 9,
              productID: this.state.selectedProduct.id,
              offset: transactionsTableOffset,
              limit: pageSize,
              order: 'DESC',
            },
          });
        }
      },
    );
  }

  handleOnRowClick(table, evt, rowData, toggleDetailPanel) {
    if (table === 'products') {
      this.setState({ selectedProduct: rowData, view: 'selected' });
    }
  }

  renderProductsTable() {
    return (
      <DataTable
        title='Inventory'
        isLoading={this.state.loadingProducts}
        data={this.state.products}
        columns={this.state.productsTableColumns}
        options={this.state.productsTableOptions}
        onChangeRowsPerPage={(ps) =>
          this.handleOnChangeRowsPerPage('products', ps)
        }
        onChangePage={(tp, ps) =>
          this['handleOnChangeProductsTablePage'](tp, ps)
        }
        onRowClick={(e, rd, tdp) =>
          this.handleOnRowClick('products', e, rd, tdp)
        }
      />
    );
  }

  generateNewProductSku() {
    const availableSymbols = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
    ];
    let productSku = '';
    let index = 0;

    while (index++ <= 15) {
      const randomIndex = Math.floor(Math.random() * availableSymbols.length);
      productSku += availableSymbols[randomIndex];
    }

    console.log('generateNewProductSku() productSku:', productSku);
    return productSku;
  }

  toggleCreateProductView(evt) {
    evt.preventDefault();
    this.setState({
      view: 'create',
      newProductData: {
        ...this.state.newProductData,
        sku: this.generateNewProductSku(),
      },
    });
  }

  renderListOfProducts() {
    return (
      <div className='MainProductViewContainer col-10'>
        <div className='MainProductViewHeaderContainer'>
          {this.renderViewHeader()}
        </div>
        <div className='MainProductViewCreateProductButtonContainer'>
          <button onClick={this.toggleCreateProductView}>Create Product</button>
        </div>
        <div className='MainProductViewTableContainer'>
          {this.renderProductsTable()}
        </div>
      </div>
    );
  }

  exitProductDetailsView() {
    this.setState({
      selectedProduct: null,
      view: 'list',
      showProductTransactions: false,
    });
  }

  updateNewProductData(evt, field) {
    this.setState(
      {
        newProductData: {
          ...this.state.newProductData,
          [field]: evt.target.value,
        },
      },
      () =>
        console.log(
          'new this.state.newProductData:',
          this.state.newProductData,
        ),
    );
  }

  updateSelectedProductField(evt, field) {
    this.setState(
      {
        selectedProduct: {
          ...this.state.selectedProduct,
          [field]: evt.target.value,
        },
        selectedProductUpdates: {
          ...this.state.selectedProductUpdates,
          [stringUtils.snakeToCamel(field)]: evt.target.value,
        },
      },
      () =>
        console.log(
          'new this.state.selectedProduct, this.state.selectedProductUpdates:',
          this.state.selectedProduct,
          this.state.selectedProductUpdates,
        ),
    );
  }

  persistSelectedProductUpdate(evt) {
    evt.preventDefault();
    this.BusinessProductService.updateProduct({
      businessID: this.state.selectedProduct.user_id,
      businessProductID: this.state.selectedProduct.id,
      sku: this.state.selectedProduct.sku,
      updates: this.state.selectedProductUpdates,
    })
      .then((res) => {
        console.log('this.BusinessProductService.updateProduct res:', res);
        if (res.error) {
          throw res.error;
        }
        this.setState({ selectedProduct: null }, () => {
          this.fetchProducts({
            businessID: this.state.selectedProduct.user_id,
            queryAttributes: {
              limit: 5,
              order: 'DESC',
            },
          });
        });
      })
      .catch((error) => {
        console.log('this.BusinessProductService.updateProduct error:', error);
        if (typeof error !== 'string') {
          error = 'Update failure: Please try again';
        }
        this.displayToastMessage('error', error);
        this.setState({ loadingProducts: false });
      });
  }

  renderSelectedProduct() {
    const businessID = this.state.selectedProduct.user_id;
    const productID = this.state.selectedProduct.id;
    const sku = this.state.selectedProduct.sku;
    // NOTE: QR Scanner will split on ":" to get each attribute to create a transaction.
    const productQRCode = `https://chart.googleapis.com/chart?cht=qr&chl=${businessID}:${productID}:${sku}&chs=160x160&chld=L|0`;
    return (
      <form className='MainProductViewDetails'>
        <label>ID: {productID}</label>
        <label>SKU: {sku}</label>
        <label>Category: </label>
        <input
          type='text'
          value={this.state.selectedProduct.category}
          onChange={(evt) => this.updateSelectedProductField(evt, 'category')}
        />
        <label>Label: </label>
        <input
          type='text'
          value={this.state.selectedProduct.label}
          onChange={(evt) => this.updateSelectedProductField(evt, 'label')}
        />
        <label>Description: </label>
        <input
          type='text'
          value={this.state.selectedProduct.description}
          onChange={(evt) =>
            this.updateSelectedProductField(evt, 'description')
          }
        />
        <label>Price: </label>
        <input
          type='text'
          value={this.state.selectedProduct.price}
          onChange={(evt) => this.updateSelectedProductField(evt, 'price')}
        />
        <label>Inventory: </label>
        <input
          type='text'
          value={this.state.selectedProduct.inventory_count}
          onChange={(evt) =>
            this.updateSelectedProductField(evt, 'inventory_count')
          }
        />
        <img alt='productQRCode' src={productQRCode} />
        <input
          type='button'
          value='Exit'
          onClick={this.exitProductDetailsView}
        />
        <input
          type='button'
          value='Update'
          onClick={this.persistSelectedProductUpdate}
        />
      </form>
    );
  }

  renderSelectedProductTransactions() {
    if (!this.state.showProductTransactions) {
      return (
        <button
          className='ProductViewDetailsShowTransactionButton'
          onClick={(evt) =>
            this.fetchProductTransactions({
              // TODO: (UNCOMMENT) businessID: this.props.user.id,
              businessID: 9,
              queryAttributes: {
                // TODO: (UNCOMMENT) businessID: this.props.user.id,
                businessID: 9,
                productID: this.state.selectedProduct.id,
                limit: 5,
                order: 'DESC',
              },
            })
          }
        >
          Show Transactional Data
        </button>
      );
    }
    return (
      <DataTable
        title='Transactions'
        isLoading={this.state.loadingProductTransactions}
        data={this.state.selectedProduct.transactions}
        columns={this.state.transactionsTableColumns}
        options={this.state.transactionsTableOptions}
        onChangeRowsPerPage={(ps) =>
          this.handleOnChangeRowsPerPage('transactions', ps)
        }
        onChangePage={(tp, ps) =>
          this['handleOnChangeTransactionsTablePage'](tp, ps)
        }
        onRowClick={(e, rd, tdp) =>
          this.handleOnRowClick('transactions', e, rd, tdp)
        }
      />
    );
  }

  newProductDataIsValid(newProductData) {
    const {
      sku,
      label,
      description,
      price,
      category,
      inventoryCount,
    } = newProductData;
    if (!(sku && label && description && price && category)) {
      return { error: 'Please provide values for all fields.' };
    }
    if (inventoryCount === 0) {
      return { error: 'Inventory count can not be zero.' };
    }
    if (isNaN(price)) {
      return { error: 'The price should be a valid number.' };
    }
    if (isNaN(inventoryCount)) {
      return { error: 'The inventory count should be a valid number.' };
    }
    return null;
  }

  createNewProduct(evt) {
    evt.preventDefault();

    const validationResult = this.newProductDataIsValid(
      this.state.newProductData,
    );

    if (validationResult !== null) {
      return this.displayToastMessage('error', validationResult.error);
    }

    // this.BusinessProductService.createNewProduct(
    //   this.props.user.id,
    //   this.state.newProductData,
    // )
    this.BusinessProductService.createNewProduct(9, this.state.newProductData)
      .then((res) => {
        console.log('this.BusinessProductService.createNewProduct() res:', res);
        if (res.error) {
          throw res.error;
        }
        this.displayToastMessage('success', 'Success');
        this.fetchProducts({
          // TODO: (UNCOMMENT) businessID: this.props.user.id,
          businessID: 9,
          queryAttributes: {
            limit: 5,
            order: 'DESC',
          },
        });
        this.setState({
          view: 'list',
          newProductData: {
            sku: '',
            label: '',
            description: '',
            price: '',
            category: '',
            inventoryCount: 0,
          },
        });
      })
      .catch((error) => {
        console.log(
          'this.BusinessProductService.createNewProduct error:',
          error,
        );
        if (typeof error !== 'string') {
          error = 'Creation failure: Please try again';
        }
        this.displayToastMessage('error', error);
      });
  }

  renderCreateProductForm() {
    return (
      <div className='ProductViewDetailsMainContainer col-10'>
        <div className='ProductViewDetailsHeaderContainer'>
          {this.renderViewHeader()}
        </div>
        <div className='MainProductViewCreateFormContainer'>
          <form className='MainProductViewCreateForm'>
            <label>Sku:</label>
            <input disabled value={this.state.newProductData.sku} />
            <label>Category:</label>
            <input
              value={this.state.newProductData.category}
              onChange={(e) => this.updateNewProductData(e, 'category')}
            />
            <label>Label:</label>
            <input
              value={this.state.newProductData.label}
              onChange={(e) => this.updateNewProductData(e, 'label')}
            />
            <label>Description:</label>
            <input
              value={this.state.newProductData.description}
              onChange={(e) => this.updateNewProductData(e, 'description')}
            />
            <label>Price:</label>
            <input
              value={this.state.newProductData.price}
              onChange={(e) => this.updateNewProductData(e, 'price')}
            />
            <label>Inventory Count:</label>
            <input
              value={this.state.newProductData.inventoryCount}
              onChange={(e) => this.updateNewProductData(e, 'inventoryCount')}
            />
            <button
              className='MainProductViewCreateFormCreateButton'
              onClick={(e) => this.setState({ view: 'list' })}
            >
              Exit
            </button>
            <button
              className='MainProductViewCreateFormCreateButton'
              onClick={this.createNewProduct}
            >
              Create
            </button>
          </form>
        </div>
      </div>
    );
  }

  renderSelectedProductDetails() {
    return (
      <div className='ProductViewDetailsMainContainer col-10'>
        <div className='ProductViewDetailsHeaderContainer'>
          {this.renderViewHeader()}
        </div>
        <div className='MainProductViewDetailsContainer'>
          {this.renderSelectedProduct()}
        </div>
        <div className='MainProductViewTransactionsContainer'>
          {this.renderSelectedProductTransactions()}
        </div>
      </div>
    );
  }

  renderProductView() {
    if (this.state.selectedProduct === null && this.state.view === 'list') {
      return this.renderListOfProducts();
    }
    if (this.state.view === 'create') {
      return this.renderCreateProductForm();
    }
    return this.renderSelectedProductDetails();
  }

  render() {
    return (
      <div className='MainProductViewContainer row'>
        {this.renderMenuColumn()}
        {this.renderProductView()}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ProductsView);
