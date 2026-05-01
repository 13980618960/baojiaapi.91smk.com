const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const OperationLog = sequelize.define('OperationLog', {
  log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  admin_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  target_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  detail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'operation_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = OperationLog;
