import React from 'react';
import './index.css';

const BrandHeader = (props) => (
  <div className='BrandHeaderRow row'>
    <a href='#home' onClick={(e) => props.history.replace('/h/transactions')}>
      ePayments
    </a>
  </div>
);

export default BrandHeader;
