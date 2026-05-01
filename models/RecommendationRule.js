const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const RecommendationRule = sequelize.define('RecommendationRule', {
  rule_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '规则ID'
  },
  rule_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '规则名称'
  },
  rule_type: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '规则类型 1-内容推荐 2-广告推荐 3-需求推荐'
  },
  conditions: {
    type: DataTypes.TEXT,
    comment: '规则条件（JSON格式）'
  },
  priority: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 100,
    comment: '优先级（数值越小优先级越高）'
  },
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否启用'
  },
  start_time: {
    type: DataTypes.DATE,
    comment: '生效开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    comment: '生效结束时间'
  },
  description: {
    type: DataTypes.STRING(500),
    comment: '规则描述'
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
  tableName: 'recommendation_rules',
  timestamps: false,
  indexes: [
    { fields: ['rule_type'] },
    { fields: ['priority'] },
    { fields: ['is_active'] }
  ]
});

module.exports = RecommendationRule;