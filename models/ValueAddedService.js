const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const ValueAddedService = sequelize.define('ValueAddedService', {
  service_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '服务ID'
  },
  service_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '服务名称'
  },
  service_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '服务类型 1-增加曝光 2-需求置顶 3-加急处理 4-优先推荐'
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '基础价格（默认价格）'
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 24,
    comment: '服务时长（小时）'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '服务描述'
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
  tableName: 'value_added_services',
  timestamps: false,
  indexes: [
    { fields: ['service_type'] },
    { fields: ['is_active'] }
  ]
});

module.exports = ValueAddedService;