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
  let UserProfile = sequelize.define(
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

  UserProfile.associate = (models) => {
    const foreignKey = 'user_profile_id';
    const onDelete = 'CASCADE';

    // User.hasMany(models.Connection, {
    //   onDelete,
    //   foreignKey: 'scanner_id',
    //   as: 'scanner',
    // });
    // User.hasMany(models.Connection, {
    //   onDelete,
    //   foreignKey: 'owner_id',
    //   as: 'owner',
    // });
    // User.hasOne(models.Subscription, {
    //   foreignKey,
    //   as: 'user_subscription',
    // });
    // User.hasMany(models.Message, { as: 'sender', foreignKey: 'sender_id', onDelete: 'CASCADE' });
    // User.belongsToMany(models.Fondue, {as: "collabRequests", foreignKey: "recipient_id", through: models.CollabRequests});
  };

  return UserProfile;
};
