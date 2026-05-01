const { Op } = require('sequelize');

/**
 * 广告展示算法 - 最小条件法
 * 广告的定向范围必须包含用户的现有条件
 * @param {Object} ads - 广告列表
 * @param {Object} userConditions - 用户现有条件
 * @param {string} position - 广告位置
 * @returns {Array} 符合条件的广告列表
 */
exports.filterAdsByConditions = (ads, userConditions, position) => {
  return ads.filter(ad => {
    // 1. 检查广告状态
    if (ad.status !== 1) return false;
    
    // 2. 检查时间范围
    const now = new Date();
    if (ad.start_time && now < ad.start_time) return false;
    if (ad.end_time && now > ad.end_time) return false;
    
    // 3. 检查位置匹配
    if (ad.position && ad.position !== position) return false;
    
    // 4. 检查位置定向（省份、城市）
    if (!checkLocationMatch(ad, userConditions)) return false;
    
    // 5. 检查分类定向（只有需求卡广告和大厅横幅广告需要）
    if (position === 'demand_hall_feed' || position === 'demand_hall_banner') {
      if (!checkCategoryMatch(ad, userConditions)) return false;
    }
    
    // 6. 检查其他维度（年龄、性别）
    if (!checkDemographicMatch(ad, userConditions)) return false;
    
    return true;
  });
};

/**
 * 检查位置匹配 - 最小条件法
 * 广告的定向范围必须包含用户的最小位置条件
 * @param {Object} ad - 广告
 * @param {Object} userConditions - 用户条件
 * @returns {boolean} 是否匹配
 */
function checkLocationMatch(ad, userConditions) {
  const { province, city, district } = userConditions;
  
  // 广告没有位置定向，直接匹配
  if (!ad.provinces && !ad.target_provinces && !ad.target_cities) {
    return true;
  }
  
  // 确定用户的最小位置条件
  let userLocation = district || city || province;
  if (!userLocation) {
    return true; // 用户没有位置信息，直接匹配
  }
  
  // 处理普通广告的 provinces 字段（字符串，逗号分隔）
  if (ad.provinces) {
    const provinces = ad.provinces.split(',').map(p => p.trim());
    // 广告的省份范围必须包含用户的最小位置条件
    return provinces.includes(userLocation);
  }
  
  // 处理平台广告的 target_provinces 和 target_cities（JSON）
  if (ad.target_provinces) {
    const targetProvinces = Array.isArray(ad.target_provinces) ? ad.target_provinces : [];
    // 广告的省份范围必须包含用户的最小位置条件
    return targetProvinces.includes(userLocation);
  }
  
  if (ad.target_cities) {
    const targetCities = Array.isArray(ad.target_cities) ? ad.target_cities : [];
    // 广告的城市范围必须包含用户的最小位置条件
    return targetCities.includes(userLocation);
  }
  
  return true;
}

/**
 * 检查分类匹配 - 最小条件法
 * 广告的分类定向范围必须包含用户的分类条件
 * @param {Object} ad - 广告
 * @param {Object} userConditions - 用户条件
 * @returns {boolean} 是否匹配
 */
function checkCategoryMatch(ad, userConditions) {
  const { category } = userConditions;
  
  // 广告没有分类定向，直接匹配
  if (!ad.category_ids && !ad.target_categories) {
    return true;
  }
  
  // 用户没有选择分类，直接匹配
  if (!category) {
    return true;
  }
  
  // 处理 category_ids 字段（字符串，逗号分隔）
  if (ad.category_ids) {
    const categoryIds = ad.category_ids.split(',').map(id => id.trim());
    // 广告的分类范围必须包含用户的分类
    return categoryIds.includes(category);
  }
  
  // 处理 target_categories 字段（JSON）
  if (ad.target_categories) {
    const targetCategories = Array.isArray(ad.target_categories) ? ad.target_categories : [];
    // 广告的分类范围必须包含用户的分类
    return targetCategories.includes(category);
  }
  
  return true;
}

/**
 * 检查人口统计匹配（年龄、性别）
 * @param {Object} ad - 广告
 * @param {Object} userConditions - 用户条件
 * @returns {boolean} 是否匹配
 */
function checkDemographicMatch(ad, userConditions) {
  const { age, gender } = userConditions;
  
  // 检查年龄
  if (ad.min_age && age < ad.min_age) return false;
  if (ad.max_age && age > ad.max_age) return false;
  
  // 检查性别（0: 不限，1: 男，2: 女）
  if (ad.gender && ad.gender !== 0 && ad.gender !== gender) return false;
  
  return true;
}

