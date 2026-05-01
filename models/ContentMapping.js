const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const ContentMapping = sequelize.define('ContentMapping', {
  mapping_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '映射ID'
  },
  rule_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    comment: '关联规则ID'
  },
  content_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '内容类型 1-需求 2-报价 3-广告 4-分类'
  },
  content_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '内容ID'
  },
  target_user_tags: {
    type: DataTypes.TEXT,
    comment: '目标用户标签（JSON格式）'
  },
  target_user_type: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '目标用户类型 0-全部 1-需求方 2-报价方'
  },
  target_demander_vip: {
    type: DataTypes.STRING(100),
    comment: '目标需求方VIP等级（逗号分隔）'
  },
  target_quoter_vip: {
    type: DataTypes.STRING(100),
    comment: '目标报价方VIP等级（逗号分隔）'
  },
  target_categories: {
    type: DataTypes.TEXT,
    comment: '目标分类（JSON格式）'
  },
  weight: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 100,
    comment: '权重'
  },
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否启用'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'content_mappings',
  timestamps: false,
  indexes: [
    { fields: ['rule_id'] },
    { fields: ['content_type'] },
    { fields: ['content_id'] },
    { fields: ['target_user_type'] },
    { fields: ['is_active'] }
  ]
});

module.exports = ContentMapping;