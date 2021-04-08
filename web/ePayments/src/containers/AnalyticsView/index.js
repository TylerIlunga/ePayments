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
      reportTypes: [
        'Total Revenue',
        'Total Sales',
        'Total Revenue: Top 5 Products',
        'Total Sales: Top 5 Products',
        'New vs Returning Customers',
      ],
      periodTypes: ['Today', 'This Week', 'This Month'],
      selectedReport: 'Total Revenue',
      selectedPeriod: 'Today',
      currentReportData: null,
    };

    this.reportDataStartState = {
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
    this.generateTotalRevenueReportData = this.generateTotalRevenueReportData.bind(
      this,
    );
    this.renderAnalyticsViewCharts = this.renderAnalyticsViewCharts.bind(this);
  }

  componentDidMount() {
    this.toggleSelectElements(true);

    const currentDate = Date.now();
    // const dateAWeekAgoFromNow = this.getDateDaysAgoFromNow(currentDate, 7);
    const dateOneDayAgoFromNow = this.getDateDaysAgoFromNow(currentDate, 1);
    this.fetchTransactions({
      // businessID: this.props.user.id
      businessID: 7,
      betweenDates: {
        // start: currentDate,
        // end: dateOneDayAgoFromNow.getTime(),
        start: '1617761380978',
        end: '1617761413176',
      },
      queryAttributes: {
        order: 'ASC',
      },
    })
      .then((transactions) => {
        if (transactions.length === 0) {
          this.toggleSelectElements(false);
          return this.setState({ loading: false });
        }
        const currentReportData = this.generateTotalRevenueReportData(
          transactions,
        );

        this.toggleSelectElements(false);

        this.setState({
          currentReportData,
          loading: false,
        });
      })
      .catch((error) => {
        this.displayToastMessage('error', error);
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
    const currentReportData = this.reportDataStartState;
    let dailyRevenue = {};
    let aggregatedRevenue = 0;

    transactions.forEach((transaction) => {
      const currentDate = new Date(
        Number(transaction.created_at),
      ).toDateString();

      aggregatedRevenue += transaction.amount;

      if (dailyRevenue[currentDate] !== undefined) {
        dailyRevenue[currentDate] += transaction.amount;
      } else {
        dailyRevenue[currentDate] = transaction.amount;
      }
    });

    console.log('dailyRevenue', dailyRevenue);

    const dataLabels = Object.keys(dailyRevenue);
    const dataValues = Object.values(dailyRevenue);
    const chartLabel = 'Revenue';
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
      backgroundColor: 'rgba(75,192,192,1)',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: dataValues,
    });
    currentReportData.lineChart.data.datasets.push({
      label: chartLabel,
      fill: false,
      lineTension: 0.5,
      backgroundColor: 'rgba(75,192,192,1)',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: dataValues,
    });
    // currentReportData.pieChart.data.datasets.push({
    //   label: chartLabel,
    //   // TODO: Generate hex colors based on the amount of data we have
    //   backgroundColor: [
    //     '#B21F00',
    //     '#C9DE00',
    //     '#2FDE00',
    //     '#00A6B4',
    //     '#6800B4'
    //   ],
    //   // TODO: Generate hex colors based on the amount of data we have
    //   hoverBackgroundColor: [
    //   '#501800',
    //   '#4B5000',
    //   '#175000',
    //   '#003350',
    //   '#35014F'
    //   ],
    //   data: dataValues
    // })

    currentReportData.barChart.options.title = chartTitleOptions;
    currentReportData.lineChart.options.title = chartTitleOptions;
    currentReportData.pieChart.options.title = chartTitleOptions;

    currentReportData.barChart.options.legend = chartLegendOptions;
    currentReportData.lineChart.options.legend = chartLegendOptions;
    currentReportData.pieChart.options.legend = chartLegendOptions;

    console.log('currentReportData:', currentReportData);

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
    // Fetch data based on selected report/period type
    // Disbale MainAnalyticsViewOptionsSelect elements while loading data
    console.log(
      'handleChangeReport() evt.target.value, type:',
      evt.target.value,
      type,
    );
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
          <div className='MainAnalyticsViewChartsPieContainer col-6'>
            <Bar
              data={this.state.currentReportData.barChart.data}
              options={this.state.currentReportData.barChart.options}
            />
          </div>
          <div className='MainAnalyticsViewChartsBarContainer col-6'>
            <Pie
              data={this.state.currentReportData.barChart.data}
              options={this.state.currentReportData.barChart.options}
            />
          </div>
        </div>
        <div className='MainAnalyticsViewChartsLineRow row'>
          <div className='MainAnalyticsViewChartsLineContainer col-12'>
            <Line
              data={this.state.currentReportData.barChart.data}
              options={this.state.currentReportData.barChart.options}
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
