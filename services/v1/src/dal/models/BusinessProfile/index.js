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
      profile_image_url: Sequelize.STRING,
      address: Sequelize.STRING,
      phone_number: Sequelize.STRING,
      public_email: Sequelize.STRING,
      auto_convert_to_fiat: Sequelize.BOOLEAN,
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
