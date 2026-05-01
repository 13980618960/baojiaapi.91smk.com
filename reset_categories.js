const mysql = require('mysql2');
const config = require('./config');

const connection = mysql.createConnection({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name
});

connection.connect((err) => {
  if (err) {
    console.error('连接数据库失败:', err);
    return;
  }
  console.log('成功连接到数据库');
  
  // 开始修复分类表
  resetCategories();
});

async function resetCategories() {
  try {
    // 清空分类表并重置AUTO_INCREMENT
    await executeQuery('TRUNCATE TABLE categories');
    console.log('分类表已清空');
    
    // 重新插入分类数据
    console.log('开始重新插入分类数据...');
    
    // 一级分类
    const level1Ids = await insertLevel1Categories();
    console.log('一级分类已插入');
    
    // 二级分类 - 生活服务 (parent_id = 1)
    const level2LifeIds = await insertLevel2LifeServices();
    console.log('生活服务二级分类已插入');
    
    // 三级分类 - 家政服务 (parent_id = 16)
    await insertLevel3HousekeepingServices();
    console.log('家政服务三级分类已插入');
    
    // 三级分类 - 家电维修 (parent_id = 17)
    await insertLevel3ApplianceRepair();
    console.log('家电维修三级分类已插入');
    
    // 二级分类 - 商务服务 (parent_id = 2)
    const level2BusinessIds = await insertLevel2BusinessServices();
    console.log('商务服务二级分类已插入');
    
    // 验证修复结果
    const categories = await executeQuery('SELECT category_id, name, parent_id, level FROM categories ORDER BY category_id');
    console.log('\n修复后的分类ID情况：');
    categories.forEach(cat => {
      console.log(`ID: ${cat.category_id}, 名称: ${cat.name}, 父ID: ${cat.parent_id}, 层级: ${cat.level}`);
    });
    
    console.log('\n分类ID修复完成！');
    
  } catch (error) {
    console.error('修复分类ID时出错:', error);
  } finally {
    connection.end();
  }
}

function executeQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function insertLevel1Categories() {
  const sql = `
    INSERT INTO categories (parent_id, name, level, sort, is_show) VALUES
    (0, '生活服务', 1, 1, 1),
    (0, '商务服务', 1, 2, 1),
    (0, '教育培训', 1, 3, 1),
    (0, '医疗健康', 1, 4, 1),
    (0, '养老服务', 1, 5, 1),
    (0, '宠物服务', 1, 6, 1),
    (0, '企业服务', 1, 7, 1),
    (0, '公共服务', 1, 8, 1),
    (0, '金融服务', 1, 9, 1),
    (0, '物流运输', 1, 10, 1),
    (0, '工业制造', 1, 11, 1),
    (0, '环保能源', 1, 12, 1),
    (0, '航空航天', 1, 13, 1),
    (0, '人工智能', 1, 14, 1),
    (0, '文创服务', 1, 15, 1)
  `;
  const result = await executeQuery(sql);
  return result.insertId;
}

async function insertLevel2LifeServices() {
  const sql = `
    INSERT INTO categories (parent_id, name, level, sort, is_show) VALUES
    (1, '家政服务', 2, 1, 1),
    (1, '家电维修', 2, 2, 1),
    (1, '家居装修', 2, 3, 1),
    (1, '生活配送', 2, 4, 1),
    (1, '美容美发', 2, 5, 1),
    (1, '婚庆服务', 2, 6, 1),
    (1, '搬家服务', 2, 7, 1),
    (1, '洗衣洗鞋', 2, 8, 1),
    (1, '其他生活服务', 2, 9, 1)
  `;
  const result = await executeQuery(sql);
  return result.insertId;
}

async function insertLevel3HousekeepingServices() {
  const sql = `
    INSERT INTO categories (parent_id, name, level, sort, is_show) VALUES
    (16, '日常保洁', 3, 1, 1),
    (16, '深度保洁', 3, 2, 1),
    (16, '开荒保洁', 3, 3, 1),
    (16, '家电清洗', 3, 4, 1),
    (16, '保姆月嫂', 3, 5, 1),
    (16, '育儿嫂', 3, 6, 1),
    (16, '钟点工', 3, 7, 1),
    (16, '老人护理', 3, 8, 1),
    (16, '病人护理', 3, 9, 1),
    (16, '其他家政服务', 3, 10, 1)
  `;
  await executeQuery(sql);
}

async function insertLevel3ApplianceRepair() {
  const sql = `
    INSERT INTO categories (parent_id, name, level, sort, is_show) VALUES
    (17, '空调维修', 3, 1, 1),
    (17, '冰箱维修', 3, 2, 1),
    (17, '洗衣机维修', 3, 3, 1),
    (17, '电视维修', 3, 4, 1),
    (17, '热水器维修', 3, 5, 1),
    (17, '油烟机维修', 3, 6, 1),
    (17, '燃气灶维修', 3, 7, 1),
    (17, '其他家电维修', 3, 8, 1)
  `;
  await executeQuery(sql);
}

async function insertLevel2BusinessServices() {
  const sql = `
    INSERT INTO categories (parent_id, name, level, sort, is_show) VALUES
    (2, '企业管理', 2, 1, 1),
    (2, '法律服务', 2, 2, 1),
    (2, '财务服务', 2, 3, 1),
    (2, '人力资源', 2, 4, 1),
    (2, '市场营销', 2, 5, 1),
    (2, 'IT服务', 2, 6, 1),
    (2, '设计服务', 2, 7, 1),
    (2, '翻译服务', 2, 8, 1),
    (2, '其他商务服务', 2, 9, 1)
  `;
  const result = await executeQuery(sql);
  return result.insertId;
}
