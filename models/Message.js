const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Message = sequelize.define('Message', {
  msg_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  demand_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quote_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  from_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  from_identity: {
    type: DataTypes.TINYINT(1),
    allowNull: false
  },
  to_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  to_identity: {
    type: DataTypes.TINYINT(1),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  is_read: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Message;
