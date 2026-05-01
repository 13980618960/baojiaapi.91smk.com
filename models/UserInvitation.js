const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const UserInvitation = sequelize.define('UserInvitation', {
  invitation_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '邀请记录ID'
  },
  inviter_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '邀请者ID'
  },
  invited_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '被邀请者ID'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态 0-注册中 1-已注册 2-已完成首单'
  },
  invite_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '邀请码'
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
  tableName: 'user_invitations',
  timestamps: false,
  indexes: [
    { fields: ['inviter_id'] },
    { fields: ['invited_id'] },
    { fields: ['status'] }
  ]
});

module.exports = UserInvitation;