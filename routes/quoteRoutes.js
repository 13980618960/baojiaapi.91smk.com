const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const Demand = require('../models/Demand');
const User = require('../models/User');
const QuoterVipUser = require('../models/QuoterVipUser');
const QuoterVipLevel = require('../models/QuoterVipLevel');
const { Op } = require('sequelize');

router.post('/create', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { demand_id, price, unit, description } = req.body;

    const demand = await Demand.findByPk(demand_id);
    if (!demand) {
      return res.error('Demand not found', 404);
    }
    if (demand.status === 3 || demand.status === 4) {
      return res.error('Demand is closed', 400);
    }

    const existingQuote = await Quote.findOne({
      where: { demand_id, user_id: userId }
    });
    if (existingQuote) {
      return res.error('You have already quoted for this demand', 400);
    }

    const quoterVip = await QuoterVipUser.findOne({
      where: { user_id: userId, status: 1 },
      include: [{ model: QuoterVipLevel }]
    });

    if (quoterVip && quoterVip.QuoterVipLevel) {
      const vipConfig = quoterVip.QuoterVipLevel;
      if (vipConfig.daily_max_quotes > 0 && quoterVip.today_quotes >= vipConfig.daily_max_quotes) {
        return res.error('Daily quote limit reached', 400);
      }
    }

    const now = new Date();
    const quote = await Quote.create({
      demand_id,
      user_id: userId,
      price,
      unit: unit || '元/次',
      description,
      status: 0,
      first_quote_at: now,
      last_quote_at: now
    });

    if (demand.status === 1) {
      await demand.update({ status: 2, quote_count: demand.quote_count + 1 });
    } else {
      await demand.increment('quote_count');
    }

    res.success({ quote_id: quote.quote_id }, 'Quote created');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { price, unit, description } = req.body;

    const quote = await Quote.findByPk(id);
    if (!quote) {
      return res.error('Quote not found', 404);
    }
    if (quote.user_id !== userId) {
      return res.error('Unauthorized', 403);
    }
    if (quote.status !== 0) {
      return res.error('Quote cannot be modified', 400);
    }

    await quote.update({
      price: price || quote.price,
      unit: unit || quote.unit,
      description: description !== undefined ? description : quote.description,
      modified_count: quote.modified_count + 1,
      last_quote_at: new Date()
    });

    res.success(null, 'Quote updated');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/accept/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const quote = await Quote.findByPk(id, {
      include: [{ model: Demand }]
    });
    if (!quote) {
      return res.error('Quote not found', 404);
    }
    if (quote.Demand.user_id !== userId) {
      return res.error('Unauthorized', 403);
    }
    if (quote.status !== 0) {
      return res.error('Quote is not available', 400);
    }

    await quote.update({ status: 2 });
    await quote.Demand.update({ status: 3 });

    await Quote.update(
      { status: 1 },
      { where: { demand_id: quote.demand_id, quote_id: { [Op.ne]: id }, status: 0 } }
    );

    res.success(null, 'Quote accepted');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { reason } = req.body;

    const quote = await Quote.findByPk(id, {
      include: [{ model: Demand }]
    });
    if (!quote) {
      return res.error('Quote not found', 404);
    }
    if (quote.Demand.user_id !== userId) {
      return res.error('Unauthorized', 403);
    }
    if (quote.status !== 0) {
      return res.error('Quote cannot be rejected', 400);
    }

    await quote.update({ status: 1, reject_reason: reason || '' });
    res.success(null, 'Quote rejected');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/my-list', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, pageSize = 20, status } = req.query;
    const offset = (page - 1) * pageSize;

    const where = { user_id: userId };
    if (status !== undefined) {
      where.status = parseInt(status);
    }

    const { rows, count } = await Quote.findAndCountAll({
      where,
      include: [
        { model: Demand, attributes: ['demand_id', 'title', 'province', 'city', 'budget'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.success({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const quote = await Quote.findByPk(id, {
      include: [
        { model: Demand },
        { model: User, attributes: ['user_id', 'nickname', 'avatar', 'phone'] }
      ]
    });

    if (!quote) {
      return res.error('Quote not found', 404);
    }

    res.success(quote);
  } catch (error) {
    res.error(error.message, 500);
  }
});

module.exports = router;
