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
  // TODO: Drop tables to Create new one + add allowNull attributes + make changes in controllers/middleware
  let BusinessProduct = sequelize.define(
    'businessproducts',
    {
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      sku: Sequelize.STRING,
      label: Sequelize.STRING,
      category: Sequelize.STRING,
      description: Sequelize.STRING,
      price: Sequelize.DECIMAL(10, 2),
      inventory_count: Sequelize.STRING,
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
