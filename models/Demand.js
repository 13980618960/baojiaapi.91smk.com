const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Demand = sequelize.define('Demand', {
  demand_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  brief_desc: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  detail_desc: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: null
  },
  max_quoters: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  need_audit: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  is_classified: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  is_anonymous: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  is_top: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  top_scope: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  quote_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  auditor_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  audited_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'demands',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Demand;
