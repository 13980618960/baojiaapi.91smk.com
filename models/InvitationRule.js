const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const AdPosition = require('./AdPosition');

const InvitationRule = sequelize.define('InvitationRule', {
  rule_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '规则ID'
  },
  rule_mode: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '规则模式 1-已有广告引导分享 2-先分享后创建广告'
  },
  required_invites: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '需要邀请的人数'
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
  free_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 7,
    comment: '免费值（天数/次数等，根据pricing_model确定）'
  },
  can_stack: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否可叠加 0-否 1-是'
  },
  expire_days: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: '奖励有效期(天) - 仅模式2有效'
  },
  visible_user_ids: {
    type: DataTypes.TEXT,
    comment: '仅可见的用户ID列表(JSON数组格式),为空表示全部可见'
  },
  show_on_miniprogram: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '小程序端是否显示 0-否 1-是'
  },
  rule_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '规则名称'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '规则描述'
  },
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否启用 0-禁用 1-启用'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序序号'
  },
  total_invites: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '累计邀请人数(统计)'
  },
  total_rewards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '累计发放奖励次数(统计)'
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
  tableName: 'invitation_rules',
  timestamps: false,
  indexes: [
    { fields: ['rule_mode'] },
    { fields: ['position_id'] },
    { fields: ['pricing_model'] },
    { fields: ['is_active'] },
    { fields: ['show_on_miniprogram'] }
  ]
});

// 建立关联
InvitationRule.belongsTo(AdPosition, { foreignKey: 'position_id', as: 'positionInfo' });

module.exports = InvitationRule;