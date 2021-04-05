import React from 'react';
import ReceiptRoundedIcon from '@material-ui/icons/ReceiptRounded';
import StoreRoundedIcon from '@material-ui/icons/StoreRounded';
import AssessmentRoundedIcon from '@material-ui/icons/AssessmentRounded';
import SettingsApplicationsRoundedIcon from '@material-ui/icons/SettingsApplicationsRounded';
import './index.css';

const DashboardMenu = (props) => {
  const menuOptions = [
    { logo: <ReceiptRoundedIcon />, label: 'Transactions' },
    { logo: <StoreRoundedIcon />, label: 'Products' },
    { logo: <AssessmentRoundedIcon />, label: 'Analytics' },
    { logo: <SettingsApplicationsRoundedIcon />, label: 'Settings' },
  ];

  // TODO: Display alert or modal if a user of type "customer" tries to
  // click on the "Products" tab

  const segueTo = (evt, view) => {
    evt.preventDefault();
    props.history.push(`/h/${view}`);
  };

  return (
    <div className={`DashboardMenuColContainer ${props.colSize}`}>
      {menuOptions.map((option, i) => {
        return (
          <div
            key={i}
            className='DashboardMenuColOption'
            onClick={(evt) => segueTo(evt, option.label.toLowerCase())}
          >
            <div className='DashboardMenuColOptionIcon'>{option.logo}</div>
            <div className='DashboardMenuColOptionLabel'>
              <p>{option.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardMenu;
