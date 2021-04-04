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
      address: Sequelize.STRING,
      phone_number: Sequelize.STRING,
      public_email: Sequelize.STRING,
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
