import React from 'react';
import './index.css';

const DashboardMenu = (props) => {
  const menuOptions = [
    'Transactions',
    'Products',
    'Checkout',
    'Analytics',
    'Settings',
  ];

  const appendMobileStyleAttribute = (isMobile) => {
    return !isMobile ? '' : '-Mobile';
  };

  const evaluateSegueAction = (view) => {
    console.log('evaluateSegueAction();', props.user.type, view);
    if (
      props.user !== undefined &&
      props.user.type === 'customer' &&
      (view === 'products' || view === 'analytics')
    ) {
      return 'Only business accounts can access this feature.';
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
