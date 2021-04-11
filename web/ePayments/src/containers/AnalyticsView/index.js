import React from 'react';
import { connect } from 'react-redux';
import { Bar, Pie, Line } from 'react-chartjs-2';
import config from '../../config';
import DashboardMenu from '../../components/DashboardMenu';
import BusinessTransactionService from '../../services/BusinessTransactionService';
import toastUtils from '../../utils/Toasts';
import './index.css';

class AnalyticsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      transactions: [],
      reportTypes: [
        'Total Revenue',
        'Total Sales',
        'New vs Returning Customers',
      ],
      periodTypes: ['Today', 'This Week', 'This Month'],
      selectedPeriodToDaysAgo: config.dateReferences,
      selectedReport: 'Total Revenue',
      selectedPeriod: 'This Week',
      currentReportData: null,
    };

    this.reportDataStartState = {
      totalValueLabel: null,
      barChart: {
        data: {
          labels: [],
          datasets: [],
        },
        options: {},
      },
      pieChart: {
        data: {
          labels: [],
          datasets: [],
        },
        options: {},
      },
      lineChart: {
        data: {
          labels: [],
          datasets: [],
        },
        options: {},
      },
    };

    this.displayToastMessage = toastUtils.displayToastMessage;
    this.BusinessTransactionService = new BusinessTransactionService();
    this.renderAnalyticsViewHeader = this.renderAnalyticsViewHeader.bind(this);
    this.renderAnalyticsViewOptions = this.renderAnalyticsViewOptions.bind(
      this,
    );
    this.handleOnOptionChange = this.handleOnOptionChange.bind(this);
    this.handleReportChangeType = this.handleReportChangeType.bind(this);
    this.handlePeriodChangeType = this.handlePeriodChangeType.bind(this);
    this.generateCurrentReportData = this.generateCurrentReportData.bind(this);
    this.generateTotalRevenueReportData = this.generateTotalRevenueReportData.bind(
      this,
    );
    this.generateTotalSalesReportData = this.generateTotalSalesReportData.bind(
      this,
    );
    this.generateNewVsReturningCustomersReportData = this.generateNewVsReturningCustomersReportData.bind(
      this,
    );
    this.generateChartJSData = this.generateChartJSData.bind(this);
    this.handleCustomerChartJSDataGeneration = this.handleCustomerChartJSDataGeneration.bind(
      this,
    );
    this.generateNVRCChartData = this.generateNVRCChartData.bind(this);
    this.renderAnalyticsViewCharts = this.renderAnalyticsViewCharts.bind(this);
  }

  componentDidMount() {
    this.toggleSelectElements(true);

    const todaysDate = this.state.selectedPeriodToDaysAgo['Today'];
    const dateAWeekAgo = this.state.selectedPeriodToDaysAgo['This Week'];
    this.fetchTransactions({
      // businessID: this.props.user.id
      businessID: 7,
      betweenDates: {
        start: dateAWeekAgo.getTime(),
        end: todaysDate.getTime(),
      },
      queryAttributes: {},
    })
      .then((transactions) => {
        if (transactions.length === 0) {
          this.toggleSelectElements(false);
          return this.setState({ loading: false });
        }

        this.setState({ transactions }, () => {
          const currentReportData = this.generateTotalRevenueReportData(
            transactions,
          );

          this.toggleSelectElements(false);

          this.setState({ currentReportData, loading: false });
        });
      })
      .catch((error) => {
        this.toggleSelectElements(false);
        this.displayToastMessage('error', error);
        this.setState({ loading: false });
      });
  }

  fetchTransactions(queryData) {
    console.log('fetchTransactions() queryData:', queryData);
    return new Promise((resolve, reject) => {
      this.BusinessTransactionService.listTransactions(queryData)
        .then((res) => {
          console.log(
            'this.BusinessTransactionService.listTransactions() res:',
            res,
          );
          if (res.error) {
            throw res.error;
          }
          resolve(res.businessTransactions);
        })
        .catch((error) => {
          console.log(
            'this.BusinessTransactionService.listTransactions error:',
            error,
          );
          if (typeof error !== 'string') {
            error = 'Loading failure: Please refresh and try again';
          }
          reject(error);
        });
    });
  }

  generateTotalRevenueReportData(transactions) {
    let dailyRevenue = {};
    let aggregatedRevenue = 0;

    transactions.forEach((transaction) => {
      const currentDate = new Date(
        Number(transaction.created_at),
      ).toUTCString();

      aggregatedRevenue += transaction.amount;

      if (dailyRevenue[currentDate] !== undefined) {
        dailyRevenue[currentDate] += transaction.amount;
      } else {
        dailyRevenue[currentDate] = transaction.amount;
      }
    });

    console.log('generateTotalRevenueReportData() dailyRevenue', dailyRevenue);

    return this.generateChartJSData(null, {
      chartLabel: 'Revenue',
      totalValueLabel: `$${aggregatedRevenue}`,
      generalReportData: dailyRevenue,
    });
  }

  generateTotalSalesReportData(transactions) {
    let dailySales = {};
    let aggregatedSales = transactions.length;

    transactions.forEach((transaction) => {
      const currentDate = new Date(
        Number(transaction.created_at),
      ).toUTCString();

      aggregatedSales += 1;

      if (dailySales[currentDate] !== undefined) {
        dailySales[currentDate] += 1;
      } else {
        dailySales[currentDate] = 1;
      }
    });

    console.log('generateTotalSalesReportData () dailySales', dailySales);

    return this.generateChartJSData(null, {
      chartLabel: 'Sales',
      totalValueLabel: `${aggregatedSales} products`,
      generalReportData: dailySales,
    });
  }

  async generateNewVsReturningCustomersReportData(
    transactions,
    selectedPeriod,
  ) {
    console.log(
      'generateNewVsReturningCustomersReportData() transactions, selectedPeriod:',
      transactions,
      selectedPeriod,
    );
    // NEW = No records exist for that customer(User) before the start date
    const chartLabel = 'Customers';
    const customerIDs = new Set();
    const productLaunchDate = this.state.selectedPeriodToDaysAgo[
      'productLaunchDate'
    ];
    const dateDaysAgoFromToday = this.state.selectedPeriodToDaysAgo[
      selectedPeriod
    ];
    let totalNewCustomers = 0;
    let totalReturningCustomers = 0;

    // Extract all of the customer_id's from the current set of transactions
    transactions.forEach((transaction) => {
      customerIDs.add(transaction.customer_id);
    });

    console.log(
      'generateNewVsReturningCustomersReportData() customerIDs:',
      customerIDs,
    );

    // Fetch transactions for each customer (ID)
    const fetchCustomerTransactions = [];
    const iterateThroughCustomerIDs = (customerID) => {
      // NOTE: Using [LIMIT=1] for latency purposes
      const startDateTime = productLaunchDate.getTime();
      const endDateTime = dateDaysAgoFromToday.getTime();
      console.log(
        'iterateThroughCustomerIDs() startDateTime, endDateTime, selectedPeriod',
        startDateTime,
        endDateTime,
        selectedPeriod,
      );
      fetchCustomerTransactions.push(
        this.fetchTransactions({
          customerID,
          betweenDates: {
            start: startDateTime,
            end: endDateTime,
          },
          queryAttributes: { limit: 1 },
        })
          .then((transactions) => {
            console.log(
              'this.fetchTransactions() transactions for customerID:',
              customerID,
              transactions,
            );
            return transactions;
          })
          .catch((error) => {
            console.log(
              'ERROR: this.fetchTransactions() for customerID:',
              customerID,
              error,
            );
            return [];
          }),
      );
    };

    customerIDs.forEach(iterateThroughCustomerIDs);

    try {
      const fetchCustomerTransactionsResponses = await Promise.all(
        fetchCustomerTransactions,
      );
      console.log(
        'Promise.all(fetchCustomerTransactions) fetchCustomerTransactionsResponses:',
        fetchCustomerTransactionsResponses,
      );
      fetchCustomerTransactionsResponses.forEach((customerTransactions) => {
        console.log('customerTransactions:', customerTransactions);
        if (
          !Array.isArray(customerTransactions) ||
          customerTransactions.length === 0
        ) {
          // No transactions before the current period's date? New customer
          totalNewCustomers += 1;
        } else {
          // Transactions? Returning customer
          totalReturningCustomers += 1;
        }
      });

      return this.generateChartJSData('nvrcs', {
        chartLabel,
        totalNewCustomers,
        totalReturningCustomers,
        totalValueLabel: `${totalNewCustomers} (New) | ${totalReturningCustomers} (Returning)`,
      });
    } catch (error) {
      console.log(
        'generateNewVsReturningCustomersReportData() Promise.all error:',
        error,
      );
      return null;
    }
  }

  generateRandomHexColor() {
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
    let hexColor = '#';
    let index = 0;

    while (index++ <= 5) {
      const randomIndex = Math.floor(Math.random() * availableSymbols.length);
      hexColor += availableSymbols[randomIndex];
    }

    console.log('generateRandomHexColor() hexColor:', hexColor);
    return hexColor;
  }

  handleCustomerChartJSDataGeneration(generationType, customReportData) {
    switch (generationType) {
      case 'nvrcs':
        return this.generateNVRCChartData(customReportData);
      default:
        return null;
    }
  }

  generateChartJSData(customGenerationType, customReportData) {
    if (customGenerationType !== null) {
      return this.handleCustomerChartJSDataGeneration(
        customGenerationType,
        customReportData,
      );
    }
    const currentReportData = JSON.parse(
      JSON.stringify(this.reportDataStartState),
    );
    const dataLabels = Object.keys(customReportData.generalReportData);
    const dataValues = Object.values(customReportData.generalReportData);
    const chartLabel = customReportData.chartLabel;
    const chartTitleOptions = {
      display: true,
      fontSize: 20,
    };
    const chartLegendOptions = {
      display: true,
      position: 'right',
    };

    currentReportData.barChart.data.labels = dataLabels;
    currentReportData.pieChart.data.labels = dataLabels;
    currentReportData.lineChart.data.labels = dataLabels;

    currentReportData.barChart.data.datasets.push({
      label: chartLabel,
      backgroundColor: this.generateRandomHexColor(),
      borderColor: this.generateRandomHexColor(),
      borderWidth: 2,
      data: dataValues,
    });
    currentReportData.lineChart.data.datasets.push({
      label: chartLabel,
      fill: false,
      lineTension: 0.5,
      backgroundColor: this.generateRandomHexColor(),
      borderColor: this.generateRandomHexColor(),
      borderWidth: 2,
      data: dataValues,
    });

    const pieChartBackgroundColors = [];
    const pieChartHoverBackgroundColors = [];

    dataValues.forEach((v) => {
      pieChartBackgroundColors.push(this.generateRandomHexColor());
      pieChartHoverBackgroundColors.push(this.generateRandomHexColor());
    });

    currentReportData.pieChart.data.datasets.push({
      label: chartLabel,
      backgroundColor: pieChartBackgroundColors,
      hoverBackgroundColor: pieChartHoverBackgroundColors,
      data: dataValues,
    });

    currentReportData.barChart.options.title = chartTitleOptions;
    currentReportData.lineChart.options.title = chartTitleOptions;
    currentReportData.pieChart.options.title = chartTitleOptions;

    currentReportData.barChart.options.legend = chartLegendOptions;
    currentReportData.lineChart.options.legend = chartLegendOptions;
    currentReportData.pieChart.options.legend = chartLegendOptions;

    if (customReportData.totalValueLabel !== undefined) {
      currentReportData.totalValueLabel = customReportData.totalValueLabel;
    }

    console.log('generateChartJSData() currentReportData:', currentReportData);

    return currentReportData;
  }

  generateNVRCChartData(customReportData) {
    console.log('generateNVRCChartData():', customReportData);
    const currentReportData = JSON.parse(
      JSON.stringify(this.reportDataStartState),
    );
    const dataLabels = ['New', 'Returning'];
    const dataValues = [
      customReportData.totalNewCustomers,
      customReportData.totalReturningCustomers,
    ];
    const chartLabel = customReportData.chartLabel;
    const chartTitleOptions = {
      display: true,
      fontSize: 20,
    };
    const chartLegendOptions = {
      display: true,
      position: 'right',
    };

    currentReportData.barChart.data.labels = dataLabels;
    currentReportData.pieChart.data.labels = dataLabels;

    currentReportData.barChart.data.datasets.push({
      label: chartLabel,
      backgroundColor: this.generateRandomHexColor(),
      borderColor: this.generateRandomHexColor(),
      borderWidth: 2,
      data: dataValues,
    });

    const pieChartBackgroundColors = [];
    const pieChartHoverBackgroundColors = [];

    dataValues.forEach((v) => {
      pieChartBackgroundColors.push(this.generateRandomHexColor());
      pieChartHoverBackgroundColors.push(this.generateRandomHexColor());
    });

    currentReportData.pieChart.data.datasets.push({
      label: chartLabel,
      backgroundColor: pieChartBackgroundColors,
      hoverBackgroundColor: pieChartHoverBackgroundColors,
      data: dataValues,
    });

    currentReportData.barChart.options.title = chartTitleOptions;
    currentReportData.pieChart.options.title = chartTitleOptions;

    currentReportData.barChart.options.legend = chartLegendOptions;
    currentReportData.pieChart.options.legend = chartLegendOptions;

    if (customReportData.totalValueLabel !== undefined) {
      currentReportData.totalValueLabel = customReportData.totalValueLabel;
    }

    // Disable Line Chart
    currentReportData.lineChart = null;

    console.log(
      'generateNVRCChartData() currentReportData:',
      currentReportData,
    );

    return currentReportData;
  }

  toggleSelectElements(isDisabled) {
    document
      .querySelectorAll('.MainAnalyticsViewOptionsSelect')
      .forEach((el) => {
        if (isDisabled) {
          el.setAttribute('disabled', isDisabled);
        } else {
          el.removeAttribute('disabled');
        }
      });
  }

  renderAnalyticsViewHeader() {
    return (
      <div className='MainAnalyticsViewHeader'>
        <p>{this.state.loading ? 'Loading...' : 'Analytics'}</p>
      </div>
    );
  }

  async handleReportChangeType(selectedReport) {
    console.log('handleReportChangeType():', selectedReport);
    if (this.state.transactions.length === 0) {
      this.toggleSelectElements(false);

      return this.setState({
        currentReportData: null,
        selectedReport,
        loading: false,
      });
    }

    const currentReportData = await this.generateCurrentReportData(
      this.state.transactions,
      selectedReport,
      this.state.selectedPeriod,
    );

    console.log(
      'handleReportChangeType() currentReportData (post-processing):',
      currentReportData,
    );

    this.toggleSelectElements(false);

    return this.setState({
      currentReportData,
      selectedReport,
      loading: false,
    });
  }

  handlePeriodChangeType(selectedPeriod) {
    console.log('handlePeriodChangeType() selectedPeriod:', selectedPeriod);
    const todaysDate = this.state.selectedPeriodToDaysAgo['Today'];
    const dateDaysAgoFromToday = this.state.selectedPeriodToDaysAgo[
      selectedPeriod
    ];
    this.fetchTransactions({
      // businessID: this.props.user.id
      businessID: 7,
      betweenDates: {
        start: dateDaysAgoFromToday.getTime(),
        end: todaysDate.getTime(),
      },
      queryAttributes: {},
    })
      .then(async (transactions) => {
        if (transactions.length === 0) {
          console.log(
            'handlePeriodChangeType() this.fetchTransactions() transactions:',
            transactions,
          );

          this.toggleSelectElements(false);

          return this.setState({
            currentReportData: null,
            selectedPeriod,
            loading: false,
          });
        }

        const currentReportData = await this.generateCurrentReportData(
          transactions,
          this.state.selectedReport,
          selectedPeriod,
        );

        console.log(
          'handlePeriodChangeType() currentReportData (post-processing):',
          currentReportData,
        );

        this.toggleSelectElements(false);

        this.setState({
          currentReportData,
          selectedPeriod,
          transactions,
          loading: false,
        });
      })
      .catch((error) => {
        this.toggleSelectElements(false);
        this.displayToastMessage('error', error);
        this.setState({ loading: false });
      });
  }

  async handleOnOptionChange(evt, type) {
    console.log(
      'handleOnOptionChange() evt.target.value, type:',
      evt.target.value,
      type,
    );

    this.toggleSelectElements(true);

    if (type === 'report') {
      return this.handleReportChangeType(evt.target.value);
    }
    if (type === 'period') {
      return this.handlePeriodChangeType(evt.target.value);
    }
  }

  async generateCurrentReportData(transactions, reportType, selectedPeriod) {
    return new Promise(async (resolve, reject) => {
      console.log(
        'generateCurrentReportData() transactions, reportType, selectedPeriod',
        transactions,
        reportType,
        selectedPeriod,
      );
      let currentReportData = null;
      switch (reportType) {
        case 'Total Revenue':
          currentReportData = this.generateTotalRevenueReportData(transactions);
          break;
        case 'Total Sales':
          currentReportData = this.generateTotalSalesReportData(transactions);
          break;
        case 'New vs Returning Customers':
          currentReportData = await this.generateNewVsReturningCustomersReportData(
            transactions,
            selectedPeriod,
          );
          break;
        default:
          break;
      }

      resolve(currentReportData);
    });
  }

  renderAnalyticsViewOptions() {
    return (
      <div className='MainAnalyticsViewOptionsContainer'>
        <div className='MainAnalyticsViewOptionsReports'>
          <select
            value={this.state.selectedReport}
            className='MainAnalyticsViewOptionsSelect'
            onChange={(evt) => this.handleOnOptionChange(evt, 'report')}
          >
            {this.state.reportTypes.map((reportType, i) => {
              return (
                <option key={i} value={reportType}>
                  {reportType}
                </option>
              );
            })}
          </select>
        </div>
        <div className='MainAnalyticsViewOptionsPeriods'>
          <select
            value={this.state.selectedPeriod}
            className='MainAnalyticsViewOptionsSelect'
            onChange={(evt) => this.handleOnOptionChange(evt, 'period')}
          >
            {this.state.periodTypes.map((periodType, i) => {
              return (
                <option key={i} value={periodType}>
                  {periodType}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    );
  }

  renderTotalLabel() {
    if (
      this.state.currentReportData !== undefined &&
      this.state.currentReportData.totalValueLabel !== null
    ) {
      return (
        <div className='MainAnalyticsViewChartsTotalContainer col-12'>
          <h1>Total</h1>
          <p>{this.state.currentReportData.totalValueLabel}</p>
        </div>
      );
    }
  }

  renderAnalyticsViewCharts() {
    if (this.state.loading) {
      return (
        <div className='MainAnalyticsViewCharts'>
          <p>Loading...</p>
        </div>
      );
    }
    if (this.state.currentReportData === null) {
      return (
        <div className='MainAnalyticsViewCharts'>
          <p>No Data To Show</p>
        </div>
      );
    }
    return (
      <div className='MainAnalyticsViewCharts'>
        <div className='MainAnalyticsViewChartsPieBarRow row'>
          {this.renderTotalLabel()}
          {this.state.currentReportData.barChart && (
            <div className='MainAnalyticsViewChartsPieContainer col-6'>
              <Bar
                data={this.state.currentReportData.barChart.data}
                options={this.state.currentReportData.barChart.options}
              />
            </div>
          )}
          {this.state.currentReportData.pieChart && (
            <div className='MainAnalyticsViewChartsBarContainer col-6'>
              <Pie
                data={this.state.currentReportData.pieChart.data}
                options={this.state.currentReportData.pieChart.options}
              />
            </div>
          )}
        </div>
        {this.state.currentReportData.lineChart && (
          <div className='MainAnalyticsViewChartsLineRow row'>
            <div className='MainAnalyticsViewChartsLineContainer col-12'>
              <Line
                data={this.state.currentReportData.lineChart.data}
                options={this.state.currentReportData.lineChart.options}
              />
            </div>
          </div>
        )}
      </div>
    );
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

  renderAnalyticsView() {
    return (
      <div className='AnalyticsViewContainer col-10'>
        {this.renderAnalyticsViewHeader()}
        {this.renderAnalyticsViewOptions()}
        {this.renderAnalyticsViewCharts()}
      </div>
    );
  }

  render() {
    return (
      <div className='MainAnalyticsViewContainer row'>
        {this.renderMenuColumn()}
        {this.renderAnalyticsView()}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsView);
