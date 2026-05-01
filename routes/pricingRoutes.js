const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../middleware/auth');

const ValueAddedService = require('../models/ValueAddedService');
const CategoryServicePrice = require('../models/CategoryServicePrice');
const DemandServiceOrder = require('../models/DemandServiceOrder');
const InvitationRule = require('../models/InvitationRule');
const UserInvitation = require('../models/UserInvitation');
const UserReward = require('../models/UserReward');
const AdPricingRule = require('../models/AdPricingRule');
const AdFund = require('../models/AdFund');
const AdFundRecord = require('../models/AdFundRecord');
const AdPosition = require('../models/AdPosition');

// ==================== 骞冲彴骞垮憡鏀惰垂瑙勫垯 ====================

router.get('/ad-pricing', adminAuthMiddleware, async (req, res) => {
  try {
    const rules = await AdPricingRule.findAll({ where: { is_active: 1 }, order: [['ad_type', 'ASC']] });
    res.success(rules);
  } catch (error) {
    res.error(error.message);
  }
});

router.post('/ad-pricing', adminAuthMiddleware, async (req, res) => {
  try {
    const rule = await AdPricingRule.create(req.body);
    res.success(rule);
  } catch (error) {
    res.error(error.message);
  }
});

router.put('/ad-pricing/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await AdPricingRule.update(req.body, { where: { rule_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

router.delete('/ad-pricing/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await AdPricingRule.update({ is_active: 0 }, { where: { rule_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

router.get('/ad-pricing/all', adminAuthMiddleware, async (req, res) => {
  try {
    const rules = await AdPricingRule.findAll({ order: [['ad_type', 'ASC']] });
    res.success(rules);
  } catch (error) {
    res.error(error.message);
  }
});

// 鑾峰彇骞垮憡璁¤垂瑙勫垯鍒楄〃锛堢敤浜庨€夋嫨锛?
router.get('/ad-pricing/list', adminAuthMiddleware, async (req, res) => {
  try {
    const { ad_type } = req.query;
    const where = { is_active: 1 };
    if (ad_type) {
      where.ad_type = parseInt(ad_type);
    }
    const rules = await AdPricingRule.findAll({ 
      where,
      order: [['ad_type', 'ASC'], ['rule_id', 'DESC']] 
    });
    // 杞崲涓虹函JSON鏁扮粍杩斿洖
    const result = rules.map(rule => rule.toJSON ? rule.toJSON() : rule);
    res.success(result);
  } catch (error) {
    res.error(error.message);
  }
});

// ==================== 资金账户管理 ====================

router.get('/funds', adminAuthMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const PlatformAd = require('../models/PlatformAd');
    const funds = await AdFund.findAll({ 
      where: { is_active: 1 }, 
      order: [['fund_id', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'nickname', 'real_name', 'phone']
        }
      ]
    });
    
    const platformTotalIncome = funds.reduce((sum, fund) => sum + parseFloat(fund.total_income || 0), 0);
    const totalRecharge = funds.reduce((sum, fund) => sum + parseFloat(fund.total_income || 0), 0);
    const totalRemaining = funds.reduce((sum, fund) => sum + parseFloat(fund.balance || 0), 0);
    
    res.success({
      list: funds,
      platformTotalIncome,
      totalRecharge,
      totalRemaining
    });
  } catch (error) {
    res.error(error.message);
  }
});

// 鑾峰彇鐢ㄦ埛鍒楄〃锛堢敤浜庨€夋嫨锛?
router.get('/users/list', adminAuthMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.findAll({
      attributes: ['user_id', 'nickname', 'real_name', 'phone'],
      order: [['created_at', 'DESC']]
    });
    res.success(users);
  } catch (error) {
    res.error(error.message);
  }
});

