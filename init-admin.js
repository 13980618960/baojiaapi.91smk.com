
const sequelize = require('./models/index');
const Admin = require('./models/Admin');

async function initAdmin() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const existingAdmin = await Admin.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('管理员账号已存在，跳过创建');
      console.log('账号信息:');
      console.log('  用户名: admin');
      console.log('  密码: admin123');
      process.exit(0);
    }

    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123',
      nickname: '系统管理员',
      role_id: 1,
      status: 1
    });

    console.log('管理员账号创建成功!');
    console.log('账号信息:');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    console.log('  昵称: 系统管理员');
    
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

initAdmin();

