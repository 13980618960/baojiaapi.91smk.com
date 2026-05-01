const express = require('express');
const router = express.Router();
const AdPosition = require('../models/AdPosition');

// 获取广告位置列表
router.get('/positions', async (req, res) => {
  try {
    const { code } = req.query;
    const where = {};

    if (code) {
      where.position_code = code;
    }

    const positions = await AdPosition.findAll({
      where,
      order: [['position_id', 'ASC']]
    });
    res.success(positions);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 获取广告位置详情
router.get('/positions/:id', async (req, res) => {
  try {
    const position = await AdPosition.findByPk(req.params.id);
    if (!position) {
      return res.error('广告位置不存在', 404);
    }
    res.success(position);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 创建广告位置
router.post('/positions', async (req, res) => {
  try {
    const { position_code, position_name, description, type, max_ads, display_interval, content_interval, width, height, status } = req.body;
    
    // 检查位置代码是否已存在
    const existingPosition = await AdPosition.findOne({ where: { position_code } });
    if (existingPosition) {
      return res.error('位置代码已存在', 400);
    }
    
    const position = await AdPosition.create({
      position_code,
      position_name,
      description,
      type,
      max_ads,
      display_interval,
      content_interval,
      width,
      height,
      status
    });
    
    res.success(position, 201);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 更新广告位置
router.put('/positions/:id', async (req, res) => {
  try {
    const position = await AdPosition.findByPk(req.params.id);
    if (!position) {
      return res.error('广告位置不存在', 404);
    }

    const { position_code, position_name, description, type, max_ads, display_interval, content_interval, interval_type, interval_value, carousel_count, width, height, status } = req.body;

    // 检查位置代码是否已被其他位置使用
    if (position_code && position_code !== position.position_code) {
      const existingPosition = await AdPosition.findOne({ where: { position_code } });
      if (existingPosition) {
        return res.error('位置代码已存在', 400);
      }
    }

    await position.update({
      position_code,
      position_name,
      description,
      type,
      max_ads,
      display_interval,
      content_interval,
      interval_type,
      interval_value,
      carousel_count,
      width,
      height,
      status
    });

    res.success(position);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 根据position_code更新广告位置
router.put('/positions', async (req, res) => {
  try {
    const { code, interval_type, interval_value, carousel_count } = req.body;

    const position = await AdPosition.findOne({ where: { position_code: code } });
    if (!position) {
      return res.error('广告位置不存在', 404);
    }

    await position.update({
      interval_type,
      interval_value,
      carousel_count
    });

    res.success(position);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 删除广告位置
router.delete('/positions/:id', async (req, res) => {
  try {
    const position = await AdPosition.findByPk(req.params.id);
    if (!position) {
      return res.error('广告位置不存在', 404);
    }
    
    await position.destroy();
    res.success({ message: '删除成功' });
  } catch (error) {
    res.error(error.message, 500);
  }
});

module.exports = router;