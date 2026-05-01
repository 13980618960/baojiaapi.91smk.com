const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const CategoryServicePrice = sequelize.define('CategoryServicePrice', {
  price_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '价格ID'
  },
  category_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '分类ID'
  },
  service_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '服务ID'
  },
  custom_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '该分类的定制价格'
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
  tableName: 'category_service_prices',
  timestamps: false,
  indexes: [
    { fields: ['category_id'] },
    { fields: ['service_id'] }
  ]
});

module.exports = CategoryServicePrice;