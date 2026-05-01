const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const AdPricingRule = sequelize.define('AdPricingRule', {
  rule_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '规则ID'
  },
  ad_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '广告类型 1-开屏广告 2-轮播图广告 3-需求卡片广告 4-大厅横幅广告 5-个人中心广告'
  },
  ad_position: {
    type: DataTypes.STRING(100),
    comment: '广告位置描述'
  },
  pricing_model: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '计费模式 1-CPM 2-CPC 3-固定费用'
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '基础价格'
  },
  unit: {
    type: DataTypes.STRING(50),
    comment: '价格单位'
  },
  peak_time_slots: {
    type: DataTypes.TEXT,
    comment: '高峰时段设置（JSON格式）'
  },
  peak_hour_multiplier: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1.50,
    comment: '高峰时段加价倍数'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '规则描述'
  },
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否启用'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
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
  tableName: 'ad_pricing_rules',
  timestamps: false,
  indexes: [
    { fields: ['ad_type'] },
    { fields: ['is_active'] }
  ]
});

module.exports = AdPricingRule;