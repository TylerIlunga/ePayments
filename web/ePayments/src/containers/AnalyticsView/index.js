import React from 'react';
import { connect } from 'react-redux';
import { Bar, Pie, Line } from 'react-chartjs-2';
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
      selectedPeriodToDaysAgo: {
        Today: 1,
        'This Week': 7,
        'This Month': 31,
      },
      selectedReport: 'Total Revenue',
      selectedPeriod: 'This Week',
      currentReportData: null,
      currentDate: Date.now(),
      // TODO: Change temp launch date to actual launch date
      productLaunchDate: new Date('01/01/2021'),
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
    this.handleChangeReport = this.handleChangeReport.bind(this);
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

    const currentDate = this.state.currentDate;
    const dateAWeekAgoFromNow = this.getDateDaysAgoFromNow(currentDate, 7);
    console.log(
      'currentDate:, dateAWeekAgoFromNow.getTime()',
      currentDate,
      dateAWeekAgoFromNow.getTime(),
    );
    this.fetchTransactions({
      // businessID: this.props.user.id
      businessID: 7,
      betweenDates: {
        start: dateAWeekAgoFromNow.getTime(),
        end: currentDate,
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

  getDateDaysAgoFromNow(now, daysAgo) {
    return new Date(now - daysAgo * 24 * 60 * 60 * 1000);
  }

  fetchTransactions(queryData) {
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

    console.log('dailyRevenue', dailyRevenue);

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

    console.log('dailySales', dailySales);

    return this.generateChartJSData(null, {
      chartLabel: 'Sales',
      totalValueLabel: `${aggregatedSales} products`,
      generalReportData: dailySales,
    });
  }

  async generateNewVsReturningCustomersReportData(transactions) {
    console.log('generateNewVsReturningCustomersReportData():', transactions);
    // NEW = No records exist for that customer(User) before the start date
    const chartLabel = 'Customers';
    const customerIDs = new Set();
    const currentDate = this.state.currentDate;
    const daysAgo = this.state.selectedPeriodToDaysAgo[
      this.state.selectedPeriod
    ];
    const dateDaysAgoFromNow = this.getDateDaysAgoFromNow(currentDate, daysAgo);
    let totalNewCustomers = 0;
    let totalReturningCustomers = 0;

    // Extract all of the customer_id's from the current set of transactions
    transactions.forEach((transaction) => {
      customerIDs.add(transaction.customer_id);
    });

    console.log('customerIDs:', customerIDs);

    const fetchCustomerTransactions = [];
    const iterateThroughCustomerIDs = (customerID) => {
      // For each using [LIMIT=1] for latency purposes, see if any transaction records
      // exist for the user before the date
      fetchCustomerTransactions.push(
        this.fetchTransactions({
          customerID,
          betweenDates: {
            // TODO: Fix inconsistency with responses due to the date range...
            start: this.state.productLaunchDate.getTime(),
            end: dateDaysAgoFromNow.getTime(),
          },
          queryAttributes: {
            limit: 1,
          },
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
      const responses = await Promise.all(fetchCustomerTransactions);
      console.log(
        'Promise.all(fetchCustomerTransactions) responses:',
        responses,
      );
      responses.forEach((currentCustomerTransactions) => {
        console.log(
          'currentCustomerTransactions:',
          currentCustomerTransactions,
        );
        if (
          !Array.isArray(currentCustomerTransactions) ||
          currentCustomerTransactions.length === 0
        ) {
          // If not, they are a new customer
          totalNewCustomers += 1;
        } else {
          // If so, they are a returning customer
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

    console.log('hexColor:', hexColor);
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
    console.log('this.generateNVRCChartData():', customReportData);
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

  handleChangeReport(evt, type) {
    console.log(
      'handleChangeReport() evt.target.value, type:',
      evt.target.value,
      type,
    );

    const prevEventTargetValue = evt.target.value;

    this.toggleSelectElements(true);

    this.setState({ loading: true }, async () => {
      if (type === 'report') {
        const selectedReport = prevEventTargetValue;
        if (this.state.transactions.length === 0) {
          console.log('type(report): this.state.transactions.length === 0');

          this.toggleSelectElements(false);

          return this.setState({
            currentReportData: null,
            selectedReport,
            loading: false,
          });
        }

        const currentReportData = await this.generateCurrentReportData(
          selectedReport,
          this.state.transactions,
        );

        console.log('currentReportData (post-processing):', currentReportData);

        this.toggleSelectElements(false);

        return this.setState({
          currentReportData,
          selectedReport,
          loading: false,
        });
      }
      if (type === 'period') {
        const selectedPeriod = prevEventTargetValue;
        const currentDate = this.state.currentDate;
        const daysAgo = this.state.selectedPeriodToDaysAgo[selectedPeriod];
        const dateDaysAgoFromNow = this.getDateDaysAgoFromNow(
          currentDate,
          daysAgo,
        );
        this.fetchTransactions({
          // businessID: this.props.user.id
          businessID: 7,
          betweenDates: {
            start: dateDaysAgoFromNow.getTime(),
            end: currentDate,
          },
          queryAttributes: {},
        })
          .then(async (transactions) => {
            if (transactions.length === 0) {
              this.toggleSelectElements(false);

              return this.setState({
                currentReportData: null,
                selectedPeriod,
                loading: false,
              });
            }

            const currentReportData = await this.generateCurrentReportData(
              this.state.selectedReport,
              transactions,
            );

            console.log(
              'currentReportData (post-processing):',
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
    });
  }

  async generateCurrentReportData(reportType, transactions) {
    return new Promise(async (resolve, reject) => {
      console.log(
        'generateCurrentReportData() reportType, transactions',
        reportType,
        transactions,
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
            onChange={(evt) => this.handleChangeReport(evt, 'report')}
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
            onChange={(evt) => this.handleChangeReport(evt, 'period')}
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
