const sequelize = require('./models/index');
const Category = require('./models/Category');

async function fixCategories() {
  try {
    console.log('开始修复分类ID...');
    
    // 清空分类表并重置AUTO_INCREMENT
    await Category.destroy({ truncate: true, cascade: true });
    console.log('分类表已清空');
    
    // 重新插入分类数据
    console.log('开始重新插入分类数据...');
    
    // 一级分类
    const level1Categories = await Category.bulkCreate([
      { parent_id: 0, name: '生活服务', level: 1, sort: 1, is_show: 1 },
      { parent_id: 0, name: '商务服务', level: 1, sort: 2, is_show: 1 },
      { parent_id: 0, name: '教育培训', level: 1, sort: 3, is_show: 1 },
      { parent_id: 0, name: '医疗健康', level: 1, sort: 4, is_show: 1 },
      { parent_id: 0, name: '养老服务', level: 1, sort: 5, is_show: 1 },
      { parent_id: 0, name: '宠物服务', level: 1, sort: 6, is_show: 1 },
      { parent_id: 0, name: '企业服务', level: 1, sort: 7, is_show: 1 },
      { parent_id: 0, name: '公共服务', level: 1, sort: 8, is_show: 1 },
      { parent_id: 0, name: '金融服务', level: 1, sort: 9, is_show: 1 },
      { parent_id: 0, name: '物流运输', level: 1, sort: 10, is_show: 1 },
      { parent_id: 0, name: '工业制造', level: 1, sort: 11, is_show: 1 },
      { parent_id: 0, name: '环保能源', level: 1, sort: 12, is_show: 1 },
      { parent_id: 0, name: '航空航天', level: 1, sort: 13, is_show: 1 },
      { parent_id: 0, name: '人工智能', level: 1, sort: 14, is_show: 1 },
      { parent_id: 0, name: '文创服务', level: 1, sort: 15, is_show: 1 }
    ]);
    console.log('一级分类已插入');
    
    // 二级分类 - 生活服务 (parent_id = 1)
    const level2LifeServices = await Category.bulkCreate([
      { parent_id: 1, name: '家政服务', level: 2, sort: 1, is_show: 1 },
      { parent_id: 1, name: '家电维修', level: 2, sort: 2, is_show: 1 },
      { parent_id: 1, name: '家居装修', level: 2, sort: 3, is_show: 1 },
      { parent_id: 1, name: '生活配送', level: 2, sort: 4, is_show: 1 },
      { parent_id: 1, name: '美容美发', level: 2, sort: 5, is_show: 1 },
      { parent_id: 1, name: '婚庆服务', level: 2, sort: 6, is_show: 1 },
      { parent_id: 1, name: '搬家服务', level: 2, sort: 7, is_show: 1 },
      { parent_id: 1, name: '洗衣洗鞋', level: 2, sort: 8, is_show: 1 },
      { parent_id: 1, name: '其他生活服务', level: 2, sort: 9, is_show: 1 }
    ]);
    console.log('生活服务二级分类已插入');
    
    // 三级分类 - 家政服务 (parent_id = 16)
    await Category.bulkCreate([
      { parent_id: 16, name: '日常保洁', level: 3, sort: 1, is_show: 1 },
      { parent_id: 16, name: '深度保洁', level: 3, sort: 2, is_show: 1 },
      { parent_id: 16, name: '开荒保洁', level: 3, sort: 3, is_show: 1 },
      { parent_id: 16, name: '家电清洗', level: 3, sort: 4, is_show: 1 },
      { parent_id: 16, name: '保姆月嫂', level: 3, sort: 5, is_show: 1 },
      { parent_id: 16, name: '育儿嫂', level: 3, sort: 6, is_show: 1 },
      { parent_id: 16, name: '钟点工', level: 3, sort: 7, is_show: 1 },
      { parent_id: 16, name: '老人护理', level: 3, sort: 8, is_show: 1 },
      { parent_id: 16, name: '病人护理', level: 3, sort: 9, is_show: 1 },
      { parent_id: 16, name: '其他家政服务', level: 3, sort: 10, is_show: 1 }
    ]);
    console.log('家政服务三级分类已插入');
    
    // 三级分类 - 家电维修 (parent_id = 17)
    await Category.bulkCreate([
      { parent_id: 17, name: '空调维修', level: 3, sort: 1, is_show: 1 },
      { parent_id: 17, name: '冰箱维修', level: 3, sort: 2, is_show: 1 },
      { parent_id: 17, name: '洗衣机维修', level: 3, sort: 3, is_show: 1 },
      { parent_id: 17, name: '电视维修', level: 3, sort: 4, is_show: 1 },
      { parent_id: 17, name: '热水器维修', level: 3, sort: 5, is_show: 1 },
      { parent_id: 17, name: '油烟机维修', level: 3, sort: 6, is_show: 1 },
      { parent_id: 17, name: '燃气灶维修', level: 3, sort: 7, is_show: 1 },
      { parent_id: 17, name: '其他家电维修', level: 3, sort: 8, is_show: 1 }
    ]);
    console.log('家电维修三级分类已插入');
    
    // 二级分类 - 商务服务 (parent_id = 2)
    const level2BusinessServices = await Category.bulkCreate([
      { parent_id: 2, name: '企业管理', level: 2, sort: 1, is_show: 1 },
      { parent_id: 2, name: '法律服务', level: 2, sort: 2, is_show: 1 },
      { parent_id: 2, name: '财务服务', level: 2, sort: 3, is_show: 1 },
      { parent_id: 2, name: '人力资源', level: 2, sort: 4, is_show: 1 },
      { parent_id: 2, name: '市场营销', level: 2, sort: 5, is_show: 1 },
      { parent_id: 2, name: 'IT服务', level: 2, sort: 6, is_show: 1 },
      { parent_id: 2, name: '设计服务', level: 2, sort: 7, is_show: 1 },
      { parent_id: 2, name: '翻译服务', level: 2, sort: 8, is_show: 1 },
      { parent_id: 2, name: '其他商务服务', level: 2, sort: 9, is_show: 1 }
    ]);
    console.log('商务服务二级分类已插入');
    
    // 验证修复结果
    const categories = await Category.findAll({ order: ['category_id'] });
    console.log('\n修复后的分类ID情况：');
    categories.forEach(cat => {
      console.log(`ID: ${cat.category_id}, 名称: ${cat.name}, 父ID: ${cat.parent_id}, 层级: ${cat.level}`);
    });
    
    console.log('\n分类ID修复完成！');
    
  } catch (error) {
    console.error('修复分类ID时出错:', error);
  } finally {
    await sequelize.close();
  }
}

fixCategories();
