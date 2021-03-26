/**
 * Database (DAL layer) Configuration module.
 * @module src/dal/config.js
 */
require('pg');

const Sequelize = require('sequelize');
const dbConfig = {
  database: process.env.PGDATABASE || 'epaydb_dev',
  user: process.env.PGUSER || 'tilios',
  password: process.env.PGPASS || null,
  host: process.env.PROD ? process.env.PGHOST_PROD : process.env.PGHOST_DEV,
  port: process.env.PGPORT || 5432,
  dialect: 'postgres',
  pool: {
    min: Number(process.env.DB_CONN_POOL_MIN) || 0,
    max: Number(process.env.DB_CONN_POOL_MAX) || 5,
    idle: Number(process.env.DB_CONN_POOL_IDLE_TIME) || 10000,
    acquire: Number(process.env.DB_CONN_POOL_ACQUIRE_TIME) || 30000,
  },
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: {
      min: dbConfig.pool.min,
      max: dbConfig.pool.max,
      idle: dbConfig.pool.idle,
      acquire: dbConfig.pool.acquire,
    },
    logging: false, // NOTE: false when testing
  },
);

const models = {
  BusinessProduct: require('../models/BusinessProduct')(sequelize),
  BusinessProfile: require('../models/BusinessProfile')(sequelize),
  BusinessTransaction: require('../models/BusinessTransaction')(sequelize),
  CustomerProfile: require('../models/CustomerProfile')(sequelize),
  PaymentAccount: require('../models/PaymentAccount')(sequelize),
  User: require('../models/User')(sequelize),
};

if (!process.env.PROD) {
  console.log('Listing models(Development)');
}
Object.keys(models).forEach((key) => {
  if (!process.env.PROD) {
    console.log(`Model: ${key}`);
  }
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

module.exports = {
  ...models,
  getConnection: () => sequelize,
  getSqlizeModule: () => Sequelize,
};
