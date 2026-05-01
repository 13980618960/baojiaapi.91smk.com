const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const DemandServiceOrder = sequelize.define('DemandServiceOrder', {
  order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '订单ID'
  },
  demand_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '需求ID'
  },
  service_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '服务ID'
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '购买用户ID'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '支付金额'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '订单状态 0-待支付 1-已支付 2-已生效 3-已过期'
  },
  start_time: {
    type: DataTypes.DATE,
    comment: '生效时间'
  },
  end_time: {
    type: DataTypes.DATE,
    comment: '结束时间'
  },
  is_free: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否使用免费权益 0-否 1-是'
  },
  reward_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    comment: '使用的奖励权益ID'
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
  tableName: 'demand_service_orders',
  timestamps: false,
  indexes: [
    { fields: ['demand_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
});

module.exports = DemandServiceOrder;