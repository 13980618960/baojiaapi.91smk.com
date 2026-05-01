const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const SystemConfig = sequelize.define('SystemConfig', {
  config_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  config_key: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  config_value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  config_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  group_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'default'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'system_configs',
  timestamps: false
});

module.exports = SystemConfig;