// 鑾峰彇骞冲彴骞垮憡鍒楄〃锛堢敤浜庨€夋嫨锛?
router.get('/platform-ads/list', adminAuthMiddleware, async (req, res) => {
  try {
    const PlatformAd = require('../models/PlatformAd');
    const ads = await PlatformAd.findAll({
      attributes: ['ad_id', 'title', 'position', 'status'],
      where: { status: 1 },
      order: [['sort', 'ASC'], ['ad_id', 'DESC']]
    });
    res.success(ads);
  } catch (error) {
    res.error(error.message);
  }
});

router.post('/funds', adminAuthMiddleware, async (req, res) => {
  try {
    const fund = await AdFund.create(req.body);
    res.success(fund);
  } catch (error) {
    res.error(error.message);
  }
});

router.put('/funds/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await AdFund.update(req.body, { where: { fund_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

router.delete('/funds/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await AdFund.update({ is_active: 0 }, { where: { fund_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

router.get('/funds/all', adminAuthMiddleware, async (req, res) => {
  try {
    const funds = await AdFund.findAll({ order: [['fund_id', 'ASC']] });
    res.success(funds);
  } catch (error) {
    res.error(error.message);
  }
});

// ==================== 资金流水记录 ====================

// 获取资金流水列表
router.get('/fund-records/:fundId', adminAuthMiddleware, async (req, res) => {
  try {
    const { fundId } = req.params;
    const records = await AdFundRecord.findAll({ 
      where: { fund_id: fundId },
      order: [['created_at', 'DESC']] 
    });
    res.success(records);
  } catch (error) {
    res.error(error.message);
  }
});

// 鍏呭€?
router.post('/funds/recharge', adminAuthMiddleware, async (req, res) => {
  try {
    const { fundId, amount, description } = req.body;
    const admin = req.admin || { admin_id: 0, username: 'system' };
    
    // 获取账户
    const fund = await AdFund.findByPk(fundId);
    if (!fund) {
      return res.error('资金账户不存在');
    }
    
    const beforeBalance = parseFloat(fund.balance);
    const afterBalance = beforeBalance + parseFloat(amount);
    
    // 鍒涘缓娴佹按璁板綍
    await AdFundRecord.create({
      fund_id: fundId,
      user_id: fund.user_id,
      type: 1,
      amount: parseFloat(amount),
      before_balance: beforeBalance,
      after_balance: afterBalance,
      description: description || '后台充值',
      operator_id: admin.admin_id,
      operator_name: admin.username
    });
    
    // 更新账户余额
    await AdFund.update({
      balance: afterBalance,
      total_income: parseFloat(fund.total_income) + parseFloat(amount)
    }, { where: { fund_id: fundId } });
    
    res.success('充值成功');
  } catch (error) {
    res.error(error.message);
  }
});

// 后台调整余额
router.post('/funds/adjust', adminAuthMiddleware, async (req, res) => {
  try {
    const { fundId, amount, description } = req.body;
    const admin = req.admin || { admin_id: 0, username: 'system' };
    
    // 获取账户
    const fund = await AdFund.findByPk(fundId);
    if (!fund) {
      return res.error('资金账户不存在');
    }
    
    const beforeBalance = parseFloat(fund.balance);
    const afterBalance = beforeBalance + parseFloat(amount);
    
    // 鍒涘缓娴佹按璁板綍
    await AdFundRecord.create({
      fund_id: fundId,
      user_id: fund.user_id,
      type: 4,
      amount: parseFloat(amount),
      before_balance: beforeBalance,
      after_balance: afterBalance,
      description: description || '后台调整',
      operator_id: admin.admin_id,
      operator_name: admin.username
    });
    
    // 更新账户余额
    await AdFund.update({
      balance: afterBalance
    }, { where: { fund_id: fundId } });
    
    res.success('璋冩暣鎴愬姛');
  } catch (error) {
    res.error(error.message);
  }
});

// ==================== 澧炲€兼湇鍔＄鐞?====================

router.get('/services', adminAuthMiddleware, async (req, res) => {
  try {
    const services = await ValueAddedService.findAll({ where: { is_active: 1 }, order: [['sort_order', 'ASC']] });
    res.success(services);
  } catch (error) {
    res.error(error.message);
  }
});

router.post('/services', adminAuthMiddleware, async (req, res) => {
  try {
    const service = await ValueAddedService.create(req.body);
    res.success(service);
  } catch (error) {
    res.error(error.message);
  }
});

router.put('/services/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await ValueAddedService.update(req.body, { where: { service_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

router.delete('/services/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await ValueAddedService.update({ is_active: 0 }, { where: { service_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

router.get('/category-prices', adminAuthMiddleware, async (req, res) => {
  try {
    const prices = await CategoryServicePrice.findAll({ order: [['category_id', 'ASC']] });
    res.success(prices);
  } catch (error) {
    res.error(error.message);
  }
});

router.post('/category-prices', adminAuthMiddleware, async (req, res) => {
  try {
    const price = await CategoryServicePrice.create(req.body);
    res.success(price);
  } catch (error) {
    res.error(error.message);
  }
});

router.put('/category-prices/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await CategoryServicePrice.update(req.body, { where: { price_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

router.delete('/category-prices/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await CategoryServicePrice.destroy({ where: { price_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

// ==================== 骞垮憡浣嶇疆鍒楄〃 ====================

// 鍏佽鐨勫箍鍛婁綅缃爣璇嗭紙涓庢暟鎹簱 ad_positions 琛ㄥ榻愶級
const ALLOWED_POSITIONS = [
  'splash_ad',
  'banner_ad',
  'advertiser_demand_card',
  'demand_hall_banner',
  'profile_ad'
];

router.get('/ad-positions/list', adminAuthMiddleware, async (req, res) => {
  try {
    const positions = await AdPosition.findAll({
      where: { 
        status: 1,
        position_code: ALLOWED_POSITIONS
      },
      order: [['position_id', 'ASC']]
    });
    res.success(positions);
  } catch (error) {
    res.error(error.message);
  }
});

// 灏忕▼搴忕鑾峰彇骞垮憡浣嶇疆鍒楄〃
router.get('/ad-positions/miniprogram', async (req, res) => {
  try {
    const positions = await AdPosition.findAll({
      where: { 
        status: 1,
        position_code: ALLOWED_POSITIONS
      },
      order: [['position_id', 'ASC']]
    });
    res.success(positions);
  } catch (error) {
    res.error(error.message);
  }
});

// ==================== 閭€璇峰鍔辫鍒?====================

router.get('/invitation-rules', adminAuthMiddleware, async (req, res) => {
  try {
    const { rule_mode } = req.query;
    const where = { is_active: 1 };
    if (rule_mode) {
      where.rule_mode = parseInt(rule_mode);
    }
    const rules = await InvitationRule.findAll({ 
      where,
      order: [['sort_order', 'ASC'], ['required_invites', 'ASC']],
      include: [{ model: AdPosition, as: 'positionInfo' }]
    });
    res.success(rules);
  } catch (error) {
    res.error(error.message);
  }
});

router.get('/invitation-rules/all', adminAuthMiddleware, async (req, res) => {
  try {
    const { rule_mode } = req.query;
    const where = {};
    if (rule_mode) {
      where.rule_mode = parseInt(rule_mode);
    }
    const rules = await InvitationRule.findAll({ 
      where,
      order: [['sort_order', 'ASC'], ['required_invites', 'ASC']],
      include: [{ model: AdPosition, as: 'positionInfo' }]
    });
    res.success(rules);
  } catch (error) {
    res.error(error.message);
  }
});

router.post('/invitation-rules', adminAuthMiddleware, async (req, res) => {
  try {
    const rule = await InvitationRule.create(req.body);
    res.success(rule);
  } catch (error) {
    res.error(error.message);
  }
});

router.put('/invitation-rules/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await InvitationRule.update(req.body, { where: { rule_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

router.delete('/invitation-rules/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await InvitationRule.update({ is_active: 0 }, { where: { rule_id: req.params.id } });
    res.success();
  } catch (error) {
    res.error(error.message);
  }
});

// ==================== 灏忕▼搴忕鎺ュ彛 ====================

// 灏忕▼搴忕鑾峰彇閭€璇峰鍔辫鍒欙紙妯″紡2锛氬厛鍒嗕韩鍚庡垱寤猴級
router.get('/invitation-rules/miniprogram', async (req, res) => {
  try {
    const { userId } = req.query;
    const where = { is_active: 1, show_on_miniprogram: 1, rule_mode: 2 };
    const rules = await InvitationRule.findAll({ 
      where,
      order: [['sort_order', 'ASC'], ['required_invites', 'ASC']],
      include: [{ model: AdPosition, as: 'positionInfo' }]
    });
    
    // 杩囨护浠呭彲瑙佺敤鎴?
    const filteredRules = rules.filter(rule => {
      if (!rule.visible_user_ids || rule.visible_user_ids === '') {
        return true;
      }
      try {
        const visibleIds = JSON.parse(rule.visible_user_ids);
        return userId && visibleIds.includes(parseInt(userId));
      } catch {
        return true;
      }
    });
    
    res.success(filteredRules);
  } catch (error) {
    res.error(error.message);
  }
});

// 妫€鏌ュ箍鍛婂搴旂殑閭€璇峰鍔辫鍒欙紙妯″紡1锛氬凡鏈夊箍鍛婂紩瀵煎垎浜級
router.get('/invitation-rules/check-ad/:adId', async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await AdvertiserAd.findOne({ where: { ad_id: adId } });
    if (!ad) {
      return res.success(null);
    }
    
    // 鏌ヨ鍖归厤鐨勮鍒?
    const rules = await InvitationRule.findAll({ 
      where: { 
        is_active: 1, 
        rule_mode: 1,
        position_id: ad.position_id,
        pricing_model: ad.pricing_model
      },
      order: [['sort_order', 'ASC'], ['required_invites', 'ASC']],
      include: [{ model: AdPosition, as: 'positionInfo' }]
    });
    
    res.success(rules.length > 0 ? rules[0] : null);
  } catch (error) {
    res.error(error.message);
  }
});

// 鑾峰彇鐢ㄦ埛閭€璇疯繘搴?
router.get('/invitation-progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const invitations = await UserInvitation.findAll({ 
      where: { inviter_id: userId, status: 1 } 
    });
    const inviteCount = invitations.length;
    
    // 鑾峰彇鎵€鏈夎鍒欙紙妯″紡2锛?
    const rules = await InvitationRule.findAll({ 
      where: { is_active: 1, rule_mode: 2 },
      order: [['sort_order', 'ASC'], ['required_invites', 'ASC']],
      include: [{ model: AdPosition, as: 'positionInfo' }]
    });
    
    // 鑾峰彇鐢ㄦ埛宸茶幏寰楃殑濂栧姳
    const rewards = await UserReward.findAll({ 
      where: { user_id: userId },
      include: [
        { model: AdPosition, as: 'positionInfo' },
        { model: AdvertiserAd, as: 'adInfo' }
      ]
    });
    
    res.success({
      inviteCount,
      rules,
      rewards
    });
  } catch (error) {
    res.error(error.message);
  }
});

router.get('/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const orders = await DemandServiceOrder.findAll({ order: [['created_at', 'DESC']] });
    res.success(orders);
  } catch (error) {
    res.error(error.message);
  }
});

router.get('/user-rewards', adminAuthMiddleware, async (req, res) => {
  try {
    const rewards = await UserReward.findAll({ where: { status: 1 }, order: [['created_at', 'DESC']] });
    res.success(rewards);
  } catch (error) {
    res.error(error.message);
  }
});

router.get('/services/all', adminAuthMiddleware, async (req, res) => {
  try {
    const services = await ValueAddedService.findAll({ order: [['sort_order', 'ASC']] });
    res.success(services);
  } catch (error) {
    res.error(error.message);
  }
});

module.exports = router;



