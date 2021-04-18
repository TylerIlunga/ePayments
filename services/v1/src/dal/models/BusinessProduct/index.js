/**
 * BusinessProduct Data Model module.
 * @module src/models/BusinessProduct/index.js
 */
const Sequelize = require('sequelize');

const options = {
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      fields: ['user_id', 'sku'],
    },
  ],
};

module.exports = (sequelize) => {
  let BusinessProduct = sequelize.define(
    'businessproducts',
    {
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      sku: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      label: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      category: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: Sequelize.STRING,
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      inventory_count: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
