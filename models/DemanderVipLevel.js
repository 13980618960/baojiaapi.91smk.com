const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const DemanderVipLevel = sequelize.define('DemanderVipLevel', {
  level_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level_name: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  level_icon: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  level_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  weight_boost: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 1.00
  },
  max_demands: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  can_top: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  can_anonymous: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1
  },
  fee_rate: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  upgrade_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
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
  tableName: 'd_vips',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DemanderVipLevel;
