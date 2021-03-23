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
      user_id: Sequelize.STRING,
      profile_id: Sequelize.STRING,
      coinbase_access_token: Sequelize.STRING,
      coinbase_access_token_expiry: Sequelize.STRING,
      coinbase_refresh_token: Sequelize.STRING,
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
