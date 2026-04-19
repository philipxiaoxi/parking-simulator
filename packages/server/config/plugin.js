'use strict';

exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};

exports.cors = {
  enable: true,
  package: 'egg-cors',
};

// 静态文件服务（内置插件，无需安装）
exports.static = true;
