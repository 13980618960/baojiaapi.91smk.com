const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Quote = sequelize.define('Quote', {
  quote_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  demand_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '元/次'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_custom: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  reject_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  modified_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  first_quote_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  last_quote_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  accepted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'quotes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Quote;
