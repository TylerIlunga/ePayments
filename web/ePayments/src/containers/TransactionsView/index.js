import React from 'react';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import config from '../../config';
import BrandHeader from '../../components/BrandHeader';
import DashboardMenu from '../../components/DashboardMenu';
import DataTable from '../../components/DataTable';
import BusinessTransactionService from '../../services/BusinessTransactionService';
import stringUtils from '../../utils/Strings';
import toastUtils from '../../utils/Toasts';
import './index.css';
import SessionService from '../../services/SessionService';
import { setProfile } from '../../redux/actions/profile';
import { setUser } from '../../redux/actions/user';

class TransactionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMobileMenuModal: false,
      view: 'list',
      selectedTransaction: null,
      loadingTableData: true,
      transactions: [],
      tableOffset: 0,
      tablePage: 1,
      tableColumns: [
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
      tableOptions: {
        search: true,
        paging: true,
        filtering: false,
        exportButton: true,
        exportFileName: 'ePayment-transactions',
      },
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.BusinessTransactionService = new BusinessTransactionService();
    this.SessionService = new SessionService(props.allCookies.ut);
    this.handleToggleMobileMenuModal = this.handleToggleMobileMenuModal.bind(
      this,
    );
    this.fetchTransactions = this.fetchTransactions.bind(this);
    this.renderMenuColumn = this.renderMenuColumn.bind(this);
    this.renderTableHeader = this.renderTableHeader.bind(this);
    this.renderTransactionTable = this.renderTransactionTable.bind(this);
    this.handleOnChangeRowsPerPage = this.handleOnChangeRowsPerPage.bind(this);
    this.handleOnChangePage = this.handleOnChangePage.bind(this);
    this.handleOnRowClick = this.handleOnRowClick.bind(this);
    this.renderSelectedTransactionDetails = this.renderSelectedTransactionDetails.bind(
      this,
    );
    this.renderListOfTransactions = this.renderListOfTransactions.bind(this);
    this.renderTransactionsView = this.renderTransactionsView.bind(this);
  }

  componentDidMount() {
    console.log('TransactionView: componentDidMount()');
    if (this.state.transactions.length === 0) {
      this.fetchTransactions({
        [`${this.props.user.type}ID`]: this.props.user.id,
        queryAttributes: {
          limit: 10,
          order: 'DESC',
        },
      });
    }
  }

  fetchTransactions(queryData) {
    this.BusinessTransactionService.listTransactions(queryData)
      .then((res) => {
        console.log(
          'this.BusinessTransactionService.listTransactions() res:',
          res,
        );
        if (res.error) {
          throw res.error;
        }
        this.setState({
          transactions: res.businessTransactions,
          loadingTableData: false,
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
        this.setState({ loadingTableData: false });
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
        activeOption='Transactions'
        user={this.props.user}
        history={this.props.history}
        displayToastMessage={this.displayToastMessage}
      />
    );
  }

  renderTableHeader() {
    if (this.state.loadingTableData) {
      return <p className='StdContentHeaderLabel'>Loading...</p>;
    }
    if (this.state.view === 'details') {
      return <p className='StdContentHeaderLabel'>Transaction Details</p>;
    }
    return <p className='StdContentHeaderLabel'>Transactions</p>;
  }

  handleOnChangeRowsPerPage(pageSize, e) {
    // TODO: Solve double call issue
    console.log('handleOnChangeRowsPerPage()', pageSize, e);
    this.setState({ loadingTableData: true }, () => {
      this.fetchTransactions({
        [`${this.props.user.type}ID`]: this.props.user.id,
        queryAttributes: {
          offset: this.state.tableOffset,
          limit: pageSize,
          order: 'DESC',
        },
      });
    });
  }

  handleOnChangePage(tablePage, pageSize) {
    // TODO: Solve double call issue
    console.log('handleOnChangeRowsPerPage()');
    let tableOffset = this.state.tableOffset;
    if (tablePage !== tableOffset && tablePage > this.state.tablePage) {
      tableOffset += pageSize;
    }
    if (tablePage !== tableOffset && tablePage < this.state.tablePage) {
      tableOffset -= pageSize;
    }
    this.setState({ tablePage, tableOffset });
  }

  handleOnRowClick(evt, rowData, toggleDetailPanel) {
    console.log('handleOnRowClick() evt, rowData:', evt, rowData);
    evt.preventDefault();
    evt.stopPropagation();
    rowData.tableData = null;
    delete rowData.tableData;
    this.setState({ selectedTransaction: rowData, view: 'details' });
  }

  renderTransactionTable() {
    return (
      <DataTable
        title='History'
        isLoading={this.state.loadingTableData}
        data={this.state.transactions}
        columns={this.state.tableColumns}
        options={this.state.tableOptions}
        onChangeRowsPerPage={this.handleOnChangeRowsPerPage}
        onChangePage={this.handleOnChangePage}
        onRowClick={this.handleOnRowClick}
      />
    );
  }

  renderListOfTransactions() {
    return (
      <div className='StdViewContentContainer col-sm-11 col-12'>
        <div className='StdViewContentHeaderContainer'>
          {this.renderTableHeader()}
        </div>
        <div className='StdViewContentTableContainer'>
          {this.renderTransactionTable()}
        </div>
      </div>
    );
  }

  renderTransactionTextInformation(transaction) {
    // businessId, customerId, productId
    delete transaction.business_id;
    delete transaction.customer_id;
    delete transaction.product_id;

    return Object.keys(transaction).map((field, i) => {
      let heading = '';
      const headingSplit = field.split('_');
      if (headingSplit.length === 1) {
        heading = stringUtils.capitalize(field);
      } else {
        headingSplit.forEach((word) => {
          heading += `${stringUtils.capitalize(word)} `;
        });
        heading = heading.trim();
      }
      if (field === 'created_at') {
        transaction[field] = new Date(Number(transaction[field])).toUTCString();
        heading = 'Date';
      }
      return (
        <p key={i}>
          <strong>{heading}</strong>: {transaction[field]}
        </p>
      );
    });
  }

  renderTransactionLocation(transaction) {
    if (
      transaction.latitude &&
      transaction.longitude &&
      transaction.latitude !== 0 &&
      transaction.longitude !== 0
    ) {
      const src = `https://www.google.com/maps/embed/v1/place?key=${config.GoogleMapsEmbedAPI.key}
      &q=${transaction.latitude},${transaction.longitude}`;
      return (
        <iframe
          title='Transaction Location'
          width='600'
          height='450'
          style={{ border: '0' }}
          loading='lazy'
          allowfullscreen
          src={src}
        ></iframe>
      );
    }
  }

  renderSelectedTransactionDetails() {
    return (
      <div className='StdViewContentContainer col-sm-11 col-12'>
        <div className='StdViewContentHeaderContainer row'>
          {this.renderTableHeader()}
        </div>
        <div className='TransactionViewDetailsContainer row'>
          <div className='TransactionViewDetailsLabelContainer col-sm-6 col-12'>
            {this.renderTransactionTextInformation(
              this.state.selectedTransaction,
            )}
          </div>
          <div className='TransactionViewDetailsMapContainer col-sm-6 col-12'>
            {this.renderTransactionLocation(this.state.selectedTransaction)}
          </div>
        </div>
      </div>
    );
  }

  renderTransactionsView() {
    if (this.state.selectedTransaction === null && this.state.view === 'list') {
      return this.renderListOfTransactions();
    }
    return this.renderSelectedTransactionDetails();
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
          {this.renderTransactionsView()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  profile: state.profile,
  transaction: state.transaction,
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({
  dispatchSetProfile: (profileData) => dispatch(setProfile(profileData)),
  dispatchSetUser: (userData) => dispatch(setUser(userData)),
});

export default withCookies(
  connect(mapStateToProps, mapDispatchToProps)(TransactionsView),
);
