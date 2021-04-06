import React from 'react';
import ReceiptRoundedIcon from '@material-ui/icons/ReceiptRounded';
import StoreRoundedIcon from '@material-ui/icons/StoreRounded';
import CameraAltRoundedIcon from '@material-ui/icons/CameraAltRounded';
import AssessmentRoundedIcon from '@material-ui/icons/AssessmentRounded';
import SettingsApplicationsRoundedIcon from '@material-ui/icons/SettingsApplicationsRounded';
import './index.css';

const DashboardMenu = (props) => {
  const menuOptions = [
    { logo: <ReceiptRoundedIcon />, label: 'Transactions' },
    { logo: <StoreRoundedIcon />, label: 'Products' },
    { logo: <CameraAltRoundedIcon />, label: 'Checkout' },
    { logo: <AssessmentRoundedIcon />, label: 'Analytics' },
    { logo: <SettingsApplicationsRoundedIcon />, label: 'Settings' },
  ];

  const segueTo = (evt, view) => {
    evt.preventDefault();
    if (
      props.user !== undefined &&
      props.user.type === 'customer' &&
      view === 'products'
    ) {
      return props.displayToastMessage(
        'error',
        'Only business accounts can create products.',
      );
    }
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
