const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Role = require('../models/Role');
const User = require('../models/User');
const Demand = require('../models/Demand');
const Quote = require('../models/Quote');
const Message = require('../models/Message');
const Category = require('../models/Category');
const DemanderVipLevel = require('../models/DemanderVipLevel');
const QuoterVipLevel = require('../models/QuoterVipLevel');
const PlatformAd = require('../models/PlatformAd');
const AdvertiserAd = require('../models/AdvertiserAd');
const SensitiveWord = require('../models/SensitiveWord');
const OperationLog = require('../models/OperationLog');
const DailyStat = require('../models/DailyStat');
const SystemConfig = require('../models/SystemConfig');
const Attachment = require('../models/Attachment');
const Favorite = require('../models/Favorite');
const Area = require('../models/Area');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { adminAuthMiddleware } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.error('用户名或密码错误', 401);
    }

    if (admin.password !== password) {
      return res.error('用户名或密码错误', 401);
    }

    if (admin.status !== 1) {
      return res.error('账号已被禁用', 403);
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id, role_id: admin.role_id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    await admin.update({ last_login_at: new Date(), last_login_ip: req.ip });

    res.success({
      token,
      admin: {
        admin_id: admin.admin_id,
        username: admin.username,
        nickname: admin.nickname,
        role_id: admin.role_id
      }
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/logout', async (req, res) => {
  res.success(null, '登出成功');
});

router.get('/info', async (req, res) => {
  try {
    const adminId = req.admin.admin_id;
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      return res.error('管理员不存在', 404);
    }

    res.success({
      admin_id: admin.admin_id,
      username: admin.username,
      nickname: admin.nickname,
      role_id: admin.role_id
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 仪表盘统计数据
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 每次都重新计算统计数据，确保与数据库一致
    const totalUsers = await User.count();
    const totalDemands = await Demand.count();
    const totalQuotes = await Quote.count();
    const totalDeals = await Demand.count({ where: { status: 3 } });

    // 查找或更新今天的统计记录
    let stat = await DailyStat.findOne({ where: { stat_date: today } });

    if (stat) {
      // 更新现有记录
      await stat.update({
        total_users: totalUsers,
        total_demands: totalDemands,
        total_quotes: totalQuotes,
        total_deals: totalDeals
      });
    } else {
      // 创建新记录
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

// 用户管理
router.get('/users/list', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'nickname', 'real_name', 'phone'],
      order: [['created_at', 'DESC']]
    });
    res.success(users);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, user_id, real_name, phone, status, identity, province, city, district, start_date, end_date, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (user_id) where.user_id = user_id;
    if (real_name) where.real_name = { [Op.like]: `%${real_name}%` };
    if (phone) where.phone = { [Op.like]: `%${phone}%` };
    if (status !== undefined) where.user_status = status;
    if (identity !== undefined) where.current_identity = identity;
    if (province) where.province_id = { [Op.in]: (await Area.findAll({ where: { level: 1, name: province } })).map(a => a.area_id) };
    if (city) where.city_id = { [Op.in]: (await Area.findAll({ where: { level: 2, name: city } })).map(a => a.area_id) };
    if (district) where.district_id = { [Op.in]: (await Area.findAll({ where: { level: 3, name: district } })).map(a => a.area_id) };
    if (start_date) where.created_at = { [Op.gte]: new Date(start_date) };
    if (end_date) {
      if (where.created_at) {
        where.created_at[Op.lte] = new Date(end_date);
      } else {
        where.created_at = { [Op.lte]: new Date(end_date) };
      }
    }
    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { real_name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC'], ['user_id', 'DESC']]
    });

    // 为每个用户添加统计信息和地址信息
    const usersWithStats = await Promise.all(rows.map(async (user) => {
      // 计算发布需求数
      const demandCount = await Demand.count({ where: { user_id: user.user_id } });
      // 计算需求成交数量
      const demandDealCount = await Demand.count({ where: { user_id: user.user_id, status: 3 } });
      // 计算参与报价数
      const quoteCount = await Quote.count({ where: { user_id: user.user_id } });
      // 计算报价成交数量
      const quoteDealCount = await Quote.count({ where: { user_id: user.user_id, status: 3 } });

      // 获取省、市、区名称
      let province = ''
      let city = ''
      let district = ''

      if (user.province_id) {
        const provinceArea = await Area.findByPk(user.province_id);
        if (provinceArea) {
          province = provinceArea.name;
        }
      }

      if (user.city_id) {
        const cityArea = await Area.findByPk(user.city_id);
        if (cityArea) {
          city = cityArea.name;
        }
      }

      if (user.district_id) {
        const districtArea = await Area.findByPk(user.district_id);
        if (districtArea) {
          district = districtArea.name;
        }
      }

      return {
        ...user.toJSON(),
        demand_count: demandCount,
        demand_deal_count: demandDealCount,
        quote_count: quoteCount,
        quote_deal_count: quoteDealCount,
        province,
        city,
        district
      };
    }));

    res.success({ list: usersWithStats, total: count });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 导出用户数据
router.get('/users/export', async (req, res) => {
  try {
    const { status, identity, start_date, end_date, keyword } = req.query;

    const where = {};
    if (status !== undefined) where.user_status = status;
    if (identity !== undefined) where.current_identity = identity;
    if (start_date) where.created_at = { [Op.gte]: new Date(start_date) };
    if (end_date) {
      if (where.created_at) {
        where.created_at[Op.lte] = new Date(end_date);
      } else {
        where.created_at = { [Op.lte]: new Date(end_date) };
      }
    }
    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { real_name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const users = await User.findAll({ where, order: [['created_at', 'DESC']] });

    // 为每个用户添加统计信息
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // 计算发布需求数
      const demandCount = await Demand.count({ where: { user_id: user.user_id } });
      // 计算需求成交数量
      const demandDealCount = await Demand.count({ where: { user_id: user.user_id, status: 3 } });
      // 计算参与报价数
      const quoteCount = await Quote.count({ where: { user_id: user.user_id } });
      // 计算报价成交数量
      const quoteDealCount = await Quote.count({ where: { user_id: user.user_id, status: 3 } });

      return {
        ...user.toJSON(),
        demand_count: demandCount,
        demand_deal_count: demandDealCount,
        quote_count: quoteCount,
        quote_deal_count: quoteDealCount
      };
    }));

    // 构建CSV数据
    let csvContent = '用户ID,微信昵称,用户姓名,用户电话,用户地址,发布需求数,需求成交数量,参与报价数,报价成交数量,注册时间,状态\n';
    usersWithStats.forEach(user => {
      csvContent += `${user.user_id},${user.nickname},${user.real_name},${user.phone},${user.address},${user.demand_count},${user.demand_deal_count},${user.quote_count},${user.quote_deal_count},${user.created_at},${user.user_status === 1 ? '正常' : '禁用'}\n`;
    });

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=用户数据_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csvContent);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/users/:user_id/toggle-status', async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id);

    if (!user) {
      return res.error('用户不存在', 404);
    }

    await user.update({ user_status: user.user_status === 1 ? 0 : 1 });
    res.success(null, '操作成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 更新用户信息
router.put('/users/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { real_name, phone, address, province, city, district, detail_address, demander_active, quoter_active } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.error('用户不存在', 404);
    }

    await user.update({
      real_name: real_name || user.real_name,
      phone: phone || user.phone,
      address: address || user.address,
      province_id: province || user.province_id,
      city_id: city || user.city_id,
      district_id: district || user.district_id,
      detail_address: detail_address || user.detail_address,
      demander_active: demander_active !== undefined ? demander_active : user.demander_active,
      quoter_active: quoter_active !== undefined ? quoter_active : user.quoter_active
    });

    res.success(user, '更新成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 获取单个用户详情
router.get('/users/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.error('用户不存在', 404);
    }
    res.success(user);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 需求管理
router.get('/demands', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, demand_id, status, need_audit, status_type, province, city, district, category_id, min_budget, max_budget, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (demand_id) where.demand_id = demand_id;
    if (status) where.status = status;
    if (need_audit !== undefined && need_audit !== '') where.need_audit = need_audit;
    if (status_type) {
      if (status_type == 1) {
        where.status = { [Op.ne]: 4 };
      } else {
        where.status = 4;
      }
    }
    if (province) where.province = province;
    if (city) where.city = city;
    if (district) where.district = district;
    if (category_id) where.category_id = category_id;
    if (min_budget) where.budget = { [Op.gte]: min_budget };
    if (max_budget) {
      if (where.budget) {
        where.budget[Op.lte] = max_budget;
      } else {
        where.budget = { [Op.lte]: max_budget };
      }
    }
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Demand.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['published_at', 'DESC']]
    });

    // 为每个需求添加用户和分类信息
    const demandsWithDetails = await Promise.all(rows.map(async (demand) => {
      const user = await User.findByPk(demand.user_id);
      let category = null;
      let category_level1 = '未分类';
      let category_level2 = '未分类';
      let category_level3 = '未分类';

      if (demand.category_id) {
        category = await Category.findByPk(demand.category_id);
        if (category) {
          if (category.level === 1) {
            category_level1 = category.name;
            category_level2 = '未分类';
            category_level3 = '未分类';
          } else if (category.level === 2) {
            category_level2 = category.name;
            const parentCategory = await Category.findByPk(category.parent_id);
            if (parentCategory) {
              category_level1 = parentCategory.name;
            }
            category_level3 = '未分类';
          } else if (category.level === 3) {
            category_level3 = category.name;
            const parentCategory = await Category.findByPk(category.parent_id);
            if (parentCategory) {
              category_level2 = parentCategory.name;
              const grandParentCategory = await Category.findByPk(parentCategory.parent_id);
              if (grandParentCategory) {
                category_level1 = grandParentCategory.name;
              }
            }
          }
        }
      }

      // 计算报价数量
      const quoteCount = await Quote.count({ where: { demand_id: demand.demand_id } });
      // 计算收藏数量
      const favoriteCount = await Favorite.count({ where: { demand_id: demand.demand_id } });
      return {
        ...demand.toJSON(),
        user_name: user?.nickname || '未知用户',
        category_name: category?.name || '未分类',
        category_level1,
        category_level2,
        category_level3,
        quote_count: quoteCount,
        favorite_count: favoriteCount,
        unit: demand.unit
      };
    }));

    res.success({ list: demandsWithDetails, total: count });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/demands/:demand_id/offline', async (req, res) => {
  try {
    const { demand_id } = req.params;
    const demand = await Demand.findByPk(demand_id);

    if (!demand) {
      return res.error('需求不存在', 404);
    }

    await demand.update({ status: 4 });
    res.success(null, '操作成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 获取单个需求详情
router.get('/demands/:demand_id', async (req, res) => {
  try {
    const { demand_id } = req.params;
    const demand = await Demand.findByPk(demand_id);
    if (!demand) {
      return res.error('需求不存在', 404);
    }
    // 获取用户信息
    const user = await User.findByPk(demand.user_id);
    // 获取分类信息
    const category = await Category.findByPk(demand.category_id);
    res.success({
      ...demand.toJSON(),
      user_name: user?.nickname || '未知用户',
      category_name: category?.name || '未分类'
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 更新需求审核状态
router.put('/demands/:demand_id/audit', async (req, res) => {
  try {
    const { demand_id } = req.params;
    const { need_audit } = req.body;

    const demand = await Demand.findByPk(demand_id);
    if (!demand) {
      return res.error('需求不存在', 404);
    }

    await demand.update({ need_audit });
    res.success(null, '审核状态更新成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 更新需求信息
router.put('/demands/:demand_id', async (req, res) => {
  try {
    const { demand_id } = req.params;
    const { title, brief_desc, detail_desc, category_id, province, city, district, address, budget, unit, max_quoters, deadline, need_audit } = req.body;

    const demand = await Demand.findByPk(demand_id);
    if (!demand) {
      return res.error('需求不存在', 404);
    }

    await demand.update({
      title: title || demand.title,
      brief_desc: brief_desc || demand.brief_desc,
      detail_desc: detail_desc || demand.detail_desc,
      category_id: category_id || demand.category_id,
      province: province || demand.province,
      city: city || demand.city,
      district: district || demand.district,
      address: address || demand.address,
      budget: budget || demand.budget,
      unit: unit !== undefined ? unit : demand.unit,
      max_quoters: max_quoters || demand.max_quoters,
      deadline: deadline || demand.deadline,
      need_audit: need_audit !== undefined ? need_audit : demand.need_audit
    });

    res.success(demand, '更新成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/demands/:demand_id/toggle-status', async (req, res) => {
  try {
    const { demand_id } = req.params;
    const demand = await Demand.findByPk(demand_id);

    if (!demand) {
      return res.error('需求不存在', 404);
    }

    // 禁用需求时，将状态改为已禁用
    if (demand.status !== 4) {
      await demand.update({ status: 4 }); // 4: 已禁用
      // 同时将相关报价状态改为已禁用
      await Quote.update({ status: 4, note: '需求禁用' }, { where: { demand_id } });
    } else {
      await demand.update({ status: 0 }); // 0: 新发布
    }
    res.success(null, '操作成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 更新需求状态
router.post('/demands/:demand_id/update-status', async (req, res) => {
  try {
    const { demand_id } = req.params;
    const { status } = req.body;

    const demand = await Demand.findByPk(demand_id);
    if (!demand) {
      return res.error('需求不存在', 404);
    }

    // 更新状态
    await demand.update({ status });

    // 如果状态变为已流标，同时将相关报价状态改为已流标
    if (status === 4) {
      await Quote.update({ status: 4, note: '需求下架' }, { where: { demand_id } });
    }

    res.success(null, '状态更新成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.delete('/demands/:demand_id', async (req, res) => {
  try {
    const { demand_id } = req.params;
    const demand = await Demand.findByPk(demand_id);

    if (!demand) {
      return res.error('需求不存在', 404);
    }

    await demand.destroy();
    res.success(null, '删除成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 收藏管理
router.get('/favorites', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, demand_id } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (demand_id) where.demand_id = demand_id;

    const { count, rows } = await Favorite.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // 为每个收藏添加用户信息
    const favoritesWithDetails = await Promise.all(rows.map(async (favorite) => {
      // 获取用户信息
      const user = await User.findByPk(favorite.user_id);

      return {
        ...favorite.toJSON(),
        user_nickname: user?.nickname || '未知用户',
        real_name: user?.real_name || null,
        phone: user?.phone || null
      };
    }));

    res.success({ list: favoritesWithDetails, total: count });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 报价管理
router.get('/quotes', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, quote_id, demand_id, status, province, city, district, category_id, min_price, max_price, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (quote_id) where.quote_id = quote_id;
    if (demand_id) where.demand_id = demand_id;
    if (status) where.status = status;

    // 构建报价金额筛选
    if (min_price) where.price = { [Op.gte]: min_price };
    if (max_price) {
      if (where.price) {
        where.price[Op.lte] = max_price;
      } else {
        where.price = { [Op.lte]: max_price };
      }
    }

    const { count, rows } = await Quote.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['quote_id', 'DESC']]
    });

    // 为每个报价添加用户和需求信息
    const quotesWithDetails = await Promise.all(rows.map(async (quote) => {
      try {
        // 获取报价人信息
        const user = await User.findByPk(quote.user_id);
        // 获取需求信息
        let demand = null;
        try {
          demand = await Demand.findByPk(quote.demand_id);
        } catch (error) {
          console.error('获取需求信息时出错:', error);
        }
        // 获取需求分类信息
        let category = null;
        let categoryPath = [];

        if (demand && demand.category_id) {
          try {
            category = await Category.findByPk(demand.category_id);
            // 获取完整的分类路径
            if (category) {
              categoryPath.push(category.name);
              // 获取二级分类
              if (category.parent_id) {
                const level2Category = await Category.findByPk(category.parent_id);
                if (level2Category) {
                  categoryPath.unshift(level2Category.name);
                  // 获取一级分类
                  if (level2Category.parent_id) {
                    const level1Category = await Category.findByPk(level2Category.parent_id);
                    if (level1Category) {
                      categoryPath.unshift(level1Category.name);
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error('获取分类信息时出错:', error);
          }
        }

        // 检查筛选条件
        let matchFilters = true;
        if (province && demand && demand.province !== province) matchFilters = false;
        if (city && demand && demand.city !== city) matchFilters = false;
        if (district && demand && demand.district !== district) matchFilters = false;
        if (category_id && demand && demand.category_id !== parseInt(category_id)) matchFilters = false;
        if (keyword && demand && !demand.title.includes(keyword)) matchFilters = false;

        if (!matchFilters) return null;

        return {
          ...quote.toJSON(),
          user_id: user?.user_id || null,
          user_nickname: user?.nickname || '未知用户',
          demand_title: demand?.title || '未知需求',
          demand_category: categoryPath.join('/') || '未分类',
          demand_category_level1: categoryPath[0] || '',
          demand_category_level2: categoryPath[1] || '',
          demand_category_level3: categoryPath[2] || '',
          demand_province: demand?.province || '',
          demand_city: demand?.city || '',
          demand_district: demand?.district || '',
          demand_budget: demand?.budget || '无',
          demand_unit: demand?.unit || '元',
          demand_published_at: demand?.published_at || null
        };
      } catch (error) {
        console.error('处理报价详情时出错:', error);
        // 即使出错也返回报价基本信息，避免整个请求失败
        return {
          ...quote.toJSON(),
          user_id: null,
          user_nickname: '未知用户',
          demand_title: '未知需求',
          demand_category: '未分类',
          demand_category_level1: '',
          demand_category_level2: '',
          demand_category_level3: '',
          demand_province: '',
          demand_city: '',
          demand_district: '',
          demand_budget: '无',
          demand_unit: '元',
          demand_published_at: null
        };
      }
    }));

    // 过滤掉不符合筛选条件的报价
    const filteredQuotes = quotesWithDetails.filter(quote => quote !== null);

    res.success({ list: filteredQuotes, total: filteredQuotes.length });
  } catch (error) {
    console.error('获取报价列表时出错:', error);
    res.error('获取报价列表失败', 500);
  }
});

// 获取报价详情
router.get('/quotes/:quote_id', async (req, res) => {
  try {
    const { quote_id } = req.params;

    // 先获取报价基本信息
    const quote = await Quote.findByPk(quote_id);

    if (!quote) {
      return res.error('报价不存在', 404);
    }

    // 获取报价附件
    const attachments = await Attachment.findAll({
      where: {
        type: 'quote',
        related_id: quote_id
      }
    });

    // 尝试获取用户信息
    let user = null;
    try {
      user = await User.findByPk(quote.user_id, {
        attributes: ['user_id', 'nickname', 'avatar']
      });
    } catch (error) {
      console.error('获取用户信息时出错:', error);
    }

    // 尝试获取需求信息
    let demand = null;
    try {
      demand = await Demand.findByPk(quote.demand_id, {
        include: [
          {
            model: Category,
            attributes: ['category_id', 'name']
          }
        ]
      });
    } catch (error) {
      console.error('获取需求信息时出错:', error);
    }

    // 构建返回数据
    const result = {
      ...quote.toJSON(),
      User: user,
      Demand: demand,
      user_nickname: user?.nickname || '未知用户',
      demand_title: demand?.title || '未知需求',
      attachments
    };

    res.success(result);
  } catch (error) {
    console.error('获取报价详情时出错:', error);
    res.error('获取报价详情失败', 500);
  }
});

// 切换报价状态（正常/禁用）
router.post('/quotes/:quote_id/toggle-status', async (req, res) => {
  try {
    const { quote_id } = req.params;
    const quote = await Quote.findByPk(quote_id);

    if (!quote) {
      return res.error('报价不存在', 404);
    }

    // 切换状态：如果是禁用状态则改为报价中，否则改为禁用
    const newStatus = quote.status === 4 ? 0 : 4;
    await quote.update({ status: newStatus });
    res.success(null, '操作成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.delete('/quotes/:quote_id', async (req, res) => {
  try {
    const { quote_id } = req.params;
    const quote = await Quote.findByPk(quote_id);

    if (!quote) {
      return res.error('报价不存在', 404);
    }

    await quote.destroy();
    res.success(null, '删除成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 沟通记录
router.get('/messages', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where.content = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await Message.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.success({ list: rows, total: count });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 分类管理 - 返回树形结构
router.get('/categories', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, category_id } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 如果有筛选条件
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.success({ list: [], total: 0 });
      }

      // 获取该分类及其所有子分类
      const getCategoryWithChildren = async (cat) => {
        const item = cat.toJSON();
        item.children = [];

        const children = await Category.findAll({
          where: { parent_id: cat.category_id },
          order: [['sort', 'ASC']]
        });

        item.hasChildren = children.length > 0;

        for (const child of children) {
          const childNode = await getCategoryWithChildren(child);
          item.children.push(childNode);
        }

        return item;
      };

      const result = await getCategoryWithChildren(category);
      return res.success({
        list: [result],
        total: 1
      });
    }

    // 获取一级分类（带分页）
    const level1Categories = await Category.findAll({
      where: { parent_id: 0 },
      order: [['sort', 'ASC']],
      limit: limit,
      offset: offset
    });

    // 获取一级分类总数
    const total = await Category.count({ where: { parent_id: 0 } });

    // 转换为普通对象并获取子分类
    const result = await Promise.all(level1Categories.map(async (cat) => {
      const item = cat.toJSON();
      item.children = [];

      // 获取二级分类
      const level2Categories = await Category.findAll({
        where: { parent_id: item.category_id },
        order: [['sort', 'ASC']]
      });

      // 为每个二级分类添加三级分类
      for (const level2 of level2Categories) {
        const level2Item = level2.toJSON();
        level2Item.children = [];

        // 获取三级分类
        const level3Categories = await Category.findAll({
          where: { parent_id: level2.category_id },
          order: [['sort', 'ASC']]
        });

        // 添加三级分类
        for (const level3 of level3Categories) {
          level2Item.children.push(level3.toJSON());
        }

        item.children.push(level2Item);
      }

      item.hasChildren = item.children.length > 0;
      return item;
    }));

    res.success({
      list: result,
      total: total
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 获取分类的子分类（用于懒加载）
router.get('/categories/:category_id/children', async (req, res) => {
  try {
    const { category_id } = req.params;

    // 获取该分类的子分类
    const children = await Category.findAll({
      where: { parent_id: category_id },
      order: [['sort', 'ASC']]
    });

    // 为每个子分类添加空children数组和hasChildren标记
    const result = [];
    for (const cat of children) {
      const item = cat.toJSON();
      item.children = [];
      // 检查是否有子分类
      const hasChildren = await Category.count({ where: { parent_id: cat.category_id } });
      item.hasChildren = hasChildren > 0;
      result.push(item);
    }

    res.success(result);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 获取所有分类的树形结构（用于需求管理页面的级联选择器）
router.get('/categories/all', async (req, res) => {
  try {
    // 获取所有分类，按层级和排序字段排序
    const allCategories = await Category.findAll({
      order: [['level', 'ASC'], ['sort', 'ASC']]
    });

    // 构建树形结构
    const buildTree = (data) => {
      const map = new Map();
      const tree = [];

      // 首先创建所有节点 - 确保数据类型正确
      data.forEach(item => {
        const categoryData = { ...item.dataValues, children: [] };
        // 确保数字类型正确
        categoryData.category_id = Number(categoryData.category_id);
        categoryData.parent_id = Number(categoryData.parent_id);
        categoryData.level = Number(categoryData.level);
        map.set(categoryData.category_id, categoryData);
      });

      // 然后构建父子关系
      map.forEach(node => {
        const parentId = node.parent_id || 0;
        if (parentId === 0) {
          tree.push(node);
        } else {
          const parent = map.get(parentId);
          if (parent) {
            parent.children.push(node);
          }
        }
      });

      return tree;
    };

    const tree = buildTree(allCategories);

    res.success(tree);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 获取所有分类的扁平列表（用于筛选分类）
router.get('/categories/flat', async (req, res) => {
  try {
    // 获取所有分类，按层级和排序字段排序
    const allCategories = await Category.findAll({
      order: [['level', 'ASC'], ['sort', 'ASC']]
    });

    // 直接返回扁平数组，确保数据类型正确
    const flatList = allCategories.map(item => ({
      category_id: Number(item.category_id),
      parent_id: Number(item.parent_id),
      name: item.name,
      level: Number(item.level),
      icon: item.icon,
      sort: item.sort,
      is_show: item.is_show
    }));

    res.success(flatList);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 添加分类
router.post('/categories', async (req, res) => {
  try {
    const { parent_id, name, icon, sort, is_show } = req.body;

    // 计算层级
    let level = 1;
    if (parent_id > 0) {
      const parent = await Category.findByPk(parent_id);
      if (parent) {
        level = parent.level + 1;
      }
    }

    const category = await Category.create({
      parent_id: parent_id || 0,
      name,
      icon,
      level,
      sort: sort || 0,
      is_show: is_show !== undefined ? is_show : 1
    });

    res.success(category);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 检查分类下是否有内容
router.get('/categories/:category_id/check', async (req, res) => {
  try {
    const { category_id } = req.params;

    // 检查需求表中是否有该分类的内容
    const demandCount = await Demand.count({ where: { category_id } });

    res.success({
      hasContent: demandCount > 0,
      count: demandCount
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 更新分类
router.put('/categories/:category_id', async (req, res) => {
  try {
    const { category_id } = req.params;
    const { name, icon, sort, is_show } = req.body;

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.error('分类不存在', 404);
    }

    await category.update({
      name: name || category.name,
      icon: icon !== undefined ? icon : category.icon,
      sort: sort !== undefined ? sort : category.sort,
      is_show: is_show !== undefined ? is_show : category.is_show
    });

    res.success(category);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 删除分类
router.delete('/categories/:category_id', async (req, res) => {
  try {
    const { category_id } = req.params;

    // 将分类下的需求变为未分类
    await Demand.update({ category_id: null }, { where: { category_id } });

    // 删除分类
    await Category.destroy({ where: { category_id } });

    res.success(null, '删除成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 操作日志
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await OperationLog.findAndCountAll({
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.success({ list: rows, total: count });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// VIP管理 - D-vips
router.get('/vip/demander', async (req, res) => {
  try {
    const levels = await DemanderVipLevel.findAll({
      order: [['sort', 'ASC']]
    });
    res.success(levels);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// VIP管理 - Q-vips
router.get('/vip/quoter', async (req, res) => {
  try {
    const levels = await QuoterVipLevel.findAll({
      order: [['sort', 'ASC']]
    });
    res.success(levels);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 广告管理 - 广告主管理
router.get('/ads/advertiser', async (req, res) => {
  try {
    const { page = 1, pageSize = 100, type, position } = req.query;
    const where = {};

    if (type !== undefined) {
      where.type = parseInt(type);
    }
    if (position) {
      where.position = position;
    }

    const ads = await AdvertiserAd.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize)
    });

    res.success(ads);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 新增广告主广告
router.post('/ads/advertiser', async (req, res) => {
  try {
    const {
      user_id, title, type, position, position_id,
      image_url, video_url, link_url, content,
      billing_type, budget, bid_amount,
      target_provinces, target_cities, interests, behaviors,
      min_age, max_age, start_time, end_time,
      weight, status
    } = req.body;

    const ad = await AdvertiserAd.create({
      user_id,
      title,
      type,
      position,
      position_id,
      image_url,
      video_url,
      link_url,
      content,
      billing_type,
      budget,
      bid_amount,
      target_provinces,
      target_cities,
      interests,
      behaviors,
      min_age,
      max_age,
      start_time,
      end_time,
      weight,
      status
    });
    res.success(ad, '创建成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 编辑广告主广告
router.put('/ads/advertiser/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await AdvertiserAd.findByPk(id);
    if (!ad) {
      return res.error('广告不存在', 404);
    }
    await ad.update(req.body);
    res.success(ad, '更新成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 删除广告主广告
router.delete('/ads/advertiser/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await AdvertiserAd.findByPk(id);
    if (!ad) {
      return res.error('广告不存在', 404);
    }
    await ad.destroy();
    res.success({ message: '删除成功' });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 敏感词管理
router.get('/sensitive', async (req, res) => {
  try {
    const words = await SensitiveWord.findAll({
      order: [['created_at', 'DESC']]
    });
    res.success(words);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 系统配置
router.get('/configs', async (req, res) => {
  try {
    const configs = await SystemConfig.findAll();
    res.success(configs);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 保存系统配置
router.post('/configs', async (req, res) => {
  try {
    const { group, configs } = req.body;

    for (const [key, value] of Object.entries(configs)) {
      const config = await SystemConfig.findOne({ where: { config_key: key } });
      if (config) {
        await config.update({ config_value: value });
      } else {
        await SystemConfig.create({
          config_key: key,
          config_value: value,
          config_type: typeof value === 'boolean' ? 'boolean' : 'text',
          group_name: group,
          description: key,
          sort: 0,
          status: 1
        });
      }
    }

    res.success(null, '配置已保存');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 附件管理
router.get('/attachments', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type, related_id, user_id, keyword, demand_id, quote_id, file_extension } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (type) where.type = type;
    if (related_id) where.related_id = related_id;
    if (user_id) where.user_id = user_id;
    if (demand_id) where.demand_id = demand_id;
    if (quote_id) where.quote_id = quote_id;
    if (file_extension) where.file_extension = file_extension;
    if (keyword) {
      where[Op.or] = [
        { filename: { [Op.like]: `%${keyword}%` } },
        { url: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Attachment.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.success({ list: rows, total: count });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.delete('/attachments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.error('附件不存在', 404);
    }

    await attachment.destroy();
    res.success(null, '删除成功');
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 省市区相关API

// 获取所有省份
router.get('/areas/provinces', async (req, res) => {
  try {
    const provinces = await Area.findAll({
      where: { level: 1 },
      order: [['sort', 'ASC']]
    });
    res.success(provinces);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 根据省份ID获取城市
router.get('/areas/cities', async (req, res) => {
  try {
    const { province_id } = req.query;
    if (!province_id) {
      return res.error('请提供省份ID', 400);
    }
    const cities = await Area.findAll({
      where: { parent_id: province_id, level: 2 },
      order: [['sort', 'ASC']]
    });
    res.success(cities);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 根据城市ID获取区县
router.get('/areas/districts', async (req, res) => {
  try {
    const { city_id } = req.query;
    if (!city_id) {
      return res.error('请提供城市ID', 400);
    }
    const districts = await Area.findAll({
      where: { parent_id: city_id, level: 3 },
      order: [['sort', 'ASC']]
    });
    res.success(districts);
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 广告位置管理
router.get('/ads/positions', async (req, res) => {
  try {
    const AdPosition = require('../models/AdPosition');
    const positions = await AdPosition.findAll({
      order: [['position_id', 'ASC']]
    });
    res.success(positions);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/ads/positions/:id', async (req, res) => {
  try {
    const AdPosition = require('../models/AdPosition');
    const position = await AdPosition.findByPk(req.params.id);
    if (!position) {
      return res.error('广告位置不存在', 404);
    }
    res.success(position);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/ads/positions', async (req, res) => {
  try {
    const AdPosition = require('../models/AdPosition');
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

router.put('/ads/positions/:id', async (req, res) => {
  try {
    const AdPosition = require('../models/AdPosition');
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

// 通过 code 更新广告位置
router.put('/ads/positions/code/:code', async (req, res) => {
  try {
    const AdPosition = require('../models/AdPosition');
    const position = await AdPosition.findOne({ where: { position_code: req.params.code } });
    if (!position) {
      return res.error('广告位置不存在', 404);
    }

    const { interval_type, interval_value, carousel_count } = req.body;

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

router.delete('/ads/positions/:id', async (req, res) => {
  try {
    const AdPosition = require('../models/AdPosition');
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

// 平台广告管理 - 统一路由（支持position_id、type、position筛选）
router.get('/ads/platform', async (req, res) => {
  try {
    const { position_id, type, position } = req.query;
    const where = {};

    if (position_id) {
      where.position_id = parseInt(position_id);
    }
    if (type !== undefined) {
      where.type = parseInt(type);
    }
    if (position) {
      where.position = position;
    }

    const ads = await PlatformAd.findAll({
      where,
      include: [{
        model: require('../models/AdPosition'),
        as: 'positionInfo',
        attributes: ['position_name', 'type', 'content_interval'],
        required: false
      }],
      order: [['sort', 'ASC'], ['weight', 'DESC'], ['ad_id', 'DESC']]
    });
    // 转换为纯JSON数组返回
    const result = ads.map(ad => ad.toJSON ? ad.toJSON() : ad);
    res.success(result);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/ads/platform/:id', async (req, res) => {
  try {
    const ad = await PlatformAd.findByPk(req.params.id);
    if (!ad) {
      return res.error('广告不存在', 404);
    }
    // 转换为纯JSON对象返回
    res.success(ad.toJSON ? ad.toJSON() : ad);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/ads/platform', async (req, res) => {
  try {
    // 直接使用req.body中的所有字段
    const ad = await PlatformAd.create(req.body);
    // 转换为纯JSON对象返回，避免返回Sequelize模型实例
    const result = ad.toJSON ? ad.toJSON() : ad;
    res.status(201).json({ code: 200, message: '创建成功', data: result });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.put('/ads/platform/:id', async (req, res) => {
  try {
    const ad = await PlatformAd.findByPk(req.params.id);
    if (!ad) {
      return res.error('广告不存在', 404);
    }

    // 直接使用req.body中的所有字段
    await ad.update(req.body);

    // 重新获取更新后的数据
    const updatedAd = await PlatformAd.findByPk(req.params.id);
    res.success(updatedAd);
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.delete('/ads/platform/:id', async (req, res) => {
  try {
    const ad = await PlatformAd.findByPk(req.params.id);
    if (!ad) {
      return res.error('广告不存在', 404);
    }

    await ad.destroy();
    res.success({ message: '删除成功' });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.put('/ads/platform/:id/status', async (req, res) => {
  try {
    const ad = await PlatformAd.findByPk(req.params.id);
    if (!ad) {
      return res.error('广告不存在', 404);
    }

    const { status } = req.body;
    await ad.update({ status });

    res.success({ message: '状态更新成功' });
  } catch (error) {
    res.error(error.message, 500);
  }
});

// 开放接口路由
const openApiRoutes = require('./openApiRoutes');
router.use('/open-api', openApiRoutes);

module.exports = router;
