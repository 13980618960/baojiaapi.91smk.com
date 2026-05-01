const express = require('express');
const router = express.Router();
const PlatformAd = require('../models/PlatformAd');
const AdvertiserAd = require('../models/AdvertiserAd');
const AdPosition = require('../models/AdPosition');
const { Op } = require('sequelize');
const adAlgorithm = require('../utils/adAlgorithm');

// 获取平台广告列表（带位置信息）
router.get('/platform-list', async (req, res) => {
  try {
    const { position_id, type } = req.query;
    const now = new Date();

    const where = {
      status: 1,
      start_time: { [Op.lte]: now },
      end_time: { [Op.gte]: now }
    };

    if (position_id) {
      where.position_id = parseInt(position_id);
    }
    if (type !== undefined) {
      where.type = parseInt(type);
    }

    const ads = await PlatformAd.findAll({
      where,
      include: [{
        model: AdPosition,
        as: 'positionInfo',
        attributes: ['position_name', 'type', 'content_interval']
      }],
      order: [['weight', 'DESC'], ['ad_id', 'DESC']]
    });

    res.success(ads);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 获取指定位置的广告（使用新算法）
router.get('/positions/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { province, city, district, category, age, gender } = req.query;
    
    // 构建用户条件
    const userConditions = {
      province: province || '',
      city: city || '',
      district: district || '',
      category: category || '',
      age: age ? parseInt(age) : null,
      gender: gender ? parseInt(gender) : 0
    };

    // 先获取位置信息
    const position = await AdPosition.findOne({ where: { position_code: code, status: 1 } });
    if (!position) {
      return res.success({ ads: [], position: null });
    }

    // 获取该位置的平台广告
    const platformAds = await PlatformAd.findAll({
      where: {
        position_id: position.position_id,
        status: 1
      }
    });

    // 获取该位置的广告主广告
    const advertiserAds = await AdvertiserAd.findAll({
      where: {
        position: code,
        status: 1
      }
    });

    // 使用算法生成广告列表
    const ads = adAlgorithm.generateAdList(
      platformAds,
      advertiserAds,
      userConditions,
      code,
      position.max_ads
    );

    res.success({ 
      ads, 
      position: {
        position_id: position.position_id,
        position_code: position.position_code,
        position_name: position.position_name,
        type: position.type,
        content_interval: position.content_interval,
        max_ads: position.max_ads
      }
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 获取轮播图（使用新算法）
router.get('/banners', async (req, res) => {
  try {
    const { province, city, district, age, gender } = req.query;
    
    // 构建用户条件
    const userConditions = {
      province: province || '',
      city: city || '',
      district: district || '',
      age: age ? parseInt(age) : null,
      gender: gender ? parseInt(gender) : 0
    };

    // 获取轮播图位置
    const bannerPosition = await AdPosition.findOne({ where: { position_code: 'banner_ad', status: 1 } });
    if (!bannerPosition) {
      return res.success([]);
    }

    // 获取轮播图广告
    const platformAds = await PlatformAd.findAll({
      where: {
        position_id: bannerPosition.position_id,
        status: 1
      }
    });

    const advertiserAds = await AdvertiserAd.findAll({
      where: {
        position: 'banner_ad',
        status: 1
      }
    });

    // 使用算法生成广告列表
    const banners = adAlgorithm.generateAdList(
      platformAds,
      advertiserAds,
      userConditions,
      'banner_ad',
      5
    );

    res.success(banners);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 获取信息流广告（使用新算法）
router.get('/feeds', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, user_id, province, city, district, category, age, gender } = req.query;
    
    // 构建用户条件
    const userConditions = {
      province: province || '',
      city: city || '',
      district: district || '',
      category: category || '',
      age: age ? parseInt(age) : null,
      gender: gender ? parseInt(gender) : 0
    };

    // 获取需求卡广告位置
    const feedPosition = await AdPosition.findOne({ where: { position_code: 'demand_hall_feed', status: 1 } });
    if (!feedPosition) {
      return res.success([]);
    }

    // 获取信息流广告
    const platformAds = await PlatformAd.findAll({
      where: {
        position_id: feedPosition.position_id,
        status: 1
      }
    });

    const advertiserAds = await AdvertiserAd.findAll({
      where: {
        position: 'demand_hall_feed',
        status: 1
      }
    });

    // 使用算法生成广告列表
    let ads = adAlgorithm.generateAdList(
      platformAds,
      advertiserAds,
      userConditions,
      'demand_hall_feed',
      pageSize * 2 // 多获取一些广告用于分页
    );

    // 分页
    const offset = (page - 1) * pageSize;
    ads = ads.slice(offset, offset + pageSize);

    res.success(ads);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 记录广告点击
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await PlatformAd.findByPk(id);
    if (ad) {
      await ad.update({ click_count: ad.click_count + 1 });
    }
    res.success({ message: '点击记录成功' });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 记录广告展示
router.post('/:id/show', async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await PlatformAd.findByPk(id);
    if (ad) {
      await ad.update({ show_count: ad.show_count + 1 });
    }
    res.success({ message: '展示记录成功' });
  } catch (error) {
    res.error(error.message, 500);
  }
});

module.exports = router;
