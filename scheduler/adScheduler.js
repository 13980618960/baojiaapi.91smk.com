const cron = require('node-cron');
const adBilling = require('../utils/adBilling');

let AdvertiserAd = null;
let UserReward = null;
let AdFund = null;
let AdFundRecord = null;
let AdPricingRule = null;

exports.initialize = (models) => {
  AdvertiserAd = models.AdvertiserAd;
  UserReward = models.UserReward;
  AdFund = models.AdFund;
  AdFundRecord = models.AdFundRecord;
  AdPricingRule = models.AdPricingRule;
};

exports.startSchedulers = () => {
  exports.dailyResetScheduler();
  exports.rewardExpireScheduler();
  exports.adEndTimeChecker();
  exports.hourlyBillingScheduler();
  console.log('定时任务已启动');
};

exports.dailyResetScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await AdvertiserAd.update({
        daily_show_count: 0,
        daily_click_count: 0,
        daily_cost: 0
      }, { where: { status: 1 } });
      console.log('每日广告统计已重置');
    } catch (error) {
      console.error('每日重置任务失败:', error);
    }
  });
};

exports.rewardExpireScheduler = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const Op = require('sequelize').Op;
      await UserReward.update(
        { status: 0 },
        { 
          where: { 
            status: { [Op.in]: [1, 2] },
            expire_at: { [Op.lt]: new Date() }
          }
        }
      );
    } catch (error) {
      console.error('奖励过期检查任务失败:', error);
    }
  });
};

exports.adEndTimeChecker = () => {
  cron.schedule('5 0 * * *', async () => {
    try {
      const Op = require('sequelize').Op;
      await AdvertiserAd.update(
        { status: 2 },
        { 
          where: { 
            status: 1,
            end_time: { [Op.lt]: new Date() }
          }
        }
      );
    } catch (error) {
      console.error('广告结束时间检查任务失败:', error);
    }
  });
};

exports.hourlyBillingScheduler = async () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const Op = require('sequelize').Op;
      
      const ads = await AdvertiserAd.findAll({
        where: { status: 1 },
        include: [{
          model: AdFund,
          as: 'fundAccount',
          where: { is_active: 1 }
        }]
      });
      
      for (const ad of ads) {
        const pricingRule = await AdPricingRule.findOne({
          where: { 
            ad_type: ad.position, 
            pricing_model: ad.pricing_model,
            is_active: 1 
          }
        });
        
        if (!pricingRule || !ad.fundAccount) continue;
        
        const hourViews = ad.hourly_view_count || 0;
        const hourClicks = ad.hourly_click_count || 0;
        
        if (hourViews === 0 && hourClicks === 0) continue;
        
        const dailyBudgetCheck = adBilling.checkDailyBudget(ad, parseFloat(ad.daily_cost || 0));
        if (dailyBudgetCheck.exceed) {
          await ad.update({ status: 2 });
          continue;
        }
        
        const totalBudgetCheck = adBilling.checkTotalBudget(ad);
        if (totalBudgetCheck.exceed) {
          await ad.update({ status: 2 });
          continue;
        }
        
        let result = null;
        if (pricingRule.pricing_model === 1) {
          result = await adBilling.deductAdCost(
            ad,
            ad.fundAccount,
            pricingRule,
            UserReward,
            AdFundRecord,
            'view',
            hourViews
          );
        } else if (pricingRule.pricing_model === 2 || pricingRule.pricing_model === 4) {
          result = await adBilling.deductAdCost(
            ad,
            ad.fundAccount,
            pricingRule,
            UserReward,
            AdFundRecord,
            'click',
            hourClicks
          );
        }
        
        if (result && !result.success && result.message === '余额不足') {
          await ad.update({ status: 2 });
        }
        
        await ad.update({
          hourly_view_count: 0,
          hourly_click_count: 0
        });
      }
      
      console.log('小时扣费任务完成');
    } catch (error) {
      console.error('小时扣费任务失败:', error);
    }
  });
};

exports.cptDailyBilling = async () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const Op = require('sequelize').Op;
      
      const ads = await AdvertiserAd.findAll({
        where: { 
          status: 1,
          pricing_model: 5
        },
        include: [{
          model: AdFund,
          as: 'fundAccount',
          where: { is_active: 1 }
        }]
      });
      
      for (const ad of ads) {
        const pricingRule = await AdPricingRule.findOne({
          where: { 
            ad_type: ad.position, 
            pricing_model: 5,
            is_active: 1 
          }
        });
        
        if (!pricingRule || !ad.fundAccount) continue;
        
        const result = await adBilling.deductAdCost(
          ad,
          ad.fundAccount,
          pricingRule,
          UserReward,
          AdFundRecord,
          'view',
          1
        );
        
        if (!result.success && result.message === '余额不足') {
          await ad.update({ status: 2 });
        }
      }
      
      console.log('CPT每日扣费任务完成');
    } catch (error) {
      console.error('CPT每日扣费任务失败:', error);
    }
  });
};

exports.startCptScheduler = () => {
  exports.cptDailyBilling();
};