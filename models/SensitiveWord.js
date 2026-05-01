const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const SensitiveWord = sequelize.define('SensitiveWord', {
  word_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  word: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  level: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1
  },
  replace_word: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'sensitive_words',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SensitiveWord;
