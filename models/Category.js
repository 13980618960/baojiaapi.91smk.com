const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Category = sequelize.define('Category', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    indexes: [{ name: 'idx_parent_id', fields: ['parent_id'] }]
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  level: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
    indexes: [{ name: 'idx_level', fields: ['level'] }]
  },
  path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    indexes: [{ name: 'idx_sort', fields: ['sort'] }]
  },
  is_show: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_level_sort', fields: ['level', 'sort'] },
    { name: 'idx_parent_id_sort', fields: ['parent_id', 'sort'] }
  ]
});

module.exports = Category;
