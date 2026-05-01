const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.error('No token provided', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.user_id);
    
    if (!user) {
      return res.error('User not found', 401);
    }
    
    if (user.user_status !== 1) {
      return res.error('User is disabled', 403);
    }

    req.user = { user_id: user.user_id };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.error('Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return res.error('Token expired', 401);
    }
    res.error(error.message, 500);
  }
};

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.error('请先登录', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const admin = await Admin.findByPk(decoded.admin_id);
    
    if (!admin) {
      return res.error('管理员不存在', 401);
    }
    
    if (admin.status !== 1) {
      return res.error('管理员已被禁用', 403);
    }

    req.admin = { admin_id: admin.admin_id, role_id: admin.role_id };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.error('无效的token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return res.error('Token已过期', 401);
    }
    res.error(error.message, 500);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = { user_id: decoded.user_id };
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authMiddleware, adminAuthMiddleware, optionalAuth };
