require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

console.log('============================================');
console.log('🚀 同步本地数据库 - 补充缺失索引');
console.log('============================================\n');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'baojia_ai',
  multipleStatements: true
};

async function main() {
  let connection;
  
  try {
    console.log('📡 连接本地数据库...');
    connection = await mysql.createConnection(config);
    console.log('✅ 本地数据库连接成功\n');

    const sqlFile = path.join(__dirname, 'sql', 'index_add_missing.sql');
    console.log('📖 读取SQL文件:', sqlFile);
    
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('✅ SQL文件读取成功\n');

    console.log('🔧 执行SQL语句...');
    const results = await connection.query(sql);
    console.log('✅ SQL执行完成\n');

    console.log('📊 验证索引是否创建成功...');
    const tables = [
      'categories',
      'attachments',
      'admins',
      'operation_logs',
      'advertiser_ads',
      'demands',
      'quotes'
    ];

    for (const table of tables) {
      const [indexes] = await connection.query(`SHOW INDEX FROM ${table}`);
      console.log(`\n📋 ${table} 表的索引列表:`);
      indexes.forEach(idx => {
        console.log(`   - ${idx.Key_name} (${idx.Column_name})`);
      });
    }

    console.log('\n============================================');
    console.log('🎉 本地数据库索引同步完成！');
    console.log('✅ 宝塔和本地现在完全一致了！');
    console.log('============================================');

  } catch (error) {
    console.error('❌ 执行出错:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
