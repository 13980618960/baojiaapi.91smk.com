const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');

const AdFund = sequelize.define('AdFund', {
  fund_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '璧勯噾璐︽埛ID'
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '缁戝畾鐨勭敤鎴稩D'
  },
  account_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '璐︽埛鍚嶇О'
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: '璐︽埛浣欓'
  },
  total_income: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: '绱鏀跺叆'
  },
  total_expense: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: '绱鏀嚭'
  },
  ad_ids: {
    type: DataTypes.TEXT,
    comment: '缁戝畾鐨勫箍鍛奍D鍒楄〃(JSON鏍煎紡)'
  },
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '鏄惁鍚敤'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '璐︽埛鎻忚堪'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '鍒涘缓鏃堕棿'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    comment: '鏇存柊鏃堕棿'
  }
}, {
  tableName: 'ad_funds',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['is_active'] }
  ]
});

// 寤虹珛鍏宠仈
AdFund.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = AdFund;

