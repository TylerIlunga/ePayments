import React from 'react';
import { connect } from 'react-redux';
import BrandHeader from '../../components/BrandHeader';
import DashboardMenu from '../../components/DashboardMenu';
import DataTable from '../../components/DataTable';
import BusinessProductService from '../../services/BusinessProductService';
import BusinessTransactionService from '../../services/BusinessTransactionService';
import toastUtils from '../../utils/Toasts';
import stringUtils from '../../utils/Strings';
import './index.css';

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
      displayMobileMenuModal: false,
      displayQRCodeModal: false,
      selectedProduct,
      view,
      newProductData: {
        sku: '',
        label: '',
        description: '',
        price: '',
        category: '',
        inventoryCount: '',
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
      importedProducts: null,
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.BusinessProductService = new BusinessProductService();
    this.BusinessTransactionService = new BusinessTransactionService();
    this.handleToggleMobileMenuModal = this.handleToggleMobileMenuModal.bind(
      this,
    );
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
    this.renderSelectedProductDetails = this.renderSelectedProductDetails.bind(
      this,
    );
    this.renderSelectedProduct = this.renderSelectedProduct.bind(this);
    this.renderSelectedProductQRCode = this.renderSelectedProductQRCode.bind(
      this,
    );
    this.handleDisplayQRCodeModal = this.handleDisplayQRCodeModal.bind(this);
    this.updateSelectedProductField = this.updateSelectedProductField.bind(
      this,
    );
    this.persistSelectedProductUpdate = this.persistSelectedProductUpdate.bind(
      this,
    );
    this.renderCreateProductForm = this.renderCreateProductForm.bind(this);
    this.toggleCreateProductView = this.toggleCreateProductView.bind(this);
    this.renderImportProductsView = this.renderImportProductsView.bind(this);
    this.handleImportedProductsFile = this.handleImportedProductsFile.bind(
      this,
    );
    this.renderImportedProductsDetails = this.renderImportedProductsDetails.bind(
      this,
    );
    this.persistImportedProducts = this.persistImportedProducts.bind(this);
    this.toggleImportProductsView = this.toggleImportProductsView.bind(this);
    this.updateNewProductData = this.updateNewProductData.bind(this);
    this.createNewProduct = this.createNewProduct.bind(this);
  }

  componentDidMount() {
    this.fetchProducts({
      businessID: this.props.user.id,
      queryAttributes: {
        limit: 10,
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
        this.setState({
          loadingProducts: false,
          products: res.products,
          selectedProduct: null,
          view: 'list',
        });
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
        activeOption='Products'
        user={this.props.user}
        history={this.props.history}
        displayToastMessage={this.displayToastMessage}
      />
    );
  }

  renderViewHeader() {
    if (this.state.selectedProduct !== null) {
      return (
        <p className='StdContentHeaderLabel'>
          {`Product #${this.state.selectedProduct.id}: ${this.state.selectedProduct.label}`}
        </p>
      );
    }
    if (this.state.view === 'create') {
      return <p className='StdContentHeaderLabel'>New Product</p>;
    }
    if (this.state.view === 'import') {
      return <p className='StdContentHeaderLabel'>Import</p>;
    }
    if (this.state.products !== null) {
      return <p className='StdContentHeaderLabel'>Products</p>;
    }
    return <p className='StdContentHeaderLabel'>Loading...</p>;
  }

  handleOnChangeRowsPerPage(table, pageSize) {
    console.log(
      'handleOnChangeRowsPerPage() table, pageSize:',
      table,
      pageSize,
    );
    if (table === 'products') {
      return this.setState({ loadingProducts: true }, () => {
        this.fetchProducts({
          businessID: this.props.user.id,
          queryAttributes: {
            offset: this.state.productsTableOffset,
            limit: pageSize,
            order: 'DESC',
          },
        });
      });
    }
  }

  handleOnChangeProductsTablePage(tablePage, pageSize) {
    console.log(
      'handleOnChangeProductsTablePage() tablePage, pageSize:',
      tablePage,
      pageSize,
    );
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
    return this.setState({
      productsTableOffset,
      productsTablePage: tablePage,
    });
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
            businessID: this.props.user.id,
            queryAttributes: {
              businessID: this.props.user.id,
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
    evt.preventDefault();
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

  toggleImportProductsView(evt) {
    evt.preventDefault();
    this.setState({ view: 'import' });
  }

  renderListOfProducts() {
    return (
      <div className='StdViewContentContainer col-sm-11 col-12'>
        <div className='ProductsViewHeaderContainer'>
          {this.renderViewHeader()}
        </div>
        <div className='ProductsViewActionButtonContainer '>
          <button onClick={this.toggleCreateProductView}>
            Add to Inventory
          </button>
        </div>
        <div className='ProductsViewActionButtonContainer '>
          <button onClick={this.toggleImportProductsView}>
            Import Products
          </button>
        </div>
        <div className='ProductsViewTableContainer'>
          {this.renderProductsTable()}
        </div>
      </div>
    );
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
        this.fetchProducts({
          businessID: this.state.selectedProduct.user_id,
          queryAttributes: {
            limit: 5,
            order: 'DESC',
          },
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

  renderSelectedProductTransactions() {
    if (!this.state.showProductTransactions) {
      return (
        <button
          className='ProductViewDetailsShowTransactionButton'
          onClick={(evt) =>
            this.fetchProductTransactions({
              businessID: this.props.user.id,
              queryAttributes: {
                businessID: this.props.user.id,
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

    this.BusinessProductService.createNewProduct(
      this.props.user.id,
      this.state.newProductData,
    )
      .then((res) => {
        console.log('this.BusinessProductService.createNewProduct() res:', res);
        if (res.error) {
          throw res.error;
        }
        this.displayToastMessage('success', 'Success');

        this.setState(
          {
            newProductData: {
              sku: '',
              label: '',
              description: '',
              price: '',
              category: '',
              inventoryCount: 0,
            },
          },
          () => {
            this.fetchProducts({
              businessID: this.props.user.id,
              queryAttributes: {
                limit: 5,
                order: 'DESC',
              },
            });
          },
        );
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
      <div className='StdViewContentContainer col-sm-11 col-12'>
        <div className='ProductsViewHeaderContainer'>
          {this.renderViewHeader()}
        </div>
        <div className='ProductsViewCreateFormContainer'>
          <form className='ProductsViewCreateForm'>
            <input
              value={this.state.newProductData.category}
              onChange={(e) => this.updateNewProductData(e, 'category')}
              placeholder='Category'
            />
            <input
              value={this.state.newProductData.label}
              onChange={(e) => this.updateNewProductData(e, 'label')}
              placeholder='Label'
            />
            <input
              value={this.state.newProductData.description}
              onChange={(e) => this.updateNewProductData(e, 'description')}
              placeholder='Description'
            />
            <input
              value={this.state.newProductData.price}
              onChange={(e) => this.updateNewProductData(e, 'price')}
              placeholder='Price'
            />
            <input
              value={this.state.newProductData.inventoryCount}
              onChange={(e) => this.updateNewProductData(e, 'inventoryCount')}
              placeholder='Inventory Count'
            />
            <button
              className='ProductsViewFormButton'
              onClick={this.createNewProduct}
            >
              Create
            </button>
          </form>
        </div>
      </div>
    );
  }

  renderSelectedProduct() {
    return (
      <div className='ProductsViewDetailsFormContainer col-sm-8 col-12'>
        <form className='ProductsViewDetailsForm'>
          <label>ID: {this.state.selectedProduct.id}</label>
          <label>SKU: {this.state.selectedProduct.sku}</label>
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
          <button
            className='ProductsViewFormButton'
            onClick={this.persistSelectedProductUpdate}
          >
            Update
          </button>
        </form>
      </div>
    );
  }

  renderImportedProductsDescription() {
    if (this.state.importedProducts) {
      return <p>Please review the imported products.</p>;
    }
    return <p>Make sure the file is structured as the following...</p>;
  }

  persistImportedProducts(evt) {
    // TODO: E2E Implementation
    evt.preventDefault();
  }

  renderImportedProductsDetails() {
    if (this.state.importedProducts) {
      return (
        <div className='ProductsViewImportedProductsDetailsContainer'>
          <div className='ProductsViewImportedProductsTable'>
            <DataTable
              title='Inventory'
              isLoading={this.state.loadingProducts}
              data={this.state.importedProducts.data}
              columns={this.state.importedProducts.tableColumns}
              options={this.state.productsTableOptions}
            />
          </div>
          <div className='ProductsViewImportedProductsImportButtonContainer'>
            <button onClick={this.persistImportedProducts}>Import</button>
          </div>
        </div>
      );
    }
  }

  handleImportedProductsFile(evt) {
    const csvFile = evt.target.files[0];
    console.log('handleImportedProductsFile() csvFile', csvFile);

    // TODO: Handle if file is not a csv file

    const fileReader = new FileReader();

    fileReader.onload = () => {
      const importedProducts = window.$.csv.toObjects(fileReader.result);
      console.log('importedProducts:,', importedProducts);

      // TODO: Handle if csv file is empty

      const tableColumns = Object.keys(importedProducts[0]).map((field) => {
        return { field, title: stringUtils.capitalize(field) };
      });
      this.setState({
        importedProducts: {
          tableColumns,
          data: importedProducts,
        },
      });
    };

    fileReader.readAsBinaryString(csvFile);
  }

  renderImportProductsView() {
    return (
      <div className='StdViewContentContainer col-sm-11 col-12'>
        <div className='ProductsViewHeaderContainer'>
          {this.renderViewHeader()}
        </div>
        <div className='ProductsViewImportNotesContainer'>
          {this.renderImportedProductsDescription()}
        </div>
        <div className='ProductsViewImportDetailsContainer'>
          <input type='file' onChange={this.handleImportedProductsFile} />
          {this.renderImportedProductsDetails()}
        </div>
      </div>
    );
  }

  handleDisplayQRCodeModal(evt) {
    evt.preventDefault();
    this.setState({ displayQRCodeModal: !this.state.displayQRCodeModal });
  }

  renderSelectedProductQRCode(fillView) {
    const businessID = this.state.selectedProduct.user_id;
    const productID = this.state.selectedProduct.id;
    const sku = this.state.selectedProduct.sku;
    // NOTE: QR Scanner will split on ":" to get each attribute to create a transaction.
    const productQRCode = `https://chart.googleapis.com/chart?cht=qr&chl=${businessID}:${productID}:${sku}&chs=285x285&chld=L|0`;
    if (fillView) {
      return (
        <div className='StdViewContentContainer col-sm-11 col-12'>
          <div className='ProductsViewHeaderContainer'>
            {this.renderViewHeader()}
          </div>
          <div className='ProductsViewDetailsContainer row'>
            <div className='ProductsViewProductQRContainer col-12'>
              <img
                alt='productQRCode'
                src={productQRCode}
                onClick={this.handleDisplayQRCodeModal}
              />
            </div>
          </div>
          {/* <div className='ProductsViewTransactionsContainer'>
          {this.renderSelectedProductTransactions()}
        </div> */}
        </div>
      );
    }
    return (
      <div className='ProductsViewProductQRContainer col-sm-4 col-12'>
        <img
          alt='productQRCode'
          src={productQRCode}
          onClick={this.handleDisplayQRCodeModal}
        />
      </div>
    );
  }

  renderSelectedProductDetails() {
    return (
      <div className='StdViewContentContainer col-sm-11 col-12'>
        <div className='ProductsViewHeaderContainer'>
          {this.renderViewHeader()}
        </div>
        <div className='ProductsViewDetailsContainer row'>
          {this.renderSelectedProduct()}
          {this.renderSelectedProductQRCode(false)}
        </div>
        {/* <div className='ProductsViewTransactionsContainer'>
          {this.renderSelectedProductTransactions()}
        </div> */}
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
    if (this.state.view === 'import') {
      return this.renderImportProductsView();
    }
    if (this.state.displayQRCodeModal) {
      return this.renderSelectedProductQRCode(true);
    }
    return this.renderSelectedProductDetails();
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
          {this.renderProductView()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ProductsView);
