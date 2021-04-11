import React from 'react';
import { connect } from 'react-redux';
import DashboardMenu from '../../components/DashboardMenu';
import DataTable from '../../components/DataTable';
import BusinessTransactionService from '../../services/BusinessTransactionService';
import stringUtils from '../../utils/Strings';
import toastUtils from '../../utils/Toasts';
import './index.css';

class TransactionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
    this.returnToListOfTransactions = this.returnToListOfTransactions.bind(
      this,
    );
    this.renderListOfTransactions = this.renderListOfTransactions.bind(this);
    this.renderTransactionsView = this.renderTransactionsView.bind(this);
  }

  componentDidMount() {
    this.fetchTransactions({
      // TODO: (UNCOMMENT)  [`${this.user.props.type}ID`]: this.props.user.id,
      businessID: 7,
      // customerID: 10,
      queryAttributes: {
        limit: 10,
        order: 'DESC',
      },
    });
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

  renderTableHeader() {
    if (this.state.transactions !== null) {
      return;
    }
    return <p className='TransactionsHeaderLabel'>Loading...</p>;
  }

  handleOnChangeRowsPerPage(pageSize) {
    this.setState({ loadingTableData: true }, () => {
      this.fetchTransactions({
        // TODO: (UNCOMMENT) [`${this.user.props.type}ID`]: this.props.user.id,
        businessID: 7,
        // customerID: 10,
        queryAttributes: {
          offset: this.state.tableOffset,
          limit: pageSize,
          order: 'DESC',
        },
      });
    });
  }

  handleOnChangePage(tablePage, pageSize) {
    let tableOffset = this.state.tableOffset;
    if (tablePage !== tableOffset && tablePage > this.state.tablePage) {
      tableOffset += pageSize;
    }
    if (tablePage !== tableOffset && tablePage < this.state.tablePage) {
      tableOffset -= pageSize;
    }
    this.setState({ tablePage, tableOffset }, () => {
      if (this.state.transactions.length < tableOffset + pageSize) {
        this.fetchTransactions({
          // TODO: (UNCOMMENT) [`${this.user.props.type}ID`]: this.props.user.id,
          businessID: 7,
          // customerID: 10,
          queryAttributes: {
            offset: tableOffset,
            limit: pageSize,
            order: 'DESC',
          },
        });
      }
    });
  }

  handleOnRowClick(evt, rowData, toggleDetailPanel) {
    console.log('evt, rowData:', evt, rowData);
    rowData.tableData = null;
    delete rowData.tableData;
    this.setState({ selectedTransaction: rowData, view: 'view' });
  }

  renderTransactionTable() {
    return (
      <DataTable
        title='Transactions'
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
      <div className='MainTransactionViewTransactionsContainer col-10'>
        <div className='MainTransactionViewTransactionsHeaderContainer'>
          {this.renderTableHeader()}
        </div>
        <div className='MainTransactionViewTransactionsTableContainer'>
          {this.renderTransactionTable()}
        </div>
      </div>
    );
  }

  renderTransactionTextInformation(transaction) {
    return Object.keys(transaction).map((field, i) => {
      const heading = stringUtils.snakeToCamel(field);
      if (heading === 'createdAt') {
        transaction[field] = new Date(Number(transaction[field])).toUTCString();
      }
      return (
        <p key={i}>
          <strong>{heading}</strong>: {transaction[field]}
        </p>
      );
    });
  }

  returnToListOfTransactions(evt) {
    evt.preventDefault();
    this.setState({
      view: 'list',
      selectedTransaction: null,
    });
  }

  renderSelectedTransactionDetails() {
    // amount: 37.5
    // business_id: 7
    // coinbase_transaction_id: "cbTransactionResult.id"
    // created_at: "1618013607611"
    // currency: "BTC"
    // customer_id: 8
    // id: "1cf2d5fd-d3ec-48a1-a4ba-eab90f6ee945"
    // latitude: "0"
    // longitude: "0"
    // product_category: "water"
    // product_id: 3
    // quantity: 25
    // tableData: {id: 0}
    // token_amount: "${cbTransactionResult.amount.amount}"
    return (
      <div className='MainTransactionViewTransactionsContainer col-10'>
        {this.renderTransactionTextInformation(this.state.selectedTransaction)}
        <button
          className='MainTransactionViewSelectedTransactionExitButton'
          onClick={this.returnToListOfTransactions}
        >
          Exit
        </button>
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
    return (
      <div className='MainTransactionViewContainer row'>
        {this.renderMenuColumn()}
        {this.renderTransactionsView()}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  profile: state.profile,
  transaction: state.transaction,
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionsView);
