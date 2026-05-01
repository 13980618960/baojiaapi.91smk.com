const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { Op } = require('sequelize');

router.get('/tree', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_show: 1 },
      order: [['level', 'ASC'], ['sort', 'ASC']]
    });

    const tree = buildTree(categories);
    res.success(tree);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/list', async (req, res) => {
  try {
    const { level, parent_id } = req.query;
    
    const where = { is_show: 1 };
    if (level) {
      where.level = parseInt(level);
    }
    if (parent_id !== undefined) {
      where.parent_id = parseInt(parent_id);
    }

    const categories = await Category.findAll({
      where,
      order: [['sort', 'ASC']]
    });

    res.success(categories);
  } catch (error) {
    res.error(error.message, 500);
  }
});

function buildTree(categories) {
  const map = {};
  const roots = [];

  categories.forEach(cat => {
    map[cat.category_id] = {
      category_id: cat.category_id,
      name: cat.name,
      icon: cat.icon,
      parent_id: cat.parent_id,
      level: cat.level,
      path: cat.path,
      children: []
    };
  });

  categories.forEach(cat => {
    if (cat.parent_id === 0) {
      roots.push(map[cat.category_id]);
    } else if (map[cat.parent_id]) {
      map[cat.parent_id].children.push(map[cat.category_id]);
    }
  });

  return roots;
}

module.exports = router;
