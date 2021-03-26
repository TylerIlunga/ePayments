/**
 * PaymentAccount Data Model module.
 * @module src/models/PaymentAccount/index.js
 */
const Sequelize = require('sequelize');

const options = {
  freezeTableName: true,
  timestamps: false,
};

module.exports = (sequelize) => {
  let PaymentAccount = sequelize.define(
    'paymentaccounts',
    {
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      profile_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      coinbase_access_token: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      coinbase_access_token_expiry: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      coinbase_refresh_token: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  PaymentAccount.associate = (models) => {};

  return PaymentAccount;
};
