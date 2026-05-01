const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  openid: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  nickname: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  real_name: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  province_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  detail_address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  is_verified: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  current_identity: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  demander_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  quoter_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  user_status: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
