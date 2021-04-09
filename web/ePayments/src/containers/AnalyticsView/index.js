import React from 'react';
import { connect } from 'react-redux';
import { Bar, Pie, Line } from 'react-chartjs-2';

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
        'Total Revenue: Top 5 Products',
        'Total Sales: Top 5 Products',
        'New vs Returning Customers',
      ],
      periodTypes: ['Today', 'This Week', 'This Month'],
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
    this.handleChangeReport = this.handleChangeReport.bind(this);
    this.generateCurrentReportData = this.generateCurrentReportData.bind(this);
    this.generateTotalRevenueReportData = this.generateTotalRevenueReportData.bind(
      this,
    );
    this.generateTotalSalesReportData = this.generateTotalSalesReportData.bind(
      this,
    );
    this.generateTotalRevenueTopFiveProductsReportData = this.generateTotalRevenueTopFiveProductsReportData.bind(
      this,
    );
    this.generateTotalSalesTopFiveProductsReportData = this.generateTotalSalesTopFiveProductsReportData.bind(
      this,
    );
    this.generateNewVsReturningCustomersReportData = this.generateNewVsReturningCustomersReportData.bind(
      this,
    );
    this.generateChartJSData = this.generateChartJSData.bind(this);
    this.renderAnalyticsViewCharts = this.renderAnalyticsViewCharts.bind(this);
  }

  componentDidMount() {
    this.toggleSelectElements(true);

    const currentDate = Date.now();
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

    return this.generateChartJSData({
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

    return this.generateChartJSData({
      chartLabel: 'Sales',
      totalValueLabel: `${aggregatedSales} products`,
      generalReportData: dailySales,
    });
  }

  generateTotalRevenueTopFiveProductsReportData(transactions) {
    // TODO
    return null;
  }

  generateTotalSalesTopFiveProductsReportData(transactions) {
    // TODO
    return null;
  }

  generateNewVsReturningCustomersReportData(transactions) {
    // TODO
    return null;
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

  generateChartJSData(customReportData) {
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

    this.setState({ loading: true }, () => {
      if (type === 'report') {
        const selectedReport = prevEventTargetValue;
        if (this.state.transactions.length === 0) {
          this.toggleSelectElements(false);
          return this.setState({
            currentReportData: null,
            selectedReport,
            loading: false,
          });
        }
        const currentReportData = this.generateCurrentReportData(
          selectedReport,
          this.state.transactions,
        );

        this.toggleSelectElements(false);

        return this.setState({
          currentReportData,
          selectedReport,
          loading: false,
        });
      }
      if (type === 'period') {
        const selectedPeriod = prevEventTargetValue;
        const currentDate = Date.now();
        let daysAgo = 1;
        if (selectedPeriod === 'This Week') {
          daysAgo = 7;
        }
        if (selectedPeriod === 'This Month') {
          daysAgo = 30;
        }

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
          .then((transactions) => {
            if (transactions.length === 0) {
              this.toggleSelectElements(false);
              return this.setState({
                currentReportData: null,
                selectedPeriod,
                loading: false,
              });
            }

            const currentReportData = this.generateCurrentReportData(
              this.state.selectedReport,
              transactions,
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

  generateCurrentReportData(reportType, transactions) {
    console.log(
      'generateCurrentReportData() reportType, transactions',
      reportType,
      transactions,
    );
    switch (reportType) {
      case 'Total Revenue':
        return this.generateTotalRevenueReportData(transactions);
      case 'Total Sales':
        return this.generateTotalSalesReportData(transactions);
      case 'Total Revenue: Top 5 Products':
        return this.generateTotalRevenueTopFiveProductsReportData(transactions);
      case 'Total Sales: Top 5 Products':
        return this.generateTotalSalesTopFiveProductsReportData(transactions);
      case 'New vs Returning Customers':
        return this.generateNewVsReturningCustomersReportData(transactions);
      default:
        return null;
    }
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
    if (this.state.currentReportData.totalValueLabel !== null) {
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
          <div className='MainAnalyticsViewChartsPieContainer col-6'>
            <Bar
              data={this.state.currentReportData.barChart.data}
              options={this.state.currentReportData.barChart.options}
            />
          </div>
          <div className='MainAnalyticsViewChartsBarContainer col-6'>
            <Pie
              data={this.state.currentReportData.pieChart.data}
              options={this.state.currentReportData.pieChart.options}
            />
          </div>
        </div>
        <div className='MainAnalyticsViewChartsLineRow row'>
          <div className='MainAnalyticsViewChartsLineContainer col-12'>
            <Line
              data={this.state.currentReportData.lineChart.data}
              options={this.state.currentReportData.lineChart.options}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='MainAnalyticsViewContainer'>
        {this.renderAnalyticsViewHeader()}
        {this.renderAnalyticsViewOptions()}
        {this.renderAnalyticsViewCharts()}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsView);
