const express = require('express');
const router = express.Router();
const SystemConfig = require('../models/SystemConfig');

router.get('/configs', async (req, res) => {
  try {
    const configs = await SystemConfig.findAll({
      where: { status: 1 },
      order: [['group_name', 'ASC'], ['sort', 'ASC']]
    });

    const configMap = {};
    configs.forEach(config => {
      let value = config.config_value;
      if (config.config_type === 'number') {
        value = parseFloat(value);
      } else if (config.config_type === 'boolean') {
        value = parseInt(value) === 1;
      }
      configMap[config.config_key] = value;
    });

    res.success(configMap);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/config/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const config = await SystemConfig.findOne({ where: { config_key: key } });

    if (!config) {
      return res.error('Config not found', 404);
    }

    res.success({ value: config.config_value });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/config/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const config = await SystemConfig.findOne({ where: { config_key: key } });
    if (!config) {
      return res.error('Config not found', 404);
    }

    await config.update({ config_value: value });
    res.success(null, 'Config updated');
  } catch (error) {
    res.error(error.message, 500);
  }
});

module.exports = router;
