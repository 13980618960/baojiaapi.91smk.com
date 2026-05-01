const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const UserProfile = sequelize.define('UserProfile', {
  profile_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '画像ID'
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
    comment: '用户ID'
  },
  tags: {
    type: DataTypes.TEXT,
    comment: '用户标签（JSON格式）'
  },
  interest_categories: {
    type: DataTypes.TEXT,
    comment: '感兴趣的分类（JSON格式）'
  },
  user_type: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '用户类型 0-普通用户 1-需求方 2-报价方 3-双身份'
  },
  demander_vip_level: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: '需求方VIP等级'
  },
  quoter_vip_level: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: '报价方VIP等级'
  },
  location: {
    type: DataTypes.STRING(255),
    comment: '地理位置'
  },
  age_range: {
    type: DataTypes.STRING(20),
    comment: '年龄范围'
  },
  gender: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '性别 0-未知 1-男 2-女'
  },
  behavior_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '行为评分（综合活跃度）'
  },
  quote_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '报价次数'
  },
  quote_categories: {
    type: DataTypes.TEXT,
    comment: '常参与报价的分类（JSON格式）'
  },
  quote_success_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: '报价成功率'
  },
  demand_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '发布需求数量'
  },
  demand_categories: {
    type: DataTypes.TEXT,
    comment: '常发布需求的分类（JSON格式）'
  },
  favorite_categories: {
    type: DataTypes.TEXT,
    comment: '收藏的分类（JSON格式）'
  },
  recent_viewed: {
    type: DataTypes.TEXT,
    comment: '最近浏览记录（JSON格式）'
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
  tableName: 'user_profiles',
  timestamps: false,
  indexes: [
    { fields: ['user_type'] },
    { fields: ['demander_vip_level'] },
    { fields: ['quoter_vip_level'] }
  ]
});

module.exports = UserProfile;