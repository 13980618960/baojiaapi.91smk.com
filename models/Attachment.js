const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(32),
    allowNull: false
  },
  related_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  demand_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的需求ID'
  },
  quote_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的报价ID'
  },
  advertiser_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的广告主用户ID'
  },
  ad_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的广告ID'
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mime_type: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  file_extension: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '文件扩展名'
  }
}, {
  tableName: 'attachments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Attachment;