/**
 * 按权重排序广告（权重高的优先）
 * @param {Array} ads - 广告列表
 * @returns {Array} 排序后的广告列表
 */
exports.sortAdsByWeight = (ads) => {
  return ads.sort((a, b) => {
    // 先按权重排序
    if (b.weight !== a.weight) {
      return b.weight - a.weight;
    }
    // 权重相同按排序字段
    if (b.sort !== a.sort) {
      return b.sort - a.sort;
    }
    // 排序字段相同按创建时间
    return new Date(b.created_at) - new Date(a.created_at);
  });
};

/**
 * 根据权重比例选择广告（权重高的广告获得更多展示机会）
 * @param {Array} ads - 广告列表
 * @param {number} count - 需要选择的广告数量
 * @returns {Array} 选中的广告列表
 */
exports.selectAdsByWeightRatio = (ads, count) => {
  if (!ads || ads.length === 0) return [];
  if (ads.length <= count) return [...ads];
  
  // 计算总权重
  const totalWeight = ads.reduce((sum, ad) => sum + (ad.weight || 0), 0);
  if (totalWeight === 0) {
    // 如果所有权重为0，随机选择
    return shuffleArray([...ads]).slice(0, count);
  }
  
  const selectedAds = [];
  const usedIndices = new Set();
  
  // 根据权重比例选择广告
  for (let i = 0; i < count && selectedAds.length < ads.length; i++) {
    let random = Math.random() * totalWeight;
    let selectedIndex = -1;
    
    for (let j = 0; j < ads.length; j++) {
      if (usedIndices.has(j)) continue;
      
      random -= (ads[j].weight || 0);
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }
    
    // 如果没有选中，随机选一个未使用的
    if (selectedIndex === -1) {
      for (let j = 0; j < ads.length; j++) {
        if (!usedIndices.has(j)) {
          selectedIndex = j;
          break;
        }
      }
    }
    
    if (selectedIndex !== -1) {
      selectedAds.push(ads[selectedIndex]);
      usedIndices.add(selectedIndex);
    }
  }
  
  return selectedAds;
};

/**
 * 打乱数组顺序（洗牌算法）
 * @param {Array} array - 数组
 * @returns {Array} 打乱后的数组
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 根据更换频率和周期获取广告列表
 * @param {Array} ads - 广告列表
 * @param {Object} positionConfig - 位置配置（更换频率、周期等）
 * @param {number} maxAds - 最大广告数量
 * @returns {Array} 最终展示的广告列表
 */
exports.getAdsByChangeFrequency = (ads, positionConfig, maxAds) => {
  const { interval_type, interval_value } = positionConfig;
  
  // 如果没有设置更换频率，默认每小时更换
  if (!interval_type) {
    return exports.selectAdsByWeightRatio(ads, maxAds);
  }
  
  // 根据更换频率和周期计算实际应该选择的广告数量
  let actualCount = maxAds;
  
  switch (interval_type) {
    case 'hour':
      // 每小时更换，周期内只展示一次
      actualCount = Math.min(maxAds, ads.length);
      break;
    case 'day':
      // 每天更换，周期内只展示一次
      actualCount = Math.min(maxAds, ads.length);
      break;
    default:
      actualCount = Math.min(maxAds, ads.length);
  }
  
  // 使用权重比例选择广告
  return exports.selectAdsByWeightRatio(ads, actualCount);
};

/**
 * 生成广告展示列表
 * @param {Array} platformAds - 平台广告列表
 * @param {Array} advertiserAds - 广告主广告列表
 * @param {Object} userConditions - 用户条件
 * @param {string} position - 广告位置
 * @param {Object} positionConfig - 位置配置（更换频率、周期、最大数量等）
 * @returns {Array} 最终展示的广告列表
 */
exports.generateAdList = (platformAds, advertiserAds, userConditions, position, positionConfig = {}) => {
  const maxAds = positionConfig.max_ads || 5;
  
  // 1. 筛选符合条件的广告
  const filteredPlatformAds = exports.filterAdsByConditions(platformAds, userConditions, position);
  const filteredAdvertiserAds = exports.filterAdsByConditions(advertiserAds, userConditions, position);
  
  // 2. 合并广告列表
  const allAds = [...filteredPlatformAds, ...filteredAdvertiserAds];
  
  // 3. 按权重排序
  const sortedAds = exports.sortAdsByWeight(allAds);
  
  // 4. 根据权重比例和更换频率选择广告
  return exports.getAdsByChangeFrequency(sortedAds, positionConfig, maxAds);
};