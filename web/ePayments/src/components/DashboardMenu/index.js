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

  const evaluateSegueAction = (view) => {
    console.log('evaluateSegueAction();', props.user.type, view);
    if (
      props.user !== undefined &&
      props.user.type === 'customer' &&
      view === 'products'
    ) {
      return 'Only business accounts can create products.';
    }
    if (
      props.user !== undefined &&
      props.user.type === 'business' &&
      view === 'checkout'
    ) {
      return 'Only customer accounts can purchase products.';
    }
    return null;
  };

  const segueTo = (evt, view) => {
    evt.preventDefault();

    const error = evaluateSegueAction(view);
    if (error) {
      return props.displayToastMessage('error', error);
    }

    props.history.push(`/h/${view}`);
  };

  const optionIsActive = (optionLabel, activeOptionLabel) => {
    if (optionLabel === activeOptionLabel) {
      return 'DashboardMenuColOption-Active';
    }
  };

  return (
    <div className={`MainDashboardMenuContainer ${props.colSize}`}>
      {menuOptions.map((option, i) => {
        return (
          <div
            key={i}
            className='DashboardMenuColOptionContainer'
            onClick={(evt) => segueTo(evt, option.label.toLowerCase())}
          >
            <div
              className={`DashboardMenuColOption ${optionIsActive(
                option.label,
                props.activeOption,
              )}`}
            >
              {/* <div className='DashboardMenuColOptionChild'>{option.logo}</div> */}
              <p>{option.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardMenu;
