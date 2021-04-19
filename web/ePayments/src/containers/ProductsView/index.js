import React from 'react';
import { connect } from 'react-redux';
import BrandHeader from '../../components/BrandHeader';
import DashboardMenu from '../../components/DashboardMenu';
import DataTable from '../../components/DataTable';
import BusinessProductService from '../../services/BusinessProductService';
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
      importedProducts: null,
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.BusinessProductService = new BusinessProductService();
    this.handleToggleMobileMenuModal = this.handleToggleMobileMenuModal.bind(
      this,
    );
    this.fetchProducts = this.fetchProducts.bind(this);
    this.renderViewHeader = this.renderViewHeader.bind(this);
    this.renderProductsTable = this.renderProductsTable.bind(this);
    this.handleOnChangeRowsPerPage = this.handleOnChangeRowsPerPage.bind(this);
    this.handleOnChangeProductsTablePage = this.handleOnChangeProductsTablePage.bind(
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
    if (this.state.products.length === 0) {
      this.fetchProducts({
        businessID: this.props.user.id,
        queryAttributes: {
          limit: 10,
          order: 'DESC',
        },
      });
    }
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
        <div className='StdViewContentHeaderContainer'>
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
        <div className='StdViewContentHeaderContainer'>
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
      return (
        <div className='ProductsViewImportDescContainer-PostParse'>
          <p>Review import</p>
        </div>
      );
    }
    return (
      <div className='ProductsViewImportDescContainer'>
        <p>
          Make sure the CSV file has each exact header below and the
          apprioritate value for that column
        </p>
        <ul>
          <li>
            <strong>"sku"</strong>: String with exactly 16 alphanumeric
            characters
          </li>
          <li>
            <strong>"label"</strong>: String
          </li>
          <li>
            <strong>"description"</strong>: String
          </li>
          <li>
            <strong>"price"</strong>: Number
          </li>
          <li>
            <strong>"category"</strong>: String
          </li>
          <li>
            <strong>"inventory_count"</strong>: Number
          </li>
        </ul>
      </div>
    );
  }

  persistImportedProducts(evt) {
    evt.preventDefault();

    this.displayToastMessage('info', 'Loading...');

    this.BusinessProductService.importProducts(
      this.props.user.id,
      this.state.importedProducts.data,
    )
      .then((res) => {
        console.log('this.BusinessProductService.importProducts res:', res);
        if (res.error) {
          throw res.error;
        }

        this.resetImportFileInputField();
        this.displayToastMessage('success', 'Success');

        this.setState(
          {
            importedProducts: null,
            selectedProduct: null,
            view: 'list',
          },
          () => {
            this.fetchProducts({
              businessID: this.props.user.id,
              queryAttributes: {
                limit: 10,
                order: 'DESC',
              },
            });
          },
        );
      })
      .catch((error) => {
        console.log('this.BusinessProductService.importProducts error:', error);
        if (typeof error !== 'string') {
          error = 'Import failure: Please review your CSV file and try again';
        }
        this.resetImportFileInputField();
        this.displayToastMessage('error', error);
      });
  }

  renderImportedProductsDetails() {
    if (!this.state.importedProducts) {
      return (
        <div className='ProductsViewImportDetailsContainer'>
          <input
            id='ProductsViewImportField'
            type='file'
            onChange={this.handleImportedProductsFile}
          />
        </div>
      );
    }
    return (
      <div className='ProductsViewImportDetailsContainer-PostParse'>
        <div className='ProductsViewImportPPInputContainer'>
          <input
            id='ProductsViewImportField'
            type='file'
            onChange={this.handleImportedProductsFile}
          />
        </div>
        <div className='ProductsViewImportPPDataTableContainer'>
          <DataTable
            title='Inventory'
            isLoading={this.state.loadingProducts}
            data={this.state.importedProducts.data}
            columns={this.state.importedProducts.tableColumns}
            options={this.state.productsTableOptions}
          />
        </div>
        <div className='ProductsViewImportPPButtonContainer'>
          <button onClick={this.persistImportedProducts}>Import</button>
        </div>
      </div>
    );
  }

  resetImportFileInputField() {
    document.getElementById('ProductsViewImportField').value = '';
  }

  handleImportedProductsFile(evt) {
    const csvFile = evt.target.files[0];
    console.log('handleImportedProductsFile() csvFile', csvFile);
    if (csvFile.type !== 'text/csv') {
      this.resetImportFileInputField();
      return this.displayToastMessage(
        'error',
        "Import failure: File type must be 'text/csv'",
      );
    }

    const fileReader = new FileReader();

    fileReader.onload = () => {
      this.displayToastMessage('info', 'Parsing CSV file...');

      const importedProducts = window.$.csv.toObjects(fileReader.result);
      console.log('importedProducts:', importedProducts);
      if (importedProducts.length === 0) {
        this.resetImportFileInputField();
        return this.displayToastMessage(
          'error',
          'Import failure: CSV File has no entries.',
        );
      }

      const validColumns = {
        sku: true,
        label: true,
        description: true,
        price: true,
        category: true,
        inventory_count: true,
      };
      const invalidColumns = [];
      const tableColumns = Object.keys(importedProducts[0]).map((field) => {
        if (!validColumns[field]) invalidColumns.push(field);
        return { field, title: stringUtils.capitalize(field) };
      });
      if (invalidColumns.length !== 0) {
        this.resetImportFileInputField();
        return this.displayToastMessage(
          'error',
          `Import failure: CSV headers (${invalidColumns.toString()}) do not found the rules above`,
        );
      }

      this.displayToastMessage('success', 'Success');

      this.setState({
        loadingProducts: false,
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
        <div className='StdViewContentHeaderContainer'>
          {this.renderViewHeader()}
        </div>
        {this.renderImportedProductsDescription()}

        {this.renderImportedProductsDetails()}
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
          <div className='StdViewContentHeaderContainer'>
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
        <div className='StdViewContentHeaderContainer'>
          {this.renderViewHeader()}
        </div>
        <div className='ProductsViewDetailsContainer row'>
          {this.renderSelectedProduct()}
          {this.renderSelectedProductQRCode(false)}
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

export default connect(mapStateToProps, null)(ProductsView);
