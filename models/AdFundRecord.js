const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const AdFundRecord = sequelize.define('AdFundRecord', {
  record_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '记录ID'
  },
  fund_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '资金账户ID'
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '用户ID'
  },
  type: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '类型 1-充值 2-消费 3-退款 4-后台调整'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    comment: '金额'
  },
  before_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    comment: '变动前余额'
  },
  after_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    comment: '变动后余额'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '描述'
  },
  operator_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '操作人ID'
  },
  operator_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '操作人姓名'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  }
}, {
  tableName: 'ad_fund_records',
  timestamps: false,
  indexes: [
    { fields: ['fund_id'] },
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['created_at'] }
  ]
});

module.exports = AdFundRecord;
