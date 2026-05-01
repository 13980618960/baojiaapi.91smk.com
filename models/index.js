const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    pool: config.database.pool,
    logging: false,
    timezone: '+08:00',
    charset: config.database.charset,
    collate: config.database.collate,
    dialectOptions: {
      charset: config.database.charset
    },
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  }
);

module.exports = sequelize;
