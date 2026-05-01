const { Op } = require('sequelize');

/**
 * 根据用户画像获取推荐内容
 * @param {Object} userProfile - 用户画像
 * @param {Array} rules - 推荐规则列表
 * @param {Array} mappings - 内容映射列表
 * @param {number} limit - 返回数量限制
 * @returns {Array} 推荐内容列表
 */
exports.getRecommendations = (userProfile, rules, mappings, limit = 10) => {
  if (!userProfile || !mappings || mappings.length === 0) {
    return [];
  }

  let filteredMappings = [...mappings];

  if (rules && rules.length > 0) {
    const activeRules = rules.filter(r => r.is_active === 1);
    if (activeRules.length > 0) {
      const activeRuleIds = activeRules.map(r => r.rule_id);
      filteredMappings = filteredMappings.filter(m => 
        m.is_active === 1 && activeRuleIds.includes(m.rule_id)
      );
    }
  }

  const scoredMappings = filteredMappings.map(mapping => {
    const score = calculateMatchScore(userProfile, mapping);
    return {
      ...mapping,
      match_score: score
    };
  });

  scoredMappings.sort((a, b) => {
    if (b.match_score !== a.match_score) {
      return b.match_score - a.match_score;
    }
    return (b.weight || 0) - (a.weight || 0);
  });

  return scoredMappings.slice(0, limit);
};

/**
 * 计算用户画像与内容映射的匹配分数
 * @param {Object} userProfile - 用户画像
 * @param {Object} mapping - 内容映射
 * @returns {number} 匹配分数 (0-100)
 */
function calculateMatchScore(userProfile, mapping) {
  let score = 0;
  let maxScore = 0;

  if (userProfile.user_type !== undefined && mapping.target_user_type !== undefined) {
    maxScore += 25;
    if (mapping.target_user_type === 0 || mapping.target_user_type === userProfile.user_type) {
      score += 25;
    }
  }

  if (userProfile.quoter_vip_level !== undefined && mapping.target_quoter_vip) {
    maxScore += 20;
    const targetVips = parseJsonOrSplit(mapping.target_quoter_vip);
    if (targetVips.length === 0 || targetVips.includes(String(userProfile.quoter_vip_level))) {
      score += 20;
    }
  }

  if (userProfile.demander_vip_level !== undefined && mapping.target_demander_vip) {
    maxScore += 20;
    const targetVips = parseJsonOrSplit(mapping.target_demander_vip);
    if (targetVips.length === 0 || targetVips.includes(String(userProfile.demander_vip_level))) {
      score += 20;
    }
  }

  if (userProfile.interest_categories && mapping.target_categories) {
    maxScore += 35;
    try {
      const userCategories = JSON.parse(userProfile.interest_categories);
      const targetCategories = parseJsonOrSplit(mapping.target_categories);
      
      if (Array.isArray(userCategories) && targetCategories.length > 0) {
        const matchedCategories = userCategories.filter(cat => 
          targetCategories.includes(String(cat))
        );
        const matchRatio = matchedCategories.length / targetCategories.length;
        score += Math.min(matchRatio * 35, 35);
      } else if (targetCategories.length === 0) {
        score += 35;
      }
    } catch (e) {
      if (!mapping.target_categories) {
        score += 35;
      }
    }
  } else if (!mapping.target_categories) {
    maxScore += 35;
    score += 35;
  }

  if (userProfile.tags && mapping.target_user_tags) {
    maxScore += 20;
    try {
      const userTags = JSON.parse(userProfile.tags);
      const targetTags = parseJsonOrSplit(mapping.target_user_tags);
      
      if (Array.isArray(userTags) && targetTags.length > 0) {
        const matchedTags = userTags.filter(tag => 
          targetTags.includes(String(tag))
        );
        const matchRatio = matchedTags.length / Math.max(targetTags.length, 1);
        score += Math.min(matchRatio * 20, 20);
      } else if (targetTags.length === 0) {
        score += 20;
      }
    } catch (e) {
      if (!mapping.target_user_tags) {
        score += 20;
      }
    }
  } else if (!mapping.target_user_tags) {
    maxScore += 20;
    score += 20;
  }

  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/**
 * 解析JSON或逗号分隔的字符串
 * @param {string|Array} value - 输入值
 * @returns {Array} 解析后的数组
 */
function parseJsonOrSplit(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v));
  
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(v => String(v)) : [];
  } catch (e) {
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(v => v);
    }
    return [];
  }
}

