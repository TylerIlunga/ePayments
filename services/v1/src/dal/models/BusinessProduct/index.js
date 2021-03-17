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
      sku: Sequelize.STRING,
      label: Sequelize.STRING,
      description: Sequelize.STRING,
      price: Sequelize.DECIMAL(10, 2),
      inventory_count: Sequelize.STRING,
      view_count: {
        type: Sequelize.INTEGER,
        default: 0,
      },
      purchased_count: {
        type: Sequelize.INTEGER,
        default: 0,
      },
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
