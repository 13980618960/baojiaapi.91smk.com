const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const DemanderVipUser = sequelize.define('DemanderVipUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  level_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  credit_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  available_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_demands: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  success_demands: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  expired_demands: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  success_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  vip_start_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  vip_expire_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_permanent: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'demander_vip_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DemanderVipUser;
