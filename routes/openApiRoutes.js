const express = require('express');
const router = express.Router();
const SystemConfig = require('../models/SystemConfig');

// 获取腾讯地图配置
router.get('/tencent-map/config', async (req, res) => {
  try {
    const configs = await SystemConfig.findAll({
      where: {
        group_name: 'tencent_map'
      }
    });
    
    const configMap = {};
    configs.forEach(config => {
      configMap[config.config_key] = config.config_value;
    });
    
    res.json({
      code: 200,
      data: configMap
    });
  } catch (error) {
    console.error('获取腾讯地图配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取配置失败'
    });
  }
});

// 保存腾讯地图配置
router.post('/tencent-map/config', async (req, res) => {
  try {
    const { apiKey, secretKey } = req.body;
    
    // 保存API Key
    await SystemConfig.upsert({
      config_key: 'api_key',
      config_value: apiKey,
      config_type: 'string',
      group_name: 'tencent_map',
      description: '腾讯地图API Key'
    });
    
    // 保存密钥
    await SystemConfig.upsert({
      config_key: 'secret_key',
      config_value: secretKey,
      config_type: 'string',
      group_name: 'tencent_map',
      description: '腾讯地图密钥'
    });
    
    res.json({
      code: 200,
      message: '配置保存成功'
    });
  } catch (error) {
    console.error('保存腾讯地图配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '保存配置失败'
    });
  }
});

// 获取微信支付配置
router.get('/wechat-pay/config', async (req, res) => {
  try {
    const configs = await SystemConfig.findAll({
      where: {
        group_name: 'wechat_pay'
      }
    });
    
    const configMap = {};
    configs.forEach(config => {
      configMap[config.config_key] = config.config_value;
    });
    
    res.json({
      code: 200,
      data: configMap
    });
  } catch (error) {
    console.error('获取微信支付配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取配置失败'
    });
  }
});

// 保存微信支付配置
router.post('/wechat-pay/config', async (req, res) => {
  try {
    const { mchid, certPath, keyPath, apiV3Key, mchName } = req.body;
    
    // 保存商户号
    await SystemConfig.upsert({
      config_key: 'mchid',
      config_value: mchid,
      config_type: 'string',
      group_name: 'wechat_pay',
      description: '微信支付商户号'
    });
    
    // 保存证书路径
    await SystemConfig.upsert({
      config_key: 'cert_path',
      config_value: certPath,
      config_type: 'string',
      group_name: 'wechat_pay',
      description: '商户API证书路径'
    });
    
    // 保存私钥路径
    await SystemConfig.upsert({
      config_key: 'key_path',
      config_value: keyPath,
      config_type: 'string',
      group_name: 'wechat_pay',
      description: '商户API私钥路径'
    });
    
    // 保存API v3密钥
    await SystemConfig.upsert({
      config_key: 'api_v3_key',
      config_value: apiV3Key,
      config_type: 'string',
      group_name: 'wechat_pay',
      description: 'API v3密钥'
    });
    
    // 保存商户名称
    await SystemConfig.upsert({
      config_key: 'mch_name',
      config_value: mchName,
      config_type: 'string',
      group_name: 'wechat_pay',
      description: '商户名称'
    });
    
    res.json({
      code: 200,
      message: '配置保存成功'
    });
  } catch (error) {
    console.error('保存微信支付配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '保存配置失败'
    });
  }
});

// 获取公众号消息模板列表
router.get('/message-template/wechat/list', async (req, res) => {
  try {
    const configs = await SystemConfig.findAll({
      where: {
        group_name: 'wechat_message_template'
      }
    });
    
    const templates = configs.map(config => {
      try {
        return JSON.parse(config.config_value);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    res.json({
      code: 200,
      data: {
        list: templates
      }
    });
  } catch (error) {
    console.error('获取公众号消息模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取模板失败'
    });
  }
});

// 保存公众号消息模板（添加或编辑）
router.post('/message-template/wechat', async (req, res) => {
  try {
    const { templateId, title, content, industryId1, industryId2, templateType, status } = req.body;
    
    await SystemConfig.upsert({
      config_key: templateId,
      config_value: JSON.stringify({
        template_id: templateId,
        title,
        content,
        industry_id1: industryId1,
        industry_id2: industryId2,
        template_type: templateType,
        status: status !== false,
        create_time: new Date().toISOString()
      }),
      config_type: 'json',
      group_name: 'wechat_message_template',
      description: title
    });
    
    res.json({
      code: 200,
      message: '保存成功'
    });
  } catch (error) {
    console.error('保存公众号消息模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '保存失败'
    });
  }
});

// 删除公众号消息模板
router.delete('/message-template/wechat/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    await SystemConfig.destroy({
      where: {
        group_name: 'wechat_message_template',
        config_key: templateId
      }
    });
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除公众号消息模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败'
    });
  }
});

// 获取小程序消息模板列表
router.get('/message-template/miniprogram/list', async (req, res) => {
  try {
    const configs = await SystemConfig.findAll({
      where: {
        group_name: 'miniprogram_message_template'
      }
    });
    
    const templates = configs.map(config => {
      try {
        return JSON.parse(config.config_value);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    res.json({
      code: 200,
      data: {
        list: templates
      }
    });
  } catch (error) {
    console.error('获取小程序消息模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取模板失败'
    });
  }
});

// 保存小程序消息模板（添加或编辑）
router.post('/message-template/miniprogram', async (req, res) => {
  try {
    const { templateId, title, content, type, industryId, templateType, status } = req.body;
    
    await SystemConfig.upsert({
      config_key: templateId,
      config_value: JSON.stringify({
        template_id: templateId,
        title,
        content,
        type,
        industry_id: industryId,
        template_type: templateType,
        status: status !== false,
        create_time: new Date().toISOString()
      }),
      config_type: 'json',
      group_name: 'miniprogram_message_template',
      description: title
    });
    
    res.json({
      code: 200,
      message: '保存成功'
    });
  } catch (error) {
    console.error('保存小程序消息模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '保存失败'
    });
  }
});

// 删除小程序消息模板
router.delete('/message-template/miniprogram/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    await SystemConfig.destroy({
      where: {
        group_name: 'miniprogram_message_template',
        config_key: templateId
      }
    });
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除小程序消息模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败'
    });
  }
});

module.exports = router;