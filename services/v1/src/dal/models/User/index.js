/**
 * User Data Model module.
 * @module src/models/User/index.js
 */
const Sequelize = require('sequelize');

const options = {
  freezeTableName: true,
  timestamps: false,
};

module.exports = (sequelize) => {
  let User = sequelize.define(
    'users',
    {
      type: {
        type: Sequelize.ENUM('customer', 'business'),
        defaultValue: 'customer',
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      profile_id: Sequelize.INTEGER,
      email: { type: Sequelize.STRING },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      activation_token: Sequelize.STRING,
      password_reset_token: {
        type: Sequelize.STRING,
      },
      password_reset_expiry: {
        type: Sequelize.BIGINT,
      },
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      two_factor_secret: {
        type: Sequelize.STRING,
      },
      two_factor_backup: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  User.associate = (models) => {
    const foreignKey = 'user_id';
    const onDelete = 'CASCADE';
    User.hasOne(models.BusinessProfile, {
      foreignKey,
      as: 'user_business_profile',
    });
    User.hasOne(models.CustomerProfile, {
      foreignKey,
      as: 'user_customer_profile',
    });
    User.hasMany(models.BusinessProduct, {
      onDelete,
      foreignKey,
      as: 'business_product',
    });
    User.hasMany(models.BusinessTransaction, {
      onDelete,
      foreignKey,
      as: 'customer',
    });
    User.hasMany(models.BusinessTransaction, {
      onDelete,
      foreignKey: 'business_id',
      as: 'business',
    });
  };

  return User;
};
