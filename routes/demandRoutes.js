const express = require('express');
const router = express.Router();
const Demand = require('../models/Demand');
const Category = require('../models/Category');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const { Op } = require('sequelize');

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, category_id, province, city, keyword, sort = 'default' } = req.query;
    const offset = (page - 1) * pageSize;
    
    const where = {
      status: { [Op.in]: [1, 2, 3] }
    };

    if (category_id) {
      where.category_id = category_id;
    }
    if (province) {
      where.province = province;
    }
    if (city) {
      where.city = city;
    }
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` };
    }

    let order = [['published_at', 'DESC']];
    if (sort === 'price_asc') {
      order = [['budget', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['budget', 'DESC']];
    } else if (sort === 'quote_count') {
      order = [['quote_count', 'DESC']];
    }

    const { rows, count } = await Demand.findAndCountAll({
      where,
      include: [{
        model: Category,
        attributes: ['category_id', 'name']
      }],
      order,
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    res.success({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / pageSize)
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const demand = await Demand.findByPk(id, {
      include: [
        { model: Category, attributes: ['category_id', 'name', 'path'] },
        { model: User, attributes: ['user_id', 'nickname', 'avatar'] }
      ]
    });

    if (!demand) {
      return res.error('Demand not found', 404);
    }

    await demand.increment('view_count');

    res.success(demand);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/create', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      title, brief_desc, detail_desc, category_id,
      province, city, district, address,
      longitude, latitude, budget, max_quoters, deadline,
      is_anonymous
    } = req.body;

    const ip_address = req.ip;

    const demand = await Demand.create({
      user_id: userId,
      title,
      brief_desc: brief_desc || '',
      detail_desc,
      category_id: category_id || null,
      province,
      city,
      district,
      address,
      longitude,
      latitude,
      budget: budget || 0,
      max_quoters: max_quoters || 0,
      deadline,
      is_anonymous: is_anonymous || 0,
      ip_address,
      status: category_id ? 1 : 0,
      is_classified: category_id ? 1 : 0,
      published_at: category_id ? new Date() : null
    });

    res.success({ demand_id: demand.demand_id }, 'Demand created');
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.error('Duplicate demand detected', 400);
    }
    res.error(error.message, 500);
  }
});

router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    const demand = await Demand.findByPk(id);
    if (!demand) {
      return res.error('Demand not found', 404);
    }
    if (demand.user_id !== userId) {
      return res.error('Unauthorized', 403);
    }

    const { title, brief_desc, detail_desc, category_id, budget, max_quoters, deadline, is_anonymous } = req.body;

    await demand.update({
      title: title || demand.title,
      brief_desc: brief_desc || demand.brief_desc,
      detail_desc: detail_desc || demand.detail_desc,
      category_id: category_id !== undefined ? category_id : demand.category_id,
      budget: budget !== undefined ? budget : demand.budget,
      max_quoters: max_quoters !== undefined ? max_quoters : demand.max_quoters,
      deadline: deadline !== undefined ? deadline : demand.deadline,
      is_anonymous: is_anonymous !== undefined ? is_anonymous : demand.is_anonymous
    });

    res.success(null, 'Demand updated');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    const demand = await Demand.findByPk(id);
    if (!demand) {
      return res.error('Demand not found', 404);
    }
    if (demand.user_id !== userId) {
      return res.error('Unauthorized', 403);
    }

    await demand.destroy();
    res.success(null, 'Demand deleted');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/favorite', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { demand_id } = req.body;

    const favorite = await Favorite.findOne({
      where: { user_id: userId, demand_id }
    });

    if (favorite) {
      await favorite.destroy();
      await Demand.decrement('favorite_count', { where: { demand_id } });
      res.success({ is_favorited: false }, 'Unfavorited');
    } else {
      await Favorite.create({ user_id: userId, demand_id });
      await Demand.increment('favorite_count', { where: { demand_id } });
      res.success({ is_favorited: true }, 'Favorited');
    }
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

    const { rows, count } = await Demand.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ['name'] }],
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

module.exports = router;
