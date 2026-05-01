const BILLING_MODE = {
  CPM: 1,
  CPC: 2,
  CPA: 3,
  OCPC: 4,
  CPT: 5
};

const BILLING_MODE_NAMES = {
  1: 'CPM',
  2: 'CPC',
  3: 'CPA',
  4: 'OCPC',
  5: 'CPT'
};

const RECORD_TYPE = {
  RECHARGE: 1,
  CONSUMPTION: 2,
  REFUND: 3,
  ADJUSTMENT: 4
};

exports.BILLING_MODE = BILLING_MODE;
exports.BILLING_MODE_NAMES = BILLING_MODE_NAMES;
exports.RECORD_TYPE = RECORD_TYPE;

exports.isPeakHour = () => {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 8 && hours < 20;
};

exports.getPeakMultiplier = (pricingRule) => {
  if (!pricingRule || !pricingRule.peak_hour_multiplier) {
    return 1;
  }
  if (!pricingRule.peak_time_slots) {
    return exports.isPeakHour() ? parseFloat(pricingRule.peak_hour_multiplier) : 1;
  }
  
  try {
    const peakSlots = JSON.parse(pricingRule.peak_time_slots);
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    for (const slot of peakSlots) {
      if (slot.start && slot.end && currentTime >= slot.start && currentTime < slot.end) {
        return parseFloat(slot.multiplier || pricingRule.peak_hour_multiplier || 1);
      }
    }
  } catch (e) {
    console.error('解析高峰时段配置失败:', e);
  }
  
  return 1;
};

exports.calculateCost = (ad, pricingRule, eventType, count = 1) => {
  if (!pricingRule) return 0;
  
  let cost = 0;
  const { pricing_model, base_price } = pricingRule;
  const multiplier = exports.getPeakMultiplier(pricingRule);
  
  switch (parseInt(pricing_model)) {
    case BILLING_MODE.CPM:
      cost = (parseFloat(base_price) / 1000) * count * multiplier;
      break;
    case BILLING_MODE.CPC:
      cost = parseFloat(base_price) * count * multiplier;
      break;
    case BILLING_MODE.CPA:
      cost = parseFloat(base_price) * count * multiplier;
      break;
    case BILLING_MODE.OCPC:
      cost = parseFloat(base_price) * count * multiplier;
      break;
    case BILLING_MODE.CPT:
      cost = parseFloat(base_price) * count;
      break;
    default:
      cost = 0;
  }
  
  return Math.round(cost * 100) / 100;
};

exports.getPricingUnitText = (pricingModel) => {
  const units = {
    1: '千次展示',
    2: '次点击',
    3: '次转化',
    4: '次点击',
    5: '天'
  };
  return units[pricingModel] || '';
};

exports.getUserAvailableRewards = async (UserReward, userId, positionId, pricingModel) => {
  const Op = require('sequelize').Op;
  const rewards = await UserReward.findAll({
    where: {
      user_id: userId,
      position_id: positionId,
      pricing_model: pricingModel,
      status: { [Op.in]: [1, 2] },
      expire_at: { [Op.gt]: new Date() }
    },
    order: [['created_at', 'ASC']]
  });
  return rewards;
};

exports.useReward = async (reward, consumeValue) => {
  const remaining = parseFloat(reward.free_value) - parseFloat(reward.used_value);
  const actualUse = Math.min(consumeValue, remaining);
  
  const newUsedValue = parseFloat(reward.used_value) + actualUse;
  const newStatus = newUsedValue >= parseFloat(reward.free_value) ? 3 : 2;
  
  await reward.update({
    used_value: newUsedValue,
    status: newStatus
  });
  
  return actualUse;
};

exports.pausePaidAd = async (ad, reward) => {
  await reward.update({
    status: 2,
    paid_paused_at: new Date(),
    original_end_time: ad.end_time,
    start_time: new Date()
  });
  
  if (reward.free_value && reward.pricing_model === 5) {
    const rewardEndTime = new Date();
    rewardEndTime.setDate(rewardEndTime.getDate() + parseFloat(reward.free_value));
    await ad.update({ end_time: rewardEndTime });
  }
};

exports.resumePaidAd = async (ad, reward) => {
  if (reward.original_end_time) {
    await ad.update({ end_time: reward.original_end_time });
  }
  await reward.update({ status: 3 });
};

exports.deductAdCost = async (
  ad, 
  fund, 
  pricingRule, 
  UserReward, 
  AdFundRecord,
  eventType, 
  count = 1
) => {
  const transaction = await fund.sequelize.transaction();
  try {
    let totalConsumed = 0;
    let remainingCount = count;
    
    const rewards = await exports.getUserAvailableRewards(
      UserReward, 
      ad.user_id, 
      ad.position, 
      ad.pricing_model
    );
    
    for (const reward of rewards) {
      if (remainingCount <= 0) break;
      
      const consumed = await exports.useReward(reward, remainingCount);
      totalConsumed += consumed;
      remainingCount -= consumed;
      
      if (reward.rule_mode === 1 && parseFloat(reward.used_value) >= parseFloat(reward.free_value)) {
        await exports.resumePaidAd(ad, reward);
      }
    }
    
    if (remainingCount > 0) {
      const cost = exports.calculateCost(ad, pricingRule, eventType, remainingCount);
      
      if (parseFloat(fund.balance) < cost) {
        await transaction.rollback();
        return { success: false, message: '余额不足', consumed: totalConsumed };
      }
      
      const beforeBalance = parseFloat(fund.balance);
      const afterBalance = beforeBalance - cost;
      
      await AdFundRecord.create({
        fund_id: fund.fund_id,
        user_id: ad.user_id,
        type: RECORD_TYPE.CONSUMPTION,
        amount: -cost,
        before_balance: beforeBalance,
        after_balance: afterBalance,
        description: `广告扣费: ${ad.title || '广告ID-' + ad.ad_id}`,
        operator_name: '系统自动扣费'
      }, { transaction });
      
      await fund.update({
        balance: afterBalance,
        total_expense: parseFloat(fund.total_expense) + cost
      }, { transaction });
      
      totalConsumed += remainingCount;
    }
    
    const statsField = eventType === 'click' ? 'click_count' : 
                       eventType === 'view' ? 'view_count' : 'view_count';
    
    await ad.update({
      cost: parseFloat(ad.cost || 0) + exports.calculateCost(ad, pricingRule, eventType, totalConsumed),
      [statsField]: parseInt(ad[statsField] || 0) + count
    }, { transaction });
    
    await transaction.commit();
    
    return { success: true, consumed: totalConsumed };
  } catch (error) {
    await transaction.rollback();
    console.error('广告扣费失败:', error);
    return { success: false, message: error.message, consumed: 0 };
  }
};

exports.checkDailyBudget = (ad, dailyConsumed) => {
  if (!ad.daily_budget || parseFloat(ad.daily_budget) <= 0) {
    return { exceed: false, remaining: null };
  }
  
  const budget = parseFloat(ad.daily_budget);
  if (dailyConsumed >= budget) {
    return { exceed: true, remaining: 0 };
  }
  
  return { exceed: false, remaining: budget - dailyConsumed };
};

exports.checkTotalBudget = (ad) => {
  if (!ad.total_budget || parseFloat(ad.total_budget) <= 0) {
    return { exceed: false, remaining: null };
  }
  
  const budget = parseFloat(ad.total_budget);
  const consumed = parseFloat(ad.cost || 0);
  
  if (consumed >= budget) {
    return { exceed: true, remaining: 0 };
  }
  
  return { exceed: false, remaining: budget - consumed };
};