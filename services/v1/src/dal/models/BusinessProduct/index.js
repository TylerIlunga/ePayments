/**
 * BusinessProduct Data Model module.
 * @module src/models/BusinessProduct/index.js
 */
const Sequelize = require('sequelize');

const options = {
  freezeTableName: true,
  timestamps: false,
};

module.exports = (sequelize) => {
  let BusinessProduct = sequelize.define(
    'businessproducts',
    {
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      product_image_url: Sequelize.STRING,
      label: Sequelize.STRING,
      description: Sequelize.STRING,
      price: Sequelize.STRING,
      inventory_count: Sequelize.STRING,
      view_count: Sequelize.INTEGER,
      purchased_count: Sequelize.INTEGER,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  BusinessProduct.associate = (models) => {};

  return BusinessProduct;
};
