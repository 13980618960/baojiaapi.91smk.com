const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// 加载环境变量
require('dotenv').config();

const config = require('./config');
const response = require('./middleware/response');
const { authMiddleware, adminAuthMiddleware } = require('./middleware/auth');

// 路由
const userRoutes = require('./routes/userRoutes');
const demandRoutes = require('./routes/demandRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const messageRoutes = require('./routes/messageRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const vipRoutes = require('./routes/vipRoutes');
const adRoutes = require('./routes/adRoutes');
const systemRoutes = require('./routes/systemRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const statsRoutes = require('./routes/statsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const personalizationRoutes = require('./routes/personalizationRoutes');
const pricingRoutes = require('./routes/pricingRoutes');

const app = express();

// 中间件
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['https://baojia.91smk.com', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 添加CORS头部
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 为了避免默认logo.png的404错误，添加assets目录的静态文件服务
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 响应封装
app.use(response);

// 公开路由
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/ads', adRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/personalization', adminAuthMiddleware, personalizationRoutes);
app.use('/api/v1/pricing', adminAuthMiddleware, pricingRoutes);
app.use('/api/v1/upload', uploadRoutes);

// 认证路由
app.use('/api/v1/demands', authMiddleware, demandRoutes);
app.use('/api/v1/quotes', authMiddleware, quoteRoutes);
app.use('/api/v1/messages', authMiddleware, messageRoutes);
app.use('/api/v1/vip', authMiddleware, vipRoutes);
app.use('/api/v1/stats', authMiddleware, statsRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.error(err.message || 'Internal Server Error', 500);
});

// 启动
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
