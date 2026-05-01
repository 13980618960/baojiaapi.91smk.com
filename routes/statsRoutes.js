const express = require('express');
const router = express.Router();
const DailyStat = require('../models/DailyStat');
const User = require('../models/User');
const Demand = require('../models/Demand');
const Quote = require('../models/Quote');
const { Op } = require('sequelize');

router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let stat = await DailyStat.findOne({ where: { stat_date: today } });

    if (!stat) {
      const totalUsers = await User.count();
      const totalDemands = await Demand.count();
      const totalQuotes = await Quote.count();
      const totalDeals = await Demand.count({ where: { status: 3 } });

      stat = await DailyStat.create({
        stat_date: today,
        total_users: totalUsers,
        new_users: 0,
        total_demands: totalDemands,
        new_demands: 0,
        total_quotes: totalQuotes,
        new_quotes: 0,
        total_deals: totalDeals,
        new_deals: 0,
        active_users: 0,
        total_amount: 0
      });
    }

    res.success(stat);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/trend', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await DailyStat.findAll({
      where: { stat_date: { [Op.gte]: startDate.toISOString().split('T')[0] } },
      order: [['stat_date', 'ASC']]
    });

    res.success(stats);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/province-ranking', async (req, res) => {
  try {
    const demands = await Demand.findAll({
      attributes: ['province', [sequelize.fn('COUNT', sequelize.col('demand_id')), 'count']],
      group: ['province'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10
    });

    res.success(demands);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/category-ranking', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const demands = await Demand.findAll({
      attributes: ['category_id', [sequelize.fn('COUNT', sequelize.col('demand_id')), 'count']],
      where: { category_id: { [Op.ne]: null } },
      group: ['category_id'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10,
      include: [{ model: Category, attributes: ['name'] }]
    });

    res.success(demands);
  } catch (error) {
    res.error(error.message, 500);
  }
});

module.exports = router;
