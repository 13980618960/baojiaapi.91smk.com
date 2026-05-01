const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { Op } = require('sequelize');

router.post('/send', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { demand_id, quote_id, to_user_id, content, type = 0 } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.error('User not found', 404);
    }

    const toUser = await User.findByPk(to_user_id);
    if (!toUser) {
      return res.error('Recipient not found', 404);
    }

    const message = await Message.create({
      demand_id,
      quote_id: quote_id || null,
      from_user_id: userId,
      from_identity: user.current_identity,
      to_user_id,
      to_identity: toUser.current_identity,
      content,
      type
    });

    res.success({ msg_id: message.msg_id }, 'Message sent');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/list', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { demand_id, page = 1, pageSize = 50 } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {
      [Op.or]: [
        { from_user_id: userId },
        { to_user_id: userId }
      ]
    };

    if (demand_id) {
      where.demand_id = demand_id;
    }

    const { rows, count } = await Message.findAndCountAll({
      where,
      include: [
        { model: User, as: 'fromUser', attributes: ['user_id', 'nickname', 'avatar'] },
        { model: User, as: 'toUser', attributes: ['user_id', 'nickname', 'avatar'] }
      ],
      order: [['created_at', 'ASC']],
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

router.post('/read', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { msg_ids } = req.body;

    if (msg_ids && Array.isArray(msg_ids)) {
      await Message.update(
        { is_read: 1 },
        { where: { msg_id: { [Op.in]: msg_ids }, to_user_id: userId } }
      );
    }

    res.success(null, 'Messages marked as read');
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.user_id;

    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { from_user_id: userId },
          { to_user_id: userId }
        ]
      },
      include: [
        { model: User, as: 'fromUser', attributes: ['user_id', 'nickname', 'avatar'] },
        { model: User, as: 'toUser', attributes: ['user_id', 'nickname', 'avatar'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const conversationMap = new Map();
    conversations.forEach(msg => {
      const otherUserId = msg.from_user_id === userId ? msg.to_user_id : msg.from_user_id;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: msg.from_user_id === userId ? msg.toUser : msg.fromUser,
          last_message: msg,
          unread_count: 0
        });
      }
      if (msg.to_user_id === userId && msg.is_read === 0) {
        conversationMap.get(otherUserId).unread_count++;
      }
    });

    res.success(Array.from(conversationMap.values()));
  } catch (error) {
    res.error(error.message, 500);
  }
});

module.exports = router;
