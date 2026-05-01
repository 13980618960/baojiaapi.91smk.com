const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// 从环境变量加载配置
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'baojia'
});

connection.connect((err) => {
  if (err) {
    console.error('连接数据库失败:', err);
    return;
  }
  console.log('成功连接到数据库');
  
  // 读取并执行修复SQL脚本
  const sqlScript = fs.readFileSync(path.join(__dirname, 'sql', 'fix_categories.sql'), 'utf8');
  
  connection.query(sqlScript, (err, results) => {
    if (err) {
      console.error('执行SQL脚本失败:', err);
    } else {
      console.log('分类ID修复成功！');
    }
    connection.end();
  });
});
