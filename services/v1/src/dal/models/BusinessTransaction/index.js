/**
 * BusinessTransaction Data Model module.
 * @module src/models/BusinessTransaction/index.js
 */
const Sequelize = require('sequelize');
const uuid = require('uuid');

const options = {
  freezeTableName: true,
  timestamps: false,
};

module.exports = (sequelize) => {
  let BusinessTransaction = sequelize.define(
    'businesstransactions',
    {
      id: {
        type: Sequelize.UUID,
        default: uuid.v4(),
        primaryKey: true,
      },
      business_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      product_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      coinbase_transaction_id: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      amount: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      latitude: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      longitude: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  BusinessTransaction.associate = (models) => {};

  return BusinessTransaction;
};
