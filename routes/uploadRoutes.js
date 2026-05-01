const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const Attachment = require('../models/Attachment');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.path);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // 优先从query获取参数，因为body可能还没解析
    const type = req.query.type || req.body.type || 'other';
    let prefix = '';
    
    // 根据类型生成前缀
    if (type === 'demand') {
      // 需求附件：需求ID+编号+时间
      const demandId = req.query.related_id || req.body.related_id || req.body.demand_id || '0';
      prefix = `demand_${demandId}`;
    } else if (type === 'quote') {
      // 报价附件：报价ID+编号+时间
      const quoteId = req.query.related_id || req.body.related_id || req.body.quote_id || '0';
      prefix = `quote_${quoteId}`;
    } else if (type === 'avatar') {
      // 用户头像：用户ID+编号+时间
      const userId = req.query.user_id || req.body.user_id || req.user?.user_id || '0';
      prefix = `avatar_${userId}`;
    } else {
      // 其他附件：用户ID+编号+时间
      const userId = req.query.user_id || req.body.user_id || req.user?.user_id || '0';
      prefix = `other_${userId}`;
    }
    
    // 生成时间戳和随机数
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    cb(null, `${prefix}_${timestamp}_${random}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = file.originalname;
    const mimetype = file.mimetype;
    console.log('Upload file:', filename, 'ext:', ext, 'mimetype:', mimetype);
    console.log('Allowed extensions:', config.upload.allowedExt);
    // 直接允许所有文件类型，暂时禁用文件类型检查
    cb(null, true);
  }
});

router.post('/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.error('No file uploaded', 400);
    }

    const url = `/uploads/${req.file.filename}`;
    res.success({ url, filename: req.file.filename });
  } catch (error) {
    res.error(error.message, 500);
  }
});

router.post('/file', upload.array('file', 12), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.error('No file uploaded', 400);
    }

    console.log('Uploaded files:', req.files);
    
    const attachments = [];
    for (const file of req.files) {
      const url = `/uploads/${file.filename}`;
      
      // 提取文件扩展名
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      
      // 确定 demand_id 和 quote_id
      let demandId = null;
      let quoteId = null;
      const type = req.body.type || 'other';
      
      if (type === 'demand') {
        demandId = req.body.related_id || req.body.demand_id || null;
      } else if (type === 'quote') {
        quoteId = req.body.related_id || req.body.quote_id || null;
      }
      
      // 保存附件信息到数据库
      try {
        // 使用与生成文件名时相同的用户ID
        const userId = req.body.user_id || req.user?.user_id || 1;
        // 保存文件名时使用 UTF-8 编码
        const attachment = await Attachment.create({
          type: type,
          related_id: req.body.related_id || null,
          demand_id: demandId,
          quote_id: quoteId,
          filename: Buffer.from(file.originalname, 'utf8').toString('utf8'),
          url: url,
          size: file.size,
          mime_type: file.mimetype,
          file_extension: ext,
          user_id: userId // 使用相同的用户ID
        });

        attachments.push({
          id: attachment.id,
          url,
          filename: file.originalname,
          file_type: file.mimetype,
          file_size: file.size
        });
      } catch (dbError) {
        console.error('Database error for file', file.originalname, ':', dbError);
        // 继续处理其他文件，不中断整个上传过程
      }
    }

    if (attachments.length === 0) {
      return res.error('No files were uploaded successfully', 400);
    }

    res.success(attachments);
  } catch (error) {
    console.error('Upload error:', error);
    res.error(error.message, 500);
  }
});

module.exports = router;
