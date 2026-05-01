const express = require('express');
const router = express.Router();
const DemanderVipLevel = require('../models/DemanderVipLevel');
const DemanderVipUser = require('../models/DemanderVipUser');
const QuoterVipLevel = require('../models/QuoterVipLevel');
const QuoterVipUser = require('../models/QuoterVipUser');
const SystemConfig = require('../models/SystemConfig');

router.get('/d-levels', async (req, res) => {
  try {
    const levels = await DemanderVipLevel.findAll({
      where: { status: 1 },
      order: [['level_value', 'ASC']]
    });
    res.success(levels);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/q-levels', async (req, res) => {
  try {
    const levels = await QuoterVipLevel.findAll({
      where: { status: 1 },
      order: [['level_value', 'ASC']]
    });
    res.success(levels);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/my-vip', async (req, res) => {
  try {
    const userId = req.user.user_id;

    const demanderVip = await DemanderVipUser.findOne({
      where: { user_id: userId },
      include: [{ model: DemanderVipLevel }]
    });

    const quoterVip = await QuoterVipUser.findOne({
      where: { user_id: userId },
      include: [{ model: QuoterVipLevel }]
    });

    res.success({
      demander_vip: demanderVip,
      quoter_vip: quoterVip
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/settings', async (req, res) => {
  try {
    const vipDemanderEnabled = await SystemConfig.findOne({
      where: { config_key: 'vip_demander_enabled' }
    });
    const vipQuoterEnabled = await SystemConfig.findOne({
      where: { config_key: 'vip_quoter_enabled' }
    });

    res.success({
      vip_demander_enabled: vipDemanderEnabled ? parseInt(vipDemanderEnabled.config_value) : 0,
      vip_quoter_enabled: vipQuoterEnabled ? parseInt(vipQuoterEnabled.config_value) : 0
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/buy', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { vip_type, level_id } = req.body;

    if (vip_type === 'demander') {
      const level = await DemanderVipLevel.findByPk(level_id);
      if (!level) {
        return res.error('Level not found', 404);
      }

      const existing = await DemanderVipUser.findOne({ where: { user_id: userId } });
      if (existing) {
        await existing.update({ level_id, status: 1 });
      } else {
        await DemanderVipUser.create({
          user_id: userId,
          level_id,
          status: 1,
          vip_start_at: new Date()
        });
      }
    } else if (vip_type === 'quoter') {
      const level = await QuoterVipLevel.findByPk(level_id);
      if (!level) {
        return res.error('Level not found', 404);
      }

      const existing = await QuoterVipUser.findOne({ where: { user_id: userId } });
      if (existing) {
        await existing.update({ level_id, status: 1 });
      } else {
        await QuoterVipUser.create({
          user_id: userId,
          level_id,
          status: 1,
          vip_start_at: new Date()
        });
      }
    } else {
      return res.error('Invalid VIP type', 400);
    }

    res.success(null, 'VIP purchased');
  } catch (error) {
    res.error(error.message, 500);
  }
});

module.exports = router;