/**
 * 根据报价方画像推荐需求
 * @param {Object} quoterProfile - 报价方画像
 * @param {Array} demands - 需求列表
 * @param {number} limit - 返回数量限制
 * @returns {Array} 推荐需求列表
 */
exports.recommendDemandsForQuoter = (quoterProfile, demands, limit = 10) => {
  if (!quoterProfile || !demands || demands.length === 0) {
    return [];
  }

  const scoredDemands = demands.map(demand => {
    const score = calculateQuoterDemandScore(quoterProfile, demand);
    return {
      ...demand,
      match_score: score
    };
  });

  scoredDemands.sort((a, b) => b.match_score - a.match_score);

  return scoredDemands.slice(0, limit);
};

/**
 * 计算报价方与需求的匹配分数
 * @param {Object} quoterProfile - 报价方画像
 * @param {Object} demand - 需求
 * @returns {number} 匹配分数 (0-100)
 */
function calculateQuoterDemandScore(quoterProfile, demand) {
  let score = 0;

  if (quoterProfile.quote_categories && demand.category_id) {
    try {
      const quoteCategories = JSON.parse(quoterProfile.quote_categories);
      const categoryId = String(demand.category_id);
      
      if (quoteCategories[categoryId]) {
        const totalQuotes = Object.values(quoteCategories).reduce((sum, cnt) => sum + cnt, 0);
        const categoryRatio = quoteCategories[categoryId] / Math.max(totalQuotes, 1);
        score += categoryRatio * 40;
      }
    } catch (e) {
    }
  }

  if (quoterProfile.interest_categories && demand.category_id) {
    try {
      const interestCategories = JSON.parse(quoterProfile.interest_categories);
      if (Array.isArray(interestCategories) && interestCategories.includes(String(demand.category_id))) {
        score += 25;
      }
    } catch (e) {
    }
  }

  if (quoterProfile.quoter_vip_level !== undefined && demand.min_quoter_vip) {
    if (quoterProfile.quoter_vip_level >= demand.min_quoter_vip) {
      score += 20;
    } else {
      score -= 10;
    }
  }

  if (quoterProfile.quote_success_rate !== undefined) {
    score += Math.min(quoterProfile.quote_success_rate * 15, 15);
  }

  if (quoterProfile.location && demand.location) {
    if (demand.location.includes(quoterProfile.location) || quoterProfile.location.includes(demand.location)) {
      score += 10;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 根据用户类型获取推荐内容
 * @param {number} userType - 用户类型 (0-普通 1-需求方 2-报价方)
 * @param {Object} userProfile - 用户画像
 * @param {Array} rules - 推荐规则列表
 * @param {Array} mappings - 内容映射列表
 * @param {number} limit - 返回数量限制
 * @returns {Array} 推荐内容列表
 */
exports.getRecommendationsByUserType = (userType, userProfile, rules, mappings, limit = 10) => {
  const filteredRules = rules ? rules.filter(r => {
    if (!r.is_active) return false;
    if (!r.conditions) return true;
    
    try {
      const conditions = JSON.parse(r.conditions);
      if (conditions.target_user_type !== undefined && conditions.target_user_type !== 0) {
        return conditions.target_user_type === userType;
      }
      return true;
    } catch (e) {
      return true;
    }
  }) : [];

  return exports.getRecommendations(userProfile, filteredRules, mappings, limit);
};

/**
 * 获取热门推荐（无用户画像时使用）
 * @param {Array} mappings - 内容映射列表
 * @param {number} limit - 返回数量限制
 * @returns {Array} 热门内容列表
 */
exports.getHotRecommendations = (mappings, limit = 10) => {
  if (!mappings || mappings.length === 0) {
    return [];
  }

  const activeMappings = mappings.filter(m => m.is_active === 1);
  
  activeMappings.sort((a, b) => {
    if ((b.weight || 0) !== (a.weight || 0)) {
      return (b.weight || 0) - (a.weight || 0);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return activeMappings.slice(0, limit);
};