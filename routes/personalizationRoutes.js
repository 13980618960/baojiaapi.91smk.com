const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const RecommendationRule = require('../models/RecommendationRule');
const ContentMapping = require('../models/ContentMapping');
const recommendationAlgorithm = require('../utils/recommendationAlgorithm');
const { Op } = require('sequelize');

router.get('/profiles', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, user_id, user_type } = req.query;
    
    const where = {};
    if (user_id) {
      where.user_id = parseInt(user_id);
    }
    if (user_type) {
      where.user_type = parseInt(user_type);
    }

    const result = await UserProfile.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    res.success({
      list: result.rows,
      total: result.count
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/profiles/:id', async (req, res) => {
  try {
    const profile = await UserProfile.findByPk(req.params.id);
    if (!profile) {
      return res.error('Profile not found', 404);
    }
    res.success(profile);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/profiles', async (req, res) => {
  try {
    const { user_id, tags, interest_categories, user_type, demander_vip_level, quoter_vip_level, location, age_range, gender, behavior_score } = req.body;
    
    const profile = await UserProfile.create({
      user_id,
      tags: typeof tags === 'object' ? JSON.stringify(tags) : tags,
      interest_categories: typeof interest_categories === 'object' ? JSON.stringify(interest_categories) : interest_categories,
      user_type,
      demander_vip_level,
      quoter_vip_level,
      location,
      age_range,
      gender,
      behavior_score
    });

    res.success(profile, 'Profile created');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.put('/profiles/:id', async (req, res) => {
  try {
    const { tags, interest_categories, user_type, demander_vip_level, quoter_vip_level, location, age_range, gender, behavior_score } = req.body;
    
    const profile = await UserProfile.findByPk(req.params.id);
    if (!profile) {
      return res.error('Profile not found', 404);
    }

    await profile.update({
      tags: typeof tags === 'object' ? JSON.stringify(tags) : tags,
      interest_categories: typeof interest_categories === 'object' ? JSON.stringify(interest_categories) : interest_categories,
      user_type,
      demander_vip_level,
      quoter_vip_level,
      location,
      age_range,
      gender,
      behavior_score
    });

    res.success(profile, 'Profile updated');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.delete('/profiles/:id', async (req, res) => {
  try {
    const profile = await UserProfile.findByPk(req.params.id);
    if (!profile) {
      return res.error('Profile not found', 404);
    }

    await profile.destroy();
    res.success(null, 'Profile deleted');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/rules', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, rule_type, is_active } = req.query;
    
    const where = {};
    if (rule_type) {
      where.rule_type = parseInt(rule_type);
    }
    if (is_active !== undefined) {
      where.is_active = parseInt(is_active);
    }

    const result = await RecommendationRule.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['priority', 'ASC']]
    });

    res.success({
      list: result.rows,
      total: result.count
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/rules/:id', async (req, res) => {
  try {
    const rule = await RecommendationRule.findByPk(req.params.id);
    if (!rule) {
      return res.error('Rule not found', 404);
    }
    res.success(rule);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/rules', async (req, res) => {
  try {
    const { rule_name, rule_type, conditions, priority, is_active, start_time, end_time, description } = req.body;
    
    const rule = await RecommendationRule.create({
      rule_name,
      rule_type,
      conditions: typeof conditions === 'object' ? JSON.stringify(conditions) : conditions,
      priority,
      is_active,
      start_time,
      end_time,
      description
    });

    res.success(rule, 'Rule created');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.put('/rules/:id', async (req, res) => {
  try {
    const { rule_name, rule_type, conditions, priority, is_active, start_time, end_time, description } = req.body;
    
    const rule = await RecommendationRule.findByPk(req.params.id);
    if (!rule) {
      return res.error('Rule not found', 404);
    }

    await rule.update({
      rule_name,
      rule_type,
      conditions: typeof conditions === 'object' ? JSON.stringify(conditions) : conditions,
      priority,
      is_active,
      start_time,
      end_time,
      description
    });

    res.success(rule, 'Rule updated');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.delete('/rules/:id', async (req, res) => {
  try {
    const rule = await RecommendationRule.findByPk(req.params.id);
    if (!rule) {
      return res.error('Rule not found', 404);
    }

    await rule.destroy();
    res.success(null, 'Rule deleted');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/mappings', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, rule_id, content_type, is_active } = req.query;
    
    const where = {};
    if (rule_id) {
      where.rule_id = parseInt(rule_id);
    }
    if (content_type) {
      where.content_type = parseInt(content_type);
    }
    if (is_active !== undefined) {
      where.is_active = parseInt(is_active);
    }

    const result = await ContentMapping.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['weight', 'DESC']]
    });

    res.success({
      list: result.rows,
      total: result.count
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/mappings/:id', async (req, res) => {
  try {
    const mapping = await ContentMapping.findByPk(req.params.id);
    if (!mapping) {
      return res.error('Mapping not found', 404);
    }
    res.success(mapping);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/mappings', async (req, res) => {
  try {
    const { rule_id, content_type, content_id, target_user_tags, target_user_type, target_demander_vip, target_quoter_vip, target_categories, weight, is_active } = req.body;
    
    const mapping = await ContentMapping.create({
      rule_id,
      content_type,
      content_id,
      target_user_tags: typeof target_user_tags === 'object' ? JSON.stringify(target_user_tags) : target_user_tags,
      target_user_type,
      target_demander_vip,
      target_quoter_vip,
      target_categories: typeof target_categories === 'object' ? JSON.stringify(target_categories) : target_categories,
      weight,
      is_active
    });

    res.success(mapping, 'Mapping created');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.put('/mappings/:id', async (req, res) => {
  try {
    const { rule_id, content_type, content_id, target_user_tags, target_user_type, target_demander_vip, target_quoter_vip, target_categories, weight, is_active } = req.body;
    
    const mapping = await ContentMapping.findByPk(req.params.id);
    if (!mapping) {
      return res.error('Mapping not found', 404);
    }

    await mapping.update({
      rule_id,
      content_type,
      content_id,
      target_user_tags: typeof target_user_tags === 'object' ? JSON.stringify(target_user_tags) : target_user_tags,
      target_user_type,
      target_demander_vip,
      target_quoter_vip,
      target_categories: typeof target_categories === 'object' ? JSON.stringify(target_categories) : target_categories,
      weight,
      is_active
    });

    res.success(mapping, 'Mapping updated');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.delete('/mappings/:id', async (req, res) => {
  try {
    const mapping = await ContentMapping.findByPk(req.params.id);
    if (!mapping) {
      return res.error('Mapping not found', 404);
    }

    await mapping.destroy();
    res.success(null, 'Mapping deleted');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/recommend', async (req, res) => {
  try {
    const { user_id, user_type, limit = 10 } = req.query;

    let userProfile = null;
    if (user_id) {
      userProfile = await UserProfile.findOne({
        where: { user_id: parseInt(user_id) }
      });
    }

    const rules = await RecommendationRule.findAll({
      where: { is_active: 1 }
    });

    const mappings = await ContentMapping.findAll({
      where: { is_active: 1 }
    });

    let recommendations;
    if (userProfile) {
      recommendations = recommendationAlgorithm.getRecommendationsByUserType(
        parseInt(user_type) || userProfile.user_type,
        userProfile,
        rules,
        mappings,
        parseInt(limit)
      );
    } else {
      recommendations = recommendationAlgorithm.getHotRecommendations(mappings, parseInt(limit));
    }

    res.success(recommendations);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/recommend/quoter', async (req, res) => {
  try {
    const { user_id, limit = 10 } = req.query;

    if (!user_id) {
      return res.error('user_id is required', 400);
    }

    const userProfile = await UserProfile.findOne({
      where: { user_id: parseInt(user_id) }
    });

    if (!userProfile || userProfile.user_type !== 2) {
      return res.error('Quoter profile not found', 404);
    }

    const mockDemands = [
      { demand_id: 1, category_id: 1, title: '网站开发需求', location: '北京', min_quoter_vip: 0 },
      { demand_id: 2, category_id: 2, title: 'APP开发需求', location: '上海', min_quoter_vip: 1 },
      { demand_id: 3, category_id: 1, title: '小程序开发', location: '深圳', min_quoter_vip: 0 },
      { demand_id: 4, category_id: 3, title: 'UI设计需求', location: '广州', min_quoter_vip: 0 },
      { demand_id: 5, category_id: 2, title: '移动端开发', location: '杭州', min_quoter_vip: 1 },
      { demand_id: 6, category_id: 1, title: '后端开发', location: '成都', min_quoter_vip: 0 },
      { demand_id: 7, category_id: 4, title: '数据分析需求', location: '北京', min_quoter_vip: 2 },
      { demand_id: 8, category_id: 2, title: 'IOS开发', location: '上海', min_quoter_vip: 1 }
    ];

    const recommendations = recommendationAlgorithm.recommendDemandsForQuoter(
      userProfile,
      mockDemands,
      parseInt(limit)
    );

    res.success(recommendations);
  } catch (error) {
    res.error(error.message, 500);
  }
});

module.exports = router;