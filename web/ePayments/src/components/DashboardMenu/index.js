import React from 'react';
import './index.css';

const DashboardMenu = (props) => {
  let menuOptions = ['Transactions', 'Products', 'Analytics', 'Settings'];
  if (props.user.type === 'customer') {
    menuOptions[1] = 'Checkout';
  }

  const appendMobileStyleAttribute = (isMobile) => {
    return !isMobile ? '' : '-Mobile';
  };

  const segueTo = (evt, view) => {
    evt.preventDefault();
    props.history.push(`/h/${view}`);
  };

  const optionIsActive = (optionLabel, activeOptionLabel) => {
    if (optionLabel === activeOptionLabel) {
      return 'DashboardMenuColOption-Active';
    }
  };

  return (
    <div
      className={`MainDashboardMenuContainer${appendMobileStyleAttribute(
        props.isMobile,
      )} ${props.colSize}`}
    >
      {menuOptions.map((option, i) => {
        return (
          <div
            key={i}
            className='DashboardMenuColOptionContainer'
            onClick={(evt) => segueTo(evt, option.toLowerCase())}
          >
            <div
              className={`DashboardMenuColOption ${optionIsActive(
                option,
                props.activeOption,
              )}`}
            >
              <p>{option}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardMenu;
