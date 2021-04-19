/**
 * BusinessProfile Data Model module.
 * @module src/models/BusinessProfile/index.js
 */
const Sequelize = require('sequelize');

const options = {
  freezeTableName: true,
  timestamps: false,
};

module.exports = (sequelize) => {
  let BusinessProfile = sequelize.define(
    'businessprofiles',
    {
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      legal_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      industry: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      country: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      phone_number: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      public_email: {
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

  BusinessProfile.associate = (models) => {};

  return BusinessProfile;
};
