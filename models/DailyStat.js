const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const DailyStat = sequelize.define('DailyStat', {
  stat_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stat_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_users: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  new_users: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_demands: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  new_demands: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_quotes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  new_quotes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_deals: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  new_deals: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  active_users: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  province_stats: {
    type: DataTypes.JSON,
    allowNull: true
  },
  category_stats: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'daily_stats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = DailyStat;
