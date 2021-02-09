/**
 * CustomerProfile Data Model module.
 * @module src/models/CustomerProfile/index.js
 */
const Sequelize = require('sequelize');

const options = {
  freezeTableName: true,
  timestamps: false,
};

module.exports = (sequelize) => {
  let CustomerProfile = sequelize.define(
    'userprofiles',
    {
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      profile_image_url: Sequelize.STRING,
      username: Sequelize.STRING,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  CustomerProfile.associate = (models) => {};

  return CustomerProfile;
};
