import React from 'react';
import { connect } from 'react-redux';
import MaterialTable from 'material-table';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import SaveAlt from '@material-ui/icons/SaveAlt';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Check from '@material-ui/icons/Check';
import FilterList from '@material-ui/icons/FilterList';
import Remove from '@material-ui/icons/Remove';
import Clear from '@material-ui/icons/Clear';
import DashboardMenu from '../../components/DashboardMenu';
import BusinessTransactionService from '../../services/BusinessTransactionService';
import toastUtils from '../../utils/Toasts';
import './index.css';

class TransactionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingTableData: true,
      transactions: [],
      tableOffset: 0,
      tablePage: 1,
      tableColumns: [
        { title: 'ID', field: 'id' },
        { title: 'Date', field: 'created_at' },
        { title: 'Product', field: 'product_id' },
        { title: 'Currency', field: 'currency' },
        { title: 'Token Amount', field: 'token_amount' },
        { title: 'Fiat Amount', field: 'amount' },
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
      tableIcons: {
        Check: () => <Check />,
        Clear: () => <Clear />,
        Export: () => <SaveAlt />,
        Filter: () => <FilterList />,
        FirstPage: () => <FirstPage />,
        LastPage: () => <LastPage />,
        NextPage: () => <ChevronRight />,
        PreviousPage: () => <ChevronLeft />,
        ResetSearch: () => <Clear />,
        Search: () => <Search />,
        ThirdStateCheck: () => <Remove />,
        ViewColumn: () => <ViewColumn />,
        DetailPanel: () => <ChevronRight />,
      },
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.BusinessTransactionService = new BusinessTransactionService();
    this.renderMenuColumn = this.renderMenuColumn.bind(this);
    this.renderTableHeader = this.renderTableHeader.bind(this);
    this.renderTransactionTable = this.renderTransactionTable.bind(this);
    this.handleOnChangeRowsPerPage = this.handleOnChangeRowsPerPage.bind(this);
    this.handleOnChangePage = this.handleOnChangePage.bind(this);
    this.handleOnRowClick = this.handleOnRowClick.bind(this);
    this.renderTransactions = this.renderTransactions.bind(this);
  }

  componentDidMount() {
    // Fetch Transactions
    const queryData = {
      queryAttributes: {
        limit: 10,
        order: 'DESC',
      },
    };

    // queryData[`${this.user.props.type}ID`] = this.props.user.id;
    queryData[`businessID`] = 7;

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
    return <DashboardMenu colSize='col-2' user={this.props.user} />;
  }

  renderTableHeader() {
    if (this.state.transactions !== null) {
      return;
    }
    return <p className='TransactionsHeaderLabel'>Loading...</p>;
  }

  handleOnChangeRowsPerPage(pageSize) {
    this.setState({ loadingTableData: true }, () => {
      const queryData = {
        queryAttributes: {
          offset: this.state.tableOffset,
          limit: pageSize,
          order: 'DESC',
        },
      };

      // queryData[`${this.user.props.type}ID`] = this.props.user.id;
      queryData[`businessID`] = 7;

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
    });
  }

  handleOnChangePage(tablePage, pageSize) {
    // TODO: Might need to change this up in case we decide to load more data..
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
    console.log('evt, rowData:', evt, rowData);
    // TODO: Segue to ProductView with the state set to "ProductDetails"
    this.props.history.push('/h/products', {
      selectedProduct: rowData,
    });
  }

  renderTransactionTable() {
    return (
      <MaterialTable
        title='Transactions'
        isLoading={this.state.loadingTableData}
        data={this.state.transactions}
        columns={this.state.tableColumns}
        options={this.state.tableOptions}
        icons={this.state.tableIcons}
        onChangeRowsPerPage={this.handleOnChangeRowsPerPage}
        onChangePage={this.handleOnChangePage}
        onRowClick={this.handleOnRowClick}
      />
    );
  }

  renderTransactions() {
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

  render() {
    return (
      <div className='MainTransactionViewContainer row'>
        {this.renderMenuColumn()}
        {this.renderTransactions()}
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
