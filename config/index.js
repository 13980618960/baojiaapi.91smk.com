const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'baojia_ai',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'bao_jia_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXIRES_IN || '7d'
  },
  
  upload: {
    path: path.resolve(__dirname, '../uploads'),
    maxSize: process.env.MAX_FILE_SIZE || 52428800,
    allowedExt: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.xsl', '.xslt', '.zip']
  },
  
  wechat: {
    appid: process.env.WECHAT_APPID || '',
    appsecret: process.env.WECHAT_APPSECRET || ''
  }
};
