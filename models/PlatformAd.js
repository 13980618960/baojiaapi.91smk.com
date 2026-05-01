const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const AdPosition = require('./AdPosition');

const PlatformAd = sequelize.define('PlatformAd', {
  ad_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  position_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: AdPosition,
      key: 'position_id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  type: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  billing_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'cpm'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  image_width: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  image_height: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  detail_images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  link_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  target_provinces: {
    type: DataTypes.JSON,
    allowNull: true
  },
  target_cities: {
    type: DataTypes.JSON,
    allowNull: true
  },
  target_categories: {
    type: DataTypes.JSON,
    allowNull: true
  },
  target_user_levels: {
    type: DataTypes.JSON,
    allowNull: true
  },
  interests: {
    type: DataTypes.JSON,
    allowNull: true
  },
  behaviors: {
    type: DataTypes.JSON,
    allowNull: true
  },
  gender: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0
  },
  min_age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  max_age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  category_ids: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  provinces: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  },
  click_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  show_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  sort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1
  },
  rule_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  fund_account_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'platform_ads',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

PlatformAd.prototype.toJSON = function() {
  const values = { ...this.get() };
  if (values.target_provinces && typeof values.target_provinces === 'string') {
    try {
      values.target_provinces = JSON.parse(values.target_provinces);
    } catch (e) {}
  }
  if (values.target_cities && typeof values.target_cities === 'string') {
    try {
      values.target_cities = JSON.parse(values.target_cities);
    } catch (e) {}
  }
  if (values.target_categories && typeof values.target_categories === 'string') {
    try {
      values.target_categories = JSON.parse(values.target_categories);
    } catch (e) {}
  }
  if (values.interests && typeof values.interests === 'string') {
    try {
      values.interests = JSON.parse(values.interests);
    } catch (e) {}
  }
  if (values.behaviors && typeof values.behaviors === 'string') {
    try {
      values.behaviors = JSON.parse(values.behaviors);
    } catch (e) {}
  }
  return values;
};

// 建立关联
PlatformAd.belongsTo(AdPosition, { foreignKey: 'position_id', as: 'positionInfo' });

module.exports = PlatformAd;
