import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import './index.css';

const BrandHeader = (props) => {
  const displayCorrectMenuIcon = (mobileMenuisDisplayed) => {
    if (mobileMenuisDisplayed) {
      return (
        <CloseIcon
          style={{ fontSize: 30 }}
          onClick={props.onToggleMobileMenuModal}
        />
      );
    }
    return (
      <MenuIcon
        style={{ fontSize: 30 }}
        onClick={props.onToggleMobileMenuModal}
      />
    );
  };
  return (
    <div className='BrandHeaderRow row'>
      <div className='BrandHeaderRowLabelContainer'>
        <a
          href='#home'
          onClick={(e) => props.history.replace('/h/transactions')}
        >
          ePayments
        </a>
      </div>
      <div className='BrandHeaderRowMenuContainer'>
        {displayCorrectMenuIcon(props.displayMobileMenuModal)}
      </div>
    </div>
  );
};

export default BrandHeader;
