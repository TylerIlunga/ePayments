import React from 'react';
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

const DataTable = (props) => {
  let tableIcons = {
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
