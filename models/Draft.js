const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Draft = sequelize.define('Draft', {
  draft_id: {
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
    allowNull: true
  },
  brief_desc: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  detail_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  max_quoters: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'drafts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Draft;
