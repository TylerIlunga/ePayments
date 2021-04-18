import React from 'react';
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const DataTable = (props) => {
  let tableIcons = {
    Add: React.forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: React.forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: React.forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: React.forwardRef((props, ref) => (
      <DeleteOutline {...props} ref={ref} />
    )),
    DetailPanel: React.forwardRef((props, ref) => (
      <ChevronRight {...props} ref={ref} />
    )),
    Edit: React.forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: React.forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: React.forwardRef((props, ref) => (
      <FilterList {...props} ref={ref} />
    )),
    FirstPage: React.forwardRef((props, ref) => (
      <FirstPage {...props} ref={ref} />
    )),
    LastPage: React.forwardRef((props, ref) => (
      <LastPage {...props} ref={ref} />
    )),
    NextPage: React.forwardRef((props, ref) => (
      <ChevronRight {...props} ref={ref} />
    )),
    PreviousPage: React.forwardRef((props, ref) => (
      <ChevronLeft {...props} ref={ref} />
    )),
    ResetSearch: React.forwardRef((props, ref) => (
      <Clear {...props} ref={ref} />
    )),
    Search: React.forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: React.forwardRef((props, ref) => (
      <ArrowDownward {...props} ref={ref} />
    )),
    ThirdStateCheck: React.forwardRef((props, ref) => (
      <Remove {...props} ref={ref} />
    )),
    ViewColumn: React.forwardRef((props, ref) => (
      <ViewColumn {...props} ref={ref} />
    )),
  };
  if (props.icons !== undefined) {
    tableIcons = props.icons;
  }
  return (
    <MaterialTable
      title={props.title}
      isLoading={props.isLoading}
      data={props.data}
      columns={props.columns}
      options={props.options}
      icons={tableIcons}
      onChangeRowsPerPage={props.onChangeRowsPerPage}
      onChangePage={props.onChangePage}
      onRowClick={props.onRowClick}
    />
  );
};

export default DataTable;
