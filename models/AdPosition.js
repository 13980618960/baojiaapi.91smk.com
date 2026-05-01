const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const AdPosition = sequelize.define('AdPosition', {
  position_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  position_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  position_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  max_ads: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  display_interval: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  content_interval: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3
  },
  interval_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'hour'
  },
  interval_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  carousel_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  height: {
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
  tableName: 'ad_positions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AdPosition;