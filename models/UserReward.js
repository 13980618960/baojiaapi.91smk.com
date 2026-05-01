const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const AdPosition = require('./AdPosition');
const AdvertiserAd = require('./AdvertiserAd');

const UserReward = sequelize.define('UserReward', {
  reward_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '奖励ID'
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '用户ID'
  },
  rule_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '奖励规则ID'
  },
  rule_mode: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '规则模式 1-已有广告引导分享 2-先分享后创建广告'
  },
  position_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '广告位置ID，关联ad_positions表'
  },
  pricing_model: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '计费方式 1-CPM 2-CPC 3-CPA 4-OCPC 5-CPT'
  },
  ad_id: {
    type: DataTypes.INTEGER,
    comment: '关联的广告ID（模式1必填，模式2可选）'
  },
  free_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 7,
    comment: '免费值（天数/次数等，根据pricing_model确定）'
  },
  used_value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '已使用的值'
  },
  start_time: {
    type: DataTypes.DATE,
    comment: '免费开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    comment: '免费结束时间'
  },
  paid_paused_at: {
    type: DataTypes.DATE,
    comment: '付费暂停时间（模式1中途获得奖励时记录）'
  },
  original_end_time: {
    type: DataTypes.DATE,
    comment: '原付费结束时间（模式1中途获得奖励时记录）'
  },
  obtained_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '获得奖励时间'
  },
  expire_at: {
    type: DataTypes.DATE,
    comment: '奖励过期时间（模式2有效）'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态 0-已过期 1-未使用 2-使用中 3-已使用完'
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
  tableName: 'user_rewards',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['rule_id'] },
    { fields: ['rule_mode'] },
    { fields: ['position_id'] },
    { fields: ['pricing_model'] },
    { fields: ['ad_id'] },
    { fields: ['status'] }
  ]
});

// 建立关联
UserReward.belongsTo(AdPosition, { foreignKey: 'position_id', as: 'positionInfo' });
UserReward.belongsTo(AdvertiserAd, { foreignKey: 'ad_id', as: 'adInfo' });

module.exports = UserReward;