const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.error('Code is required', 400);
    }

    const userInfo = await User.findOne({ where: { openid: code } });
    
    if (!userInfo) {
      return res.error('User not found', 404);
    }

    const token = jwt.sign(
      { user_id: userInfo.user_id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.success({
      token,
      user: {
        user_id: userInfo.user_id,
        nickname: userInfo.nickname,
        avatar: userInfo.avatar,
        current_identity: userInfo.current_identity,
        demander_active: userInfo.demander_active,
        quoter_active: userInfo.quoter_active
      }
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/register', async (req, res) => {
  try {
    const { openid, nickname, avatar } = req.body;
    
    if (!openid) {
      return res.error('Openid is required', 400);
    }

    const existingUser = await User.findOne({ where: { openid } });
    if (existingUser) {
      return res.error('User already exists', 400);
    }

    const user = await User.create({
      openid,
      nickname: nickname || '新用户',
      avatar: avatar || '',
      real_name: '',
      phone: '',
      address: ''
    });

    res.success({ user_id: user.user_id }, 'Registration successful');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/info', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.error('User not found', 404);
    }

    res.success({
      user_id: user.user_id,
      nickname: user.nickname,
      avatar: user.avatar,
      real_name: user.real_name,
      phone: user.phone,
      address: user.address,
      is_verified: user.is_verified,
      current_identity: user.current_identity,
      demander_active: user.demander_active,
      quoter_active: user.quoter_active,
      user_status: user.user_status
    });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/update', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { real_name, phone, address, nickname, avatar } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.error('User not found', 404);
    }

    await user.update({
      real_name: real_name || user.real_name,
      phone: phone || user.phone,
      address: address || user.address,
      nickname: nickname || user.nickname,
      avatar: avatar || user.avatar
    });

    res.success(null, 'Update successful');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/switch-identity', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { identity } = req.body;
    
    if (identity !== 0 && identity !== 1) {
      return res.error('Invalid identity', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.error('User not found', 404);
    }

    if (identity === 0 && !user.demander_active) {
      return res.error('Demander identity not activated', 403);
    }
    if (identity === 1 && !user.quoter_active) {
      return res.error('Quoter identity not activated', 403);
    }

    await user.update({ current_identity: identity });
    res.success({ current_identity: identity }, 'Identity switched');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/activate-identity', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { identity, real_name, phone, address } = req.body;
    
    if (identity !== 0 && identity !== 1) {
      return res.error('Invalid identity', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.error('User not found', 404);
    }

    const updateData = { real_name, phone, address };
    
    if (identity === 0) {
      updateData.demander_active = 1;
      updateData.current_identity = 0;
    } else {
      updateData.quoter_active = 1;
      updateData.current_identity = 1;
    }

    await user.update(updateData);
    res.success(null, 'Identity activated');
  } catch (error) {
    res.error(error.message, 500);
  }
});

module.exports = router;
