import React from 'react';
import { connect } from 'react-redux';
import './index.css';

class ProductsView extends React.Component {
  constructor(props) {
    super(props);

    let selectedProduct = null;
    if (
      props.location !== undefined &&
      props.location.state !== undefined &&
      props.location.state !== null &&
      props.location.state.selectedProduct !== undefined &&
      props.location.state.selectedProduct !== null
    ) {
      selectedProduct = props.location.state.selectedProduct;
    }

    this.state = { selectedProduct, products: [] };
  }

  render() {
    return (
      <div>
        <p>ProductsView</p>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ProductsView);
